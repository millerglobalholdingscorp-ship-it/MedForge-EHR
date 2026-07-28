import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import type { Patient, FormMode } from '../types/patient';
import PatientTable from './PatientTable';
import PatientFormModal from './PatientFormModal';
import PatientDetailModal from './PatientDetailModal';

type ModalState =
  | { kind: 'closed' }
  | { kind: 'form'; mode: FormMode; patient: Patient | null }
  | { kind: 'detail'; patient: Patient };

export default function Dashboard() {
  const { getToken } = useAuth();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ kind: 'closed' });

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/patients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to fetch patients (${res.status})`);
      }
      const data = await res.json();
      setPatients(data.patients ?? []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const openCreate = () => {
    setModal({ kind: 'form', mode: 'create', patient: null });
  };

  const openEdit = (patient: Patient) => {
    setModal({ kind: 'form', mode: 'edit', patient });
  };

  const openDetail = (patient: Patient) => {
    setModal({ kind: 'detail', patient });
  };

  const closeModal = () => {
    setModal({ kind: 'closed' });
  };

  const handleFormSuccess = () => {
    closeModal();
    fetchPatients();
  };

  const handleDetailEdit = (patient: Patient) => {
    setModal({ kind: 'form', mode: 'edit', patient });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Provider Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Manage your patients, view records, and coordinate care.
        </p>
      </div>

      {/* Stats bar — shows live count once loaded */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          {
            label: 'Total Patients',
            value: loading ? '...' : String(patients.length),
          },
          { label: 'Appointments Today', value: '—' },
          { label: 'Pending Labs', value: '—' },
          { label: 'Messages', value: '—' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-xl border border-gray-800 bg-gray-900/50"
          >
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <PatientTable
        patients={patients}
        loading={loading}
        error={error}
        onNew={openCreate}
        onView={openDetail}
        onEdit={openEdit}
      />

      {modal.kind === 'form' && (
        <PatientFormModal
          mode={modal.mode}
          patient={modal.patient}
          onClose={closeModal}
          onSuccess={handleFormSuccess}
          getToken={getToken}
        />
      )}

      {modal.kind === 'detail' && (
        <PatientDetailModal
          patient={modal.patient}
          onClose={closeModal}
          onEdit={handleDetailEdit}
        />
      )}
    </div>
  );
}
