"use client";

import { useEffect, useState } from "react";

interface Vehicle {
  id: number;
  vehicleCode?: string;
  status: string;
  mileage?: string | number;
}

interface Driver {
  id: number;
  driverCode: string;
  name: string;
  status: string;
}

interface Trip {
  id: number;
  tripCode: string;
  origin: string;
  destination: string;
  vehicleCode: string;
  driverCode: string;
  tripDate: string;
  distance: string | number;
  status: string;
  fuelUsed: string | number;
}

interface Fuel {
  id: number;
  fuelCode: string;
  vehicleCode: string;
  driverCode: string;
  fuelDate: string;
  liters: string | number;
  cost: string | number;
  fuelStation: string;
  odometer: string | number;
}

interface Maintenance {
  id: number;
  maintenanceCode: string;
  vehicleCode: string;
  maintenanceDate: string;
  maintenanceType: string;
  mileage: string | number;
  cost: string | number;
  status: string;
}

interface Expense {
  id: number;
  expenseCode: string;
  vehicleCode: string;
  driverCode: string;
  expenseDate: string;
  category: string;
  amount: string | number;
  status: string;
}

export default function ReportsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuel, setFuel] = useState<Fuel[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:3001";

  useEffect(() => {
    const loadReports = async () => {
      try {
        setError("");

        const [
          vehiclesResponse,
          driversResponse,
          tripsResponse,
          fuelResponse,
          maintenanceResponse,
          expensesResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/vehicles`),
          fetch(`${API_URL}/drivers`),
          fetch(`${API_URL}/trips`),
          fetch(`${API_URL}/fuel`),
          fetch(`${API_URL}/maintenance`),
          fetch(`${API_URL}/expenses`),
        ]);

        if (
          !vehiclesResponse.ok ||
          !driversResponse.ok ||
          !tripsResponse.ok ||
          !fuelResponse.ok ||
          !maintenanceResponse.ok ||
          !expensesResponse.ok
        ) {
          throw new Error("Failed to load report data.");
        }

        const [
          vehiclesData,
          driversData,
          tripsData,
          fuelData,
          maintenanceData,
          expensesData,
        ] = await Promise.all([
          vehiclesResponse.json(),
          driversResponse.json(),
          tripsResponse.json(),
          fuelResponse.json(),
          maintenanceResponse.json(),
          expensesResponse.json(),
        ]);

        setVehicles(vehiclesData);
        setDrivers(driversData);
        setTrips(tripsData);
        setFuel(fuelData);
        setMaintenance(maintenanceData);
        setExpenses(expensesData);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load reports. Make sure the backend is running on port 3001.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  /* =========================
     CALCULATED REPORT DATA
     ========================= */

  const activeVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "Active",
  ).length;

  const activeDrivers = drivers.filter(
    (driver) => driver.status === "Active",
  ).length;

  const completedTrips = trips.filter(
    (trip) => trip.status === "Completed",
  ).length;

  const scheduledTrips = trips.filter(
    (trip) =>
      trip.status === "Scheduled" ||
      trip.status === "Planned",
  ).length;

  const inProgressTrips = trips.filter(
    (trip) =>
      trip.status === "In Progress" ||
      trip.status === "Active",
  ).length;

  const maintenanceCompleted = maintenance.filter(
    (record) => record.status === "Completed",
  ).length;

  const utilization =
    vehicles.length > 0
      ? Math.round(
          (activeVehicles / vehicles.length) * 100,
        )
      : 0;

  const tripCompletion =
    trips.length > 0
      ? Math.round(
          (completedTrips / trips.length) * 100,
        )
      : 0;

  const maintenanceCompliance =
    maintenance.length > 0
      ? Math.round(
          (maintenanceCompleted / maintenance.length) * 100,
        )
      : 0;

  const totalLiters = fuel.reduce(
    (total, record) =>
      total + Number(record.liters),
    0,
  );

  const totalDistance = trips.reduce(
    (total, trip) =>
      total + Number(trip.distance),
    0,
  );

  const fuelEfficiency =
    totalLiters > 0
      ? totalDistance / totalLiters
      : 0;

  const totalFuelCost = fuel.reduce(
    (total, record) =>
      total + Number(record.cost),
    0,
  );

  const totalMaintenanceCost = maintenance.reduce(
    (total, record) =>
      total + Number(record.cost),
    0,
  );

  const totalExpenseCost = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount),
    0,
  );

  const totalOperatingCost =
    totalFuelCost +
    totalMaintenanceCost +
    totalExpenseCost;

  /* =========================
     FORMATTING
     ========================= */

  const formatNumber = (value: number) => {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date: string) => {
    if (!date) {
      return "";
    }

    return date.substring(0, 10);
  };

  /* =========================
     RECENT DATA
     ========================= */

  const recentTrips = [...trips]
    .sort(
      (a, b) =>
        new Date(b.tripDate).getTime() -
        new Date(a.tripDate).getTime(),
    )
    .slice(0, 5);

  const recentFuel = [...fuel]
    .sort(
      (a, b) =>
        new Date(b.fuelDate).getTime() -
        new Date(a.fuelDate).getTime(),
    )
    .slice(0, 5);

  const recentMaintenance = [...maintenance]
    .sort(
      (a, b) =>
        new Date(b.maintenanceDate).getTime() -
        new Date(a.maintenanceDate).getTime(),
    )
    .slice(0, 5);

  const recentExpenses = [...expenses]
    .sort(
      (a, b) =>
        new Date(b.expenseDate).getTime() -
        new Date(a.expenseDate).getTime(),
    )
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            BUSINESS INTELLIGENCE
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Reports
          </h1>

          <p className="mt-2 text-slate-500">
            Analyze FleetFlow operations, costs, and
            performance using live system data.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* KPI CARDS */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Fleet Utilization
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-600">
              {loading ? "..." : `${utilization}%`}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Based on active vehicles
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Trips
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {loading ? "..." : trips.length}
            </p>

            <p className="mt-2 text-xs text-green-600">
              {completedTrips} completed
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Fuel Efficiency
            </p>

            <p className="mt-1 text-2xl font-bold text-orange-600">
              {loading
                ? "..."
                : `${formatNumber(fuelEfficiency)} km/L`}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Based on recorded trips and fuel
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Operating Cost
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              {loading
                ? "..."
                : formatNumber(totalOperatingCost)}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Fuel + maintenance + expenses
            </p>
          </div>

        </div>

        {/* PERFORMANCE */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Fleet Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Performance calculated from actual FleetFlow data.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">

            {/* UTILIZATION */}
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Vehicle Utilization
                </span>

                <span className="font-medium text-slate-900">
                  {loading ? "..." : `${utilization}%`}
                </span>
              </div>

              <div className="h-3 rounded-full bg-slate-200">
                <div
                  className="h-3 rounded-full bg-blue-600"
                  style={{
                    width: `${Math.min(
                      utilization,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* TRIP COMPLETION */}
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Trip Completion
                </span>

                <span className="font-medium text-slate-900">
                  {loading ? "..." : `${tripCompletion}%`}
                </span>
              </div>

              <div className="h-3 rounded-full bg-slate-200">
                <div
                  className="h-3 rounded-full bg-green-600"
                  style={{
                    width: `${Math.min(
                      tripCompletion,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* MAINTENANCE */}
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Maintenance Completion
                </span>

                <span className="font-medium text-slate-900">
                  {loading
                    ? "..."
                    : `${maintenanceCompliance}%`}
                </span>
              </div>

              <div className="h-3 rounded-full bg-slate-200">
                <div
                  className="h-3 rounded-full bg-orange-500"
                  style={{
                    width: `${Math.min(
                      maintenanceCompliance,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* COST BREAKDOWN */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Fuel Cost
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading
                ? "..."
                : formatNumber(totalFuelCost)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {formatNumber(totalLiters)} liters recorded
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Maintenance Cost
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading
                ? "..."
                : formatNumber(totalMaintenanceCost)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {maintenance.length} service records
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Other Expenses
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading
                ? "..."
                : formatNumber(totalExpenseCost)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {expenses.length} expense records
            </p>
          </div>

        </div>

        {/* TRIP REPORT */}
        <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900">
              Fleet Performance Report
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recent trips and operational activity.
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">
                    Trip
                  </th>

                  <th className="px-6 py-4">
                    Vehicle
                  </th>

                  <th className="px-6 py-4">
                    Route
                  </th>

                  <th className="px-6 py-4">
                    Distance
                  </th>

                  <th className="px-6 py-4">
                    Date
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {recentTrips.map((trip) => (
                  <tr
                    key={trip.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {trip.tripCode}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {trip.vehicleCode}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {trip.origin} → {trip.destination}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {formatNumber(
                        Number(trip.distance),
                      )}{" "}
                      km
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(trip.tripDate)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {!loading &&
                  recentTrips.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        No trip records available.
                      </td>
                    </tr>
                  )}

              </tbody>
            </table>
          </div>
        </div>

        {/* FUEL + MAINTENANCE */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">

          {/* FUEL */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="font-semibold text-slate-900">
              Fuel Consumption Report
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recent fuel usage and costs.
            </p>

            <div className="mt-6 space-y-5">

              {recentFuel.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-4"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {record.fuelCode} —{" "}
                      {record.vehicleCode}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatNumber(
                        Number(record.liters),
                      )}{" "}
                      L
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(record.fuelDate)}
                    </p>
                  </div>

                  <p className="font-semibold text-slate-900">
                    {formatNumber(
                      Number(record.cost),
                    )}
                  </p>
                </div>
              ))}

              {!loading &&
                recentFuel.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No fuel records available.
                  </p>
                )}

            </div>
          </div>

          {/* MAINTENANCE */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="font-semibold text-slate-900">
              Maintenance Cost Report
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recent maintenance activity and spending.
            </p>

            <div className="mt-6 space-y-5">

              {recentMaintenance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-4"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {record.maintenanceCode} —{" "}
                      {record.vehicleCode}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {record.maintenanceType}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(
                        record.maintenanceDate,
                      )}
                    </p>
                  </div>

                  <p className="font-semibold text-slate-900">
                    {formatNumber(
                      Number(record.cost),
                    )}
                  </p>
                </div>
              ))}

              {!loading &&
                recentMaintenance.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No maintenance records available.
                  </p>
                )}

            </div>
          </div>

        </div>

        {/* EXPENSE REPORT */}
        <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900">
              Expense Report
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recent fleet operating expenses.
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">
                    Expense
                  </th>

                  <th className="px-6 py-4">
                    Vehicle
                  </th>

                  <th className="px-6 py-4">
                    Category
                  </th>

                  <th className="px-6 py-4">
                    Date
                  </th>

                  <th className="px-6 py-4">
                    Amount
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {recentExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {expense.expenseCode}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {expense.vehicleCode}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {expense.category}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(
                        expense.expenseDate,
                      )}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-900">
                      {formatNumber(
                        Number(expense.amount),
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {!loading &&
                  recentExpenses.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        No expense records available.
                      </td>
                    </tr>
                  )}

              </tbody>
            </table>
          </div>
        </div>

        {/* DRIVER PERFORMANCE */}
        <div className="rounded-xl bg-white p-6 shadow-sm">

          <h2 className="font-semibold text-slate-900">
            Driver Performance Report
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Driver activity based on recorded trips.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Total Drivers
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {loading ? "..." : drivers.length}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Active Drivers
              </p>

              <p className="mt-1 text-2xl font-bold text-green-600">
                {loading ? "..." : activeDrivers}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Total Trips
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-600">
                {loading ? "..." : trips.length}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                In Progress
              </p>

              <p className="mt-1 text-2xl font-bold text-orange-600">
                {loading ? "..." : inProgressTrips}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Scheduled
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-700">
                {loading ? "..." : scheduledTrips}
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
