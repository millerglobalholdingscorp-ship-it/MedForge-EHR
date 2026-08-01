import { Hono } from 'hono';
import sql from '../db';

export const facilitiesRouter = new Hono();

facilitiesRouter.get('/', async (c) => {
  try { return c.json({ facilities: await sql`SELECT id, name, slug, created_at, updated_at FROM facilities ORDER BY name` }); }
  catch (err) { console.error('GET facilities:', err); return c.json({ error: 'Failed to fetch facilities' }, 500); }
});

facilitiesRouter.post('/', async (c) => {
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';
  if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return c.json({ error: 'name and a valid slug are required' }, 400);
  try { const rows = await sql`INSERT INTO facilities (name, slug) VALUES (${name}, ${slug}) RETURNING *`; return c.json({ facility: rows[0] }, 201); }
  catch (err) { console.error('POST facilities:', err); return c.json({ error: 'Failed to create facility' }, 500); }
});

facilitiesRouter.put('/:id', async (c) => {
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';
  if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return c.json({ error: 'name and a valid slug are required' }, 400);
  try { const rows = await sql`UPDATE facilities SET name=${name}, slug=${slug}, updated_at=NOW() WHERE id=${c.req.param('id')} RETURNING *`; return rows.length ? c.json({ facility: rows[0] }) : c.json({ error: 'Facility not found' }, 404); }
  catch (err) { console.error('PUT facilities:', err); return c.json({ error: 'Failed to update facility' }, 500); }
});

facilitiesRouter.delete('/:id', async (c) => {
  try { const rows = await sql`DELETE FROM facilities WHERE id=${c.req.param('id')} AND slug <> 'default' RETURNING id`; return rows.length ? c.json({ success: true }) : c.json({ error: 'Facility not found or cannot delete default' }, 404); }
  catch (err) { console.error('DELETE facilities:', err); return c.json({ error: 'Failed to delete facility' }, 500); }
});
