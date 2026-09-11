"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedPage from "@/app/components/ProtectedPage";

interface Vehicle {
  id: number;
  vehicleCode?: string;
  status?: string;
  [key: string]: unknown;
}

interface Trip {
  id: number;
  vehicleCode?: string;
  distance?: number | string;
  fuelUsed?: number | string;
  revenue?: number | string;
  status?: string;
  [key: string]: unknown;
}

interface Fuel {
  id: number;
  vehicleCode?: string;
  liters?: number | string;
  cost?: number | string;
  [key: string]: unknown;
}

interface Maintenance {
  id: number;
  vehicleCode?: string;
  cost?: number | string;
  maintenanceDate?: string;
  [key: string]: unknown;
}

interface Expense {
  id: number;
  vehicleCode?: string;
  amount?: number | string;
  category?: string;
  [key: string]: unknown;
}

type Priority = "Critical" | "High" | "Medium" | "Low";

type RecommendationCategory =
  | "Profitability"
  | "Fuel"
  | "Maintenance"
  | "Utilization"
  | "Cost Control"
  | "Performance"
  | "Data Quality";

interface Recommendation {
  id: number;
  priority: Priority;
  category: RecommendationCategory;
  title: string;
  explanation: string;
  action: string;
  vehicleCode?: string;
  impactScore: number;
}

interface VehicleAnalysis {
  code: string;
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

  profit: number;
  margin: number;

  revenuePerKm: number;
  costPerKm: number;
  profitPerKm: number;

  operationalFuelEfficiency: number;

  profitabilityLevel:
    | "Excellent"
    | "Good"
    | "Average"
    | "Needs Attention"
    | "Loss Making";

  performance:
    | "Excellent"
    | "Good"
    | "Average"
    | "Needs Attention"
    | "Critical";

  riskScore: number;
  riskLevel: Priority;

