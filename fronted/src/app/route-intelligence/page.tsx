"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedPage from "@/app/components/ProtectedPage";

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

type Performance =
  | "Excellent"
  | "Good"
  | "Average"
  | "Poor";

type RiskLevel = "Low" | "Medium" | "High" | "Critical";

interface RouteAnalysis {
  route: string;
  origin: string;
  destination: string;
  trips: number;
  vehicles: number;
  drivers: number;
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
  performance: Performance;
  risk: RiskLevel;
}

interface Insight {
  title: string;
  description: string;
  type: "positive" | "warning" | "critical" | "info";
}

function num(value: number | string | undefined | null): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number): string {
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} ETB`;
}

function number(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}

function percent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function riskRank(risk: RiskLevel): number {
  if (risk === "Critical") return 4;
  if (risk === "High") return 3;
  if (risk === "Medium") return 2;
  return 1;
}

function performanceRank(performance: Performance): number {
  if (performance === "Excellent") return 4;
  if (performance === "Good") return 3;
  if (performance === "Average") return 2;
  return 1;
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

      const [
        tripsData,
        fuelData,
        maintenanceData,
        expensesData,
      ] = await Promise.all([
        apiFetch("/trips"),
        apiFetch("/fuel"),
        apiFetch("/maintenance"),
        apiFetch("/expenses"),
      ]);

      setTrips(Array.isArray(tripsData) ? tripsData : []);
      setFuel(Array.isArray(fuelData) ? fuelData : []);
      setMaintenance(
        Array.isArray(maintenanceData) ? maintenanceData : [],
      );
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to load route intelligence data. Make sure the backend is running on port 3001.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const completedTrips = useMemo(() => {
    return trips.filter(
      (trip) => trip.status?.toLowerCase() === "completed",
    );
  }, [trips]);

  /*
    Build vehicle-level operational totals first.

    Route costs are then allocated proportionally by distance
    instead of assigning the vehicle's entire cost history to
    every route it has driven.
  */
  const vehicleTotals = useMemo(() => {
    const totals = new Map<
      string,
      {
        distance: number;
        fuelCost: number;
        fuelLiters: number;
        maintenanceCost: number;
        otherExpenses: number;
      }
    >();

    completedTrips.forEach((trip) => {
      const vehicle = trip.vehicleCode || "Unknown";

      if (!totals.has(vehicle)) {
        totals.set(vehicle, {
          distance: 0,
          fuelCost: 0,
          fuelLiters: 0,
          maintenanceCost: 0,
          otherExpenses: 0,
        });
      }

      totals.get(vehicle)!.distance += num(trip.distance);
    });

    fuel.forEach((record) => {
      const vehicle = record.vehicleCode || "Unknown";

      if (!totals.has(vehicle)) {
        totals.set(vehicle, {
          distance: 0,
          fuelCost: 0,
          fuelLiters: 0,
          maintenanceCost: 0,
          otherExpenses: 0,
        });
      }

      totals.get(vehicle)!.fuelCost += num(record.cost);
      totals.get(vehicle)!.fuelLiters += num(record.liters);
    });

    maintenance.forEach((record) => {
      const vehicle = record.vehicleCode || "Unknown";

      if (!totals.has(vehicle)) {
        totals.set(vehicle, {
          distance: 0,
          fuelCost: 0,
          fuelLiters: 0,
          maintenanceCost: 0,
          otherExpenses: 0,
        });
      }

      totals.get(vehicle)!.maintenanceCost += num(record.cost);
    });

    expenses.forEach((record) => {
      const vehicle = record.vehicleCode || "Unknown";

      if (!totals.has(vehicle)) {
        totals.set(vehicle, {
          distance: 0,
          fuelCost: 0,
          fuelLiters: 0,
          maintenanceCost: 0,
          otherExpenses: 0,
        });
      }

      totals.get(vehicle)!.otherExpenses += num(record.amount);
    });

    return totals;
  }, [completedTrips, fuel, maintenance, expenses]);

  const routes = useMemo<RouteAnalysis[]>(() => {
    const routeMap = new Map<
      string,
      {
        route: string;
        origin: string;
        destination: string;
        trips: number;
        vehicles: Set<string>;
        drivers: Set<string>;
        distance: number;
        revenue: number;
        vehicleDistance: Map<string, number>;
      }
    >();

    completedTrips.forEach((trip) => {
      const origin = trip.origin || "Unknown";
      const destination = trip.destination || "Unknown";
      const route = `${origin} → ${destination}`;
      const vehicle = trip.vehicleCode || "Unknown";
      const driver = trip.driverCode || "Unknown";

      if (!routeMap.has(route)) {
        routeMap.set(route, {
          route,
          origin,
          destination,
          trips: 0,
          vehicles: new Set(),
          drivers: new Set(),
          distance: 0,
          revenue: 0,
          vehicleDistance: new Map(),
        });
      }

      const current = routeMap.get(route)!;

      current.trips += 1;
      current.vehicles.add(vehicle);
      current.drivers.add(driver);
      current.distance += num(trip.distance);
      current.revenue += num(trip.revenue);

      current.vehicleDistance.set(
        vehicle,
        (current.vehicleDistance.get(vehicle) || 0) +
          num(trip.distance),
      );
    });

    return Array.from(routeMap.values())
      .map((routeData): RouteAnalysis => {
        let fuelCost = 0;
        let maintenanceCost = 0;
        let otherExpenses = 0;
        let fuelLiters = 0;

        /*
          Allocate each vehicle's operational costs according
          to the proportion of that vehicle's completed-trip
          distance represented by this route.
        */
        routeData.vehicleDistance.forEach(
          (routeDistance, vehicle) => {
            const vehicleTotal = vehicleTotals.get(vehicle);

            if (!vehicleTotal) return;

            const allocation =
              vehicleTotal.distance > 0
                ? routeDistance / vehicleTotal.distance
                : 0;

            fuelCost += vehicleTotal.fuelCost * allocation;
            fuelLiters += vehicleTotal.fuelLiters * allocation;
            maintenanceCost +=
              vehicleTotal.maintenanceCost * allocation;
            otherExpenses +=
              vehicleTotal.otherExpenses * allocation;
          },
        );

        const totalCost =
          fuelCost +
          maintenanceCost +
          otherExpenses;

        const profit =
          routeData.revenue - totalCost;

        const margin =
          routeData.revenue > 0
            ? (profit / routeData.revenue) * 100
            : 0;

        const revenuePerKm =
          routeData.distance > 0
            ? routeData.revenue / routeData.distance
            : 0;

        const costPerKm =
          routeData.distance > 0
            ? totalCost / routeData.distance
            : 0;

        const fuelEfficiency =
          fuelLiters > 0
            ? routeData.distance / fuelLiters
            : 0;

        let performance: Performance;

        if (profit > 0 && margin >= 30) {
          performance = "Excellent";
        } else if (profit >= 0 && margin >= 15) {
          performance = "Good";
        } else if (profit >= 0) {
          performance = "Average";
        } else {
          performance = "Poor";
        }

        let risk: RiskLevel;

        if (profit < 0 && margin < 0) {
          risk = "Critical";
        } else if (
          profit < 0 ||
          margin < 5 ||
          (fuelEfficiency > 0 && fuelEfficiency < 3)
        ) {
          risk = "High";
        } else if (
          margin < 15 ||
          (fuelEfficiency > 0 && fuelEfficiency < 4)
        ) {
          risk = "Medium";
        } else {
          risk = "Low";
        }

        return {
          route: routeData.route,
          origin: routeData.origin,
          destination: routeData.destination,
          trips: routeData.trips,
          vehicles: routeData.vehicles.size,
          drivers: routeData.drivers.size,
          distance: routeData.distance,
          revenue: routeData.revenue,
          fuelCost,
          maintenanceCost,
          otherExpenses,
          totalCost,
          profit,
          margin,
          revenuePerKm,
          costPerKm,
          fuelLiters,
          fuelEfficiency,
          performance,
          risk,
        };
      })
      .sort((a, b) => b.profit - a.profit);
  }, [completedTrips, vehicleTotals]);

  const summary = useMemo(() => {
    const revenue = routes.reduce(
      (sum, route) => sum + route.revenue,
      0,
    );

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

    const highRiskRoutes = routes.filter(
      (route) =>
        route.risk === "High" ||
        route.risk === "Critical",
    ).length;

    const bestRoute =
      routes.length > 0
        ? [...routes].sort(
            (a, b) => b.profit - a.profit,
          )[0]
        : null;

    const worstRoute =
      routes.length > 0
        ? [...routes].sort(
            (a, b) => a.profit - b.profit,
          )[0]
        : null;

    const mostEfficientRoute =
      routes.length > 0
        ? [...routes]
            .filter((route) => route.fuelEfficiency > 0)
            .sort(
              (a, b) =>
                b.fuelEfficiency - a.fuelEfficiency,
            )[0] || null
        : null;

    const highestCostRoute =
      routes.length > 0
        ? [...routes].sort(
            (a, b) => b.costPerKm - a.costPerKm,
          )[0]
        : null;

    return {
      revenue,
      totalCost,
      profit,
      distance,
      fuelLiters,
      profitableRoutes,
      lossMakingRoutes,
      highRiskRoutes,
      bestRoute,
      worstRoute,
      mostEfficientRoute,
      highestCostRoute,
      margin:
        revenue > 0 ? (profit / revenue) * 100 : 0,
      costPerKm:
        distance > 0 ? totalCost / distance : 0,
      fuelEfficiency:
        fuelLiters > 0
          ? distance / fuelLiters
          : 0,
    };
  }, [routes]);

  const insights = useMemo<Insight[]>(() => {
    const result: Insight[] = [];

    if (summary.lossMakingRoutes > 0) {
      result.push({
        title: "Loss-making routes detected",
        description: `${summary.lossMakingRoutes} route${
          summary.lossMakingRoutes === 1 ? "" : "s"
        } are currently producing a negative estimated operating result. Review pricing, fuel consumption, route distance, and operating expenses.`,
        type: "critical",
      });
    }

    if (summary.highRiskRoutes > 0) {
      result.push({
        title: "High-risk routes require attention",
        description: `${summary.highRiskRoutes} route${
          summary.highRiskRoutes === 1 ? "" : "s"
        } have been classified as high or critical risk based on profitability, margin, cost per kilometer, or fuel efficiency.`,
        type: "warning",
      });
    }

    if (summary.bestRoute) {
      result.push({
        title: "Best-performing route",
        description: `${summary.bestRoute.route} currently leads the route portfolio with an estimated profit of ${money(
          summary.bestRoute.profit,
        )} and a ${percent(summary.bestRoute.margin)} margin.`,
        type: "positive",
      });
    }

    if (summary.mostEfficientRoute) {
      result.push({
        title: "Most fuel-efficient route",
        description: `${summary.mostEfficientRoute.route} records the strongest estimated fuel efficiency at ${summary.mostEfficientRoute.fuelEfficiency.toFixed(
          2,
        )} km/L.`,
        type: "positive",
      });
    }

    if (summary.highestCostRoute) {
      result.push({
        title: "Highest cost per kilometer",
        description: `${summary.highestCostRoute.route} has the highest estimated operating cost at ${money(
          summary.highestCostRoute.costPerKm,
        )} per kilometer. Management should investigate why this route is expensive.`,
        type: "warning",
      });
    }

    if (
      summary.fuelEfficiency > 0 &&
      summary.fuelEfficiency < 3
    ) {
      result.push({
        title: "Low fleet route efficiency",
        description: `Overall route fuel efficiency is ${summary.fuelEfficiency.toFixed(
          2,
        )} km/L. Fuel usage should be reviewed across the affected vehicles and routes.`,
        type: "warning",
      });
    }

    if (
      routes.length > 0 &&
      summary.profitableRoutes / routes.length >= 0.75
    ) {
      result.push({
        title: "Route portfolio is performing well",
        description: `${summary.profitableRoutes} of ${routes.length} analyzed routes are currently profitable, indicating a strong overall route portfolio.`,
        type: "positive",
      });
    }

    if (result.length === 0) {
      result.push({
        title: "Insufficient route data",
        description:
          "Complete more trips and record fuel, maintenance, and expense transactions to unlock stronger route intelligence.",
        type: "info",
      });
    }

    return result;
  }, [summary, routes]);

  const routeRanking = useMemo(() => {
    return [...routes]
      .sort((a, b) => {
        const performanceDifference =
          performanceRank(b.performance) -
          performanceRank(a.performance);

        if (performanceDifference !== 0) {
          return performanceDifference;
        }

        return b.profit - a.profit;
      })
      .slice(0, 5);
  }, [routes]);

  const costStructure = useMemo(() => {
    const fuelCost = routes.reduce(
      (sum, route) => sum + route.fuelCost,
      0,
    );

    const maintenanceCost = routes.reduce(
      (sum, route) => sum + route.maintenanceCost,
      0,
    );

    const otherExpenses = routes.reduce(
      (sum, route) => sum + route.otherExpenses,
      0,
    );

    return [
      {
        label: "Fuel",
        value: fuelCost,
      },
      {
        label: "Maintenance",
        value: maintenanceCost,
      },
      {
        label: "Other Expenses",
        value: otherExpenses,
      },
    ];
  }, [routes]);

  return (
    <ProtectedPage permission="routeIntelligence">
      <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                FleetFlow Intelligence
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Route Intelligence
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Turn completed-trip data into route profitability,
                efficiency, risk, and management decisions.
              </p>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* PRIMARY KPIs */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Route Revenue
              </p>

              <p className="mt-3 text-2xl font-bold tracking-tight">
                {money(summary.revenue)}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Completed-trip revenue
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Operating Cost
              </p>

              <p className="mt-3 text-2xl font-bold tracking-tight">
                {money(summary.totalCost)}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Allocated by vehicle distance
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Route Profit / Loss
              </p>

              <p
                className={`mt-3 text-2xl font-bold tracking-tight ${
                  summary.profit >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {money(summary.profit)}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Overall estimated result
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Overall Margin
              </p>

              <p
                className={`mt-3 text-2xl font-bold tracking-tight ${
                  summary.margin >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {percent(summary.margin)}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Profit as % of route revenue
              </p>
            </div>
          </div>

          {/* OPERATING METRICS */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">
                Routes Analyzed
              </p>

              <p className="mt-2 text-3xl font-bold">
                {routes.length}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm text-emerald-700">
                Profitable Routes
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-700">
                {summary.profitableRoutes}
              </p>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-sm text-red-700">
                Loss-Making Routes
              </p>

              <p className="mt-2 text-3xl font-bold text-red-700">
                {summary.lossMakingRoutes}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm text-amber-700">
                High-Risk Routes
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-700">
                {summary.highRiskRoutes}
              </p>
            </div>
          </div>

          {/* BEST / WORST */}
          <div className="mb-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Top Performer
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Most Profitable Route
                  </h2>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  BEST
                </span>
              </div>

              {summary.bestRoute ? (
                <>
                  <p className="mt-5 text-lg font-semibold">
                    {summary.bestRoute.route}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
                        {percent(summary.bestRoute.margin)}
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
                <p className="mt-5 text-sm text-slate-500">
                  No completed routes available.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                    Needs Attention
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Lowest Performing Route
                  </h2>
                </div>

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                  REVIEW
                </span>
              </div>

              {summary.worstRoute ? (
                <>
                  <p className="mt-5 text-lg font-semibold">
                    {summary.worstRoute.route}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
                        {percent(summary.worstRoute.margin)}
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

                    <div>
                      <p className="text-xs text-slate-500">
                        Risk
                      </p>

                      <p className="mt-1 font-bold text-red-600">
                        {summary.worstRoute.risk}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="mt-5 text-sm text-slate-500">
                  No completed routes available.
                </p>
              )}
            </div>
          </div>

          {/* ROUTE RANKING */}
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Route Ranking
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Top Route Performers
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Routes ranked using profitability and operational
                performance.
              </p>
            </div>

            {routeRanking.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No completed route data available.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {routeRanking.map((route, index) => (
                  <div
                    key={route.route}
                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                        {index + 1}
                      </div>

                      <div>
                        <p className="font-semibold">
                          {route.route}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {route.trips} trips •{" "}
                          {number(route.distance)} km •{" "}
                          {route.vehicles} vehicle
                          {route.vehicles === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-5">
                      <div>
                        <p className="text-xs text-slate-500">
                          Profit
                        </p>

                        <p
                          className={`mt-1 text-sm font-bold ${
                            route.profit >= 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {money(route.profit)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Margin
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          {percent(route.margin)}
                        </p>
                      </div>

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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ROUTE TABLE */}
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Route Performance
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Route Profitability Analysis
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Compare profitability, efficiency, operating
                cost, and route risk.
              </p>
            </div>

            {routes.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No completed trips are available for route
                analysis.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm">
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
                      <th className="px-6 py-4">Efficiency</th>
                      <th className="px-6 py-4">Risk</th>
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

                          <p className="mt-1 text-xs text-slate-400">
                            {route.vehicles} vehicle
                            {route.vehicles === 1 ? "" : "s"} •{" "}
                            {route.drivers} driver
                            {route.drivers === 1 ? "" : "s"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          {route.trips}
                        </td>

                        <td className="px-6 py-4">
                          {number(route.distance)} km
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
                          {percent(route.margin)}
                        </td>

                        <td className="px-6 py-4">
                          {money(route.costPerKm)}
                        </td>

                        <td className="px-6 py-4">
                          {route.fuelEfficiency > 0
                            ? `${route.fuelEfficiency.toFixed(2)} km/L`
                            : "N/A"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              route.risk === "Low"
                                ? "bg-emerald-100 text-emerald-700"
                                : route.risk === "Medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : route.risk === "High"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                          >
                            {route.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ROUTE ECONOMICS */}
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Route Economics
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Operating Cost Structure
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Estimated contribution of each operating cost
                category.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {costStructure.map((item) => {
                const percentageValue =
                  summary.totalCost > 0
                    ? (item.value / summary.totalCost) *
                      100
                    : 0;

                return (
                  <div
                    key={item.label}
                    className="rounded-xl bg-slate-50 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-600">
                        {item.label}
                      </p>

                      <p className="text-xs font-semibold text-slate-500">
                        {percent(percentageValue)}
                      </p>
                    </div>

                    <p className="mt-2 text-xl font-bold">
                      {money(item.value)}
                    </p>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-slate-800"
                        style={{
                          width: `${Math.min(
                            percentageValue,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* KEY DECISION METRICS */}
          <section className="mb-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Best Fuel Efficiency
              </p>

              <h3 className="mt-2 text-lg font-bold">
                {summary.mostEfficientRoute
                  ? summary.mostEfficientRoute.route
                  : "N/A"}
              </h3>

              <p className="mt-3 text-2xl font-bold text-emerald-600">
                {summary.mostEfficientRoute
                  ? `${summary.mostEfficientRoute.fuelEfficiency.toFixed(
                      2,
                    )} km/L`
                  : "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Highest Cost / KM
              </p>

              <h3 className="mt-2 text-lg font-bold">
                {summary.highestCostRoute
                  ? summary.highestCostRoute.route
                  : "N/A"}
              </h3>

              <p className="mt-3 text-2xl font-bold text-amber-600">
                {summary.highestCostRoute
                  ? money(
                      summary.highestCostRoute.costPerKm,
                    )
                  : "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Average Cost / KM
              </p>

              <h3 className="mt-2 text-lg font-bold">
                Fleet Route Average
              </h3>

              <p className="mt-3 text-2xl font-bold">
                {money(summary.costPerKm)}
              </p>
            </div>
          </section>

          {/* BUSINESS INSIGHTS */}
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Decision Support
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Automated Route Insights
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                FleetFlow converts route-level operating data
                into management signals.
              </p>
            </div>

            <div className="grid gap-4 p-6">
              {insights.map((insight, index) => (
                <div
                  key={`${insight.title}-${index}`}
                  className={`rounded-xl border p-5 ${
                    insight.type === "critical"
                      ? "border-red-200 bg-red-50"
                      : insight.type === "warning"
                        ? "border-amber-200 bg-amber-50"
                        : insight.type === "positive"
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                        insight.type === "critical"
                          ? "bg-red-500"
                          : insight.type === "warning"
                            ? "bg-amber-500"
                            : insight.type === "positive"
                              ? "bg-emerald-500"
                              : "bg-blue-500"
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
              ))}
            </div>
          </section>

          {/* MANAGEMENT RECOMMENDATIONS */}
          <section className="mb-8 rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
              Management Layer
            </p>

            <h2 className="mt-1 text-xl font-bold">
              What FleetFlow Is Telling Management
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-bold">
                  Protect profitable routes
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Use the highest-performing routes as
                  benchmarks for pricing, scheduling, vehicle
                  assignment, and operational efficiency.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-bold">
                  Investigate expensive routes
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  High cost-per-kilometer routes may indicate
                  inefficient fuel use, excessive maintenance,
                  low pricing, or poor route economics.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-bold">
                  Review loss-making operations
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Negative route results should trigger a review
                  of revenue, operating costs, vehicle assignment,
                  and trip planning.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-bold">
                  Improve fleet allocation
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Route and vehicle performance can be compared
                  to identify where the fleet is producing the
                  strongest financial return.
                </p>
              </div>
            </div>
          </section>

          {/* ENGINE */}
          <section className="mb-8 rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
              Intelligence Engine
            </p>

            <h2 className="mt-1 text-xl font-bold">
              How Route Intelligence Works
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm font-bold">
                  01. Route Mapping
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Completed trips are grouped by origin and
                  destination.
                </p>
              </div>

              <div>
                <p className="text-sm font-bold">
                  02. Cost Allocation
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Vehicle operating costs are allocated according
                  to completed-trip distance.
                </p>
              </div>

              <div>
                <p className="text-sm font-bold">
                  03. Performance Scoring
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Profit, margin, cost/km, and fuel efficiency are
                  combined to classify route performance and risk.
                </p>
              </div>

              <div>
                <p className="text-sm font-bold">
                  04. Decision Support
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  FleetFlow highlights opportunities, risks, and
                  routes requiring management attention.
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
    </ProtectedPage>
  );
}
