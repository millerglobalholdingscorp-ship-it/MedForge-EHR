export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Provider Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Manage your patients, view records, and coordinate care.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Patients', value: '—' },
          { label: 'Appointments Today', value: '—' },
          { label: 'Pending Labs', value: '—' },
          { label: 'Messages', value: '—' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-xl border border-gray-800 bg-gray-900/50"
          >
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Patients</h2>
          <button className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-500 transition-colors">
            + New Patient
          </button>
        </div>
        <div className="text-center py-12 text-gray-500">
          <p>No patients yet.</p>
          <p className="text-sm mt-1">
            Patient management features coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
