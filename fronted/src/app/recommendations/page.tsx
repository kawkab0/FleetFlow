"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import { apiFetch } from "@/lib/api";

interface Vehicle {
  id: number;
  vehicleCode?: string;
  status?: string;
}

interface Trip {
  id: number;
  vehicleId?: number;
  vehicleCode?: string;
  status?: string;
  distance?: number | string;
  revenue?: number | string;
  fuelUsed?: number | string;
}

interface Fuel {
  id: number;
  vehicleId?: number;
  vehicleCode?: string;
  liters?: number | string;
  quantity?: number | string;
  totalCost?: number | string;
  cost?: number | string;
  amount?: number | string;
}

interface Maintenance {
  id: number;
  vehicleId?: number;
  vehicleCode?: string;
  cost?: number | string;
  amount?: number | string;
}

interface Expense {
  id: number;
  vehicleId?: number;
  vehicleCode?: string;
  amount?: number | string;
  cost?: number | string;
}

type RiskLevel = "Critical" | "High" | "Medium" | "Low";

type Performance =
  | "Excellent"
  | "Good"
  | "Average"
  | "Needs Attention"
  | "Loss Making";

interface VehicleAnalysis {
  vehicle: Vehicle;
  trips: number;
  completedTrips: number;
  distance: number;
  revenue: number;
  fuelCost: number;
  fuelLitersPurchased: number;
  maintenanceCost: number;
  otherExpenses: number;
  totalCost: number;
  profit: number;
  margin: number;
  revenuePerKm: number;
  costPerKm: number;
  profitPerKm: number;
  operationalFuelEfficiency: number;
  riskScore: number;
  riskLevel: RiskLevel;
  performance: Performance;
  reasons: string[];
  recommendations: string[];
}

interface Recommendation {
  id: string;
  priority: RiskLevel;
  vehicleCode?: string;
  title: string;
  reason: string;
  action: string;
}

function num(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 2,
  }).format(value);
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

function isCompletedTrip(trip: Trip): boolean {
  const status = String(trip.status ?? "")
    .trim()
    .toLowerCase();

  return [
    "completed",
    "complete",
    "delivered",
    "closed",
    "finished",
  ].includes(status);
}

function sameVehicle(
  record: {
    vehicleId?: number;
    vehicleCode?: string;
  },
  vehicle: Vehicle,
): boolean {
  if (
    record.vehicleId !== undefined &&
    record.vehicleId !== null &&
    Number(record.vehicleId) === Number(vehicle.id)
  ) {
    return true;
  }

  if (
    record.vehicleCode &&
    vehicle.vehicleCode &&
    String(record.vehicleCode).toLowerCase() ===
      String(vehicle.vehicleCode).toLowerCase()
  ) {
    return true;
  }

  return false;
}

function riskRank(level: RiskLevel): number {
  if (level === "Critical") return 4;
  if (level === "High") return 3;
  if (level === "Medium") return 2;
  return 1;
}

function performanceRank(level: Performance): number {
  if (level === "Loss Making") return 5;
  if (level === "Needs Attention") return 4;
  if (level === "Average") return 3;
  if (level === "Good") return 2;
  return 1;
}

