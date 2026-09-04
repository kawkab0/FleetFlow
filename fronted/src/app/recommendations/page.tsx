"use client";

import { useEffect, useMemo, useState } from "react";

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

interface Recommendation {
  id: number;
  priority: "Critical" | "High" | "Medium" | "Low";
  category: string;
  title: string;
  explanation: string;
  action: string;
  vehicleCode?: string;
}

const API = "http://localhost:3001";

function number(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number): string {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;
}

function percentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default function RecommendationsPage() {
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
        vehiclesResponse,
        tripsResponse,
        fuelResponse,
        maintenanceResponse,
        expensesResponse,
      ] = await Promise.all([
        fetch(`${API}/vehicles`),
        fetch(`${API}/trips`),
        fetch(`${API}/fuel`),
        fetch(`${API}/maintenance`),
        fetch(`${API}/expenses`),
      ]);

      if (
        !vehiclesResponse.ok ||
        !tripsResponse.ok ||
        !fuelResponse.ok ||
        !maintenanceResponse.ok ||
        !expensesResponse.ok
      ) {
        throw new Error("Failed to load FleetFlow data.");
      }

      const [
        vehiclesData,
        tripsData,
        fuelData,
        maintenanceData,
        expensesData,
      ] = await Promise.all([
        vehiclesResponse.json(),
        tripsResponse.json(),
        fuelResponse.json(),
        maintenanceResponse.json(),
        expensesResponse.json(),
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
      setError(
        "Unable to load recommendation data. Make sure the backend is running on port 3001.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const analysis = useMemo(() => {
    const totalRevenue = trips.reduce(
      (sum, trip) => sum + number(trip.revenue),
      0,
    );

    const totalFuelCost = fuel.reduce(
      (sum, record) => sum + number(record.cost),
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
      totalFuelCost + totalMaintenanceCost + totalExpenses;

    const totalProfit = totalRevenue - totalOperatingCost;

    const totalDistance = trips.reduce(
      (sum, trip) => sum + number(trip.distance),
      0,
    );

    const totalFuelLiters = fuel.reduce(
      (sum, record) => sum + number(record.liters),
      0,
    );

    const fleetEfficiency =
      totalFuelLiters > 0 ? totalDistance / totalFuelLiters : 0;

    const activeVehicles = vehicles.filter(
      (vehicle) =>
        String(vehicle.status ?? "").toLowerCase() === "active",
    ).length;

    const vehicleCount = vehicles.length;

    const fleetUtilization =
      vehicleCount > 0 ? (activeVehicles / vehicleCount) * 100 : 0;

    const recommendations: Recommendation[] = [];

    let recommendationId = 1;

    const addRecommendation = (
      priority: Recommendation["priority"],
      category: string,
      title: string,
      explanation: string,
      action: string,
      vehicleCode?: string,
    ) => {
      recommendations.push({
        id: recommendationId++,
        priority,
        category,
        title,
        explanation,
        action,
        vehicleCode,
      });
    };

    // ---------------------------------------------------------
    // FLEET-LEVEL FINANCIAL ANALYSIS
    // ---------------------------------------------------------

    if (totalProfit < 0) {
      addRecommendation(
        "Critical",
        "Profitability",
        "Fleet is currently operating at a loss",
        `Operating costs of ${money(
          totalOperatingCost,
        )} are higher than revenue of ${money(totalRevenue)}.`,
        "Review vehicle-level profitability and reduce unnecessary operating costs before expanding fleet activity.",
      );
    } else if (totalProfit > 0) {
      addRecommendation(
        "Low",
        "Profitability",
        "Fleet is generating a positive operating result",
        `Current operating profit is ${money(totalProfit)}.`,
        "Protect profitable operations and use the highest-performing vehicles for priority assignments.",
      );
    }

    // ---------------------------------------------------------
    // FUEL ANALYSIS
    // ---------------------------------------------------------

    if (fleetEfficiency > 0 && fleetEfficiency < 3) {
      addRecommendation(
        "High",
        "Fuel",
        "Fleet fuel efficiency is critically low",
        `The fleet is averaging only ${fleetEfficiency.toFixed(
          2,
        )} km/L.`,
        "Investigate vehicle condition, driving behavior, route selection, and fuel consumption immediately.",
      );
    } else if (fleetEfficiency > 0 && fleetEfficiency < 4) {
      addRecommendation(
        "Medium",
        "Fuel",
        "Fuel efficiency should be improved",
        `Current fleet efficiency is ${fleetEfficiency.toFixed(
          2,
        )} km/L.`,
        "Monitor high-consumption vehicles and investigate unnecessary idling, inefficient routes, or maintenance issues.",
      );
    }

    if (
      totalOperatingCost > 0 &&
      totalFuelCost / totalOperatingCost > 0.5
    ) {
      addRecommendation(
        "High",
        "Fuel",
        "Fuel is the dominant operating cost",
        `Fuel represents ${percentage(
          (totalFuelCost / totalOperatingCost) * 100,
        )} of total operating costs.`,
        "Prioritize fuel-efficiency improvements because even small reductions in consumption can significantly improve profitability.",
      );
    }

    // ---------------------------------------------------------
    // VEHICLE-LEVEL ANALYSIS
    // ---------------------------------------------------------

    const vehicleAnalysis = vehicles.map((vehicle) => {
      const code =
        String(vehicle.vehicleCode ?? "").trim() || `Vehicle #${vehicle.id}`;

      const vehicleTrips = trips.filter(
        (trip) => String(trip.vehicleCode) === code,
      );

      const vehicleFuel = fuel.filter(
        (record) => String(record.vehicleCode) === code,
      );

      const vehicleMaintenance = maintenance.filter(
        (record) => String(record.vehicleCode) === code,
      );

      const vehicleExpenses = expenses.filter(
        (expense) => String(expense.vehicleCode) === code,
      );

      const revenue = vehicleTrips.reduce(
        (sum, trip) => sum + number(trip.revenue),
        0,
      );

      const distance = vehicleTrips.reduce(
        (sum, trip) => sum + number(trip.distance),
        0,
      );

      const fuelLiters = vehicleFuel.reduce(
        (sum, record) => sum + number(record.liters),
        0,
      );

      const fuelCost = vehicleFuel.reduce(
        (sum, record) => sum + number(record.cost),
        0,
      );

      const maintenanceCost = vehicleMaintenance.reduce(
        (sum, record) => sum + number(record.cost),
        0,
      );

      const otherExpenses = vehicleExpenses.reduce(
        (sum, expense) => sum + number(expense.amount),
        0,
      );

      const totalCost =
        fuelCost + maintenanceCost + otherExpenses;

      const profit = revenue - totalCost;

      const efficiency =
        fuelLiters > 0 ? distance / fuelLiters : 0;

      return {
        code,
        revenue,
        distance,
        fuelLiters,
        fuelCost,
        maintenanceCost,
        otherExpenses,
        totalCost,
        profit,
        efficiency,
        trips: vehicleTrips.length,
        maintenanceEvents: vehicleMaintenance.length,
        status: String(vehicle.status ?? ""),
      };
    });

    // Loss-making vehicles
    vehicleAnalysis
      .filter((vehicle) => vehicle.profit < 0 && vehicle.totalCost > 0)
      .sort((a, b) => a.profit - b.profit)
      .slice(0, 3)
      .forEach((vehicle) => {
        addRecommendation(
          "Critical",
          "Vehicle Profitability",
          `${vehicle.code} is operating at a loss`,
          `${vehicle.code} generated ${money(
            vehicle.revenue,
          )} in revenue against ${money(vehicle.totalCost)} in costs.`,
          "Review this vehicle's assignments, fuel consumption, maintenance expenses, and trip pricing before assigning additional work.",
          vehicle.code,
        );
      });

    // High maintenance vehicles
    vehicleAnalysis
      .filter((vehicle) => vehicle.maintenanceCost >= 5000)
      .sort((a, b) => b.maintenanceCost - a.maintenanceCost)
      .slice(0, 3)
      .forEach((vehicle) => {
        addRecommendation(
          vehicle.maintenanceCost >= 10000 ? "High" : "Medium",
          "Maintenance",
          `${vehicle.code} has high maintenance costs`,
          `${vehicle.code} has accumulated ${money(
            vehicle.maintenanceCost,
          )} in maintenance expenses across ${
            vehicle.maintenanceEvents
          } recorded maintenance event${
            vehicle.maintenanceEvents === 1 ? "" : "s"
          }.`,
          "Review maintenance history and determine whether preventive maintenance or vehicle replacement would reduce long-term costs.",
          vehicle.code,
        );
      });

    // Poor fuel efficiency vehicles
    vehicleAnalysis
      .filter(
        (vehicle) =>
          vehicle.efficiency > 0 && vehicle.efficiency < 4,
      )
      .sort((a, b) => a.efficiency - b.efficiency)
      .slice(0, 3)
      .forEach((vehicle) => {
        addRecommendation(
          vehicle.efficiency < 3 ? "High" : "Medium",
          "Fuel",
          `${vehicle.code} has poor fuel efficiency`,
          `${vehicle.code} is averaging ${vehicle.efficiency.toFixed(
            2,
          )} km/L.`,
          "Inspect the vehicle for mechanical issues and review driver behavior, idling, load weight, and route efficiency.",
          vehicle.code,
        );
      });

    // High fuel cost vehicles
    vehicleAnalysis
      .filter((vehicle) => vehicle.fuelCost >= 15000)
      .sort((a, b) => b.fuelCost - a.fuelCost)
      .slice(0, 3)
      .forEach((vehicle) => {
        addRecommendation(
          vehicle.fuelCost >= 25000 ? "High" : "Medium",
          "Fuel Cost",
          `${vehicle.code} is a major fuel cost contributor`,
          `${vehicle.code} has accumulated ${money(
            vehicle.fuelCost,
          )} in fuel costs.`,
          "Monitor fuel purchases and investigate whether this cost is justified by the vehicle's distance and revenue generation.",
          vehicle.code,
        );
      });

    // Underutilized vehicles
    vehicleAnalysis
      .filter((vehicle) => vehicle.trips === 0)
      .slice(0, 3)
      .forEach((vehicle) => {
        addRecommendation(
          "Medium",
          "Fleet Utilization",
          `${vehicle.code} has no recorded trips`,
          "The vehicle currently has no trip activity in the available operational data.",
          "Consider assigning productive trips or reviewing whether the vehicle should remain active.",
          vehicle.code,
        );
      });

    // High-cost vehicles
    vehicleAnalysis
      .filter((vehicle) => vehicle.totalCost >= 20000)
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 3)
      .forEach((vehicle) => {
        if (
          !recommendations.some(
            (recommendation) =>
              recommendation.vehicleCode === vehicle.code &&
              recommendation.category === "Vehicle Cost",
          )
        ) {
          addRecommendation(
            "High",
            "Vehicle Cost",
            `${vehicle.code} has unusually high operating costs`,
            `Total recorded operating costs for this vehicle are ${money(
              vehicle.totalCost,
            )}.`,
            "Break down the vehicle's fuel, maintenance, and other expenses to identify the largest cost drivers.",
            vehicle.code,
          );
        }
      });

    // ---------------------------------------------------------
    // MAINTENANCE DATA QUALITY / PREVENTIVE MAINTENANCE
    // ---------------------------------------------------------

    vehicleAnalysis
      .filter(
        (vehicle) =>
          vehicle.trips > 0 &&
          vehicle.maintenanceEvents === 0,
      )
      .slice(0, 3)
      .forEach((vehicle) => {
        addRecommendation(
          "Medium",
          "Preventive Maintenance",
          `${vehicle.code} has trip activity but no maintenance history`,
          `The vehicle has ${vehicle.trips} recorded trip${
            vehicle.trips === 1 ? "" : "s"
          } but no maintenance events in the available data.`,
          "Verify the maintenance records and schedule a preventive inspection if maintenance history is incomplete.",
          vehicle.code,
        );
      });

    // ---------------------------------------------------------
    // FLEET UTILIZATION
    // ---------------------------------------------------------

    if (fleetUtilization < 50 && vehicleCount > 0) {
      addRecommendation(
        "Medium",
        "Fleet Utilization",
        "Fleet utilization is low",
        `Only ${percentage(
          fleetUtilization,
        )} of vehicles are currently marked active.`,
        "Review inactive vehicles and determine whether they should be repaired, reassigned, sold, or returned to service.",
      );
    }

    // ---------------------------------------------------------
    // POSITIVE RECOMMENDATIONS
    // ---------------------------------------------------------

    const profitableVehicles = vehicleAnalysis
      .filter((vehicle) => vehicle.profit > 0)
      .sort((a, b) => b.profit - a.profit);

    if (profitableVehicles.length > 0) {
      const best = profitableVehicles[0];

      addRecommendation(
        "Low",
        "Performance",
        `${best.code} is the strongest profitability performer`,
        `${best.code} currently has the highest recorded operating result at ${money(
          best.profit,
        )}.`,
        "Prioritize this vehicle for high-value assignments while maintaining its current cost efficiency.",
        best.code,
      );
    }

    if (recommendations.length === 0) {
      addRecommendation(
        "Low",
        "General",
        "No major issues detected",
        "The current dataset does not contain enough signals to trigger significant operational warnings.",
        "Continue monitoring fleet performance and keep operational records up to date.",
      );
    }

    return {
      totalRevenue,
      totalOperatingCost,
      totalProfit,
      totalDistance,
      fleetEfficiency,
      fleetUtilization,
      activeVehicles,
      vehicleCount,
      recommendations,
      vehicleAnalysis,
    };
  }, [vehicles, trips, fuel, maintenance, expenses]);

  const criticalCount = analysis.recommendations.filter(
    (item) => item.priority === "Critical",
  ).length;

  const highCount = analysis.recommendations.filter(
    (item) => item.priority === "High",
  ).length;

  const mediumCount = analysis.recommendations.filter(
    (item) => item.priority === "Medium",
  ).length;

  const lowCount = analysis.recommendations.filter(
    (item) => item.priority === "Low",
  ).length;

  const priorityClass = (priority: Recommendation["priority"]) => {
    if (priority === "Critical") {
      return "bg-red-100 text-red-700 border-red-200";
    }

    if (priority === "High") {
      return "bg-orange-100 text-orange-700 border-orange-200";
    }

    if (priority === "Medium") {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }

    return "bg-green-100 text-green-700 border-green-200";
  };

  const priorityDot = (priority: Recommendation["priority"]) => {
    if (priority === "Critical") return "bg-red-500";
    if (priority === "High") return "bg-orange-500";
    if (priority === "Medium") return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-700">
              Analyzing FleetFlow data...
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Generating operational recommendations.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <h1 className="text-xl font-bold text-red-700">
              Recommendation Engine Error
            </h1>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              onClick={loadData}
              className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HEADER */}
        <section className="rounded-2xl bg-slate-900 p-8 text-white shadow-lg">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                Decision Intelligence
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Executive Recommendations
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                FleetFlow analyzes operational, financial, fuel, and
                maintenance data to identify risks and recommend actions
                management should consider.
              </p>
            </div>

            <button
              onClick={loadData}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Refresh Analysis
            </button>
          </div>
        </section>

        {/* PRIORITY SUMMARY */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Critical
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {criticalCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Immediate management attention
            </p>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              High Priority
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {highCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Requires action soon
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Medium Priority
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {mediumCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Should be monitored
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Positive / Low
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {lowCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Positive or low-risk findings
            </p>
          </div>
        </section>

        {/* EXECUTIVE SNAPSHOT */}
        <section>
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Executive Snapshot
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Current Business Position
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Revenue</p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {money(analysis.totalRevenue)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Operating Cost
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {money(analysis.totalOperatingCost)}
              </p>
            </div>

            <div
              className={`rounded-2xl border p-6 shadow-sm ${
                analysis.totalProfit >= 0
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <p className="text-sm text-slate-500">
                Operating Result
              </p>

              <p
                className={`mt-2 text-2xl font-bold ${
                  analysis.totalProfit >= 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {money(analysis.totalProfit)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Fleet Efficiency
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {analysis.fleetEfficiency > 0
                  ? `${analysis.fleetEfficiency.toFixed(2)} km/L`
                  : "N/A"}
              </p>
            </div>
          </div>
        </section>

        {/* RECOMMENDATIONS */}
        <section>
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Management Actions
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Recommended Actions
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              These recommendations are generated from the current
              FleetFlow operational data.
            </p>
          </div>

          <div className="space-y-4">
            {analysis.recommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    <div
                      className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${priorityDot(
                        recommendation.priority,
                      )}`}
                    />

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${priorityClass(
                            recommendation.priority,
                          )}`}
                        >
                          {recommendation.priority}
                        </span>

                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {recommendation.category}
                        </span>

                        {recommendation.vehicleCode && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {recommendation.vehicleCode}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-slate-900">
                        {recommendation.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {recommendation.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-full rounded-xl bg-slate-50 p-4 lg:min-w-[320px] lg:max-w-[380px]">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                      Recommended Action
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {recommendation.action}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* VEHICLE DECISION TABLE */}
        <section>
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Vehicle Decision Support
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Vehicle Performance Signals
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-300">
                  <tr>
                    <th className="px-6 py-4">Vehicle</th>
                    <th className="px-6 py-4">Trips</th>
                    <th className="px-6 py-4">Revenue</th>
                    <th className="px-6 py-4">Operating Cost</th>
                    <th className="px-6 py-4">Result</th>
                    <th className="px-6 py-4">Fuel Efficiency</th>
                    <th className="px-6 py-4">Signal</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {analysis.vehicleAnalysis.map((vehicle) => {
                    const signal =
                      vehicle.profit < 0
                        ? "Loss-making"
                        : vehicle.efficiency > 0 &&
                            vehicle.efficiency < 3
                          ? "Poor efficiency"
                          : vehicle.maintenanceCost >= 10000
                            ? "High maintenance"
                            : vehicle.trips === 0
                              ? "Underutilized"
                              : "Healthy";

                    const signalClass =
                      signal === "Healthy"
                        ? "bg-green-100 text-green-700"
                        : signal === "Underutilized"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700";

                    return (
                      <tr
                        key={vehicle.code}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {vehicle.code}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {vehicle.trips}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {money(vehicle.revenue)}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {money(vehicle.totalCost)}
                        </td>

                        <td
                          className={`px-6 py-4 text-sm font-semibold ${
                            vehicle.profit >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {money(vehicle.profit)}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {vehicle.efficiency > 0
                            ? `${vehicle.efficiency.toFixed(2)} km/L`
                            : "N/A"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${signalClass}`}
                          >
                            {signal}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {analysis.vehicleAnalysis.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-sm text-slate-500"
                      >
                        No vehicle data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Decision Engine
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            How FleetFlow Makes Recommendations
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="text-2xl">📊</div>

              <h3 className="mt-3 font-bold text-slate-900">
                1. Analyze
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                FleetFlow combines vehicles, trips, fuel,
                maintenance, and expenses.
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="text-2xl">🚨</div>

              <h3 className="mt-3 font-bold text-slate-900">
                2. Detect
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                The system identifies losses, high costs, poor
                efficiency, maintenance risks, and utilization
                problems.
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="text-2xl">💡</div>

              <h3 className="mt-3 font-bold text-slate-900">
                3. Recommend
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Each detected issue is converted into a
                prioritized management action.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          FleetFlow Decision Intelligence • Recommendations are
          generated from current operational data.
        </footer>
      </div>
    </main>
  );
}
