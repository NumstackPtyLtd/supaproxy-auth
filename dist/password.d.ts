/** Bcrypt password hashing. */
export declare const passwordService: {
    hash(password: string): Promise<string>;
    verify(password: string, storedHash: string): Promise<boolean>;
};
//# sourceMappingURL=password.d.ts.map