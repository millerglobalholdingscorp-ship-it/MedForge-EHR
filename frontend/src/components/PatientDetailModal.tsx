import type { Patient } from '../types/patient';

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

export default function PatientDetailModal({
  patient,
  onClose,
  onEdit,
}: PatientDetailModalProps) {
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
    </div>
  );
}
