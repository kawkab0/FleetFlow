"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedPage from "@/components/ProtectedPage";

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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        vehiclesData,
        driversData,
        tripsData,
        fuelData,
        maintenanceData,
        expensesData,
      ] = await Promise.all([
        apiFetch("/vehicles"),
        apiFetch("/drivers"),
        apiFetch("/trips"),
        apiFetch("/fuel"),
        apiFetch("/maintenance"),
        apiFetch("/expenses"),
      ]);

      setVehicles(vehiclesData);
      setDrivers(driversData);
      setTrips(tripsData);
      setFuel(fuelData);
      setMaintenance(maintenanceData);
      setExpenses(expensesData);
    } catch (err) {
      console.error("Dashboard error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to load dashboard data. Make sure the backend is running on port 3001.",
        );
      }
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

  const formatMoney = (value: number) => {
    return `${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ETB`;
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

  const availableVehicles = Math.max(activeVehicles - activeTrips, 0);

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
    totalFuelCost + totalMaintenanceCost + totalExpenses;

  const netOperatingResult = totalRevenue - totalOperatingCost;

  const fuelEfficiency =
    totalFuelLiters > 0 ? totalDistance / totalFuelLiters : 0;

  const costPerKilometer =
    totalDistance > 0 ? totalOperatingCost / totalDistance : 0;

  const fleetUtilization =
    activeVehicles > 0 ? (activeTrips / activeVehicles) * 100 : 0;

  const tripCompletionRate =
    trips.length > 0 ? (completedTrips / trips.length) * 100 : 0;

  const activeDrivers = drivers.filter(
    (driver) => getStatus(driver.status) === "active",
  ).length;

  const driverUtilization =
    activeDrivers > 0 ? (activeTrips / activeDrivers) * 100 : 0;

  const revenueMargin =
    totalRevenue > 0 ? (netOperatingResult / totalRevenue) * 100 : 0;

  /*
   * EXECUTIVE COMMAND CENTER
   */

  const fleetHealthScore = useMemo(() => {
    let score = 100;

    if (netOperatingResult < 0) score -= 25;

    if (fleetUtilization > 90) score -= 10;

    if (fleetUtilization < 25 && activeVehicles > 0) score -= 10;

    if (maintenanceDue > 0) {
      score -= Math.min(maintenanceDue * 5, 20);
    }

    if (fuelEfficiency > 0 && fuelEfficiency < 4) {
      score -= 10;
    }

    if (inactiveVehicles > 0) {
      score -= Math.min(inactiveVehicles * 3, 10);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }, [
    netOperatingResult,
    fleetUtilization,
    activeVehicles,
    maintenanceDue,
    fuelEfficiency,
    inactiveVehicles,
  ]);

  const priorityActions = useMemo(() => {
    const actions: {
      title: string;
      description: string;
      href: string;
      priority: "Critical" | "High" | "Medium";
    }[] = [];

    if (netOperatingResult < 0) {
      actions.push({
        title: "Review fleet profitability",
        description:
          "Operating costs currently exceed recorded trip revenue.",
        href: "/profitability",
        priority: "Critical",
      });
    }

    if (maintenanceDue > 0) {
      actions.push({
        title: "Review maintenance workload",
        description: `${maintenanceDue} maintenance record${
          maintenanceDue === 1 ? "" : "s"
        } require attention.`,
        href: "/maintenance-intelligence",
        priority: "High",
      });
    }

    if (fuelEfficiency > 0 && fuelEfficiency < 4) {
      actions.push({
        title: "Investigate fuel efficiency",
        description:
          "Fleet fuel efficiency is below the dashboard benchmark.",
        href: "/fuel-intelligence",
        priority: "High",
      });
    }

    if (inactiveVehicles > 0) {
      actions.push({
        title: "Review inactive vehicles",
        description: `${inactiveVehicles} vehicle${
          inactiveVehicles === 1 ? "" : "s"
        } currently inactive.`,
        href: "/intelligence",
        priority: "Medium",
      });
    }

    if (actions.length === 0) {
      actions.push({
        title: "Fleet operating normally",
        description:
          "No critical decision actions were detected from current data.",
        href: "/recommendations",
        priority: "Medium",
      });
    }

    return actions.slice(0, 4);
  }, [
    netOperatingResult,
    maintenanceDue,
    fuelEfficiency,
    inactiveVehicles,
  ]);

  const healthLabel =
    fleetHealthScore >= 80
      ? "Healthy"
      : fleetHealthScore >= 60
        ? "Needs Attention"
        : "At Risk";

  const healthColor =
    fleetHealthScore >= 80
      ? "text-green-600"
      : fleetHealthScore >= 60
        ? "text-orange-600"
        : "text-red-600";

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
      type: "warning" | "danger" | "info" | "success";
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
        type: "success",
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
    <ProtectedPage permission="dashboard">
      <main className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}
          <header className="mb-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold tracking-wider text-blue-700">
                    FLEETFLOW ERP
                  </span>

                  <span className="text-xs font-medium text-slate-400">
                    Executive Overview
                  </span>
                </div>

                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Fleet Dashboard
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  Monitor fleet operations, financial performance,
                  utilization, maintenance, and logistics activity
                  from one command center.
                </p>
              </div>

              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>
          </header>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">Dashboard error</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {/* COMMAND CENTER */}
          <section className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                Executive Command Center
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Decision signals generated from current FleetFlow
                operational and financial data.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">

              {/* FLEET HEALTH */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Fleet Health
                    </p>

                    <p
                      className={`mt-2 text-3xl font-bold ${healthColor}`}
                    >
                      {loading ? "..." : `${fleetHealthScore}/100`}
                    </p>
                  </div>

                  <span
                    className={`rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold ${healthColor}`}
                  >
                    {loading ? "..." : healthLabel}
                  </span>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      fleetHealthScore >= 80
                        ? "bg-green-500"
                        : fleetHealthScore >= 60
                          ? "bg-orange-500"
                          : "bg-red-500"
                    }`}
                    style={{
                      width: `${fleetHealthScore}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Combined operational health indicator.
                </p>
              </div>

              {/* OPERATIONS SIGNAL */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Operations Signal
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {loading
                        ? "..."
                        : `${formatNumber(fleetUtilization)}%`}
                    </p>
                  </div>

                  <span className="rounded-xl bg-blue-50 px-3 py-2 text-lg text-blue-600">
                    ↗
                  </span>
                </div>

                <p className="mt-4 text-sm text-slate-600">
                  Fleet utilization
                </p>

                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="font-semibold text-green-600">
                    {availableVehicles}
                  </span>

                  <span className="text-slate-400">
                    available
                  </span>

                  <span className="mx-1 text-slate-300">
                    •
                  </span>

                  <span className="font-semibold text-blue-600">
                    {activeTrips}
                  </span>

                  <span className="text-slate-400">
                    on trip
                  </span>
                </div>
              </div>

              {/* FINANCIAL SIGNAL */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Financial Signal
                    </p>

                    <p
                      className={`mt-2 text-3xl font-bold ${
                        netOperatingResult >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {loading
                        ? "..."
                        : netOperatingResult >= 0
                          ? "Positive"
                          : "Negative"}
                    </p>
                  </div>

                  <span
                    className={`rounded-xl px-3 py-2 text-lg ${
                      netOperatingResult >= 0
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {netOperatingResult >= 0 ? "↑" : "↓"}
                  </span>
                </div>

                <p className="mt-4 text-sm text-slate-600">
                  Operating margin
                </p>

                <p
                  className={`mt-1 text-sm font-semibold ${
                    revenueMargin >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {loading
                    ? "..."
                    : `${formatNumber(revenueMargin)}%`}
                </p>
              </div>
            </div>
          </section>

          {/* PRIORITY ACTIONS */}
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Priority Actions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Recommended areas requiring management attention.
                </p>
              </div>

              <a
                href="/recommendations"
                className="text-sm font-semibold text-blue-600 transition hover:text-blue-800"
              >
                View all recommendations →
              </a>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {priorityActions.map((action, index) => {
                const priorityStyle =
                  action.priority === "Critical"
                    ? "border-red-200 bg-red-50"
                    : action.priority === "High"
                      ? "border-orange-200 bg-orange-50"
                      : "border-blue-200 bg-blue-50";

                const priorityText =
                  action.priority === "Critical"
                    ? "text-red-700"
                    : action.priority === "High"
                      ? "text-orange-700"
                      : "text-blue-700";

                return (
                  <a
                    key={`${action.title}-${index}`}
                    href={action.href}
                    className={`rounded-xl border p-5 transition hover:-translate-y-0.5 hover:shadow-sm ${priorityStyle}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {action.title}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {action.description}
                        </p>
                      </div>

                      <span
                        className={`whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[11px] font-bold ${priorityText}`}
                      >
                        {action.priority}
                      </span>
                    </div>

                    <p
                      className={`mt-4 text-xs font-semibold ${priorityText}`}
                    >
                      Open analysis →
                    </p>
                  </a>
                );
              })}
            </div>
          </section>

          {/* QUICK INTELLIGENCE LINKS */}
          <section className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Intelligence Center
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Jump directly into FleetFlow's decision-support modules.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Fleet Intelligence",
                  description:
                    "Vehicle health, risk and utilization.",
                  href: "/intelligence",
                },
                {
                  title: "Fuel Intelligence",
                  description:
                    "Fuel cost and efficiency analysis.",
                  href: "/fuel-intelligence",
                },
                {
                  title: "Maintenance Intelligence",
                  description:
                    "Maintenance workload and risk.",
                  href: "/maintenance-intelligence",
                },
                {
                  title: "Profitability",
                  description:
                    "Vehicle and fleet profitability.",
                  href: "/profitability",
                },
              ].map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <p className="font-semibold text-slate-900">
                    {item.title}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>

                  <p className="mt-4 text-xs font-bold text-blue-600">
                    Open module →
                  </p>
                </a>
              ))}
            </div>
          </section>

          {/* EXECUTIVE KPI CARDS */}
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Revenue
                  </p>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {loading ? "..." : formatMoney(totalRevenue)}
                  </p>
                </div>

                <span className="rounded-xl bg-green-50 px-3 py-2 text-lg text-green-600">
                  $
                </span>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Revenue from recorded trips
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Operating Cost
                  </p>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {loading
                      ? "..."
                      : formatMoney(totalOperatingCost)}
                  </p>
                </div>

                <span className="rounded-xl bg-orange-50 px-3 py-2 text-lg text-orange-600">
                  ↓
                </span>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Fuel + maintenance + expenses
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
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
                      : formatMoney(netOperatingResult)}
                  </p>
                </div>

                <span
                  className={`rounded-xl px-3 py-2 text-lg ${
                    netOperatingResult >= 0
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {netOperatingResult >= 0 ? "↑" : "!"}
                </span>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Revenue minus operating costs
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Fleet Utilization
                  </p>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {loading
                      ? "..."
                      : `${formatNumber(fleetUtilization)}%`}
                  </p>
                </div>

                <span className="rounded-xl bg-blue-50 px-3 py-2 text-lg text-blue-600">
                  %
                </span>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Active vehicles currently on trips
              </p>
            </div>
          </section>

          {/* OPERATIONS OVERVIEW */}
          <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Vehicles
              </p>

              <div className="mt-2 flex items-end justify-between">
                <p className="text-3xl font-bold text-slate-900">
                  {loading ? "..." : vehicles.length}
                </p>

                <span className="text-sm font-semibold text-green-600">
                  {activeVehicles} active
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Drivers
              </p>

              <div className="mt-2 flex items-end justify-between">
                <p className="text-3xl font-bold text-slate-900">
                  {loading ? "..." : drivers.length}
                </p>

                <span className="text-sm font-semibold text-blue-600">
                  {activeDrivers} active
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Active Trips
              </p>

              <div className="mt-2 flex items-end justify-between">
                <p className="text-3xl font-bold text-slate-900">
                  {loading ? "..." : activeTrips}
                </p>

                <span className="text-sm font-semibold text-orange-600">
                  {scheduledTrips} scheduled
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Maintenance
              </p>

              <div className="mt-2 flex items-end justify-between">
                <p className="text-3xl font-bold text-slate-900">
                  {loading ? "..." : maintenanceDue}
                </p>

                <span className="text-sm font-semibold text-orange-600">
                  attention
                </span>
              </div>
            </div>

          </section>

          {/* PERFORMANCE */}
          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                Performance Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Key operational efficiency indicators.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Trip Completion
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {loading
                    ? "..."
                    : `${formatNumber(tripCompletionRate)}%`}
                </p>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{
                      width: `${Math.min(
                        tripCompletionRate,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Fuel Efficiency
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {loading
                    ? "..."
                    : `${formatNumber(fuelEfficiency)} km/L`}
                </p>

                <p className="mt-5 text-xs text-slate-400">
                  Distance ÷ fuel consumed
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Cost / Kilometer
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {loading
                    ? "..."
                    : `${formatMoney(costPerKilometer)}/km`}
                </p>

                <p className="mt-5 text-xs text-slate-400">
                  Operating cost per recorded km
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Operating Margin
                </p>

                <p
                  className={`mt-3 text-3xl font-bold ${
                    revenueMargin >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {loading
                    ? "..."
                    : `${formatNumber(revenueMargin)}%`}
                </p>

                <p className="mt-5 text-xs text-slate-400">
                  Net result ÷ revenue
                </p>
              </div>

            </div>
          </section>

          {/* ALERTS + FLEET STATUS */}
          <section className="mt-8 grid gap-6 lg:grid-cols-2">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Operational Alerts
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Automatic indicators based on current system data.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {alerts.map((alert, index) => {
                  const styles =
                    alert.type === "danger"
                      ? "border-red-200 bg-red-50"
                      : alert.type === "warning"
                        ? "border-orange-200 bg-orange-50"
                        : alert.type === "success"
                          ? "border-green-200 bg-green-50"
                          : "border-blue-200 bg-blue-50";

                  const titleColor =
                    alert.type === "danger"
                      ? "text-red-800"
                      : alert.type === "warning"
                        ? "text-orange-800"
                        : alert.type === "success"
                          ? "text-green-800"
                          : "text-blue-800";

                  const descriptionColor =
                    alert.type === "danger"
                      ? "text-red-600"
                      : alert.type === "warning"
                        ? "text-orange-600"
                        : alert.type === "success"
                          ? "text-green-600"
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

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Fleet Status
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current distribution of the vehicle fleet.
                </p>
              </div>

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

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
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

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
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

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
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

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
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

          {/* FINANCIAL PERFORMANCE */}
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Financial Performance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Revenue and operating cost relationship.
              </p>
            </div>

            <div className="mt-7 grid gap-8 lg:grid-cols-2">

              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Revenue
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {loading
                        ? "..."
                        : formatMoney(totalRevenue)}
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-green-600">
                    100%
                  </span>
                </div>

                <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: "100%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Operating Cost
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {loading
                        ? "..."
                        : formatMoney(totalOperatingCost)}
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-orange-600">
                    {totalRevenue > 0
                      ? `${formatNumber(
                          (totalOperatingCost /
                            totalRevenue) *
                            100,
                        )}%`
                      : "0%"}
                  </span>
                </div>

                <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{
                      width: `${
                        totalRevenue > 0
                          ? Math.min(
                              (totalOperatingCost /
                                totalRevenue) *
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

            <div className="mt-8 grid gap-4 sm:grid-cols-3">

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Fuel Cost
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900">
                  {loading ? "..." : formatMoney(totalFuelCost)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Maintenance Cost
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900">
                  {loading
                    ? "..."
                    : formatMoney(totalMaintenanceCost)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Other Expenses
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900">
                  {loading ? "..." : formatMoney(totalExpenses)}
                </p>
              </div>

            </div>

            <div className="mt-7 space-y-4">

              <div>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="font-medium text-slate-500">
                    Fuel
                  </span>

                  <span className="font-semibold text-slate-700">
                    {totalOperatingCost > 0
                      ? `${formatNumber(
                          (totalFuelCost /
                            totalOperatingCost) *
                            100,
                        )}%`
                      : "0%"}
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
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
                <div className="mb-2 flex justify-between text-xs">
                  <span className="font-medium text-slate-500">
                    Maintenance
                  </span>

                  <span className="font-semibold text-slate-700">
                    {totalOperatingCost > 0
                      ? `${formatNumber(
                          (totalMaintenanceCost /
                            totalOperatingCost) *
                            100,
                        )}%`
                      : "0%"}
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
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
                <div className="mb-2 flex justify-between text-xs">
                  <span className="font-medium text-slate-500">
                    Other Expenses
                  </span>

                  <span className="font-semibold text-slate-700">
                    {totalOperatingCost > 0
                      ? `${formatNumber(
                          (totalExpenses /
                            totalOperatingCost) *
                            100,
                        )}%`
                      : "0%"}
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
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

          {/* TRIP PERFORMANCE */}
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Trip Performance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current logistics activity across the fleet.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

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

            <div className="mt-6 rounded-xl bg-slate-50 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Completion rate
                </span>

                <span className="text-sm font-bold text-slate-900">
                  {loading
                    ? "..."
                    : `${formatNumber(
                        tripCompletionRate,
                      )}%`}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{
                    width: `${Math.min(
                      tripCompletionRate,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          </section>

          {/* RECENT TRIPS */}
          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900">
                Recent Trips
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest trips recorded in FleetFlow.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
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

                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {formatMoney(
                            Number(trip.revenue || 0),
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              getStatus(trip.status) ===
                              "completed"
                                ? "bg-green-100 text-green-700"
                                : getStatus(trip.status) ===
                                      "in progress" ||
                                    getStatus(trip.status) ===
                                      "active"
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
              <h2 className="text-lg font-bold text-slate-900">
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
                      className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
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
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          getStatus(record.status) ===
                          "completed"
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
              <h2 className="text-lg font-bold text-slate-900">
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
                      className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
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
                        {formatMoney(
                          Number(expense.amount || 0),
                        )}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </section>

          {/* FOOTER SUMMARY */}
          <section className="mt-8 mb-4 overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                FleetFlow Snapshot
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                Operational Summary
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

              <div>
                <p className="text-sm text-slate-400">
                  Total Distance
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {loading
                    ? "..."
                    : `${formatNumber(totalDistance)} km`}
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
    </ProtectedPage>
  );
}
