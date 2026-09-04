"use client";

import { useEffect, useMemo, useState } from "react";

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

interface VehicleIntelligence {
  vehicleCode: string;
  trips: number;
  distance: number;
  revenue: number;
  fuelCost: number;
  maintenanceCost: number;
  otherExpenses: number;
  totalCost: number;
  result: number;
  fuelEfficiency: number;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  reasons: string[];
}

function number(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
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

      const responses = await Promise.all([
        fetch("http://localhost:3001/vehicles"),
        fetch("http://localhost:3001/trips"),
        fetch("http://localhost:3001/fuel"),
        fetch("http://localhost:3001/maintenance"),
        fetch("http://localhost:3001/expenses"),
      ]);

      if (responses.some((response) => !response.ok)) {
        throw new Error("Failed to load FleetFlow data.");
      }

      const [
        vehiclesData,
        tripsData,
        fuelData,
        maintenanceData,
        expensesData,
      ] = await Promise.all(responses.map((response) => response.json()));

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
        "Could not load intelligence data. Make sure the backend is running on port 3001.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const intelligence = useMemo<VehicleIntelligence[]>(() => {
    return vehicles.map((vehicle) => {
      const vehicleCode =
        vehicle.vehicleCode ||
        vehicle.plateNumber ||
        `Vehicle-${vehicle.id}`;

      const vehicleTrips = trips.filter(
        (trip) => trip.vehicleCode === vehicleCode,
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

      const tripCount = vehicleTrips.length;

      const distance = vehicleTrips.reduce(
        (sum, trip) => sum + number(trip.distance),
        0,
      );

      const revenue = vehicleTrips.reduce(
        (sum, trip) => sum + number(trip.revenue),
        0,
      );

      const fuelCost = vehicleFuel.reduce(
        (sum, item) => sum + number(item.cost),
        0,
      );

      const liters = vehicleFuel.reduce(
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

      const fuelEfficiency =
        liters > 0 ? distance / liters : 0;

      let riskScore = 0;
      const reasons: string[] = [];

      // High maintenance cost
      if (maintenanceCost >= 10000) {
        riskScore += 30;
        reasons.push("High maintenance cost");
      } else if (maintenanceCost >= 5000) {
        riskScore += 15;
        reasons.push("Moderate maintenance cost");
      }

      // Poor fuel efficiency
      if (fuelEfficiency > 0 && fuelEfficiency < 3) {
        riskScore += 30;
        reasons.push("Poor fuel efficiency");
      } else if (fuelEfficiency > 0 && fuelEfficiency < 4) {
        riskScore += 15;
        reasons.push("Below-average fuel efficiency");
      }

      // Negative financial result
      if (result < 0) {
        riskScore += 25;
        reasons.push("Operating at a loss");
      }

      // High operating cost
      if (totalCost >= 20000) {
        riskScore += 20;
        reasons.push("High operating cost");
      } else if (totalCost >= 10000) {
        riskScore += 10;
        reasons.push("Elevated operating cost");
      }

      // Low utilization
      if (tripCount === 0) {
        riskScore += 15;
        reasons.push("No recorded trips");
      }

      if (vehicle.status?.toLowerCase() === "inactive") {
        riskScore += 10;
        reasons.push("Vehicle is inactive");
      }

      riskScore = Math.min(riskScore, 100);

      let riskLevel: VehicleIntelligence["riskLevel"];

      if (riskScore >= 70) {
        riskLevel = "Critical";
      } else if (riskScore >= 45) {
        riskLevel = "High";
      } else if (riskScore >= 20) {
        riskLevel = "Medium";
      } else {
        riskLevel = "Low";
      }

      return {
        vehicleCode,
        trips: tripCount,
        distance,
        revenue,
        fuelCost,
        maintenanceCost,
        otherExpenses,
        totalCost,
        result,
        fuelEfficiency,
        riskScore,
        riskLevel,
        reasons,
      };
    });
  }, [vehicles, trips, fuel, maintenance, expenses]);

  const summary = useMemo(() => {
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

    const totalRevenue = intelligence.reduce(
      (sum, item) => sum + item.revenue,
      0,
    );

    const totalCost = intelligence.reduce(
      (sum, item) => sum + item.totalCost,
      0,
    );

    const totalResult = totalRevenue - totalCost;

    return {
      critical,
      high,
      medium,
      low,
      totalRevenue,
      totalCost,
      totalResult,
    };
  }, [intelligence]);

  const topRiskVehicles = useMemo(() => {
    return [...intelligence]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
  }, [intelligence]);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Fleet Intelligence
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Vehicle Risk Detection
            </h1>

            <p className="mt-2 text-slate-500">
              Automated analysis of vehicle performance, cost, and operational risk.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
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

        {/* Summary Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Critical Risk
            </p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {summary.critical}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Immediate attention
            </p>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              High Risk
            </p>
            <p className="mt-2 text-3xl font-bold text-orange-600">
              {summary.high}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Needs investigation
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Medium Risk
            </p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {summary.medium}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Monitor closely
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Low Risk
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {summary.low}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Operating normally
            </p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-sm text-slate-400">Fleet Revenue</p>
            <p className="mt-2 text-2xl font-bold">
              {money(summary.totalRevenue)}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-sm text-slate-400">Fleet Operating Cost</p>
            <p className="mt-2 text-2xl font-bold">
              {money(summary.totalCost)}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-sm text-slate-400">Fleet Result</p>
            <p
              className={`mt-2 text-2xl font-bold ${
                summary.totalResult >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {money(summary.totalResult)}
            </p>
          </div>
        </div>

        {/* Risk Overview */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Vehicle Risk Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Risk scores are calculated from maintenance, fuel efficiency,
              expenses, profitability, and utilization.
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500">
              Loading intelligence data...
            </div>
          ) : intelligence.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No vehicle data available.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Trips</th>
                    <th className="px-4 py-3">Revenue</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3">Result</th>
                    <th className="px-4 py-3">Fuel Efficiency</th>
                    <th className="px-4 py-3">Risk</th>
                    <th className="px-4 py-3">Score</th>
                  </tr>
                </thead>

                <tbody>
                  {intelligence.map((item) => (
                    <tr
                      key={item.vehicleCode}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-semibold text-slate-900">
                        {item.vehicleCode}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {item.trips}
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

                      <td className="px-4 py-4 text-slate-700">
                        {item.fuelEfficiency > 0
                          ? `${item.fuelEfficiency.toFixed(2)} km/L`
                          : "N/A"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            item.riskLevel === "Critical"
                              ? "bg-red-100 text-red-700"
                              : item.riskLevel === "High"
                                ? "bg-orange-100 text-orange-700"
                                : item.riskLevel === "Medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-emerald-100 text-emerald-700"
                          }`}
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
              Highest Risk Vehicles
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Vehicles requiring the most attention based on the current data.
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
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-900">
                          {item.vehicleCode}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            item.riskLevel === "Critical"
                              ? "bg-red-100 text-red-700"
                              : item.riskLevel === "High"
                                ? "bg-orange-100 text-orange-700"
                                : item.riskLevel === "Medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {item.riskLevel}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        Risk Score:{" "}
                        <span className="font-bold text-slate-800">
                          {item.riskScore}/100
                        </span>
                      </p>
                    </div>

                    <div className="w-full max-w-xs">
                      <div className="mb-2 flex justify-between text-xs text-slate-500">
                        <span>Risk Level</span>
                        <span>{item.riskScore}%</span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            item.riskLevel === "Critical"
                              ? "bg-red-500"
                              : item.riskLevel === "High"
                                ? "bg-orange-500"
                                : item.riskLevel === "Medium"
                                  ? "bg-yellow-500"
                                  : "bg-emerald-500"
                          }`}
                          style={{ width: `${item.riskScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {item.reasons.length > 0 ? (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Detected Issues
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
                  ) : (
                    <p className="mt-4 text-sm text-emerald-600">
                      No significant risk factors detected.
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <h2 className="text-lg font-bold text-slate-900">
            How FleetFlow Intelligence Works
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[
              ["01", "Maintenance", "Analyzes repair frequency and cost."],
              ["02", "Fuel", "Checks fuel consumption and efficiency."],
              ["03", "Profitability", "Compares revenue against operating cost."],
              ["04", "Utilization", "Checks whether vehicles are being used."],
              ["05", "Risk Score", "Combines signals into a 0–100 risk score."],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-xl bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-bold text-blue-600">{number}</p>
                <h3 className="mt-2 font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          FleetFlow Intelligence • Automated Fleet Risk Analysis
        </footer>
      </div>
    </main>
  );
}
