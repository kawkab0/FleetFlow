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
  type: "success" | "warning" | "info";
}

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState<FleetKpis | null>(null);
  const [vehiclePerformance, setVehiclePerformance] = useState<
    VehicleAnalytics[]
  >([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<
    ExpenseBreakdown[]
  >([]);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState<
    MonthlyAnalytics[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalyticsData() {
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
        setVehiclePerformance(vehiclesData);
        setExpenseBreakdown(expensesData);
        setMonthlyAnalytics(monthlyData);
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
    }

    fetchAnalyticsData();
  }, []);

  const fleetSize = vehiclePerformance.length;

  const netOperatingResult = kpis?.profit ?? 0;

  const fuelEfficiency = kpis?.fuelEfficiency ?? 0;

  const fleetUtilization =
    kpis && kpis.totalTrips > 0
      ? (kpis.completedTrips / kpis.totalTrips) * 100
      : 0;

  const insights = useMemo<Insight[]>(() => {
    if (!kpis) {
      return [];
    }

    const results: Insight[] = [];

    if (kpis.profit > 0) {
      results.push({
        title: "Fleet is profitable",
        description: `The fleet generated a positive operating profit of ETB ${kpis.profit.toFixed(
          2,
        )}.`,
        type: "success",
      });
    } else {
      results.push({
        title: "Profitability requires attention",
        description:
          "Operating costs are currently higher than fleet revenue.",
        type: "warning",
      });
    }

    if (kpis.profitMargin >= 20) {
      results.push({
        title: "Strong profit margin",
        description: `The current profit margin is ${kpis.profitMargin.toFixed(
          1,
        )}%, indicating strong operational performance.`,
        type: "success",
      });
    } else if (kpis.profitMargin > 0) {
      results.push({
        title: "Profit margin could improve",
        description: `The current profit margin is ${kpis.profitMargin.toFixed(
          1,
        )}%.`,
        type: "warning",
      });
    }

    if (kpis.completionRate >= 80) {
      results.push({
        title: "Strong trip completion",
        description: `${kpis.completionRate.toFixed(
          1,
        )}% of recorded trips have been completed.`,
        type: "success",
      });
    } else {
      results.push({
        title: "Trip completion needs attention",
        description: `Only ${kpis.completionRate.toFixed(
          1,
        )}% of recorded trips are completed.`,
        type: "warning",
      });
    }

    if (fuelEfficiency > 5) {
      results.push({
        title: "Good fuel efficiency",
        description: `Fleet fuel efficiency is ${fuelEfficiency.toFixed(
          2,
        )} km/L.`,
        type: "success",
      });
    } else if (fuelEfficiency > 0) {
      results.push({
        title: "Fuel efficiency opportunity",
        description: `Fleet fuel efficiency is ${fuelEfficiency.toFixed(
          2,
        )} km/L. Improving fuel consumption could reduce operating costs.`,
        type: "warning",
      });
    }

    if (kpis.costPerKm > kpis.revenuePerKm) {
      results.push({
        title: "Cost per kilometer is high",
        description:
          "Operating cost per kilometer is currently higher than revenue per kilometer.",
        type: "warning",
      });
    }

    if (kpis.activeTrips > 0) {
      results.push({
        title: "Active trips detected",
        description: `${kpis.activeTrips} trip${
          kpis.activeTrips === 1 ? "" : "s"
        } currently have an active or in-progress status.`,
        type: "info",
      });
    }

    return results;
  }, [kpis, fuelEfficiency]);

  const maxMonthlyRevenue = Math.max(
    ...monthlyAnalytics.map((item) => item.revenue),
    1,
  );

  const maxMonthlyProfit = Math.max(
    ...monthlyAnalytics.map((item) => Math.abs(item.profit)),
    1,
  );

  const totalExpenseBreakdown = expenseBreakdown.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  if (loading) {
    return (
      <ProtectedPage permission="analytics">
        <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-semibold">
                Loading analytics...
              </div>

              <p className="mt-2 text-sm text-slate-400">
                Preparing FleetFlow business intelligence.
              </p>
            </div>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  if (error) {
    return (
      <ProtectedPage permission="analytics">
        <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
          <div className="mx-auto max-w-3xl rounded-2xl border border-red-900 bg-red-950/40 p-8">
            <h1 className="text-2xl font-bold text-red-300">
              Analytics Error
            </h1>

            <p className="mt-3 text-sm leading-6 text-red-200">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Retry
            </button>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage permission="analytics">
      <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight">
              Business Analytics
            </h1>

            <p className="mt-2 text-slate-400">
              Fleet performance, financial efficiency, and operational
              intelligence.
            </p>
          </div>

          {/* KPI CARDS */}
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Total Trips</p>

              <p className="mt-3 text-3xl font-bold">
                {kpis?.totalTrips ?? 0}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {kpis?.completedTrips ?? 0} completed
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Total Revenue</p>

              <p className="mt-3 text-3xl font-bold">
                ETB {Number(kpis?.totalRevenue ?? 0).toFixed(2)}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                ETB {Number(kpis?.revenuePerKm ?? 0).toFixed(2)} / km
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Operating Cost</p>

              <p className="mt-3 text-3xl font-bold">
                ETB {Number(kpis?.totalOperatingCost ?? 0).toFixed(2)}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                ETB {Number(kpis?.costPerKm ?? 0).toFixed(2)} / km
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Operating Profit</p>

              <p
                className={`mt-3 text-3xl font-bold ${
                  netOperatingResult >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                ETB {Number(netOperatingResult).toFixed(2)}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {Number(kpis?.profitMargin ?? 0).toFixed(1)}% margin
              </p>
            </div>
          </section>

          {/* SECONDARY KPI ROW */}
          <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Fleet Size</p>

              <p className="mt-3 text-3xl font-bold">{fleetSize}</p>

              <p className="mt-2 text-xs text-slate-500">
                Vehicles with recorded activity
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Completion Rate</p>

              <p className="mt-3 text-3xl font-bold">
                {Number(kpis?.completionRate ?? 0).toFixed(1)}%
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Completed trips
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Fuel Efficiency</p>

              <p className="mt-3 text-3xl font-bold">
                {Number(fuelEfficiency).toFixed(2)}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                km per liter
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Active Trips</p>

              <p className="mt-3 text-3xl font-bold">
                {kpis?.activeTrips ?? 0}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Currently active or in progress
              </p>
            </div>
          </section>

          {/* BUSINESS INSIGHTS */}
          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-2xl font-bold">Business Insights</h2>

              <p className="mt-1 text-sm text-slate-400">
                Automatically generated observations from fleet performance
                data.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {insights.map((insight, index) => (
                <div
                  key={`${insight.title}-${index}`}
                  className={`rounded-2xl border p-6 ${
                    insight.type === "success"
                      ? "border-emerald-900 bg-emerald-950/30"
                      : insight.type === "warning"
                        ? "border-amber-900 bg-amber-950/30"
                        : "border-blue-900 bg-blue-950/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-xl">
                      {insight.type === "success"
                        ? "✓"
                        : insight.type === "warning"
                          ? "!"
                          : "i"}
                    </div>

                    <div>
                      <h3 className="font-semibold">{insight.title}</h3>

                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* MONTHLY PERFORMANCE */}
          <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Monthly Performance</h2>

              <p className="mt-1 text-sm text-slate-400">
                Revenue and profit trends over time.
              </p>
            </div>

            {monthlyAnalytics.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-500">
                No monthly analytics data available.
              </div>
            ) : (
              <div className="space-y-6">
                {monthlyAnalytics.map((month) => {
                  const revenueWidth =
                    (month.revenue / maxMonthlyRevenue) * 100;

                  const profitWidth =
                    (Math.abs(month.profit) / maxMonthlyProfit) * 100;

                  return (
                    <div key={month.month}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {month.month}
                        </span>

                        <span className="text-xs text-slate-400">
                          {month.trips} trips
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="mb-1 flex justify-between text-xs text-slate-500">
                            <span>Revenue</span>

                            <span>
                              ETB {Number(month.revenue).toFixed(2)}
                            </span>
                          </div>

                          <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{
                                width: `${revenueWidth}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="mb-1 flex justify-between text-xs text-slate-500">
                            <span>Profit</span>

                            <span>
                              ETB {Number(month.profit).toFixed(2)}
                            </span>
                          </div>

                          <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className={`h-full rounded-full ${
                                month.profit >= 0
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${profitWidth}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* VEHICLE PERFORMANCE */}
          <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Vehicle Performance</h2>

              <p className="mt-1 text-sm text-slate-400">
                Financial and operational performance by vehicle.
              </p>
            </div>

            {vehiclePerformance.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-500">
                No vehicle analytics data available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-sm text-slate-400">
                      <th className="px-4 py-4">Vehicle</th>
                      <th className="px-4 py-4">Trips</th>
                      <th className="px-4 py-4">Distance</th>
                      <th className="px-4 py-4">Revenue</th>
                      <th className="px-4 py-4">Total Cost</th>
                      <th className="px-4 py-4">Profit</th>
                      <th className="px-4 py-4">Margin</th>
                      <th className="px-4 py-4">Fuel Efficiency</th>
                    </tr>
                  </thead>

                  <tbody>
                    {vehiclePerformance.map((vehicle) => (
                      <tr
                        key={vehicle.vehicleCode}
                        className="border-b border-slate-800/70"
                      >
                        <td className="px-4 py-4 font-semibold">
                          {vehicle.vehicleCode}
                        </td>

                        <td className="px-4 py-4">
                          {vehicle.tripsCount}
                        </td>

                        <td className="px-4 py-4">
                          {Number(vehicle.distance).toFixed(0)} km
                        </td>

                        <td className="px-4 py-4">
                          ETB {Number(vehicle.revenue).toFixed(2)}
                        </td>

                        <td className="px-4 py-4">
                          ETB {Number(vehicle.totalCost).toFixed(2)}
                        </td>

                        <td
                          className={`px-4 py-4 font-semibold ${
                            vehicle.profit >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          ETB {Number(vehicle.profit).toFixed(2)}
                        </td>

                        <td className="px-4 py-4">
                          {Number(vehicle.profitMargin).toFixed(1)}%
                        </td>

                        <td className="px-4 py-4">
                          {Number(vehicle.fuelEfficiency).toFixed(2)} km/L
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* COST STRUCTURE */}
          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-2xl font-bold">Cost Structure</h2>

              <p className="mt-1 text-sm text-slate-400">
                Breakdown of total operating costs.
              </p>

              <div className="mt-8 space-y-5">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-300">Fuel</span>

                    <span>
                      ETB {Number(kpis?.fuelCost ?? 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width: `${
                          kpis && kpis.totalOperatingCost > 0
                            ? (kpis.fuelCost / kpis.totalOperatingCost) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-300">Maintenance</span>

                    <span>
                      ETB{" "}
                      {Number(kpis?.maintenanceCost ?? 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{
                        width: `${
                          kpis && kpis.totalOperatingCost > 0
                            ? (kpis.maintenanceCost /
                                kpis.totalOperatingCost) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-300">Other Expenses</span>

                    <span>
                      ETB {Number(kpis?.expenseCost ?? 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{
                        width: `${
                          kpis && kpis.totalOperatingCost > 0
                            ? (kpis.expenseCost /
                                kpis.totalOperatingCost) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* EXPENSE BREAKDOWN */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-2xl font-bold">Expense Breakdown</h2>

              <p className="mt-1 text-sm text-slate-400">
                Expenses grouped by category.
              </p>

              {expenseBreakdown.length === 0 ? (
                <div className="mt-8 rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-500">
                  No expense breakdown available.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {expenseBreakdown.map((item) => {
                    const percentage =
                      totalExpenseBreakdown > 0
                        ? (item.amount / totalExpenseBreakdown) * 100
                        : 0;

                    return (
                      <div key={item.category}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="text-slate-300">
                            {item.category}
                          </span>

                          <span>
                            ETB {Number(item.amount).toFixed(2)}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-purple-500"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* DATA SUMMARY */}
          <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-bold">Data Summary</h2>

            <p className="mt-1 text-sm text-slate-400">
              Key data points currently used by FleetFlow analytics.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl bg-slate-800/70 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Distance
                </p>

                <p className="mt-2 text-xl font-bold">
                  {Number(kpis?.totalDistance ?? 0).toFixed(0)} km
                </p>
              </div>

              <div className="rounded-xl bg-slate-800/70 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Fuel Used
                </p>

                <p className="mt-2 text-xl font-bold">
                  {Number(kpis?.totalFuelLiters ?? 0).toFixed(0)} L
                </p>
              </div>

              <div className="rounded-xl bg-slate-800/70 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Active Trips
                </p>

                <p className="mt-2 text-xl font-bold">
                  {kpis?.activeTrips ?? 0}
                </p>
              </div>

              <div className="rounded-xl bg-slate-800/70 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Expense Categories
                </p>

                <p className="mt-2 text-xl font-bold">
                  {expenseBreakdown.length}
                </p>
              </div>
            </div>
          </section>

          {/* FOOTER METRICS */}
          <section className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Revenue / KM</p>

              <p className="mt-3 text-2xl font-bold">
                ETB {Number(kpis?.revenuePerKm ?? 0).toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Cost / KM</p>

              <p className="mt-3 text-2xl font-bold">
                ETB {Number(kpis?.costPerKm ?? 0).toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Fleet Utilization
              </p>

              <p className="mt-3 text-2xl font-bold">
                {Number(fleetUtilization).toFixed(1)}%
              </p>
            </div>
          </section>
        </div>
      </main>
    </ProtectedPage>
  );
}