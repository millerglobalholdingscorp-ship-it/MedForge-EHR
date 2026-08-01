import { Hono } from 'hono';
import sql from '../db';
import { findPatientByEmail } from '../db/patient-lookup';
import '../env.js';

export const patientPortalRouter = new Hono();

patientPortalRouter.get('/me', async (c) => {
  const email = c.get('userEmail') as string;
  try {
    const patient = await findPatientByEmail(email);
    if (!patient) return c.json({ error: 'No patient record found for this account' }, 404);
    return c.json({ patient });
  } catch (error) {
    console.error('GET /api/portal/me error:', error);
    return c.json({ error: 'Failed to fetch patient record' }, 500);
  }
});

patientPortalRouter.get('/me/notes', async (c) => {
  const email = c.get('userEmail') as string;
  try {
    const patient = await findPatientByEmail(email);
    if (!patient) return c.json({ error: 'No patient record found for this account' }, 404);
    const notes = await sql`
      SELECT id, patient_id, provider_id, subjective, objective, assessment, plan,
             created_at, updated_at
      FROM clinical_notes WHERE patient_id = ${patient.id} ORDER BY created_at DESC
    `;
    return c.json({ notes, total: notes.length });
  } catch (error) {
    console.error('GET /api/portal/me/notes error:', error);
    return c.json({ error: 'Failed to fetch clinical notes' }, 500);
  }
});
