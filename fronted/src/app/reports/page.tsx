"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedPage from "@/app/components/ProtectedPage";

interface Vehicle {
  id: number;
  vehicleCode: string;
  vehicleType?: string;
  make?: string;
  model?: string;
  year?: number;
  plateNumber?: string;
  status?: string;
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
  fuelUsed?: string | number;
  revenue?: string | number;
  cargo?: string;
  status: string;
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
  paymentMethod?: string;
  notes?: string | null;
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
  notes?: string | null;
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
  paymentMethod?: string;
  status: string;
  notes?: string | null;
}

function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data: unknown }).data)
  ) {
    return (data as { data: T[] }).data;
  }

  return [];
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

function formatDate(date: string) {
  if (!date) return "—";
  return date.substring(0, 10);
}

function statusClass(status: string) {
  const normalized = status?.toLowerCase();

  if (
    normalized === "completed" ||
    normalized === "active" ||
    normalized === "approved"
  ) {
    return "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20";
  }

  if (
    normalized === "pending" ||
    normalized === "planned" ||
    normalized === "maintenance"
  ) {
    return "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20";
  }

  if (
    normalized === "cancelled" ||
    normalized === "inactive" ||
    normalized === "rejected"
  ) {
    return "bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20";
  }

  if (
    normalized === "in progress" ||
    normalized === "in_progress"
  ) {
    return "bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20";
  }

  return "bg-slate-800 text-slate-300 ring-1 ring-inset ring-slate-700";
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
        status,
      )}`}
    >
      {status || "Unknown"}
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {eyebrow}
      </p>

      <div className="mt-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  accent = "blue",
}: {
  label: string;
  value: string;
  detail: string;
  accent?: "blue" | "emerald" | "amber" | "purple" | "red";
}) {
  const accentMap = {
    blue: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    purple: "bg-purple-500/10 text-purple-400 ring-purple-500/20",
    red: "bg-red-500/10 text-red-400 ring-red-500/20",
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-slate-400">{label}</p>

        <span
          className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${accentMap[accent]}`}
        >
          KPI
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 py-3 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>

      <span className={`text-sm font-semibold ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "blue" | "emerald" | "purple";
}) {
  const colors = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    purple: "bg-purple-500",
  };

  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm text-slate-300">{label}</span>

        <span className="text-sm font-semibold text-white">
          {formatNumber(value)}%
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors[color]}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuel, setFuel] = useState<Fuel[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        fleetData,
        tripsData,
        fuelData,
        maintenanceData,
        expensesData,
      ] = await Promise.all([
        apiFetch("/reports/fleet"),
        apiFetch("/reports/trips"),
        apiFetch("/reports/fuel"),
        apiFetch("/reports/maintenance"),
        apiFetch("/reports/expenses"),
      ]);

      setVehicles(extractArray<Vehicle>(fleetData));
      setTrips(extractArray<Trip>(tripsData));
      setFuel(extractArray<Fuel>(fuelData));
      setMaintenance(extractArray<Maintenance>(maintenanceData));
      setExpenses(extractArray<Expense>(expensesData));
    } catch (err) {
      console.error("Reports error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load report data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const reportMetrics = useMemo(() => {
    const activeVehicles = vehicles.filter(
      (vehicle) => vehicle.status?.toLowerCase() === "active",
    ).length;

    const maintenanceVehicles = vehicles.filter(
      (vehicle) => vehicle.status?.toLowerCase() === "maintenance",
    ).length;

    const inactiveVehicles = vehicles.filter(
      (vehicle) => vehicle.status?.toLowerCase() === "inactive",
    ).length;

    const vehicleUtilization =
      vehicles.length > 0
        ? (activeVehicles / vehicles.length) * 100
        : 0;

    const completedTrips = trips.filter(
      (trip) => trip.status?.toLowerCase() === "completed",
    ).length;

    const activeTrips = trips.filter((trip) => {
      const status = trip.status?.toLowerCase();

      return status === "in progress" || status === "active";
    }).length;

    const plannedTrips = trips.filter(
      (trip) => trip.status?.toLowerCase() === "planned",
    ).length;

    const tripCompletionRate =
      trips.length > 0
        ? (completedTrips / trips.length) * 100
        : 0;

    const totalDistance = trips.reduce(
      (sum, trip) => sum + Number(trip.distance || 0),
      0,
    );

    const totalRevenue = trips.reduce(
      (sum, trip) => sum + Number(trip.revenue || 0),
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
      totalFuelLiters > 0
        ? totalDistance / totalFuelLiters
        : 0;

    const completedMaintenance = maintenance.filter(
      (record) => record.status?.toLowerCase() === "completed",
    ).length;

    const pendingMaintenance = maintenance.filter(
      (record) => record.status?.toLowerCase() === "pending",
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
      totalFuelCost +
      totalMaintenanceCost +
      totalExpenses;

    const operatingProfit =
      totalRevenue - totalOperatingCost;

    const profitMargin =
      totalRevenue > 0
        ? (operatingProfit / totalRevenue) * 100
        : 0;

    const uniqueDrivers = new Set(
      trips
        .map((trip) => trip.driverCode)
        .filter(Boolean),
    );

    const uniqueVehicles = new Set(
      trips
        .map((trip) => trip.vehicleCode)
        .filter(Boolean),
    );

    return {
      activeVehicles,
      maintenanceVehicles,
      inactiveVehicles,
      vehicleUtilization,
      completedTrips,
      activeTrips,
      plannedTrips,
      tripCompletionRate,
      totalDistance,
      totalRevenue,
      totalFuelLiters,
      totalFuelCost,
      fuelEfficiency,
      completedMaintenance,
      pendingMaintenance,
      totalMaintenanceCost,
      totalExpenses,
      totalOperatingCost,
      operatingProfit,
      profitMargin,
      uniqueDrivers: uniqueDrivers.size,
      uniqueVehicles: uniqueVehicles.size,
    };
  }, [vehicles, trips, fuel, maintenance, expenses]);

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
      <ProtectedPage permission="reports">
        <main className="min-h-screen bg-slate-950 p-6 text-white md:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-10 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-blue-400" />
              </div>

              <h1 className="mt-5 text-xl font-semibold">
                Loading reports
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Preparing FleetFlow operational intelligence...
              </p>
            </div>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  if (error) {
    return (
      <ProtectedPage permission="reports">
        <main className="min-h-screen bg-slate-950 p-6 text-white md:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-red-900/70 bg-red-950/30 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
                !
              </div>

              <h1 className="mt-5 text-2xl font-bold">
                Reports unavailable
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-red-300">
                {error}
              </p>

              <button
                onClick={fetchReportData}
                className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage permission="reports">
      <main className="min-h-screen bg-slate-950 p-6 text-white md:p-8">
        <div className="mx-auto max-w-7xl space-y-8">

          {/* HEADER */}
          <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                Business Intelligence
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                Reports
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Operational performance, fleet utilization, cost
                analysis, and profitability across FleetFlow.
              </p>
            </div>

            <button
              onClick={fetchReportData}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              <span>↻</span>
              Refresh Reports
            </button>
          </section>

          {/* KPI CARDS */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Fleet Utilization"
              value={`${formatNumber(
                reportMetrics.vehicleUtilization,
              )}%`}
              detail={`${reportMetrics.activeVehicles} active vehicles`}
              accent="blue"
            />

            <MetricCard
              label="Trip Completion"
              value={`${formatNumber(
                reportMetrics.tripCompletionRate,
              )}%`}
              detail={`${reportMetrics.completedTrips} completed trips`}
              accent="emerald"
            />

            <MetricCard
              label="Fuel Efficiency"
              value={`${formatNumber(
                reportMetrics.fuelEfficiency,
              )} km/L`}
              detail={`${formatNumber(
                reportMetrics.totalFuelLiters,
              )} L recorded`}
              accent="amber"
            />

            <MetricCard
              label="Operating Profit"
              value={formatNumber(reportMetrics.operatingProfit)}
              detail={`${formatNumber(
                reportMetrics.profitMargin,
              )}% operating margin`}
              accent={
                reportMetrics.operatingProfit >= 0
                  ? "emerald"
                  : "red"
              }
            />
          </section>

          {/* OPERATIONS */}
          <section>
            <SectionHeader
              eyebrow="Operational overview"
              title="Operations Summary"
              description="High-level fleet, trip, and driver activity."
            />

            <div className="grid gap-5 lg:grid-cols-3">

              {/* FLEET */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">
                    Fleet Performance
                  </h3>

                  <span className="rounded-lg bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-400">
                    Fleet
                  </span>
                </div>

                <div className="mt-5">
                  <SummaryRow
                    label="Total Vehicles"
                    value={vehicles.length}
                  />

                  <SummaryRow
                    label="Active"
                    value={reportMetrics.activeVehicles}
                    valueClass="text-emerald-400"
                  />

                  <SummaryRow
                    label="Maintenance"
                    value={reportMetrics.maintenanceVehicles}
                    valueClass="text-amber-400"
                  />

                  <SummaryRow
                    label="Inactive"
                    value={reportMetrics.inactiveVehicles}
                    valueClass="text-red-400"
                  />
                </div>
              </div>

              {/* TRIPS */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">
                    Trip Performance
                  </h3>

                  <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400">
                    Trips
                  </span>
                </div>

                <div className="mt-5">
                  <SummaryRow
                    label="Total Trips"
                    value={trips.length}
                  />

                  <SummaryRow
                    label="Completed"
                    value={reportMetrics.completedTrips}
                    valueClass="text-emerald-400"
                  />

                  <SummaryRow
                    label="Active"
                    value={reportMetrics.activeTrips}
                    valueClass="text-blue-400"
                  />

                  <SummaryRow
                    label="Planned"
                    value={reportMetrics.plannedTrips}
                    valueClass="text-amber-400"
                  />

                  <SummaryRow
                    label="Distance"
                    value={`${formatNumber(
                      reportMetrics.totalDistance,
                    )} km`}
                  />
                </div>
              </div>

              {/* DRIVER ACTIVITY */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">
                    Driver Activity
                  </h3>

                  <span className="rounded-lg bg-purple-500/10 px-2 py-1 text-xs font-semibold text-purple-400">
                    Activity
                  </span>
                </div>

                <div className="mt-5">
                  <SummaryRow
                    label="Drivers in Reports"
                    value={reportMetrics.uniqueDrivers}
                  />

                  <SummaryRow
                    label="Vehicles in Trips"
                    value={reportMetrics.uniqueVehicles}
                  />

                  <SummaryRow
                    label="Active Trips"
                    value={reportMetrics.activeTrips}
                    valueClass="text-blue-400"
                  />

                  <SummaryRow
                    label="Completed Trips"
                    value={reportMetrics.completedTrips}
                    valueClass="text-emerald-400"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* COST ANALYSIS */}
          <section>
            <SectionHeader
              eyebrow="Financial overview"
              title="Cost Analysis"
              description="Revenue and operating costs calculated from recorded activity."
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Revenue"
                value={formatNumber(reportMetrics.totalRevenue)}
                detail="From recorded trips"
                accent="emerald"
              />

              <MetricCard
                label="Fuel Cost"
                value={formatNumber(reportMetrics.totalFuelCost)}
                detail={`${formatNumber(
                  reportMetrics.totalFuelLiters,
                )} liters consumed`}
                accent="amber"
              />

              <MetricCard
                label="Maintenance Cost"
                value={formatNumber(
                  reportMetrics.totalMaintenanceCost,
                )}
                detail={`${reportMetrics.completedMaintenance} completed / ${reportMetrics.pendingMaintenance} pending`}
                accent="purple"
              />

              <MetricCard
                label="Other Expenses"
                value={formatNumber(reportMetrics.totalExpenses)}
                detail={`${expenses.length} expense records`}
                accent="red"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    Total Operating Cost
                  </p>

                  <p className="mt-1 text-2xl font-bold text-white">
                    {formatNumber(
                      reportMetrics.totalOperatingCost,
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-800/80 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Profit Margin
                  </p>

                  <p
                    className={`mt-1 text-lg font-bold ${
                      reportMetrics.profitMargin >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatNumber(
                      reportMetrics.profitMargin,
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* PERFORMANCE */}
          <section>
            <SectionHeader
              eyebrow="Performance indicators"
              title="Performance"
              description="Visual indicators for the most important operational KPIs."
            />

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
              <div className="space-y-7">
                <ProgressBar
                  label="Fleet Utilization"
                  value={reportMetrics.vehicleUtilization}
                  color="blue"
                />

                <ProgressBar
                  label="Trip Completion"
                  value={reportMetrics.tripCompletionRate}
                  color="emerald"
                />

                <ProgressBar
                  label="Profit Margin"
                  value={Math.max(
                    reportMetrics.profitMargin,
                    0,
                  )}
                  color="purple"
                />
              </div>
            </div>
          </section>

          {/* RECENT TRIPS */}
          <section>
            <SectionHeader
              eyebrow="Latest activity"
              title="Recent Trips"
              description="The five most recent recorded trips."
            />

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="border-b border-slate-800 bg-slate-900">
                    <tr className="text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4 font-semibold">
                        Trip
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Route
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Vehicle
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Driver
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Date
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Distance
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/80">
                    {recentTrips.map((trip) => (
                      <tr
                        key={trip.id}
                        className="transition hover:bg-slate-800/30"
                      >
                        <td className="px-5 py-4">
                          <span className="font-semibold text-white">
                            {trip.tripCode}
                          </span>
                        </td>

                        <td className="max-w-[240px] px-5 py-4">
                          <p className="truncate text-sm text-slate-300">
                            {trip.origin} → {trip.destination}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {trip.vehicleCode}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {trip.driverCode}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {formatDate(trip.tripDate)}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {formatNumber(
                            Number(trip.distance || 0),
                          )}{" "}
                          km
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={trip.status} />
                        </td>
                      </tr>
                    ))}

                    {recentTrips.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-10 text-center text-sm text-slate-500"
                        >
                          No trip records available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* MAINTENANCE */}
          <section>
            <SectionHeader
              eyebrow="Fleet reliability"
              title="Maintenance Report"
              description="Recent maintenance activity, costs, and service providers."
            />

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="border-b border-slate-800 bg-slate-900">
                    <tr className="text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4 font-semibold">
                        Maintenance
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Type
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Date
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Mileage
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Cost
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Provider
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/80">
                    {recentMaintenance.map((record) => (
                      <tr
                        key={record.id}
                        className="transition hover:bg-slate-800/30"
                      >
                        <td className="max-w-[280px] px-5 py-4">
                          <p className="font-semibold text-white">
                            {record.maintenanceCode}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {record.vehicleCode} ·{" "}
                            {record.description}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {record.maintenanceType}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {formatDate(
                            record.maintenanceDate,
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {formatNumber(
                            Number(record.mileage || 0),
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-white">
                          {formatNumber(
                            Number(record.cost || 0),
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {record.serviceProvider}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={record.status} />
                        </td>
                      </tr>
                    ))}

                    {recentMaintenance.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-10 text-center text-sm text-slate-500"
                        >
                          No maintenance records available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* EXPENSES */}
          <section>
            <SectionHeader
              eyebrow="Financial activity"
              title="Expense Report"
              description="Recent operating expenses recorded in FleetFlow."
            />

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="border-b border-slate-800 bg-slate-900">
                    <tr className="text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4 font-semibold">
                        Expense
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Date
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Category
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Description
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Amount
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Vendor
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/80">
                    {recentExpenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="transition hover:bg-slate-800/30"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">
                            {expense.expenseCode}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {formatDate(expense.expenseDate)}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                            {expense.category}
                          </span>
                        </td>

                        <td className="max-w-[250px] px-5 py-4 text-sm text-slate-300">
                          <p className="truncate">
                            {expense.description}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-white">
                          {formatNumber(
                            Number(expense.amount || 0),
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {expense.vendor}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={expense.status} />
                        </td>
                      </tr>
                    ))}

                    {recentExpenses.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-10 text-center text-sm text-slate-500"
                        >
                          No expense records available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* FUEL */}
          <section>
            <SectionHeader
              eyebrow="Fuel intelligence"
              title="Fuel Consumption Report"
              description="Recent fuel purchases and fleet consumption activity."
            />

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="border-b border-slate-800 bg-slate-900">
                    <tr className="text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4 font-semibold">
                        Fuel
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Vehicle
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Driver
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Date
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Liters
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Cost
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Station
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Odometer
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/80">
                    {recentFuel.map((record) => (
                      <tr
                        key={record.id}
                        className="transition hover:bg-slate-800/30"
                      >
                        <td className="px-5 py-4 font-semibold text-white">
                          {record.fuelCode}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {record.vehicleCode}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {record.driverCode}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {formatDate(record.fuelDate)}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {formatNumber(
                            Number(record.liters || 0),
                          )}{" "}
                          L
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-white">
                          {formatNumber(
                            Number(record.cost || 0),
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {record.fuelStation}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {formatNumber(
                            Number(record.odometer || 0),
                          )}
                        </td>
                      </tr>
                    ))}

                    {recentFuel.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-5 py-10 text-center text-sm text-slate-500"
                        >
                          No fuel records available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* FOOTER SUMMARY */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-white">
                  FleetFlow Report Summary
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Based on the currently recorded operational data.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="rounded-lg bg-slate-800 px-3 py-1.5">
                  {vehicles.length} vehicles
                </span>

                <span className="rounded-lg bg-slate-800 px-3 py-1.5">
                  {trips.length} trips
                </span>

                <span className="rounded-lg bg-slate-800 px-3 py-1.5">
                  {fuel.length} fuel records
                </span>

                <span className="rounded-lg bg-slate-800 px-3 py-1.5">
                  {maintenance.length} maintenance records
                </span>

                <span className="rounded-lg bg-slate-800 px-3 py-1.5">
                  {expenses.length} expenses
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </ProtectedPage>
  );
}
