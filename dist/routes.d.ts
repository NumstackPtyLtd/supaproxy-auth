import { Hono } from 'hono';
import type { TokenPayload, BasicAuthOptions, AuthRepository } from './types.js';
/** Errors thrown by auth use cases. */
export declare class AuthConflictError extends Error {
    constructor(msg: string);
}
export declare class AuthenticationError extends Error {
    constructor(msg: string);
}
interface AuthRoutesDeps {
    repo: AuthRepository;
    options: BasicAuthOptions;
    generateId: () => string;
    generateWorkspaceId: () => string;
    defaultModel?: string;
    defaultSystemPrompt?: string;
}
export declare function createAuthRoutes(deps: AuthRoutesDeps): {
    routes: Hono<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/">;
    tokenService: {
        sign(payload: TokenPayload): string;
        verify(token: string): TokenPayload | null;
    };
    requireAuth: (c: any, next: any) => Promise<any>;
};
export {};
//# sourceMappingURL=routes.d.ts.map