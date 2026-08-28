export default function DriversPage() {
  const drivers = [
    {
      id: "DR-001",
      name: "Abebe Kebede",
      license: "ET-L-45821",
      phone: "+251 911 234 567",
      vehicle: "FL-001",
      status: "Active",
    },
    {
      id: "DR-002",
      name: "Daniel Mekonnen",
      license: "ET-L-78342",
      phone: "+251 922 345 678",
      vehicle: "FL-002",
      status: "Active",
    },
    {
      id: "DR-003",
      name: "Samuel Tesfaye",
      license: "ET-L-92134",
      phone: "+251 933 456 789",
      vehicle: "Unassigned",
      status: "Off Duty",
    },
    {
      id: "DR-004",
      name: "Michael Tadesse",
      license: "ET-L-67432",
      phone: "+251 944 567 890",
      vehicle: "FL-004",
      status: "Active",
    },
    {
      id: "DR-005",
      name: "Yonas Girma",
      license: "ET-L-81245",
      phone: "+251 955 678 901",
      vehicle: "Unassigned",
      status: "Off Duty",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              DRIVER MANAGEMENT
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Drivers
            </h1>

            <p className="mt-2 text-slate-500">
              Manage drivers, licenses, assignments, and availability.
            </p>
          </div>

          <button className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700">
            + Add Driver
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Drivers
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              84
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Active
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              68
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Off Duty
            </p>

            <p className="mt-1 text-2xl font-bold text-orange-600">
              12
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Unassigned
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-500">
              4
            </p>
          </div>

        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Driver Registry
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Driver ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">License</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {drivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {driver.id}
                    </td>

                    <td className="px-6 py-4 text-slate-700">
                      {driver.name}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {driver.license}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {driver.phone}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {driver.vehicle}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          driver.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {driver.status}
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
