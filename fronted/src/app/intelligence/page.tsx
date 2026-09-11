"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedPage from "@/components/ProtectedPage";

interface Vehicle {
  id: number;
  vehicleCode?: string;
  plateNumber?: string;
  make?: string;
  model?: string;
  status?: string;
}

interface Trip {
  id: number;
  vehicleCode?: string;
  distance?: number | string;
  revenue?: number | string;
  fuelUsed?: number | string;
  status?: string;
}

interface Fuel {
  id: number;
  vehicleCode?: string;
  liters?: number | string;
  cost?: number | string;
}

interface Maintenance {
  id: number;
  vehicleCode?: string;
  cost?: number | string;
  status?: string;
}

interface Expense {
  id: number;
  vehicleCode?: string;
  amount?: number | string;
}

type RiskLevel = "Low" | "Medium" | "High" | "Critical";

type Performance =
  | "Excellent"
  | "Good"
  | "Average"
  | "Needs Attention"
  | "Critical";

interface VehicleIntelligence {
  vehicleCode: string;
  status: string;

  trips: number;
  completedTrips: number;
  distance: number;

  revenue: number;

  fuelCost: number;
  fuelLitersPurchased: number;

  maintenanceCost: number;
  maintenanceEvents: number;

  otherExpenses: number;
  totalCost: number;

  result: number;
  margin: number;

  revenuePerKm: number;
  costPerKm: number;
  profitPerKm: number;

  operationalFuelEfficiency: number;
  purchasedFuelEfficiency: number;

  riskScore: number;
  riskLevel: RiskLevel;
  performance: Performance;

  reasons: string[];
  recommendations: string[];
}

