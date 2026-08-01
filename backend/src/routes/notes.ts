import { Hono } from 'hono';
import sql from '../db';
import { logAudit } from '../db/audit';
import '../env.js';

export const notesRouter = new Hono();

interface NoteBody {
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
}

function validateNoteBody(body: Record<string, unknown>): string | null {
  const subjective = typeof body.subjective === 'string' ? body.subjective.trim() : '';
  const objective = typeof body.objective === 'string' ? body.objective.trim() : '';
  const assessment = typeof body.assessment === 'string' ? body.assessment.trim() : '';
  const plan = typeof body.plan === 'string' ? body.plan.trim() : '';

  if (!subjective && !objective && !assessment && !plan) {
    return 'At least one SOAP field (subjective, objective, assessment, plan) must be non-empty';
  }
  return null;
}

function sanitizeNoteBody(body: Record<string, unknown>): NoteBody {
  return {
    subjective: typeof body.subjective === 'string' ? body.subjective.trim() || null : null,
    objective: typeof body.objective === 'string' ? body.objective.trim() || null : null,
    assessment: typeof body.assessment === 'string' ? body.assessment.trim() || null : null,
    plan: typeof body.plan === 'string' ? body.plan.trim() || null : null,
  };
}

// GET /api/patients/:id/notes — list all notes for a patient (most recent first)
notesRouter.get('/api/patients/:id/notes', async (c) => {
  const patientId = c.req.param('id');
  const providerId = c.get('providerId') as string | undefined;

  try {
    const notes = await sql`
      SELECT id, patient_id, provider_id, subjective, objective, assessment, plan,
             created_at, updated_at
      FROM clinical_notes
      WHERE patient_id = ${patientId} AND facility_id = ${c.get('facilityId') as string}
      ORDER BY created_at DESC
    `;

    if (providerId) {
      await logAudit(providerId, 'note.list', patientId);
    }

    return c.json({ notes, total: notes.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('GET /api/patients/:id/notes error:', message);
    return c.json({ error: 'Failed to fetch notes' }, 500);
  }
});

// POST /api/patients/:id/notes — create a new note
notesRouter.post('/api/patients/:id/notes', async (c) => {
  const patientId = c.req.param('id');
  const providerId = c.get('providerId') as string | undefined;

  if (!providerId) {
    return c.json({ error: 'Unauthorized — provider ID not found' }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const validationError = validateNoteBody(body);
  if (validationError) {
    return c.json({ error: 'Validation failed', details: [validationError] }, 400);
  }

  const note = sanitizeNoteBody(body);

  try {
    // Verify the patient exists
    const patientCheck = await sql`
      SELECT id FROM patients WHERE id = ${patientId} AND facility_id = ${c.get('facilityId') as string}
    `;
    if (patientCheck.length === 0) {
      return c.json({ error: 'Patient not found' }, 404);
    }

    const rows = await sql`
      INSERT INTO clinical_notes (patient_id, provider_id, facility_id, subjective, objective, assessment, plan)
      VALUES (
        ${patientId},
        ${providerId},
        ${c.get('facilityId') as string},
        ${note.subjective ?? null},
        ${note.objective ?? null},
        ${note.assessment ?? null},
        ${note.plan ?? null}
      )
      RETURNING id, patient_id, provider_id, subjective, objective, assessment, plan,
                created_at, updated_at
    `;

    await logAudit(providerId, 'note.created', patientId, {
      note_id: rows[0].id,
    });

    return c.json({ note: rows[0] }, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('POST /api/patients/:id/notes error:', message);
    return c.json({ error: 'Failed to create note' }, 500);
  }
});

// GET /api/notes/:id — get a single note
notesRouter.get('/api/notes/:id', async (c) => {
  const noteId = c.req.param('id');
  const providerId = c.get('providerId') as string | undefined;

  try {
    const rows = await sql`
      SELECT id, patient_id, provider_id, subjective, objective, assessment, plan,
             created_at, updated_at
      FROM clinical_notes
      WHERE id = ${noteId} AND facility_id = ${c.get('facilityId') as string}
    `;

    if (rows.length === 0) {
      return c.json({ error: 'Note not found' }, 404);
    }

    if (providerId) {
      await logAudit(providerId, 'note.read', rows[0].patient_id, {
        note_id: rows[0].id,
      });
    }

    return c.json({ note: rows[0] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('GET /api/notes/:id error:', message);
    return c.json({ error: 'Failed to fetch note' }, 500);
  }
});

// PUT /api/notes/:id — update a note
notesRouter.put('/api/notes/:id', async (c) => {
  const noteId = c.req.param('id');
  const providerId = c.get('providerId') as string | undefined;

  if (!providerId) {
    return c.json({ error: 'Unauthorized — provider ID not found' }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const validationError = validateNoteBody(body);
  if (validationError) {
    return c.json({ error: 'Validation failed', details: [validationError] }, 400);
  }

  const note = sanitizeNoteBody(body);

  try {
    const rows = await sql`
      UPDATE clinical_notes SET
        subjective = ${note.subjective ?? null},
        objective = ${note.objective ?? null},
        assessment = ${note.assessment ?? null},
        plan = ${note.plan ?? null},
        updated_at = NOW()
      WHERE id = ${noteId} AND facility_id = ${c.get('facilityId') as string}
      RETURNING id, patient_id, provider_id, subjective, objective, assessment, plan,
                created_at, updated_at
    `;

    if (rows.length === 0) {
      return c.json({ error: 'Note not found' }, 404);
    }

    await logAudit(providerId, 'note.updated', rows[0].patient_id, {
      note_id: rows[0].id,
    });

    return c.json({ note: rows[0] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('PUT /api/notes/:id error:', message);
    return c.json({ error: 'Failed to update note' }, 500);
  }
});
