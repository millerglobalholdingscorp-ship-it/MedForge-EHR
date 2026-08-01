import { useState, useEffect, useCallback } from 'react';
import type {
  Patient,
  PatientFormData,
  FormMode,
  FormErrors,
} from '../types/patient';
import { emptyFormData } from '../types/patient';
import { facilityHeaders } from '../lib/facility';

interface PatientFormModalProps {
  mode: FormMode;
  patient: Patient | null;
  onClose: () => void;
  onSuccess: () => void;
  getToken: () => Promise<string | null>;
}

export default function PatientFormModal({
  mode,
  patient,
  onClose,
  onSuccess,
  getToken,
}: PatientFormModalProps) {
  const [formData, setFormData] = useState<PatientFormData>(emptyFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && patient) {
      setFormData({
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth,
        email: patient.email ?? '',
        phone: patient.phone ?? '',
        address_line1: patient.address_line1 ?? '',
        address_line2: patient.address_line2 ?? '',
        city: patient.city ?? '',
        state: patient.state ?? '',
        zip_code: patient.zip_code ?? '',
      });
    } else {
      setFormData(emptyFormData);
    }
    setErrors({});
    setApiError(null);
  }, [mode, patient]);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const d = new Date(formData.date_of_birth + 'T00:00:00');
      if (isNaN(d.getTime())) {
        newErrors.date_of_birth = 'Enter a valid date (YYYY-MM-DD)';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FormErrors];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);

    try {
      const token = await getToken();
      const isEdit = mode === 'edit' && patient;
      const url = isEdit
        ? `/api/patients/${patient.id}`
        : '/api/patients';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, ...facilityHeaders(),
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg =
          body.details?.join(', ') ??
          body.error ??
          `Request failed (${res.status})`;
        throw new Error(msg);
      }

      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

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
          <h2 className="text-lg font-semibold text-white">
            {mode === 'create' ? 'Add New Patient' : 'Edit Patient'}
            {mode === 'edit' && patient && (
              <span className="ml-2 text-sm font-normal text-teal-400">
                {patient.medical_record_number}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm">
              {apiError}
            </div>
          )}

          {/* Required fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg text-sm bg-gray-800 border ${
                  errors.first_name ? 'border-red-500' : 'border-gray-700'
                } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors`}
                placeholder="John"
              />
              {errors.first_name && (
                <p className="mt-1 text-xs text-red-400">{errors.first_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Last Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg text-sm bg-gray-800 border ${
                  errors.last_name ? 'border-red-500' : 'border-gray-700'
                } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors`}
                placeholder="Doe"
              />
              {errors.last_name && (
                <p className="mt-1 text-xs text-red-400">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Date of Birth <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg text-sm bg-gray-800 border ${
                errors.date_of_birth ? 'border-red-500' : 'border-gray-700'
              } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors`}
            />
            {errors.date_of_birth && (
              <p className="mt-1 text-xs text-red-400">{errors.date_of_birth}</p>
            )}
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg text-sm bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg text-sm bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Address */}
          <div className="border-t border-gray-800 pt-4">
            <p className="text-sm font-medium text-gray-300 mb-3">Address</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
                  placeholder="Apt 4B"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
                    placeholder="NY"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Zip Code</label>
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
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
              {mode === 'create' ? 'Create Patient' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
