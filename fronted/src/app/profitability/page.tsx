"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedPage from "@/app/components/ProtectedPage";

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
  cost?: number | string;
}

interface Maintenance {
  id: number;
  vehicleCode?: string;
  cost?: number | string;
}

interface Expense {
  id: number;
  vehicleCode?: string;
  amount?: number | string;
}

type ProfitabilityLevel =
  | "Excellent"
  | "Good"
  | "Average"
  | "Needs Attention"
  | "Loss Making";

interface VehicleProfitability {
  vehicleCode: string;
  status: string;
  trips: number;
  completedTrips: number;
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
  profitPerKm: number;
  fuelShare: number;
  maintenanceShare: number;
  breakEvenRevenue: number;
  profitabilityLevel: ProfitabilityLevel;
  reasons: string[];
  recommendations: string[];
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isCompletedTrip(
  trip: Trip
): boolean {
  const status = String(
    trip.status || ""
  ).toLowerCase();

  return [
    "completed",
    "complete",
    "delivered",
    "closed",
    "finished",
  ].includes(status);
}

function money(value: number): string {
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} ETB`;
}

function number(
  value: number,
  decimals = 2
): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function percent(value: number): string {
  return `${number(value, 1)}%`;
}

export default function ProfitabilityPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(
    []
  );

  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuel, setFuel] = useState<Fuel[]>([]);
  const [maintenance, setMaintenance] =
    useState<Maintenance[]>([]);
  const [expenses, setExpenses] =
    useState<Expense[]>([]);

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

      setVehicles(
        Array.isArray(vehiclesData)
          ? vehiclesData
          : []
      );

      setTrips(
        Array.isArray(tripsData)
          ? tripsData
          : []
      );

      setFuel(
        Array.isArray(fuelData)
          ? fuelData
          : []
      );

      setMaintenance(
        Array.isArray(maintenanceData)
          ? maintenanceData
          : []
      );

      setExpenses(
        Array.isArray(expensesData)
          ? expensesData
          : []
      );
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Could not load profitability data. Make sure the backend is running on port 3001."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const profitability = useMemo<
    VehicleProfitability[]
  >(() => {
    const raw = vehicles.map((vehicle) => {
      const vehicleCode =
        vehicle.vehicleCode ||
        vehicle.plateNumber ||
        `Vehicle-${vehicle.id}`;

      const vehicleTrips = trips.filter(
        (trip) =>
          trip.vehicleCode === vehicleCode
      );

      const completedTrips =
        vehicleTrips.filter(isCompletedTrip);

      const vehicleFuel = fuel.filter(
        (item) =>
          item.vehicleCode === vehicleCode
      );

      const vehicleMaintenance =
        maintenance.filter(
          (item) =>
            item.vehicleCode === vehicleCode
        );

      const vehicleExpenses =
        expenses.filter(
          (item) =>
            item.vehicleCode === vehicleCode
        );

      /*
       * Completed trips are used for operational
       * revenue and distance analysis.
       */
      const revenue =
        completedTrips.reduce(
          (sum, trip) =>
            sum + toNumber(trip.revenue),
          0
        );

      const distance =
        completedTrips.reduce(
          (sum, trip) =>
            sum + toNumber(trip.distance),
          0
        );

      const fuelCost =
        vehicleFuel.reduce(
          (sum, item) =>
            sum + toNumber(item.cost),
          0
        );

      const maintenanceCost =
        vehicleMaintenance.reduce(
          (sum, item) =>
            sum + toNumber(item.cost),
          0
        );

      const otherExpenses =
        vehicleExpenses.reduce(
          (sum, item) =>
            sum + toNumber(item.amount),
          0
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

      const fuelShare =
        totalCost > 0
          ? (fuelCost / totalCost) * 100
          : 0;

      const maintenanceShare =
        totalCost > 0
          ? (maintenanceCost / totalCost) *
            100
          : 0;

      /*
       * Break-even revenue is equal to the
       * operating cost currently recorded.
       */
      const breakEvenRevenue =
        totalCost;

      return {
        vehicleCode,
        status:
          vehicle.status || "Unknown",
        trips: vehicleTrips.length,
        completedTrips:
          completedTrips.length,
        distance,
        revenue,
        fuelCost,
        maintenanceCost,
        otherExpenses,
        totalCost,
        profit,
        margin,
        revenuePerKm,
        costPerKm,
        profitPerKm,
        fuelShare,
        maintenanceShare,
        breakEvenRevenue,
        profitabilityLevel:
          "Average" as ProfitabilityLevel,
        reasons: [],
        recommendations: [],
      };
    });

    /*
     * Fleet benchmarks.
     */
    const totalRevenue =
      raw.reduce(
        (sum, item) =>
          sum + item.revenue,
        0
      );

    const totalCost =
      raw.reduce(
        (sum, item) =>
          sum + item.totalCost,
        0
      );

    const totalDistance =
      raw.reduce(
        (sum, item) =>
          sum + item.distance,
        0
      );

    const averageProfit =
      raw.length > 0
        ? raw.reduce(
            (sum, item) =>
              sum + item.profit,
            0
          ) / raw.length
        : 0;

    const fleetRevenuePerKm =
      totalDistance > 0
        ? totalRevenue /
          totalDistance
        : 0;

    const fleetCostPerKm =
      totalDistance > 0
        ? totalCost /
          totalDistance
        : 0;

    const fleetMargin =
      totalRevenue > 0
        ? ((totalRevenue - totalCost) /
            totalRevenue) *
          100
        : 0;

    return raw
      .map((item) => {
        const reasons: string[] = [];
        const recommendations: string[] =
          [];

        /*
         * PROFITABILITY
         */
        if (item.profit < 0) {
          reasons.push(
            "Operating costs exceed recorded revenue"
          );

          recommendations.push(
            "Review pricing, trip utilization and vehicle operating costs."
          );
        } else if (
          item.profit <
          averageProfit
        ) {
          reasons.push(
            "Profit is below the current fleet average"
          );

          recommendations.push(
            "Investigate whether the vehicle can generate more revenue or operate at lower cost."
          );
        }

        /*
         * MARGIN
         */
        if (
          item.revenue > 0 &&
          item.margin < 10
        ) {
          reasons.push(
            "Low operating profit margin"
          );

          recommendations.push(
            "Review trip pricing and variable operating costs."
          );
        } else if (
          item.revenue > 0 &&
          item.margin >= 25
        ) {
          reasons.push(
            "Strong operating margin"
          );
        }

        /*
         * REVENUE PER KM
         */
        if (
          item.distance > 0 &&
          fleetRevenuePerKm > 0 &&
          item.revenuePerKm <
            fleetRevenuePerKm * 0.75
        ) {
          reasons.push(
            "Revenue per kilometer is significantly below the fleet benchmark"
          );

          recommendations.push(
            "Review route pricing, load utilization and trip selection."
          );
        }

        /*
         * COST PER KM
         */
        if (
          item.distance > 0 &&
          fleetCostPerKm > 0 &&
          item.costPerKm >
            fleetCostPerKm * 1.5
        ) {
          reasons.push(
            "Cost per kilometer is significantly above the fleet benchmark"
          );

          recommendations.push(
            "Investigate fuel, maintenance and other operating expenses."
          );
        }

        /*
         * FUEL CONCENTRATION
         */
        if (
          item.fuelShare >= 50
        ) {
          reasons.push(
            "Fuel represents more than half of recorded operating costs"
          );

          recommendations.push(
            "Investigate fuel efficiency, route selection and fuel purchasing."
          );
        }

        /*
         * MAINTENANCE CONCENTRATION
         */
        if (
          item.maintenanceShare >=
          30
        ) {
          reasons.push(
            "Maintenance represents a significant share of operating cost"
          );

          recommendations.push(
            "Review maintenance frequency and recurring repair costs."
          );
        }

        /*
         * NO REVENUE
         */
        if (
          item.revenue === 0 &&
          item.totalCost > 0
        ) {
          reasons.push(
            "Costs have been recorded without corresponding revenue"
          );

          recommendations.push(
            "Investigate vehicle utilization and unproductive operating periods."
          );
        }

        /*
         * NO DISTANCE
         */
        if (
          item.distance === 0 &&
          item.revenue > 0
        ) {
          reasons.push(
            "Revenue exists without recorded trip distance"
          );

          recommendations.push(
            "Ensure trip distance is captured for accurate profitability analysis."
          );
        }

        /*
         * PROFITABILITY LEVEL
         */
        let profitabilityLevel:
          ProfitabilityLevel =
          "Average";

        if (
          item.profit < 0
        ) {
          profitabilityLevel =
            "Loss Making";
        } else if (
          item.margin >= 25 &&
          item.profit >=
            averageProfit
        ) {
          profitabilityLevel =
            "Excellent";
        } else if (
          item.margin >= 15
        ) {
          profitabilityLevel =
            "Good";
        } else if (
          item.margin < 10
        ) {
          profitabilityLevel =
            "Needs Attention";
        }

        if (
          reasons.length === 0
        ) {
          reasons.push(
            "Financial performance is within normal fleet patterns"
          );
        }

        if (
          recommendations.length ===
          0
        ) {
          recommendations.push(
            "Continue monitoring revenue, cost and margin performance."
          );
        }

        return {
          ...item,
          profitabilityLevel,
          reasons,
          recommendations,
        };
      })
      .sort(
        (a, b) =>
          b.profit - a.profit
      );
  }, [
    vehicles,
    trips,
    fuel,
    maintenance,
    expenses,
  ]);

  const summary = useMemo(() => {
    const revenue =
      profitability.reduce(
        (sum, item) =>
          sum + item.revenue,
        0
      );

    const totalCost =
      profitability.reduce(
        (sum, item) =>
          sum + item.totalCost,
        0
      );

    const profit =
      revenue - totalCost;

    const margin =
      revenue > 0
        ? (profit / revenue) *
          100
        : 0;

    const distance =
      profitability.reduce(
        (sum, item) =>
          sum + item.distance,
        0
      );

    const completedTrips =
      profitability.reduce(
        (sum, item) =>
          sum +
          item.completedTrips,
        0
      );

    const profitableVehicles =
      profitability.filter(
        (item) =>
          item.profit > 0
      ).length;

    const lossMakingVehicles =
      profitability.filter(
        (item) =>
          item.profit < 0
      ).length;

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

    return {
      revenue,
      totalCost,
      profit,
      margin,
      distance,
      completedTrips,
      profitableVehicles,
      lossMakingVehicles,
      revenuePerKm,
      costPerKm,
      profitPerKm,
    };
  }, [profitability]);

  const costBreakdown =
    useMemo(() => {
      const fuelCost =
        profitability.reduce(
          (sum, item) =>
            sum + item.fuelCost,
          0
        );

      const maintenanceCost =
        profitability.reduce(
          (sum, item) =>
            sum +
            item.maintenanceCost,
          0
        );

      const otherExpenses =
        profitability.reduce(
          (sum, item) =>
            sum +
            item.otherExpenses,
          0
        );

      return {
        fuelCost,
        maintenanceCost,
        otherExpenses,
      };
    }, [profitability]);

  const topProfitVehicle =
    [...profitability].sort(
      (a, b) =>
        b.profit - a.profit
    )[0];

  const highestMarginVehicle =
    [...profitability].sort(
      (a, b) =>
        b.margin - a.margin
    )[0];

  const worstVehicle =
    [...profitability].sort(
      (a, b) =>
        a.profit - b.profit
    )[0];

  const highestCostVehicle =
    [...profitability].sort(
      (a, b) =>
        b.costPerKm -
        a.costPerKm
    )[0];

  const managementInsights =
    useMemo(() => {
      const insights: string[] =
        [];

      if (
        summary.lossMakingVehicles >
        0
      ) {
        insights.push(
          `${summary.lossMakingVehicles} vehicle(s) are currently loss-making and should be reviewed.`
        );
      }

      if (
        topProfitVehicle
      ) {
        insights.push(
          `${topProfitVehicle.vehicleCode} generates the highest operating profit at ${money(
            topProfitVehicle.profit
          )}.`
        );
      }

      if (
        highestMarginVehicle
      ) {
        insights.push(
          `${highestMarginVehicle.vehicleCode} has the strongest profit margin at ${percent(
            highestMarginVehicle.margin
          )}.`
        );
      }

      if (
        highestCostVehicle &&
        highestCostVehicle.costPerKm >
          0
      ) {
        insights.push(
          `${highestCostVehicle.vehicleCode} has the highest operating cost per kilometer at ${money(
            highestCostVehicle.costPerKm
          )}/km.`
        );
      }

      const fuelPercentage =
        summary.totalCost > 0
          ? (costBreakdown.fuelCost /
              summary.totalCost) *
            100
          : 0;

      if (
        fuelPercentage >= 40
      ) {
        insights.push(
          `Fuel represents ${percent(
            fuelPercentage
          )} of fleet operating costs, making fuel control a major profitability lever.`
        );
      }

      if (
        summary.profit < 0
      ) {
        insights.push(
          "The fleet is currently operating at an overall loss and management should prioritize cost control and revenue improvement."
        );
      } else {
        insights.push(
          "The fleet is currently profitable, but vehicle-level differences should be monitored to protect the overall margin."
        );
      }

      return insights;
    }, [
      summary,
      topProfitVehicle,
      highestMarginVehicle,
      highestCostVehicle,
      costBreakdown,
    ]);

  function levelBadge(
    level: ProfitabilityLevel
  ) {
    const styles: Record<
      ProfitabilityLevel,
      string
    > = {
      Excellent:
        "bg-emerald-100 text-emerald-700",
      Good:
        "bg-blue-100 text-blue-700",
      Average:
        "bg-slate-100 text-slate-700",
      "Needs Attention":
        "bg-orange-100 text-orange-700",
      "Loss Making":
        "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[level]}`}
      >
        {level}
      </span>
    );
  }

  function profitColor(
    value: number
  ) {
    return value >= 0
      ? "text-emerald-600"
      : "text-red-600";
  }

  if (loading) {
    return (
      <ProtectedPage permission="profitability">
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-slate-600">
                Loading Profitability Intelligence...
              </p>
            </div>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage permission="profitability">
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">

          {/* HEADER */}
          <section className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
                FLEET INTELLIGENCE
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Profitability Intelligence
              </h1>

              <p className="mt-2 max-w-3xl text-slate-500">
                Understand which vehicles generate value,
                which consume it, and the operational factors
                driving fleet profitability.
              </p>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading
                ? "Refreshing..."
                : "Refresh Data"}
            </button>
          </section>

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* KPI CARDS */}
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total Revenue
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {money(summary.revenue)}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Completed-trip revenue
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Operating Cost
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {money(summary.totalCost)}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Fuel + maintenance + expenses
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Fleet Profit / Loss
              </p>

              <p
                className={`mt-2 text-2xl font-bold sm:text-3xl ${profitColor(
                  summary.profit
                )}`}
              >
                {money(summary.profit)}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Revenue minus operating costs
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Profit Margin
              </p>

              <p
                className={`mt-2 text-2xl font-bold sm:text-3xl ${profitColor(
                  summary.margin
                )}`}
              >
                {percent(summary.margin)}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Fleet-wide operating margin
              </p>
            </div>
          </section>

          {/* OPERATIONAL METRICS */}
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Revenue / km
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {money(
                  summary.revenuePerKm
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Cost / km
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {money(
                  summary.costPerKm
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Profit / km
              </p>

              <p
                className={`mt-2 text-xl font-bold ${profitColor(
                  summary.profitPerKm
                )}`}
              >
                {money(
                  summary.profitPerKm
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Completed Trips
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {number(
                  summary.completedTrips,
                  0
                )}
              </p>
            </div>
          </section>

          {/* VEHICLE STATUS */}
          <section className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <p className="text-sm font-medium text-emerald-700">
                Profitable Vehicles
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-700">
                {
                  summary.profitableVehicles
                }
              </p>

              <p className="mt-1 text-sm text-emerald-600">
                Vehicles currently generating a positive
                operating result.
              </p>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-medium text-red-700">
                Loss-Making Vehicles
              </p>

              <p className="mt-2 text-3xl font-bold text-red-700">
                {
                  summary.lossMakingVehicles
                }
              </p>

              <p className="mt-1 text-sm text-red-600">
                Vehicles whose recorded operating costs
                exceed revenue.
              </p>
            </div>
          </section>

          {/* HIGHLIGHTS */}
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Highest Profit
              </p>

              {topProfitVehicle ? (
                <>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {
                      topProfitVehicle.vehicleCode
                    }
                  </h2>

                  <p className="mt-2 text-3xl font-bold text-emerald-600">
                    {money(
                      topProfitVehicle.profit
                    )}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Highest operating profit
                  </p>

                  <div className="mt-5">
                    {levelBadge(
                      topProfitVehicle.profitabilityLevel
                    )}
                  </div>
                </>
              ) : (
                <p className="mt-6 text-slate-500">
                  No vehicle data available.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Highest Margin
              </p>

              {highestMarginVehicle ? (
                <>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {
                      highestMarginVehicle.vehicleCode
                    }
                  </h2>

                  <p className="mt-2 text-3xl font-bold text-blue-600">
                    {percent(
                      highestMarginVehicle.margin
                    )}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Strongest revenue-to-cost conversion
                  </p>
                </>
              ) : (
                <p className="mt-6 text-slate-500">
                  No vehicle data available.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                Needs Attention
              </p>

              {worstVehicle ? (
                <>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {worstVehicle.vehicleCode}
                  </h2>

                  <p className="mt-2 text-3xl font-bold text-red-600">
                    {money(
                      worstVehicle.profit
                    )}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Weakest operating result
                  </p>

                  <div className="mt-5">
                    {levelBadge(
                      worstVehicle.profitabilityLevel
                    )}
                  </div>
                </>
              ) : (
                <p className="mt-6 text-slate-500">
                  No vehicle data available.
                </p>
              )}
            </div>
          </section>

          {/* MANAGEMENT INSIGHTS */}
          <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              DECISION SUPPORT
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Management Insights
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              FleetFlow identifies the financial signals that
              deserve management attention.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {managementInsights.map(
                (insight) => (
                  <div
                    key={insight}
                    className="rounded-xl bg-white p-5 shadow-sm"
                  >
                    <p className="text-sm leading-6 text-slate-600">
                      {insight}
                    </p>
                  </div>
                )
              )}
            </div>
          </section>

          {/* PROFITABILITY TABLE */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Vehicle Profitability
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Vehicles ranked by operating profit. Revenue and
                distance use completed trips while operating costs
                come from recorded fuel, maintenance and expenses.
              </p>
            </div>

            {profitability.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                No vehicle data available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1450px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
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
                        Total Cost
                      </th>

                      <th className="px-4 py-3">
                        Profit / Loss
                      </th>

                      <th className="px-4 py-3">
                        Margin
                      </th>

                      <th className="px-4 py-3">
                        Revenue / km
                      </th>

                      <th className="px-4 py-3">
                        Cost / km
                      </th>

                      <th className="px-4 py-3">
                        Performance
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {profitability.map(
                      (item) => (
                        <tr
                          key={
                            item.vehicleCode
                          }
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                        >
                          <td className="px-4 py-4">
                            <p className="font-semibold text-slate-900">
                              {
                                item.vehicleCode
                              }
                            </p>

                            <p className="text-xs text-slate-400">
                              {item.status}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-slate-600">
                            {
                              item.completedTrips
                            }
                          </td>

                          <td className="px-4 py-4 font-medium text-slate-700">
                            {money(
                              item.revenue
                            )}
                          </td>

                          <td className="px-4 py-4 font-medium text-slate-700">
                            {money(
                              item.totalCost
                            )}
                          </td>

                          <td
                            className={`px-4 py-4 font-bold ${profitColor(
                              item.profit
                            )}`}
                          >
                            {money(
                              item.profit
                            )}
                          </td>

                          <td
                            className={`px-4 py-4 font-semibold ${profitColor(
                              item.margin
                            )}`}
                          >
                            {percent(
                              item.margin
                            )}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {money(
                              item.revenuePerKm
                            )}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {money(
                              item.costPerKm
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {levelBadge(
                              item.profitabilityLevel
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* COST STRUCTURE */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                COST INTELLIGENCE
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Fleet Cost Structure
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Understanding where operating money is being
                spent.
              </p>
            </div>

            <div className="space-y-5">
              {[
                {
                  label: "Fuel",
                  value:
                    costBreakdown.fuelCost,
                },
                {
                  label: "Maintenance",
                  value:
                    costBreakdown.maintenanceCost,
                },
                {
                  label: "Other Expenses",
                  value:
                    costBreakdown.otherExpenses,
                },
              ].map((item) => {
                const percentage =
                  summary.totalCost >
                  0
                    ? (item.value /
                        summary.totalCost) *
                      100
                    : 0;

                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-slate-700">
                        {item.label}
                      </span>

                      <span className="text-right text-sm font-semibold text-slate-900">
                        {money(item.value)}{" "}
                        <span className="text-slate-400">
                          (
                          {percent(
                            percentage
                          )}
                          )
                        </span>
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Math.min(
                            percentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* PRIORITY ACTIONS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              PRIORITY ACTIONS
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Vehicles Requiring Attention
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Financial reasons and recommended actions for
              underperforming vehicles.
            </p>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {profitability
                .filter(
                  (item) =>
                    item.profitabilityLevel ===
                      "Loss Making" ||
                    item.profitabilityLevel ===
                      "Needs Attention"
                )
                .sort(
                  (a, b) =>
                    a.profit - b.profit
                )
                .map((item) => (
                  <div
                    key={item.vehicleCode}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {
                            item.vehicleCode
                          }
                        </h3>

                        <p
                          className={`mt-1 text-sm font-semibold ${profitColor(
                            item.profit
                          )}`}
                        >
                          {money(
                            item.profit
                          )}
                        </p>
                      </div>

                      {levelBadge(
                        item.profitabilityLevel
                      )}
                    </div>

                    <div className="mt-5">
                      <p className="text-sm font-semibold text-slate-700">
                        Financial signals
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
                          )
                        )}
                      </ul>
                    </div>

                    <div className="mt-5 rounded-lg bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Recommended Actions
                      </p>

                      <ul className="mt-2 space-y-2">
                        {item.recommendations.map(
                          (recommendation) => (
                            <li
                              key={
                                recommendation
                              }
                              className="text-sm font-medium text-slate-700"
                            >
                              •{" "}
                              {
                                recommendation
                              }
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                ))}

              {profitability.filter(
                (item) =>
                  item.profitabilityLevel ===
                    "Loss Making" ||
                  item.profitabilityLevel ===
                    "Needs Attention"
              ).length === 0 && (
                <div className="rounded-xl bg-emerald-50 p-6 text-sm text-emerald-700 lg:col-span-2">
                  No vehicles currently require urgent
                  profitability intervention.
                </div>
              )}
            </div>
          </section>

          {/* DATA / MODEL NOTE */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              DATA & MODEL NOTE
            </p>

            <h2 className="mt-2 text-lg font-bold text-slate-900">
              How FleetFlow calculates profitability
            </h2>

            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">
              Revenue and distance are calculated from completed
              trips. Operating costs come from recorded fuel,
              maintenance and vehicle-associated expenses.
              Vehicle performance is then compared against
              current fleet benchmarks such as revenue per
              kilometer and cost per kilometer.
            </p>

            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-500">
              This is an operational profitability model rather
              than full accounting profit. Corporate overhead,
              depreciation, financing costs and other
              non-vehicle costs are not included unless they are
              recorded in FleetFlow's vehicle expense data.
            </p>
          </section>

          {/* INTELLIGENCE METHOD */}
          <section className="rounded-2xl bg-slate-900 p-8 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
              FLEETFLOW INTELLIGENCE
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              How Profitability Intelligence Works
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-4">
              <div>
                <p className="text-lg font-bold">
                  01
                </p>

                <h3 className="mt-2 font-semibold">
                  Measure Revenue
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Completed trip revenue establishes the
                  vehicle's productive output.
                </p>
              </div>

              <div>
                <p className="text-lg font-bold">
                  02
                </p>

                <h3 className="mt-2 font-semibold">
                  Measure Costs
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Fuel, maintenance and vehicle expenses are
                  combined into operating cost.
                </p>
              </div>

              <div>
                <p className="text-lg font-bold">
                  03
                </p>

                <h3 className="mt-2 font-semibold">
                  Benchmark Performance
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Revenue/km and cost/km reveal which vehicles
                  outperform or underperform the fleet.
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
                  Management receives clear signals for pricing,
                  utilization and cost-control decisions.
                </p>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="pb-4 text-center text-xs text-slate-400">
            FleetFlow Intelligence • Vehicle profitability,
            cost efficiency and decision support
          </footer>
        </div>
      </main>
    </ProtectedPage>
  );
}
