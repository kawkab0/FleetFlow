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
<section className="mt-8">
  <div className="mb-4 flex flex-col gap-1">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
      Operations
    </p>

    <h2 className="text-xl font-bold tracking-tight text-slate-900">
      Fleet Operations Overview
    </h2>

    <p className="text-sm text-slate-500">
      Current fleet, driver, trip, and maintenance activity.
    </p>
  </div>

  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {/* VEHICLES */}
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-blue-500" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Vehicles
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {loading ? "..." : vehicles.length}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Total vehicles in fleet
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
          🚚
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs font-medium text-slate-400">
          Active
        </span>

        <span className="text-sm font-bold text-blue-600">
          {activeVehicles}
        </span>
      </div>
    </div>

    {/* DRIVERS */}
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-indigo-500" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Drivers
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {loading ? "..." : drivers.length}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Registered fleet drivers
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
          👤
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs font-medium text-slate-400">
          Active
        </span>

        <span className="text-sm font-bold text-indigo-600">
          {activeDrivers}
        </span>
      </div>
    </div>

    {/* ACTIVE TRIPS */}
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-cyan-500" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Active Trips
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {loading ? "..." : activeTrips}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Trips currently in progress
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-lg">
          🛣️
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs font-medium text-slate-400">
          Scheduled
        </span>

        <span className="text-sm font-bold text-cyan-600">
          {scheduledTrips}
        </span>
      </div>
    </div>

    {/* MAINTENANCE */}
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-orange-500" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Maintenance
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {loading ? "..." : maintenanceDue}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Vehicles requiring attention
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-lg">
          🔧
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs font-medium text-slate-400">
          In maintenance
        </span>

        <span className="text-sm font-bold text-orange-600">
          {maintenanceVehicles}
        </span>
      </div>
    </div>
  </div>
</section>

        {/* PERFORMANCE */}
