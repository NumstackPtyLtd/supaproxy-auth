# @supaproxy/auth

Central governance hub: [supaproxy](https://github.com/NumstackPtyLtd/supaproxy)

Default authentication package for SupaProxy: JWT tokens, bcrypt password hashing, login/signup routes, and session middleware.

## Structure

```
src/
  index.ts       Public exports
  types.ts       TokenPayload, AuthUser, BasicAuthOptions, AuthRepository
  password.ts    Bcrypt password hashing
  token.ts       JWT token service
  middleware.ts  Hono auth middleware (requireAuth, optionalAuth)
  routes.ts      Login, signup, session, logout routes
```

## Usage

```typescript
import { createAuthRoutes } from '@supaproxy/auth'

const { routes, tokenService, requireAuth } = createAuthRoutes({
  repo: authRepo,           // implements AuthRepository
  options: { jwtSecret: process.env.JWT_SECRET! },
  generateId: () => crypto.randomUUID(),
  generateWorkspaceId: () => `ws-${crypto.randomUUID().slice(0, 24)}`,
})
```

## Rules

- All changes go through PRs. Never push directly to main.
- British English throughout.
- No em dashes. Use commas, colons, or full stops.
