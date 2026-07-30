/**
 * Side-effect import that augments Hono's ContextVariableMap with
 * custom variables used by the application.
 */
import type {} from 'hono';

declare module 'hono' {
  interface ContextVariableMap {
    /** Clerk user ID extracted from the verified auth token */
    providerId: string;
    /** Full Clerk session claims */
    clerkAuth: unknown;
  }
}
