"use client";

import { useEffect, useMemo, useState } from "react";

interface Trip {
  id: number;
  tripCode: string;
  origin: string;
  destination: string;
  vehicleCode: string;
  driverCode: string;
  tripDate: string;
  distance: number | string;
  fuelUsed: number | string;
  revenue: number | string;
  cargo: string;
  status: string;
}

interface Fuel {
  id: number;
  fuelCode: string;
  vehicleCode: string;
  fuelDate: string;
  liters: number | string;
  cost: number | string;
}

interface Maintenance {
  id: number;
  maintenanceCode: string;
  vehicleCode: string;
  maintenanceDate: string;
  cost: number | string;
}

interface Expense {
  id: number;
  expenseCode: string;
  vehicleCode: string;
  expenseDate: string;
  amount: number | string;
  category: string;
}

interface RouteAnalysis {
  route: string;
  origin: string;
  destination: string;
  trips: number;
  distance: number;
  revenue: number;
  fuelCost: number;
  maintenanceCost: number;
  otherExpenses: number;
  totalCost: number;
  profit: number;
  margin: number;
  revenuePerKm: number;
  costPerKm: number;
  fuelLiters: number;
  fuelEfficiency: number;
  performance: "Excellent" | "Good" | "Average" | "Poor";
}

const API = "http://localhost:3001";

function num(value: number | string | undefined | null): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number): string {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;
}

