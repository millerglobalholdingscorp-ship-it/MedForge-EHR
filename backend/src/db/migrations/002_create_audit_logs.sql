-- 002_create_audit_logs.sql
-- Creates the audit_logs table for tracking patient record access
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id TEXT NOT NULL,
  action TEXT NOT NULL,
  patient_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
