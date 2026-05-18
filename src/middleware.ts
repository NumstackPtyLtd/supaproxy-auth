import { getCookie } from 'hono/cookie'
import type { Context, Next } from 'hono'
import type { TokenPayload, AuthUser } from './types.js'

type TokenVerifier = { verify(token: string): TokenPayload | null }

/** Middleware: require a valid session cookie. Sets c.user. */
export function createRequireAuth(tokenService: TokenVerifier, cookieName = 'supaproxy_session') {
  return async function requireAuth(c: Context, next: Next) {
    const token = getCookie(c, cookieName)
    if (!token) return c.json({ error: 'not_authenticated' }, 401)

    const payload = tokenService.verify(token)
    if (!payload) return c.json({ error: 'invalid_session' }, 401)

    c.set('user', payload as AuthUser)
    await next()
  }
}

/** Middleware: optionally load user from session cookie. */
export function createOptionalAuth(tokenService: TokenVerifier, cookieName = 'supaproxy_session') {
  return async function optionalAuth(c: Context, next: Next) {
    const token = getCookie(c, cookieName)
    if (token) {
      const payload = tokenService.verify(token)
      c.set('user', payload as AuthUser | null)
    } else {
      c.set('user', null)
    }
    await next()
  }
}
