import { getCookie } from 'hono/cookie';
/** Middleware: require a valid session cookie. Sets c.user. */
export function createRequireAuth(tokenService, cookieName = 'supaproxy_session') {
    return async function requireAuth(c, next) {
        const token = getCookie(c, cookieName);
        if (!token)
            return c.json({ error: 'not_authenticated' }, 401);
        const payload = tokenService.verify(token);
        if (!payload)
            return c.json({ error: 'invalid_session' }, 401);
        c.set('user', payload);
        await next();
    };
}
/** Middleware: optionally load user from session cookie. */
export function createOptionalAuth(tokenService, cookieName = 'supaproxy_session') {
    return async function optionalAuth(c, next) {
        const token = getCookie(c, cookieName);
        if (token) {
            const payload = tokenService.verify(token);
            c.set('user', payload);
        }
        else {
            c.set('user', null);
        }
        await next();
    };
}
//# sourceMappingURL=middleware.js.map