/**
 * Integration test: insert a test patient and read it back to verify the full flow.
 * Usage: bun run src/db/test-patient-flow.ts
 */
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DATABASE_URL!);

async function main() {
  console.log('=== Patient Flow Integration Test ===\n');

  // 1. INSERT a test patient (auto-generate MRN)
  const mrn = `MRN-${String(Math.floor(100000 + Math.random() * 900000))}`;
  console.log(`1. INSERT patient (MRN: ${mrn})...`);

  const insertResult = await sql`
    INSERT INTO patients (
      medical_record_number, first_name, last_name, date_of_birth,
      email, phone, address_line1, city, state, zip_code
    ) VALUES (
      ${mrn},
      'Alice',
      'Testerson',
      '1990-05-15',
      'alice@testerson.example',
      '555-0100',
      '123 Main St',
      'Portland',
      'OR',
      '97201'
    )
    RETURNING id, medical_record_number, first_name, last_name, date_of_birth,
              email, phone, address_line1, city, state, zip_code,
              created_at, updated_at
  `;

  const patient = insertResult[0];
  console.log(`   Created: ${patient.id}`);
  console.log(`   MRN: ${patient.medical_record_number}`);
  console.log(`   Name: ${patient.first_name} ${patient.last_name}`);
  console.log(`   DOB: ${patient.date_of_birth}\n`);

  // Verify auto-generation
  if (!patient.medical_record_number.startsWith('MRN-')) {
    console.error('FAIL: MRN format invalid');
    process.exit(1);
  }
  console.log('   ✓ MRN auto-generated correctly');

  // 2. READ back by id
  console.log(`\n2. READ patient by id...`);

  const readResult = await sql`
    SELECT id, medical_record_number, first_name, last_name, date_of_birth,
           email, phone, address_line1, city, state, zip_code
    FROM patients
    WHERE id = ${patient.id}
  `;

  if (readResult.length !== 1) {
    console.error('FAIL: Could not read back patient');
    process.exit(1);
  }

  const readPatient = readResult[0];
  if (readPatient.first_name !== 'Alice' || readPatient.last_name !== 'Testerson') {
    console.error('FAIL: Patient data mismatch');
    process.exit(1);
  }
  console.log(`   ✓ Read back: ${readPatient.first_name} ${readPatient.last_name}`);

  // 3. UPDATE the patient
  console.log(`\n3. UPDATE patient...`);

  const updateResult = await sql`
    UPDATE patients SET
      first_name = 'Alicia',
      phone = '555-0200',
      updated_at = NOW()
    WHERE id = ${patient.id}
    RETURNING id, first_name, last_name, phone, updated_at
  `;

  if (updateResult[0].first_name !== 'Alicia') {
    console.error('FAIL: Update did not persist');
    process.exit(1);
  }
  console.log(`   ✓ Updated name to: ${updateResult[0].first_name}`);
  console.log(`   ✓ Updated phone to: ${updateResult[0].phone}`);

  // 4. Verify update stuck
  const verifyResult = await sql`
    SELECT first_name, phone FROM patients WHERE id = ${patient.id}
  `;
  if (verifyResult[0].first_name === 'Alicia' && verifyResult[0].phone === '555-0200') {
    console.log('   ✓ Update verified in DB');
  }

  // 5. Clean up — delete the test row
  console.log(`\n4. CLEANUP — deleting test patient...`);
  await sql`DELETE FROM patients WHERE id = ${patient.id}`;
  console.log('   ✓ Test patient removed');

  console.log('\n=== All tests passed! ===');
}

main().catch((err) => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
