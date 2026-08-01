-- 005_create_facilities.sql
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO facilities (name, slug) VALUES ('Default Clinic', 'default') ON CONFLICT (slug) DO NOTHING;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);
ALTER TABLE clinical_notes ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);
UPDATE patients SET facility_id = (SELECT id FROM facilities WHERE slug = 'default') WHERE facility_id IS NULL;
UPDATE clinical_notes n SET facility_id = p.facility_id FROM patients p WHERE n.patient_id = p.id AND n.facility_id IS NULL;
UPDATE appointments a SET facility_id = p.facility_id FROM patients p WHERE a.patient_id = p.id AND a.facility_id IS NULL;
ALTER TABLE patients ALTER COLUMN facility_id SET NOT NULL;
ALTER TABLE clinical_notes ALTER COLUMN facility_id SET NOT NULL;
ALTER TABLE appointments ALTER COLUMN facility_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS patients_facility_idx ON patients(facility_id);
CREATE INDEX IF NOT EXISTS clinical_notes_facility_idx ON clinical_notes(facility_id);
CREATE INDEX IF NOT EXISTS appointments_facility_idx ON appointments(facility_id);
