import { verifyToken } from '@clerk/backend';
import type { Context, Next } from 'hono';
import sql from '../db';
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
export async function auth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return c.json({ error: 'Unauthorized — missing or invalid Authorization header' }, 401);
  try {
    const payload = await verifyToken(authHeader.slice(7), { secretKey: CLERK_SECRET_KEY });
    if (!payload) return c.json({ error: 'Unauthorized — invalid token' }, 401);
    c.set('clerkAuth', payload);
    const providerId = (payload as { sub?: string }).sub;
    if (providerId) c.set('providerId', providerId);
    const slug = (c.req.header('x-facility-slug') || 'default').trim().toLowerCase();
    const facilities = await sql`SELECT id FROM facilities WHERE slug = ${slug}`;
    if (!facilities.length) return c.json({ error: 'Facility not found' }, 404);
    c.set('facilityId', facilities[0].id as string);
    await next();
  } catch (err) {
    console.error('Auth error:', err);
    return c.json({ error: 'Unauthorized — token verification failed' }, 401);
  }
}
