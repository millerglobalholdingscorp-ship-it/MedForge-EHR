import { Hono } from 'hono';
import sql from '../db';
import { logAudit } from '../db/audit';
import { findPatientByEmail } from '../db/patient-lookup';
import '../env.js';

export const appointmentsRouter = new Hono();
export const appointmentsPortalRouter = new Hono();
const fields = `a.id, a.patient_id, a.provider_id, a.scheduled_at, a.duration_minutes,
  a.status, a.reason, a.notes, a.created_at, a.updated_at,
  p.first_name, p.last_name, p.medical_record_number`;
const statuses = ['scheduled', 'completed', 'cancelled'];

function validDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
}

// Provider list, optionally constrained to a calendar date (YYYY-MM-DD).
appointmentsRouter.get('/', async (c) => {
  const providerId = c.get('providerId') as string;
  const date = c.req.query('date');
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return c.json({ error: 'date must be YYYY-MM-DD' }, 400);
  try {
    const rows = date
      ? await sql`SELECT ${sql.unsafe(fields)} FROM appointments a JOIN patients p ON p.id = a.patient_id WHERE a.provider_id = ${providerId} AND a.scheduled_at >= ${date}::date AND a.scheduled_at < (${date}::date + INTERVAL '1 day') ORDER BY a.scheduled_at`
      : await sql`SELECT ${sql.unsafe(fields)} FROM appointments a JOIN patients p ON p.id = a.patient_id WHERE a.provider_id = ${providerId} ORDER BY a.scheduled_at`;
    await logAudit(providerId, 'appointment.list', undefined, { date: date ?? null });
    return c.json({ appointments: rows, total: rows.length });
  } catch (err) { console.error('GET appointments:', err); return c.json({ error: 'Failed to fetch appointments' }, 500); }
});

appointmentsRouter.post('/', async (c) => {
  const providerId = c.get('providerId') as string;
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const patientId = typeof body.patient_id === 'string' ? body.patient_id : '';
  if (!patientId || !validDate(body.scheduled_at)) return c.json({ error: 'patient_id and a valid scheduled_at are required' }, 400);
  const duration = body.duration_minutes === undefined ? 30 : Number(body.duration_minutes);
  if (!Number.isInteger(duration) || duration < 5 || duration > 480) return c.json({ error: 'duration_minutes must be an integer from 5 to 480' }, 400);
  const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 2000) || null : null;
  try {
    const patient = await sql`SELECT id FROM patients WHERE id = ${patientId}`;
    if (!patient.length) return c.json({ error: 'Patient not found' }, 404);
    const rows = await sql`INSERT INTO appointments (patient_id, provider_id, scheduled_at, duration_minutes, reason) VALUES (${patientId}, ${providerId}, ${body.scheduled_at}, ${duration}, ${reason}) RETURNING *`;
    await logAudit(providerId, 'appointment.created', patientId, { appointment_id: rows[0].id });
    return c.json({ appointment: rows[0] }, 201);
  } catch (err) { console.error('POST appointments:', err); return c.json({ error: 'Failed to create appointment' }, 500); }
});

appointmentsRouter.put('/:id', async (c) => {
  const providerId = c.get('providerId') as string;
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const status = body.status === undefined ? undefined : String(body.status);
  if (status && !statuses.includes(status)) return c.json({ error: 'status must be scheduled, completed, or cancelled' }, 400);
  const notes = body.notes === undefined ? undefined : (typeof body.notes === 'string' ? body.notes.trim().slice(0, 5000) : null);
  if (status === undefined && notes === undefined) return c.json({ error: 'status or notes is required' }, 400);
  try {
    const rows = await sql`UPDATE appointments SET status = COALESCE(${status ?? null}, status), notes = COALESCE(${notes ?? null}, notes), updated_at = NOW() WHERE id = ${c.req.param('id')} AND provider_id = ${providerId} RETURNING *`;
    if (!rows.length) return c.json({ error: 'Appointment not found' }, 404);
    await logAudit(providerId, status === 'cancelled' ? 'appointment.cancelled' : 'appointment.updated', rows[0].patient_id, { appointment_id: rows[0].id, status: status ?? null });
    return c.json({ appointment: rows[0] });
  } catch (err) { console.error('PUT appointments:', err); return c.json({ error: 'Failed to update appointment' }, 500); }
});

// Patient self-service: lookup by verified email, never accept a patient_id from the client.
appointmentsPortalRouter.get('/me/appointments', async (c) => {
  const email = c.get('userEmail') as string;
  try {
    const patient = await findPatientByEmail(email);
    if (!patient) return c.json({ error: 'No patient record found for this account' }, 404);
    const rows = await sql`SELECT ${sql.unsafe(fields)} FROM appointments a JOIN patients p ON p.id = a.patient_id WHERE a.patient_id = ${patient.id} ORDER BY a.scheduled_at`;
    return c.json({ appointments: rows, total: rows.length });
  } catch (err) { console.error('GET portal appointments:', err); return c.json({ error: 'Failed to fetch appointments' }, 500); }
});

appointmentsPortalRouter.post('/me/appointments', async (c) => {
  const email = c.get('userEmail') as string;
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!validDate(body.scheduled_at)) return c.json({ error: 'A valid scheduled_at is required' }, 400);
  const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 2000) || null : null;
  try {
    const patient = await findPatientByEmail(email);
    if (!patient) return c.json({ error: 'No patient record found for this account' }, 404);
    const providerId = typeof body.provider_id === 'string' && body.provider_id.trim() ? body.provider_id.trim() : 'portal-unassigned';
    const rows = await sql`INSERT INTO appointments (patient_id, provider_id, scheduled_at, reason) VALUES (${patient.id}, ${providerId}, ${body.scheduled_at}, ${reason}) RETURNING *`;
    await logAudit(providerId, 'appointment.booked', patient.id, { appointment_id: rows[0].id, source: 'patient_portal' });
    return c.json({ appointment: rows[0] }, 201);
  } catch (err) { console.error('POST portal appointments:', err); return c.json({ error: 'Failed to book appointment' }, 500); }
});