<section className="mt-8">
  <div className="mb-4 flex flex-col gap-1">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
      Efficiency
    </p>

    <h2 className="text-xl font-bold tracking-tight text-slate-900">
      Performance Overview
    </h2>

    <p className="text-sm text-slate-500">
      Key indicators showing how efficiently FleetFlow is operating.
    </p>
  </div>

  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {/* TRIP COMPLETION */}
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Trip Completion
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {loading
              ? "..."
              : `${formatNumber(tripCompletionRate)}%`}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg">
          ✓
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-400">
            Completion rate
          </span>

          <span className="font-semibold text-emerald-600">
            {loading
              ? "..."
              : `${formatNumber(tripCompletionRate)}%`}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{
              width: `${Math.min(
                Math.max(tripCompletionRate, 0),
                100,
              )}%`,
            }}
          />
        </div>
      </div>
    </div>

    {/* FUEL EFFICIENCY */}
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-cyan-500" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Fuel Efficiency
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {loading
              ? "..."
              : `${formatNumber(fuelEfficiency)} km/L`}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-lg">
          ⛽
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs font-medium text-slate-400">
          Distance traveled per liter consumed
        </p>
      </div>
    </div>

    {/* COST PER KILOMETER */}
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-orange-500" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Cost / Kilometer
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {loading
              ? "..."
              : `${formatMoney(costPerKilometer)}/km`}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg">
          📊
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs font-medium text-slate-400">
          Operating cost per recorded kilometer
        </p>
      </div>
    </div>

    {/* OPERATING MARGIN */}
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          revenueMargin >= 0
            ? "bg-blue-500"
            : "bg-red-500"
        }`}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Operating Margin
          </p>

          <p
            className={`mt-3 text-3xl font-bold tracking-tight ${
              revenueMargin >= 0
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {loading
              ? "..."
              : `${formatNumber(revenueMargin)}%`}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${
            revenueMargin >= 0
              ? "bg-emerald-50"
              : "bg-red-50"
          }`}
        >
          {revenueMargin >= 0 ? "📈" : "📉"}
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs font-medium text-slate-400">
          Net operating result ÷ total revenue
        </p>
      </div>
    </div>
  </div>
</section>

         {/* ALERTS + FLEET STATUS */}
<section className="mt-8 grid gap-6 lg:grid-cols-2">
  {/* OPERATIONAL ALERTS */}
  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="absolute inset-x-0 top-0 h-1 bg-red-500" />

    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-500">
          Attention
        </p>

        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
          Operational Alerts
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Automatic indicators based on current system data.
        </p>
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-lg">
        ⚠️
      </div>
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

        const icon =
          alert.type === "danger"
            ? "!"
            : alert.type === "warning"
              ? "!"
              : alert.type === "success"
                ? "✓"
                : "i";

        return (
          <div
            key={`${alert.title}-${index}`}
            className={`flex items-start gap-3 rounded-xl border p-4 ${styles}`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold shadow-sm ${titleColor}`}
            >
              {icon}
            </div>

            <div className="min-w-0">
              <p className={`font-semibold ${titleColor}`}>
                {alert.title}
              </p>

              <p
                className={`mt-1 text-sm leading-5 ${descriptionColor}`}
              >
                {alert.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>

  {/* FLEET STATUS */}
  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500" />

    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">
          Fleet
        </p>

        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
          Fleet Status
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Current distribution of the vehicle fleet.
        </p>
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
        🚚
      </div>
    </div>

    <div className="mt-7 space-y-6">
      {/* AVAILABLE */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />

            <span className="text-sm font-medium text-slate-600">
              Available
            </span>
          </div>

          <span className="text-sm font-bold text-green-600">
            {loading ? "..." : availableVehicles}
          </span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
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

      {/* ON TRIP */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />

            <span className="text-sm font-medium text-slate-600">
              On Trip
            </span>
          </div>

          <span className="text-sm font-bold text-blue-600">
            {loading ? "..." : activeTrips}
          </span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
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

      {/* MAINTENANCE */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-orange-500" />

            <span className="text-sm font-medium text-slate-600">
              Maintenance
            </span>
          </div>

          <span className="text-sm font-bold text-orange-600">
            {loading ? "..." : maintenanceVehicles}
          </span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-500"
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

      {/* INACTIVE */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-400" />

            <span className="text-sm font-medium text-slate-600">
              Inactive
            </span>
          </div>

          <span className="text-sm font-bold text-slate-500">
            {loading ? "..." : inactiveVehicles}
          </span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-400 transition-all duration-500"
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
<section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div className="border-b border-slate-100 px-6 py-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
          Finance
        </p>

        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
          Financial Performance
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Revenue, operating costs, and the current cost structure of the fleet.
        </p>
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg">
        💰
      </div>
    </div>
  </div>

  <div className="p-6">
    {/* REVENUE VS COST */}
    <div className="grid gap-5 lg:grid-cols-2">
      {/* REVENUE */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Revenue
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {loading
                ? "..."
                : formatMoney(totalRevenue)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Total recorded revenue
            </p>
          </div>

          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            100%
          </span>
        </div>

        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* OPERATING COST */}
      <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Operating Cost
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {loading
                ? "..."
                : formatMoney(totalOperatingCost)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Total cost relative to revenue
            </p>
          </div>

          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
            {totalRevenue > 0
              ? `${formatNumber(
                  (totalOperatingCost /
                    totalRevenue) *
                    100,
                )}%`
              : "0%"}
          </span>
        </div>

        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-500"
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

    {/* COST BREAKDOWN */}
    <div className="mt-6">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">
          Operating Cost Breakdown
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          How current operating costs are distributed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* FUEL */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

              <p className="text-sm font-semibold text-slate-600">
                Fuel Cost
              </p>
            </div>

            <span className="text-xs font-bold text-blue-600">
              {totalOperatingCost > 0
                ? `${formatNumber(
                    (totalFuelCost /
                      totalOperatingCost) *
                      100,
                  )}%`
                : "0%"}
            </span>
          </div>

          <p className="mt-3 text-xl font-bold text-slate-900">
            {loading
              ? "..."
              : formatMoney(totalFuelCost)}
          </p>
        </div>

        {/* MAINTENANCE */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />

              <p className="text-sm font-semibold text-slate-600">
                Maintenance
              </p>
            </div>

            <span className="text-xs font-bold text-orange-600">
              {totalOperatingCost > 0
                ? `${formatNumber(
                    (totalMaintenanceCost /
                      totalOperatingCost) *
                      100,
                  )}%`
                : "0%"}
            </span>
          </div>

          <p className="mt-3 text-xl font-bold text-slate-900">
            {loading
              ? "..."
              : formatMoney(totalMaintenanceCost)}
          </p>
        </div>

        {/* OTHER EXPENSES */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />

              <p className="text-sm font-semibold text-slate-600">
                Other Expenses
              </p>
            </div>

            <span className="text-xs font-bold text-slate-600">
              {totalOperatingCost > 0
                ? `${formatNumber(
                    (totalExpenses /
                      totalOperatingCost) *
                      100,
                  )}%`
                : "0%"}
            </span>
          </div>

          <p className="mt-3 text-xl font-bold text-slate-900">
            {loading
              ? "..."
              : formatMoney(totalExpenses)}
          </p>
        </div>
      </div>
    </div>

    {/* COST MIX */}
    <div className="mt-7">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600">
          Cost Mix
        </p>

        <p className="text-xs text-slate-400">
          Share of operating cost
        </p>
      </div>

      <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="bg-blue-500 transition-all duration-500"
          style={{
            width: `${
              totalOperatingCost > 0
                ? Math.min(
                    (totalFuelCost /
                      totalOperatingCost) *
                      100,
                    100,
                  )
                : 0
            }%`,
          }}
        />

        <div
          className="bg-orange-500 transition-all duration-500"
          style={{
            width: `${
              totalOperatingCost > 0
                ? Math.min(
                    (totalMaintenanceCost /
                      totalOperatingCost) *
                      100,
                    100,
                  )
                : 0
            }%`,
          }}
        />

        <div
          className="bg-slate-500 transition-all duration-500"
          style={{
            width: `${
              totalOperatingCost > 0
                ? Math.min(
                    (totalExpenses /
                      totalOperatingCost) *
                      100,
                    100,
                  )
                : 0
            }%`,
          }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Fuel
        </span>

        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          Maintenance
        </span>

        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-slate-500" />
          Other Expenses
        </span>
      </div>
    </div>
  </div>
</section>

        {/* TRIP PERFORMANCE */}
<section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div className="border-b border-slate-100 px-6 py-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
          Logistics
        </p>

        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
          Trip Performance
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Current logistics activity and trip completion across the fleet.
        </p>
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
        🛣️
      </div>
    </div>
  </div>

  <div className="p-6">
    {/* TRIP KPI CARDS */}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* TOTAL TRIPS */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-slate-400" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Total Trips
            </p>

            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {loading ? "..." : trips.length}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              All recorded trips
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
            📋
          </div>
        </div>
      </div>

      {/* IN PROGRESS */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-blue-500" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              In Progress
            </p>

            <p className="mt-3 text-3xl font-bold tracking-tight text-blue-700">
              {loading ? "..." : activeTrips}
            </p>

            <p className="mt-2 text-xs text-blue-500">
              Trips currently active
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
            🚚
          </div>
        </div>
      </div>

      {/* SCHEDULED */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-100 bg-orange-50/60 p-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-orange-500" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-orange-600">
              Scheduled
            </p>

            <p className="mt-3 text-3xl font-bold tracking-tight text-orange-700">
              {loading ? "..." : scheduledTrips}
            </p>

            <p className="mt-2 text-xs text-orange-500">
              Upcoming trips
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
            📅
          </div>
        </div>
      </div>

      {/* COMPLETED */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-600">
              Completed
            </p>

            <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-700">
              {loading ? "..." : completedTrips}
            </p>

            <p className="mt-2 text-xs text-emerald-500">
              Successfully completed
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
            ✓
          </div>
        </div>
      </div>
    </div>

    {/* COMPLETION PERFORMANCE */}
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">
            Trip Completion Performance
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Percentage of recorded trips that have been completed.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-2xl font-bold tracking-tight text-emerald-600">
            {loading
              ? "..."
              : `${formatNumber(tripCompletionRate)}%`}
          </p>

          <p className="mt-1 text-xs font-medium text-slate-400">
            Completion rate
          </p>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white shadow-inner">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{
            width: `${Math.min(
              Math.max(tripCompletionRate, 0),
              100,
            )}%`,
          }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-400">
          {loading ? "..." : `${completedTrips} completed`}
        </span>

        <span className="font-medium text-slate-400">
          {loading ? "..." : `${trips.length} total trips`}
        </span>
      </div>
    </div>
  </div>
</section> 

         {/* RECENT TRIPS */}
<section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div className="border-b border-slate-100 px-6 py-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Activity
        </p>

        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
          Recent Trips
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Latest logistics activity recorded in FleetFlow.
        </p>
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
        🛣️
      </div>
    </div>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full min-w-[950px] text-left text-sm">
      <thead className="border-b border-slate-100 bg-slate-50">
        <tr>
          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
            Trip
          </th>

          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
            Vehicle
          </th>

          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
            Driver
          </th>

          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
            Route
          </th>

          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
            Date
          </th>

          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
            Revenue
          </th>

          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
            Status
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {loading ? (
          <tr>
            <td
              colSpan={7}
              className="px-6 py-12 text-center"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />

                <p className="mt-3 text-sm font-medium text-slate-500">
                  Loading recent trips...
                </p>
              </div>
            </td>
          </tr>
        ) : recentTrips.length === 0 ? (
          <tr>
            <td
              colSpan={7}
              className="px-6 py-12 text-center"
            >
              <div className="mx-auto flex max-w-sm flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-lg">
                  🛣️
                </div>

                <p className="mt-3 font-semibold text-slate-700">
                  No recent trips
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Trip activity will appear here once FleetFlow records trips.
                </p>
              </div>
            </td>
          </tr>
        ) : (
          recentTrips.map((trip) => {
            const status = getStatus(trip.status);

            const statusStyle =
              status === "completed"
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                : status === "in progress" ||
                    status === "active"
                  ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200"
                  : status === "cancelled" ||
                      status === "canceled"
                    ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200"
                    : "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200";

            return (
              <tr
                key={trip.id}
                className="transition-colors duration-150 hover:bg-slate-50"
              >
                {/* TRIP */}
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-slate-900">
                      {trip.tripCode}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Trip #{trip.id}
                    </p>
                  </div>
                </td>

                {/* VEHICLE */}
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-700">
                    {trip.vehicleCode}
                  </span>
                </td>

                {/* DRIVER */}
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-700">
                    {trip.driverCode}
                  </span>
                </td>

                {/* ROUTE */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="max-w-[130px] truncate font-medium text-slate-700">
                      {trip.origin}
                    </span>

                    <span className="text-slate-300">
                      →
                    </span>

                    <span className="max-w-[130px] truncate font-medium text-slate-700">
                      {trip.destination}
                    </span>
                  </div>
                </td>

                {/* DATE */}
                <td className="px-6 py-4 text-slate-600">
                  {formatDate(trip.tripDate)}
                </td>

                {/* REVENUE */}
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-900">
                    {formatMoney(
                      Number(trip.revenue || 0),
                    )}
                  </span>
                </td>

                {/* STATUS */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyle}`}
                  >
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                    {trip.status}
                  </span>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>

  <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4">
    <p className="text-xs font-medium text-slate-400">
      Showing the latest {recentTrips.length} recorded trips.
    </p>
  </div>
</section> 

{/* RECENT ACTIVITY */}
<section className="mt-8 grid gap-6 lg:grid-cols-2">
  {/* RECENT MAINTENANCE */}
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 px-6 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
            Maintenance
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            Recent Maintenance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest maintenance activity across the fleet.
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg">
          🔧
        </div>
      </div>
    </div>

    <div className="p-6">
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
        </div>
      ) : recentMaintenance.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-lg">
            🔧
          </div>

          <p className="mt-3 font-semibold text-slate-700">
            No maintenance records
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Recent maintenance activity will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {recentMaintenance.map((record) => {
            const status = getStatus(record.status);

            const statusStyle =
              status === "completed"
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                : status === "in progress" ||
                    status === "active"
                  ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200"
                  : status === "cancelled" ||
                      status === "canceled"
                    ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200"
                    : "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200";

            return (
              <div
                key={record.id}
                className="flex items-start justify-between gap-4 border-b border-slate-100 py-4 first:pt-0 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-slate-800">
                      {record.maintenanceCode}
                    </p>

                    <span className="text-slate-300">
                      •
                    </span>

                    <p className="font-medium text-slate-600">
                      {record.vehicleCode}
                    </p>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {record.maintenanceType}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(record.maintenanceDate)}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyle}`}
                >
                  {record.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>

    <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-3">
      <p className="text-xs font-medium text-slate-400">
        Showing the latest {recentMaintenance.length} maintenance records.
      </p>
    </div>
  </div>

  {/* RECENT EXPENSES */}
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 px-6 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Finance
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            Recent Expenses
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest operational expenses recorded in FleetFlow.
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
          💸
        </div>
      </div>
    </div>

    <div className="p-6">
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
        </div>
      ) : recentExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-lg">
            💸
          </div>

          <p className="mt-3 font-semibold text-slate-700">
            No expenses recorded
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Recent operational expenses will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {recentExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-start justify-between gap-4 border-b border-slate-100 py-4 first:pt-0 last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-slate-800">
                    {expense.expenseCode}
                  </p>

                  <span className="text-slate-300">
                    •
                  </span>

                  <p className="font-medium text-slate-600">
                    {expense.category}
                  </p>
                </div>

                <p className="mt-1 truncate text-sm text-slate-500">
                  {expense.description}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {formatDate(expense.expenseDate)}
                </p>
              </div>

              <p className="shrink-0 whitespace-nowrap text-base font-bold text-slate-900">
                {formatMoney(
                  Number(expense.amount || 0),
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-3">
      <p className="text-xs font-medium text-slate-400">
        Showing the latest {recentExpenses.length} expense records.
      </p>
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
