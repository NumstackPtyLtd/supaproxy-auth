import type { TokenPayload } from './types.js';
/** JWT token service. */
export declare function createTokenService(secret: string, expiry?: string): {
    sign(payload: TokenPayload): string;
    verify(token: string): TokenPayload | null;
};
//# sourceMappingURL=token.d.ts.map