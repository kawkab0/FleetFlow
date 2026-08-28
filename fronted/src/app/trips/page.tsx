export default function TripsPage() {
  const trips = [
    {
      id: "TR-1001",
      vehicle: "FL-001",
      driver: "Abebe Kebede",
      origin: "Addis Ababa",
      destination: "Jimma",
      departure: "24 Aug 2026",
      status: "In Progress",
    },
    {
      id: "TR-1002",
      vehicle: "FL-002",
      driver: "Daniel Mekonnen",
      origin: "Jimma",
      destination: "Nekemte",
      departure: "24 Aug 2026",
      status: "Scheduled",
    },
    {
      id: "TR-1003",
      vehicle: "FL-004",
      driver: "Michael Tadesse",
      origin: "Bahir Dar",
      destination: "Addis Ababa",
      departure: "23 Aug 2026",
      status: "Completed",
    },
    {
      id: "TR-1004",
      vehicle: "FL-006",
      driver: "Yonas Girma",
      origin: "Hawassa",
      destination: "Adama",
      departure: "23 Aug 2026",
      status: "Completed",
    },
    {
      id: "TR-1005",
      vehicle: "FL-008",
      driver: "Samuel Tesfaye",
      origin: "Jimma",
      destination: "Woliso",
      departure: "25 Aug 2026",
      status: "Scheduled",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              TRIP MANAGEMENT
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Trips
            </h1>

            <p className="mt-2 text-slate-500">
              Plan, monitor, and manage fleet trips.
            </p>
          </div>

          <button className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700">
            + Create Trip
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Trips
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              156
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              In Progress
            </p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              24
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
              Completed
            </p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              114
            </p>
          </div>

        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Trip Registry
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Trip ID</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Driver</th>
                  <th className="px-6 py-4">Origin</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4">Departure</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {trips.map((trip) => (
                  <tr
                    key={trip.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {trip.id}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {trip.vehicle}
                    </td>

                    <td className="px-6 py-4 text-slate-700">
                      {trip.driver}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {trip.origin}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {trip.destination}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {trip.departure}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          trip.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : trip.status === "In Progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {trip.status}
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
