import sql from './index.js';

export type AuditAction =
  | 'patient.created'
  | 'patient.read'
  | 'patient.updated'
  | 'patient.list';

/**
 * Log an audit entry for a patient record access.
 *
 * Errors during audit logging are caught and logged to console
 * so they never fail the main request.
 */
export async function logAudit(
  providerId: string,
  action: AuditAction,
  patientId?: string,
  details?: Record<string, unknown>,
): Promise<void> {
  try {
    await sql`
      INSERT INTO audit_logs (provider_id, action, patient_id, details)
      VALUES (${providerId}, ${action}, ${patientId ?? null}, ${details ? JSON.stringify(details) : null})
    `;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Audit log error:', message);
  }
}
