import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;
/** Bcrypt password hashing. */
export const passwordService = {
    async hash(password) {
        return bcrypt.hash(password, SALT_ROUNDS);
    },
    async verify(password, storedHash) {
        return bcrypt.compare(password, storedHash);
    },
};
//# sourceMappingURL=password.js.map