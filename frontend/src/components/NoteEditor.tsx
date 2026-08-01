import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import type { ClinicalNote } from '../types/patient';

interface NoteEditorProps {
  patientId: string;
  /** When provided, the editor opens in edit mode for this note. */
  note?: ClinicalNote | null;
  onClose: () => void;
  onSaved: (note: ClinicalNote) => void;
}

interface NoteFields {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

const emptyFields: NoteFields = {
  subjective: '',
  objective: '',
  assessment: '',
  plan: '',
};

const SOAP_FIELDS: { key: keyof NoteFields; label: string; placeholder: string }[] = [
  { key: 'subjective', label: 'Subjective', placeholder: "Patient's reported symptoms and history…" },
  { key: 'objective', label: 'Objective', placeholder: 'Measurable findings, vitals, exam results…' },
  { key: 'assessment', label: 'Assessment', placeholder: 'Diagnosis or clinical impression…' },
  { key: 'plan', label: 'Plan', placeholder: 'Next steps, treatment, follow-up…' },
];

export default function NoteEditor({
  patientId,
  note,
  onClose,
  onSaved,
}: NoteEditorProps) {
  const { getToken } = useAuth();
  const isEdit = Boolean(note);

  const [fields, setFields] = useState<NoteFields>(
    note
      ? {
          subjective: note.subjective ?? '',
          objective: note.objective ?? '',
          assessment: note.assessment ?? '',
          plan: note.plan ?? '',
        }
      : emptyFields
  );
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (validationError) setValidationError(null);
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed: NoteFields = {
      subjective: fields.subjective.trim(),
      objective: fields.objective.trim(),
      assessment: fields.assessment.trim(),
      plan: fields.plan.trim(),
    };

    if (
      !trimmed.subjective &&
      !trimmed.objective &&
      !trimmed.assessment &&
      !trimmed.plan
    ) {
      setValidationError('At least one field (Subjective, Objective, Assessment, Plan) must be filled out.');
      return;
    }

    setSubmitting(true);
    setApiError(null);

    try {
      const token = await getToken();
      const url = isEdit && note ? `/api/notes/${note.id}` : `/api/patients/${patientId}/notes`;
      const res = await fetch(url, {
        method: isEdit && note ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(trimmed),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg =
          body.details?.join(', ') ??
          body.error ??
          `Request failed (${res.status})`;
        throw new Error(msg);
      }

      const data = await res.json();
      onSaved(data.note as ClinicalNote);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-gray-800 bg-gray-950 shadow-2xl">
        <div className="sticky top-0 bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isEdit ? 'Edit Clinical Note' : 'New Clinical Note'}
            </h2>
            <p className="text-xs text-teal-400 mt-0.5">
              SOAP format — fill in at least one section
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

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {validationError && (
            <div className="p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm">
              {validationError}
            </div>
          )}
          {apiError && (
            <div className="p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm">
              {apiError}
            </div>
          )}

          {SOAP_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label
                htmlFor={`note-${key}`}
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                {label}
              </label>
              <textarea
                id={`note-${key}`}
                name={key}
                value={fields[key]}
                onChange={handleChange}
                rows={3}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg text-sm bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors resize-y"
              />
            </div>
          ))}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {submitting && (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              )}
              {isEdit ? 'Save Changes' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
