"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedPage from "@/app/components/ProtectedPage";
import { apiFetch } from "@/lib/api";

interface FleetKpis {
  totalTrips: number;
  completedTrips: number;
  plannedTrips: number;
  activeTrips: number;
  completionRate: number;
  totalDistance: number;
  totalRevenue: number;
  fuelCost: number;
  maintenanceCost: number;
  expenseCost: number;
  totalOperatingCost: number;
  profit: number;
  profitMargin: number;
  totalFuelLiters: number;
  fuelEfficiency: number;
  costPerKm: number;
  revenuePerKm: number;
}

interface VehicleAnalytics {
  vehicleCode: string;
  tripsCount: number;
  completedTrips: number;
  distance: number;
  revenue: number;
  fuelLiters: number;
  fuelCost: number;
  maintenanceCost: number;
  expenseCost: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
  fuelEfficiency: number;
  costPerKm: number;
  revenuePerKm: number;
}

interface ExpenseBreakdown {
  category: string;
  amount: number;
}

interface MonthlyAnalytics {
  month: string;
  trips: number;
  distance: number;
  revenue: number;
  fuelCost: number;
  maintenanceCost: number;
  expenseCost: number;
  totalCost: number;
  profit: number;
  costPerKm: number;
  revenuePerKm: number;
}

interface Insight {
  title: string;
  description: string;
  type: "success" | "warning" | "info" | "critical";
}

