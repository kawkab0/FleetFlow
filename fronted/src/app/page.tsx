"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

type Priority =
  | "Critical"
  | "High"
  | "Medium";

const card =
  "rounded-2xl border border-slate-200 bg-white shadow-sm";

const muted =
  "text-slate-500";

export default function Home() {
  const [vehicles, setVehicles] =
    useState<Vehicle[]>([]);

  const [drivers, setDrivers] =
    useState<Driver[]>([]);

  const [trips, setTrips] =
    useState<Trip[]>([]);

  const [fuel, setFuel] =
    useState<Fuel[]>([]);

  const [maintenance, setMaintenance] =
    useState<Maintenance[]>([]);

  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const fetchDashboardData =
    async () => {
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

        setVehicles(
          Array.isArray(vehiclesData)
            ? vehiclesData
            : [],
        );

        setDrivers(
          Array.isArray(driversData)
            ? driversData
            : [],
        );

        setTrips(
          Array.isArray(tripsData)
            ? tripsData
            : [],
        );

        setFuel(
          Array.isArray(fuelData)
            ? fuelData
            : [],
        );

        setMaintenance(
          Array.isArray(
            maintenanceData,
          )
            ? maintenanceData
            : [],
        );

        setExpenses(
          Array.isArray(expensesData)
            ? expensesData
            : [],
        );

        setLastUpdated(new Date());
      } catch (err) {
        console.error(
          "Dashboard error:",
          err,
        );

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

  const formatNumber = (
    value: number,
  ) =>
    value.toLocaleString(
      "en-US",
      {
        maximumFractionDigits: 2,
      },
    );

  const formatMoney = (
    value: number,
  ) =>
    `${value.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )} ETB`;

  const formatDate = (
    date: string,
  ) => {
    if (!date) return "";

    return String(date).substring(
      0,
      10,
    );
  };

  const formatUpdatedTime = () => {
    if (!lastUpdated) {
      return "Waiting for data";
    }

    return lastUpdated.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  const getStatus = (
    value: string,
  ) =>
    value?.toLowerCase().trim() ||
    "";

  /*
   * CORE FLEET METRICS
   */

  const activeVehicles =
    vehicles.filter(
      (vehicle) =>
        getStatus(vehicle.status) ===
        "active",
    ).length;

  const maintenanceVehicles =
    vehicles.filter(
      (vehicle) =>
        getStatus(vehicle.status) ===
        "maintenance",
    ).length;

  const inactiveVehicles =
    vehicles.filter((vehicle) => {
      const status =
        getStatus(vehicle.status);

      return (
        status === "inactive" ||
        status === "retired" ||
        status === "out of service"
      );
    }).length;

  const activeTrips =
    trips.filter((trip) => {
      const status =
        getStatus(trip.status);

      return (
        status === "in progress" ||
        status === "active"
      );
    }).length;

  const scheduledTrips =
    trips.filter((trip) => {
      const status =
        getStatus(trip.status);

      return (
        status === "scheduled" ||
        status === "planned" ||
        status === "pending"
      );
    }).length;

  const completedTrips =
    trips.filter(
      (trip) =>
        getStatus(trip.status) ===
        "completed",
    ).length;

  const maintenanceDue =
    maintenance.filter((record) => {
      const status =
        getStatus(record.status);

      return (
        status === "pending" ||
        status === "in progress" ||
        status === "scheduled"
      );
    }).length;

  const availableVehicles =
    Math.max(
      activeVehicles - activeTrips,
      0,
    );

  /*
   * FINANCIAL METRICS
   */

  const totalDistance =
    trips.reduce(
      (total, trip) =>
        total +
        Number(trip.distance || 0),
      0,
    );

  const totalFuelLiters =
    fuel.reduce(
      (total, record) =>
        total +
        Number(record.liters || 0),
      0,
    );

  const totalFuelCost =
    fuel.reduce(
      (total, record) =>
        total +
        Number(record.cost || 0),
      0,
    );

  const totalMaintenanceCost =
    maintenance.reduce(
      (total, record) =>
        total +
        Number(record.cost || 0),
      0,
    );

  const totalExpenses =
    expenses.reduce(
      (total, expense) =>
        total +
        Number(expense.amount || 0),
      0,
    );

  const totalRevenue =
    trips.reduce(
      (total, trip) =>
        total +
        Number(trip.revenue || 0),
      0,
    );

  const totalOperatingCost =
    totalFuelCost +
    totalMaintenanceCost +
    totalExpenses;

  const netOperatingResult =
    totalRevenue -
    totalOperatingCost;

  /*
   * PERFORMANCE METRICS
   */

  const fuelEfficiency =
    totalFuelLiters > 0
      ? totalDistance /
        totalFuelLiters
      : 0;

  const costPerKilometer =
    totalDistance > 0
      ? totalOperatingCost /
        totalDistance
      : 0;

  const fleetUtilization =
    activeVehicles > 0
      ? (activeTrips /
          activeVehicles) *
        100
      : 0;

  const tripCompletionRate =
    trips.length > 0
      ? (completedTrips /
          trips.length) *
        100
      : 0;

  const activeDrivers =
    drivers.filter(
      (driver) =>
        getStatus(driver.status) ===
        "active",
    ).length;

  const driverUtilization =
    activeDrivers > 0
      ? (activeTrips /
          activeDrivers) *
        100
      : 0;

  const revenueMargin =
    totalRevenue > 0
      ? (netOperatingResult /
          totalRevenue) *
        100
      : 0;

  const operatingCostRatio =
    totalRevenue > 0
      ? (totalOperatingCost /
          totalRevenue) *
        100
      : 0;

  /*
   * EXECUTIVE COMMAND CENTER
   */

  const fleetHealthScore =
    useMemo(() => {
      let score = 100;

      if (
        netOperatingResult < 0
      ) {
        score -= 25;
      }

      if (
        fleetUtilization > 90
      ) {
        score -= 10;
      }

      if (
        fleetUtilization < 25 &&
        activeVehicles > 0
      ) {
        score -= 10;
      }

      if (maintenanceDue > 0) {
        score -= Math.min(
          maintenanceDue * 5,
          20,
        );
      }

      if (
        fuelEfficiency > 0 &&
        fuelEfficiency < 4
      ) {
        score -= 10;
      }

      if (inactiveVehicles > 0) {
        score -= Math.min(
          inactiveVehicles * 3,
          10,
        );
      }

      return Math.max(
        0,
        Math.min(
          100,
          Math.round(score),
        ),
      );
    }, [
      netOperatingResult,
      fleetUtilization,
      activeVehicles,
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
      ? "text-emerald-600"
      : fleetHealthScore >= 60
        ? "text-orange-600"
        : "text-red-600";

  const healthBarColor =
    fleetHealthScore >= 80
      ? "bg-emerald-500"
      : fleetHealthScore >= 60
        ? "bg-orange-500"
        : "bg-red-500";

  /*
   * PRIORITY ACTIONS
   */

  const priorityActions =
    useMemo(() => {
      const actions: {
        title: string;
        description: string;
        href: string;
        priority: Priority;
      }[] = [];

      if (
        netOperatingResult < 0
      ) {
        actions.push({
          title:
            "Review fleet profitability",
          description:
            "Operating costs currently exceed recorded trip revenue.",
          href: "/profitability",
          priority: "Critical",
        });
      }

      if (maintenanceDue > 0) {
        actions.push({
          title:
            "Review maintenance workload",
          description: `${maintenanceDue} maintenance record${
            maintenanceDue === 1
              ? ""
              : "s"
          } require attention.`,
          href:
            "/maintenance-intelligence",
          priority: "High",
        });
      }

      if (
        fuelEfficiency > 0 &&
        fuelEfficiency < 4
      ) {
        actions.push({
          title:
            "Investigate fuel efficiency",
          description:
            "Fleet fuel efficiency is below the dashboard benchmark.",
          href:
            "/fuel-intelligence",
          priority: "High",
        });
      }

      if (inactiveVehicles > 0) {
        actions.push({
          title:
            "Review inactive vehicles",
          description: `${inactiveVehicles} vehicle${
            inactiveVehicles === 1
              ? ""
              : "s"
          } currently inactive.`,
          href: "/intelligence",
          priority: "Medium",
        });
      }

      if (
        fleetUtilization > 90
      ) {
        actions.push({
          title:
            "Fleet utilization is high",
          description:
            "Most active vehicles are currently assigned to trips.",
          href:
            "/route-intelligence",
          priority: "High",
        });
      }

      if (
        actions.length === 0
      ) {
        actions.push({
          title:
            "Fleet operating normally",
          description:
            "No critical decision actions were detected from current data.",
          href:
            "/recommendations",
          priority: "Medium",
        });
      }

      return actions.slice(0, 4);
    }, [
      netOperatingResult,
      maintenanceDue,
      fuelEfficiency,
      inactiveVehicles,
      fleetUtilization,
    ]);

  /*
   * ALERTS
   */

  const alerts = useMemo(() => {
    const results: {
      title: string;
      description: string;
      type:
        | "warning"
        | "danger"
        | "info"
        | "success";
    }[] = [];

    if (maintenanceDue > 0) {
      results.push({
        title:
          "Maintenance attention required",
        description: `${maintenanceDue} maintenance record${
          maintenanceDue === 1
            ? ""
            : "s"
        } require attention.`,
        type: "warning",
      });
    }

    if (inactiveVehicles > 0) {
      results.push({
        title:
          "Inactive vehicles detected",
        description: `${inactiveVehicles} vehicle${
          inactiveVehicles === 1
            ? ""
            : "s"
        } currently inactive.`,
        type: "info",
      });
    }

    if (
      fleetUtilization > 90
    ) {
      results.push({
        title:
          "High fleet utilization",
        description:
          "Most active vehicles are currently assigned to trips.",
        type: "warning",
      });
    }

    if (
      netOperatingResult < 0
    ) {
      results.push({
        title:
          "Operating result is negative",
        description:
          "Current operating costs are higher than recorded trip revenue.",
        type: "danger",
      });
    }

    if (
      fuelEfficiency > 0 &&
      fuelEfficiency < 4
    ) {
      results.push({
        title:
          "Fuel efficiency is low",
        description:
          "Recorded fleet efficiency is below the dashboard benchmark.",
        type: "warning",
      });
    }

    if (
      results.length === 0
    ) {
      results.push({
        title:
          "Fleet operating normally",
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
    fuelEfficiency,
  ]);

  /*
   * RECENT DATA
   */

  const recentTrips =
    useMemo(
      () =>
        [...trips]
          .sort(
            (a, b) =>
              new Date(
                b.tripDate,
              ).getTime() -
              new Date(
                a.tripDate,
              ).getTime(),
          )
          .slice(0, 5),
      [trips],
    );

  const recentMaintenance =
    useMemo(
      () =>
        [...maintenance]
          .sort(
            (a, b) =>
              new Date(
                b.maintenanceDate,
              ).getTime() -
              new Date(
                a.maintenanceDate,
              ).getTime(),
          )
          .slice(0, 4),
      [maintenance],
    );

  const recentExpenses =
    useMemo(
      () =>
        [...expenses]
          .sort(
            (a, b) =>
              new Date(
                b.expenseDate,
              ).getTime() -
              new Date(
                a.expenseDate,
              ).getTime(),
          )
          .slice(0, 4),
      [expenses],
    );

  /*
   * COST MIX
   */

  const fuelCostShare =
    totalOperatingCost > 0
      ? (totalFuelCost /
          totalOperatingCost) *
        100
      : 0;

  const maintenanceCostShare =
    totalOperatingCost > 0
      ? (totalMaintenanceCost /
          totalOperatingCost) *
        100
      : 0;

  const expenseCostShare =
    totalOperatingCost > 0
      ? (totalExpenses /
          totalOperatingCost) *
        100
      : 0;

  /*
   * STATUS HELPERS
   */

  const getTripStatusStyle = (
    status: string,
  ) => {
    const normalized =
      getStatus(status);

    if (
      normalized === "completed"
    ) {
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    }

    if (
      normalized ===
        "in progress" ||
      normalized === "active"
    ) {
      return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
    }

    if (
      normalized ===
        "cancelled" ||
      normalized === "canceled"
    ) {
      return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
    }

    return "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200";
  };

  const getMaintenanceStatusStyle =
    (status: string) => {
      const normalized =
        getStatus(status);

      if (
        normalized === "completed"
      ) {
        return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
      }

      if (
        normalized ===
          "in progress" ||
        normalized === "active"
      ) {
        return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
      }

      if (
        normalized ===
          "cancelled" ||
        normalized === "canceled"
      ) {
        return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
      }

      return "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200";
    };

  return (
    <ProtectedPage
      permission="dashboard"
    >
      <main className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* HEADER */}

          <section className="overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
            <div className="relative p-6 md:p-8">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Executive Operations Center
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                    FleetFlow Dashboard
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    Real-time operational visibility across fleet,
                    logistics, financial performance and business risk.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Last updated
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {formatUpdatedTime()}
                    </p>
                  </div>

                  <button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Refreshing..."
                      : "Refresh"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ERROR */}

          {error && (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-bold text-red-800">
                    Dashboard data unavailable
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    {error}
                  </p>
                </div>

                <button
                  onClick={fetchDashboardData}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                >
                  Try again
                </button>
              </div>
            </section>
          )}

          {/* KPI STRIP */}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className={`${card} p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Fleet
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-950">
                    {loading
                      ? "—"
                      : vehicles.length}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {activeVehicles} active vehicles
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  🚚
                </div>
              </div>
            </div>

            <div className={`${card} p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Active Trips
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-950">
                    {loading
                      ? "—"
                      : activeTrips}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {scheduledTrips} scheduled
                  </p>
                </div>

                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  ↗
                </div>
              </div>
            </div>

            <div className={`${card} p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Revenue
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-950">
                    {loading
                      ? "—"
                      : formatMoney(
                          totalRevenue,
                        )}
                  </p>

                  <p
                    className={`mt-1 text-sm font-medium ${
                      revenueMargin >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {revenueMargin.toFixed(
                      1,
                    )}
                    % operating margin
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  ETB
                </div>
              </div>
            </div>

            <div className={`${card} p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Fleet Health
                  </p>

                  <p
                    className={`mt-2 text-3xl font-bold ${healthColor}`}
                  >
                    {loading
                      ? "—"
                      : fleetHealthScore}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {healthLabel}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                  ✦
                </div>
              </div>
            </div>
          </section>

          {/* COMMAND CENTER */}

          <section className={`${card} overflow-hidden`}>
            <div className="border-b border-slate-200 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Executive Command Center
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    What needs attention?
                  </h2>
                </div>

                <a
                  href="/recommendations"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-500"
                >
                  View recommendations →
                </a>
              </div>
            </div>

            <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[280px_1fr]">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Fleet Health Score
                </p>

                <div className="mt-5 flex items-end gap-2">
                  <span
                    className={`text-5xl font-bold ${healthColor}`}
                  >
                    {loading
                      ? "—"
                      : fleetHealthScore}
                  </span>

                  {!loading && (
                    <span className="mb-2 text-sm text-slate-400">
                      / 100
                    </span>
                  )}
                </div>

                <p
                  className={`mt-2 text-sm font-semibold ${healthColor}`}
                >
                  {healthLabel}
                </p>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all ${healthBarColor}`}
                    style={{
                      width: `${fleetHealthScore}%`,
                    }}
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      Utilization
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {fleetUtilization.toFixed(
                        1,
                      )}
                      %
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Maintenance
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {maintenanceDue}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-slate-950">
                    Priority Actions
                  </h3>

                  <span className="text-xs text-slate-400">
                    Top {priorityActions.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {priorityActions.map(
                    (action) => (
                      <a
                        key={`${action.title}-${action.priority}`}
                        href={action.href}
                        className="group flex items-start gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                      >
                        <div
                          className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                            action.priority ===
                            "Critical"
                              ? "bg-red-500"
                              : action.priority ===
                                  "High"
                                ? "bg-orange-500"
                                : "bg-blue-500"
                          }`}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900 group-hover:text-blue-700">
                              {action.title}
                            </p>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                action.priority ===
                                "Critical"
                                  ? "bg-red-50 text-red-700"
                                  : action.priority ===
                                      "High"
                                    ? "bg-orange-50 text-orange-700"
                                    : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {action.priority}
                            </span>
                          </div>

                          <p className="mt-1 text-sm leading-5 text-slate-500">
                            {
                              action.description
                            }
                          </p>
                        </div>

                        <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500">
                          →
                        </span>
                      </a>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* INTELLIGENCE CENTER */}

          <section>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Intelligence Center
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Decision-support tools
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Fleet Intelligence",
                  description:
                    "Vehicle health, utilization and operational risk.",
                  href: "/intelligence",
                  icon: "🚚",
                },
                {
                  title: "Fuel Intelligence",
                  description:
                    "Efficiency, fuel costs and consumption signals.",
                  href: "/fuel-intelligence",
                  icon: "⛽",
                },
                {
                  title:
                    "Maintenance Intelligence",
                  description:
                    "Maintenance workload and vehicle service risk.",
                  href:
                    "/maintenance-intelligence",
                  icon: "🔧",
                },
                {
                  title:
                    "Profitability Intelligence",
                  description:
                    "Revenue, operating costs and profitability.",
                  href: "/profitability",
                  icon: "📈",
                },
              ].map(
                (item) => (
                  <a
                    key={item.title}
                    href={item.href}
                    className={`${card} group p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="rounded-xl bg-slate-100 p-3 text-xl">
                        {item.icon}
                      </div>

                      <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500">
                        →
                      </span>
                    </div>

                    <h3 className="mt-5 font-bold text-slate-950">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-5 text-slate-500">
                      {item.description}
                    </p>
                  </a>
                ),
              )}
            </div>
          </section>

          {/* OPERATIONS OVERVIEW */}

          <section className={`${card} p-5 md:p-6`}>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Operations Overview
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Fleet activity at a glance
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Available",
                  value: availableVehicles,
                  detail:
                    "Ready for assignment",
                  icon: "✓",
                  style:
                    "bg-emerald-50 text-emerald-700",
                },
                {
                  label: "Active Trips",
                  value: activeTrips,
                  detail:
                    "Currently in progress",
                  icon: "→",
                  style:
                    "bg-blue-50 text-blue-700",
                },
                {
                  label: "Maintenance",
                  value: maintenanceVehicles,
                  detail:
                    "Vehicles in service",
                  icon: "🔧",
                  style:
                    "bg-orange-50 text-orange-700",
                },
                {
                  label: "Inactive",
                  value: inactiveVehicles,
                  detail:
                    "Require review",
                  icon: "!",
                  style:
                    "bg-red-50 text-red-700",
                },
              ].map(
                (item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg px-3 py-2 text-sm font-bold ${item.style}`}
                      >
                        {item.icon}
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {item.label}
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-950">
                          {item.value}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      {item.detail}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* PERFORMANCE */}

          <section>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Performance
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Operational performance
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title:
                    "Trip Completion",
                  value: `${tripCompletionRate.toFixed(
                    1,
                  )}%`,
                  detail: `${completedTrips} of ${trips.length} trips completed`,
                  progress:
                    tripCompletionRate,
                  style:
                    "bg-blue-500",
                },
                {
                  title:
                    "Fuel Efficiency",
                  value: `${fuelEfficiency.toFixed(
                    2,
                  )} km/L`,
                  detail:
                    "Distance per liter",
                  progress:
                    Math.min(
                      fuelEfficiency *
                        10,
                      100,
                    ),
                  style:
                    "bg-emerald-500",
                },
                {
                  title:
                    "Cost / Kilometer",
                  value:
                    formatMoney(
                      costPerKilometer,
                    ),
                  detail:
                    "Operating cost per km",
                  progress: 0,
                  style:
                    "bg-orange-500",
                },
                {
                  title:
                    "Operating Margin",
                  value: `${revenueMargin.toFixed(
                    1,
                  )}%`,
                  detail:
                    "Net result vs revenue",
                  progress:
                    Math.max(
                      Math.min(
                        revenueMargin,
                        100,
                      ),
                      0,
                    ),
                  style:
                    revenueMargin >= 0
                      ? "bg-emerald-500"
                      : "bg-red-500",
                },
              ].map(
                (metric) => (
                  <div
                    key={metric.title}
                    className={`${card} p-5`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {metric.title}
                    </p>

                    <p className="mt-3 text-2xl font-bold text-slate-950">
                      {metric.value}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {metric.detail}
                    </p>

                    {metric.progress >
                      0 && (
                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${metric.style}`}
                          style={{
                            width: `${Math.min(
                              metric.progress,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          </section>

          {/* ALERTS + FLEET STATUS */}

          <section className="grid gap-6 lg:grid-cols-2">
            <div className={`${card} p-5 md:p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Monitoring
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    Operational Alerts
                  </h2>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  {alerts.length}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {alerts.map(
                  (alert) => {
                    const style =
                      alert.type ===
                      "danger"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : alert.type ===
                            "warning"
                          ? "border-orange-200 bg-orange-50 text-orange-700"
                          : alert.type ===
                              "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-blue-200 bg-blue-50 text-blue-700";

                    return (
                      <div
                        key={
                          alert.title
                        }
                        className={`rounded-xl border p-4 ${style}`}
                      >
                        <p className="text-sm font-bold">
                          {alert.title}
                        </p>

                        <p className="mt-1 text-sm opacity-80">
                          {
                            alert.description
                          }
                        </p>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            <div className={`${card} p-5 md:p-6`}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Fleet Status
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Vehicle availability
                </h2>
              </div>

              <div className="mt-6 space-y-5">
                {[
                  {
                    label: "Available",
                    value:
                      availableVehicles,
                    total:
                      Math.max(
                        vehicles.length,
                        1,
                      ),
                    style:
                      "bg-emerald-500",
                  },
                  {
                    label: "Active Trips",
                    value:
                      activeTrips,
                    total:
                      Math.max(
                        vehicles.length,
                        1,
                      ),
                    style:
                      "bg-blue-500",
                  },
                  {
                    label: "Maintenance",
                    value:
                      maintenanceVehicles,
                    total:
                      Math.max(
                        vehicles.length,
                        1,
                      ),
                    style:
                      "bg-orange-500",
                  },
                  {
                    label: "Inactive",
                    value:
                      inactiveVehicles,
                    total:
                      Math.max(
                        vehicles.length,
                        1,
                      ),
                    style:
                      "bg-red-500",
                  },
                ].map(
                  (item) => {
                    const percent =
                      Math.min(
                        (item.value /
                          item.total) *
                          100,
                        100,
                      );

                    return (
                      <div
                        key={
                          item.label
                        }
                      >
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">
                            {item.label}
                          </span>

                          <span className="font-bold text-slate-950">
                            {item.value}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${item.style}`}
                            style={{
                              width: `${percent}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </section>

          {/* FINANCIAL PERFORMANCE */}

          <section className={`${card} p-5 md:p-6`}>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Financial Performance
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Revenue and operating costs
                </h2>
              </div>

              <div
                className={`text-lg font-bold ${
                  netOperatingResult >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {formatMoney(
                  netOperatingResult,
                )}{" "}
                net result
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-emerald-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Revenue
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-950">
                  {formatMoney(
                    totalRevenue,
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-orange-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">
                  Operating Cost
                </p>

                <p className="mt-2 text-2xl font-bold text-orange-950">
                  {formatMoney(
                    totalOperatingCost,
                  )}
                </p>

                <p className="mt-1 text-xs text-orange-700">
                  {operatingCostRatio.toFixed(
                    1,
                  )}
                  % of revenue
                </p>
              </div>

              <div
                className={`rounded-xl p-5 ${
                  netOperatingResult >=
                  0
                    ? "bg-blue-50"
                    : "bg-red-50"
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    netOperatingResult >=
                    0
                      ? "text-blue-700"
                      : "text-red-700"
                  }`}
                >
                  Operating Result
                </p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    netOperatingResult >=
                    0
                      ? "text-blue-950"
                      : "text-red-950"
                  }`}
                >
                  {formatMoney(
                    netOperatingResult,
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-slate-950">
                  Cost Breakdown
                </h3>

                <span className="text-xs text-slate-400">
                  Total:{" "}
                  {formatMoney(
                    totalOperatingCost,
                  )}
                </span>
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: "Fuel",
                    amount:
                      totalFuelCost,
                    share:
                      fuelCostShare,
                    style:
                      "bg-blue-500",
                  },
                  {
                    label:
                      "Maintenance",
                    amount:
                      totalMaintenanceCost,
                    share:
                      maintenanceCostShare,
                    style:
                      "bg-orange-500",
                  },
                  {
                    label: "Expenses",
                    amount:
                      totalExpenses,
                    share:
                      expenseCostShare,
                    style:
                      "bg-purple-500",
                  },
                ].map(
                  (item) => (
                    <div
                      key={
                        item.label
                      }
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-slate-700">
                            {item.label}
                          </span>

                          <span className="ml-2 text-xs text-slate-400">
                            {item.share.toFixed(
                              1,
                            )}
                            %
                          </span>
                        </div>

                        <span className="text-sm font-semibold text-slate-900">
                          {formatMoney(
                            item.amount,
                          )}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${item.style}`}
                          style={{
                            width: `${Math.min(
                              item.share,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>

          {/* TRIP PERFORMANCE */}

          <section className={`${card} p-5 md:p-6`}>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Trip Performance
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Current trip pipeline
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Total Trips",
                  value: trips.length,
                  style:
                    "bg-slate-100 text-slate-700",
                },
                {
                  label: "In Progress",
                  value: activeTrips,
                  style:
                    "bg-blue-50 text-blue-700",
                },
                {
                  label: "Scheduled",
                  value: scheduledTrips,
                  style:
                    "bg-orange-50 text-orange-700",
                },
                {
                  label: "Completed",
                  value: completedTrips,
                  style:
                    "bg-emerald-50 text-emerald-700",
                },
              ].map(
                (item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <span
                      className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-bold ${item.style}`}
                    >
                      {item.label}
                    </span>

                    <p className="mt-4 text-3xl font-bold text-slate-950">
                      {item.value}
                    </p>
                  </div>
                ),
              )}
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">
                  Overall completion
                </span>

                <span className="font-bold text-slate-950">
                  {tripCompletionRate.toFixed(
                    1,
                  )}
                  %
                </span>
              </div>

              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600"
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

          <section className={`${card} overflow-hidden`}>
            <div className="border-b border-slate-200 p-5 md:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Activity
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Recent Trips
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
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
                      Revenue
                    </th>
                    <th className="px-6 py-4">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentTrips.map(
                    (trip) => (
                      <tr
                        key={trip.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {
                            trip.tripCode
                          }
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {
                            trip.vehicleCode
                          }
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {
                            trip.driverCode
                          }
                        </td>

                        <td className="max-w-[240px] px-6 py-4 text-sm text-slate-600">
                          <span className="block truncate">
                            {trip.origin}{" "}
                            →{" "}
                            {
                              trip.destination
                            }
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatDate(
                            trip.tripDate,
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {formatMoney(
                            Number(
                              trip.revenue ||
                                0,
                            ),
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getTripStatusStyle(
                              trip.status,
                            )}`}
                          >
                            {
                              trip.status
                            }
                          </span>
                        </td>
                      </tr>
                    ),
                  )}

                  {!loading &&
                    recentTrips.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-sm text-slate-500"
                        >
                          No recent trips
                          available.
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </section>

          {/* RECENT ACTIVITY */}

          <section className="grid gap-6 lg:grid-cols-2">
            <div className={`${card} p-5 md:p-6`}>
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Maintenance
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Recent Maintenance
                </h2>
              </div>

              <div className="space-y-3">
                {recentMaintenance.map(
                  (record) => (
                    <div
                      key={record.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {
                              record.maintenanceCode
                            }
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {
                              record.vehicleCode
                            }{" "}
                            ·{" "}
                            {
                              record.maintenanceType
                            }
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getMaintenanceStatusStyle(
                            record.status,
                          )}`}
                        >
                          {
                            record.status
                          }
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                        <span>
                          {formatDate(
                            record.maintenanceDate,
                          )}
                        </span>

                        <span className="font-semibold text-slate-600">
                          {formatMoney(
                            Number(
                              record.cost ||
                                0,
                            ),
                          )}
                        </span>
                      </div>
                    </div>
                  ),
                )}

                {!loading &&
                  recentMaintenance.length ===
                    0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                      No recent maintenance
                      records.
                    </div>
                  )}
              </div>
            </div>

            <div className={`${card} p-5 md:p-6`}>
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Finance
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Recent Expenses
                </h2>
              </div>

              <div className="space-y-3">
                {recentExpenses.map(
                  (expense) => (
                    <div
                      key={expense.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {
                              expense.expenseCode
                            }
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {
                              expense.category
                            }{" "}
                            ·{" "}
                            {
                              expense.description
                            }
                          </p>
                        </div>

                        <p className="font-bold text-slate-900">
                          {formatMoney(
                            Number(
                              expense.amount ||
                                0,
                            ),
                          )}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                        <span>
                          {formatDate(
                            expense.expenseDate,
                          )}
                        </span>

                        <span>
                          {
                            expense.paymentMethod
                          }
                        </span>
                      </div>
                    </div>
                  ),
                )}

                {!loading &&
                  recentExpenses.length ===
                    0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                      No recent expenses.
                    </div>
                  )}
              </div>
            </div>
          </section>

          {/* MANAGEMENT SNAPSHOT */}

          <section className={`${card} p-5 md:p-6`}>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Management Snapshot
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Business-level indicators
                </h2>
              </div>

              <a
                href="/recommendations"
                className="text-sm font-semibold text-blue-600 hover:text-blue-500"
              >
                Open decision center →
              </a>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Distance
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {formatNumber(
                    totalDistance,
                  )}{" "}
                  km
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Fuel Consumed
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {formatNumber(
                    totalFuelLiters,
                  )}{" "}
                  L
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Driver Utilization
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {driverUtilization.toFixed(
                    1,
                  )}
                  %
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Maintenance Records
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {maintenance.length}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    netOperatingResult < 0 ||
                    maintenanceDue > 0 ||
                    inactiveVehicles > 0
                      ? "bg-orange-500"
                      : "bg-emerald-500"
                  }`}
                />

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Management signal
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {netOperatingResult <
                    0
                      ? "Profitability requires management attention because operating costs currently exceed recorded trip revenue."
                      : maintenanceDue >
                          0
                        ? "Operational attention is recommended because maintenance records require follow-up."
                        : inactiveVehicles >
                            0
                          ? "Fleet capacity may be affected by inactive vehicles that require review."
                          : "Current dashboard indicators show no major management-level concerns."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER */}

          <div className="pb-4 text-center text-xs text-slate-400">
            FleetFlow Logistics ERP · Executive Operations Dashboard
          </div>
        </div>
      </main>
    </ProtectedPage>
  );
}
