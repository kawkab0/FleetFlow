
export default function VehiclesPage() {
  const vehicles = [
    {
      id: "FL-001",
      registration: "ET-45231",
      type: "Truck",
      model: "Volvo FH",
      driver: "Abebe K.",
      status: "Active",
      mileage: "82,450 km",
    },
    {
      id: "FL-002",
      registration: "ET-78124",
      type: "Van",
      model: "Mercedes Sprinter",
      driver: "Daniel M.",
      status: "Active",
      mileage: "64,210 km",
    },
    {
      id: "FL-003",
      registration: "ET-32987",
      type: "Truck",
      model: "Scania R450",
      driver: "Unassigned",
      status: "Maintenance",
      mileage: "103,890 km",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">FLEET MANAGEMENT</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Vehicles
            </h1>
            <p className="mt-2 text-slate-500">
              Manage and monitor your entire vehicle fleet.
            </p>
          </div>

          <button className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700">
            + Add Vehicle
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Vehicles</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">128</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Active</p>
            <p className="mt-1 text-2xl font-bold text-green-600">96</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Maintenance</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">7</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Inactive</p>
            <p className="mt-1 text-2xl font-bold text-slate-500">25</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Vehicle Registry
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Vehicle ID</th>
                  <th className="px-6 py-4">Registration</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Model</th>
                  <th className="px-6 py-4">Driver</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Mileage</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {vehicle.id}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {vehicle.registration}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {vehicle.type}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {vehicle.model}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {vehicle.driver}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          vehicle.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {vehicle.mileage}
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
