/**
 * Run the 001_create_patients migration against Neon.
 * Usage: bun run src/db/migrate.ts
 */
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DATABASE_URL!);

console.log('Running migration: 001_create_patients...');

try {
  const result = await sql`
    CREATE TABLE IF NOT EXISTS patients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      medical_record_number TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth DATE NOT NULL,
      email TEXT,
      phone TEXT,
      address_line1 TEXT,
      address_line2 TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('Migration result:', JSON.stringify(result));

  // Verify table exists
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'patients'
  `;
  if (tables.length > 0) {
    console.log('✓ Migration complete — patients table verified.');
  } else {
    console.error('✗ Table creation claimed success but table not found.');
    process.exit(1);
  }
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : 'Unknown error';
  console.error('Migration failed:', message);
  process.exit(1);
}
