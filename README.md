# @supaproxy/auth

Default authentication package for [SupaProxy](https://github.com/NumstackPtyLtd/supaproxy). Provides JWT tokens, bcrypt password hashing, login/signup routes, and Hono session middleware.

## Installation

```bash
pnpm add @supaproxy/auth
```

Requires `hono` as a peer dependency (>=4.0.0).

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

### Middleware

```typescript
import { createRequireAuth, createOptionalAuth } from '@supaproxy/auth'

// Protect routes: rejects unauthenticated requests
const requireAuth = createRequireAuth(tokenService)

// Allow anonymous access: sets user context when a token is present
const optionalAuth = createOptionalAuth(tokenService)
```

### Password hashing

```typescript
import { passwordService } from '@supaproxy/auth'

const hash = await passwordService.hash('plaintext')
const valid = await passwordService.verify('plaintext', hash)
```

### Token service

```typescript
import { createTokenService } from '@supaproxy/auth'

const tokenService = createTokenService({ jwtSecret: 'secret', jwtExpiry: '7d' })
const token = tokenService.sign({ id, email, name, role, org_id })
const payload = tokenService.verify(token)
```

## What this package contains

| File | Contents |
|---|---|
| `src/index.ts` | Public exports |
| `src/types.ts` | `TokenPayload`, `AuthUser`, `BasicAuthOptions`, `AuthRepository` |
| `src/password.ts` | Bcrypt password hashing |
| `src/token.ts` | JWT token service (sign, verify) |
| `src/middleware.ts` | Hono auth middleware (`requireAuth`, `optionalAuth`) |
| `src/routes.ts` | Login, signup, session, logout routes |

## Key types

| Type | Purpose |
|---|---|
| `TokenPayload` | Claims stored in the JWT (id, email, name, role, org_id) |
| `AuthUser` | Authenticated user context set on the Hono request |
| `BasicAuthOptions` | Configuration for JWT secret, expiry, cookie settings |
| `AuthRepository` | Repository contract for user and org operations needed by auth |

## Dev

```bash
pnpm install
pnpm lint      # Type-check
pnpm build     # Compile to dist/
pnpm test      # Run tests
pnpm test:watch # Run tests in watch mode
```
