"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedPage from "@/app/components/ProtectedPage";

interface Vehicle {
  id: number;
  vehicleCode?: string;
  status?: string;
  vehicleType?: string;
  model?: string;
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
  fuelDate?: string;
}

type RiskLevel = "Low" | "Medium" | "High" | "Critical";

type Performance =
  | "Excellent"
  | "Good"
  | "Average"
  | "Needs Attention";

interface VehicleFuelAnalysis {
  vehicleCode: string;
  status: string;
  vehicleType: string;
  fuelLiters: number;
  fuelCost: number;
  completedDistance: number;
  allTripDistance: number;
  completedTrips: number;
  totalTrips: number;
  fuelEfficiency: number;
  costPerKm: number;
  fuelCostShare: number;
  efficiencyVsFleet: number;
  costPerKmVsFleet: number;
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

function normalizeStatus(value?: string) {
  return (value || "").trim().toLowerCase();
}

function isCompletedTrip(trip: Trip) {
  const status = normalizeStatus(trip.status);

  return (
    status === "completed" ||
    status === "complete" ||
    status === "delivered" ||
    status === "closed" ||
    status === "finished"
  );
}

export default function FuelIntelligencePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuel, setFuel] = useState<Fuel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [vehiclesData, tripsData, fuelData] =
        await Promise.all([
          apiFetch("/vehicles"),
          apiFetch("/trips"),
          apiFetch("/fuel"),
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
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Could not connect to the FleetFlow backend.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const baseAnalysis = useMemo(() => {
    return vehicles.map((vehicle) => {
      const vehicleCode =
        vehicle.vehicleCode || `Vehicle #${vehicle.id}`;

      const vehicleTrips = trips.filter(
        (trip) => trip.vehicleCode === vehicleCode,
      );

      const completedTrips = vehicleTrips.filter(
        isCompletedTrip,
      );

      const vehicleFuel = fuel.filter(
        (record) => record.vehicleCode === vehicleCode,
      );

      const fuelLiters = vehicleFuel.reduce(
        (sum, record) => sum + number(record.liters),
        0,
      );

      const fuelCost = vehicleFuel.reduce(
        (sum, record) => sum + number(record.cost),
        0,
      );

      const completedDistance = completedTrips.reduce(
        (sum, trip) => sum + number(trip.distance),
        0,
      );

      const allTripDistance = vehicleTrips.reduce(
        (sum, trip) => sum + number(trip.distance),
        0,
      );

      return {
        vehicleCode,
        status: vehicle.status || "Unknown",
        vehicleType:
          vehicle.vehicleType ||
          vehicle.model ||
          "Unknown type",
        fuelLiters,
        fuelCost,
        completedDistance,
        allTripDistance,
        completedTrips: completedTrips.length,
        totalTrips: vehicleTrips.length,
      };
    });
  }, [vehicles, trips, fuel]);

  const fleetBenchmarks = useMemo(() => {
    const vehiclesWithFuelAndDistance =
      baseAnalysis.filter(
        (item) =>
          item.fuelLiters > 0 &&
          item.completedDistance > 0,
      );

    const totalFuel = baseAnalysis.reduce(
      (sum, item) => sum + item.fuelLiters,
      0,
    );

    const totalFuelCost = baseAnalysis.reduce(
      (sum, item) => sum + item.fuelCost,
      0,
    );

    const totalDistance = baseAnalysis.reduce(
      (sum, item) => sum + item.completedDistance,
      0,
    );

    const fleetEfficiency =
      totalFuel > 0
        ? totalDistance / totalFuel
        : 0;

    const fleetCostPerKm =
      totalDistance > 0
        ? totalFuelCost / totalDistance
        : 0;

    const averageVehicleEfficiency =
      vehiclesWithFuelAndDistance.length > 0
        ? vehiclesWithFuelAndDistance.reduce(
            (sum, item) =>
              sum +
              item.completedDistance /
                item.fuelLiters,
            0,
          ) / vehiclesWithFuelAndDistance.length
        : 0;

    const averageVehicleCostPerKm =
      vehiclesWithFuelAndDistance.length > 0
        ? vehiclesWithFuelAndDistance.reduce(
            (sum, item) =>
              sum +
              item.fuelCost /
                item.completedDistance,
            0,
          ) / vehiclesWithFuelAndDistance.length
        : 0;

    return {
      fleetEfficiency,
      fleetCostPerKm,
      averageVehicleEfficiency,
      averageVehicleCostPerKm,
      totalFuel,
      totalFuelCost,
      totalDistance,
    };
  }, [baseAnalysis]);

  const analysis = useMemo<VehicleFuelAnalysis[]>(() => {
    const totalFuelCost =
      fleetBenchmarks.totalFuelCost;

    return baseAnalysis.map((item) => {
      const fuelEfficiency =
        item.fuelLiters > 0 &&
        item.completedDistance > 0
          ? item.completedDistance /
            item.fuelLiters
          : 0;

      const costPerKm =
        item.completedDistance > 0
          ? item.fuelCost /
            item.completedDistance
          : 0;

      const efficiencyVsFleet =
        fleetBenchmarks.fleetEfficiency > 0 &&
        fuelEfficiency > 0
          ? (fuelEfficiency /
              fleetBenchmarks.fleetEfficiency -
              1) *
            100
          : 0;

      const costPerKmVsFleet =
        fleetBenchmarks.fleetCostPerKm > 0 &&
        costPerKm > 0
          ? (costPerKm /
              fleetBenchmarks.fleetCostPerKm -
              1) *
            100
          : 0;

      const fuelCostShare =
        totalFuelCost > 0
          ? (item.fuelCost /
              totalFuelCost) *
            100
          : 0;

      let riskScore = 0;

      const reasons: string[] = [];
      const recommendations: string[] = [];

      /*
       * DATA QUALITY / COVERAGE
       */

      if (
        item.completedTrips > 0 &&
        item.fuelLiters === 0
      ) {
        riskScore += 25;

        reasons.push(
          "Completed trips have no recorded fuel data",
        );

        recommendations.push(
          "Review fuel records and confirm fuel entries are being linked to this vehicle.",
        );
      }

      if (
        item.fuelLiters > 0 &&
        item.completedDistance === 0
      ) {
        riskScore += 30;

        reasons.push(
          "Fuel purchases exist without completed-trip distance",
        );

        recommendations.push(
          "Verify trip completion records before evaluating fuel efficiency.",
        );
      }

      /*
       * FUEL EFFICIENCY
       */

      if (
        fuelEfficiency > 0 &&
        fleetBenchmarks.fleetEfficiency > 0
      ) {
        if (efficiencyVsFleet <= -30) {
          riskScore += 35;

          reasons.push(
            "Fuel efficiency is significantly below fleet average",
          );

          recommendations.push(
            "Inspect vehicle condition, driving behavior, route conditions and possible fuel leakage.",
          );
        } else if (efficiencyVsFleet <= -15) {
          riskScore += 20;

          reasons.push(
            "Fuel efficiency is below fleet average",
          );

          recommendations.push(
            "Monitor fuel consumption and investigate recurring inefficiency.",
          );
        }
      }

      /*
       * COST PER KM
       */

      if (
        costPerKm > 0 &&
        fleetBenchmarks.fleetCostPerKm > 0
      ) {
        if (costPerKmVsFleet >= 40) {
          riskScore += 30;

          reasons.push(
            "Fuel cost per kilometer is significantly above fleet average",
          );

          recommendations.push(
            "Review fuel prices, consumption patterns and route allocation.",
          );
        } else if (costPerKmVsFleet >= 20) {
          riskScore += 15;

          reasons.push(
            "Fuel cost per kilometer is above fleet average",
          );

          recommendations.push(
            "Monitor this vehicle closely for rising fuel costs.",
          );
        }
      }

      /*
       * FUEL COST CONCENTRATION
       */

      if (fuelCostShare >= 30) {
        riskScore += 15;

        reasons.push(
          "Vehicle represents a large share of total fleet fuel cost",
        );

        recommendations.push(
          "Prioritize this vehicle for fuel optimization review.",
        );
      }

      /*
       * VERY LOW EFFICIENCY ABSOLUTE CHECK
       */

      if (
        fuelEfficiency > 0 &&
        fuelEfficiency < 3
      ) {
        riskScore += 20;

        reasons.push(
          "Very low absolute fuel efficiency",
        );

        recommendations.push(
          "Inspect mechanical condition and driving patterns.",
        );
      }

      riskScore = Math.min(
        Math.round(riskScore),
        100,
      );

      let riskLevel: RiskLevel = "Low";

      if (riskScore >= 70) {
        riskLevel = "Critical";
      } else if (riskScore >= 45) {
        riskLevel = "High";
      } else if (riskScore >= 20) {
        riskLevel = "Medium";
      }

      let performance: Performance =
        "Average";

      if (
        riskLevel === "Critical" ||
        riskLevel === "High"
      ) {
        performance = "Needs Attention";
      } else if (
        fuelEfficiency > 0 &&
        fleetBenchmarks.fleetEfficiency > 0 &&
        efficiencyVsFleet >= 15 &&
        costPerKmVsFleet <= 0
      ) {
        performance = "Excellent";
      } else if (
        fuelEfficiency > 0 &&
        fleetBenchmarks.fleetEfficiency > 0 &&
        efficiencyVsFleet >= 0
      ) {
        performance = "Good";
      }

      if (reasons.length === 0) {
        reasons.push(
          "Fuel performance is within the expected fleet range",
        );
      }

      if (recommendations.length === 0) {
        recommendations.push(
          "Continue monitoring fuel efficiency and cost trends.",
        );
      }

      return {
        ...item,
        fuelEfficiency,
        costPerKm,
        fuelCostShare,
        efficiencyVsFleet,
        costPerKmVsFleet,
        riskScore,
        riskLevel,
        performance,
        reasons,
        recommendations,
      };
    });
  }, [baseAnalysis, fleetBenchmarks]);

  const totals = useMemo(() => {
    const fuelLiters = analysis.reduce(
      (sum, item) => sum + item.fuelLiters,
      0,
    );

    const fuelCost = analysis.reduce(
      (sum, item) => sum + item.fuelCost,
      0,
    );

    const completedDistance = analysis.reduce(
      (sum, item) =>
        sum + item.completedDistance,
      0,
    );

    const completedTrips = analysis.reduce(
      (sum, item) =>
        sum + item.completedTrips,
      0,
    );

    const totalTrips = analysis.reduce(
      (sum, item) => sum + item.totalTrips,
      0,
    );

    const efficiency =
      fuelLiters > 0 && completedDistance > 0
        ? completedDistance / fuelLiters
        : 0;

    const costPerKm =
      completedDistance > 0
        ? fuelCost / completedDistance
        : 0;

    const averageRisk =
      analysis.length > 0
        ? analysis.reduce(
            (sum, item) =>
              sum + item.riskScore,
            0,
          ) / analysis.length
        : 0;

    const averageEfficiency =
      analysis.filter(
        (item) => item.fuelEfficiency > 0,
      ).length > 0
        ? analysis
            .filter(
              (item) =>
                item.fuelEfficiency > 0,
            )
            .reduce(
              (sum, item) =>
                sum + item.fuelEfficiency,
              0,
            ) /
          analysis.filter(
            (item) =>
              item.fuelEfficiency > 0,
          ).length
        : 0;

    return {
      fuelLiters,
      fuelCost,
      completedDistance,
      completedTrips,
      totalTrips,
      efficiency,
      costPerKm,
      averageRisk,
      averageEfficiency,
    };
  }, [analysis]);

  const criticalCount = analysis.filter(
    (item) => item.riskLevel === "Critical",
  ).length;

  const highCount = analysis.filter(
    (item) => item.riskLevel === "High",
  ).length;

  const mediumCount = analysis.filter(
    (item) => item.riskLevel === "Medium",
  ).length;

  const lowCount = analysis.filter(
    (item) => item.riskLevel === "Low",
  ).length;

  const needsAttentionCount = analysis.filter(
    (item) =>
      item.performance === "Needs Attention",
  ).length;

  const highestFuelConsumer =
    [...analysis].sort(
      (a, b) => b.fuelCost - a.fuelCost,
    )[0];

  const worstEfficiency =
    [...analysis]
      .filter(
        (item) => item.fuelEfficiency > 0,
      )
      .sort(
        (a, b) =>
          a.fuelEfficiency -
          b.fuelEfficiency,
      )[0];

  const mostEfficient =
    [...analysis]
      .filter(
        (item) => item.fuelEfficiency > 0,
      )
      .sort(
        (a, b) =>
          b.fuelEfficiency -
          a.fuelEfficiency,
      )[0];

  const highestCostPerKm =
    [...analysis]
      .filter(
        (item) => item.costPerKm > 0,
      )
      .sort(
        (a, b) =>
          b.costPerKm -
          a.costPerKm,
      )[0];

  const bestPerformer =
    [...analysis]
      .filter(
        (item) =>
          item.fuelEfficiency > 0,
      )
      .sort(
        (a, b) => {
          const scoreA =
            a.efficiencyVsFleet -
            a.costPerKmVsFleet;

          const scoreB =
            b.efficiencyVsFleet -
            b.costPerKmVsFleet;

          return scoreB - scoreA;
        },
      )[0];

  const criticalVehicles = [...analysis]
    .filter(
      (item) =>
        item.riskLevel === "Critical" ||
        item.riskLevel === "High",
    )
    .sort(
      (a, b) =>
        b.riskScore -
        a.riskScore,
    );

  const insights = useMemo(() => {
    const results: string[] = [];

    if (criticalCount > 0) {
      results.push(
        `${criticalCount} vehicle${
          criticalCount === 1 ? "" : "s"
        } require immediate fuel investigation.`,
      );
    }

    if (highCount > 0) {
      results.push(
        `${highCount} vehicle${
          highCount === 1 ? "" : "s"
        } show above-normal fuel risk.`,
      );
    }

    if (
      fleetBenchmarks.fleetEfficiency > 0 &&
      worstEfficiency
    ) {
      results.push(
        `${worstEfficiency.vehicleCode} has the weakest fuel efficiency at ${formatNumber(
          worstEfficiency.fuelEfficiency,
        )} km/L, ${formatNumber(
          Math.abs(
            worstEfficiency.efficiencyVsFleet,
          ),
          1,
        )}% below the fleet benchmark.`,
      );
    }

    if (
      highestCostPerKm &&
      fleetBenchmarks.fleetCostPerKm > 0
    ) {
      results.push(
        `${highestCostPerKm.vehicleCode} has the highest fuel cost per kilometer at ${formatMoney(
          highestCostPerKm.costPerKm,
        )}.`,
      );
    }

    if (
      mostEfficient &&
      worstEfficiency &&
      mostEfficient.vehicleCode !==
        worstEfficiency.vehicleCode
    ) {
      results.push(
        `${mostEfficient.vehicleCode} is currently the strongest fuel-efficiency performer at ${formatNumber(
          mostEfficient.fuelEfficiency,
        )} km/L.`,
      );
    }

    if (needsAttentionCount === 0) {
      results.push(
        "No vehicle is currently classified as needing immediate fuel attention.",
      );
    }

    if (results.length === 0) {
      results.push(
        "Not enough fuel and trip data is available to generate detailed fleet insights.",
      );
    }

    return results;
  }, [
    criticalCount,
    highCount,
    fleetBenchmarks,
    worstEfficiency,
    highestCostPerKm,
    mostEfficient,
    needsAttentionCount,
  ]);

  function formatMoney(value: number) {
    return `${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ETB`;
  }

  function formatNumber(
    value: number,
    decimals = 2,
  ) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function formatPercent(
    value: number,
    decimals = 1,
  ) {
    return `${value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}%`;
  }

  function riskBadge(level: RiskLevel) {
    const styles: Record<
      RiskLevel,
      string
    > = {
      Critical:
        "bg-red-100 text-red-700",
      High:
        "bg-orange-100 text-orange-700",
      Medium:
        "bg-yellow-100 text-yellow-700",
      Low:
        "bg-green-100 text-green-700",
    };

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[level]}`}
      >
        {level}
      </span>
    );
  }

  function performanceBadge(
    performance: Performance,
  ) {
    const styles: Record<
      Performance,
      string
    > = {
      Excellent:
        "bg-emerald-100 text-emerald-700",
      Good:
        "bg-green-100 text-green-700",
      Average:
        "bg-slate-100 text-slate-700",
      "Needs Attention":
        "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[performance]}`}
      >
        {performance}
      </span>
    );
  }

  if (loading) {
    return (
      <ProtectedPage permission="fuelIntelligence">
        <main className="min-h-screen bg-slate-100 p-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <p className="text-slate-600">
                Loading Fuel Intelligence...
              </p>
            </div>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  if (error) {
    return (
      <ProtectedPage permission="fuelIntelligence">
        <main className="min-h-screen bg-slate-100 p-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <h1 className="text-xl font-bold text-red-700">
                Fuel Intelligence
              </h1>

              <p className="mt-2 text-red-600">
                {error}
              </p>

              <button
                onClick={loadData}
                className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage permission="fuelIntelligence">
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* HEADER */}
          <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                FLEET INTELLIGENCE
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Fuel Intelligence
              </h1>

              <p className="mt-2 max-w-3xl text-slate-500">
                Analyze fleet fuel efficiency, fuel cost
                concentration, abnormal consumption and
                vehicle-level fuel risk.
              </p>
            </div>

            <button
              onClick={loadData}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Refresh Data
            </button>
          </section>

          {/* KPI CARDS */}
          <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Fuel Cost
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {formatMoney(
                  totals.fuelCost,
                )}
              </h2>

              <p className="mt-2 text-xs text-slate-400">
                Across {analysis.length} vehicles
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Fuel Recorded
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {formatNumber(
                  totals.fuelLiters,
                )}{" "}
                L
              </h2>

              <p className="mt-2 text-xs text-slate-400">
                Recorded fuel purchases
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Operational Efficiency
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {formatNumber(
                  totals.efficiency,
                )}{" "}
                km/L
              </h2>

              <p className="mt-2 text-xs text-slate-400">
                Completed distance ÷ recorded fuel
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Fuel Cost / KM
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {formatMoney(
                  totals.costPerKm,
                )}
              </h2>

              <p className="mt-2 text-xs text-slate-400">
                Fleet fuel cost per completed kilometer
              </p>
            </div>
          </section>

          {/* BENCHMARKS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Fleet Fuel Benchmark
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Vehicle performance is compared against
                  fleet-level operational averages.
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Fleet Efficiency
                </p>

                <p className="mt-1 text-xl font-bold text-blue-700">
                  {formatNumber(
                    fleetBenchmarks.fleetEfficiency,
                  )}{" "}
                  km/L
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Fleet Efficiency
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatNumber(
                    fleetBenchmarks.fleetEfficiency,
                  )}{" "}
                  km/L
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Fleet Cost / KM
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatMoney(
                    fleetBenchmarks.fleetCostPerKm,
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Average Vehicle Efficiency
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatNumber(
                    fleetBenchmarks.averageVehicleEfficiency,
                  )}{" "}
                  km/L
                </p>
              </div>
            </div>
          </section>

          {/* RISK SUMMARY */}
          <section>
            <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-end">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Fuel Risk Summary
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Vehicles are scored using fleet-relative
                  efficiency, cost and data-quality signals.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Critical Risk
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {criticalCount}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Immediate investigation recommended
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  High Risk
                </p>

                <p className="mt-2 text-3xl font-bold text-orange-600">
                  {highCount}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Requires management attention
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Medium Risk
                </p>

                <p className="mt-2 text-3xl font-bold text-yellow-600">
                  {mediumCount}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Monitor performance
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Low Risk
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  {lowCount}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Normal fuel performance
                </p>
              </div>
            </div>
          </section>

          {/* INTELLIGENCE HIGHLIGHTS */}
          <section className="grid gap-6 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Highest Fuel Consumer
              </p>

              {highestFuelConsumer ? (
                <>
                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    {highestFuelConsumer.vehicleCode}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {formatMoney(
                      highestFuelConsumer.fuelCost,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatNumber(
                      highestFuelConsumer.fuelLiters,
                    )}{" "}
                    liters
                  </p>

                  <div className="mt-4">
                    {riskBadge(
                      highestFuelConsumer.riskLevel,
                    )}
                  </div>
                </>
              ) : (
                <p className="mt-3 text-slate-400">
                  No fuel data available.
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Worst Efficiency
              </p>

              {worstEfficiency ? (
                <>
                  <h3 className="mt-3 text-xl font-bold text-red-600">
                    {worstEfficiency.vehicleCode}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {formatNumber(
                      worstEfficiency.fuelEfficiency,
                    )}{" "}
                    km/L
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatPercent(
                      Math.abs(
                        worstEfficiency.efficiencyVsFleet,
                      ),
                      1,
                    )}{" "}
                    below fleet average
                  </p>
                </>
              ) : (
                <p className="mt-3 text-slate-400">
                  No efficiency data available.
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Most Efficient Vehicle
              </p>

              {mostEfficient ? (
                <>
                  <h3 className="mt-3 text-xl font-bold text-green-600">
                    {mostEfficient.vehicleCode}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {formatNumber(
                      mostEfficient.fuelEfficiency,
                    )}{" "}
                    km/L
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatPercent(
                      mostEfficient.efficiencyVsFleet,
                      1,
                    )}{" "}
                    vs fleet
                  </p>
                </>
              ) : (
                <p className="mt-3 text-slate-400">
                  No efficiency data available.
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Highest Cost / KM
              </p>

              {highestCostPerKm ? (
                <>
                  <h3 className="mt-3 text-xl font-bold text-orange-600">
                    {highestCostPerKm.vehicleCode}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {formatMoney(
                      highestCostPerKm.costPerKm,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatPercent(
                      highestCostPerKm.costPerKmVsFleet,
                      1,
                    )}{" "}
                    vs fleet
                  </p>
                </>
              ) : (
                <p className="mt-3 text-slate-400">
                  No cost-per-km data available.
                </p>
              )}
            </div>
          </section>

          {/* VEHICLE ANALYSIS TABLE */}
          <section className="rounded-2xl bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">
                Vehicle Fuel Analysis
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Fleet-relative analysis of fuel consumption,
                efficiency and cost performance.
              </p>
            </div>

            {analysis.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No vehicles found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px] text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Vehicle
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Trips
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Fuel
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Distance
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Efficiency
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Vs Fleet
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Cost / KM
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Performance
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Risk
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {[...analysis]
                      .sort(
                        (a, b) =>
                          b.riskScore -
                          a.riskScore,
                      )
                      .map((item) => (
                        <tr
                          key={item.vehicleCode}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">
                              {item.vehicleCode}
                            </div>

                            <div className="text-xs text-slate-400">
                              {item.vehicleType} •{" "}
                              {item.status}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-700">
                              {item.completedTrips}
                            </div>

                            <div className="text-xs text-slate-400">
                              {item.totalTrips} total
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-700">
                              {formatNumber(
                                item.fuelLiters,
                              )}{" "}
                              L
                            </div>

                            <div className="text-xs text-slate-400">
                              {formatMoney(
                                item.fuelCost,
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-700">
                              {formatNumber(
                                item.completedDistance,
                                0,
                              )}{" "}
                              km
                            </div>

                            <div className="text-xs text-slate-400">
                              Completed trips
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`text-sm font-semibold ${
                                item.fuelEfficiency >
                                  0 &&
                                fleetBenchmarks.fleetEfficiency >
                                  0 &&
                                item.fuelEfficiency <
                                  fleetBenchmarks.fleetEfficiency *
                                    0.7
                                  ? "text-red-600"
                                  : item.fuelEfficiency <
                                      fleetBenchmarks.fleetEfficiency
                                    ? "text-yellow-600"
                                    : "text-green-600"
                              }`}
                            >
                              {item.fuelEfficiency >
                              0
                                ? `${formatNumber(
                                    item.fuelEfficiency,
                                  )} km/L`
                                : "N/A"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            {item.fuelEfficiency >
                            0 ? (
                              <span
                                className={`text-sm font-semibold ${
                                  item.efficiencyVsFleet <
                                  -15
                                    ? "text-red-600"
                                    : item.efficiencyVsFleet <
                                        0
                                      ? "text-yellow-600"
                                      : "text-green-600"
                                }`}
                              >
                                {item.efficiencyVsFleet >=
                                0
                                  ? "+"
                                  : ""}
                                {formatPercent(
                                  item.efficiencyVsFleet,
                                )}
                              </span>
                            ) : (
                              <span className="text-sm text-slate-400">
                                N/A
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-700">
                              {item.costPerKm >
                              0
                                ? formatMoney(
                                    item.costPerKm,
                                  )
                                : "N/A"}
                            </div>

                            {item.costPerKm >
                              0 && (
                              <div
                                className={`text-xs ${
                                  item.costPerKmVsFleet >=
                                  20
                                    ? "text-red-500"
                                    : "text-slate-400"
                                }`}
                              >
                                {item.costPerKmVsFleet >=
                                0
                                  ? "+"
                                  : ""}
                                {formatPercent(
                                  item.costPerKmVsFleet,
                                )}{" "}
                                vs fleet
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {performanceBadge(
                              item.performance,
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-col items-start gap-2">
                              {riskBadge(
                                item.riskLevel,
                              )}

                              <span className="text-xs text-slate-400">
                                {item.riskScore}
                                /100
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

          {/* MANAGEMENT INSIGHTS */}
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Automated Fuel Insights
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                FleetFlow converts operational fuel data into
                management-level signals.
              </p>

              <div className="mt-6 space-y-3">
                {insights.map(
                  (insight, index) => (
                    <div
                      key={`${insight}-${index}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                          {index + 1}
                        </span>

                        <p className="text-sm leading-6 text-slate-700">
                          {insight}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                MANAGEMENT ACTION
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Fuel Optimization Priorities
              </h2>

              <div className="mt-6 space-y-4">
                {criticalVehicles.length >
                0 ? (
                  criticalVehicles
                    .slice(0, 4)
                    .map((item) => (
                      <div
                        key={item.vehicleCode}
                        className="rounded-xl bg-white/10 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold">
                            {item.vehicleCode}
                          </span>

                          {riskBadge(
                            item.riskLevel,
                          )}
                        </div>

                        <p className="mt-2 text-sm text-slate-300">
                          {item.recommendations[0]}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className="rounded-xl bg-white/10 p-5">
                    <p className="font-semibold">
                      No immediate fuel intervention required.
                    </p>

                    <p className="mt-2 text-sm text-slate-300">
                      Continue monitoring fuel efficiency,
                      cost per kilometer and fuel-record
                      completeness.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* RISK DETAILS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Fuel Risk Detection
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Detailed reasons behind high-risk fuel
                  classifications.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">
                  Average Risk Score
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {formatNumber(
                    totals.averageRisk,
                    0,
                  )}
                  /100
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {criticalVehicles.map(
                (item) => (
                  <div
                    key={item.vehicleCode}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {item.vehicleCode}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Risk score{" "}
                          {item.riskScore}
                          /100
                        </p>
                      </div>

                      {riskBadge(
                        item.riskLevel,
                      )}
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Detected signals
                      </p>

                      <ul className="mt-2 space-y-2">
                        {item.reasons.map(
                          (reason) => (
                            <li
                              key={reason}
                              className="text-sm text-slate-600"
                            >
                              • {reason}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>

                    <div className="mt-4 rounded-lg bg-blue-50 p-3">
                      <p className="text-xs font-semibold text-blue-700">
                        Recommended action
                      </p>

                      <p className="mt-1 text-sm text-blue-800">
                        {
                          item
                            .recommendations[0]
                        }
                      </p>
                    </div>
                  </div>
                ),
              )}

              {criticalVehicles.length ===
                0 && (
                <div className="rounded-xl bg-green-50 p-5 text-sm text-green-700 md:col-span-2">
                  No high-risk fuel issues detected.
                  Fleet fuel performance is currently
                  within the monitored range.
                </div>
              )}
            </div>
          </section>

          {/* DATA QUALITY NOTE */}
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg">
                !
              </div>

              <div>
                <h2 className="font-bold text-amber-900">
                  Fuel Intelligence Data Note
                </h2>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  FleetFlow currently analyzes fuel purchase
                  records against completed-trip distance.
                  This provides a useful management signal,
                  but it is not the same as trip-level fuel
                  consumption. For the most accurate future
                  efficiency analysis, fuel usage should be
                  recorded directly against individual trips.
                </p>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="rounded-2xl bg-slate-900 p-8 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              FLEETFLOW INTELLIGENCE
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              How Fuel Intelligence Works
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-4">
              <div>
                <p className="text-lg font-bold">
                  01
                </p>

                <h3 className="mt-2 font-semibold">
                  Collect Data
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  FleetFlow collects vehicle, trip and fuel
                  records.
                </p>
              </div>

              <div>
                <p className="text-lg font-bold">
                  02
                </p>

                <h3 className="mt-2 font-semibold">
                  Build Benchmarks
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Fleet-level efficiency and fuel-cost
                  benchmarks are calculated.
                </p>
              </div>

              <div>
                <p className="text-lg font-bold">
                  03
                </p>

                <h3 className="mt-2 font-semibold">
                  Detect Risk
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Vehicles performing significantly below
                  fleet benchmarks receive risk scores.
                </p>
              </div>

              <div>
                <p className="text-lg font-bold">
                  04
                </p>

                <h3 className="mt-2 font-semibold">
                  Recommend Action
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Managers receive prioritized vehicles and
                  recommended fuel-optimization actions.
                </p>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <div className="pb-4 text-center text-xs text-slate-400">
            FleetFlow Fuel Intelligence • Fleet benchmarking,
            fuel risk detection and optimization
          </div>
        </div>
      </main>
    </ProtectedPage>
  );
}
