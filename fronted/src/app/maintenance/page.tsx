export default function MaintenancePage() {
  const maintenanceRecords = [
    {
      id: "MA-1001",
      vehicle: "FL-001",
      type: "Oil Change",
      technician: "TechPro Garage",
      date: "24 Aug 2026",
      cost: 180,
      status: "Completed",
    },
    {
      id: "MA-1002",
      vehicle: "FL-003",
      type: "Brake Inspection",
      technician: "AutoCare Center",
      date: "24 Aug 2026",
      cost: 320,
      status: "In Progress",
    },
    {
      id: "MA-1003",
      vehicle: "FL-006",
      type: "Tire Replacement",
      technician: "FleetFix Services",
      date: "23 Aug 2026",
      cost: 850,
      status: "Completed",
    },
    {
      id: "MA-1004",
      vehicle: "FL-008",
      type: "Engine Service",
      technician: "TechPro Garage",
      date: "22 Aug 2026",
      cost: 1200,
      status: "Scheduled",
    },
    {
      id: "MA-1005",
      vehicle: "FL-011",
      type: "Battery Replacement",
      technician: "AutoCare Center",
      date: "21 Aug 2026",
      cost: 450,
      status: "Completed",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              MAINTENANCE MANAGEMENT
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Maintenance
            </h1>

            <p className="mt-2 text-slate-500">
              Track vehicle servicing, repairs, costs, and maintenance schedules.
            </p>
          </div>

          <button className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700">
            + Schedule Maintenance
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Records
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              342
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Scheduled
            </p>
            <p className="mt-1 text-2xl font-bold text-orange-600">
              18
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              In Progress
            </p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              7
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Monthly Cost
            </p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              $8,420
            </p>
          </div>

        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Maintenance Records
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Record ID</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Service Type</th>
                  <th className="px-6 py-4">Technician</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Cost</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {maintenanceRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {record.id}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {record.vehicle}
                    </td>

                    <td className="px-6 py-4 text-slate-700">
                      {record.type}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {record.technician}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {record.date}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700">
                      ${record.cost}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          record.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : record.status === "In Progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}

              </tbody>

            </table>
          </div>

        </div>

      </div>
    </main>
  );
}
