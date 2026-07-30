import { verifyToken } from '@clerk/backend';
import type { Context, Next } from 'hono';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

export async function auth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized — missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token, {
      secretKey: CLERK_SECRET_KEY,
    });

    if (!payload) {
      return c.json({ error: 'Unauthorized — invalid token' }, 401);
    }

    // Store the verified session claims on the context for downstream handlers
    c.set('clerkAuth', payload);

    // Extract the Clerk user ID (sub) for audit logging
    const providerId = (payload as { sub?: string }).sub;
    if (providerId) {
      c.set('providerId', providerId);
    }
  } catch {
    return c.json({ error: 'Unauthorized — token verification failed' }, 401);
  }

  await next();
}
