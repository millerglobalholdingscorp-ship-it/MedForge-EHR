import { Hono } from 'hono';
import sql from '../db';
import { logAudit } from '../db/audit';
import '../env.js';

export const patientsRouter = new Hono();

/**
 * Generate a medical record number: "MRN-" + 6 random digits
 */
function generateMRN(): string {
  const digits = String(Math.floor(100000 + Math.random() * 900000));
  return `MRN-${digits}`;
}

function validatePatientBody(body: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (!body.first_name || typeof body.first_name !== 'string' || body.first_name.trim() === '') {
    errors.push('first_name is required');
  }
  if (!body.last_name || typeof body.last_name !== 'string' || body.last_name.trim() === '') {
    errors.push('last_name is required');
  }
  if (!body.date_of_birth || typeof body.date_of_birth !== 'string') {
    errors.push('date_of_birth is required (YYYY-MM-DD)');
  } else {
    // Validate date format
    const d = new Date(body.date_of_birth as string);
    if (isNaN(d.getTime())) {
      errors.push('date_of_birth must be a valid date (YYYY-MM-DD)');
    }
  }
  return errors;
}

// GET /api/patients — list all patients
patientsRouter.get('/', async (c) => {
  try {
    const patients = await sql`
      SELECT id, medical_record_number, first_name, last_name, date_of_birth,
             email, phone, address_line1, address_line2, city, state, zip_code,
             created_at, updated_at
      FROM patients
      WHERE facility_id = ${c.get('facilityId') as string}
      ORDER BY created_at DESC
    `;

    // Audit: list all patients
    const providerId = c.get('providerId') as string | undefined;
    if (providerId) {
      await logAudit(providerId, 'patient.list');
    }

    return c.json({ patients, total: patients.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('GET /api/patients error:', message);
    return c.json({ error: 'Failed to fetch patients' }, 500);
  }
});

// GET /api/patients/:id — get patient by UUID
patientsRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const rows = await sql`
      SELECT id, medical_record_number, first_name, last_name, date_of_birth,
             email, phone, address_line1, address_line2, city, state, zip_code,
             created_at, updated_at
      FROM patients
      WHERE id = ${id} AND facility_id = ${c.get('facilityId') as string}
    `;
    if (rows.length === 0) {
      return c.json({ error: 'Patient not found' }, 404);
    }

    // Audit: read a specific patient
    const providerId = c.get('providerId') as string | undefined;
    if (providerId) {
      await logAudit(providerId, 'patient.read', rows[0].id);
    }

    return c.json({ patient: rows[0] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('GET /api/patients/:id error:', message);
    return c.json({ error: 'Failed to fetch patient' }, 500);
  }
});

// POST /api/patients — create a new patient
patientsRouter.post('/', async (c) => {
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const errors = validatePatientBody(body);
  if (errors.length > 0) {
    return c.json({ error: 'Validation failed', details: errors }, 400);
  }

  const mrn = generateMRN();

  try {
    const rows = await sql`
      INSERT INTO patients (
        medical_record_number, first_name, last_name, date_of_birth,
        email, phone, address_line1, address_line2, city, state, zip_code, facility_id
      ) VALUES (
        ${mrn},
        ${(body.first_name as string).trim()},
        ${(body.last_name as string).trim()},
        ${body.date_of_birth as string},
        ${(body.email as string)?.trim() || null},
        ${(body.phone as string)?.trim() || null},
        ${(body.address_line1 as string)?.trim() || null},
        ${(body.address_line2 as string)?.trim() || null},
        ${(body.city as string)?.trim() || null},
        ${(body.state as string)?.trim() || null},
        ${(body.zip_code as string)?.trim() || null},
        ${c.get('facilityId') as string}
      )
      RETURNING id, medical_record_number, first_name, last_name, date_of_birth,
                email, phone, address_line1, address_line2, city, state, zip_code,
                created_at, updated_at
    `;

    // Audit: patient created
    const providerId = c.get('providerId') as string | undefined;
    if (providerId) {
      await logAudit(providerId, 'patient.created', rows[0].id, {
        mrn: rows[0].medical_record_number,
      });
    }

    return c.json({ patient: rows[0] }, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('POST /api/patients error:', message);
    return c.json({ error: 'Failed to create patient' }, 500);
  }
});

// PUT /api/patients/:id — update an existing patient
patientsRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const errors = validatePatientBody(body);
  if (errors.length > 0) {
    return c.json({ error: 'Validation failed', details: errors }, 400);
  }

  try {
    const rows = await sql`
      UPDATE patients SET
        first_name = ${(body.first_name as string).trim()},
        last_name = ${(body.last_name as string).trim()},
        date_of_birth = ${body.date_of_birth as string},
        email = ${(body.email as string)?.trim() || null},
        phone = ${(body.phone as string)?.trim() || null},
        address_line1 = ${(body.address_line1 as string)?.trim() || null},
        address_line2 = ${(body.address_line2 as string)?.trim() || null},
        city = ${(body.city as string)?.trim() || null},
        state = ${(body.state as string)?.trim() || null},
        zip_code = ${(body.zip_code as string)?.trim() || null},
        updated_at = NOW()
      WHERE id = ${id} AND facility_id = ${c.get('facilityId') as string}
      RETURNING id, medical_record_number, first_name, last_name, date_of_birth,
                email, phone, address_line1, address_line2, city, state, zip_code,
                created_at, updated_at
    `;
    if (rows.length === 0) {
      return c.json({ error: 'Patient not found' }, 404);
    }

    // Audit: patient updated
    const providerId = c.get('providerId') as string | undefined;
    if (providerId) {
      await logAudit(providerId, 'patient.updated', rows[0].id);
    }

    return c.json({ patient: rows[0] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('PUT /api/patients/:id error:', message);
    return c.json({ error: 'Failed to update patient' }, 500);
  }
});
