"use client";

import { useEffect, useState } from "react";

interface Vehicle {
  id: number;
  vehicleCode?: string;
  registration?: string;
  type?: string;
  model?: string;
  status: string;
  mileage?: string | number;
}

interface Driver {
  id: number;
  driverCode: string;
  name: string;
  status: string;
  assignedVehicle?: string | null;
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
  paymentMethod: string;
  notes: string | null;
}

interface Maintenance {
  id: number;
  maintenanceCode: string;
  vehicleCode: string;
  maintenanceDate: string;
  maintenanceType: string;
  description: string;
  mileage: string | number;
  cost: string | number;
  serviceProvider: string;
  status: string;
  notes: string | null;
}

interface Expense {
  id: number;
  expenseCode: string;
  vehicleCode: string;
  driverCode: string;
  expenseDate: string;
  category: string;
  description: string;
  amount: string | number;
  vendor: string;
  paymentMethod: string;
  status: string;
  notes: string | null;
}

export default function Home() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuel, setFuel] = useState<Fuel[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:3001";

  const fetchDashboardData = async () => {
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
        throw new Error("Failed to load dashboard data.");
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
      console.error("Dashboard error:", err);

      setError(
        "Unable to load dashboard data. Make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const activeVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "Active",
  ).length;

  const maintenanceVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "Maintenance",
  ).length;

  const inactiveVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.status === "Inactive" ||
      vehicle.status === "inactive",
  ).length;

  const activeTripsCount = trips.filter(
    (trip) =>
      trip.status === "In Progress" ||
      trip.status === "Active",
  ).length;

  const availableVehicles = Math.max(
    activeVehicles - activeTripsCount,
    0,
  );

  const activeDrivers = drivers.filter(
    (driver) => driver.status === "Active",
  ).length;

  const activeTrips = trips.filter(
    (trip) =>
      trip.status === "In Progress" ||
      trip.status === "Active",
  ).length;

  const scheduledTrips = trips.filter(
    (trip) =>
      trip.status === "Scheduled" ||
      trip.status === "Planned",
  ).length;

  const completedTrips = trips.filter(
    (trip) => trip.status === "Completed",
  ).length;

  const maintenanceDue = maintenance.filter(
    (record) =>
      record.status === "Pending" ||
      record.status === "In Progress",
  ).length;

  const totalFuelCost = fuel.reduce(
    (total, record) => total + Number(record.cost),
    0,
  );

  const totalMaintenanceCost = maintenance.reduce(
    (total, record) => total + Number(record.cost),
    0,
  );

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );

  const totalOperatingCost =
    totalFuelCost +
    totalMaintenanceCost +
    totalExpenses;

  /*
   * IMPORTANT:
   * Keep all dates in YYYY-MM-DD format.
   * Do NOT use toLocaleDateString() here because it can
   * convert the date into Arabic or another localized format.
   */
  const formatDate = (date: string) => {
    if (!date) {
      return "";
    }

    return String(date).substring(0, 10);
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
  };

  const recentTrips = [...trips]
    .sort(
      (a, b) =>
        new Date(b.tripDate).getTime() -
        new Date(a.tripDate).getTime(),
    )
    .slice(0, 5);

  const recentMaintenance = [...maintenance]
    .sort(
      (a, b) =>
        new Date(b.maintenanceDate).getTime() -
        new Date(a.maintenanceDate).getTime(),
    )
    .slice(0, 3);

  const recentExpenses = [...expenses]
    .sort(
      (a, b) =>
        new Date(b.expenseDate).getTime() -
        new Date(a.expenseDate).getTime(),
    )
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <header className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            FLEETFLOW ERP
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Fleet Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Real-time overview of your fleet operations,
            drivers, trips, maintenance, fuel, and expenses.
          </p>
        </header>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* MAIN KPI CARDS */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Vehicles
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "..." : vehicles.length}
            </p>

            <p className="mt-2 text-sm text-green-600">
              {activeVehicles} currently active
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Active Drivers
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "..." : activeDrivers}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {drivers.length} total drivers
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Active Trips
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "..." : activeTrips}
            </p>

            <p className="mt-2 text-sm text-blue-600">
              {scheduledTrips} scheduled
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Maintenance Due
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "..." : maintenanceDue}
            </p>

            <p className="mt-2 text-sm text-orange-600">
              Requires attention
            </p>
          </div>

        </section>

        {/* FINANCIAL CARDS */}
        <section className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

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
              {fuel.length} fuel records
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
              {maintenance.length} maintenance records
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Operating Expenses
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading
                ? "..."
                : formatNumber(totalOperatingCost)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Fuel + maintenance + expenses
            </p>
          </div>

        </section>

        {/* OPERATIONS */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* FLEET OVERVIEW */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
              Fleet Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current vehicle availability
            </p>

            <div className="mt-6 space-y-5">

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Available
                </span>

                <span className="font-semibold text-green-600">
                  {loading ? "..." : availableVehicles}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  On Trip
                </span>

                <span className="font-semibold text-blue-600">
                  {loading ? "..." : activeTrips}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Maintenance
                </span>

                <span className="font-semibold text-orange-600">
                  {loading ? "..." : maintenanceVehicles}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Inactive
                </span>

                <span className="font-semibold text-slate-500">
                  {loading ? "..." : inactiveVehicles}
                </span>
              </div>

            </div>
          </div>

          {/* TRIP SUMMARY */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
              Trip Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current trip activity
            </p>

            <div className="mt-6 space-y-5">

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Total Trips
                </span>

                <span className="font-semibold text-slate-900">
                  {loading ? "..." : trips.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  In Progress
                </span>

                <span className="font-semibold text-blue-600">
                  {loading ? "..." : activeTrips}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Scheduled
                </span>

                <span className="font-semibold text-orange-600">
                  {loading ? "..." : scheduledTrips}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Completed
                </span>

                <span className="font-semibold text-green-600">
                  {loading ? "..." : completedTrips}
                </span>
              </div>

            </div>
          </div>

        </section>

        {/* RECENT TRIPS */}
        <section className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Trips
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest fleet trips from the system
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
                    Driver
                  </th>

                  <th className="px-6 py-4">
                    Route
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

                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Loading trips...
                    </td>
                  </tr>
                ) : recentTrips.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No trips found.
                    </td>
                  </tr>
                ) : (
                  recentTrips.map((trip) => (
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
                        {trip.driverCode}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {trip.origin} → {trip.destination}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(trip.tripDate)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            trip.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : trip.status === "In Progress" ||
                                  trip.status === "Active"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {trip.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </section>

        {/* RECENT ACTIVITY */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* MAINTENANCE */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
              Recent Maintenance
            </h2>

            <div className="mt-6 space-y-5">

              {loading ? (
                <p className="text-sm text-slate-500">
                  Loading...
                </p>
              ) : recentMaintenance.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No maintenance records found.
                </p>
              ) : (
                recentMaintenance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-start justify-between gap-4"
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
                        {formatDate(record.maintenanceDate)}
                      </p>
                    </div>

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
                  </div>
                ))
              )}

            </div>
          </div>

          {/* EXPENSES */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
              Recent Expenses
            </h2>

            <div className="mt-6 space-y-5">

              {loading ? (
                <p className="text-sm text-slate-500">
                  Loading...
                </p>
              ) : recentExpenses.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No expenses found.
                </p>
              ) : (
                recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-start justify-between gap-4"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {expense.expenseCode} —{" "}
                        {expense.category}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {expense.description}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(expense.expenseDate)}
                      </p>
                    </div>

                    <p className="font-semibold text-slate-900">
                      {formatNumber(
                        Number(expense.amount),
                      )}
                    </p>
                  </div>
                ))
              )}

            </div>
          </div>

        </section>

      </div>
    </main>
  );
}
