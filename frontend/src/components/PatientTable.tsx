import type { Patient } from '../types/patient';

interface PatientTableProps {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  onNew: () => void;
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
}

export default function PatientTable({
  patients,
  loading,
  error,
  onNew,
  onView,
  onEdit,
}: PatientTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Patients</h2>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full" />
            <p className="text-gray-400 text-sm">Loading patients...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Patients</h2>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-400 font-medium">Failed to load patients</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Patients</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {patients.length} patient{patients.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-500 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Patient
        </button>
      </div>

      {patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <svg className="w-12 h-12 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-400 font-medium">No patients yet</p>
          <p className="text-gray-500 text-sm mt-1">Add your first patient to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-3 text-gray-400 font-medium">MRN</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Name</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">DOB</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Email</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Phone</th>
                <th className="text-right py-3 px-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-gray-800/30 transition-colors"
                >
                  <td className="py-3 px-3">
                    <span className="text-teal-400 font-mono text-xs font-medium">
                      {patient.medical_record_number}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => onView(patient)}
                      className="text-white hover:text-teal-400 transition-colors text-left cursor-pointer"
                    >
                      {patient.last_name}, {patient.first_name}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-gray-300">
                    {new Date(patient.date_of_birth + 'T00:00:00').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-3 text-gray-300">
                    {patient.email || <span className="text-gray-600">—</span>}
                  </td>
                  <td className="py-3 px-3 text-gray-300">
                    {patient.phone || <span className="text-gray-600">—</span>}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onView(patient)}
                        className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEdit(patient)}
                        className="px-3 py-1.5 rounded-md text-xs font-medium text-teal-400 hover:text-teal-300 hover:bg-teal-900/30 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