function badgeClass(level: RiskLevel | Performance): string {
  switch (level) {
    case "Critical":
    case "Loss Making":
      return "border-red-200 bg-red-50 text-red-700";

    case "High":
    case "Needs Attention":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "Medium":
    case "Average":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "Low":
    case "Good":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "Excellent":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function RecommendationsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuel, setFuel] = useState<Fuel[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try {
      setError("");

      const [
        vehiclesData,
        tripsData,
        fuelData,
        maintenanceData,
        expensesData,
      ] = await Promise.all([
        apiFetch("/vehicles"),
        apiFetch("/trips"),
        apiFetch("/fuel"),
        apiFetch("/maintenance"),
        apiFetch("/expenses"),
      ]);

      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setTrips(Array.isArray(tripsData) ? tripsData : []);
      setFuel(Array.isArray(fuelData) ? fuelData : []);
      setMaintenance(
        Array.isArray(maintenanceData) ? maintenanceData : [],
      );
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load recommendation data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const analyses = useMemo<VehicleAnalysis[]>(() => {
    if (!vehicles.length) return [];

    const raw = vehicles.map((vehicle) => {
      const vehicleTrips = trips.filter((trip) =>
        sameVehicle(trip, vehicle),
      );

      const completedTrips = vehicleTrips.filter(isCompletedTrip);

      const distance = completedTrips.reduce(
        (sum, trip) => sum + num(trip.distance),
        0,
      );

      const revenue = completedTrips.reduce(
        (sum, trip) => sum + num(trip.revenue),
        0,
      );

      const operationalFuel = completedTrips.reduce(
        (sum, trip) => sum + num(trip.fuelUsed),
        0,
      );

      const vehicleFuel = fuel.filter((record) =>
        sameVehicle(record, vehicle),
      );

      const fuelCost = vehicleFuel.reduce(
        (sum, record) =>
          sum +
          num(record.totalCost ?? record.cost ?? record.amount),
        0,
      );

      const fuelLitersPurchased = vehicleFuel.reduce(
        (sum, record) =>
          sum + num(record.liters ?? record.quantity),
        0,
      );

      const vehicleMaintenance = maintenance.filter((record) =>
        sameVehicle(record, vehicle),
      );

      const maintenanceCost = vehicleMaintenance.reduce(
        (sum, record) =>
          sum + num(record.cost ?? record.amount),
        0,
      );

      const vehicleExpenses = expenses.filter((record) =>
        sameVehicle(record, vehicle),
      );

      const otherExpenses = vehicleExpenses.reduce(
        (sum, record) =>
          sum + num(record.amount ?? record.cost),
        0,
      );

      const totalCost =
        fuelCost + maintenanceCost + otherExpenses;

      const profit = revenue - totalCost;

      const margin =
        revenue > 0 ? (profit / revenue) * 100 : 0;

      const revenuePerKm =
        distance > 0 ? revenue / distance : 0;

      const costPerKm =
        distance > 0 ? totalCost / distance : 0;

      const profitPerKm =
        distance > 0 ? profit / distance : 0;

      const operationalFuelEfficiency =
        operationalFuel > 0
          ? distance / operationalFuel
          : 0;

      return {
        vehicle,
        trips: vehicleTrips.length,
        completedTrips: completedTrips.length,
        distance,
        revenue,
        fuelCost,
        fuelLitersPurchased,
        maintenanceCost,
        otherExpenses,
        totalCost,
        profit,
        margin,
        revenuePerKm,
        costPerKm,
        profitPerKm,
        operationalFuelEfficiency,
      };
    });

    const active = raw.filter(
      (item) => item.distance > 0,
    );

    const fleetRevenue = raw.reduce(
      (sum, item) => sum + item.revenue,
      0,
    );

    const fleetCost = raw.reduce(
      (sum, item) => sum + item.totalCost,
      0,
    );

    const fleetDistance = raw.reduce(
      (sum, item) => sum + item.distance,
      0,
    );

    const fleetProfit = fleetRevenue - fleetCost;

    const fleetRevenuePerKm =
      fleetDistance > 0
        ? fleetRevenue / fleetDistance
        : 0;

    const fleetCostPerKm =
      fleetDistance > 0
        ? fleetCost / fleetDistance
        : 0;

    const fuelEfficiencies = active
      .map((item) => item.operationalFuelEfficiency)
      .filter((value) => value > 0);

    const fleetFuelEfficiency =
      fuelEfficiencies.length > 0
        ? fuelEfficiencies.reduce(
            (sum, value) => sum + value,
            0,
          ) / fuelEfficiencies.length
        : 0;

    const averageProfit =
      raw.length > 0 ? fleetProfit / raw.length : 0;

    const averageMaintenance =
      raw.length > 0
        ? raw.reduce(
            (sum, item) => sum + item.maintenanceCost,
            0,
          ) / raw.length
        : 0;

    return raw.map((item) => {
      let riskScore = 0;
      const reasons: string[] = [];
      const recommendations: string[] = [];

      if (item.profit < 0) {
        riskScore += 35;
        reasons.push("Vehicle is currently loss-making.");
        recommendations.push(
          "Review the vehicle's route revenue and operating costs.",
        );
      }

      if (
        item.revenue > 0 &&
        fleetRevenuePerKm > 0 &&
        item.revenuePerKm < fleetRevenuePerKm * 0.75
      ) {
        riskScore += 15;
        reasons.push(
          "Revenue per kilometer is significantly below the fleet benchmark.",
        );
        recommendations.push(
          "Review route pricing, trip allocation, and utilization.",
        );
      }

      if (
        item.distance > 0 &&
        fleetCostPerKm > 0 &&
        item.costPerKm > fleetCostPerKm * 1.5
      ) {
        riskScore += 15;
        reasons.push(
          "Operating cost per kilometer is significantly above the fleet benchmark.",
        );
        recommendations.push(
          "Investigate fuel, maintenance, and other operating costs.",
        );
      }

      if (
        item.operationalFuelEfficiency > 0 &&
        fleetFuelEfficiency > 0 &&
        item.operationalFuelEfficiency <
          fleetFuelEfficiency * 0.75
      ) {
        riskScore += 15;
        reasons.push(
          "Operational fuel efficiency is materially below the fleet benchmark.",
        );
        recommendations.push(
          "Investigate driving patterns, vehicle condition, and route conditions.",
        );
      }

      if (
        item.maintenanceCost > 0 &&
        averageMaintenance > 0 &&
        item.maintenanceCost > averageMaintenance * 1.5
      ) {
        riskScore += 10;
        reasons.push(
          "Maintenance spending is significantly above the fleet average.",
        );
        recommendations.push(
          "Review maintenance history and identify recurring repair costs.",
        );
      }

      if (item.trips === 0) {
        riskScore += 10;
        reasons.push("No trips are currently recorded.");
        recommendations.push(
          "Review vehicle availability and utilization.",
        );
      } else if (item.completedTrips === 0) {
        riskScore += 8;
        reasons.push(
          "Trips exist but no completed trips are recorded.",
        );
        recommendations.push(
          "Review trip status updates and operational activity.",
        );
      }

      if (
        item.distance > 0 &&
        item.fuelLitersPurchased === 0
      ) {
        riskScore += 8;
        reasons.push(
          "Distance is recorded without linked fuel purchase data.",
        );
        recommendations.push(
          "Record fuel transactions against the vehicle for better monitoring.",
        );
      }

      if (
        item.revenue === 0 &&
        item.totalCost > 0
      ) {
        riskScore += 20;
        reasons.push(
          "The vehicle has operating costs but no recorded revenue.",
        );
        recommendations.push(
          "Review whether the vehicle is idle, underutilized, or missing trip revenue.",
        );
      }

      if (
        item.margin >= 25 &&
        item.profit >= averageProfit &&
        item.profit > 0
      ) {
        recommendations.push(
          "Use this vehicle as a performance benchmark for the fleet.",
        );
      }

      if (riskScore > 100) {
        riskScore = 100;
      }

      let riskLevel: RiskLevel = "Low";

      if (riskScore >= 70) {
        riskLevel = "Critical";
      } else if (riskScore >= 45) {
        riskLevel = "High";
      } else if (riskScore >= 20) {
        riskLevel = "Medium";
      }

      let performance: Performance = "Average";

      if (item.profit < 0) {
        performance = "Loss Making";
      } else if (
        item.margin >= 25 &&
        item.profit >= averageProfit
      ) {
        performance = "Excellent";
      } else if (item.margin >= 15) {
        performance = "Good";
      } else if (item.margin < 10) {
        performance = "Needs Attention";
      }

      if (reasons.length === 0) {
        reasons.push(
          "No major negative performance signal was detected.",
        );
      }

      if (recommendations.length === 0) {
        recommendations.push(
          "Continue monitoring performance against fleet benchmarks.",
        );
      }

      return {
        ...item,
        riskScore,
        riskLevel,
        performance,
        reasons,
        recommendations,
      };
    });
  }, [vehicles, trips, fuel, maintenance, expenses]);

  const recommendations = useMemo<Recommendation[]>(() => {
    const result: Recommendation[] = [];

    analyses.forEach((item) => {
      if (item.riskLevel === "Critical") {
        result.push({
          id: `${item.vehicle.id}-critical`,
          priority: "Critical",
          vehicleCode: item.vehicle.vehicleCode,
          title: "Immediate vehicle review required",
          reason: item.reasons[0],
          action:
            item.recommendations[0] ??
            "Review revenue, fuel, maintenance, and operating costs immediately.",
        });
      } else if (item.riskLevel === "High") {
        result.push({
          id: `${item.vehicle.id}-high`,
          priority: "High",
          vehicleCode: item.vehicle.vehicleCode,
          title: "Investigate performance deviation",
          reason: item.reasons[0],
          action:
            item.recommendations[0] ??
            "Investigate the main cost or performance driver.",
        });
      } else if (item.riskLevel === "Medium") {
        result.push({
          id: `${item.vehicle.id}-medium`,
          priority: "Medium",
          vehicleCode: item.vehicle.vehicleCode,
          title: "Monitor vehicle performance",
          reason: item.reasons[0],
          action:
            item.recommendations[0] ??
            "Monitor this vehicle against fleet benchmarks.",
        });
      }

      if (item.profit < 0) {
        result.push({
          id: `${item.vehicle.id}-loss`,
          priority: "Critical",
          vehicleCode: item.vehicle.vehicleCode,
          title: "Reduce loss-making operations",
          reason: `Current operating result is ${money(item.profit)}.`,
          action:
            "Review route profitability, pricing, fuel consumption, maintenance, and vehicle utilization.",
        });
      }

      if (
        item.operationalFuelEfficiency > 0 &&
        item.operationalFuelEfficiency < 3
      ) {
        result.push({
          id: `${item.vehicle.id}-fuel`,
          priority: "High",
          vehicleCode: item.vehicle.vehicleCode,
          title: "Investigate low fuel efficiency",
          reason: `Operational fuel efficiency is ${number(
            item.operationalFuelEfficiency,
          )} km/L.`,
          action:
            "Check driving behavior, vehicle condition, route conditions, and fuel records.",
        });
      }

      const averageMaintenance =
        analyses.length > 0
          ? analyses.reduce(
              (sum, vehicle) =>
                sum + vehicle.maintenanceCost,
              0,
            ) / analyses.length
          : 0;

      if (
        item.maintenanceCost > 0 &&
        averageMaintenance > 0 &&
        item.maintenanceCost > averageMaintenance * 1.5
      ) {
        result.push({
          id: `${item.vehicle.id}-maintenance`,
          priority: "High",
          vehicleCode: item.vehicle.vehicleCode,
          title: "Review maintenance spending",
          reason: `Maintenance cost is ${money(
            item.maintenanceCost,
          )}.`,
          action:
            "Review recurring repairs, maintenance frequency, and vehicle condition.",
        });
      }
    });

    return result.sort(
      (a, b) =>
        riskRank(b.priority) - riskRank(a.priority),
    );
  }, [analyses]);

  const summary = useMemo(() => {
    const revenue = analyses.reduce(
      (sum, item) => sum + item.revenue,
      0,
    );

    const cost = analyses.reduce(
      (sum, item) => sum + item.totalCost,
      0,
    );

    const profit = revenue - cost;

    const distance = analyses.reduce(
      (sum, item) => sum + item.distance,
      0,
    );

    const critical = analyses.filter(
      (item) => item.riskLevel === "Critical",
    ).length;

    const high = analyses.filter(
      (item) => item.riskLevel === "High",
    ).length;

    const profitable = analyses.filter(
      (item) => item.profit > 0,
    ).length;

    const lossMaking = analyses.filter(
      (item) => item.profit < 0,
    ).length;

    const overallMargin =
      revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      revenue,
      cost,
      profit,
      distance,
      critical,
      high,
      profitable,
      lossMaking,
      overallMargin,
    };
  }, [analyses]);

  const topVehicle = useMemo(() => {
    return [...analyses].sort(
      (a, b) => b.profit - a.profit,
    )[0];
  }, [analyses]);

  const highestRisk = useMemo(() => {
    return [...analyses].sort(
      (a, b) =>
        b.riskScore - a.riskScore ||
        performanceRank(b.performance) -
          performanceRank(a.performance),
    )[0];
  }, [analyses]);

  const fleetInsight = useMemo(() => {
    if (!analyses.length) {
      return "No vehicle data is currently available.";
    }

    if (summary.profit < 0) {
      return "The fleet is currently operating at a negative result. Management should prioritize loss-making vehicles and high operating costs.";
    }

    if (summary.overallMargin < 10) {
      return "Fleet profitability is positive but the operating margin is thin. Cost control and route profitability should be reviewed.";
    }

    if (summary.critical > 0) {
      return "Critical vehicle risks require immediate management attention.";
    }

    if (summary.high > 0) {
      return "Several vehicles show high-risk signals and should be investigated before performance deteriorates further.";
    }

    return "Fleet performance is generally stable. Continue monitoring vehicles against operational and financial benchmarks.";
  }, [analyses, summary]);

  if (loading) {
    return (
      <ProtectedPage permission="recommendations">
        <main className="min-h-screen bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm text-slate-500">
                Loading decision intelligence...
              </p>
            </div>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage permission="recommendations">
      <main className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
                  FleetFlow Decision Intelligence
                </p>

                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Executive Recommendations
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                  Prioritized management actions generated from fleet
                  profitability, operating cost, fuel efficiency,
                  maintenance, utilization, and operational data.
                </p>
              </div>

              <button
                onClick={() => {
                  setRefreshing(true);
                  loadData();
                }}
                disabled={refreshing}
                className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing
                  ? "Refreshing..."
                  : "Refresh Intelligence"}
              </button>
            </div>
          </section>

          {error && (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </section>
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Fleet Revenue
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {money(summary.revenue)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Completed-trip revenue
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Operating Cost
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {money(summary.cost)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Fuel + maintenance + expenses
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Fleet Result
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

              <p className="mt-1 text-xs text-slate-500">
                {percent(summary.overallMargin)} operating margin
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Priority Risks
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {summary.critical + summary.high}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {summary.critical} critical · {summary.high} high
              </p>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                Executive Snapshot
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                What management should know
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-600">
                {fleetInsight}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Profitable vehicles
                  </p>

                  <p className="mt-1 text-xl font-bold text-emerald-600">
                    {summary.profitable}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Loss-making vehicles
                  </p>

                  <p className="mt-1 text-xl font-bold text-red-600">
                    {summary.lossMaking}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Fleet distance
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {number(summary.distance)} km
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Vehicles analyzed
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {whole(analyses.length)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Performance Highlight
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Fleet leaders
              </h2>

              {topVehicle ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Best operating result
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {topVehicle.vehicle.vehicleCode ??
                        `Vehicle #${topVehicle.vehicle.id}`}
                    </p>

                    <p className="mt-1 text-sm text-emerald-700">
                      {money(topVehicle.profit)}
                    </p>
                  </div>

                  {highestRisk && (
                    <div className="rounded-xl bg-red-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                        Highest priority
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {highestRisk.vehicle.vehicleCode ??
                          `Vehicle #${highestRisk.vehicle.id}`}
                      </p>

                      <p className="mt-1 text-sm text-red-700">
                        Risk score {highestRisk.riskScore}/100
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-5 text-sm text-slate-500">
                  No vehicle performance data available.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                Action Queue
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Prioritized recommendations
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Recommendations are ranked by business risk and
                operational impact.
              </p>
            </div>

            {recommendations.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-semibold text-slate-900">
                  No priority actions detected
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  The current fleet data does not show major negative
                  signals.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recommendations
                  .slice(0, 12)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-5 transition hover:bg-slate-50"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(
                                item.priority,
                              )}`}
                            >
                              {item.priority}
                            </span>

                            {item.vehicleCode && (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {item.vehicleCode}
                              </span>
                            )}
                          </div>

                          <h3 className="mt-3 font-semibold text-slate-900">
                            {item.title}
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {item.reason}
                          </p>
                        </div>

                        <div className="w-full shrink-0 rounded-xl bg-slate-50 p-4 md:max-w-md">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Recommended action
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {item.action}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                Vehicle Decision Matrix
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Fleet performance and risk
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Vehicle</th>
                    <th className="px-5 py-4">Trips</th>
                    <th className="px-5 py-4">Revenue</th>
                    <th className="px-5 py-4">Cost</th>
                    <th className="px-5 py-4">Result</th>
                    <th className="px-5 py-4">Margin</th>
                    <th className="px-5 py-4">Fuel Efficiency</th>
                    <th className="px-5 py-4">Performance</th>
                    <th className="px-5 py-4">Risk</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {[...analyses]
                    .sort(
                      (a, b) =>
                        riskRank(b.riskLevel) -
                          riskRank(a.riskLevel) ||
                        b.riskScore - a.riskScore,
                    )
                    .map((item) => (
                      <tr
                        key={item.vehicle.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {item.vehicle.vehicleCode ??
                              `Vehicle #${item.vehicle.id}`}
                          </div>

                          <div className="text-xs text-slate-500">
                            {item.vehicle.status ??
                              "Unknown status"}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {item.completedTrips}/{item.trips}
                        </td>

                        <td className="px-5 py-4 font-medium text-slate-700">
                          {money(item.revenue)}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {money(item.totalCost)}
                        </td>

                        <td
                          className={`px-5 py-4 font-semibold ${
                            item.profit >= 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {money(item.profit)}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {percent(item.margin)}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {item.operationalFuelEfficiency > 0
                            ? `${number(
                                item.operationalFuelEfficiency,
                              )} km/L`
                            : "N/A"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(
                              item.performance,
                            )}`}
                          >
                            {item.performance}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(
                                item.riskLevel,
                              )}`}
                            >
                              {item.riskLevel}
                            </span>

                            <span className="text-xs text-slate-500">
                              {item.riskScore}/100
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                Decision Engine
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                How recommendations are generated
              </h2>

              <div className="mt-5 space-y-4">
                {[
                  [
                    "1",
                    "Measure",
                    "Analyze completed-trip revenue, distance, fuel, maintenance, and expenses.",
                  ],
                  [
                    "2",
                    "Benchmark",
                    "Compare vehicle performance with fleet-level operating benchmarks.",
                  ],
                  [
                    "3",
                    "Score risk",
                    "Combine profitability, cost efficiency, fuel efficiency, maintenance, and utilization signals.",
                  ],
                  [
                    "4",
                    "Recommend",
                    "Convert the strongest negative signals into prioritized management actions.",
                  ],
                ].map(([step, title, description]) => (
                  <div
                    key={step}
                    className="flex gap-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      {step}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {title}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                Data & Model Note
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Decision-support intelligence
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                These recommendations are generated from operational
                ERP data and fleet-relative benchmarks. They are
                decision-support signals, not a machine-learning
                prediction model.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                Fuel efficiency uses fuel recorded directly on
                completed trips when available. Fuel purchase records
                are primarily treated as financial and data-quality
                information.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                Future predictive intelligence can become stronger
                with historical failures, odometer readings,
                component-level maintenance, route conditions,
                driver behavior, and time-series operational data.
              </p>
            </div>
          </section>

          <footer className="pb-8 text-center text-xs text-slate-400">
            FleetFlow Decision Intelligence · Operational recommendations
            based on current ERP data
          </footer>
        </div>
      </main>
    </ProtectedPage>
  );
}

