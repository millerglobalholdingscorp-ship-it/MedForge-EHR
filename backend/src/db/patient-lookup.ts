import sql from './index';

/** Find the patient record associated with a verified Clerk email address. */
export async function findPatientByEmail(email: string) {
  const rows = await sql`
    SELECT id, medical_record_number, first_name, last_name, date_of_birth,
           email, phone, address_line1, address_line2, city, state, zip_code,
           created_at, updated_at
    FROM patients
    WHERE LOWER(email) = LOWER(${email})
    LIMIT 1
  `;
  return rows[0] ?? null;
}