function number(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number): string {
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} ETB`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
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

function riskClasses(level: RiskLevel): string {
  if (level === "Critical") {
    return "bg-red-100 text-red-700";
  }

  if (level === "High") {
    return "bg-orange-100 text-orange-700";
  }

  if (level === "Medium") {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-emerald-100 text-emerald-700";
}

function riskBarClass(level: RiskLevel): string {
  if (level === "Critical") {
    return "bg-red-500";
  }

  if (level === "High") {
    return "bg-orange-500";
  }

  if (level === "Medium") {
    return "bg-yellow-500";
  }

  return "bg-emerald-500";
}

function performanceClasses(performance: Performance): string {
  if (performance === "Excellent") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (performance === "Good") {
    return "bg-blue-100 text-blue-700";
  }

  if (performance === "Needs Attention") {
    return "bg-orange-100 text-orange-700";
  }

  if (performance === "Critical") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

export default function IntelligencePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuel, setFuel] = useState<Fuel[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
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
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Could not load intelligence data. Make sure the backend is running on port 3001.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const intelligence = useMemo<VehicleIntelligence[]>(() => {
    const baseData = vehicles.map((vehicle) => {
      const vehicleCode =
        vehicle.vehicleCode ||
        vehicle.plateNumber ||
        `Vehicle-${vehicle.id}`;

      const vehicleTrips = trips.filter(
        (trip) => trip.vehicleCode === vehicleCode,
      );

      const completedTrips = vehicleTrips.filter((trip) =>
        isCompletedTrip(trip.status),
      );

      const vehicleFuel = fuel.filter(
        (item) => item.vehicleCode === vehicleCode,
      );

      const vehicleMaintenance = maintenance.filter(
        (item) => item.vehicleCode === vehicleCode,
      );

      const vehicleExpenses = expenses.filter(
        (item) => item.vehicleCode === vehicleCode,
      );

      const distance = completedTrips.reduce(
        (sum, trip) => sum + number(trip.distance),
        0,
      );

      const revenue = completedTrips.reduce(
        (sum, trip) => sum + number(trip.revenue),
        0,
      );

      const operationalFuelLiters = completedTrips.reduce(
        (sum, trip) => sum + number(trip.fuelUsed),
        0,
      );

      const fuelCost = vehicleFuel.reduce(
        (sum, item) => sum + number(item.cost),
        0,
      );

      const fuelLitersPurchased = vehicleFuel.reduce(
        (sum, item) => sum + number(item.liters),
        0,
      );

      const maintenanceCost = vehicleMaintenance.reduce(
        (sum, item) => sum + number(item.cost),
        0,
      );

      const otherExpenses = vehicleExpenses.reduce(
        (sum, item) => sum + number(item.amount),
        0,
      );

      const totalCost =
        fuelCost + maintenanceCost + otherExpenses;

      const result = revenue - totalCost;

      const margin =
        revenue > 0 ? (result / revenue) * 100 : 0;

      const revenuePerKm =
        distance > 0 ? revenue / distance : 0;

      const costPerKm =
        distance > 0 ? totalCost / distance : 0;

      const profitPerKm =
        distance > 0 ? result / distance : 0;

      const operationalFuelEfficiency =
        operationalFuelLiters > 0
          ? distance / operationalFuelLiters
          : 0;

      const purchasedFuelEfficiency =
        fuelLitersPurchased > 0
          ? distance / fuelLitersPurchased
          : 0;

      return {
        vehicleCode,
        status: vehicle.status || "Unknown",
        trips: vehicleTrips.length,
        completedTrips: completedTrips.length,
        distance,
        revenue,
        fuelCost,
        fuelLitersPurchased,
        maintenanceCost,
        maintenanceEvents: vehicleMaintenance.length,
        otherExpenses,
        totalCost,
        result,
        margin,
        revenuePerKm,
        costPerKm,
        profitPerKm,
        operationalFuelEfficiency,
        purchasedFuelEfficiency,
      };
    });

    const activeVehicles = baseData.filter(
      (item) => item.status.toLowerCase() !== "inactive",
    );

    const averageRevenuePerKm =
      activeVehicles.length > 0
        ? activeVehicles.reduce(
            (sum, item) => sum + item.revenuePerKm,
            0,
          ) / activeVehicles.length
        : 0;

    const averageCostPerKm =
      activeVehicles.length > 0
        ? activeVehicles.reduce(
            (sum, item) => sum + item.costPerKm,
            0,
          ) / activeVehicles.length
        : 0;

    const averageFuelEfficiency =
      activeVehicles.filter(
        (item) => item.operationalFuelEfficiency > 0,
      ).length > 0
        ? activeVehicles
            .filter(
              (item) => item.operationalFuelEfficiency > 0,
            )
            .reduce(
              (sum, item) =>
                sum + item.operationalFuelEfficiency,
              0,
            ) /
          activeVehicles.filter(
            (item) => item.operationalFuelEfficiency > 0,
          ).length
        : 0;

    const averageMaintenanceCost =
      activeVehicles.length > 0
        ? activeVehicles.reduce(
            (sum, item) => sum + item.maintenanceCost,
            0,
          ) / activeVehicles.length
        : 0;

    const averageResult =
      activeVehicles.length > 0
        ? activeVehicles.reduce(
            (sum, item) => sum + item.result,
            0,
          ) / activeVehicles.length
        : 0;

    return baseData.map((item) => {
      let riskScore = 0;

      const reasons: string[] = [];
      const recommendations: string[] = [];

      const inactive =
        item.status.toLowerCase() === "inactive";

      /*
       * PROFITABILITY SIGNAL
       */
      if (item.result < 0) {
        riskScore += 30;
        reasons.push("Vehicle is operating at a loss");
        recommendations.push(
          "Review revenue, route selection, and operating costs.",
        );
      } else if (
        item.result < averageResult &&
        activeVehicles.length > 1
      ) {
        riskScore += 10;
        reasons.push("Below-average fleet profitability");
      }

      /*
       * REVENUE / KM
       */
      if (
        item.distance > 0 &&
        averageRevenuePerKm > 0 &&
        item.revenuePerKm <
          averageRevenuePerKm * 0.75
      ) {
        riskScore += 15;
        reasons.push("Revenue per km is below fleet benchmark");
        recommendations.push(
          "Review route profitability and vehicle utilization.",
        );
      }

      /*
       * COST / KM
       */
      if (
        item.distance > 0 &&
        averageCostPerKm > 0 &&
        item.costPerKm >
          averageCostPerKm * 1.5
      ) {
        riskScore += 15;
        reasons.push("Operating cost per km is above benchmark");
        recommendations.push(
          "Investigate fuel, maintenance, and vehicle-related expenses.",
        );
      }

      /*
       * FUEL SIGNAL
       */
      if (
        item.operationalFuelEfficiency > 0 &&
        averageFuelEfficiency > 0 &&
        item.operationalFuelEfficiency <
          averageFuelEfficiency * 0.75
      ) {
        riskScore += 15;
        reasons.push("Fuel efficiency is significantly below fleet average");
        recommendations.push(
          "Investigate fuel consumption and vehicle operating conditions.",
        );
      }

      /*
       * MAINTENANCE SIGNAL
       */
      if (
        averageMaintenanceCost > 0 &&
        item.maintenanceCost >
          averageMaintenanceCost * 1.5
      ) {
        riskScore += 10;
        reasons.push("Maintenance spending is above fleet benchmark");
        recommendations.push(
          "Review recurring maintenance issues and service history.",
        );
      }

      if (
        item.maintenanceEvents >= 5 &&
        item.maintenanceEvents >
          Math.max(3, Math.round(
            activeVehicles.reduce(
              (sum, vehicle) =>
                sum + vehicle.maintenanceEvents,
              0,
            ) /
              Math.max(activeVehicles.length, 1),
          ) * 1.5)
      ) {
        riskScore += 10;
        reasons.push("High maintenance frequency");
      }

      /*
       * UTILIZATION SIGNAL
       */
      if (item.trips === 0) {
        riskScore += 15;
        reasons.push("No recorded trips");
        recommendations.push(
          "Review vehicle assignment and utilization.",
        );
      } else if (item.completedTrips === 0) {
        riskScore += 10;
        reasons.push("No completed trips recorded");
      }

      /*
       * DATA QUALITY SIGNAL
       */
      if (
        item.completedTrips > 0 &&
        item.distance === 0
      ) {
        riskScore += 10;
        reasons.push(
          "Completed trips have no recorded distance",
        );
      }

      if (
        item.completedTrips > 0 &&
        item.revenue === 0
      ) {
        riskScore += 10;
        reasons.push(
          "Completed trips have no recorded revenue",
        );
      }

      /*
       * INACTIVE VEHICLE
       */
      if (inactive) {
        riskScore += 5;
        reasons.push("Vehicle is currently inactive");
      }

      /*
       * FUEL PURCHASE DATA WARNING
       */
      if (
        item.distance > 0 &&
        item.fuelLitersPurchased === 0
      ) {
        riskScore += 5;
        reasons.push(
          "No fuel purchase records linked to this vehicle",
        );
      }

      riskScore = Math.min(Math.round(riskScore), 100);

      let riskLevel: RiskLevel;

      if (riskScore >= 70) {
        riskLevel = "Critical";
      } else if (riskScore >= 45) {
        riskLevel = "High";
      } else if (riskScore >= 20) {
        riskLevel = "Medium";
      } else {
        riskLevel = "Low";
      }

      let performance: Performance;

      if (riskLevel === "Critical") {
        performance = "Critical";
      } else if (
        item.result > 0 &&
        item.margin >= 25 &&
        riskLevel === "Low"
      ) {
        performance = "Excellent";
      } else if (
        item.result > 0 &&
        item.margin >= 15
      ) {
        performance = "Good";
      } else if (
        item.result < 0 ||
        item.margin < 10 ||
        riskLevel === "High"
      ) {
        performance = "Needs Attention";
      } else {
        performance = "Average";
      }

      if (riskLevel === "Low" && recommendations.length === 0) {
        recommendations.push(
          "Continue monitoring performance against fleet benchmarks.",
        );
      }

      return {
        ...item,
        riskScore,
        riskLevel,
        performance,
        reasons: [...new Set(reasons)],
        recommendations: [...new Set(recommendations)],
      };
    });
  }, [vehicles, trips, fuel, maintenance, expenses]);

  const summary = useMemo(() => {
    const totalRevenue = intelligence.reduce(
      (sum, item) => sum + item.revenue,
      0,
    );

    const totalCost = intelligence.reduce(
      (sum, item) => sum + item.totalCost,
      0,
    );

    const totalDistance = intelligence.reduce(
      (sum, item) => sum + item.distance,
      0,
    );

    const completedTrips = intelligence.reduce(
      (sum, item) => sum + item.completedTrips,
      0,
    );

    const totalTrips = intelligence.reduce(
      (sum, item) => sum + item.trips,
      0,
    );

    const totalResult = totalRevenue - totalCost;

    const margin =
      totalRevenue > 0
        ? (totalResult / totalRevenue) * 100
        : 0;

    const revenuePerKm =
      totalDistance > 0
        ? totalRevenue / totalDistance
        : 0;

    const costPerKm =
      totalDistance > 0
        ? totalCost / totalDistance
        : 0;

    const critical = intelligence.filter(
      (item) => item.riskLevel === "Critical",
    ).length;

    const high = intelligence.filter(
      (item) => item.riskLevel === "High",
    ).length;

    const medium = intelligence.filter(
      (item) => item.riskLevel === "Medium",
    ).length;

    const low = intelligence.filter(
      (item) => item.riskLevel === "Low",
    ).length;

    const profitable = intelligence.filter(
      (item) => item.result > 0,
    ).length;

    const lossMaking = intelligence.filter(
      (item) => item.result < 0,
    ).length;

    const averageRisk =
      intelligence.length > 0
        ? intelligence.reduce(
            (sum, item) => sum + item.riskScore,
            0,
          ) / intelligence.length
        : 0;

    return {
      totalRevenue,
      totalCost,
      totalDistance,
      totalResult,
      margin,
      revenuePerKm,
      costPerKm,
      completedTrips,
      totalTrips,
      critical,
      high,
      medium,
      low,
      profitable,
      lossMaking,
      averageRisk,
    };
  }, [intelligence]);

  const topRiskVehicles = useMemo(() => {
    return [...intelligence]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
  }, [intelligence]);

  const bestVehicle = useMemo(() => {
    return [...intelligence].sort(
      (a, b) => b.result - a.result,
    )[0];
  }, [intelligence]);

  const worstVehicle = useMemo(() => {
    return [...intelligence].sort(
      (a, b) => a.result - b.result,
    )[0];
  }, [intelligence]);

  const highestCostVehicle = useMemo(() => {
    return [...intelligence].sort(
      (a, b) => b.costPerKm - a.costPerKm,
    )[0];
  }, [intelligence]);

  const insights = useMemo(() => {
    const items: string[] = [];

    if (summary.critical > 0) {
      items.push(
        `${summary.critical} vehicle${
          summary.critical > 1 ? "s" : ""
        } require immediate management attention.`,
      );
    }

    if (summary.lossMaking > 0) {
      items.push(
        `${summary.lossMaking} vehicle${
          summary.lossMaking > 1 ? "s are" : " is"
        } currently operating at a loss.`,
      );
    }

    if (summary.margin < 10 && summary.totalRevenue > 0) {
      items.push(
        `Fleet operating margin is only ${percent(
          summary.margin,
        )}, indicating limited profitability.`,
      );
    } else if (summary.margin >= 25) {
      items.push(
        `Fleet operating margin is strong at ${percent(
          summary.margin,
        )}.`,
      );
    }

    if (summary.costPerKm > 0) {
      items.push(
        `Fleet operating cost is ${money(
          summary.costPerKm,
        )} per km.`,
      );
    }

    if (bestVehicle) {
      items.push(
        `${bestVehicle.vehicleCode} is currently the strongest vehicle by operating result.`,
      );
    }

    if (
      highestCostVehicle &&
      highestCostVehicle.costPerKm > 0
    ) {
      items.push(
        `${highestCostVehicle.vehicleCode} has the highest operating cost per km.`,
      );
    }

    if (
      summary.completedTrips > 0 &&
      summary.totalTrips > summary.completedTrips
    ) {
      const completionRate =
        (summary.completedTrips /
          summary.totalTrips) *
        100;

      items.push(
        `Trip completion rate is ${percent(
          completionRate,
        )}.`,
      );
    }

    return items;
  }, [summary, bestVehicle, highestCostVehicle]);

  return (
    <ProtectedPage permission="intelligence">
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Fleet Intelligence
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Vehicle Risk & Performance Intelligence
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                FleetFlow combines profitability, utilization,
                fuel efficiency, maintenance, and operating-cost
                signals to identify vehicles that need attention.
              </p>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Risk Summary */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Critical Risk
                </p>

                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                  Immediate
                </span>
              </div>

              <p className="mt-3 text-3xl font-bold text-red-600">
                {summary.critical}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Requires immediate attention
              </p>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  High Risk
                </p>

                <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">
                  Review
                </span>
              </div>

              <p className="mt-3 text-3xl font-bold text-orange-600">
                {summary.high}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Requires investigation
              </p>
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Medium Risk
                </p>

                <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-700">
                  Monitor
                </span>
              </div>

              <p className="mt-3 text-3xl font-bold text-yellow-600">
                {summary.medium}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Monitor performance
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Low Risk
                </p>

                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  Stable
                </span>
              </div>

              <p className="mt-3 text-3xl font-bold text-emerald-600">
                {summary.low}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Operating normally
              </p>
            </div>
          </section>

          {/* Financial / Operational KPIs */}
          <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm">
              <p className="text-sm text-slate-400">
                Fleet Revenue
              </p>

              <p className="mt-2 text-2xl font-bold">
                {money(summary.totalRevenue)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Completed trips
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm">
              <p className="text-sm text-slate-400">
                Operating Cost
              </p>

              <p className="mt-2 text-2xl font-bold">
                {money(summary.totalCost)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Fuel + maintenance + expenses
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm">
              <p className="text-sm text-slate-400">
                Fleet Result
              </p>

              <p
                className={`mt-2 text-2xl font-bold ${
                  summary.totalResult >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {money(summary.totalResult)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Operating profit / loss
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm">
              <p className="text-sm text-slate-400">
                Operating Margin
              </p>

              <p
                className={`mt-2 text-2xl font-bold ${
                  summary.margin >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {percent(summary.margin)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Fleet profitability
              </p>
            </div>
          </section>

          {/* Operational Metrics */}
          <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Distance Analyzed
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatNumber(summary.totalDistance)} km
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Revenue / km
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {money(summary.revenuePerKm)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Cost / km
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {money(summary.costPerKm)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Average Risk Score
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {summary.averageRisk.toFixed(0)}/100
              </p>
            </div>
          </section>

          {/* Highlights */}
          {intelligence.length > 0 && (
            <section className="mt-8 grid gap-5 lg:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                  Best Overall Result
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  {bestVehicle?.vehicleCode}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Operating result
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {money(bestVehicle?.result || 0)}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Margin: {percent(bestVehicle?.margin || 0)}
                </p>
              </div>

              <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                  Weakest Result
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  {worstVehicle?.vehicleCode}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Operating result
                </p>

                <p className="mt-1 text-2xl font-bold text-red-600">
                  {money(worstVehicle?.result || 0)}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Risk: {worstVehicle?.riskLevel}
                </p>
              </div>

              <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                  Highest Cost / km
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  {highestCostVehicle?.vehicleCode}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Operating cost per km
                </p>

                <p className="mt-1 text-2xl font-bold text-orange-600">
                  {money(
                    highestCostVehicle?.costPerKm || 0,
                  )}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Risk: {highestCostVehicle?.riskLevel}
                </p>
              </div>
            </section>
          )}

          {/* Main Intelligence Table */}
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Vehicle Intelligence Overview
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Combined operational, financial, fuel,
                    maintenance, and utilization analysis.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                  {intelligence.length} vehicles analyzed
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-500">
                Loading intelligence data...
              </div>
            ) : intelligence.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                No vehicle intelligence data available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1300px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3">
                        Vehicle
                      </th>

                      <th className="px-4 py-3">
                        Trips
                      </th>

                      <th className="px-4 py-3">
                        Revenue
                      </th>

                      <th className="px-4 py-3">
                        Cost
                      </th>

                      <th className="px-4 py-3">
                        Result
                      </th>

                      <th className="px-4 py-3">
                        Margin
                      </th>

                      <th className="px-4 py-3">
                        Revenue/km
                      </th>

                      <th className="px-4 py-3">
                        Cost/km
                      </th>

                      <th className="px-4 py-3">
                        Fuel
                      </th>

                      <th className="px-4 py-3">
                        Performance
                      </th>

                      <th className="px-4 py-3">
                        Risk
                      </th>

                      <th className="px-4 py-3">
                        Score
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {intelligence
                      .sort(
                        (a, b) =>
                          b.riskScore - a.riskScore,
                      )
                      .map((item) => (
                        <tr
                          key={item.vehicleCode}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                        >
                          <td className="px-4 py-4 font-semibold text-slate-900">
                            {item.vehicleCode}
                          </td>

                          <td className="px-4 py-4 text-slate-600">
                            <span className="font-semibold">
                              {item.completedTrips}
                            </span>
                            <span className="text-slate-400">
                              {" "}
                              / {item.trips}
                            </span>
                          </td>

                          <td className="px-4 py-4 font-medium text-slate-700">
                            {money(item.revenue)}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {money(item.totalCost)}
                          </td>

                          <td
                            className={`px-4 py-4 font-semibold ${
                              item.result >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {money(item.result)}
                          </td>

                          <td className="px-4 py-4 font-semibold text-slate-700">
                            {percent(item.margin)}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {money(item.revenuePerKm)}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {money(item.costPerKm)}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {item.operationalFuelEfficiency > 0
                              ? `${item.operationalFuelEfficiency.toFixed(
                                  2,
                                )} km/L`
                              : "N/A"}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${performanceClasses(
                                item.performance,
                              )}`}
                            >
                              {item.performance}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${riskClasses(
                                item.riskLevel,
                              )}`}
                            >
                              {item.riskLevel}
                            </span>
                          </td>

                          <td className="px-4 py-4 font-bold text-slate-900">
                            {item.riskScore}/100
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Highest Risk */}
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Priority Vehicles
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Vehicles with the strongest combination of
                financial, operational, fuel, maintenance,
                and utilization risk signals.
              </p>
            </div>

            <div className="space-y-4">
              {topRiskVehicles.length === 0 ? (
                <p className="py-6 text-center text-slate-500">
                  No vehicle intelligence data available.
                </p>
              ) : (
                topRiskVehicles.map((item) => (
                  <div
                    key={item.vehicleCode}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-bold text-slate-900">
                            {item.vehicleCode}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${riskClasses(
                              item.riskLevel,
                            )}`}
                          >
                            {item.riskLevel}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${performanceClasses(
                              item.performance,
                            )}`}
                          >
                            {item.performance}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                          <span>
                            Risk:{" "}
                            <strong className="text-slate-800">
                              {item.riskScore}/100
                            </strong>
                          </span>

                          <span>
                            Result:{" "}
                            <strong
                              className={
                                item.result >= 0
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }
                            >
                              {money(item.result)}
                            </strong>
                          </span>

                          <span>
                            Cost/km:{" "}
                            <strong className="text-slate-800">
                              {money(item.costPerKm)}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="w-full lg:max-w-xs">
                        <div className="mb-2 flex justify-between text-xs text-slate-500">
                          <span>Risk Score</span>
                          <span>
                            {item.riskScore}/100
                          </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${riskBarClass(
                              item.riskLevel,
                            )}`}
                            style={{
                              width: `${item.riskScore}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {item.reasons.length > 0 && (
                      <div className="mt-5">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Detected Signals
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {item.reasons.map((reason) => (
                            <span
                              key={reason}
                              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.recommendations.length > 0 && (
                      <div className="mt-4 rounded-xl bg-blue-50 p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                          Recommended Action
                        </p>

                        <ul className="space-y-1 text-sm text-slate-700">
                          {item.recommendations.map(
                            (recommendation) => (
                              <li key={recommendation}>
                                • {recommendation}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Automated Insights */}
          <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Decision Support
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Automated Fleet Insights
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                FleetFlow translates operational data into
                management-level signals.
              </p>
            </div>

            {insights.length === 0 ? (
              <p className="text-sm text-slate-500">
                Not enough data to generate fleet insights.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {insights.map((insight) => (
                  <div
                    key={insight}
                    className="rounded-xl bg-white p-4 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                        ✓
                      </div>

                      <p className="text-sm leading-6 text-slate-700">
                        {insight}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Management Actions */}
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Management Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Suggested actions based on the strongest fleet
              signals.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-red-100 bg-red-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                  Risk
                </p>

                <h3 className="mt-2 font-bold text-slate-900">
                  Investigate critical vehicles
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Review loss-making, high-risk, and severely
                  underperforming vehicles first.
                </p>
              </div>

              <div className="rounded-xl border border-orange-100 bg-orange-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                  Cost
                </p>

                <h3 className="mt-2 font-bold text-slate-900">
                  Control high cost/km
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Investigate vehicles with unusually high
                  operating cost relative to distance.
                </p>
              </div>

              <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-yellow-700">
                  Efficiency
                </p>

                <h3 className="mt-2 font-bold text-slate-900">
                  Improve fuel performance
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Compare low-efficiency vehicles against
                  fleet benchmarks and service history.
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                  Utilization
                </p>

                <h3 className="mt-2 font-bold text-slate-900">
                  Review idle capacity
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Identify vehicles with limited trip activity
                  and improve assignment decisions.
                </p>
              </div>
            </div>
          </section>

          {/* Methodology */}
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Intelligence Method
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                How FleetFlow Intelligence Works
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                The intelligence layer combines operational
                history with fleet-relative benchmarks to
                prioritize management decisions.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {[
                [
                  "01",
                  "Operations",
                  "Analyzes completed trips, distance, revenue, and utilization.",
                ],
                [
                  "02",
                  "Costs",
                  "Combines fuel, maintenance, and vehicle expenses.",
                ],
                [
                  "03",
                  "Benchmarks",
                  "Compares vehicle performance against fleet-level signals.",
                ],
                [
                  "04",
                  "Risk",
                  "Combines negative signals into a 0–100 risk score.",
                ],
                [
                  "05",
                  "Action",
                  "Converts detected issues into recommended management actions.",
                ],
              ].map(([step, title, description]) => (
                <div
                  key={step}
                  className="rounded-xl bg-slate-50 p-5"
                >
                  <p className="text-xs font-bold text-blue-600">
                    {step}
                  </p>

                  <h3 className="mt-2 font-semibold text-slate-900">
                    {title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Data Model Note */}
          <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Intelligence Model Note
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              FleetFlow Intelligence is currently a decision-support
              system based on operational rules, historical data,
              and fleet-relative benchmarks. It is not claiming to
              be a trained machine-learning model. The strongest
              future upgrade would be connecting trip-level fuel
              usage, odometer readings, component failures,
              maintenance intervals, route conditions, and historical
              outcomes to support genuine predictive modeling.
            </p>
          </section>

          <footer className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
            FleetFlow Intelligence • Vehicle Risk Detection &
            Decision Support
          </footer>
        </div>
      </main>
    </ProtectedPage>
  );
}

