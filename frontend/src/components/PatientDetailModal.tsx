import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import type { Patient, ClinicalNote } from '../types/patient';
import NoteEditor from './NoteEditor';

interface PatientDetailModalProps {
  patient: Patient;
  onClose: () => void;
  onEdit: (patient: Patient) => void;
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm ${mono ? 'font-mono text-teal-400' : 'text-white'}`}>
        {value || <span className="text-gray-600">—</span>}
      </p>
    </div>
  );
}

const SOAP_LABELS: { key: keyof Pick<ClinicalNote, 'subjective' | 'objective' | 'assessment' | 'plan'>; label: string }[] = [
  { key: 'subjective', label: 'Subjective' },
  { key: 'objective', label: 'Objective' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'plan', label: 'Plan' },
];

function formatNoteDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function PatientDetailModal({
  patient,
  onClose,
  onEdit,
}: PatientDetailModalProps) {
  const { getToken } = useAuth();

  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);

  const fetchNotes = useCallback(async () => {
    setNotesLoading(true);
    setNotesError(null);
    try {
      const token = await getToken();
      const res = await fetch(`/api/patients/${patient.id}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to fetch notes (${res.status})`);
      }
      const data = await res.json();
      setNotes(data.notes ?? []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load clinical notes';
      setNotesError(message);
    } finally {
      setNotesLoading(false);
    }
  }, [getToken, patient.id]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const openCreateNote = () => {
    setEditingNote(null);
    setEditorOpen(true);
  };

  const openEditNote = (note: ClinicalNote) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingNote(null);
  };

  const handleNoteSaved = () => {
    closeEditor();
    fetchNotes();
  };

  const fullName = `${patient.last_name}, ${patient.first_name}`;
  const dob = new Date(patient.date_of_birth + 'T00:00:00').toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const joined = new Date(patient.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-gray-800 bg-gray-900 shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-lg font-semibold text-white">{fullName}</h2>
            <p className="text-xs text-teal-400 font-mono mt-0.5">
              {patient.medical_record_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Demographics */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              Demographics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" value={patient.first_name} />
              <Field label="Last Name" value={patient.last_name} />
              <Field label="Date of Birth" value={dob} />
              <Field
                label="Medical Record Number"
                value={patient.medical_record_number}
                mono
              />
            </div>
          </div>

          {/* Contact */}
          <div className="border-t border-gray-800 pt-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              Contact
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email" value={patient.email} />
              <Field label="Phone" value={patient.phone} />
            </div>
          </div>

          {/* Address */}
          <div className="border-t border-gray-800 pt-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              Address
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Address Line 1" value={patient.address_line1} />
              <Field label="Address Line 2" value={patient.address_line2} />
              <Field label="City" value={patient.city} />
              <Field label="State" value={patient.state} />
              <Field label="Zip Code" value={patient.zip_code} />
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="border-t border-gray-800 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Clinical Notes
              </h3>
              <button
                onClick={openCreateNote}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-500 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Note
              </button>
            </div>

            {notesLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full" />
              </div>
            ) : notesError ? (
              <div className="p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm">
                {notesError}
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-800 rounded-lg">
                <p className="text-sm text-gray-400">No clinical notes yet</p>
                <button
                  onClick={openCreateNote}
                  className="mt-3 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-500 transition-colors cursor-pointer"
                >
                  Add first note
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => {
                  const expanded = expandedNoteId === note.id;
                  const subjective = note.subjective ?? '';
                  const preview =
                    subjective.length > 80 ? subjective.slice(0, 80) + '…' : subjective;

                  return (
                    <div
                      key={note.id}
                      onClick={() =>
                        setExpandedNoteId(expanded ? null : note.id)
                      }
                      className={`rounded-lg border bg-gray-950 transition-colors cursor-pointer ${
                        expanded
                          ? 'border-gray-700'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm text-gray-400">
                            {formatNoteDate(note.created_at)}
                          </p>
                          <svg
                            className={`w-4 h-4 text-gray-500 transition-transform shrink-0 ${
                              expanded ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <p className="mt-1.5 text-sm text-gray-300">
                          {preview || (
                            <span className="text-gray-600">
                              No subjective — click to view note
                            </span>
                          )}
                        </p>
                      </div>

                      {expanded && (
                        <div className="px-4 pb-4 pt-3 border-t border-gray-800 space-y-3">
                          {SOAP_LABELS.map(({ key, label }) => (
                            <div key={key}>
                              <p className="text-xs font-medium text-teal-400 mb-0.5 uppercase tracking-wide">
                                {label}
                              </p>
                              <p className="text-sm text-gray-300 whitespace-pre-wrap">
                                {note[key] || <span className="text-gray-600">—</span>}
                              </p>
                            </div>
                          ))}
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditNote(note);
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-teal-400 hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                              Edit Note
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="border-t border-gray-800 pt-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              Record
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Created" value={joined} />
              <Field
                label="Last Updated"
                value={new Date(patient.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(patient)}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-500 transition-colors cursor-pointer"
            >
              Edit Patient
            </button>
          </div>
        </div>
      </div>

      {/* Note editor overlay */}
      {editorOpen && (
        <NoteEditor
          patientId={patient.id}
          note={editingNote}
          onClose={closeEditor}
          onSaved={handleNoteSaved}
        />
      )}
    </div>
  );
}
