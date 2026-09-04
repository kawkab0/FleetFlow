"use client";

import { useEffect, useMemo, useState } from "react";

interface Driver {
  id: number;
  driverCode: string;
  name: string;
  phone?: string;
  licenseNumber?: string;
  status: string;
}

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
  driverCode: string;
  fuelDate: string;
  liters: number | string;
  cost: number | string;
}

interface Expense {
  id: number;
  expenseCode: string;
  vehicleCode: string;
  driverCode: string;
  expenseDate: string;
  amount: number | string;
  category: string;
}

interface DriverAnalysis {
  driverCode: string;
  name: string;
  status: string;
  trips: number;
  completedTrips: number;
  activeTrips: number;
  distance: number;
  revenue: number;
  fuelLiters: number;
  fuelCost: number;
  expenses: number;
  totalCost: number;
  profit: number;
  fuelEfficiency: number;
  revenuePerKm: number;
  costPerKm: number;
  utilization: number;
  performanceScore: number;
  performance:
    | "Excellent"
    | "Good"
    | "Average"
    | "Needs Attention";
  reasons: string[];
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

export default function DriverIntelligencePage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuel, setFuel] = useState<Fuel[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        driversResponse,
        tripsResponse,
        fuelResponse,
        expensesResponse,
      ] = await Promise.all([
        fetch(`${API}/drivers`),
        fetch(`${API}/trips`),
        fetch(`${API}/fuel`),
        fetch(`${API}/expenses`),
      ]);

      if (
        !driversResponse.ok ||
        !tripsResponse.ok ||
        !fuelResponse.ok ||
        !expensesResponse.ok
      ) {
        throw new Error("Failed to load driver intelligence data.");
      }

      const [
        driversData,
        tripsData,
        fuelData,
        expensesData,
      ] = await Promise.all([
        driversResponse.json(),
        tripsResponse.json(),
        fuelResponse.json(),
        expensesResponse.json(),
      ]);

      setDrivers(Array.isArray(driversData) ? driversData : []);
      setTrips(Array.isArray(tripsData) ? tripsData : []);
      setFuel(Array.isArray(fuelData) ? fuelData : []);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load driver intelligence data. Make sure the backend is running on port 3001.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const analysis = useMemo<DriverAnalysis[]>(() => {
    const driverMap = new Map<string, DriverAnalysis>();

    drivers.forEach((driver) => {
      driverMap.set(driver.driverCode, {
        driverCode: driver.driverCode,
        name: driver.name || driver.driverCode,
        status: driver.status || "Unknown",
        trips: 0,
        completedTrips: 0,
        activeTrips: 0,
        distance: 0,
        revenue: 0,
        fuelLiters: 0,
        fuelCost: 0,
        expenses: 0,
        totalCost: 0,
        profit: 0,
        fuelEfficiency: 0,
        revenuePerKm: 0,
        costPerKm: 0,
        utilization: 0,
        performanceScore: 0,
        performance: "Average",
        reasons: [],
      });
    });

    trips.forEach((trip) => {
      if (!driverMap.has(trip.driverCode)) {
        driverMap.set(trip.driverCode, {
          driverCode: trip.driverCode,
          name: trip.driverCode,
          status: "Unknown",
          trips: 0,
          completedTrips: 0,
          activeTrips: 0,
          distance: 0,
          revenue: 0,
          fuelLiters: 0,
          fuelCost: 0,
          expenses: 0,
          totalCost: 0,
          profit: 0,
          fuelEfficiency: 0,
          revenuePerKm: 0,
          costPerKm: 0,
          utilization: 0,
          performanceScore: 0,
          performance: "Average",
          reasons: [],
        });
      }

      const driver = driverMap.get(trip.driverCode)!;

      driver.trips += 1;

      if (trip.status.toLowerCase() === "completed") {
        driver.completedTrips += 1;
        driver.distance += num(trip.distance);
        driver.revenue += num(trip.revenue);
      }

      if (
        ["active", "in progress", "ongoing"].includes(
          trip.status.toLowerCase(),
        )
      ) {
        driver.activeTrips += 1;
      }
    });

    fuel.forEach((record) => {
      const driver = driverMap.get(record.driverCode);

      if (!driver) return;

      driver.fuelLiters += num(record.liters);
      driver.fuelCost += num(record.cost);
    });

    expenses.forEach((record) => {
      const driver = driverMap.get(record.driverCode);

      if (!driver) return;

      driver.expenses += num(record.amount);
    });

    driverMap.forEach((driver) => {
      driver.totalCost =
        driver.fuelCost + driver.expenses;

      driver.profit =
        driver.revenue - driver.totalCost;

      driver.fuelEfficiency =
        driver.fuelLiters > 0
          ? driver.distance / driver.fuelLiters
          : 0;

      driver.revenuePerKm =
        driver.distance > 0
          ? driver.revenue / driver.distance
          : 0;

      driver.costPerKm =
        driver.distance > 0
          ? driver.totalCost / driver.distance
          : 0;

      /*
        Utilization combines completed trip activity with
        active trip activity. It is intentionally capped at 100.
      */
      driver.utilization = Math.min(
        100,
        driver.trips > 0
          ? ((driver.completedTrips + driver.activeTrips) /
              driver.trips) *
              100
          : 0,
      );

      let score = 50;
      const reasons: string[] = [];

      if (driver.completedTrips >= 5) {
        score += 15;
        reasons.push("Strong completed-trip activity");
      } else if (driver.completedTrips >= 2) {
        score += 8;
      } else if (driver.completedTrips === 0) {
        score -= 15;
        reasons.push("No completed trips");
      }

      if (driver.revenue > 0) {
        score += 10;
      }

      if (driver.profit > 0) {
        score += 10;
        reasons.push("Positive operating result");
      } else if (driver.profit < 0) {
        score -= 15;
        reasons.push("Operating at a loss");
      }

      if (
        driver.fuelEfficiency > 0 &&
        driver.fuelEfficiency >= 4
      ) {
        score += 10;
        reasons.push("Good fuel efficiency");
      } else if (
        driver.fuelEfficiency > 0 &&
        driver.fuelEfficiency < 3
      ) {
        score -= 10;
        reasons.push("Poor fuel efficiency");
      }

      if (driver.costPerKm > 0 && driver.costPerKm <= 30) {
        score += 5;
      } else if (driver.costPerKm >= 50) {
        score -= 10;
        reasons.push("High operating cost per kilometer");
      }

      if (driver.trips > 0) {
        const completionRate =
          (driver.completedTrips / driver.trips) * 100;

        if (completionRate >= 80) {
          score += 10;
          reasons.push("High trip completion rate");
        } else if (completionRate < 50) {
          score -= 8;
          reasons.push("Low trip completion rate");
        }
      }

      if (driver.status.toLowerCase() === "inactive") {
        score -= 5;
        reasons.push("Driver is inactive");
      }

      driver.performanceScore = Math.max(
        0,
        Math.min(100, score),
      );

      if (driver.performanceScore >= 80) {
        driver.performance = "Excellent";
      } else if (driver.performanceScore >= 65) {
        driver.performance = "Good";
      } else if (driver.performanceScore >= 45) {
        driver.performance = "Average";
      } else {
        driver.performance = "Needs Attention";
      }

      driver.reasons = reasons;
    });

    return Array.from(driverMap.values()).sort(
      (a, b) => b.performanceScore - a.performanceScore,
    );
  }, [drivers, trips, fuel, expenses]);

  const summary = useMemo(() => {
    const totalRevenue = analysis.reduce(
      (sum, driver) => sum + driver.revenue,
      0,
    );

    const totalCost = analysis.reduce(
      (sum, driver) => sum + driver.totalCost,
      0,
    );

    const totalDistance = analysis.reduce(
      (sum, driver) => sum + driver.distance,
      0,
    );

    const totalFuel = analysis.reduce(
      (sum, driver) => sum + driver.fuelLiters,
      0,
    );

    const completedTrips = analysis.reduce(
      (sum, driver) => sum + driver.completedTrips,
      0,
    );

    const totalTrips = analysis.reduce(
      (sum, driver) => sum + driver.trips,
      0,
    );

    const excellentDrivers = analysis.filter(
      (driver) => driver.performance === "Excellent",
    ).length;

    const needsAttention = analysis.filter(
      (driver) => driver.performance === "Needs Attention",
    ).length;

    const bestDriver =
      analysis.length > 0
        ? [...analysis].sort(
            (a, b) =>
              b.performanceScore - a.performanceScore,
          )[0]
        : null;

    const highestRevenueDriver =
      analysis.length > 0
        ? [...analysis].sort(
            (a, b) => b.revenue - a.revenue,
          )[0]
        : null;

    const worstDriver =
      analysis.length > 0
        ? [...analysis].sort(
            (a, b) =>
              a.performanceScore - b.performanceScore,
          )[0]
        : null;

    return {
      totalRevenue,
      totalCost,
      totalDistance,
      totalFuel,
      completedTrips,
      totalTrips,
      excellentDrivers,
      needsAttention,
      bestDriver,
      highestRevenueDriver,
      worstDriver,
      profit: totalRevenue - totalCost,
      completionRate:
        totalTrips > 0
          ? (completedTrips / totalTrips) * 100
          : 0,
      fuelEfficiency:
        totalFuel > 0
          ? totalDistance / totalFuel
          : 0,
      averageScore:
        analysis.length > 0
          ? analysis.reduce(
              (sum, driver) =>
                sum + driver.performanceScore,
              0,
            ) / analysis.length
          : 0,
    };
  }, [analysis]);

  const insights = useMemo(() => {
    const result: {
      title: string;
      description: string;
      type: "positive" | "warning" | "critical";
    }[] = [];

    if (summary.bestDriver) {
      result.push({
        title: "Top driver identified",
        description: `${summary.bestDriver.name} has the strongest overall driver performance score at ${summary.bestDriver.performanceScore}/100.`,
        type: "positive",
      });
    }

    if (summary.needsAttention > 0) {
      result.push({
        title: "Drivers requiring attention",
        description: `${summary.needsAttention} driver${
          summary.needsAttention === 1 ? "" : "s"
        } currently fall into the "Needs Attention" category.`,
        type: "critical",
      });
    }

    if (summary.completionRate >= 80) {
      result.push({
        title: "Strong trip completion",
        description: `The driver fleet has a ${summary.completionRate.toFixed(
          1,
        )}% trip completion rate.`,
        type: "positive",
      });
    } else if (summary.completionRate > 0) {
      result.push({
        title: "Trip completion can improve",
        description: `The current driver trip completion rate is ${summary.completionRate.toFixed(
          1,
        )}%.`,
        type: "warning",
      });
    }

    if (
      summary.fuelEfficiency > 0 &&
      summary.fuelEfficiency < 3
    ) {
      result.push({
        title: "Fuel efficiency warning",
        description: `Driver-associated fuel efficiency is ${summary.fuelEfficiency.toFixed(
          2,
        )} km/L, which indicates high fuel consumption.`,
        type: "warning",
      });
    }

    if (
      summary.profit < 0 &&
      summary.totalRevenue > 0
    ) {
      result.push({
        title: "Driver operations are loss-making",
        description: `Driver-attributed operating costs currently exceed revenue by ${money(
          Math.abs(summary.profit),
        )}.`,
        type: "critical",
      });
    }

    return result;
  }, [summary]);

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
              Driver Performance Intelligence
            </h1>

            <p className="mt-2 text-slate-500">
              Evaluate driver productivity, efficiency,
              profitability, and operational performance.
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
              Driver Revenue
            </p>

            <p className="mt-2 text-2xl font-bold">
              {money(summary.totalRevenue)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Revenue attributed to completed trips
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Driver Operating Cost
            </p>

            <p className="mt-2 text-2xl font-bold">
              {money(summary.totalCost)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Fuel + driver-associated expenses
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Average Performance
            </p>

            <p className="mt-2 text-2xl font-bold">
              {summary.averageScore.toFixed(0)}/100
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Overall driver performance score
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Trip Completion
            </p>

            <p className="mt-2 text-2xl font-bold">
              {summary.completionRate.toFixed(1)}%
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Completed trips vs recorded trips
            </p>
          </div>
        </div>

        {/* PERFORMANCE SUMMARY */}
        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Drivers Analyzed
            </p>

            <p className="mt-2 text-3xl font-bold">
              {analysis.length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-sm text-emerald-700">
              Excellent Drivers
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {summary.excellentDrivers}
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-700">
              Needs Attention
            </p>

            <p className="mt-2 text-3xl font-bold text-red-700">
              {summary.needsAttention}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Fleet Driver Efficiency
            </p>

            <p className="mt-2 text-3xl font-bold">
              {summary.fuelEfficiency > 0
                ? `${summary.fuelEfficiency.toFixed(2)} km/L`
                : "N/A"}
            </p>
          </div>
        </div>

        {/* BEST / WORST */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
                  Top Performer
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Best Driver
                </h2>
              </div>

              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                TOP
              </div>
            </div>

            {summary.bestDriver ? (
              <>
                <p className="text-lg font-semibold">
                  {summary.bestDriver.name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {summary.bestDriver.driverCode}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Score
                    </p>

                    <p className="mt-1 font-bold text-emerald-600">
                      {summary.bestDriver.performanceScore}/100
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Completed Trips
                    </p>

                    <p className="mt-1 font-bold">
                      {summary.bestDriver.completedTrips}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Revenue
                    </p>

                    <p className="mt-1 font-bold">
                      {money(summary.bestDriver.revenue)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Fuel Efficiency
                    </p>

                    <p className="mt-1 font-bold">
                      {summary.bestDriver.fuelEfficiency > 0
                        ? `${summary.bestDriver.fuelEfficiency.toFixed(
                            2,
                          )} km/L`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                No driver data available.
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
                  Lowest Performing Driver
                </h2>
              </div>

              <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                REVIEW
              </div>
            </div>

            {summary.worstDriver ? (
              <>
                <p className="text-lg font-semibold">
                  {summary.worstDriver.name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {summary.worstDriver.driverCode}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Score
                    </p>

                    <p className="mt-1 font-bold text-red-600">
                      {summary.worstDriver.performanceScore}/100
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Trips
                    </p>

                    <p className="mt-1 font-bold">
                      {summary.worstDriver.trips}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Profit / Loss
                    </p>

                    <p
                      className={`mt-1 font-bold ${
                        summary.worstDriver.profit >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {money(summary.worstDriver.profit)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Cost / KM
                    </p>

                    <p className="mt-1 font-bold">
                      {money(summary.worstDriver.costPerKm)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                No driver data available.
              </p>
            )}
          </div>
        </div>

        {/* DRIVER TABLE */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Driver Performance
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Driver Intelligence Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Compare productivity, revenue, efficiency,
              profitability, and performance scores.
            </p>
          </div>

          {analysis.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No driver data is available for analysis.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Driver</th>
                    <th className="px-6 py-4">Trips</th>
                    <th className="px-6 py-4">Distance</th>
                    <th className="px-6 py-4">Revenue</th>
                    <th className="px-6 py-4">Profit / Loss</th>
                    <th className="px-6 py-4">Fuel Efficiency</th>
                    <th className="px-6 py-4">Cost / KM</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Performance</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {analysis.map((driver) => (
                    <tr
                      key={driver.driverCode}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold">
                          {driver.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {driver.driverCode}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p>{driver.trips}</p>

                        <p className="mt-1 text-xs text-slate-400">
                          {driver.completedTrips} completed
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        {driver.distance.toLocaleString()} km
                      </td>

                      <td className="px-6 py-4 font-medium">
                        {money(driver.revenue)}
                      </td>

                      <td
                        className={`px-6 py-4 font-bold ${
                          driver.profit >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {money(driver.profit)}
                      </td>

                      <td className="px-6 py-4">
                        {driver.fuelEfficiency > 0
                          ? `${driver.fuelEfficiency.toFixed(
                              2,
                            )} km/L`
                          : "N/A"}
                      </td>

                      <td className="px-6 py-4">
                        {money(driver.costPerKm)}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold">
                          {driver.performanceScore}
                        </span>
                        <span className="text-slate-400">
                          /100
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            driver.performance === "Excellent"
                              ? "bg-emerald-100 text-emerald-700"
                              : driver.performance === "Good"
                                ? "bg-blue-100 text-blue-700"
                                : driver.performance === "Average"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          {driver.performance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* PERFORMANCE SIGNALS */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Performance Signals
          </p>

          <h2 className="mt-1 text-xl font-bold">
            Driver Performance Factors
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm font-semibold">
                Productivity
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Completed trips, total trips, distance, and active
                assignments are used to evaluate driver activity.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm font-semibold">
                Efficiency
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Fuel efficiency and operating cost per kilometer
                reveal how efficiently drivers operate assigned
                vehicles.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm font-semibold">
                Financial Impact
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Revenue, fuel costs, expenses, and operating result
                show the financial contribution of each driver.
              </p>
            </div>
          </div>
        </section>

        {/* BUSINESS INSIGHTS */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Decision Support
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Automated Driver Insights
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              FleetFlow converts driver activity into actionable
              management signals.
            </p>
          </div>

          <div className="grid gap-4 p-6">
            {insights.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                Not enough operational data to generate driver
                insights yet.
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
            How Driver Intelligence Works
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-4">
            <div>
              <p className="text-sm font-bold">
                01. Activity
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                FleetFlow analyzes trips, completion rates,
                distance, and active assignments.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold">
                02. Efficiency
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Fuel consumption and cost per kilometer are used
                to identify efficient operations.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold">
                03. Financial Impact
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Revenue and driver-associated costs reveal
                financial contribution.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold">
                04. Performance Score
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Multiple signals are combined into a driver
                performance score from 0 to 100.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <div className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400 md:flex-row">
          <p>
            FleetFlow ERP • Driver Performance Intelligence
          </p>

          <p>
            Data sources: Drivers • Trips • Fuel • Expenses
          </p>
        </div>
      </div>
    </main>
  );
}
