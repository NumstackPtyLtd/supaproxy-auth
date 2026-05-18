import jwt from 'jsonwebtoken';
/** JWT token service. */
export function createTokenService(secret, expiry = '24h') {
    return {
        sign(payload) {
            return jwt.sign({ ...payload }, secret, { expiresIn: expiry });
        },
        verify(token) {
            try {
                return jwt.verify(token, secret);
            }
            catch {
                return null;
            }
        },
    };
}
//# sourceMappingURL=token.js.map