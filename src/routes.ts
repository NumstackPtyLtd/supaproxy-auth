import { Hono } from 'hono'
import { setCookie, getCookie } from 'hono/cookie'
import pino from 'pino'
import type { TokenPayload, BasicAuthOptions, AuthRepository } from './types.js'
import { passwordService } from './password.js'
import { createTokenService } from './token.js'

const log = pino({ name: 'auth' })

const SESSION_COOKIE_MAX_AGE = 86400

/** Errors thrown by auth use cases. */
export class AuthConflictError extends Error { constructor(msg: string) { super(msg); this.name = 'AuthConflictError' } }
export class AuthenticationError extends Error { constructor(msg: string) { super(msg); this.name = 'AuthenticationError' } }

interface AuthRoutesDeps {
  repo: AuthRepository
  options: BasicAuthOptions
  generateId: () => string
  generateWorkspaceId: () => string
  defaultModel?: string
  defaultSystemPrompt?: string
}

export function createAuthRoutes(deps: AuthRoutesDeps) {
  const tokenService = createTokenService(deps.options.jwtSecret, deps.options.jwtExpiry)
  const cookieName = deps.options.cookieName || 'supaproxy_session'
  const isProduction = deps.options.isProduction ?? false
  const cookieDomain = deps.options.cookieDomain
  const dashboardUrl = deps.options.dashboardUrl || ''
  const defaultModel = deps.defaultModel || ''
  const defaultSystemPrompt = deps.defaultSystemPrompt || 'You are a helpful assistant.'

  const auth = new Hono()

  auth.post('/api/signup', async (c) => {
    const body = await c.req.json().catch(() => null)
    if (!body?.admin_email || !body?.admin_password || !body?.org_name || !body?.admin_name) {
      return c.json({ error: 'validation_failed' }, 400)
    }

    const { org_name, admin_name, admin_email, admin_password } = body

    const existing = await deps.repo.findUserByEmail(admin_email)
    if (existing) return c.json({ error: 'email_taken' }, 400)

    const orgId = deps.generateId()
    const userId = deps.generateId()
    const teamId = deps.generateId()
    const workspaceId = deps.generateWorkspaceId()

    const passwordHash = await passwordService.hash(admin_password)

    const slug = org_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    await deps.repo.createOrg(orgId, org_name, slug)
    await deps.repo.createUser(userId, orgId, admin_email, admin_name, passwordHash, 'admin')
    await deps.repo.createTeam(teamId, orgId, `${org_name} Team`)
    await deps.repo.createWorkspace(workspaceId, orgId, teamId, '#general', defaultModel, defaultSystemPrompt)

    const token = tokenService.sign({ id: userId, email: admin_email, name: admin_name, role: 'admin', org_id: orgId })

    setCookie(c, cookieName, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'Lax',
      path: '/',
      maxAge: SESSION_COOKIE_MAX_AGE,
      ...(cookieDomain && { domain: cookieDomain }),
    })

    log.info({ org: org_name, admin: admin_email, workspace: workspaceId }, 'Setup complete')
    return c.json({ status: 'ok', org_id: orgId, user_id: userId, workspace_id: workspaceId })
  })

  auth.post('/api/auth/login', async (c) => {
    const contentType = c.req.header('content-type') || ''
    const isFormSubmit = contentType.includes('form')

    let email: string
    let password: string

    if (isFormSubmit) {
      const body = await c.req.parseBody()
      email = body.email as string
      password = body.password as string
    } else {
      const body = await c.req.json().catch(() => null)
      email = body?.email
      password = body?.password
    }

    if (!email || !password) {
      if (isFormSubmit) return c.redirect(`${dashboardUrl}/login?error=missing_fields`)
      return c.json({ error: 'missing_fields' }, 400)
    }

    const user = await deps.repo.findUserByEmail(email)
    if (!user) {
      if (isFormSubmit) return c.redirect(`${dashboardUrl}/login?error=invalid_credentials`)
      return c.json({ error: 'invalid_credentials' }, 401)
    }

    const valid = await passwordService.verify(password, user.password_hash)
    if (!valid) {
      if (isFormSubmit) return c.redirect(`${dashboardUrl}/login?error=invalid_credentials`)
      return c.json({ error: 'invalid_credentials' }, 401)
    }

    const token = tokenService.sign({ id: user.id, email: user.email, name: user.name, role: user.org_role, org_id: user.org_id || '' })

    setCookie(c, cookieName, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'Lax',
      path: '/',
      maxAge: SESSION_COOKIE_MAX_AGE,
      ...(cookieDomain && { domain: cookieDomain }),
    })

    if (isFormSubmit) return c.redirect(`${dashboardUrl}/workspaces`)
    return c.json({ status: 'ok', user: { id: user.id, email: user.email, name: user.name, role: user.org_role } })
  })

  auth.get('/api/auth/session', (c) => {
    const token = getCookie(c, cookieName)
    if (!token) return c.json({ user: null })

    const payload = tokenService.verify(token)
    if (!payload) return c.json({ user: null })

    return c.json({ user: { id: payload.id, email: payload.email, name: payload.name, role: payload.role } })
  })

  auth.get('/api/auth/logout', (c) => {
    setCookie(c, cookieName, '', { path: '/', maxAge: 0, ...(cookieDomain && { domain: cookieDomain }) })
    return c.redirect(`${dashboardUrl}/login`)
  })

  return { routes: auth, tokenService, requireAuth: createRequireAuthFromToken(tokenService, cookieName) }
}

function createRequireAuthFromToken(tokenService: ReturnType<typeof createTokenService>, cookieName: string) {
  return async function requireAuth(c: any, next: any) {
    const token = getCookie(c, cookieName)
    if (!token) return c.json({ error: 'not_authenticated' }, 401)
    const payload = tokenService.verify(token)
    if (!payload) return c.json({ error: 'invalid_session' }, 401)
    c.set('user', payload)
    await next()
  }
}
