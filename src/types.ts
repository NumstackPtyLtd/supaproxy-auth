/** Token payload: the claims stored in the JWT. */
export interface TokenPayload {
  id: string
  email: string
  name: string
  role: string
  org_id: string
}

/** Authenticated user context set on Hono request. */
export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  org_id: string
}

/** Options for creating the default auth provider. */
export interface BasicAuthOptions {
  jwtSecret: string
  jwtExpiry?: string
  cookieName?: string
  cookieDomain?: string
  isProduction?: boolean
  dashboardUrl?: string
}

/** Repository contract for user and org operations needed by auth. */
export interface AuthRepository {
  findUserByEmail(email: string): Promise<{
    id: string
    email: string
    name: string
    org_id: string | null
    password_hash: string
    org_role: string
  } | null>
  createOrg(id: string, name: string, slug: string): Promise<void>
  createUser(id: string, orgId: string, email: string, name: string, passwordHash: string, role: string): Promise<void>
  createTeam(id: string, orgId: string, name: string): Promise<void>
  createWorkspace(id: string, orgId: string, teamId: string, name: string, model: string, systemPrompt: string): Promise<void>
}
