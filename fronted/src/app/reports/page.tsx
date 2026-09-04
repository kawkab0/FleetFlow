"use client";

import { useEffect, useMemo, useState } from "react";

interface Vehicle {
  id: number;
  vehicleCode: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  status: string;
}

interface Driver {
  id: number;
  driverCode: string;
  name: string;
  phone: string;
  licenseNumber: string;
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
  fuelUsed: string | number;
  revenue: string | number;
  cargo: string;
  status: string;
  notes: string | null;
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

  useEffect(() => {
    fetchReportData();
  }, []);

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
      console.error(err);
      setError("Unable to load report data.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    return date.substring(0, 10);
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
  };

  const reportMetrics = useMemo(() => {
    const activeVehicles = vehicles.filter(
      (vehicle) => vehicle.status.toLowerCase() === "active",
    ).length;

    const maintenanceVehicles = vehicles.filter(
      (vehicle) => vehicle.status.toLowerCase() === "maintenance",
    ).length;

    const inactiveVehicles = vehicles.filter(
      (vehicle) => vehicle.status.toLowerCase() === "inactive",
    ).length;

    const vehicleUtilization =
      vehicles.length > 0 ? (activeVehicles / vehicles.length) * 100 : 0;

    const activeDrivers = drivers.filter(
      (driver) => driver.status.toLowerCase() === "active",
    ).length;

    const driverUtilization =
      drivers.length > 0 ? (activeDrivers / drivers.length) * 100 : 0;

    const completedTrips = trips.filter(
      (trip) => trip.status.toLowerCase() === "completed",
    ).length;

    const activeTrips = trips.filter(
      (trip) =>
        trip.status.toLowerCase() === "in progress" ||
        trip.status.toLowerCase() === "active",
    ).length;

    const plannedTrips = trips.filter(
      (trip) => trip.status.toLowerCase() === "planned",
    ).length;

    const tripCompletionRate =
      trips.length > 0 ? (completedTrips / trips.length) * 100 : 0;

    const totalDistance = trips.reduce(
      (sum, trip) => sum + Number(trip.distance || 0),
      0,
    );

    const totalFuelLiters = fuel.reduce(
      (sum, record) => sum + Number(record.liters || 0),
      0,
    );

    const totalFuelCost = fuel.reduce(
      (sum, record) => sum + Number(record.cost || 0),
      0,
    );

    const fuelEfficiency =
      totalFuelLiters > 0 ? totalDistance / totalFuelLiters : 0;

    const completedMaintenance = maintenance.filter(
      (record) => record.status.toLowerCase() === "completed",
    ).length;

    const pendingMaintenance = maintenance.filter(
      (record) => record.status.toLowerCase() === "pending",
    ).length;

    const totalMaintenanceCost = maintenance.reduce(
      (sum, record) => sum + Number(record.cost || 0),
      0,
    );

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0,
    );

    const totalOperatingCost =
      totalFuelCost + totalMaintenanceCost + totalExpenses;

    return {
      activeVehicles,
      maintenanceVehicles,
      inactiveVehicles,
      vehicleUtilization,
      activeDrivers,
      driverUtilization,
      completedTrips,
      activeTrips,
      plannedTrips,
      tripCompletionRate,
      totalDistance,
      totalFuelLiters,
      totalFuelCost,
      fuelEfficiency,
      completedMaintenance,
      pendingMaintenance,
      totalMaintenanceCost,
      totalExpenses,
      totalOperatingCost,
    };
  }, [vehicles, drivers, trips, fuel, maintenance, expenses]);

  const recentTrips = useMemo(() => {
    return [...trips]
      .sort(
        (a, b) =>
          new Date(b.tripDate).getTime() -
          new Date(a.tripDate).getTime(),
      )
      .slice(0, 5);
  }, [trips]);

  const recentFuel = useMemo(() => {
    return [...fuel]
      .sort(
        (a, b) =>
          new Date(b.fuelDate).getTime() -
          new Date(a.fuelDate).getTime(),
      )
      .slice(0, 5);
  }, [fuel]);

  const recentMaintenance = useMemo(() => {
    return [...maintenance]
      .sort(
        (a, b) =>
          new Date(b.maintenanceDate).getTime() -
          new Date(a.maintenanceDate).getTime(),
      )
      .slice(0, 5);
  }, [maintenance]);

  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort(
        (a, b) =>
          new Date(b.expenseDate).getTime() -
          new Date(a.expenseDate).getTime(),
      )
      .slice(0, 5);
  }, [expenses]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <p className="text-lg text-slate-300">
              Loading business intelligence reports...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-900 bg-red-950/40 p-8">
            <h1 className="text-2xl font-bold">Reports Error</h1>
            <p className="mt-2 text-red-300">{error}</p>

            <button
              onClick={fetchReportData}
              className="mt-5 rounded-lg bg-white px-5 py-2.5 font-semibold text-slate-900 hover:bg-slate-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <section>
          <p className="text-sm font-semibold tracking-[0.25em] text-slate-400">
            BUSINESS INTELLIGENCE
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Reports
          </h1>

          <p className="mt-2 max-w-2xl text-slate-400">
            FleetFlow operational performance, cost analysis, and fleet
            intelligence.
          </p>
        </section>

        {/* KPI Cards */}
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Fleet Utilization</p>

            <p className="mt-3 text-3xl font-bold">
              {formatNumber(reportMetrics.vehicleUtilization)}%
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {reportMetrics.activeVehicles} of {vehicles.length} vehicles
              active
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Trip Completion</p>

            <p className="mt-3 text-3xl font-bold">
              {formatNumber(reportMetrics.tripCompletionRate)}%
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {reportMetrics.completedTrips} completed trips
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Fuel Efficiency</p>

            <p className="mt-3 text-3xl font-bold">
              {formatNumber(reportMetrics.fuelEfficiency)} km/L
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Based on recorded distance and fuel
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Operating Cost</p>

            <p className="mt-3 text-3xl font-bold">
              {formatNumber(reportMetrics.totalOperatingCost)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Fuel + maintenance + expenses
            </p>
          </div>
        </section>

        {/* Operations Summary */}
        <section>
          <h2 className="mb-4 text-2xl font-bold">Operations Summary</h2>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-lg font-semibold">Fleet Performance</h3>

              <div className="mt-5 space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Vehicles</span>
                  <span className="font-semibold">{vehicles.length}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Active</span>
                  <span className="font-semibold text-emerald-400">
                    {reportMetrics.activeVehicles}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Maintenance</span>
                  <span className="font-semibold text-amber-400">
                    {reportMetrics.maintenanceVehicles}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Inactive</span>
                  <span className="font-semibold text-red-400">
                    {reportMetrics.inactiveVehicles}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-lg font-semibold">Trip Performance</h3>

              <div className="mt-5 space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Trips</span>
                  <span className="font-semibold">{trips.length}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Completed</span>
                  <span className="font-semibold text-emerald-400">
                    {reportMetrics.completedTrips}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Active</span>
                  <span className="font-semibold text-blue-400">
                    {reportMetrics.activeTrips}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Planned</span>
                  <span className="font-semibold text-amber-400">
                    {reportMetrics.plannedTrips}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Distance</span>
                  <span className="font-semibold">
                    {formatNumber(reportMetrics.totalDistance)} km
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-lg font-semibold">Driver Performance</h3>

              <div className="mt-5 space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Drivers</span>
                  <span className="font-semibold">{drivers.length}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Active Drivers</span>
                  <span className="font-semibold text-emerald-400">
                    {reportMetrics.activeDrivers}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Availability</span>
                  <span className="font-semibold">
                    {formatNumber(reportMetrics.driverUtilization)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cost Analysis */}
        <section>
          <h2 className="mb-4 text-2xl font-bold">Cost Analysis</h2>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Fuel Cost</p>

              <p className="mt-3 text-3xl font-bold">
                {formatNumber(reportMetrics.totalFuelCost)}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {formatNumber(reportMetrics.totalFuelLiters)} liters consumed
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Maintenance Cost</p>

              <p className="mt-3 text-3xl font-bold">
                {formatNumber(reportMetrics.totalMaintenanceCost)}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {reportMetrics.completedMaintenance} completed /
                {" "}
                {reportMetrics.pendingMaintenance} pending
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Other Expenses</p>

              <p className="mt-3 text-3xl font-bold">
                {formatNumber(reportMetrics.totalExpenses)}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {expenses.length} expense records
              </p>
            </div>
          </div>
        </section>

        {/* Performance Indicators */}
        <section>
          <h2 className="mb-4 text-2xl font-bold">
            Performance Indicators
          </h2>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="space-y-7">
              <div>
                <div className="mb-2 flex justify-between">
                  <span className="text-sm text-slate-300">
                    Fleet Utilization
                  </span>

                  <span className="text-sm font-semibold">
                    {formatNumber(reportMetrics.vehicleUtilization)}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{
                      width: `${Math.min(
                        reportMetrics.vehicleUtilization,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between">
                  <span className="text-sm text-slate-300">
                    Trip Completion
                  </span>

                  <span className="text-sm font-semibold">
                    {formatNumber(reportMetrics.tripCompletionRate)}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${Math.min(
                        reportMetrics.tripCompletionRate,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between">
                  <span className="text-sm text-slate-300">
                    Driver Availability
                  </span>

                  <span className="text-sm font-semibold">
                    {formatNumber(reportMetrics.driverUtilization)}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-purple-500"
                    style={{
                      width: `${Math.min(
                        reportMetrics.driverUtilization,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Trips */}
        <section>
          <h2 className="mb-4 text-2xl font-bold">Recent Trips</h2>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="min-w-full text-left">
              <thead className="border-b border-slate-800 text-sm text-slate-400">
                <tr>
                  <th className="px-5 py-4">Trip</th>
                  <th className="px-5 py-4">Route</th>
                  <th className="px-5 py-4">Vehicle</th>
                  <th className="px-5 py-4">Driver</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Distance</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentTrips.map((trip) => (
                  <tr
                    key={trip.id}
                    className="border-b border-slate-800 last:border-0"
                  >
                    <td className="px-5 py-4 font-semibold">
                      {trip.tripCode}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {trip.origin} → {trip.destination}
                    </td>

                    <td className="px-5 py-4">{trip.vehicleCode}</td>

                    <td className="px-5 py-4">{trip.driverCode}</td>

                    <td className="px-5 py-4 text-slate-400">
                      {formatDate(trip.tripDate)}
                    </td>

                    <td className="px-5 py-4">
                      {formatNumber(Number(trip.distance || 0))} km
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold">
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {recentTrips.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      No trip records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Maintenance Report */}
        <section>
          <h2 className="mb-4 text-2xl font-bold">
            Maintenance Report
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="min-w-full text-left">
              <thead className="border-b border-slate-800 text-sm text-slate-400">
                <tr>
                  <th className="px-5 py-4">Maintenance</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Mileage</th>
                  <th className="px-5 py-4">Cost</th>
                  <th className="px-5 py-4">Provider</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentMaintenance.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-slate-800 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold">
                        {record.maintenanceCode} — {record.vehicleCode}
                      </div>

                      <div className="mt-1 text-sm text-slate-500">
                        {record.description}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {record.maintenanceType}
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {formatDate(record.maintenanceDate)}
                    </td>

                    <td className="px-5 py-4">
                      {formatNumber(Number(record.mileage || 0))}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {formatNumber(Number(record.cost || 0))}
                    </td>

                    <td className="px-5 py-4">
                      {record.serviceProvider}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold">
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {recentMaintenance.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      No maintenance records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Expense Report */}
        <section>
          <h2 className="mb-4 text-2xl font-bold">Expense Report</h2>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="min-w-full text-left">
              <thead className="border-b border-slate-800 text-sm text-slate-400">
                <tr>
                  <th className="px-5 py-4">Expense</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Description</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Vendor</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-slate-800 last:border-0"
                  >
                    <td className="px-5 py-4 font-semibold">
                      {expense.expenseCode} — {expense.category}
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {formatDate(expense.expenseDate)}
                    </td>

                    <td className="px-5 py-4">{expense.category}</td>

                    <td className="px-5 py-4 text-slate-300">
                      {expense.description}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {formatNumber(Number(expense.amount || 0))}
                    </td>

                    <td className="px-5 py-4">{expense.vendor}</td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold">
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {recentExpenses.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      No expense records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Fuel Consumption Report */}
        <section>
          <h2 className="mb-4 text-2xl font-bold">
            Fuel Consumption Report
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="min-w-full text-left">
              <thead className="border-b border-slate-800 text-sm text-slate-400">
                <tr>
                  <th className="px-5 py-4">Fuel</th>
                  <th className="px-5 py-4">Vehicle</th>
                  <th className="px-5 py-4">Driver</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Liters</th>
                  <th className="px-5 py-4">Cost</th>
                  <th className="px-5 py-4">Station</th>
                  <th className="px-5 py-4">Odometer</th>
                </tr>
              </thead>

              <tbody>
                {recentFuel.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-slate-800 last:border-0"
                  >
                    <td className="px-5 py-4 font-semibold">
                      {record.fuelCode}
                    </td>

                    <td className="px-5 py-4">
                      {record.vehicleCode}
                    </td>

                    <td className="px-5 py-4">
                      {record.driverCode}
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {formatDate(record.fuelDate)}
                    </td>

                    <td className="px-5 py-4">
                      {formatNumber(Number(record.liters || 0))} L
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {formatNumber(Number(record.cost || 0))}
                    </td>

                    <td className="px-5 py-4">
                      {record.fuelStation}
                    </td>

                    <td className="px-5 py-4">
                      {formatNumber(Number(record.odometer || 0))}
                    </td>
                  </tr>
                ))}

                {recentFuel.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      No fuel records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
