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

interface VehicleProfitability {
  vehicleCode: string;
  trips: number;
  revenue: number;
  fuelCost: number;
  maintenanceCost: number;
  otherExpenses: number;
  totalCost: number;
  profit: number;
  margin: number;
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ProfitabilityPage() {
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
        throw new Error("Failed to load profitability data.");
      }

      const [
        vehiclesData,
        tripsData,
        fuelData,
        maintenanceData,
        expensesData,
      ] = await Promise.all(
        responses.map((response) => response.json()),
      );

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
        "Could not load profitability data. Make sure the backend is running on port 3001.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const profitability = useMemo<VehicleProfitability[]>(() => {
    return vehicles
      .map((vehicle) => {
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

        const revenue = vehicleTrips.reduce(
          (sum, trip) => sum + toNumber(trip.revenue),
          0,
        );

        const fuelCost = vehicleFuel.reduce(
          (sum, item) => sum + toNumber(item.cost),
          0,
        );

        const maintenanceCost = vehicleMaintenance.reduce(
          (sum, item) => sum + toNumber(item.cost),
          0,
        );

        const otherExpenses = vehicleExpenses.reduce(
          (sum, item) => sum + toNumber(item.amount),
          0,
        );

        const totalCost =
          fuelCost + maintenanceCost + otherExpenses;

        const profit = revenue - totalCost;

        const margin =
          revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
          vehicleCode,
          trips: vehicleTrips.length,
          revenue,
          fuelCost,
          maintenanceCost,
          otherExpenses,
          totalCost,
          profit,
          margin,
        };
      })
      .sort((a, b) => b.profit - a.profit);
  }, [vehicles, trips, fuel, maintenance, expenses]);

  const summary = useMemo(() => {
    const revenue = profitability.reduce(
      (sum, item) => sum + item.revenue,
      0,
    );

    const totalCost = profitability.reduce(
      (sum, item) => sum + item.totalCost,
      0,
    );

    const profit = revenue - totalCost;

    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    const profitableVehicles = profitability.filter(
      (item) => item.profit > 0,
    ).length;

    const lossMakingVehicles = profitability.filter(
      (item) => item.profit < 0,
    ).length;

    return {
      revenue,
      totalCost,
      profit,
      margin,
      profitableVehicles,
      lossMakingVehicles,
    };
  }, [profitability]);

  const topVehicle = profitability[0];

  const worstVehicle =
    [...profitability].sort((a, b) => a.profit - b.profit)[0];

  const costBreakdown = useMemo(() => {
    const fuelCost = profitability.reduce(
      (sum, item) => sum + item.fuelCost,
      0,
    );

    const maintenanceCost = profitability.reduce(
      (sum, item) => sum + item.maintenanceCost,
      0,
    );

    const otherExpenses = profitability.reduce(
      (sum, item) => sum + item.otherExpenses,
      0,
    );

    return {
      fuelCost,
      maintenanceCost,
      otherExpenses,
    };
  }, [profitability]);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Fleet Intelligence
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Profitability Intelligence
            </h1>

            <p className="mt-2 text-slate-500">
              Understand which vehicles generate value and which ones
              consume it.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
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

        {/* KPI Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Revenue
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatMoney(summary.revenue)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Across all vehicles
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Operating Cost
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatMoney(summary.totalCost)}
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
              className={`mt-2 text-3xl font-bold ${
                summary.profit >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {formatMoney(summary.profit)}
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
              className={`mt-2 text-3xl font-bold ${
                summary.margin >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {summary.margin.toFixed(1)}%
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Fleet-wide margin
            </p>
          </div>
        </div>

        {/* Vehicle Status */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-sm font-medium text-emerald-700">
              Profitable Vehicles
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {summary.profitableVehicles}
            </p>

            <p className="mt-1 text-sm text-emerald-600">
              Vehicles currently generating a positive result.
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-700">
              Loss-Making Vehicles
            </p>

            <p className="mt-2 text-3xl font-bold text-red-700">
              {summary.lossMakingVehicles}
            </p>

            <p className="mt-1 text-sm text-red-600">
              Vehicles whose operating costs exceed revenue.
            </p>
          </div>
        </div>

        {/* Top Performers */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Best Performer
            </p>

            {topVehicle ? (
              <>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {topVehicle.vehicleCode}
                </h2>

                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {formatMoney(topVehicle.profit)}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Profit generated
                </p>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">Revenue</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {formatMoney(topVehicle.revenue)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">Cost</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {formatMoney(topVehicle.totalCost)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">Margin</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {topVehicle.margin.toFixed(1)}%
                    </p>
                  </div>
                </div>
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
                  {formatMoney(worstVehicle.profit)}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Current operating result
                </p>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">Revenue</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {formatMoney(worstVehicle.revenue)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">Cost</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {formatMoney(worstVehicle.totalCost)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">Margin</p>
                    <p className="mt-1 font-semibold text-red-600">
                      {worstVehicle.margin.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-6 text-slate-500">
                No vehicle data available.
              </p>
            )}
          </div>
        </section>

        {/* Vehicle Profitability Table */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Vehicle Profitability
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Financial performance calculated from trips, fuel,
              maintenance, and expenses.
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500">
              Loading profitability data...
            </div>
          ) : profitability.length === 0 ? (
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
                    <th className="px-4 py-3">Fuel</th>
                    <th className="px-4 py-3">Maintenance</th>
                    <th className="px-4 py-3">Other</th>
                    <th className="px-4 py-3">Total Cost</th>
                    <th className="px-4 py-3">Profit / Loss</th>
                    <th className="px-4 py-3">Margin</th>
                  </tr>
                </thead>

                <tbody>
                  {profitability.map((item) => (
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
                        {formatMoney(item.revenue)}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {formatMoney(item.fuelCost)}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {formatMoney(item.maintenanceCost)}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {formatMoney(item.otherExpenses)}
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-800">
                        {formatMoney(item.totalCost)}
                      </td>

                      <td
                        className={`px-4 py-4 font-bold ${
                          item.profit >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatMoney(item.profit)}
                      </td>

                      <td
                        className={`px-4 py-4 font-semibold ${
                          item.margin >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.margin.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Cost Structure */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Fleet Cost Structure
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Where FleetFlow is spending money.
            </p>
          </div>

          <div className="space-y-5">
            {[
              {
                label: "Fuel",
                value: costBreakdown.fuelCost,
              },
              {
                label: "Maintenance",
                value: costBreakdown.maintenanceCost,
              },
              {
                label: "Other Expenses",
                value: costBreakdown.otherExpenses,
              },
            ].map((item) => {
              const percentage =
                summary.totalCost > 0
                  ? (item.value / summary.totalCost) * 100
                  : 0;

              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      {item.label}
                    </span>

                    <span className="text-sm font-semibold text-slate-900">
                      {formatMoney(item.value)}{" "}
                      <span className="text-slate-400">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Automated Insights */}
        <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <h2 className="text-xl font-bold text-slate-900">
            Automated Business Insights
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Insight 01
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {topVehicle
                  ? `${topVehicle.vehicleCode} is currently the strongest financial performer with a result of ${formatMoney(topVehicle.profit)}.`
                  : "Fleet profitability cannot be evaluated until vehicle data is available."}
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Insight 02
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {worstVehicle
                  ? `${worstVehicle.vehicleCode} requires attention because it currently has the weakest financial result at ${formatMoney(worstVehicle.profit)}.`
                  : "No loss-making vehicle can currently be identified."}
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Insight 03
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Fuel represents{" "}
                {summary.totalCost > 0
                  ? (
                      (costBreakdown.fuelCost /
                        summary.totalCost) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                % of total operating costs.
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Insight 04
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Fleet profitability is currently{" "}
                {summary.profit >= 0
                  ? "positive. Continue monitoring costs to protect margins."
                  : "negative. Management should investigate costs and revenue opportunities."}
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          FleetFlow Intelligence • Vehicle Profitability Analysis
        </footer>
      </div>
    </main>
  );
}
