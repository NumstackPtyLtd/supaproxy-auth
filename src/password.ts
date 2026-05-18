import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

/** Bcrypt password hashing. */
export const passwordService = {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
  },
  async verify(password: string, storedHash: string): Promise<boolean> {
    return bcrypt.compare(password, storedHash)
  },
}