  reasons: string[];
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

function whole(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function decimal(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function percentage(value: number): string {
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

function priorityRank(priority: Priority): number {
  if (priority === "Critical") return 4;
  if (priority === "High") return 3;
  if (priority === "Medium") return 2;
  return 1;
}

function riskRank(priority: Priority): number {
  return priorityRank(priority);
}

function priorityClass(priority: Priority): string {
  if (priority === "Critical") {
    return "border-red-200 bg-red-100 text-red-700";
  }

  if (priority === "High") {
    return "border-orange-200 bg-orange-100 text-orange-700";
  }

  if (priority === "Medium") {
    return "border-amber-200 bg-amber-100 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-100 text-emerald-700";
}

function priorityDot(priority: Priority): string {
  if (priority === "Critical") return "bg-red-500";
  if (priority === "High") return "bg-orange-500";
  if (priority === "Medium") return "bg-amber-500";
  return "bg-emerald-500";
}

function performanceClass(
  performance: VehicleAnalysis["performance"],
): string {
  if (performance === "Excellent") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (performance === "Good") {
    return "bg-blue-100 text-blue-700";
  }

  if (performance === "Average") {
    return "bg-amber-100 text-amber-700";
  }

  if (performance === "Needs Attention") {
    return "bg-orange-100 text-orange-700";
  }

  return "bg-red-100 text-red-700";
}

function riskClass(priority: Priority): string {
  if (priority === "Critical") {
    return "bg-red-100 text-red-700";
  }

  if (priority === "High") {
    return "bg-orange-100 text-orange-700";
  }

  if (priority === "Medium") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-emerald-100 text-emerald-700";
}

export default function RecommendationsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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

      setVehicles(
        Array.isArray(vehiclesData) ? vehiclesData : [],
      );

      setTrips(
        Array.isArray(tripsData) ? tripsData : [],
      );

      setFuel(
        Array.isArray(fuelData) ? fuelData : [],
      );

      setMaintenance(
        Array.isArray(maintenanceData)
          ? maintenanceData
          : [],
      );

      setExpenses(
        Array.isArray(expensesData) ? expensesData : [],
      );
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to load recommendation data. Make sure the backend is running on port 3001.",
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
    return trips.filter(isCompletedTrip);
  }, [trips]);

  const analysis = useMemo(() => {
    const totalRevenue = completedTrips.reduce(
      (sum, trip) => sum + number(trip.revenue),
      0,
    );

    const totalDistance = completedTrips.reduce(
      (sum, trip) => sum + number(trip.distance),
      0,
    );

    const operationalFuelUsed = completedTrips.reduce(
      (sum, trip) => sum + number(trip.fuelUsed),
      0,
    );

    const totalFuelCost = fuel.reduce(
      (sum, record) => sum + number(record.cost),
      0,
    );

    const totalFuelLitersPurchased = fuel.reduce(
      (sum, record) => sum + number(record.liters),
      0,
    );

    const totalMaintenanceCost = maintenance.reduce(
      (sum, record) => sum + number(record.cost),
      0,
    );

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + number(expense.amount),
      0,
    );

    const totalOperatingCost =
      totalFuelCost +
      totalMaintenanceCost +
      totalExpenses;

    const totalProfit =
      totalRevenue - totalOperatingCost;

    const fleetMargin =
      totalRevenue > 0
        ? (totalProfit / totalRevenue) * 100
        : 0;

    const fleetRevenuePerKm =
      totalDistance > 0
        ? totalRevenue / totalDistance
        : 0;

    const fleetCostPerKm =
      totalDistance > 0
        ? totalOperatingCost / totalDistance
        : 0;

    const fleetProfitPerKm =
      totalDistance > 0
        ? totalProfit / totalDistance
        : 0;

    const operationalFuelEfficiency =
      operationalFuelUsed > 0
        ? totalDistance / operationalFuelUsed
        : 0;

    const activeVehicles = vehicles.filter(
      (vehicle) =>
        String(vehicle.status ?? "")
          .trim()
          .toLowerCase() === "active",
    ).length;

    const inactiveVehicles =
      vehicles.length - activeVehicles;

    const fleetUtilization =
      vehicles.length > 0
        ? (activeVehicles / vehicles.length) * 100
        : 0;

    const vehicleAnalysis: VehicleAnalysis[] =
      vehicles.map((vehicle) => {
        const code =
          String(vehicle.vehicleCode ?? "").trim() ||
          `Vehicle #${vehicle.id}`;

        const vehicleTrips = trips.filter(
          (trip) =>
            String(trip.vehicleCode ?? "").trim() ===
            code,
        );

        const vehicleCompletedTrips =
          vehicleTrips.filter(isCompletedTrip);

        const vehicleFuel = fuel.filter(
          (record) =>
            String(record.vehicleCode ?? "").trim() ===
            code,
        );

        const vehicleMaintenance =
          maintenance.filter(
            (record) =>
              String(
                record.vehicleCode ?? "",
              ).trim() === code,
          );

        const vehicleExpenses = expenses.filter(
          (expense) =>
            String(
              expense.vehicleCode ?? "",
            ).trim() === code,
        );

        const revenue =
          vehicleCompletedTrips.reduce(
            (sum, trip) =>
              sum + number(trip.revenue),
            0,
          );

        const distance =
          vehicleCompletedTrips.reduce(
            (sum, trip) =>
              sum + number(trip.distance),
            0,
          );

        const operationalFuelUsed =
          vehicleCompletedTrips.reduce(
            (sum, trip) =>
              sum + number(trip.fuelUsed),
            0,
          );

        const fuelCost =
          vehicleFuel.reduce(
            (sum, record) =>
              sum + number(record.cost),
            0,
          );

        const fuelLitersPurchased =
          vehicleFuel.reduce(
            (sum, record) =>
              sum + number(record.liters),
            0,
          );

        const maintenanceCost =
          vehicleMaintenance.reduce(
            (sum, record) =>
              sum + number(record.cost),
            0,
          );

        const otherExpenses =
          vehicleExpenses.reduce(
            (sum, expense) =>
              sum + number(expense.amount),
            0,
          );

        const totalCost =
          fuelCost +
          maintenanceCost +
          otherExpenses;

        const profit =
          revenue - totalCost;

        const margin =
          revenue > 0
            ? (profit / revenue) * 100
            : 0;

        const revenuePerKm =
          distance > 0
            ? revenue / distance
            : 0;

        const costPerKm =
          distance > 0
            ? totalCost / distance
            : 0;

        const profitPerKm =
          distance > 0
            ? profit / distance
            : 0;

        const operationalFuelEfficiency =
          operationalFuelUsed > 0
            ? distance / operationalFuelUsed
            : 0;

        const reasons: string[] = [];

        if (profit < 0) {
          reasons.push("Loss-making");
        }

        if (
          fleetRevenuePerKm > 0 &&
          revenuePerKm <
            fleetRevenuePerKm * 0.75
        ) {
          reasons.push("Low revenue/km");
        }

        if (
          fleetCostPerKm > 0 &&
          costPerKm >
            fleetCostPerKm * 1.5
        ) {
          reasons.push("High cost/km");
        }

        if (
          operationalFuelEfficiency > 0 &&
          vehicleAnalysisPlaceholder(
            operationalFuelEfficiency,
            0,
          )
        ) {
          // Intentionally evaluated below using fleet benchmark.
        }

        if (
          operationalFuelEfficiency > 0 &&
          operationalFuelEfficiency <
            Math.max(
              3,
              operationalFuelEfficiency,
            )
        ) {
          // Placeholder intentionally avoided.
        }

        if (
          maintenanceCost > 0 &&
          maintenance.length > 0 &&
          maintenanceCost >
            totalMaintenanceCost /
              Math.max(vehicles.length, 1) *
              1.5
        ) {
          reasons.push("High maintenance spend");
        }

        if (
          vehicleTrips.length > 0 &&
          vehicleCompletedTrips.length === 0
        ) {
          reasons.push("No completed trips");
        }

        if (vehicleTrips.length === 0) {
          reasons.push("No trip activity");
        }

        const isInactive =
          String(vehicle.status ?? "")
            .trim()
            .toLowerCase() !== "active";

        if (isInactive) {
          reasons.push("Inactive vehicle");
        }

        return {
          code,
          status: String(vehicle.status ?? ""),
          trips: vehicleTrips.length,
          completedTrips:
            vehicleCompletedTrips.length,
          distance,
          revenue,
          fuelCost,
          fuelLitersPurchased,
          maintenanceCost,
          maintenanceEvents:
            vehicleMaintenance.length,
          otherExpenses,
          totalCost,
          profit,
          margin,
          revenuePerKm,
          costPerKm,
          profitPerKm,
          operationalFuelEfficiency,
          profitabilityLevel:
            "Average",
          performance: "Average",
          riskScore: 0,
          riskLevel: "Low",
          reasons,
        };
      });

    const activeVehicleAnalyses =
      vehicleAnalysis.filter(
        (vehicle) =>
          vehicle.distance > 0 ||
          vehicle.revenue > 0 ||
          vehicle.trips > 0,
      );

    const averageRevenuePerKm =
      activeVehicleAnalyses.length > 0
        ? activeVehicleAnalyses.reduce(
            (sum, vehicle) =>
              sum + vehicle.revenuePerKm,
            0,
          ) /
          activeVehicleAnalyses.length
        : 0;

    const averageCostPerKm =
      activeVehicleAnalyses.length > 0
        ? activeVehicleAnalyses.reduce(
            (sum, vehicle) =>
              sum + vehicle.costPerKm,
            0,
          ) /
          activeVehicleAnalyses.length
        : 0;

    const averageProfit =
      activeVehicleAnalyses.length > 0
        ? activeVehicleAnalyses.reduce(
            (sum, vehicle) =>
              sum + vehicle.profit,
            0,
          ) /
          activeVehicleAnalyses.length
        : 0;

    const averageMaintenanceCost =
      vehicleAnalysis.length > 0
        ? vehicleAnalysis.reduce(
            (sum, vehicle) =>
              sum + vehicle.maintenanceCost,
            0,
          ) / vehicleAnalysis.length
        : 0;

    const averageMaintenanceEvents =
      vehicleAnalysis.length > 0
        ? vehicleAnalysis.reduce(
            (sum, vehicle) =>
              sum + vehicle.maintenanceEvents,
            0,
          ) / vehicleAnalysis.length
        : 0;

    const averageFuelEfficiencyValues =
      activeVehicleAnalyses
        .filter(
          (vehicle) =>
            vehicle.operationalFuelEfficiency > 0,
        )
        .map(
          (vehicle) =>
            vehicle.operationalFuelEfficiency,
        );

    const averageFuelEfficiency =
      averageFuelEfficiencyValues.length > 0
        ? averageFuelEfficiencyValues.reduce(
            (sum, value) => sum + value,
            0,
          ) /
          averageFuelEfficiencyValues.length
        : 0;

    const finalizedVehicles =
      vehicleAnalysis.map((vehicle) => {
        let riskScore = 0;

        const reasons = [...vehicle.reasons];

        if (vehicle.profit < 0) {
          riskScore += 30;
        } else if (
          vehicle.profit < averageProfit
        ) {
          riskScore += 10;
        }

        if (
          averageRevenuePerKm > 0 &&
          vehicle.revenuePerKm <
            averageRevenuePerKm * 0.75
        ) {
          riskScore += 15;
        }

        if (
          averageCostPerKm > 0 &&
          vehicle.costPerKm >
            averageCostPerKm * 1.5
        ) {
          riskScore += 20;
        }

        if (
          averageFuelEfficiency > 0 &&
          vehicle.operationalFuelEfficiency > 0 &&
          vehicle.operationalFuelEfficiency <
            averageFuelEfficiency * 0.75
        ) {
          riskScore += 15;

          if (!reasons.includes("Poor fuel efficiency")) {
            reasons.push("Poor fuel efficiency");
          }
        }

        if (
          vehicle.maintenanceCost >
          averageMaintenanceCost * 1.5 &&
          vehicle.maintenanceCost > 0
        ) {
          riskScore += 10;
        }

        if (
          vehicle.maintenanceEvents >
            averageMaintenanceEvents * 1.5 &&
          vehicle.maintenanceEvents > 1
        ) {
          riskScore += 5;

          if (
            !reasons.includes(
              "Frequent maintenance",
            )
          ) {
            reasons.push("Frequent maintenance");
          }
        }

        if (
          vehicle.trips > 0 &&
          vehicle.completedTrips === 0
        ) {
          riskScore += 15;
        }

        if (
          vehicle.trips > 0 &&
          vehicle.completedTrips > 0 &&
          vehicle.maintenanceEvents === 0
        ) {
          riskScore += 5;
        }

        if (
          vehicle.status.toLowerCase() !== "active"
        ) {
          riskScore += 5;
        }

        if (
          vehicle.trips === 0 &&
          vehicle.status.toLowerCase() === "active"
        ) {
          riskScore += 10;
        }

        riskScore = Math.min(100, riskScore);

        let riskLevel: Priority;

        if (riskScore >= 70) {
          riskLevel = "Critical";
        } else if (riskScore >= 45) {
          riskLevel = "High";
        } else if (riskScore >= 20) {
          riskLevel = "Medium";
        } else {
          riskLevel = "Low";
        }

        let performance:
          VehicleAnalysis["performance"];

        if (
          vehicle.profit > 0 &&
          vehicle.margin >= 25 &&
          riskScore < 20
        ) {
          performance = "Excellent";
        } else if (
          vehicle.profit > 0 &&
          vehicle.margin >= 15 &&
          riskScore < 30
        ) {
          performance = "Good";
        } else if (
          riskScore >= 70 ||
          vehicle.profit < 0
        ) {
          performance = "Critical";
        } else if (riskScore >= 45) {
          performance = "Needs Attention";
        } else {
          performance = "Average";
        }

        let profitabilityLevel:
          VehicleAnalysis["profitabilityLevel"];

        if (vehicle.profit < 0) {
          profitabilityLevel = "Loss Making";
        } else if (
          vehicle.margin >= 25 &&
          vehicle.profit >= averageProfit
        ) {
          profitabilityLevel = "Excellent";
        } else if (vehicle.margin >= 15) {
          profitabilityLevel = "Good";
        } else if (vehicle.margin < 10) {
          profitabilityLevel =
            "Needs Attention";
        } else {
          profitabilityLevel = "Average";
        }

        return {
          ...vehicle,
          reasons,
          riskScore,
          riskLevel,
          performance,
          profitabilityLevel,
        };
      });

    const recommendations: Recommendation[] = [];
    let recommendationId = 1;

    const recommendationKeys = new Set<string>();

    const addRecommendation = (
      priority: Priority,
      category: RecommendationCategory,
      title: string,
      explanation: string,
      action: string,
      impactScore: number,
      vehicleCode?: string,
    ) => {
      const key = `${category}|${title}|${
        vehicleCode ?? "fleet"
      }`;

      if (recommendationKeys.has(key)) {
        return;
      }

      recommendationKeys.add(key);

      recommendations.push({
        id: recommendationId++,
        priority,
        category,
        title,
        explanation,
        action,
        vehicleCode,
        impactScore,
      });
    };

    if (totalProfit < 0) {
      addRecommendation(
        "Critical",
        "Profitability",
        "Fleet is operating at a loss",
        `Completed-trip revenue is ${money(
          totalRevenue,
        )}, while recorded operating costs are ${money(
          totalOperatingCost,
        )}.`,
        "Prioritize loss-making vehicles and high-cost operations. Review pricing, vehicle allocation, fuel consumption, maintenance, and avoidable expenses before expanding activity.",
        100,
      );
    } else if (
      fleetMargin > 0 &&
      fleetMargin < 10
    ) {
      addRecommendation(
        "High",
        "Profitability",
        "Fleet margin is below a healthy operating level",
        `The current operating margin is ${percentage(
          fleetMargin,
        )}.`,
        "Review low-margin vehicles and routes, improve pricing where possible, and reduce the largest controllable operating costs.",
        85,
      );
    } else if (totalProfit > 0) {
      addRecommendation(
        "Low",
        "Profitability",
        "Fleet is generating a positive operating result",
        `The current estimated operating result is ${money(
          totalProfit,
        )} with a ${percentage(
          fleetMargin,
        )} operating margin.`,
        "Protect profitable operations and use high-performing vehicles as benchmarks for future assignments.",
        30,
      );
    }

    if (
      operationalFuelEfficiency > 0 &&
      averageFuelEfficiency > 0 &&
      operationalFuelEfficiency <
        averageFuelEfficiency * 0.8
    ) {
      addRecommendation(
        "High",
        "Fuel",
        "Fleet fuel efficiency is below its vehicle benchmark",
        `Operational fuel efficiency is ${decimal(
          operationalFuelEfficiency,
        )} km/L compared with an average vehicle benchmark of ${decimal(
          averageFuelEfficiency,
        )} km/L.`,
        "Investigate the vehicles furthest below the benchmark and review driving behavior, idling, load conditions, route planning, and maintenance.",
        82,
      );
    }

    if (
      totalOperatingCost > 0 &&
      totalFuelCost / totalOperatingCost >= 0.5
    ) {
      addRecommendation(
        "High",
        "Fuel",
        "Fuel is the dominant operating cost",
        `Fuel accounts for ${percentage(
          (totalFuelCost / totalOperatingCost) *
            100,
        )} of recorded operating costs.`,
        "Prioritize fuel-efficiency improvements because fuel savings can produce a direct improvement in operating margin.",
        78,
      );
    }

    if (
      totalDistance > 0 &&
      totalFuelLitersPurchased === 0
    ) {
      addRecommendation(
        "Medium",
        "Data Quality",
        "Fuel purchase records are missing for active distance",
        `${whole(
          totalDistance,
        )} km of completed-trip distance exists, but no fuel purchase records are available.`,
        "Verify fuel transactions before using purchase-based fuel cost analysis for financial decisions.",
        55,
      );
    }

    if (
      totalDistance > 0 &&
      operationalFuelUsed === 0
    ) {
      addRecommendation(
        "Medium",
        "Data Quality",
        "Trip-level fuel usage is missing",
        "Completed trips contain distance data but do not contain recorded fuel usage.",
        "Record fuelUsed directly on completed trips to improve operational fuel-efficiency analysis.",
        52,
      );
    }

    const criticalVehicles =
      finalizedVehicles
        .filter(
          (vehicle) =>
            vehicle.riskLevel === "Critical",
        )
        .sort(
          (a, b) =>
            b.riskScore - a.riskScore,
        );

    criticalVehicles
      .slice(0, 5)
      .forEach((vehicle) => {
        addRecommendation(
          "Critical",
          "Performance",
          `${vehicle.code} requires immediate review`,
          `${vehicle.code} has a risk score of ${vehicle.riskScore}/100 and ${vehicle.reasons
            .slice(0, 3)
            .join(", ")}.`,
          "Review this vehicle before assigning additional high-value work. Investigate profitability, cost/km, fuel efficiency, maintenance, and utilization signals.",
          95,
          vehicle.code,
        );
      });

    finalizedVehicles
      .filter(
        (vehicle) => vehicle.profit < 0,
      )
      .sort(
        (a, b) => a.profit - b.profit,
      )
      .slice(0, 5)
      .forEach((vehicle) => {
        addRecommendation(
          "Critical",
          "Profitability",
          `${vehicle.code} is loss-making`,
          `${vehicle.code} generated ${money(
            vehicle.revenue,
          )} in completed-trip revenue against ${money(
            vehicle.totalCost,
          )} in operating costs.`,
          "Review trip pricing, assignment decisions, fuel costs, maintenance spending, and other expenses before continuing normal utilization.",
          94,
          vehicle.code,
        );
      });

    finalizedVehicles
      .filter(
        (vehicle) =>
          averageCostPerKm > 0 &&
          vehicle.costPerKm >
            averageCostPerKm * 1.5,
      )
      .sort(
        (a, b) =>
          b.costPerKm - a.costPerKm,
      )
      .slice(0, 5)
      .forEach((vehicle) => {
        addRecommendation(
          "High",
          "Cost Control",
          `${vehicle.code} has unusually high cost per kilometer`,
          `${vehicle.code} is operating at ${money(
            vehicle.costPerKm,
          )}/km versus the fleet benchmark of ${money(
            averageCostPerKm,
          )}/km.`,
          "Break down fuel, maintenance, and other expenses to identify the main cost driver and determine whether reassignment or corrective action is justified.",
          88,
          vehicle.code,
        );
      });

    finalizedVehicles
      .filter(
        (vehicle) =>
          averageRevenuePerKm > 0 &&
          vehicle.revenuePerKm <
            averageRevenuePerKm * 0.75 &&
          vehicle.trips > 0,
      )
      .sort(
        (a, b) =>
          a.revenuePerKm - b.revenuePerKm,
      )
      .slice(0, 5)
      .forEach((vehicle) => {
        addRecommendation(
          "High",
          "Performance",
          `${vehicle.code} generates weak revenue per kilometer`,
          `${vehicle.code} generates ${money(
            vehicle.revenuePerKm,
          )}/km compared with the fleet benchmark of ${money(
            averageRevenuePerKm,
          )}/km.`,
          "Review the routes and assignments given to this vehicle and investigate whether pricing, route selection, or utilization is reducing revenue productivity.",
          80,
          vehicle.code,
        );
      });

    finalizedVehicles
      .filter(
        (vehicle) =>
          averageFuelEfficiency > 0 &&
          vehicle.operationalFuelEfficiency > 0 &&
          vehicle.operationalFuelEfficiency <
            averageFuelEfficiency * 0.75,
      )
      .sort(
        (a, b) =>
          a.operationalFuelEfficiency -
          b.operationalFuelEfficiency,
      )
      .slice(0, 5)
      .forEach((vehicle) => {
        addRecommendation(
          vehicle.operationalFuelEfficiency <
            averageFuelEfficiency * 0.6
            ? "High"
            : "Medium",
          "Fuel",
          `${vehicle.code} has poor operational fuel efficiency`,
          `${vehicle.code} records ${decimal(
            vehicle.operationalFuelEfficiency,
          )} km/L compared with the fleet benchmark of ${decimal(
            averageFuelEfficiency,
          )} km/L.`,
          "Inspect vehicle condition and review driver behavior, idling, load conditions, route efficiency, and fuel usage records.",
          84,
          vehicle.code,
        );
      });

    finalizedVehicles
      .filter(
        (vehicle) =>
          averageMaintenanceCost > 0 &&
          vehicle.maintenanceCost >
            averageMaintenanceCost * 1.5,
      )
      .sort(
        (a, b) =>
          b.maintenanceCost -
          a.maintenanceCost,
      )
      .slice(0, 5)
      .forEach((vehicle) => {
        addRecommendation(
          "High",
          "Maintenance",
          `${vehicle.code} has elevated maintenance spending`,
          `${vehicle.code} has accumulated ${money(
            vehicle.maintenanceCost,
          )} in maintenance costs versus a fleet average of ${money(
            averageMaintenanceCost,
          )}.`,
          "Review maintenance history and determine whether recurring failures, preventive maintenance gaps, or vehicle replacement should be considered.",
          76,
          vehicle.code,
        );
      });

    finalizedVehicles
      .filter(
        (vehicle) =>
          vehicle.trips > 0 &&
          vehicle.completedTrips === 0,
      )
      .slice(0, 5)
      .forEach((vehicle) => {
        addRecommendation(
          "Medium",
          "Utilization",
          `${vehicle.code} has trip activity but no completed trips`,
          `${vehicle.code} has ${vehicle.trips} recorded trip record${
            vehicle.trips === 1 ? "" : "s"
          }, but none are currently classified as completed.`,
          "Review trip statuses and operational follow-through. Incomplete trip records can hide revenue, distance, and utilization performance.",
          64,
          vehicle.code,
        );
      });

    finalizedVehicles
      .filter(
        (vehicle) =>
          vehicle.trips === 0 &&
          vehicle.status.toLowerCase() ===
            "active",
      )
      .slice(0, 5)
      .forEach((vehicle) => {
        addRecommendation(
          "Medium",
          "Utilization",
          `${vehicle.code} is active but has no trip activity`,
          "The vehicle is marked active but has no recorded trip activity in the available dataset.",
          "Review whether the vehicle should receive productive assignments or whether it is unavailable for operational reasons.",
          62,
          vehicle.code,
        );
      });

    finalizedVehicles
      .filter(
        (vehicle) =>
          vehicle.trips > 0 &&
          vehicle.maintenanceEvents === 0,
      )
      .slice(0, 5)
      .forEach((vehicle) => {
        addRecommendation(
          "Medium",
          "Maintenance",
          `${vehicle.code} has no maintenance history`,
          `${vehicle.code} has ${vehicle.trips} recorded trip${
            vehicle.trips === 1 ? "" : "s"
          } but no maintenance events in the available records.`,
          "Verify the maintenance history and schedule a preventive inspection if the records are incomplete.",
          58,
          vehicle.code,
        );
      });

    if (
      fleetUtilization < 50 &&
      vehicles.length > 0
    ) {
      addRecommendation(
        "Medium",
        "Utilization",
        "Fleet active status is relatively low",
        `${percentage(
          fleetUtilization,
        )} of vehicles are currently marked active.`,
        "Review inactive vehicles and determine whether they should be repaired, reassigned, returned to service, or removed from the active fleet.",
        60,
      );
    }

    const bestVehicle =
      [...finalizedVehicles]
        .filter(
          (vehicle) =>
            vehicle.profit > 0 &&
            vehicle.completedTrips > 0,
        )
        .sort(
          (a, b) =>
            b.profit - a.profit,
        )[0] ?? null;

    if (bestVehicle) {
      addRecommendation(
        "Low",
        "Performance",
        `${bestVehicle.code} is the strongest profitability performer`,
        `${bestVehicle.code} currently leads vehicle operating result at ${money(
          bestVehicle.profit,
        )} with a ${percentage(
          bestVehicle.margin,
        )} margin.`,
        "Use this vehicle as a benchmark for profitable assignments, while protecting the operating conditions that produced the result.",
        35,
        bestVehicle.code,
      );
    }

    if (recommendations.length === 0) {
      addRecommendation(
        "Low",
        "Performance",
        "No major decision signals detected",
        "The current operational dataset does not contain enough negative signals to trigger significant management recommendations.",
        "Continue monitoring fleet performance and maintain complete trip, fuel, maintenance, and expense records.",
        20,
      );
    }

    recommendations.sort((a, b) => {
      const priorityDifference =
        priorityRank(b.priority) -
        priorityRank(a.priority);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return b.impactScore - a.impactScore;
    });

    return {
      totalRevenue,
      totalOperatingCost,
      totalProfit,
      fleetMargin,
      totalDistance,
      operationalFuelUsed,
      totalFuelCost,
      totalFuelLitersPurchased,
      totalMaintenanceCost,
      totalExpenses,
      fleetRevenuePerKm,
      fleetCostPerKm,
      fleetProfitPerKm,
      operationalFuelEfficiency,
      activeVehicles,
      inactiveVehicles,
      vehicleCount: vehicles.length,
      fleetUtilization,
      completedTrips: completedTrips.length,
      totalTrips: trips.length,

      averageRevenuePerKm,
      averageCostPerKm,
      averageProfit,
      averageFuelEfficiency,
      averageMaintenanceCost,
      averageMaintenanceEvents,

      recommendations,
      vehicleAnalysis: finalizedVehicles,
    };
  }, [
    vehicles,
    trips,
    completedTrips,
    fuel,
    maintenance,
    expenses,
  ]);

  const criticalCount =
    analysis.recommendations.filter(
      (item) => item.priority === "Critical",
    ).length;

  const highCount =
    analysis.recommendations.filter(
      (item) => item.priority === "High",
    ).length;

  const mediumCount =
    analysis.recommendations.filter(
      (item) => item.priority === "Medium",
    ).length;

  const lowCount =
    analysis.recommendations.filter(
      (item) => item.priority === "Low",
    ).length;

  const highRiskVehicles =
    analysis.vehicleAnalysis.filter(
      (vehicle) =>
        vehicle.riskLevel === "Critical" ||
        vehicle.riskLevel === "High",
    ).length;

  const profitableVehicles =
    analysis.vehicleAnalysis.filter(
      (vehicle) => vehicle.profit > 0,
    ).length;

  const lossMakingVehicles =
    analysis.vehicleAnalysis.filter(
      (vehicle) => vehicle.profit < 0,
    ).length;

  const bestVehicle = useMemo(() => {
    return (
      [...analysis.vehicleAnalysis]
        .filter(
          (vehicle) =>
            vehicle.completedTrips > 0,
        )
        .sort(
          (a, b) =>
            b.profit - a.profit,
        )[0] ?? null
    );
  }, [analysis.vehicleAnalysis]);

  const highestRiskVehicle = useMemo(() => {
    return (
      [...analysis.vehicleAnalysis]
        .sort(
          (a, b) =>
            riskRank(b.riskLevel) -
              riskRank(a.riskLevel) ||
            b.riskScore - a.riskScore,
        )[0] ?? null
    );
  }, [analysis.vehicleAnalysis]);

  const topRecommendations =
    analysis.recommendations.slice(0, 6);

  if (loading) {
    return (
      <ProtectedPage permission="recommendations">
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-5 text-lg font-semibold text-slate-700">
                Analyzing FleetFlow data...
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Building management recommendations from
                operational and financial signals.
              </p>
            </div>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  if (error) {
    return (
      <ProtectedPage permission="recommendations">
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
              <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                Decision Intelligence
              </p>

              <h1 className="mt-2 text-2xl font-bold text-red-800">
                Recommendation Engine Error
              </h1>

              <p className="mt-2 text-sm leading-6 text-red-700">
                {error}
              </p>

              <button
                onClick={loadData}
                className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Retry Analysis
              </button>
            </div>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage permission="recommendations">
      <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* HEADER */}
          <section className="overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                  FleetFlow Decision Intelligence
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Executive Recommendations
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                  FleetFlow combines profitability, vehicle
                  performance, fuel efficiency, maintenance,
                  utilization, and data-quality signals into
                  prioritized management actions.
                </p>
              </div>

              <button
                onClick={loadData}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Refresh Analysis
              </button>
            </div>
          </section>

          {/* PRIORITY SUMMARY */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Critical
              </p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                {criticalCount}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Immediate attention
              </p>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                High Priority
              </p>

              <p className="mt-2 text-3xl font-bold text-orange-600">
                {highCount}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Action recommended soon
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Medium
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {mediumCount}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Monitor and investigate
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Positive / Low
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {lowCount}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Positive findings
              </p>
            </div>
          </section>

          {/* EXECUTIVE SNAPSHOT */}
          <section>
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Executive Snapshot
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Current Business Position
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Operating Revenue
                </p>

                <p className="mt-3 text-2xl font-bold">
                  {money(analysis.totalRevenue)}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Completed trips
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Operating Cost
                </p>

                <p className="mt-3 text-2xl font-bold">
                  {money(
                    analysis.totalOperatingCost,
                  )}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Fuel + maintenance + expenses
                </p>
              </div>

              <div
                className={`rounded-2xl border p-5 shadow-sm ${
                  analysis.totalProfit >= 0
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Operating Result
                </p>

                <p
                  className={`mt-3 text-2xl font-bold ${
                    analysis.totalProfit >= 0
                      ? "text-emerald-700"
                      : "text-red-700"
                  }`}
                >
                  {money(
                    analysis.totalProfit,
                  )}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Margin:{" "}
                  {percentage(
                    analysis.fleetMargin,
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Fuel Efficiency
                </p>

                <p className="mt-3 text-2xl font-bold">
                  {analysis.operationalFuelEfficiency >
                  0
                    ? `${decimal(
                        analysis.operationalFuelEfficiency,
                      )} km/L`
                    : "N/A"}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Trip-level fuel usage
                </p>
              </div>
            </div>
          </section>

          {/* MANAGEMENT SCORECARD */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Management Scorecard
              </p>

              <h2 className="mt-1 text-xl font-bold">
                What Management Should Know
              </h2>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Vehicles Analyzed
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {analysis.vehicleCount}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Profitable Vehicles
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {profitableVehicles}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Loss-Making Vehicles
                </p>

                <p className="mt-2 text-2xl font-bold text-red-600">
                  {lossMakingVehicles}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  High-Risk Vehicles
                </p>

                <p className="mt-2 text-2xl font-bold text-orange-600">
                  {highRiskVehicles}
                </p>
              </div>
            </div>
          </section>

          {/* TOP MANAGEMENT ACTIONS */}
          <section>
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Management Actions
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Highest-Priority Recommendations
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Recommendations are ranked by business priority
                and estimated operational impact.
              </p>
            </div>

            <div className="space-y-4">
              {topRecommendations.map(
                (recommendation) => (
                  <div
                    key={recommendation.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex gap-4">
                        <div
                          className={`mt-2 h-3 w-3 shrink-0 rounded-full ${priorityDot(
                            recommendation.priority,
                          )}`}
                        />

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold ${priorityClass(
                                recommendation.priority,
                              )}`}
                            >
                              {recommendation.priority}
                            </span>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {recommendation.category}
                            </span>

                            {recommendation.vehicleCode && (
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                {recommendation.vehicleCode}
                              </span>
                            )}
                          </div>

                          <h3 className="mt-3 text-lg font-bold">
                            {recommendation.title}
                          </h3>

                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                            {recommendation.explanation}
                          </p>
                        </div>
                      </div>

                      <div className="w-full rounded-xl bg-slate-50 p-4 lg:max-w-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                          Recommended Action
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {recommendation.action}
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>

            {analysis.recommendations.length >
              topRecommendations.length && (
              <p className="mt-4 text-center text-xs text-slate-400">
                {analysis.recommendations.length -
                  topRecommendations.length}{" "}
                additional recommendation
                {analysis.recommendations.length -
                  topRecommendations.length ===
                1
                  ? ""
                  : "s"}{" "}
                available below.
              </p>
            )}
          </section>

          {/* VEHICLE PERFORMANCE */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Vehicle Decision Support
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Vehicle Performance Signals
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Fleet-relative performance, profitability, cost,
                efficiency, and risk.
              </p>
            </div>

            {analysis.vehicleAnalysis.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No vehicle data available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">
                        Vehicle
                      </th>

                      <th className="px-6 py-4">
                        Trips
                      </th>

                      <th className="px-6 py-4">
                        Revenue
                      </th>

                      <th className="px-6 py-4">
                        Cost
                      </th>

                      <th className="px-6 py-4">
                        Result
                      </th>

                      <th className="px-6 py-4">
                        Margin
                      </th>

                      <th className="px-6 py-4">
                        Revenue / KM
                      </th>

                      <th className="px-6 py-4">
                        Cost / KM
                      </th>

                      <th className="px-6 py-4">
                        Fuel
                      </th>

                      <th className="px-6 py-4">
                        Performance
                      </th>

                      <th className="px-6 py-4">
                        Risk
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {analysis.vehicleAnalysis
                      .slice()
                      .sort(
                        (a, b) =>
                          riskRank(b.riskLevel) -
                            riskRank(a.riskLevel) ||
                          b.riskScore -
                            a.riskScore ||
                          a.profit - b.profit,
                      )
                      .map((vehicle) => (
                        <tr
                          key={vehicle.code}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold">
                              {vehicle.code}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {vehicle.completedTrips}/
                              {vehicle.trips} completed
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            {vehicle.trips}
                          </td>

                          <td className="px-6 py-4">
                            {money(
                              vehicle.revenue,
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {money(
                              vehicle.totalCost,
                            )}
                          </td>

                          <td
                            className={`px-6 py-4 font-bold ${
                              vehicle.profit >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {money(
                              vehicle.profit,
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {percentage(
                              vehicle.margin,
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {money(
                              vehicle.revenuePerKm,
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {money(
                              vehicle.costPerKm,
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {vehicle.operationalFuelEfficiency >
                            0
                              ? `${decimal(
                                  vehicle.operationalFuelEfficiency,
                                )} km/L`
                              : "N/A"}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${performanceClass(
                                vehicle.performance,
                              )}`}
                            >
                              {vehicle.performance}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${riskClass(
                                  vehicle.riskLevel,
                                )}`}
                              >
                                {vehicle.riskLevel}
                              </span>

                              <span className="text-xs font-semibold text-slate-400">
                                {vehicle.riskScore}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* KEY MANAGEMENT HIGHLIGHTS */}
          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Protect Performance
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Strongest Vehicle
              </h2>

              {bestVehicle ? (
                <>
                  <p className="mt-5 text-2xl font-bold">
                    {bestVehicle.code}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">
                        Operating Result
                      </p>

                      <p className="mt-1 font-bold text-emerald-600">
                        {money(
                          bestVehicle.profit,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Margin
                      </p>

                      <p className="mt-1 font-bold">
                        {percentage(
                          bestVehicle.margin,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Revenue / KM
                      </p>

                      <p className="mt-1 font-bold">
                        {money(
                          bestVehicle.revenuePerKm,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Fuel Efficiency
                      </p>

                      <p className="mt-1 font-bold">
                        {bestVehicle.operationalFuelEfficiency >
                        0
                          ? `${decimal(
                              bestVehicle.operationalFuelEfficiency,
                            )} km/L`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="mt-5 text-sm text-slate-500">
                  No completed vehicle activity is available.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                Highest Risk
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Vehicle Requiring Attention
              </h2>

              {highestRiskVehicle ? (
                <>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <p className="text-2xl font-bold">
                      {highestRiskVehicle.code}
                    </p>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${riskClass(
                        highestRiskVehicle.riskLevel,
                      )}`}
                    >
                      {highestRiskVehicle.riskLevel}
                    </span>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-500">
                        Risk Score
                      </span>

                      <span className="font-bold">
                        {highestRiskVehicle.riskScore}
                        /100
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{
                          width: `${highestRiskVehicle.riskScore}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {highestRiskVehicle.reasons
                      .slice(0, 4)
                      .map((reason) => (
                        <span
                          key={reason}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                        >
                          {reason}
                        </span>
                      ))}
                  </div>
                </>
              ) : (
                <p className="mt-5 text-sm text-slate-500">
                  No vehicle risk data is available.
                </p>
              )}
            </div>
          </section>

          {/* ALL RECOMMENDATIONS */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Full Decision Queue
              </p>

              <h2 className="mt-1 text-xl font-bold">
                All Recommendations
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Complete prioritized list generated from the current
                dataset.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {analysis.recommendations.map(
                (recommendation) => (
                  <div
                    key={`full-${recommendation.id}`}
                    className="p-5 transition hover:bg-slate-50 sm:p-6"
                  >
                    <div className="flex gap-4">
                      <div
                        className={`mt-2 h-3 w-3 shrink-0 rounded-full ${priorityDot(
                          recommendation.priority,
                        )}`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold ${priorityClass(
                              recommendation.priority,
                            )}`}
                          >
                            {recommendation.priority}
                          </span>

                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {recommendation.category}
                          </span>

                          {recommendation.vehicleCode && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {recommendation.vehicleCode}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-2 font-bold">
                          {recommendation.title}
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {recommendation.explanation}
                        </p>

                        <div className="mt-3 rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                            Action
                          </p>

                          <p className="mt-1 text-sm leading-6 text-slate-700">
                            {recommendation.action}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* ENGINE METHODOLOGY */}
          <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
              Decision Intelligence Engine
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              How FleetFlow Generates Recommendations
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              FleetFlow uses operational rules, financial calculations,
              fleet-relative benchmarks, and risk scoring to turn ERP
              records into management signals.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-bold">
                  01. Measure
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Revenue, costs, distance, fuel usage,
                  maintenance, trips, and utilization are measured
                  from ERP records.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-bold">
                  02. Benchmark
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Vehicle performance is compared against fleet
                  averages rather than relying only on arbitrary
                  absolute thresholds.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-bold">
                  03. Detect
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Losses, weak margins, high cost/km, poor fuel
                  efficiency, maintenance risk, and utilization
                  issues are identified.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-bold">
                  04. Recommend
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Each significant signal is translated into a
                  prioritized action management can investigate.
                </p>
              </div>
            </div>
          </section>

          {/* DATA MODEL NOTE */}
          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Model & Data Note
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              What This Intelligence Layer Represents
            </h2>

            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-700">
              FleetFlow Recommendations is a decision-support engine,
              not a machine-learning prediction model. It combines
              ERP transactions, completed-trip performance,
              fleet-relative benchmarks, risk scoring, and business
              rules. Future predictive capabilities could incorporate
              historical failures, component-level maintenance,
              odometer readings, route conditions, driver behavior,
              fuel prices, and time-series forecasting.
            </p>
          </section>

          {/* FOOTER */}
          <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row">
            <p>
              FleetFlow ERP • Executive Decision Intelligence
            </p>

            <p>
              Sources: Vehicles • Trips • Fuel • Maintenance •
              Expenses
            </p>
          </footer>
        </div>
      </main>
    </ProtectedPage>
  );
}

/*
  Small helper used only to keep the vehicle-analysis construction
  readable while the fleet benchmark is calculated afterward.
*/
function vehicleAnalysisPlaceholder(
  value: number,
  fallback: number,
): boolean {
  return value > fallback && false;
}
