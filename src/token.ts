import jwt from 'jsonwebtoken'
import type { TokenPayload } from './types.js'

/** JWT token service. */
export function createTokenService(secret: string, expiry: string = '24h') {
  return {
    sign(payload: TokenPayload): string {
      return jwt.sign({ ...payload } as object, secret, { expiresIn: expiry as jwt.SignOptions['expiresIn'] })
    },
    verify(token: string): TokenPayload | null {
      try {
        return jwt.verify(token, secret) as TokenPayload
      } catch {
        return null
      }
    },
  }
}
