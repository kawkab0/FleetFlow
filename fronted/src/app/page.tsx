import Sidebar from "./components/sidebar";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <main className="ml-64 p-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8">
            <p className="text-sm font-medium text-blue-600">
              FLEETFLOW ERP
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Fleet Dashboard
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your fleet, drivers, trips, maintenance, and finances.
            </p>
          </header>

          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Total Vehicles</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">128</p>
              <p className="mt-2 text-sm text-green-600">↑ 8% this month</p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Active Vehicles</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">96</p>
              <p className="mt-2 text-sm text-slate-500">75% of fleet</p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Active Trips</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">24</p>
              <p className="mt-2 text-sm text-blue-600">12 in progress</p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Maintenance Due</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">7</p>
              <p className="mt-2 text-sm text-red-600">
                Requires attention
              </p>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Fleet Overview
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Available</span>
                  <span className="font-semibold text-green-600">32</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">On Trip</span>
                  <span className="font-semibold text-blue-600">48</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Maintenance</span>
                  <span className="font-semibold text-orange-600">7</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Inactive</span>
                  <span className="font-semibold text-slate-500">41</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Activity
              </h2>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="font-medium text-slate-800">
                    Vehicle FL-104 started a trip
                  </p>
                  <p className="text-sm text-slate-500">10 minutes ago</p>
                </div>

                <div>
                  <p className="font-medium text-slate-800">
                    Maintenance completed for FL-087
                  </p>
                  <p className="text-sm text-slate-500">1 hour ago</p>
                </div>

                <div>
                  <p className="font-medium text-slate-800">
                    Driver assigned to Trip #2048
                  </p>
                  <p className="text-sm text-slate-500">2 hours ago</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
