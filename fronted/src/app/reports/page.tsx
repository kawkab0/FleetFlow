"use client";

import { useEffect, useState } from "react";

interface Vehicle {
  id: number;
  vehicleCode?: string;
  registrationNumber?: string;
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

  /*
   * IMPORTANT:
   * All dates are displayed as YYYY-MM-DD.
   * Do NOT use toLocaleDateString() here because
   * it can display dates using the computer's locale.
   */
  const formatDate = (date: string) => {
    if (!date) {
      return "";
    }

    return date.substring(0, 10);
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
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
      console.error("Reports error:", err);

      setError(
        "Unable to load report data. Make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  /* =========================
     VEHICLE STATISTICS
  ========================= */

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

  const vehicleUtilization =
    vehicles.length > 0
      ? Math.round((activeVehicles / vehicles.length) * 100)
      : 0;

  /* =========================
     DRIVER STATISTICS
  ========================= */

  const activeDrivers = drivers.filter(
    (driver) => driver.status === "Active",
  ).length;

  const driverUtilization =
    drivers.length > 0
      ? Math.round((activeDrivers / drivers.length) * 100)
      : 0;

  /* =========================
     TRIP STATISTICS
  ========================= */

  const completedTrips = trips.filter(
    (trip) => trip.status === "Completed",
  ).length;

  const activeTrips = trips.filter(
    (trip) =>
      trip.status === "In Progress" ||
      trip.status === "Active",
  ).length;

  const plannedTrips = trips.filter(
    (trip) =>
      trip.status === "Planned" ||
      trip.status === "Scheduled",
  ).length;

  const tripCompletionRate =
    trips.length > 0
      ? Math.round((completedTrips / trips.length) * 100)
      : 0;

  const totalDistance = trips.reduce(
    (total, trip) => total + Number(trip.distance),
    0,
  );

  /* =========================
     FUEL STATISTICS
  ========================= */

  const totalFuelLiters = fuel.reduce(
    (total, record) => total + Number(record.liters),
    0,
  );

  const totalFuelCost = fuel.reduce(
    (total, record) => total + Number(record.cost),
    0,
  );

  const fuelEfficiency =
    totalFuelLiters > 0
      ? totalDistance / totalFuelLiters
      : 0;

  /* =========================
     MAINTENANCE STATISTICS
  ========================= */

  const completedMaintenance = maintenance.filter(
    (record) => record.status === "Completed",
  ).length;

  const pendingMaintenance = maintenance.filter(
    (record) =>
      record.status === "Pending" ||
      record.status === "In Progress",
  ).length;

  const totalMaintenanceCost = maintenance.reduce(
    (total, record) => total + Number(record.cost),
    0,
  );

  /* =========================
     EXPENSE STATISTICS
  ========================= */

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );

  const totalOperatingCost =
    totalFuelCost +
    totalMaintenanceCost +
    totalExpenses;

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
        <header className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            BUSINESS INTELLIGENCE
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Reports
          </h1>

          <p className="mt-2 text-slate-500">
            Analyze FleetFlow operations, fleet performance,
            fuel consumption, maintenance, and expenses.
          </p>
        </header>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* KPI CARDS */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Fleet Utilization
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {loading ? "..." : `${vehicleUtilization}%`}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {activeVehicles} of {vehicles.length} vehicles active
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Trip Completion
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {loading ? "..." : `${tripCompletionRate}%`}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {completedTrips} completed trips
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Fuel Efficiency
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {loading
                ? "..."
                : `${formatNumber(fuelEfficiency)} km/L`}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Fleet average
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Operating Cost
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading
                ? "..."
                : formatNumber(totalOperatingCost)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Fuel + maintenance + expenses
            </p>
          </div>

        </section>

        {/* OPERATIONS SUMMARY */}
        <section className="mt-8 grid gap-6 lg:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Fleet Performance
            </h2>

            <div className="mt-6 space-y-5">

              <div className="flex justify-between">
                <span className="text-slate-600">
                  Active Vehicles
                </span>

                <span className="font-semibold text-green-600">
                  {activeVehicles}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">
                  Maintenance
                </span>

                <span className="font-semibold text-orange-600">
                  {maintenanceVehicles}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">
                  Inactive
                </span>

                <span className="font-semibold text-slate-500">
                  {inactiveVehicles}
                </span>
              </div>

            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Trip Performance
            </h2>

            <div className="mt-6 space-y-5">

              <div className="flex justify-between">
                <span className="text-slate-600">
                  Total Trips
                </span>

                <span className="font-semibold text-slate-900">
                  {trips.length}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">
                  In Progress
                </span>

                <span className="font-semibold text-blue-600">
                  {activeTrips}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">
                  Planned
                </span>

                <span className="font-semibold text-orange-600">
                  {plannedTrips}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">
                  Distance
                </span>

                <span className="font-semibold text-slate-900">
                  {formatNumber(totalDistance)} km
                </span>
              </div>

            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Driver Performance
            </h2>

            <div className="mt-6 space-y-5">

              <div className="flex justify-between">
                <span className="text-slate-600">
                  Total Drivers
                </span>

                <span className="font-semibold text-slate-900">
                  {drivers.length}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">
                  Active Drivers
                </span>

                <span className="font-semibold text-green-600">
                  {activeDrivers}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">
                  Availability
                </span>

                <span className="font-semibold text-blue-600">
                  {driverUtilization}%
                </span>
              </div>

            </div>
          </div>

        </section>

        {/* COST ANALYSIS */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Cost Analysis
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Breakdown of fleet operating costs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">

            <div>
              <p className="text-sm text-slate-500">
                Fuel Cost
              </p>

              <p className="mt-1 text-2xl font-bold text-orange-600">
                {formatNumber(totalFuelCost)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {fuel.length} fuel records
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Maintenance Cost
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-600">
                {formatNumber(totalMaintenanceCost)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {maintenance.length} maintenance records
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Other Expenses
              </p>

              <p className="mt-1 text-2xl font-bold text-green-600">
                {formatNumber(totalExpenses)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {expenses.length} expense records
              </p>
            </div>

          </div>

        </section>

        {/* PERFORMANCE BARS */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-slate-900">
            Performance Indicators
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current operational performance.
          </p>

          <div className="mt-6 space-y-6">

            {/* FLEET */}
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Fleet Utilization
                </span>

                <span className="font-medium text-slate-900">
                  {vehicleUtilization}%
                </span>
              </div>

              <div className="h-3 rounded-full bg-slate-200">
                <div
                  className="h-3 rounded-full bg-blue-600"
                  style={{
                    width: `${vehicleUtilization}%`,
                  }}
                />
              </div>
            </div>

            {/* TRIPS */}
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Trip Completion
                </span>

                <span className="font-medium text-slate-900">
                  {tripCompletionRate}%
                </span>
              </div>

              <div className="h-3 rounded-full bg-slate-200">
                <div
                  className="h-3 rounded-full bg-green-600"
                  style={{
                    width: `${tripCompletionRate}%`,
                  }}
                />
              </div>
            </div>

            {/* DRIVERS */}
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Driver Availability
                </span>

                <span className="font-medium text-slate-900">
                  {driverUtilization}%
                </span>
              </div>

              <div className="h-3 rounded-full bg-slate-200">
                <div
                  className="h-3 rounded-full bg-orange-500"
                  style={{
                    width: `${driverUtilization}%`,
                  }}
                />
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
              Latest trips recorded in FleetFlow.
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
                    Date
                  </th>

                  <th className="px-6 py-4">
                    Distance
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
                      Loading...
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
                        {trip.origin} → {trip.destination}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(trip.tripDate)}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatNumber(Number(trip.distance))} km
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

        {/* RECENT MAINTENANCE + EXPENSES */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* MAINTENANCE */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
              Maintenance Report
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest maintenance activity.
            </p>

            <div className="mt-6 space-y-5">

              {recentMaintenance.length === 0 ? (
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

                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {formatNumber(Number(record.cost))}
                      </p>

                      <span
                        className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          record.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))
              )}

            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Pending maintenance
                </span>

                <span className="font-semibold text-orange-600">
                  {pendingMaintenance}
                </span>
              </div>

              <div className="mt-2 flex justify-between">
                <span className="text-slate-500">
                  Completed maintenance
                </span>

                <span className="font-semibold text-green-600">
                  {completedMaintenance}
                </span>
              </div>
            </div>

          </div>

          {/* EXPENSES */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
              Expense Report
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest fleet expenses.
            </p>

            <div className="mt-6 space-y-5">

              {recentExpenses.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No expense records found.
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
                      {formatNumber(Number(expense.amount))}
                    </p>
                  </div>
                ))
              )}

            </div>

          </div>

        </section>

        {/* FUEL REPORT */}
        <section className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Fuel Consumption Report
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recent fuel usage and fuel costs.
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">
                    Fuel Code
                  </th>

                  <th className="px-6 py-4">
                    Vehicle
                  </th>

                  <th className="px-6 py-4">
                    Date
                  </th>

                  <th className="px-6 py-4">
                    Liters
                  </th>

                  <th className="px-6 py-4">
                    Cost
                  </th>

                  <th className="px-6 py-4">
                    Station
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {recentFuel.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No fuel records found.
                    </td>
                  </tr>
                ) : (
                  recentFuel.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {record.fuelCode}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {record.vehicleCode}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(record.fuelDate)}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatNumber(Number(record.liters))} L
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-900">
                        {formatNumber(Number(record.cost))}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {record.fuelStation}
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>

          </div>
        </section>

      </div>
    </main>
  );
}
