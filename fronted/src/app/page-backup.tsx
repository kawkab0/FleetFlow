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

           {loading
            /* EXECUTIVE KPI CARDS */}
<section className="mt-8">
  <div className="mb-4 flex flex-col gap-1">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
      Executive KPIs
    </p>

    <h2 className="text-xl font-bold tracking-tight text-slate-900">
      Financial & Fleet Performance
    </h2>

    <p className="text-sm text-slate-500">
      The most important numbers from your current FleetFlow operations.
    </p>
  </div>

  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {/* TOTAL REVENUE */}
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Total Revenue
          </p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {formatMoney(totalRevenue)}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Revenue generated from completed operations
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg">
          💰
        </div>
      </div>
    </div>

    {/* OPERATING COST */}
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-orange-500" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Operating Cost
          </p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {formatMoney(totalOperatingCost)}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Fuel, maintenance and operating expenses
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg">
          💸
        </div>
      </div>
    </div>

    {/* NET OPERATING RESULT */}
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          netOperatingResult >= 0
            ? "bg-blue-500"
            : "bg-red-500"
        }`}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Net Operating Result
          </p>

          <p
            className={`mt-3 text-2xl font-bold tracking-tight ${
              netOperatingResult >= 0
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {formatMoney(netOperatingResult)}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {revenueMargin.toFixed(1)}% operating margin
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${
            netOperatingResult >= 0
              ? "bg-emerald-50"
              : "bg-red-50"
          }`}
        >
          {netOperatingResult >= 0 ? "📈" : "📉"}
        </div>
      </div>
    </div>

    {/* FLEET UTILIZATION */}
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-blue-500" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Fleet Utilization
          </p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {fleetUtilization.toFixed(1)}%
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {activeVehicles} active vehicles in operation
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
          🚚
        </div>
      </div>
    </div>
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