function num(value: unknown): number {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

function money(value: number): string {
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} ETB`;
}

function number(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function whole(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function percent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function isCompletedTrip(status?: string): boolean {
  const normalized = status?.toLowerCase().trim();

  return (
    normalized === "completed" ||
    normalized === "complete" ||
    normalized === "delivered" ||
    normalized === "closed" ||
    normalized === "finished"
  );
}

function insightClasses(
  type: Insight["type"],
): string {
  if (type === "success") {
    return "border-emerald-200 bg-emerald-50";
  }

  if (type === "warning") {
    return "border-amber-200 bg-amber-50";
  }

  if (type === "critical") {
    return "border-red-200 bg-red-50";
  }

  return "border-blue-200 bg-blue-50";
}

function insightIcon(
  type: Insight["type"],
): string {
  if (type === "success") return "✓";
  if (type === "warning") return "!";
  if (type === "critical") return "!";
  return "i";
}

function insightIconClasses(
  type: Insight["type"],
): string {
  if (type === "success") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (type === "warning") {
    return "bg-amber-100 text-amber-700";
  }

  if (type === "critical") {
    return "bg-red-100 text-red-700";
  }

  return "bg-blue-100 text-blue-700";
}

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState<FleetKpis | null>(null);

  const [vehiclePerformance, setVehiclePerformance] =
    useState<VehicleAnalytics[]>([]);

  const [expenseBreakdown, setExpenseBreakdown] =
    useState<ExpenseBreakdown[]>([]);

  const [monthlyAnalytics, setMonthlyAnalytics] =
    useState<MonthlyAnalytics[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        kpisData,
        vehiclesData,
        expensesData,
        monthlyData,
      ] = await Promise.all([
        apiFetch("/analytics/kpis"),
        apiFetch("/analytics/vehicles"),
        apiFetch("/analytics/expenses"),
        apiFetch("/analytics/monthly"),
      ]);

      setKpis(kpisData);

      setVehiclePerformance(
        Array.isArray(vehiclesData)
          ? vehiclesData
          : [],
      );

      setExpenseBreakdown(
        Array.isArray(expensesData)
          ? expensesData
          : [],
      );

      setMonthlyAnalytics(
        Array.isArray(monthlyData)
          ? monthlyData
          : [],
      );
    } catch (err) {
      console.error("Analytics error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load analytics data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const fleetSize = vehiclePerformance.length;

  const profitableVehicles =
    vehiclePerformance.filter(
      (vehicle) => vehicle.profit > 0,
    ).length;

  const lossMakingVehicles =
    vehiclePerformance.filter(
      (vehicle) => vehicle.profit < 0,
    ).length;

  const averageProfit =
    fleetSize > 0
      ? vehiclePerformance.reduce(
          (sum, vehicle) =>
            sum + num(vehicle.profit),
          0,
        ) / fleetSize
      : 0;

  const averageRevenuePerKm =
    fleetSize > 0
      ? vehiclePerformance.reduce(
          (sum, vehicle) =>
            sum + num(vehicle.revenuePerKm),
          0,
        ) / fleetSize
      : 0;

  const averageCostPerKm =
    fleetSize > 0
      ? vehiclePerformance.reduce(
          (sum, vehicle) =>
            sum + num(vehicle.costPerKm),
          0,
        ) / fleetSize
      : 0;

  const averageFuelEfficiency =
    vehiclePerformance.filter(
      (vehicle) => num(vehicle.fuelEfficiency) > 0,
    ).length > 0
      ? vehiclePerformance
          .filter(
            (vehicle) =>
              num(vehicle.fuelEfficiency) > 0,
          )
          .reduce(
            (sum, vehicle) =>
              sum + num(vehicle.fuelEfficiency),
            0,
          ) /
        vehiclePerformance.filter(
          (vehicle) =>
            num(vehicle.fuelEfficiency) > 0,
        ).length
      : 0;

  const fleetUtilization =
    kpis && kpis.totalTrips > 0
      ? (kpis.completedTrips / kpis.totalTrips) * 100
      : 0;

  const bestVehicle = useMemo(() => {
    if (vehiclePerformance.length === 0) {
      return null;
    }

    return [...vehiclePerformance].sort(
      (a, b) => b.profit - a.profit,
    )[0];
  }, [vehiclePerformance]);

  const worstVehicle = useMemo(() => {
    if (vehiclePerformance.length === 0) {
      return null;
    }

    return [...vehiclePerformance].sort(
      (a, b) => a.profit - b.profit,
    )[0];
  }, [vehiclePerformance]);

  const mostEfficientVehicle = useMemo(() => {
    const vehicles =
      vehiclePerformance.filter(
        (vehicle) =>
          num(vehicle.fuelEfficiency) > 0,
      );

    if (vehicles.length === 0) {
      return null;
    }

    return [...vehicles].sort(
      (a, b) =>
        b.fuelEfficiency -
        a.fuelEfficiency,
    )[0];
  }, [vehiclePerformance]);

  const highestCostPerKmVehicle = useMemo(() => {
    const vehicles =
      vehiclePerformance.filter(
        (vehicle) =>
          num(vehicle.costPerKm) > 0,
      );

    if (vehicles.length === 0) {
      return null;
    }

    return [...vehicles].sort(
      (a, b) =>
        b.costPerKm - a.costPerKm,
    )[0];
  }, [vehiclePerformance]);

  const rankedVehicles = useMemo(() => {
    return [...vehiclePerformance].sort(
      (a, b) => b.profit - a.profit,
    );
  }, [vehiclePerformance]);

  const insights = useMemo<Insight[]>(() => {
    if (!kpis) {
      return [];
    }

    const results: Insight[] = [];

    /*
     * PROFITABILITY
     */
    if (kpis.profit < 0) {
      results.push({
        title: "Fleet profitability requires immediate attention",
        description: `The fleet generated ${money(
          kpis.totalRevenue,
        )} in revenue against ${money(
          kpis.totalOperatingCost,
        )} in operating costs, resulting in a negative operating result.`,
        type: "critical",
      });
    } else if (kpis.profitMargin >= 25) {
      results.push({
        title: "Fleet profitability is strong",
        description: `The fleet is operating at a ${percent(
          kpis.profitMargin,
        )} operating margin.`,
        type: "success",
      });
    } else if (kpis.profitMargin >= 15) {
      results.push({
        title: "Fleet profitability is healthy",
        description: `The current operating margin is ${percent(
          kpis.profitMargin,
        )}.`,
        type: "success",
      });
    } else {
      results.push({
        title: "Fleet margin has improvement potential",
        description: `The current operating margin is ${percent(
          kpis.profitMargin,
        )}. Cost control and vehicle-level profitability should be reviewed.`,
        type: "warning",
      });
    }

    /*
     * VEHICLE PROFITABILITY
     */
    if (lossMakingVehicles > 0) {
      results.push({
        title: "Loss-making vehicles detected",
        description: `${lossMakingVehicles} vehicle${
          lossMakingVehicles === 1
            ? ""
            : "s"
        } currently generate${
          lossMakingVehicles === 1
            ? "s"
            : ""
        } a negative operating result.`,
        type: "critical",
      });
    } else if (profitableVehicles > 0) {
      results.push({
        title: "Vehicle profitability is positive",
        description: `${profitableVehicles} of ${fleetSize} analyzed vehicles are currently profitable.`,
        type: "success",
      });
    }

    /*
     * COMPLETION
     */
    if (kpis.completionRate >= 80) {
      results.push({
        title: "Strong trip completion",
        description: `${percent(
          kpis.completionRate,
        )} of recorded trips are completed.`,
        type: "success",
      });
    } else if (kpis.completionRate >= 60) {
      results.push({
        title: "Trip completion is moderate",
        description: `${percent(
          kpis.completionRate,
        )} of recorded trips are completed. Unfinished trips should be reviewed.`,
        type: "warning",
      });
    } else {
      results.push({
        title: "Trip completion requires attention",
        description: `Only ${percent(
          kpis.completionRate,
        )} of recorded trips are completed.`,
        type: "critical",
      });
    }

    /*
     * FUEL
     */
    if (kpis.fuelEfficiency > 0) {
      if (
        averageFuelEfficiency > 0 &&
        kpis.fuelEfficiency >=
          averageFuelEfficiency
      ) {
        results.push({
          title: "Fleet fuel efficiency is performing well",
          description: `Fleet efficiency is ${kpis.fuelEfficiency.toFixed(
            2,
          )} km/L, at or above the analyzed vehicle benchmark.`,
          type: "success",
        });
      } else {
        results.push({
          title: "Fuel efficiency is an improvement opportunity",
          description: `Fleet efficiency is ${kpis.fuelEfficiency.toFixed(
            2,
          )} km/L.`,
          type: "warning",
        });
      }
    } else {
      results.push({
        title: "Fuel efficiency data is limited",
        description:
          "No reliable fuel-efficiency measurement is currently available.",
        type: "info",
      });
    }

    /*
     * COST PER KM
     */
    if (
      kpis.costPerKm > 0 &&
      kpis.revenuePerKm > 0
    ) {
      if (
        kpis.costPerKm >=
        kpis.revenuePerKm
      ) {
        results.push({
          title: "Cost per km is exceeding revenue per km",
          description: `The fleet spends ${money(
            kpis.costPerKm,
          )} per km while generating ${money(
            kpis.revenuePerKm,
          )} per km.`,
          type: "critical",
        });
      } else if (
        kpis.costPerKm >
        kpis.revenuePerKm * 0.8
      ) {
        results.push({
          title: "Cost efficiency has limited headroom",
          description:
            "Operating cost per km is relatively close to revenue per km.",
          type: "warning",
        });
      }
    }

    /*
     * ACTIVE TRIPS
     */
    if (kpis.activeTrips > 0) {
      results.push({
        title: "Active operations are underway",
        description: `${kpis.activeTrips} trip${
          kpis.activeTrips === 1
            ? ""
            : "s"
        } currently have an active or in-progress status.`,
        type: "info",
      });
    }

    return results;
  }, [
    kpis,
    fleetSize,
    profitableVehicles,
    lossMakingVehicles,
    averageFuelEfficiency,
  ]);

  const totalExpenseBreakdown =
    expenseBreakdown.reduce(
      (sum, item) =>
        sum + num(item.amount),
      0,
    );

  const maxMonthlyRevenue = Math.max(
    ...monthlyAnalytics.map(
      (item) => num(item.revenue),
    ),
    1,
  );

  const maxMonthlyProfit = Math.max(
    ...monthlyAnalytics.map(
      (item) => Math.abs(num(item.profit)),
    ),
    1,
  );

  const maxVehicleProfit = Math.max(
    ...vehiclePerformance.map(
      (vehicle) =>
        Math.max(num(vehicle.profit), 0),
    ),
    1,
  );

  if (loading) {
    return (
      <ProtectedPage permission="analytics">
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex min-h-[70vh] items-center justify-center">
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="mt-5 text-lg font-semibold text-slate-700">
                  Loading FleetFlow Analytics...
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Preparing business intelligence and
                  performance analysis.
                </p>
              </div>
            </div>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  if (error) {
    return (
      <ProtectedPage permission="analytics">
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
              <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                Business Intelligence Error
              </p>

              <h1 className="mt-2 text-2xl font-bold text-red-800">
                Analytics could not load
              </h1>

              <p className="mt-3 text-sm leading-6 text-red-700">
                {error}
              </p>

              <button
                onClick={loadAnalytics}
                className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Retry Analytics
              </button>
            </div>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage permission="analytics">
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* HEADER */}
          <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                  FleetFlow Business Intelligence
                </p>

                <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                  Business Analytics
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                  A consolidated view of fleet profitability,
                  operational efficiency, fuel performance,
                  cost structure, and management-level trends.
                </p>
              </div>

              <button
                onClick={loadAnalytics}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Refresh Analytics
              </button>
            </div>
          </section>

          {/* PRIMARY KPIs */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Fleet Revenue
              </p>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                {money(num(kpis?.totalRevenue))}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {money(
                  num(kpis?.revenuePerKm),
                )}{" "}
                revenue / km
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Operating Cost
              </p>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                {money(
                  num(kpis?.totalOperatingCost),
                )}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {money(
                  num(kpis?.costPerKm),
                )}{" "}
                cost / km
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Operating Result
              </p>

              <p
                className={`mt-3 text-2xl font-bold ${
                  num(kpis?.profit) >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {money(num(kpis?.profit))}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {percent(
                  num(kpis?.profitMargin),
                )}{" "}
                operating margin
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Completed Trips
              </p>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                {whole(
                  num(kpis?.completedTrips),
                )}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {percent(
                  num(kpis?.completionRate),
                )}{" "}
                completion rate
              </p>
            </div>
          </section>

          {/* OPERATIONAL KPIs */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Fleet Size
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {whole(fleetSize)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Vehicles with analytics data
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Distance
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {whole(
                  num(kpis?.totalDistance),
                )}{" "}
                km
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Completed-trip distance
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Fuel Efficiency
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {num(
                  kpis?.fuelEfficiency,
                ).toFixed(2)}{" "}
                km/L
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Fleet operational efficiency
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Active Trips
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {whole(
                  num(kpis?.activeTrips),
                )}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Current operational activity
              </p>
            </div>
          </section>

          {/* MANAGEMENT SNAPSHOT */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                Profitable Vehicles
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-800">
                {profitableVehicles}
              </p>

              <p className="mt-1 text-xs text-emerald-700">
                {fleetSize > 0
                  ? percent(
                      (profitableVehicles /
                        fleetSize) *
                        100,
                    )
                  : "0%"}{" "}
                of analyzed fleet
              </p>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                Loss-Making Vehicles
              </p>

              <p className="mt-2 text-2xl font-bold text-red-800">
                {lossMakingVehicles}
              </p>

              <p className="mt-1 text-xs text-red-700">
                Priority for profitability review
              </p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                Avg Revenue / KM
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-800">
                {money(
                  averageRevenuePerKm,
                )}
              </p>

              <p className="mt-1 text-xs text-blue-700">
                Vehicle-level benchmark
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                Avg Cost / KM
              </p>

              <p className="mt-2 text-2xl font-bold text-amber-800">
                {money(
                  averageCostPerKm,
                )}
              </p>

              <p className="mt-1 text-xs text-amber-700">
                Vehicle-level benchmark
              </p>
            </div>
          </section>

          {/* BUSINESS INSIGHTS */}
          <section>
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Decision Support
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Business Insights
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Automatically generated observations from
                current fleet performance data.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {insights.map(
                (insight, index) => (
                  <div
                    key={`${insight.title}-${index}`}
                    className={`rounded-2xl border p-5 ${insightClasses(
                      insight.type,
                    )}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${insightIconClasses(
                          insight.type,
                        )}`}
                      >
                        {insightIcon(
                          insight.type,
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          {insight.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* PERFORMANCE HIGHLIGHTS */}
          <section>
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Fleet Leaders
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Performance Highlights
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                  Best Result
                </p>

                <p className="mt-3 text-lg font-bold text-slate-900">
                  {bestVehicle?.vehicleCode ??
                    "N/A"}
                </p>

                <p className="mt-1 text-sm text-emerald-600">
                  {bestVehicle
                    ? money(
                        num(
                          bestVehicle.profit,
                        ),
                      )
                    : "No data"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                  Weakest Result
                </p>

                <p className="mt-3 text-lg font-bold text-slate-900">
                  {worstVehicle?.vehicleCode ??
                    "N/A"}
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {worstVehicle
                    ? money(
                        num(
                          worstVehicle.profit,
                        ),
                      )
                    : "No data"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                  Most Fuel Efficient
                </p>

                <p className="mt-3 text-lg font-bold text-slate-900">
                  {mostEfficientVehicle?.vehicleCode ??
                    "N/A"}
                </p>

                <p className="mt-1 text-sm text-blue-600">
                  {mostEfficientVehicle
                    ? `${num(
                        mostEfficientVehicle.fuelEfficiency,
                      ).toFixed(2)} km/L`
                    : "No data"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                  Highest Cost / KM
                </p>

                <p className="mt-3 text-lg font-bold text-slate-900">
                  {highestCostPerKmVehicle?.vehicleCode ??
                    "N/A"}
                </p>

                <p className="mt-1 text-sm text-amber-600">
                  {highestCostPerKmVehicle
                    ? money(
                        num(
                          highestCostPerKmVehicle.costPerKm,
                        ),
                      )
                    : "No data"}
                </p>
              </div>
            </div>
          </section>

          {/* MONTHLY PERFORMANCE */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Trend Analysis
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Monthly Performance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Revenue and operating-result movement over
                time.
              </p>
            </div>

            {monthlyAnalytics.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
                No monthly analytics data available.
              </div>
            ) : (
              <div className="space-y-6">
                {monthlyAnalytics.map(
                  (month) => {
                    const revenue =
                      num(month.revenue);

                    const profit =
                      num(month.profit);

                    const revenueWidth =
                      (revenue /
                        maxMonthlyRevenue) *
                      100;

                    const profitWidth =
                      (Math.abs(profit) /
                        maxMonthlyProfit) *
                      100;

                    return (
                      <div
                        key={month.month}
                        className="rounded-xl border border-slate-100 p-4"
                      >
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {month.month}
                            </p>

                            <p className="text-xs text-slate-400">
                              {whole(
                                num(
                                  month.trips,
                                ),
                              )}{" "}
                              trips •{" "}
                              {whole(
                                num(
                                  month.distance,
                                ),
                              )}{" "}
                              km
                            </p>
                          </div>

                          <div
                            className={`text-sm font-bold ${
                              profit >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {money(profit)}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="mb-1 flex justify-between text-xs text-slate-500">
                              <span>
                                Revenue
                              </span>

                              <span>
                                {money(
                                  revenue,
                                )}
                              </span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      revenueWidth,
                                    ),
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="mb-1 flex justify-between text-xs text-slate-500">
                              <span>
                                Operating Result
                              </span>

                              <span>
                                {money(
                                  profit,
                                )}
                              </span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full ${
                                  profit >= 0
                                    ? "bg-emerald-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      profitWidth,
                                    ),
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 text-xs text-slate-500 sm:grid-cols-3">
                          <span>
                            Revenue/km:{" "}
                            <strong className="text-slate-700">
                              {money(
                                num(
                                  month.revenuePerKm,
                                ),
                              )}
                            </strong>
                          </span>

                          <span>
                            Cost/km:{" "}
                            <strong className="text-slate-700">
                              {money(
                                num(
                                  month.costPerKm,
                                ),
                              )}
                            </strong>
                          </span>

                          <span>
                            Total cost:{" "}
                            <strong className="text-slate-700">
                              {money(
                                num(
                                  month.totalCost,
                                ),
                              )}
                            </strong>
                          </span>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </section>

          {/* VEHICLE PERFORMANCE */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Fleet Benchmarking
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Vehicle Performance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Ranked financial and operational performance
                by vehicle.
              </p>
            </div>

            {vehiclePerformance.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No vehicle analytics data available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-4">
                        Rank
                      </th>
                      <th className="px-5 py-4">
                        Vehicle
                      </th>
                      <th className="px-5 py-4">
                        Trips
                      </th>
                      <th className="px-5 py-4">
                        Distance
                      </th>
                      <th className="px-5 py-4">
                        Revenue
                      </th>
                      <th className="px-5 py-4">
                        Cost
                      </th>
                      <th className="px-5 py-4">
                        Result
                      </th>
                      <th className="px-5 py-4">
                        Margin
                      </th>
                      <th className="px-5 py-4">
                        Revenue/km
                      </th>
                      <th className="px-5 py-4">
                        Cost/km
                      </th>
                      <th className="px-5 py-4">
                        Fuel Efficiency
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {rankedVehicles.map(
                      (vehicle, index) => {
                        const profit =
                          num(
                            vehicle.profit,
                          );

                        const profitBar =
                          profit > 0
                            ? Math.min(
                                100,
                                (profit /
                                  maxVehicleProfit) *
                                  100,
                              )
                            : 0;

                        return (
                          <tr
                            key={
                              vehicle.vehicleCode
                            }
                            className="border-b border-slate-100 transition hover:bg-slate-50"
                          >
                            <td className="px-5 py-5">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                {index + 1}
                              </span>
                            </td>

                            <td className="px-5 py-5">
                              <p className="font-bold text-slate-900">
                                {
                                  vehicle.vehicleCode
                                }
                              </p>

                              <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full ${
                                    profit >= 0
                                      ? "bg-emerald-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{
                                    width: `${
                                      profit >=
                                      0
                                        ? profitBar
                                        : 100
                                    }%`,
                                  }}
                                />
                              </div>
                            </td>

                            <td className="px-5 py-5 text-sm text-slate-600">
                              {
                                vehicle.completedTrips
                              }{" "}
                              /{" "}
                              {
                                vehicle.tripsCount
                              }
                            </td>

                            <td className="px-5 py-5 text-sm text-slate-600">
                              {whole(
                                num(
                                  vehicle.distance,
                                ),
                              )}{" "}
                              km
                            </td>

                            <td className="px-5 py-5 text-sm font-medium text-slate-700">
                              {money(
                                num(
                                  vehicle.revenue,
                                ),
                              )}
                            </td>

                            <td className="px-5 py-5 text-sm text-slate-700">
                              {money(
                                num(
                                  vehicle.totalCost,
                                ),
                              )}
                            </td>

                            <td
                              className={`px-5 py-5 text-sm font-bold ${
                                profit >= 0
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              {money(profit)}
                            </td>

                            <td className="px-5 py-5 text-sm text-slate-600">
                              {percent(
                                num(
                                  vehicle.profitMargin,
                                ),
                              )}
                            </td>

                            <td className="px-5 py-5 text-sm text-slate-600">
                              {money(
                                num(
                                  vehicle.revenuePerKm,
                                ),
                              )}
                            </td>

                            <td className="px-5 py-5 text-sm text-slate-600">
                              {money(
                                num(
                                  vehicle.costPerKm,
                                ),
                              )}
                            </td>

                            <td className="px-5 py-5 text-sm text-slate-600">
                              {num(
                                vehicle.fuelEfficiency,
                              ) > 0
                                ? `${num(
                                    vehicle.fuelEfficiency,
                                  ).toFixed(
                                    2,
                                  )} km/L`
                                : "N/A"}
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* COST STRUCTURE + EXPENSE BREAKDOWN */}
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Cost Analysis
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Cost Structure
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Composition of recorded operating costs.
              </p>

              <div className="mt-8 space-y-6">
                {[
                  {
                    label: "Fuel",
                    value: num(
                      kpis?.fuelCost,
                    ),
                    className:
                      "bg-blue-500",
                  },
                  {
                    label:
                      "Maintenance",
                    value: num(
                      kpis?.maintenanceCost,
                    ),
                    className:
                      "bg-amber-500",
                  },
                  {
                    label:
                      "Other Expenses",
                    value: num(
                      kpis?.expenseCost,
                    ),
                    className:
                      "bg-purple-500",
                  },
                ].map((item) => {
                  const share =
                    num(
                      kpis?.totalOperatingCost,
                    ) > 0
                      ? (item.value /
                          num(
                            kpis?.totalOperatingCost,
                          )) *
                        100
                      : 0;

                  return (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600">
                          {item.label}
                        </span>

                        <span className="text-sm font-semibold text-slate-900">
                          {money(
                            item.value,
                          )}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${item.className}`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                share,
                              ),
                            )}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        {percent(share)} of
                        operating cost
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
                Expense Analysis
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Expense Breakdown
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recorded expenses grouped by category.
              </p>

              {expenseBreakdown.length === 0 ? (
                <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                  No expense breakdown available.
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {expenseBreakdown.map(
                    (item) => {
                      const amount =
                        num(item.amount);

                      const share =
                        totalExpenseBreakdown >
                        0
                          ? (amount /
                              totalExpenseBreakdown) *
                            100
                          : 0;

                      return (
                        <div
                          key={
                            item.category
                          }
                        >
                          <div className="mb-2 flex justify-between gap-4 text-sm">
                            <span className="font-medium text-slate-600">
                              {
                                item.category
                              }
                            </span>

                            <span className="font-semibold text-slate-900">
                              {money(
                                amount,
                              )}
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-purple-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    share,
                                  ),
                                )}%`,
                              }}
                            />
                          </div>

                          <p className="mt-1 text-xs text-slate-400">
                            {percent(
                              share,
                            )}
                          </p>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          </section>

          {/* MANAGEMENT ACTIONS */}
          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Management Actions
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Where Management Should Focus
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-xs font-bold text-red-600">
                  01
                </p>

                <h3 className="mt-2 font-bold text-slate-900">
                  Review loss-making vehicles
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Investigate vehicles producing negative
                  operating results and compare their revenue,
                  fuel, maintenance, and expense patterns.
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-xs font-bold text-amber-600">
                  02
                </p>

                <h3 className="mt-2 font-bold text-slate-900">
                  Control cost per km
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Prioritize vehicles with unusually high
                  operating cost relative to their distance.
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-xs font-bold text-blue-600">
                  03
                </p>

                <h3 className="mt-2 font-bold text-slate-900">
                  Improve fuel efficiency
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Compare inefficient vehicles against fleet
                  benchmarks and investigate operational causes.
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-xs font-bold text-emerald-600">
                  04
                </p>

                <h3 className="mt-2 font-bold text-slate-900">
                  Replicate strong performers
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Identify the vehicles and operating patterns
                  producing the strongest financial results.
                </p>
              </div>
            </div>
          </section>

          {/* DATA SUMMARY */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Analytics Data
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Data Summary
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Total Trips
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {whole(
                    num(kpis?.totalTrips),
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Fuel Records
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {whole(
                    num(
                      kpis?.totalFuelLiters,
                    ),
                  )}{" "}
                  L
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Maintenance Cost
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {money(
                    num(
                      kpis?.maintenanceCost,
                    ),
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Expense Categories
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {expenseBreakdown.length}
                </p>
              </div>
            </div>
          </section>

          {/* MODEL NOTE */}
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Analytics Model
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Business intelligence, not accounting profit
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              FleetFlow Analytics is designed for operational
              decision support. Revenue, fuel, maintenance, and
              recorded vehicle expenses are analyzed to identify
              performance patterns and management priorities.
              Corporate overhead, depreciation, financing costs,
              taxes, and other accounting adjustments are only
              included if they are explicitly recorded in the
              underlying data.
            </p>
          </section>

          {/* FOOTER */}
          <footer className="border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
            FleetFlow Business Intelligence • Operational
            Analytics & Decision Support
          </footer>
        </div>
      </main>
    </ProtectedPage>
  );
}
