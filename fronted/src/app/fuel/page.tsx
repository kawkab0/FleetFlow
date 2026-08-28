export default function FuelPage() {
  const fuelRecords = [
    {
      id: "FU-1001",
      vehicle: "FL-001",
      driver: "Abebe Kebede",
      fuelType: "Diesel",
      liters: 120,
      cost: 156,
      date: "24 Aug 2026",
      station: "Shell Jimma",
    },
    {
      id: "FU-1002",
      vehicle: "FL-002",
      driver: "Daniel Mekonnen",
      fuelType: "Diesel",
      liters: 85,
      cost: 111,
      date: "24 Aug 2026",
      station: "Total Jimma",
    },
    {
      id: "FU-1003",
      vehicle: "FL-004",
      driver: "Michael Tadesse",
      fuelType: "Diesel",
      liters: 140,
      cost: 182,
      date: "23 Aug 2026",
      station: "Shell Addis",
    },
    {
      id: "FU-1004",
      vehicle: "FL-006",
      driver: "Yonas Girma",
      fuelType: "Diesel",
      liters: 95,
      cost: 124,
      date: "23 Aug 2026",
      station: "NOC Hawassa",
    },
    {
      id: "FU-1005",
      vehicle: "FL-008",
      driver: "Samuel Tesfaye",
      fuelType: "Diesel",
      liters: 110,
      cost: 143,
      date: "22 Aug 2026",
      station: "Total Jimma",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              FUEL MANAGEMENT
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Fuel
            </h1>

            <p className="mt-2 text-slate-500">
              Track fuel consumption, costs, and vehicle efficiency.
            </p>
          </div>

          <button className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700">
            + Add Fuel Record
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Fuel Used</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              12,480 L
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Monthly Cost</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              $16,224
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Average Cost / L</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              $1.30
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Fuel Records</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              428
            </p>
          </div>

        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Fuel Transactions
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Record ID</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Driver</th>
                  <th className="px-6 py-4">Fuel Type</th>
                  <th className="px-6 py-4">Liters</th>
                  <th className="px-6 py-4">Cost</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Station</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {fuelRecords.map((record) => (
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
                      {record.driver}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {record.fuelType}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {record.liters} L
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700">
                      ${record.cost}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {record.date}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {record.station}
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