export default function RouteIntelligencePage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuel, setFuel] = useState<Fuel[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [tripsRes, fuelRes, maintenanceRes, expensesRes] =
        await Promise.all([
          fetch(`${API}/trips`),
          fetch(`${API}/fuel`),
          fetch(`${API}/maintenance`),
          fetch(`${API}/expenses`),
        ]);

      if (
        !tripsRes.ok ||
        !fuelRes.ok ||
        !maintenanceRes.ok ||
        !expensesRes.ok
      ) {
        throw new Error("Failed to load route intelligence data.");
      }

      const [tripsData, fuelData, maintenanceData, expensesData] =
        await Promise.all([
          tripsRes.json(),
          fuelRes.json(),
          maintenanceRes.json(),
          expensesRes.json(),
        ]);

      setTrips(Array.isArray(tripsData) ? tripsData : []);
      setFuel(Array.isArray(fuelData) ? fuelData : []);
      setMaintenance(
        Array.isArray(maintenanceData) ? maintenanceData : [],
      );
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load route intelligence data. Make sure the backend is running on port 3001.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const routes = useMemo<RouteAnalysis[]>(() => {
    const completedTrips = trips.filter(
      (trip) => trip.status.toLowerCase() === "completed",
    );

    const routeMap = new Map<string, RouteAnalysis>();

    completedTrips.forEach((trip) => {
      const origin = trip.origin || "Unknown";
      const destination = trip.destination || "Unknown";
      const route = `${origin} → ${destination}`;

      if (!routeMap.has(route)) {
        routeMap.set(route, {
          route,
          origin,
          destination,
          trips: 0,
          distance: 0,
          revenue: 0,
          fuelCost: 0,
          maintenanceCost: 0,
          otherExpenses: 0,
          totalCost: 0,
          profit: 0,
          margin: 0,
          revenuePerKm: 0,
          costPerKm: 0,
          fuelLiters: 0,
          fuelEfficiency: 0,
          performance: "Average",
        });
      }

      const current = routeMap.get(route)!;

      current.trips += 1;
      current.distance += num(trip.distance);
      current.revenue += num(trip.revenue);
    });

    /*
      Match fuel, maintenance and expenses to the vehicle used
      on each route.

      This gives us a practical route-level estimate using the
      operational data already available in FleetFlow.
    */
    const routeVehicles = new Map<string, Set<string>>();

    completedTrips.forEach((trip) => {
      const route = `${trip.origin || "Unknown"} → ${
        trip.destination || "Unknown"
      }`;

      if (!routeVehicles.has(route)) {
        routeVehicles.set(route, new Set());
      }

      routeVehicles.get(route)!.add(trip.vehicleCode);
    });

    routeMap.forEach((routeData) => {
      const vehicles = routeVehicles.get(routeData.route) || new Set();

      fuel.forEach((record) => {
        if (vehicles.has(record.vehicleCode)) {
          routeData.fuelCost += num(record.cost);
          routeData.fuelLiters += num(record.liters);
        }
      });

      maintenance.forEach((record) => {
        if (vehicles.has(record.vehicleCode)) {
          routeData.maintenanceCost += num(record.cost);
        }
      });

      expenses.forEach((record) => {
        if (vehicles.has(record.vehicleCode)) {
          routeData.otherExpenses += num(record.amount);
        }
      });

      routeData.totalCost =
        routeData.fuelCost +
        routeData.maintenanceCost +
        routeData.otherExpenses;

      routeData.profit = routeData.revenue - routeData.totalCost;

      routeData.margin =
        routeData.revenue > 0
          ? (routeData.profit / routeData.revenue) * 100
          : 0;

      routeData.revenuePerKm =
        routeData.distance > 0
          ? routeData.revenue / routeData.distance
          : 0;

      routeData.costPerKm =
        routeData.distance > 0
          ? routeData.totalCost / routeData.distance
          : 0;

      routeData.fuelEfficiency =
        routeData.fuelLiters > 0
          ? routeData.distance / routeData.fuelLiters
          : 0;

      if (routeData.profit > 0 && routeData.margin >= 30) {
        routeData.performance = "Excellent";
      } else if (routeData.profit >= 0 && routeData.margin >= 15) {
        routeData.performance = "Good";
      } else if (routeData.profit >= 0) {
        routeData.performance = "Average";
      } else {
        routeData.performance = "Poor";
      }
    });

    return Array.from(routeMap.values()).sort(
      (a, b) => b.profit - a.profit,
    );
  }, [trips, fuel, maintenance, expenses]);

  const summary = useMemo(() => {
    const revenue = routes.reduce((sum, route) => sum + route.revenue, 0);
    const totalCost = routes.reduce(
      (sum, route) => sum + route.totalCost,
      0,
    );
    const profit = revenue - totalCost;
    const distance = routes.reduce(
      (sum, route) => sum + route.distance,
      0,
    );
    const fuelLiters = routes.reduce(
      (sum, route) => sum + route.fuelLiters,
      0,
    );

    const profitableRoutes = routes.filter(
      (route) => route.profit > 0,
    ).length;

    const lossMakingRoutes = routes.filter(
      (route) => route.profit < 0,
    ).length;

    const bestRoute =
      routes.length > 0
        ? [...routes].sort((a, b) => b.profit - a.profit)[0]
        : null;

    const worstRoute =
      routes.length > 0
        ? [...routes].sort((a, b) => a.profit - b.profit)[0]
        : null;

    return {
      revenue,
      totalCost,
      profit,
      distance,
      fuelLiters,
      profitableRoutes,
      lossMakingRoutes,
      bestRoute,
      worstRoute,
      margin: revenue > 0 ? (profit / revenue) * 100 : 0,
      costPerKm: distance > 0 ? totalCost / distance : 0,
      fuelEfficiency:
        fuelLiters > 0 ? distance / fuelLiters : 0,
    };
  }, [routes]);

  const insights = useMemo(() => {
    const result: {
      title: string;
      description: string;
      type: "positive" | "warning" | "critical";
    }[] = [];

    if (summary.lossMakingRoutes > 0) {
      result.push({
        title: "Loss-making routes detected",
        description: `${summary.lossMakingRoutes} route${
          summary.lossMakingRoutes === 1 ? "" : "s"
        } are currently generating a negative operating result. These routes should be reviewed for pricing, fuel usage, distance, and operating expenses.`,
        type: "critical",
      });
    }

    if (summary.bestRoute) {
      result.push({
        title: "Best route identified",
        description: `${summary.bestRoute.route} currently generates the strongest estimated profit at ${money(
          summary.bestRoute.profit,
        )}.`,
        type: "positive",
      });
    }

    if (
      summary.fuelEfficiency > 0 &&
      summary.fuelEfficiency < 3
    ) {
      result.push({
        title: "Low route fuel efficiency",
        description: `Fleet route efficiency is ${summary.fuelEfficiency.toFixed(
          2,
        )} km/L. Fuel consumption should be reviewed on the affected routes.`,
        type: "warning",
      });
    }

    const expensiveRoute = [...routes].sort(
      (a, b) => b.costPerKm - a.costPerKm,
    )[0];

    if (expensiveRoute && expensiveRoute.costPerKm > 0) {
      result.push({
        title: "Highest cost per kilometer",
        description: `${expensiveRoute.route} has the highest estimated operating cost per kilometer at ${money(
          expensiveRoute.costPerKm,
        )}/km.`,
        type: "warning",
      });
    }

    if (summary.profitableRoutes > summary.lossMakingRoutes) {
      result.push({
        title: "Route portfolio is mostly profitable",
        description: `${summary.profitableRoutes} of ${routes.length} analyzed routes are generating positive results.`,
        type: "positive",
      });
    }

    return result;
  }, [summary, routes]);

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-blue-600">
              FleetFlow Intelligence
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Route Intelligence
            </h1>

            <p className="mt-2 text-slate-500">
              Analyze route profitability, efficiency, costs, and
              operational performance.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh Data"}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* KPI CARDS */}
        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Route Revenue
            </p>
            <p className="mt-2 text-2xl font-bold">
              {money(summary.revenue)}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Revenue from completed trips
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Route Operating Cost
            </p>
            <p className="mt-2 text-2xl font-bold">
              {money(summary.totalCost)}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Fuel + maintenance + expenses
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Route Profit / Loss
            </p>
            <p
              className={`mt-2 text-2xl font-bold ${
                summary.profit >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {money(summary.profit)}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Estimated route-level result
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Average Cost / KM
            </p>
            <p className="mt-2 text-2xl font-bold">
              {money(summary.costPerKm)}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Operating cost per kilometer
            </p>
          </div>
        </div>

        {/* PERFORMANCE SUMMARY */}
        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Routes Analyzed
            </p>
            <p className="mt-2 text-3xl font-bold">{routes.length}</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-sm text-emerald-700">
              Profitable Routes
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {summary.profitableRoutes}
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-700">
              Loss-Making Routes
            </p>
            <p className="mt-2 text-3xl font-bold text-red-700">
              {summary.lossMakingRoutes}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Fleet Route Efficiency
            </p>
            <p className="mt-2 text-3xl font-bold">
              {summary.fuelEfficiency > 0
                ? `${summary.fuelEfficiency.toFixed(2)} km/L`
                : "N/A"}
            </p>
          </div>
        </div>

        {/* BEST / WORST ROUTE */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
                  Top Performer
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  Most Profitable Route
                </h2>
              </div>

              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                BEST
              </div>
            </div>

            {summary.bestRoute ? (
              <>
                <p className="text-lg font-semibold">
                  {summary.bestRoute.route}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Profit
                    </p>
                    <p className="mt-1 font-bold text-emerald-600">
                      {money(summary.bestRoute.profit)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Margin
                    </p>
                    <p className="mt-1 font-bold">
                      {summary.bestRoute.margin.toFixed(1)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Revenue / KM
                    </p>
                    <p className="mt-1 font-bold">
                      {money(summary.bestRoute.revenuePerKm)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Cost / KM
                    </p>
                    <p className="mt-1 font-bold">
                      {money(summary.bestRoute.costPerKm)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                No completed routes available.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-red-600">
                  Needs Attention
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  Lowest Performing Route
                </h2>
              </div>

              <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                REVIEW
              </div>
            </div>

            {summary.worstRoute ? (
              <>
                <p className="text-lg font-semibold">
                  {summary.worstRoute.route}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Profit / Loss
                    </p>
                    <p
                      className={`mt-1 font-bold ${
                        summary.worstRoute.profit < 0
                          ? "text-red-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {money(summary.worstRoute.profit)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Margin
                    </p>
                    <p className="mt-1 font-bold">
                      {summary.worstRoute.margin.toFixed(1)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Revenue / KM
                    </p>
                    <p className="mt-1 font-bold">
                      {money(summary.worstRoute.revenuePerKm)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Cost / KM
                    </p>
                    <p className="mt-1 font-bold">
                      {money(summary.worstRoute.costPerKm)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                No completed routes available.
              </p>
            )}
          </div>
        </div>

        {/* ROUTE PERFORMANCE TABLE */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Route Performance
            </p>
            <h2 className="mt-1 text-xl font-bold">
              Route Profitability Analysis
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Compare revenue, operating cost, profitability, and
              efficiency across completed routes.
            </p>
          </div>

          {routes.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No completed trips are available for route analysis.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Route</th>
                    <th className="px-6 py-4">Trips</th>
                    <th className="px-6 py-4">Distance</th>
                    <th className="px-6 py-4">Revenue</th>
                    <th className="px-6 py-4">Cost</th>
                    <th className="px-6 py-4">Profit / Loss</th>
                    <th className="px-6 py-4">Margin</th>
                    <th className="px-6 py-4">Cost / KM</th>
                    <th className="px-6 py-4">Performance</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {routes.map((route) => (
                    <tr
                      key={route.route}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold">
                          {route.route}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        {route.trips}
                      </td>

                      <td className="px-6 py-4">
                        {route.distance.toLocaleString()} km
                      </td>

                      <td className="px-6 py-4 font-medium">
                        {money(route.revenue)}
                      </td>

                      <td className="px-6 py-4">
                        {money(route.totalCost)}
                      </td>

                      <td
                        className={`px-6 py-4 font-bold ${
                          route.profit >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {money(route.profit)}
                      </td>

                      <td className="px-6 py-4">
                        {route.margin.toFixed(1)}%
                      </td>

                      <td className="px-6 py-4">
                        {money(route.costPerKm)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            route.performance === "Excellent"
                              ? "bg-emerald-100 text-emerald-700"
                              : route.performance === "Good"
                                ? "bg-blue-100 text-blue-700"
                                : route.performance === "Average"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          {route.performance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* COST STRUCTURE */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Route Economics
          </p>

          <h2 className="mt-1 text-xl font-bold">
            Cost Structure
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {[
              {
                label: "Fuel Cost",
                value: routes.reduce(
                  (sum, route) => sum + route.fuelCost,
                  0,
                ),
              },
              {
                label: "Maintenance Cost",
                value: routes.reduce(
                  (sum, route) => sum + route.maintenanceCost,
                  0,
                ),
              },
              {
                label: "Other Expenses",
                value: routes.reduce(
                  (sum, route) => sum + route.otherExpenses,
                  0,
                ),
              },
            ].map((item) => {
              const percentage =
                summary.totalCost > 0
                  ? (item.value / summary.totalCost) * 100
                  : 0;

              return (
                <div
                  key={item.label}
                  className="rounded-xl bg-slate-50 p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-600">
                      {item.label}
                    </p>

                    <p className="text-xs font-semibold text-slate-500">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>

                  <p className="mt-2 text-xl font-bold">
                    {money(item.value)}
                  </p>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-slate-800"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* BUSINESS INSIGHTS */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Decision Support
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Automated Route Insights
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              FleetFlow identifies route-level opportunities and
              risks from your operational data.
            </p>
          </div>

          <div className="grid gap-4 p-6">
            {insights.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                Not enough completed route data to generate
                automated insights yet.
              </div>
            ) : (
              insights.map((insight, index) => (
                <div
                  key={`${insight.title}-${index}`}
                  className={`rounded-xl border p-5 ${
                    insight.type === "critical"
                      ? "border-red-200 bg-red-50"
                      : insight.type === "warning"
                        ? "border-amber-200 bg-amber-50"
                        : "border-emerald-200 bg-emerald-50"
                  }`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                        insight.type === "critical"
                          ? "bg-red-500"
                          : insight.type === "warning"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                    />

                    <div>
                      <h3 className="font-semibold">
                        {insight.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mb-8 rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">
            Intelligence Engine
          </p>

          <h2 className="mt-1 text-xl font-bold">
            How Route Intelligence Works
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-4">
            <div>
              <p className="text-sm font-bold">01. Route Mapping</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Completed trips are grouped by origin and
                destination.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold">02. Cost Analysis</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Fuel, maintenance, and operating expenses are
                incorporated into route economics.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold">03. Performance</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Revenue/km, cost/km, margin, profit, and fuel
                efficiency are calculated.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold">04. Decisions</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                FleetFlow highlights profitable routes and routes
                requiring management attention.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <div className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400 md:flex-row">
          <p>FleetFlow ERP • Route Intelligence</p>

          <p>
            Data sources: Trips • Fuel • Maintenance • Expenses
          </p>
        </div>
      </div>
    </main>
  );
}
