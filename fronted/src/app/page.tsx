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

type Priority = "Critical" | "High" | "Medium";

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
        Array.isArray(maintenanceData)
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
    value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });

  const formatMoney = (
    value: number,
  ) =>
    `${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ETB`;

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
    value?.toLowerCase().trim() || "";

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

  const fleetHealthScore = useMemo(() => {
    let score = 100;

    if (netOperatingResult < 0) {
      score -= 25;
    }

    if (fleetUtilization > 90) {
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

      if (netOperatingResult < 0) {
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

      if (fleetUtilization > 90) {
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

      if (actions.length === 0) {
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

    if (fleetUtilization > 90) {
      results.push({
        title:
          "High fleet utilization",
        description:
          "Most active vehicles are currently assigned to trips.",
        type: "warning",
      });
    }

    if (netOperatingResult < 0) {
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

    if (results.length === 0) {
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

  const recentTrips = useMemo(() => {
    return [...trips]
      .sort(
        (a, b) =>
          new Date(
            b.tripDate,
          ).getTime() -
          new Date(
            a.tripDate,
          ).getTime(),
      )
      .slice(0, 5);
  }, [trips]);

  const recentMaintenance =
    useMemo(() => {
      return [...maintenance]
        .sort(
          (a, b) =>
            new Date(
              b.maintenanceDate,
            ).getTime() -
            new Date(
              a.maintenanceDate,
            ).getTime(),
        )
        .slice(0, 4);
    }, [maintenance]);

  const recentExpenses =
    useMemo(() => {
      return [...expenses]
        .sort(
          (a, b) =>
            new Date(
              b.expenseDate,
            ).getTime() -
            new Date(
              a.expenseDate,
            ).getTime(),
        )
        .slice(0, 4);
    }, [expenses]);

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

    if (normalized === "completed") {
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    }

    if (
      normalized === "in progress" ||
      normalized === "active"
    ) {
      return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
    }

    if (
      normalized === "cancelled" ||
      normalized === "canceled"
    ) {
      return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
    }

    return "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200";
  };

  const getMaintenanceStatusStyle = (
    status: string,
  ) => {
    const normalized =
      getStatus(status);

    if (normalized === "completed") {
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    }

    if (
      normalized === "in progress" ||
      normalized === "active"
    ) {
      return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
    }

    if (
      normalized === "cancelled" ||
      normalized === "canceled"
    ) {
      return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
    }

    return "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200";
  };

  return (
    <ProtectedPage permission="dashboard">
      <main className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">

          {/* =========================================================
              HEADER
          ========================================================= */}

          <header className="mb-8">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-blue-50 blur-3xl" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-blue-700">
                      FLEETFLOW ERP
                    </span>

                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-300" />
                      Executive Overview
                    </span>

                    <span className="hidden h-4 w-px bg-slate-200 sm:block" />

                    <span className="text-xs font-medium text-slate-400">
                      Last updated{" "}
                      {formatUpdatedTime()}
                    </span>
                  </div>

                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                    Fleet Dashboard
                  </h1>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    Executive visibility into fleet
                    operations, financial performance,
                    utilization, maintenance, and
                    logistics activity.
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <a
                    href="/recommendations"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Decision Center
                  </a>

                  <button
                    type="button"
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Refreshing..."
                      : "Refresh Data"}
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* =========================================================
              ERROR
          ========================================================= */}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white font-bold text-red-600 shadow-sm">
                  !
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-red-800">
                    Dashboard error
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-700">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={fetchDashboardData}
                    className="mt-3 text-xs font-bold text-red-700 underline underline-offset-4 hover:text-red-900"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              EXECUTIVE KPI STRIP
          ========================================================= */}

          <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Revenue
                  </p>

                  <p className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-950">
                    {loading
                      ? "..."
                      : formatMoney(
                          totalRevenue,
                        )}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Recorded trip revenue
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-600">
                  ↑
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute inset-x-0 top-0 h-1 bg-orange-500" />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Operating Cost
                  </p>

                  <p className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-950">
                    {loading
                      ? "..."
                      : formatMoney(
                          totalOperatingCost,
                        )}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Fuel + maintenance + expenses
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg text-orange-600">
                  ↓
                </div>
              </div>
            </div>

            <div
              className={`group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                netOperatingResult >= 0
                  ? "border-emerald-200 bg-emerald-50/40"
                  : "border-red-200 bg-red-50/40"
              }`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 ${
                  netOperatingResult >= 0
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}
              />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Net Result
                  </p>

                  <p
                    className={`mt-3 truncate text-2xl font-bold tracking-tight ${
                      netOperatingResult >= 0
                        ? "text-emerald-700"
                        : "text-red-700"
                    }`}
                  >
                    {loading
                      ? "..."
                      : formatMoney(
                          netOperatingResult,
                        )}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Current operating result
                  </p>
                </div>

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg ${
                    netOperatingResult >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {netOperatingResult >= 0
                    ? "✓"
                    : "!"}
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div
                className={`absolute inset-x-0 top-0 h-1 ${healthBarColor}`}
              />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Fleet Health
                  </p>

                  <p
                    className={`mt-3 text-2xl font-bold tracking-tight ${healthColor}`}
                  >
                    {loading
                      ? "..."
                      : `${fleetHealthScore}/100`}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {loading
                      ? "Calculating..."
                      : healthLabel}
                  </p>
                </div>

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-lg ${healthColor}`}
                >
                  ●
                </div>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${healthBarColor}`}
                  style={{
                    width: `${fleetHealthScore}%`,
                  }}
                />
              </div>
            </div>
          </section>

          {/* =========================================================
              EXECUTIVE COMMAND CENTER
          ========================================================= */}

          <section className="mb-8">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Command Center
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                Executive Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Decision signals generated from current
                operational and financial data.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Fleet Health
                    </p>

                    <p
                      className={`mt-2 text-3xl font-bold ${healthColor}`}
                    >
                      {loading
                        ? "..."
                        : `${fleetHealthScore}/100`}
                    </p>
                  </div>

                  <span
                    className={`rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold ${healthColor}`}
                  >
                    {loading
                      ? "..."
                      : healthLabel}
                  </span>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${healthBarColor}`}
                    style={{
                      width: `${fleetHealthScore}%`,
                    }}
                  />
                </div>

                <div className="mt-3 flex justify-between text-xs">
                  <span className="text-slate-400">
                    Risk-adjusted health
                  </span>

                  <span
                    className={`font-semibold ${healthColor}`}
                  >
                    {fleetHealthScore >= 80
                      ? "Strong"
                      : fleetHealthScore >= 60
                        ? "Monitor"
                        : "Action needed"}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Operations Signal
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {loading
                        ? "..."
                        : `${formatNumber(
                            fleetUtilization,
                          )}%`}
                    </p>
                  </div>

                  <span className="rounded-xl bg-blue-50 px-3 py-2 text-lg text-blue-600">
                    ↗
                  </span>
                </div>

                <p className="mt-4 text-sm text-slate-600">
                  Fleet utilization
                </p>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          fleetUtilization,
                          0,
                        ),
                        100,
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="font-semibold text-emerald-600">
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

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Financial Signal
                    </p>

                    <p
                      className={`mt-2 text-3xl font-bold ${
                        netOperatingResult >= 0
                          ? "text-emerald-600"
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
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {netOperatingResult >= 0
                      ? "↑"
                      : "↓"}
                  </span>
                </div>

                <p className="mt-4 text-sm text-slate-600">
                  Operating margin
                </p>

                <p
                  className={`mt-1 text-sm font-semibold ${
                    revenueMargin >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {loading
                    ? "..."
                    : `${formatNumber(
                        revenueMargin,
                      )}%`}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Cost ratio
                  </span>

                  <span className="font-semibold text-slate-600">
                    {loading
                      ? "..."
                      : `${formatNumber(
                          operatingCostRatio,
                        )}%`}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================
              PRIORITY ACTIONS
          ========================================================= */}

          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-500">
                  Decision Support
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Priority Actions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Recommended areas requiring management
                  attention.
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
              {priorityActions.map(
                (action, index) => {
                  const priorityStyle =
                    action.priority ===
                    "Critical"
                      ? "border-red-200 bg-red-50"
                      : action.priority ===
                          "High"
                        ? "border-orange-200 bg-orange-50"
                        : "border-blue-200 bg-blue-50";

                  const priorityText =
                    action.priority ===
                    "Critical"
                      ? "text-red-700"
                      : action.priority ===
                          "High"
                        ? "text-orange-700"
                        : "text-blue-700";

                  return (
                    <a
                      key={`${action.title}-${index}`}
                      href={action.href}
                      className={`rounded-xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${priorityStyle}`}
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
                },
              )}
            </div>
          </section>

          {/* =========================================================
              INTELLIGENCE CENTER
          ========================================================= */}

          <section className="mb-8">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-600">
                Intelligence
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                Intelligence Center
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Jump directly into FleetFlow&apos;s
                decision-support modules.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Fleet Intelligence",
                  description:
                    "Vehicle health, risk and utilization.",
                  href: "/intelligence",
                  icon: "🚚",
                  color:
                    "bg-blue-50 text-blue-600",
                },
                {
                  title: "Fuel Intelligence",
                  description:
                    "Fuel cost and efficiency analysis.",
                  href:
                    "/fuel-intelligence",
                  icon: "⛽",
                  color:
                    "bg-cyan-50 text-cyan-600",
                },
                {
                  title:
                    "Maintenance Intelligence",
                  description:
                    "Maintenance workload and risk.",
                  href:
                    "/maintenance-intelligence",
                  icon: "🔧",
                  color:
                    "bg-orange-50 text-orange-600",
                },
                {
                  title: "Profitability",
                  description:
                    "Vehicle and fleet profitability.",
                  href: "/profitability",
                  icon: "📈",
                  color:
                    "bg-emerald-50 text-emerald-600",
                },
              ].map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${item.color}`}
                  >
                    {item.icon}
                  </div>

                  <p className="mt-4 font-semibold text-slate-900">
                    {item.title}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>

                  <p className="mt-4 text-xs font-bold text-blue-600 transition group-hover:text-blue-700">
                    Open module →
                  </p>
                </a>
              ))}
            </div>
          </section>

          {/* =========================================================
              OPERATIONS OVERVIEW
          ========================================================= */}

          <section className="mt-8">
            <div className="mb-4 flex flex-col gap-1">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Operations
              </p>

              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Fleet Operations Overview
              </h2>

              <p className="text-sm text-slate-500">
                Current fleet, driver, trip, and
                maintenance activity.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="absolute inset-x-0 top-0 h-1 bg-blue-500" />

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Vehicles
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                      {loading
                        ? "..."
                        : vehicles.length}
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

              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="absolute inset-x-0 top-0 h-1 bg-indigo-500" />

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Drivers
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                      {loading
                        ? "..."
                        : drivers.length}
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

              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="absolute inset-x-0 top-0 h-1 bg-cyan-500" />

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Active Trips
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                      {loading
                        ? "..."
                        : activeTrips}
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

              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="absolute inset-x-0 top-0 h-1 bg-orange-500" />

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Maintenance
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                      {loading
                        ? "..."
                        : maintenanceDue}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      Records requiring attention
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

          {/* =========================================================
              PERFORMANCE
          ========================================================= */}

          <section className="mt-10">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Efficiency
              </p>

              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Performance Overview
              </h2>

              <p className="text-sm text-slate-500">
                Key indicators showing how efficiently
                FleetFlow is operating.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {/* TRIP COMPLETION */}

              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Trip Completion
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                      {loading
                        ? "..."
                        : `${formatNumber(
                            tripCompletionRate,
                          )}%`}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-600">
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
                        : `${formatNumber(
                            tripCompletionRate,
                          )}%`}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          Math.max(
                            tripCompletionRate,
                            0,
                          ),
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* FUEL EFFICIENCY */}

              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="absolute inset-x-0 top-0 h-1 bg-cyan-500" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Fuel Efficiency
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                      {loading
                        ? "..."
                        : fuelEfficiency > 0
                          ? `${formatNumber(
                              fuelEfficiency,
                            )} km/L`
                          : "0 km/L"}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-lg">
                    ⛽
                  </div>
                </div>

                <p className="mt-5 text-xs leading-5 text-slate-400">
                  Distance traveled per liter of
                  recorded fuel.
                </p>
              </div>

              {/* COST PER KM */}

              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="absolute inset-x-0 top-0 h-1 bg-orange-500" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Cost / Kilometer
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                      {loading
                        ? "..."
                        : `${formatNumber(
                            costPerKilometer,
                          )} ETB`}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg text-orange-600">
                    ₿
                  </div>
                </div>

                <p className="mt-5 text-xs leading-5 text-slate-400">
                  Operating cost generated per
                  kilometer traveled.
                </p>
              </div>

              {/* OPERATING MARGIN */}

              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div
                  className={`absolute inset-x-0 top-0 h-1 ${
                    revenueMargin >= 0
                      ? "bg-emerald-500"
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
                        : `${formatNumber(
                            revenueMargin,
                          )}%`}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${
                      revenueMargin >= 0
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    %
                  </div>
                </div>

                <p className="mt-5 text-xs leading-5 text-slate-400">
                  Net operating result as a share
                  of recorded revenue.
                </p>
              </div>
            </div>
          </section>

          {/* =========================================================
              ALERTS + FLEET STATUS
          ========================================================= */}

          <section className="mt-10 grid gap-5 lg:grid-cols-2">

            {/* ALERTS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-500">
                    Attention
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Operational Alerts
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Signals that may require management
                    action.
                  </p>
                </div>

                <a
                  href="/notifications"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  View alerts →
                </a>
              </div>

              <div className="mt-6 space-y-3">
                {alerts.map(
                  (alert, index) => {
                    const style =
                      alert.type === "danger"
                        ? "border-red-200 bg-red-50"
                        : alert.type ===
                            "warning"
                          ? "border-orange-200 bg-orange-50"
                          : alert.type ===
                              "success"
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-blue-200 bg-blue-50";

                    const iconStyle =
                      alert.type === "danger"
                        ? "bg-red-100 text-red-700"
                        : alert.type ===
                            "warning"
                          ? "bg-orange-100 text-orange-700"
                          : alert.type ===
                              "success"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700";

                    return (
                      <div
                        key={`${alert.title}-${index}`}
                        className={`rounded-xl border p-4 ${style}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${iconStyle}`}
                          >
                            {alert.type ===
                            "danger"
                              ? "!"
                              : alert.type ===
                                  "warning"
                                ? "!"
                                : alert.type ===
                                    "success"
                                  ? "✓"
                                  : "i"}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">
                              {alert.title}
                            </p>

                            <p className="mt-1 text-sm leading-5 text-slate-600">
                              {
                                alert.description
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* FLEET STATUS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  Fleet
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Fleet Status
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current distribution of vehicle
                  availability.
                </p>
              </div>

              <div className="mt-6 space-y-5">
                {[
                  {
                    label: "Available",
                    value:
                      availableVehicles,
                    color:
                      "bg-emerald-500",
                    text:
                      "text-emerald-600",
                  },
                  {
                    label: "On Trip",
                    value: activeTrips,
                    color:
                      "bg-blue-500",
                    text:
                      "text-blue-600",
                  },
                  {
                    label: "Maintenance",
                    value:
                      maintenanceVehicles,
                    color:
                      "bg-orange-500",
                    text:
                      "text-orange-600",
                  },
                  {
                    label: "Inactive",
                    value:
                      inactiveVehicles,
                    color:
                      "bg-red-500",
                    text:
                      "text-red-600",
                  },
                ].map((item) => {
                  const percentage =
                    vehicles.length > 0
                      ? Math.min(
                          (item.value /
                            vehicles.length) *
                            100,
                          100,
                        )
                      : 0;

                  return (
                    <div
                      key={item.label}
                    >
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-600">
                          {item.label}
                        </span>

                        <span
                          className={`font-bold ${item.text}`}
                        >
                          {item.value}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* =========================================================
              FINANCIAL PERFORMANCE
          ========================================================= */}

          <section className="mt-10">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                Finance
              </p>

              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Financial Performance
              </h2>

              <p className="text-sm text-slate-500">
                Revenue, operating costs, and cost
                composition.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Revenue
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-600">
                  {loading
                    ? "..."
                    : formatMoney(
                        totalRevenue,
                      )}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Total recorded trip revenue
                </p>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Net result
                    </span>

                    <span
                      className={`text-sm font-bold ${
                        netOperatingResult >=
                        0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatMoney(
                        netOperatingResult,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Operating Cost
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight text-orange-600">
                  {loading
                    ? "..."
                    : formatMoney(
                        totalOperatingCost,
                      )}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Total operating expenditure
                </p>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Revenue cost ratio
                    </span>

                    <span className="text-sm font-bold text-slate-700">
                      {formatNumber(
                        operatingCostRatio,
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Cost Breakdown
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500">
                        Fuel
                      </span>

                      <span className="font-bold text-cyan-600">
                        {formatMoney(
                          totalFuelCost,
                        )}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-cyan-500"
                        style={{
                          width: `${fuelCostShare}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500">
                        Maintenance
                      </span>

                      <span className="font-bold text-orange-600">
                        {formatMoney(
                          totalMaintenanceCost,
                        )}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{
                          width: `${maintenanceCostShare}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500">
                        Expenses
                      </span>

                      <span className="font-bold text-blue-600">
                        {formatMoney(
                          totalExpenses,
                        )}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: `${expenseCostShare}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    Cost Mix
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Share of total operating cost
                  </p>
                </div>

                <p className="text-xs font-semibold text-slate-500">
                  {formatMoney(
                    totalOperatingCost,
                  )}
                </p>
              </div>

              <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="bg-cyan-500 transition-all duration-700"
                  style={{
                    width: `${fuelCostShare}%`,
                  }}
                />

                <div
                  className="bg-orange-500 transition-all duration-700"
                  style={{
                    width: `${maintenanceCostShare}%`,
                  }}
                />

                <div
                  className="bg-blue-500 transition-all duration-700"
                  style={{
                    width: `${expenseCostShare}%`,
                  }}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
                <span className="flex items-center gap-2 text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                  Fuel {formatNumber(fuelCostShare)}%
                </span>

                <span className="flex items-center gap-2 text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                  Maintenance{" "}
                  {formatNumber(
                    maintenanceCostShare,
                  )}
                  %
                </span>

                <span className="flex items-center gap-2 text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  Expenses{" "}
                  {formatNumber(
                    expenseCostShare,
                  )}
                  %
                </span>
              </div>
            </div>
          </section>

          {/* =========================================================
              TRIP PERFORMANCE
          ========================================================= */}

          <section className="mt-10">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">
                Logistics
              </p>

              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Trip Performance
              </h2>

              <p className="text-sm text-slate-500">
                Current trip volume and completion
                activity.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Total Trips",
                  value: trips.length,
                  color:
                    "text-slate-900",
                  icon: "🛣️",
                },
                {
                  label: "In Progress",
                  value: activeTrips,
                  color:
                    "text-blue-600",
                  icon: "▶",
                },
                {
                  label: "Scheduled",
                  value: scheduledTrips,
                  color:
                    "text-orange-600",
                  icon: "◷",
                },
                {
                  label: "Completed",
                  value: completedTrips,
                  color:
                    "text-emerald-600",
                  icon: "✓",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">
                        {item.label}
                      </p>

                      <p
                        className={`mt-3 text-3xl font-bold tracking-tight ${item.color}`}
                      >
                        {loading
                          ? "..."
                          : item.value}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-sm">
                      {item.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    Trip completion
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Completed trips versus total recorded
                    trips
                  </p>
                </div>

                <span className="text-sm font-bold text-emerald-600">
                  {formatNumber(
                    tripCompletionRate,
                  )}
                  %
                </span>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      Math.max(
                        tripCompletionRate,
                        0,
                      ),
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          </section>

          {/* =========================================================
              RECENT TRIPS
          ========================================================= */}

          <section className="mt-10">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Activity
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Recent Trips
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest logistics activity recorded in
                  FleetFlow.
                </p>
              </div>

              <a
                href="/trips"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                View all trips →
              </a>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      {[
                        "Trip",
                        "Vehicle",
                        "Driver",
                        "Route",
                        "Date",
                        "Revenue",
                        "Status",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-10 text-center text-sm text-slate-400"
                        >
                          Loading recent trips...
                        </td>
                      </tr>
                    ) : recentTrips.length ===
                      0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-10 text-center text-sm text-slate-400"
                        >
                          No trip records available.
                        </td>
                      </tr>
                    ) : (
                      recentTrips.map(
                        (trip) => (
                          <tr
                            key={trip.id}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-900">
                                {trip.tripCode}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {trip.vehicleCode ||
                                "—"}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {trip.driverCode ||
                                "—"}
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-slate-700">
                                {trip.origin}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                →{" "}
                                {
                                  trip.destination
                                }
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-500">
                              {formatDate(
                                trip.tripDate,
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                              {formatMoney(
                                Number(
                                  trip.revenue ||
                                    0,
                                ),
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${getTripStatusStyle(
                                  trip.status,
                                )}`}
                              >
                                {trip.status ||
                                  "Unknown"}
                              </span>
                            </td>
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* =========================================================
              RECENT ACTIVITY
          ========================================================= */}

          <section className="mt-10 grid gap-5 lg:grid-cols-2">

            {/* MAINTENANCE */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
                    Maintenance
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Recent Maintenance
                  </h2>
                </div>

                <a
                  href="/maintenance"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  View all →
                </a>
              </div>

              <div className="mt-5 space-y-3">
                {loading ? (
                  <p className="py-6 text-center text-sm text-slate-400">
                    Loading maintenance...
                  </p>
                ) : recentMaintenance.length ===
                  0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">
                    No maintenance records available.
                  </p>
                ) : (
                  recentMaintenance.map(
                    (record) => (
                      <div
                        key={record.id}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">
                              {record.maintenanceCode}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {record.vehicleCode}{" "}
                              ·{" "}
                              {
                                record.maintenanceType
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatDate(
                                record.maintenanceDate,
                              )}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${getMaintenanceStatusStyle(
                              record.status,
                            )}`}
                          >
                            {record.status ||
                              "Unknown"}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                          <span className="text-xs text-slate-400">
                            Cost
                          </span>

                          <span className="text-sm font-bold text-slate-700">
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
                  )
                )}
              </div>
            </div>

            {/* EXPENSES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">
                    Finance
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Recent Expenses
                  </h2>
                </div>

                <a
                  href="/expenses"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  View all →
                </a>
              </div>

              <div className="mt-5 space-y-3">
                {loading ? (
                  <p className="py-6 text-center text-sm text-slate-400">
                    Loading expenses...
                  </p>
                ) : recentExpenses.length ===
                  0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">
                    No expense records available.
                  </p>
                ) : (
                  recentExpenses.map(
                    (expense) => (
                      <div
                        key={expense.id}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">
                              {expense.expenseCode}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {expense.category}
                              {" · "}
                              {expense.vehicleCode}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatDate(
                                expense.expenseDate,
                              )}
                            </p>
                          </div>

                          <span className="shrink-0 text-sm font-bold text-slate-800">
                            {formatMoney(
                              Number(
                                expense.amount ||
                                  0,
                              ),
                            )}
                          </span>
                        </div>

                        <div className="mt-3 border-t border-slate-200 pt-3">
                          <p className="truncate text-xs text-slate-400">
                            {expense.description ||
                              "No description"}
                          </p>
                        </div>
                      </div>
                    ),
                  )
                )}
              </div>
            </div>
          </section>

          {/* =========================================================
              MANAGEMENT SNAPSHOT
          ========================================================= */}

          <section className="mt-10">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Management
              </p>

              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Management Snapshot
              </h2>

              <p className="text-sm text-slate-500">
                High-level operating indicators for
                management review.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Total Distance
                </p>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {formatNumber(
                    totalDistance,
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  km traveled
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Fuel Consumed
                </p>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {formatNumber(
                    totalFuelLiters,
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  liters recorded
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Driver Utilization
                </p>

                <p className="mt-3 text-2xl font-bold text-blue-600">
                  {formatNumber(
                    driverUtilization,
                  )}
                  %
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  active driver workload
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Maintenance Records
                </p>

                <p className="mt-3 text-2xl font-bold text-orange-600">
                  {maintenance.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  total records
                </p>
              </div>
            </div>

            <div
              className={`mt-5 rounded-2xl border p-6 shadow-sm ${
                netOperatingResult < 0
                  ? "border-red-200 bg-red-50"
                  : maintenanceDue > 0
                    ? "border-orange-200 bg-orange-50"
                    : inactiveVehicles > 0
                      ? "border-blue-200 bg-blue-50"
                      : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Management Signal
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-slate-900">
                    {netOperatingResult < 0
                      ? "Financial performance requires attention"
                      : maintenanceDue > 0
                        ? "Maintenance workload requires review"
                        : inactiveVehicles > 0
                          ? "Fleet availability requires review"
                          : "Fleet is operating within normal signals"}
                  </h3>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                    {netOperatingResult < 0
                      ? "Recorded operating costs currently exceed trip revenue."
                      : maintenanceDue > 0
                        ? `${maintenanceDue} maintenance record${
                            maintenanceDue ===
                            1
                              ? ""
                              : "s"
                          } require management attention.`
                        : inactiveVehicles > 0
                          ? `${inactiveVehicles} vehicle${
                              inactiveVehicles ===
                              1
                                ? ""
                                : "s"
                            } are currently inactive.`
                          : "No major management exceptions were detected from the current dashboard data."}
                  </p>
                </div>

                <a
                  href="/recommendations"
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Open Decision Center →
                </a>
              </div>
            </div>
          </section>

          <footer className="mt-10 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
            FleetFlow ERP · Executive Dashboard
          </footer>
        </div>
      </main>
    </ProtectedPage>
  );
}
