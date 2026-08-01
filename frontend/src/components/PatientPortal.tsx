import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import type { ClinicalNote, Patient } from '../types/patient';

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return <div><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-slate-800">{value || 'Not provided'}</p></div>;
}

export default function PatientPortal() {
  const { getToken } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [patientLoading, setPatientLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(true);
  const [patientError, setPatientError] = useState('');
  const [notesError, setNotesError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };
        const [patientResponse, notesResponse] = await Promise.all([
          fetch('/api/portal/me', { headers }),
          fetch('/api/portal/me/notes', { headers }),
        ]);
        if (!patientResponse.ok) throw new Error((await patientResponse.json()).error || 'Unable to load your record.');
        const patientData = await patientResponse.json();
        if (active) setPatient(patientData.patient);
        if (!notesResponse.ok) {
          const errorBody = await notesResponse.json();
          if (active) setNotesError(errorBody.error || 'Unable to load your notes.');
        } else {
          const notesData = await notesResponse.json();
          if (active) setNotes(notesData.notes || []);
        }
      } catch (error) {
        if (active) setPatientError(error instanceof Error ? error.message : 'Unable to load your record.');
      } finally {
        if (active) { setPatientLoading(false); setNotesLoading(false); }
      }
    }
    void load();
    return () => { active = false; };
  }, [getToken]);

  if (patientLoading) return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-slate-500">Loading your health record…</div>;
  if (patientError) return <div className="mx-auto max-w-2xl px-4 py-20 text-center"><div className="rounded-2xl bg-rose-50 p-8 text-rose-700"><h1 className="text-xl font-semibold">We couldn’t find your record</h1><p className="mt-2">{patientError}</p></div></div>;
  if (!patient) return null;

  return <div className="bg-slate-50 min-h-[calc(100vh-130px)] py-10">
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <div className="mb-8"><p className="text-sm font-medium text-teal-600">Your private health space</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Hello, {patient.first_name}</h1><p className="mt-2 text-slate-600">View your information and notes from your care team.</p></div>
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-semibold text-slate-900">Your information</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Full name" value={`${patient.first_name} ${patient.last_name}`} /><Field label="Date of birth" value={new Date(`${patient.date_of_birth}T00:00:00`).toLocaleDateString()} /><Field label="Medical record number" value={patient.medical_record_number} /><Field label="Email" value={patient.email} /><Field label="Phone" value={patient.phone} /><Field label="Address" value={[patient.address_line1, patient.city, patient.state, patient.zip_code].filter(Boolean).join(', ')} /></div></section>
      <section className="mt-8"><div className="mb-4"><h2 className="text-xl font-semibold text-slate-900">Notes from your care team</h2><p className="mt-1 text-sm text-slate-600">A private summary of your recent visits.</p></div>{notesLoading ? <p className="text-slate-500">Loading notes…</p> : notesError ? <p className="rounded-xl bg-rose-50 p-4 text-rose-700">{notesError}</p> : notes.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">No clinical notes are available yet.</div> : <div className="space-y-4">{notes.map(note => <article key={note.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-500">{new Date(note.created_at).toLocaleDateString()}</p><div className="mt-4 grid gap-4 sm:grid-cols-2">{([['What you shared', note.subjective], ['Observations', note.objective], ['Assessment', note.assessment], ['Plan', note.plan]] as const).map(([label, value]) => value && <div key={label}><h3 className="text-sm font-semibold text-slate-700">{label}</h3><p className="mt-1 whitespace-pre-wrap text-slate-600">{value}</p></div>)}</div></article>)}</div>}</section>
    </div>
  </div>;
}
