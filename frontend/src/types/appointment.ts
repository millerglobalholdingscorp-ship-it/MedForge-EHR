export interface Appointment {
  id: string; patient_id: string; provider_id: string; scheduled_at: string;
  duration_minutes: number; status: 'scheduled' | 'completed' | 'cancelled';
  reason: string | null; notes: string | null; first_name?: string; last_name?: string;
  medical_record_number?: string; created_at: string; updated_at: string;
}
