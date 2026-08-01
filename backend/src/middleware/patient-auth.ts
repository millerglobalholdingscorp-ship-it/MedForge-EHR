import { verifyToken } from '@clerk/backend';
import type { Context, Next } from 'hono';
import '../env.js';

/** Auth middleware for patient self-service endpoints. */
export async function patientAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized — missing or invalid Authorization header' }, 401);
  }

  try {
    const payload = await verifyToken(authHeader.slice(7), {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const claims = payload as { sub?: string; email?: string };
    if (!claims.sub || !claims.email) {
      return c.json({ error: 'Unauthorized — email not found in token' }, 401);
    }
    c.set('providerId', claims.sub);
    c.set('userEmail', claims.email);
    c.set('clerkAuth', payload);
    await next();
  } catch {
    return c.json({ error: 'Unauthorized — token verification failed' }, 401);
  }
}
