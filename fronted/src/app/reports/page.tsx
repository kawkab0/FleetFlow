export default function ReportsPage() {
  const reports = [
    {
      name: "Fleet Performance Report",
      description: "Vehicle utilization, mileage, and operational performance.",
      type: "Operations",
      updated: "Today",
    },
    {
      name: "Fuel Consumption Report",
      description: "Fuel usage, fuel costs, and vehicle efficiency.",
      type: "Fuel",
      updated: "Today",
    },
    {
      name: "Maintenance Cost Report",
      description: "Maintenance spending and vehicle service history.",
      type: "Maintenance",
      updated: "Yesterday",
    },
    {
      name: "Driver Performance Report",
      description: "Driver activity, trips, and operational performance.",
      type: "Drivers",
      updated: "Yesterday",
    },
    {
      name: "Expense Report",
      description: "Fleet operating expenses and spending breakdown.",
      type: "Finance",
      updated: "2 days ago",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            BUSINESS INTELLIGENCE
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Reports
          </h1>

          <p className="mt-2 text-slate-500">
            Analyze FleetFlow operations, costs, and performance.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Fleet Utilization
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-600">
              82%
            </p>

            <p className="mt-2 text-xs text-green-600">
              +6.4% this month
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Trips
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              1,248
            </p>

            <p className="mt-2 text-xs text-green-600">
              +12.8% this month
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Fuel Efficiency
            </p>

            <p className="mt-1 text-2xl font-bold text-orange-600">
              8.4 km/L
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Fleet average
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Operating Cost
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              $42.6K
            </p>

            <p className="mt-2 text-xs text-slate-500">
              This month
            </p>
          </div>

        </div>

        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Fleet Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Monthly operational performance overview.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Vehicle Utilization
                </span>

                <span className="font-medium text-slate-900">
                  82%
                </span>
              </div>

              <div className="h-3 rounded-full bg-slate-200">
                <div className="h-3 w-[82%] rounded-full bg-blue-600" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Trip Completion
                </span>

                <span className="font-medium text-slate-900">
                  91%
                </span>
              </div>

              <div className="h-3 rounded-full bg-slate-200">
                <div className="h-3 w-[91%] rounded-full bg-green-600" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Maintenance Compliance
                </span>

                <span className="font-medium text-slate-900">
                  76%
                </span>
              </div>

              <div className="h-3 rounded-full bg-slate-200">
                <div className="h-3 w-[76%] rounded-full bg-orange-500" />
              </div>
            </div>

          </div>

        </div>

        <div className="rounded-xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900">
              Available Reports
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Generate and review operational reports.
            </p>
          </div>

          <div className="divide-y divide-slate-100">

            {reports.map((report) => (
              <div
                key={report.name}
                className="flex flex-col gap-4 p-6 transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
              >

                <div>
                  <h3 className="font-medium text-slate-900">
                    {report.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {report.description}
                  </p>

                  <div className="mt-2 flex gap-3 text-xs">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                      {report.type}
                    </span>

                    <span className="text-slate-400">
                      Updated {report.updated}
                    </span>
                  </div>
                </div>

                <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  View Report
                </button>

              </div>
            ))}

          </div>

        </div>

      </div>
    </main>
  );
}
