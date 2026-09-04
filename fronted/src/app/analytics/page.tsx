"use client";

import { useEffect, useMemo, useState } from "react";

interface Vehicle {
  id: number;
  vehicleCode?: string;
  registration?: string;
  type?: string;
  model?: string;
  status: string;
  mileage?: string | number;
}

interface Trip {
  id: number;
  tripCode: string;
  origin: string;
  destination: string;
  vehicleCode: string;
  driverCode: string;
  tripDate: string;
  distance: string | number;
  fuelUsed: string | number;
  revenue: string | number;
  status: string;
}

interface Fuel {
  id: number;
  fuelCode: string;
  vehicleCode: string;
  driverCode: string;
  fuelDate: string;
  liters: string | number;
  cost: string | number;
  fuelStation: string;
  odometer: string | number;
}

interface Maintenance {
  id: number;
  maintenanceCode: string;
  vehicleCode: string;
  maintenanceDate: string;
  maintenanceType: string;
  cost: string | number;
  status: string;
}

interface Expense {
  id: number;
  expenseCode: string;
  vehicleCode: string;
  driverCode: string;
  expenseDate: string;
  category: string;
  amount: string | number;
  vendor: string;
  status: string;
}

export default function AnalyticsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuel, setFuel] = useState<Fuel[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:3001";

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError("");

      const responses = await Promise.all([
        fetch(`${API_URL}/vehicles`),
        fetch(`${API_URL}/trips`),
        fetch(`${API_URL}/fuel`),
        fetch(`${API_URL}/maintenance`),
        fetch(`${API_URL}/expenses`),
      ]);

      if (responses.some((response) => !response.ok)) {
        throw new Error("Failed to load analytics data.");
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

      setVehicles(vehiclesData);
      setTrips(tripsData);
      setFuel(fuelData);
      setMaintenance(maintenanceData);
      setExpenses(expensesData);
    } catch (err) {
      console.error("Analytics error:", err);

      setError(
        "Unable to load analytics data. Make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const formatNumber = (value: number) => {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    return String(date).substring(0, 10);
  };

  const status = (value: string) =>
    value?.toLowerCase().trim() || "";

  const totalRevenue = useMemo(
    () =>
      trips.reduce(
        (total, trip) =>
          total + Number(trip.revenue || 0),
        0,
      ),
    [trips],
  );

  const totalDistance = useMemo(
    () =>
      trips.reduce(
        (total, trip) =>
          total + Number(trip.distance || 0),
        0,
      ),
    [trips],
  );

  const totalFuelLiters = useMemo(
    () =>
      fuel.reduce(
        (total, record) =>
          total + Number(record.liters || 0),
        0,
      ),
    [fuel],
  );

  const totalFuelCost = useMemo(
    () =>
      fuel.reduce(
        (total, record) =>
          total + Number(record.cost || 0),
        0,
      ),
    [fuel],
  );

  const totalMaintenanceCost = useMemo(
    () =>
      maintenance.reduce(
        (total, record) =>
          total + Number(record.cost || 0),
        0,
      ),
    [maintenance],
  );

  const totalExpenses = useMemo(
    () =>
      expenses.reduce(
        (total, expense) =>
          total + Number(expense.amount || 0),
        0,
      ),
    [expenses],
  );

  const totalOperatingCost =
    totalFuelCost +
    totalMaintenanceCost +
    totalExpenses;

  const netOperatingResult =
    totalRevenue - totalOperatingCost;

  const fuelEfficiency =
    totalFuelLiters > 0
      ? totalDistance / totalFuelLiters
      : 0;

  const costPerKm =
    totalDistance > 0
      ? totalOperatingCost / totalDistance
      : 0;

  const completedTrips = trips.filter(
    (trip) => status(trip.status) === "completed",
  ).length;

  const completionRate =
    trips.length > 0
      ? (completedTrips / trips.length) * 100
      : 0;

  const activeVehicles = vehicles.filter(
    (vehicle) => status(vehicle.status) === "active",
  ).length;

  const activeTrips = trips.filter((trip) => {
    const currentStatus = status(trip.status);

    return (
      currentStatus === "active" ||
      currentStatus === "in progress"
    );
  }).length;

  const fleetUtilization =
    activeVehicles > 0
      ? (activeTrips / activeVehicles) * 100
      : 0;

  /*
   * VEHICLE PERFORMANCE
   */

  const vehiclePerformance = useMemo(() => {
    return vehicles
      .map((vehicle) => {
        const code =
          vehicle.vehicleCode ||
          vehicle.registration ||
          `Vehicle ${vehicle.id}`;

        const vehicleTrips = trips.filter(
          (trip) => trip.vehicleCode === code,
        );

        const distance = vehicleTrips.reduce(
          (total, trip) =>
            total + Number(trip.distance || 0),
          0,
        );

        const revenue = vehicleTrips.reduce(
          (total, trip) =>
            total + Number(trip.revenue || 0),
          0,
        );

        const vehicleFuel = fuel.filter(
          (record) => record.vehicleCode === code,
        );

        const fuelCost = vehicleFuel.reduce(
          (total, record) =>
            total + Number(record.cost || 0),
          0,
        );

        const maintenanceCost = maintenance
          .filter(
            (record) => record.vehicleCode === code,
          )
          .reduce(
            (total, record) =>
              total + Number(record.cost || 0),
            0,
          );

        const vehicleExpenses = expenses
          .filter(
            (expense) => expense.vehicleCode === code,
          )
          .reduce(
            (total, expense) =>
              total + Number(expense.amount || 0),
            0,
          );

        const totalCost =
          fuelCost +
          maintenanceCost +
          vehicleExpenses;

        return {
          code,
          status: vehicle.status,
          trips: vehicleTrips.length,
          distance,
          revenue,
          cost: totalCost,
          result: revenue - totalCost,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [vehicles, trips, fuel, maintenance, expenses]);

  /*
   * EXPENSE BREAKDOWN
   */

  const expenseBreakdown = useMemo(() => {
    const grouped: Record<string, number> = {};

    expenses.forEach((expense) => {
      const category = expense.category || "Other";

      grouped[category] =
        (grouped[category] || 0) +
        Number(expense.amount || 0);
    });

    return Object.entries(grouped)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  /*
   * MONTHLY ANALYSIS
   */

  const monthlyAnalysis = useMemo(() => {
    const months: Record<
      string,
      {
        revenue: number;
        fuel: number;
        maintenance: number;
        expenses: number;
      }
    > = {};

    trips.forEach((trip) => {
      const month = formatDate(trip.tripDate).substring(0, 7);

      if (!month) return;

      if (!months[month]) {
        months[month] = {
          revenue: 0,
          fuel: 0,
          maintenance: 0,
          expenses: 0,
        };
      }

      months[month].revenue += Number(
        trip.revenue || 0,
      );
    });

    fuel.forEach((record) => {
      const month = formatDate(record.fuelDate).substring(
        0,
        7,
      );

      if (!month) return;

      if (!months[month]) {
        months[month] = {
          revenue: 0,
          fuel: 0,
          maintenance: 0,
          expenses: 0,
        };
      }

      months[month].fuel += Number(record.cost || 0);
    });

    maintenance.forEach((record) => {
      const month = formatDate(
        record.maintenanceDate,
      ).substring(0, 7);

      if (!month) return;

      if (!months[month]) {
        months[month] = {
          revenue: 0,
          fuel: 0,
          maintenance: 0,
          expenses: 0,
        };
      }

      months[month].maintenance += Number(
        record.cost || 0,
      );
    });

    expenses.forEach((expense) => {
      const month = formatDate(
        expense.expenseDate,
      ).substring(0, 7);

      if (!month) return;

      if (!months[month]) {
        months[month] = {
          revenue: 0,
          fuel: 0,
          maintenance: 0,
          expenses: 0,
        };
      }

      months[month].expenses += Number(
        expense.amount || 0,
      );
    });

    return Object.entries(months)
      .map(([month, values]) => ({
        month,
        ...values,
        totalCost:
          values.fuel +
          values.maintenance +
          values.expenses,
        result:
          values.revenue -
          values.fuel -
          values.maintenance -
          values.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [trips, fuel, maintenance, expenses]);

  /*
   * BUSINESS INSIGHTS
   */

  const insights = useMemo(() => {
    const results: {
      title: string;
      description: string;
      type: "positive" | "warning" | "danger" | "info";
    }[] = [];

    if (netOperatingResult < 0) {
      results.push({
        title: "Negative operating result",
        description:
          "Recorded operating costs currently exceed recorded trip revenue.",
        type: "danger",
      });
    } else if (netOperatingResult > 0) {
      results.push({
        title: "Positive operating result",
        description:
          "Recorded trip revenue currently exceeds operating costs.",
        type: "positive",
      });
    }

    if (fuelEfficiency > 0 && fuelEfficiency < 3) {
      results.push({
        title: "Fuel efficiency requires attention",
        description:
          "Current recorded fuel efficiency is below 3 km/L.",
        type: "warning",
      });
    }

    if (fleetUtilization > 80) {
      results.push({
        title: "High fleet utilization",
        description:
          "A large percentage of active vehicles are currently assigned to active trips.",
        type: "info",
      });
    }

    if (maintenanceDueCount() > 0) {
      results.push({
        title: "Maintenance workload detected",
        description:
          `${maintenanceDueCount()} maintenance record${
            maintenanceDueCount() === 1 ? "" : "s"
          } require attention.`,
        type: "warning",
      });
    }

    if (results.length === 0) {
      results.push({
        title: "Operations look stable",
        description:
          "No major performance issues were detected from the available data.",
        type: "positive",
      });
    }

    return results.slice(0, 4);
  }, [
    netOperatingResult,
    fuelEfficiency,
    fleetUtilization,
    maintenance,
  ]);

  function maintenanceDueCount() {
    return maintenance.filter((record) => {
      const currentStatus = status(record.status);

      return (
        currentStatus === "pending" ||
        currentStatus === "in progress"
      );
    }).length;
  }

  const maxMonthlyValue = Math.max(
    ...monthlyAnalysis.map((item) =>
      Math.max(
        item.revenue,
        item.totalCost,
      ),
    ),
    1,
  );

  const maxExpenseValue = Math.max(
    ...expenseBreakdown.map((item) => item.amount),
    1,
  );

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-blue-600">
              FLEETFLOW ERP
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Advanced Analytics
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Analyze fleet performance, financial results,
              fuel efficiency, operating costs, and vehicle
              profitability.
            </p>
          </div>

          <button
            onClick={fetchAnalyticsData}
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </header>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* KPI CARDS */}

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Revenue
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {loading
                ? "..."
                : formatNumber(totalRevenue)}
            </p>

            <p className="mt-2 text-sm text-green-600">
              From recorded trips
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Operating Cost
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {loading
                ? "..."
                : formatNumber(totalOperatingCost)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              All operating categories
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Net Result
            </p>

            <p
              className={`mt-3 text-3xl font-bold ${
                netOperatingResult >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {loading
                ? "..."
                : formatNumber(netOperatingResult)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Revenue minus operating cost
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Cost / KM
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {loading
                ? "..."
                : formatNumber(costPerKm)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Operating cost per kilometer
            </p>
          </div>

        </section>

        {/* PERFORMANCE CARDS */}

        <section className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Fleet Utilization
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading
                ? "..."
                : `${formatNumber(fleetUtilization)}%`}
            </p>

            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: `${Math.min(
                    fleetUtilization,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Trip Completion
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading
                ? "..."
                : `${formatNumber(completionRate)}%`}
            </p>

            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-green-600"
                style={{
                  width: `${Math.min(
                    completionRate,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Fuel Efficiency
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading
                ? "..."
                : `${formatNumber(fuelEfficiency)} km/L`}
            </p>

            <p className="mt-4 text-xs text-slate-400">
              Total distance ÷ total fuel
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Distance
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading
                ? "..."
                : `${formatNumber(totalDistance)} km`}
            </p>

            <p className="mt-4 text-xs text-slate-400">
              Across all recorded trips
            </p>
          </div>

        </section>

        {/* REVENUE VS COST */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Revenue vs Operating Cost
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Monthly financial performance based on recorded data.
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading financial analysis...
            </div>
          ) : monthlyAnalysis.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No financial data available.
            </div>
          ) : (
            <div className="mt-8 space-y-7">
              {monthlyAnalysis.map((item) => (
                <div key={item.month}>

                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-medium text-slate-700">
                      {item.month}
                    </span>

                    <span
                      className={`font-semibold ${
                        item.result >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      Result: {formatNumber(item.result)}
                    </span>
                  </div>

                  <div className="space-y-3">

                    <div>
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>Revenue</span>
                        <span>
                          {formatNumber(item.revenue)}
                        </span>
                      </div>

                      <div className="h-3 rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-green-500"
                          style={{
                            width: `${
                              (item.revenue /
                                maxMonthlyValue) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>Operating Cost</span>
                        <span>
                          {formatNumber(item.totalCost)}
                        </span>
                      </div>

                      <div className="h-3 rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-red-400"
                          style={{
                            width: `${
                              (item.totalCost /
                                maxMonthlyValue) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* VEHICLE PERFORMANCE */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Vehicle Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Revenue, operating cost, and result by vehicle.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Trips</th>
                  <th className="px-6 py-4">Distance</th>
                  <th className="px-6 py-4">Revenue</th>
                  <th className="px-6 py-4">Cost</th>
                  <th className="px-6 py-4">Result</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      Loading vehicle analysis...
                    </td>
                  </tr>
                ) : vehiclePerformance.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      No vehicles found.
                    </td>
                  </tr>
                ) : (
                  vehiclePerformance.map((vehicle) => (
                    <tr
                      key={vehicle.code}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {vehicle.code}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {vehicle.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {vehicle.trips}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatNumber(vehicle.distance)} km
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-900">
                        {formatNumber(vehicle.revenue)}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatNumber(vehicle.cost)}
                      </td>

                      <td
                        className={`px-6 py-4 font-semibold ${
                          vehicle.result >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatNumber(vehicle.result)}
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </section>

        {/* COST ANALYSIS */}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* COST CATEGORIES */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
              Cost Structure
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Operating cost distribution.
            </p>

            <div className="mt-7 space-y-6">

              {[
                {
                  name: "Fuel",
                  value: totalFuelCost,
                  percentage:
                    totalOperatingCost > 0
                      ? (totalFuelCost /
                          totalOperatingCost) *
                        100
                      : 0,
                },
                {
                  name: "Maintenance",
                  value: totalMaintenanceCost,
                  percentage:
                    totalOperatingCost > 0
                      ? (totalMaintenanceCost /
                          totalOperatingCost) *
                        100
                      : 0,
                },
                {
                  name: "Other Expenses",
                  value: totalExpenses,
                  percentage:
                    totalOperatingCost > 0
                      ? (totalExpenses /
                          totalOperatingCost) *
                        100
                      : 0,
                },
              ].map((item) => (
                <div key={item.name}>

                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-600">
                      {item.name}
                    </span>

                    <span className="font-semibold text-slate-900">
                      {formatNumber(item.value)} (
                      {formatNumber(item.percentage)}%)
                    </span>
                  </div>

                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width: `${Math.min(
                          item.percentage,
                          100,
                        )}%`,
                      }}
                    />
                  </div>

                </div>
              ))}

            </div>
          </div>

          {/* EXPENSE BREAKDOWN */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
              Expense Breakdown
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Other expenses grouped by category.
            </p>

            <div className="mt-7 space-y-5">

              {expenseBreakdown.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No expense categories available.
                </p>
              ) : (
                expenseBreakdown.map((item) => (
                  <div key={item.category}>

                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-600">
                        {item.category}
                      </span>

                      <span className="font-semibold text-slate-900">
                        {formatNumber(item.amount)}
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-600"
                        style={{
                          width: `${
                            (item.amount /
                              maxExpenseValue) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                  </div>
                ))
              )}

            </div>
          </div>

        </section>

        {/* BUSINESS INSIGHTS */}

        <section className="mt-8 rounded-2xl bg-slate-900 p-6 shadow-sm">

          <div>
            <p className="text-sm font-semibold tracking-wide text-blue-400">
              INTELLIGENCE
            </p>

            <h2 className="mt-1 text-xl font-semibold text-white">
              Business Insights
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Automatically generated observations from FleetFlow data.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            {insights.map((insight, index) => {

              const styles =
                insight.type === "danger"
                  ? "border-red-800 bg-red-950/40"
                  : insight.type === "warning"
                    ? "border-orange-800 bg-orange-950/40"
                    : insight.type === "positive"
                      ? "border-green-800 bg-green-950/40"
                      : "border-blue-800 bg-blue-950/40";

              const titleColor =
                insight.type === "danger"
                  ? "text-red-300"
                  : insight.type === "warning"
                    ? "text-orange-300"
                    : insight.type === "positive"
                      ? "text-green-300"
                      : "text-blue-300";

              return (
                <div
                  key={`${insight.title}-${index}`}
                  className={`rounded-xl border p-5 ${styles}`}
                >
                  <h3
                    className={`font-semibold ${titleColor}`}
                  >
                    {insight.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {insight.description}
                  </p>
                </div>
              );
            })}

          </div>
        </section>

        {/* DATA SUMMARY */}

        <section className="mt-8 mb-4 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-slate-900">
            Analytics Data Summary
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs text-slate-500">
                Vehicles
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {vehicles.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs text-slate-500">
                Trips
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {trips.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs text-slate-500">
                Fuel Records
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {fuel.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs text-slate-500">
                Maintenance
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {maintenance.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs text-slate-500">
                Expenses
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {expenses.length}
              </p>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
