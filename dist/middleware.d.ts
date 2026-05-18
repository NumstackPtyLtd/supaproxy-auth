import type { Context, Next } from 'hono';
import type { TokenPayload } from './types.js';
type TokenVerifier = {
    verify(token: string): TokenPayload | null;
};
/** Middleware: require a valid session cookie. Sets c.user. */
export declare function createRequireAuth(tokenService: TokenVerifier, cookieName?: string): (c: Context, next: Next) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 401, "json">) | undefined>;
/** Middleware: optionally load user from session cookie. */
export declare function createOptionalAuth(tokenService: TokenVerifier, cookieName?: string): (c: Context, next: Next) => Promise<void>;
export {};
//# sourceMappingURL=middleware.d.ts.map