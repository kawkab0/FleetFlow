"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedPage from "@/components/ProtectedPage";

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

type Performance =
  | "Excellent"
  | "Good"
  | "Average"
  | "Needs Attention";

type RiskLevel = "Low" | "Medium" | "High" | "Critical";

interface DriverAnalysis {
  driverCode: string;
  name: string;
  status: string;

  trips: number;
  completedTrips: number;
  activeTrips: number;
  completionRate: number;

  distance: number;
  revenue: number;

  tripFuelLiters: number;
  fuelPurchaseLiters: number;
  fuelCost: number;

  expenses: number;
  totalCost: number;
  profit: number;
  profitMargin: number;

  fuelEfficiency: number;
  revenuePerKm: number;
  costPerKm: number;

  utilization: number;

  performanceScore: number;
  performance: Performance;
  risk: RiskLevel;

  reasons: string[];
  recommendation: string;
}

function num(value: number | string | undefined | null): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number): string {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;
}

function number(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 1,
  });
}

function percent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function emptyDriver(
  driverCode: string,
  name = driverCode,
  status = "Unknown",
): DriverAnalysis {
  return {
    driverCode,
    name,
    status,

    trips: 0,
    completedTrips: 0,
    activeTrips: 0,
    completionRate: 0,

    distance: 0,
    revenue: 0,

    tripFuelLiters: 0,
    fuelPurchaseLiters: 0,
    fuelCost: 0,

    expenses: 0,
    totalCost: 0,
    profit: 0,
    profitMargin: 0,

    fuelEfficiency: 0,
    revenuePerKm: 0,
    costPerKm: 0,

    utilization: 0,

    performanceScore: 0,
    performance: "Average",
    risk: "Medium",

    reasons: [],
    recommendation: "Continue monitoring driver activity.",
  };
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
        driversData,
        tripsData,
        fuelData,
        expensesData,
      ] = await Promise.all([
        apiFetch("/drivers"),
        apiFetch("/trips"),
        apiFetch("/fuel"),
        apiFetch("/expenses"),
      ]);

      setDrivers(Array.isArray(driversData) ? driversData : []);
      setTrips(Array.isArray(tripsData) ? tripsData : []);
      setFuel(Array.isArray(fuelData) ? fuelData : []);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to load driver intelligence data. Make sure the backend is running on port 3001.",
        );
      }
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
      driverMap.set(
        driver.driverCode,
        emptyDriver(
          driver.driverCode,
          driver.name || driver.driverCode,
          driver.status || "Unknown",
        ),
      );
    });

    /*
     * Trips are the primary operational source.
     *
     * Fuel efficiency uses fuelUsed recorded directly against
     * completed trips rather than fuel purchases. This avoids
     * mixing fuel purchased at one point in time with distance
     * driven over a different period.
     */
    trips.forEach((trip) => {
      if (!trip.driverCode) return;

      if (!driverMap.has(trip.driverCode)) {
        driverMap.set(
          trip.driverCode,
          emptyDriver(trip.driverCode),
        );
      }

      const driver = driverMap.get(trip.driverCode)!;

      const status = trip.status?.toLowerCase() || "";

      driver.trips += 1;

      if (
        status === "active" ||
        status === "in progress" ||
        status === "ongoing"
      ) {
        driver.activeTrips += 1;
      }

      if (status === "completed") {
        driver.completedTrips += 1;
        driver.distance += num(trip.distance);
        driver.revenue += num(trip.revenue);
        driver.tripFuelLiters += num(trip.fuelUsed);
      }
    });

    /*
     * Fuel records are used for financial cost analysis.
     * They are not used directly for operational km/L because
     * purchase timing may not match completed-trip timing.
     */
    fuel.forEach((record) => {
      if (!record.driverCode) return;

      if (!driverMap.has(record.driverCode)) {
        driverMap.set(
          record.driverCode,
          emptyDriver(record.driverCode),
        );
      }

      const driver = driverMap.get(record.driverCode)!;

      driver.fuelPurchaseLiters += num(record.liters);
      driver.fuelCost += num(record.cost);
    });

    expenses.forEach((record) => {
      if (!record.driverCode) return;

      if (!driverMap.has(record.driverCode)) {
        driverMap.set(
          record.driverCode,
          emptyDriver(record.driverCode),
        );
      }

      const driver = driverMap.get(record.driverCode)!;

      driver.expenses += num(record.amount);
    });

    const rawDrivers = Array.from(driverMap.values());

    const activeDrivers = rawDrivers.filter(
      (driver) => driver.trips > 0,
    );

    const fleetAverageRevenuePerKm =
      activeDrivers.length > 0
        ? activeDrivers.reduce(
            (sum, driver) => sum + driver.revenuePerKm,
            0,
          ) / activeDrivers.length
        : 0;

    const fleetAverageCostPerKm =
      activeDrivers.length > 0
        ? activeDrivers.reduce(
            (sum, driver) => sum + driver.costPerKm,
            0,
          ) / activeDrivers.length
        : 0;

    const fleetAverageFuelEfficiency =
      activeDrivers.filter(
        (driver) => driver.tripFuelLiters > 0,
      ).length > 0
        ? activeDrivers
            .filter((driver) => driver.tripFuelLiters > 0)
            .reduce(
              (sum, driver) => sum + driver.fuelEfficiency,
              0,
            ) /
          activeDrivers.filter(
            (driver) => driver.tripFuelLiters > 0,
          ).length
        : 0;

    rawDrivers.forEach((driver) => {
      driver.completionRate =
        driver.trips > 0
          ? (driver.completedTrips / driver.trips) * 100
          : 0;

      driver.totalCost =
        driver.fuelCost + driver.expenses;

      driver.profit =
        driver.revenue - driver.totalCost;

      driver.profitMargin =
        driver.revenue > 0
          ? (driver.profit / driver.revenue) * 100
          : 0;

      driver.fuelEfficiency =
        driver.tripFuelLiters > 0
          ? driver.distance / driver.tripFuelLiters
          : 0;

      driver.revenuePerKm =
        driver.distance > 0
          ? driver.revenue / driver.distance
          : 0;

      driver.costPerKm =
        driver.distance > 0
          ? driver.totalCost / driver.distance
          : 0;

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

      /*
       * 1. Completion performance
       */
      if (driver.completionRate >= 90) {
        score += 15;
        reasons.push("Excellent trip completion rate");
      } else if (driver.completionRate >= 75) {
        score += 9;
        reasons.push("Strong trip completion rate");
      } else if (
        driver.trips > 0 &&
        driver.completionRate < 50
      ) {
        score -= 12;
        reasons.push("Low trip completion rate");
      }

      /*
       * 2. Operational activity
       */
      if (driver.completedTrips >= 5) {
        score += 10;
        reasons.push("Strong completed-trip activity");
      } else if (driver.completedTrips >= 2) {
        score += 5;
      } else if (driver.completedTrips === 0) {
        score -= 10;
        reasons.push("No completed trips recorded");
      }

      /*
       * 3. Profitability
       */
      if (driver.profit > 0) {
        score += 10;
        reasons.push("Positive operating contribution");
      } else if (
        driver.revenue > 0 &&
        driver.profit < 0
      ) {
        score -= 15;
        reasons.push("Operating at a loss");
      }

      /*
       * 4. Fuel efficiency relative to fleet.
       */
      if (
        driver.fuelEfficiency > 0 &&
        fleetAverageFuelEfficiency > 0
      ) {
        const fuelRatio =
          driver.fuelEfficiency /
          fleetAverageFuelEfficiency;

        if (fuelRatio >= 1.1) {
          score += 10;
          reasons.push("Above-average fuel efficiency");
        } else if (fuelRatio < 0.85) {
          score -= 10;
          reasons.push("Below-average fuel efficiency");
        }
      }

      /*
       * 5. Revenue productivity.
       */
      if (
        driver.revenuePerKm > 0 &&
        fleetAverageRevenuePerKm > 0
      ) {
        const revenueRatio =
          driver.revenuePerKm /
          fleetAverageRevenuePerKm;

        if (revenueRatio >= 1.1) {
          score += 8;
          reasons.push("Above-average revenue per kilometer");
        } else if (revenueRatio < 0.85) {
          score -= 6;
          reasons.push("Below-average revenue per kilometer");
        }
      }

      /*
       * 6. Cost efficiency.
       */
      if (
        driver.costPerKm > 0 &&
        fleetAverageCostPerKm > 0
      ) {
        const costRatio =
          driver.costPerKm /
          fleetAverageCostPerKm;

        if (costRatio <= 0.85) {
          score += 7;
          reasons.push("Below-average operating cost per kilometer");
        } else if (costRatio >= 1.15) {
          score -= 8;
          reasons.push("Above-average operating cost per kilometer");
        }
      }

      /*
       * 7. Account status.
       */
      if (driver.status.toLowerCase() === "inactive") {
        score -= 5;
        reasons.push("Driver is currently inactive");
      }

      driver.performanceScore = Math.max(
        0,
        Math.min(100, Math.round(score)),
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

      /*
       * Risk classification.
       */
      if (
        driver.performanceScore < 40 ||
        (driver.profit < 0 &&
          driver.completionRate < 50)
      ) {
        driver.risk = "Critical";
      } else if (
        driver.performanceScore < 55 ||
        (driver.fuelEfficiency > 0 &&
          fleetAverageFuelEfficiency > 0 &&
          driver.fuelEfficiency <
            fleetAverageFuelEfficiency * 0.8)
      ) {
        driver.risk = "High";
      } else if (driver.performanceScore < 70) {
        driver.risk = "Medium";
      } else {
        driver.risk = "Low";
      }

      /*
       * Management recommendation.
       */
      if (driver.risk === "Critical") {
        driver.recommendation =
          "Review recent trips, completion issues, and operating costs before assigning additional high-value routes.";
      } else if (
        driver.fuelEfficiency > 0 &&
        fleetAverageFuelEfficiency > 0 &&
        driver.fuelEfficiency <
          fleetAverageFuelEfficiency * 0.8
      ) {
        driver.recommendation =
          "Investigate driving behavior, vehicle condition, route patterns, and fuel consumption.";
      } else if (
        driver.completionRate < 60 &&
        driver.trips > 0
      ) {
        driver.recommendation =
          "Review delayed or incomplete assignments and identify the operational causes.";
      } else if (driver.profit < 0 && driver.revenue > 0) {
        driver.recommendation =
          "Review route profitability and driver-associated operating costs before increasing workload.";
      } else if (
        driver.revenuePerKm > 0 &&
        fleetAverageRevenuePerKm > 0 &&
        driver.revenuePerKm >
          fleetAverageRevenuePerKm * 1.1
      ) {
        driver.recommendation =
          "Strong commercial performance. Consider prioritizing this driver for revenue-sensitive assignments.";
      } else {
        driver.recommendation =
          "Performance is stable. Continue monitoring productivity, efficiency, and profitability.";
      }

      driver.reasons = reasons;
    });

    return rawDrivers.sort(
      (a, b) =>
        b.performanceScore - a.performanceScore ||
        b.revenue - a.revenue,
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

    const totalTripFuel = analysis.reduce(
      (sum, driver) => sum + driver.tripFuelLiters,
      0,
    );

    const totalPurchasedFuel = analysis.reduce(
      (sum, driver) => sum + driver.fuelPurchaseLiters,
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

    const activeTrips = analysis.reduce(
      (sum, driver) => sum + driver.activeTrips,
      0,
    );

    const excellentDrivers = analysis.filter(
      (driver) => driver.performance === "Excellent",
    ).length;

    const needsAttention = analysis.filter(
      (driver) => driver.performance === "Needs Attention",
    ).length;

    const highRiskDrivers = analysis.filter(
      (driver) =>
        driver.risk === "High" ||
        driver.risk === "Critical",
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

    const mostEfficientDriver =
      analysis
        .filter((driver) => driver.fuelEfficiency > 0)
        .sort(
          (a, b) =>
            b.fuelEfficiency - a.fuelEfficiency,
        )[0] || null;

    const lowestCostDriver =
      analysis
        .filter((driver) => driver.costPerKm > 0)
        .sort(
          (a, b) =>
            a.costPerKm - b.costPerKm,
        )[0] || null;

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
      totalTripFuel,
      totalPurchasedFuel,

      completedTrips,
      totalTrips,
      activeTrips,

      excellentDrivers,
      needsAttention,
      highRiskDrivers,

      bestDriver,
      highestRevenueDriver,
      mostEfficientDriver,
      lowestCostDriver,
      worstDriver,

      profit: totalRevenue - totalCost,

      completionRate:
        totalTrips > 0
          ? (completedTrips / totalTrips) * 100
          : 0,

      fuelEfficiency:
        totalTripFuel > 0
          ? totalDistance / totalTripFuel
          : 0,

      revenuePerKm:
        totalDistance > 0
          ? totalRevenue / totalDistance
          : 0,

      costPerKm:
        totalDistance > 0
          ? totalCost / totalDistance
          : 0,

      profitMargin:
        totalRevenue > 0
          ? ((totalRevenue - totalCost) /
              totalRevenue) *
            100
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
        description: `${summary.bestDriver.name} has the strongest overall performance score at ${summary.bestDriver.performanceScore}/100.`,
        type: "positive",
      });
    }

    if (summary.highestRevenueDriver) {
      result.push({
        title: "Highest revenue contributor",
        description: `${summary.highestRevenueDriver.name} generated ${money(
          summary.highestRevenueDriver.revenue,
        )} from completed trips.`,
        type: "positive",
      });
    }

    if (summary.mostEfficientDriver) {
      result.push({
        title: "Fuel efficiency leader",
        description: `${summary.mostEfficientDriver.name} currently records the strongest operational fuel efficiency at ${summary.mostEfficientDriver.fuelEfficiency.toFixed(
          2,
        )} km/L.`,
        type: "positive",
      });
    }

    if (summary.highRiskDrivers > 0) {
      result.push({
        title: "Driver risk detected",
        description: `${summary.highRiskDrivers} driver${
          summary.highRiskDrivers === 1 ? "" : "s"
        } currently have High or Critical performance risk and should be reviewed.`,
        type: "critical",
      });
    }

    if (summary.needsAttention > 0) {
      result.push({
        title: "Performance attention required",
        description: `${summary.needsAttention} driver${
          summary.needsAttention === 1 ? "" : "s"
        } currently fall into the Needs Attention category.`,
        type: "critical",
      });
    }

    if (summary.completionRate >= 85) {
      result.push({
        title: "Strong trip completion",
        description: `The driver fleet has a ${summary.completionRate.toFixed(
          1,
        )}% trip completion rate.`,
        type: "positive",
      });
    } else if (summary.totalTrips > 0) {
      result.push({
        title: "Trip completion opportunity",
        description: `The current completion rate is ${summary.completionRate.toFixed(
          1,
        )}%. Delayed or incomplete assignments should be reviewed.`,
        type: "warning",
      });
    }

    if (
      summary.fuelEfficiency > 0 &&
      summary.fuelEfficiency < 3
    ) {
      result.push({
        title: "Fleet fuel efficiency warning",
        description: `Completed-trip fuel efficiency is ${summary.fuelEfficiency.toFixed(
          2,
        )} km/L, indicating relatively high fuel consumption.`,
        type: "warning",
      });
    }

    if (
      summary.profit < 0 &&
      summary.totalRevenue > 0
    ) {
      result.push({
        title: "Driver operations are loss-making",
        description: `Driver-attributed operating costs currently exceed completed-trip revenue by ${money(
          Math.abs(summary.profit),
        )}.`,
        type: "critical",
      });
    }

    if (
      summary.profitMargin > 0 &&
      summary.profitMargin >= 20
    ) {
      result.push({
        title: "Healthy driver contribution",
        description: `Driver-attributed operations currently produce a ${summary.profitMargin.toFixed(
          1,
        )}% operating margin.`,
        type: "positive",
      });
    }

    return result;
  }, [summary]);

  return (
    <ProtectedPage permission="driverIntelligence">
      <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
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

              <p className="mt-2 max-w-3xl text-slate-500">
                Evaluate driver productivity, efficiency,
                profitability, completion performance, and
                operational risk.
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

          {/* PRIMARY KPIs */}
          <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Driver Revenue
              </p>

              <p className="mt-2 text-2xl font-bold">
                {money(summary.totalRevenue)}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Revenue from completed trips
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Operating Cost
              </p>

              <p className="mt-2 text-2xl font-bold">
                {money(summary.totalCost)}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Driver-linked fuel + expenses
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
                Composite fleet driver score
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Completion Rate
              </p>

              <p className="mt-2 text-2xl font-bold">
                {percent(summary.completionRate)}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Completed vs recorded trips
              </p>
            </div>

          </div>

          {/* SECONDARY KPIs */}
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
                High / Critical Risk
              </p>

              <p className="mt-2 text-3xl font-bold text-red-700">
                {summary.highRiskDrivers}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">
                Operational Fuel Efficiency
              </p>

              <p className="mt-2 text-3xl font-bold">
                {summary.fuelEfficiency > 0
                  ? `${summary.fuelEfficiency.toFixed(2)} km/L`
                  : "N/A"}
              </p>
            </div>

          </div>

          {/* BUSINESS SNAPSHOT */}
          <div className="mb-8 grid gap-6 lg:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Fleet Economics
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Driver Contribution
              </h2>

              <div className="mt-5 space-y-4">

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Revenue / KM
                  </span>

                  <span className="font-bold">
                    {money(summary.revenuePerKm)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Cost / KM
                  </span>

                  <span className="font-bold">
                    {money(summary.costPerKm)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Operating Margin
                  </span>

                  <span
                    className={`font-bold ${
                      summary.profitMargin >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {percent(summary.profitMargin)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-sm font-medium">
                    Operating Result
                  </span>

                  <span
                    className={`font-bold ${
                      summary.profit >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {money(summary.profit)}
                  </span>
                </div>

              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Activity
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Driver Workload
              </h2>

              <div className="mt-5 space-y-4">

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Total Trips
                  </span>

                  <span className="font-bold">
                    {summary.totalTrips}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Completed
                  </span>

                  <span className="font-bold">
                    {summary.completedTrips}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Active
                  </span>

                  <span className="font-bold">
                    {summary.activeTrips}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Distance
                  </span>

                  <span className="font-bold">
                    {number(summary.totalDistance)} km
                  </span>
                </div>

              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Efficiency
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Fuel Intelligence
              </h2>

              <div className="mt-5 space-y-4">

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Trip Fuel
                  </span>

                  <span className="font-bold">
                    {number(summary.totalTripFuel)} L
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Recorded Purchases
                  </span>

                  <span className="font-bold">
                    {number(summary.totalPurchasedFuel)} L
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Fuel Efficiency
                  </span>

                  <span className="font-bold">
                    {summary.fuelEfficiency > 0
                      ? `${summary.fuelEfficiency.toFixed(2)} km/L`
                      : "N/A"}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-4 text-xs leading-5 text-slate-400">
                  Efficiency uses fuel recorded on completed
                  trips, while fuel purchases are used for
                  cost analysis.
                </div>

              </div>
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
                        Completion
                      </p>

                      <p className="mt-1 font-bold">
                        {percent(
                          summary.bestDriver.completionRate,
                        )}
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

                  <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                    {summary.bestDriver.recommendation}
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
                  {summary.worstDriver?.risk || "REVIEW"}
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
                        Completion
                      </p>

                      <p className="mt-1 font-bold">
                        {percent(
                          summary.worstDriver.completionRate,
                        )}
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

                  <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">
                    {summary.worstDriver.recommendation}
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
                Driver Intelligence Ranking
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Compare productivity, completion, revenue,
                efficiency, profitability, risk, and performance.
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
                      <th className="px-6 py-4">
                        Driver
                      </th>

                      <th className="px-6 py-4">
                        Trips
                      </th>

                      <th className="px-6 py-4">
                        Completion
                      </th>

                      <th className="px-6 py-4">
                        Revenue
                      </th>

                      <th className="px-6 py-4">
                        Profit / Loss
                      </th>

                      <th className="px-6 py-4">
                        Fuel Efficiency
                      </th>

                      <th className="px-6 py-4">
                        Cost / KM
                      </th>

                      <th className="px-6 py-4">
                        Score
                      </th>

                      <th className="px-6 py-4">
                        Risk
                      </th>

                      <th className="px-6 py-4">
                        Performance
                      </th>
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
                          {percent(driver.completionRate)}
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
                          {driver.costPerKm > 0
                            ? money(driver.costPerKm)
                            : "N/A"}
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
                              driver.risk === "Low"
                                ? "bg-emerald-100 text-emerald-700"
                                : driver.risk === "Medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : driver.risk === "High"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                          >
                            {driver.risk}
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

          {/* DRIVER SIGNALS */}
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Performance Signals
            </p>

            <h2 className="mt-1 text-xl font-bold">
              What FleetFlow Evaluates
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-semibold">
                  Productivity
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Completed trips, total assignments, active
                  work, and distance measure driver activity.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-semibold">
                  Completion
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Completion rate highlights drivers with delayed
                  or incomplete operational assignments.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-semibold">
                  Efficiency
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Fuel efficiency and cost per kilometer reveal
                  operational efficiency relative to the fleet.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-semibold">
                  Financial Impact
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Revenue, costs, profit, and margin show each
                  driver's financial contribution.
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

          {/* MANAGEMENT RECOMMENDATIONS */}
          <section className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
              Management Actions
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Recommended Actions
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="font-semibold">
                  Reward strong performers
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Prioritize high-scoring drivers for
                  revenue-sensitive and strategically important
                  assignments.
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="font-semibold">
                  Review high-risk drivers
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Investigate completion problems, negative
                  profitability, and unusually high operating costs.
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="font-semibold">
                  Monitor fuel behavior
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Compare operational fuel efficiency between
                  drivers and investigate significant deviations.
                </p>
              </div>

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

            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-5">

              <div>
                <p className="text-sm font-bold">
                  01. Activity
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  FleetFlow analyzes trips, completion,
                  assignments, and distance.
                </p>
              </div>

              <div>
                <p className="text-sm font-bold">
                  02. Efficiency
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Completed-trip fuel usage is used to calculate
                  operational fuel efficiency.
                </p>
              </div>

              <div>
                <p className="text-sm font-bold">
                  03. Financial Impact
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Revenue, fuel costs, and driver-associated
                  expenses reveal financial contribution.
                </p>
              </div>

              <div>
                <p className="text-sm font-bold">
                  04. Fleet Benchmark
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Drivers are compared against fleet-level
                  efficiency, productivity, and cost benchmarks.
                </p>
              </div>

              <div>
                <p className="text-sm font-bold">
                  05. Decision Score
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Multiple operational signals become a
                  0–100 performance score and risk level.
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
    </ProtectedPage>
  );
}

