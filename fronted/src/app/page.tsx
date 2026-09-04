"use client";

import { useEffect, useMemo, useState } from "react";

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
  fuelUsed: string | number;
  revenue: string | number;
  status: string;
  cargo?: string;
  notes?: string | null;
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
      setLoading(true);
      setError("");

      const responses = await Promise.all([
        fetch(`${API_URL}/vehicles`),
        fetch(`${API_URL}/drivers`),
        fetch(`${API_URL}/trips`),
        fetch(`${API_URL}/fuel`),
        fetch(`${API_URL}/maintenance`),
        fetch(`${API_URL}/expenses`),
      ]);

      if (responses.some((response) => !response.ok)) {
        throw new Error("Failed to load dashboard data.");
      }

      const [
        vehiclesData,
        driversData,
        tripsData,
        fuelData,
        maintenanceData,
        expensesData,
      ] = await Promise.all(
        responses.map((response) => response.json()),
      );

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

  const formatNumber = (value: number) => {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    return String(date).substring(0, 10);
  };

  const getStatus = (value: string) => {
    return value?.toLowerCase().trim() || "";
  };

  const activeVehicles = vehicles.filter(
    (vehicle) => getStatus(vehicle.status) === "active",
  ).length;

  const maintenanceVehicles = vehicles.filter(
    (vehicle) => getStatus(vehicle.status) === "maintenance",
  ).length;

  const inactiveVehicles = vehicles.filter((vehicle) => {
    const status = getStatus(vehicle.status);

    return status === "inactive" || status === "retired";
  }).length;

  const activeTrips = trips.filter((trip) => {
    const status = getStatus(trip.status);

    return status === "in progress" || status === "active";
  }).length;

  const scheduledTrips = trips.filter((trip) => {
    const status = getStatus(trip.status);

    return status === "scheduled" || status === "planned";
  }).length;

  const completedTrips = trips.filter(
    (trip) => getStatus(trip.status) === "completed",
  ).length;

  const maintenanceDue = maintenance.filter((record) => {
    const status = getStatus(record.status);

    return status === "pending" || status === "in progress";
  }).length;

  const availableVehicles = Math.max(
    activeVehicles - activeTrips,
    0,
  );

  const totalDistance = trips.reduce(
    (total, trip) => total + Number(trip.distance || 0),
    0,
  );

  const totalFuelLiters = fuel.reduce(
    (total, record) => total + Number(record.liters || 0),
    0,
  );

  const totalFuelCost = fuel.reduce(
    (total, record) => total + Number(record.cost || 0),
    0,
  );

  const totalMaintenanceCost = maintenance.reduce(
    (total, record) => total + Number(record.cost || 0),
    0,
  );

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0,
  );

  const totalRevenue = trips.reduce(
    (total, trip) => total + Number(trip.revenue || 0),
    0,
  );

  const totalOperatingCost =
    totalFuelCost +
    totalMaintenanceCost +
    totalExpenses;

  const netOperatingResult =
    totalRevenue - totalOperatingCost;

  const fuelEfficiency =
    totalFuelLiters > 0
      ? totalDistance / totalFuelLiters
      : 0;

  const costPerKilometer =
    totalDistance > 0
      ? totalOperatingCost / totalDistance
      : 0;

  const fleetUtilization =
    activeVehicles > 0
      ? (activeTrips / activeVehicles) * 100
      : 0;

  const tripCompletionRate =
    trips.length > 0
      ? (completedTrips / trips.length) * 100
      : 0;

  const activeDrivers = drivers.filter(
    (driver) => getStatus(driver.status) === "active",
  ).length;

  const driverUtilization =
    activeDrivers > 0
      ? (activeTrips / activeDrivers) * 100
      : 0;

  const recentTrips = useMemo(() => {
    return [...trips]
      .sort(
        (a, b) =>
          new Date(b.tripDate).getTime() -
          new Date(a.tripDate).getTime(),
      )
      .slice(0, 5);
  }, [trips]);

  const recentMaintenance = useMemo(() => {
    return [...maintenance]
      .sort(
        (a, b) =>
          new Date(b.maintenanceDate).getTime() -
          new Date(a.maintenanceDate).getTime(),
      )
      .slice(0, 4);
  }, [maintenance]);

  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort(
        (a, b) =>
          new Date(b.expenseDate).getTime() -
          new Date(a.expenseDate).getTime(),
      )
      .slice(0, 4);
  }, [expenses]);

  const alerts = useMemo(() => {
    const results: {
      title: string;
      description: string;
      type: "warning" | "danger" | "info";
    }[] = [];

    if (maintenanceDue > 0) {
      results.push({
        title: "Maintenance attention required",
        description: `${maintenanceDue} maintenance record${
          maintenanceDue === 1 ? "" : "s"
        } require attention.`,
        type: "warning",
      });
    }

    if (inactiveVehicles > 0) {
      results.push({
        title: "Inactive vehicles",
        description: `${inactiveVehicles} vehicle${
          inactiveVehicles === 1 ? "" : "s"
        } currently inactive.`,
        type: "info",
      });
    }

    if (fleetUtilization > 90) {
      results.push({
        title: "High fleet utilization",
        description:
          "Most active vehicles are currently assigned to trips.",
        type: "warning",
      });
    }

    if (netOperatingResult < 0) {
      results.push({
        title: "Operating result is negative",
        description:
          "Current operating costs are higher than recorded trip revenue.",
        type: "danger",
      });
    }

    if (results.length === 0) {
      results.push({
        title: "Fleet operating normally",
        description:
          "No major operational alerts were detected.",
        type: "info",
      });
    }

    return results.slice(0, 4);
  }, [
    maintenanceDue,
    inactiveVehicles,
    fleetUtilization,
    netOperatingResult,
  ]);

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-blue-600">
              FLEETFLOW ERP
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Fleet Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Operational command center for vehicles, drivers,
              trips, fuel, maintenance, and financial performance.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </header>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* PRIMARY KPIs */}
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Vehicles
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {loading ? "..." : vehicles.length}
            </p>

            <p className="mt-2 text-sm text-green-600">
              {activeVehicles} active
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Active Drivers
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {loading ? "..." : activeDrivers}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {drivers.length} total drivers
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Active Trips
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {loading ? "..." : activeTrips}
            </p>

            <p className="mt-2 text-sm text-blue-600">
              {scheduledTrips} scheduled
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Maintenance Due
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {loading ? "..." : maintenanceDue}
            </p>

            <p className="mt-2 text-sm text-orange-600">
              Requires attention
            </p>
          </div>

        </section>

        {/* FINANCIAL KPIs */}
        <section className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Revenue
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              {loading ? "..." : formatNumber(totalRevenue)}
            </p>

            <p className="mt-2 text-sm text-green-600">
              From recorded trips
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Operating Cost
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              {loading
                ? "..."
                : formatNumber(totalOperatingCost)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Fuel + maintenance + expenses
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Net Operating Result
            </p>

            <p
              className={`mt-3 text-2xl font-bold ${
                netOperatingResult >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {loading
                ? "..."
                : formatNumber(netOperatingResult)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Revenue minus operating costs
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Cost / Kilometer
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              {loading
                ? "..."
                : formatNumber(costPerKilometer)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Based on recorded distance
            </p>
          </div>

        </section>

        {/* PERFORMANCE METRICS */}
        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Fleet Utilization
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {loading
                    ? "..."
                    : `${formatNumber(fleetUtilization)}%`}
                </p>
              </div>

              <span className="text-2xl">🚛</span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: `${Math.min(fleetUtilization, 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Trip Completion
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {loading
                    ? "..."
                    : `${formatNumber(tripCompletionRate)}%`}
                </p>
              </div>

              <span className="text-2xl">✓</span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-green-600"
                style={{
                  width: `${Math.min(tripCompletionRate, 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Fuel Efficiency
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {loading
                    ? "..."
                    : `${formatNumber(fuelEfficiency)} km/L`}
                </p>
              </div>

              <span className="text-2xl">⛽</span>
            </div>

            <p className="mt-5 text-xs text-slate-400">
              Distance ÷ fuel consumed
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Distance
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {loading
                    ? "..."
                    : `${formatNumber(totalDistance)} km`}
                </p>
              </div>

              <span className="text-2xl">🛣️</span>
            </div>

            <p className="mt-5 text-xs text-slate-400">
              Recorded trip distance
            </p>
          </div>

        </section>

        {/* ALERTS + FLEET STATUS */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* SMART ALERTS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Operational Alerts
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Automatic indicators based on current system data.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {alerts.map((alert, index) => {
                const styles =
                  alert.type === "danger"
                    ? "border-red-200 bg-red-50"
                    : alert.type === "warning"
                      ? "border-orange-200 bg-orange-50"
                      : "border-blue-200 bg-blue-50";

                const titleColor =
                  alert.type === "danger"
                    ? "text-red-800"
                    : alert.type === "warning"
                      ? "text-orange-800"
                      : "text-blue-800";

                const descriptionColor =
                  alert.type === "danger"
                    ? "text-red-600"
                    : alert.type === "warning"
                      ? "text-orange-600"
                      : "text-blue-600";

                return (
                  <div
                    key={`${alert.title}-${index}`}
                    className={`rounded-xl border p-4 ${styles}`}
                  >
                    <p className={`font-semibold ${titleColor}`}>
                      {alert.title}
                    </p>

                    <p
                      className={`mt-1 text-sm ${descriptionColor}`}
                    >
                      {alert.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FLEET STATUS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Fleet Status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current vehicle distribution.
            </p>

            <div className="mt-7 space-y-6">

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    Available
                  </span>

                  <span className="font-semibold text-green-600">
                    {loading ? "..." : availableVehicles}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: `${
                        vehicles.length > 0
                          ? Math.min(
                              (availableVehicles /
                                vehicles.length) *
                                100,
                              100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    On Trip
                  </span>

                  <span className="font-semibold text-blue-600">
                    {loading ? "..." : activeTrips}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{
                      width: `${
                        vehicles.length > 0
                          ? Math.min(
                              (activeTrips /
                                vehicles.length) *
                                100,
                              100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    Maintenance
                  </span>

                  <span className="font-semibold text-orange-600">
                    {loading ? "..." : maintenanceVehicles}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{
                      width: `${
                        vehicles.length > 0
                          ? Math.min(
                              (maintenanceVehicles /
                                vehicles.length) *
                                100,
                              100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    Inactive
                  </span>

                  <span className="font-semibold text-slate-500">
                    {loading ? "..." : inactiveVehicles}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-400"
                    style={{
                      width: `${
                        vehicles.length > 0
                          ? Math.min(
                              (inactiveVehicles /
                                vehicles.length) *
                                100,
                              100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

            </div>
          </div>

        </section>

        {/* TRIP SUMMARY */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Trip Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current trip activity across the fleet.
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Total Trips
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {loading ? "..." : trips.length}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-5">
              <p className="text-sm text-blue-600">
                In Progress
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-700">
                {loading ? "..." : activeTrips}
              </p>
            </div>

            <div className="rounded-xl bg-orange-50 p-5">
              <p className="text-sm text-orange-600">
                Scheduled
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-700">
                {loading ? "..." : scheduledTrips}
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-5">
              <p className="text-sm text-green-600">
                Completed
              </p>

              <p className="mt-2 text-2xl font-bold text-green-700">
                {loading ? "..." : completedTrips}
              </p>
            </div>

          </div>
        </section>

        {/* RECENT TRIPS */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

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
                  <th className="px-6 py-4">Trip</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Driver</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Revenue</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      Loading trips...
                    </td>
                  </tr>
                ) : recentTrips.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      No trips found.
                    </td>
                  </tr>
                ) : (
                  recentTrips.map((trip) => (
                    <tr
                      key={trip.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">
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

                      <td className="px-6 py-4 font-medium text-slate-900">
                        {formatNumber(Number(trip.revenue || 0))}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            getStatus(trip.status) === "completed"
                              ? "bg-green-100 text-green-700"
                              : getStatus(trip.status) ===
                                    "in progress" ||
                                  getStatus(trip.status) === "active"
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
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
              Recent Maintenance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest maintenance activity.
            </p>

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
                        getStatus(record.status) === "completed"
                          ? "bg-green-100 text-green-700"
                          : getStatus(record.status) ===
                              "in progress"
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
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
              Recent Expenses
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest operational expenses.
            </p>

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

                    <p className="whitespace-nowrap font-semibold text-slate-900">
                      {formatNumber(Number(expense.amount || 0))}
                    </p>
                  </div>
                ))
              )}

            </div>
          </div>

        </section>

        {/* COST BREAKDOWN */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Operating Cost Breakdown
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Where FleetFlow is currently spending money.
            </p>
          </div>

          <div className="mt-6 space-y-5">

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Fuel
                </span>

                <span className="font-medium text-slate-900">
                  {formatNumber(totalFuelCost)}
                </span>
              </div>

              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${
                      totalOperatingCost > 0
                        ? (totalFuelCost /
                            totalOperatingCost) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Maintenance
                </span>

                <span className="font-medium text-slate-900">
                  {formatNumber(totalMaintenanceCost)}
                </span>
              </div>

              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{
                    width: `${
                      totalOperatingCost > 0
                        ? (totalMaintenanceCost /
                            totalOperatingCost) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Other Expenses
                </span>

                <span className="font-medium text-slate-900">
                  {formatNumber(totalExpenses)}
                </span>
              </div>

              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-500"
                  style={{
                    width: `${
                      totalOperatingCost > 0
                        ? (totalExpenses /
                            totalOperatingCost) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

          </div>
        </section>

        {/* FOOTER SUMMARY */}
        <section className="mt-8 mb-4 rounded-2xl bg-slate-900 p-6 text-white">

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            <div>
              <p className="text-sm text-slate-400">
                Fuel Records
              </p>

              <p className="mt-1 text-xl font-semibold">
                {loading ? "..." : fuel.length}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Fuel Consumed
              </p>

              <p className="mt-1 text-xl font-semibold">
                {loading
                  ? "..."
                  : `${formatNumber(totalFuelLiters)} L`}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Driver Utilization
              </p>

              <p className="mt-1 text-xl font-semibold">
                {loading
                  ? "..."
                  : `${formatNumber(driverUtilization)}%`}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Maintenance Records
              </p>

              <p className="mt-1 text-xl font-semibold">
                {loading ? "..." : maintenance.length}
              </p>
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}
