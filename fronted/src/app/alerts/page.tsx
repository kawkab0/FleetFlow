"use client";

import { useEffect, useMemo, useState } from "react";

interface Vehicle {
  id: number;
  vehicleCode?: string;
  status?: string;
}

interface Trip {
  id: number;
  vehicleCode?: string;
  distance?: number | string;
  revenue?: number | string;
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
}

interface Expense {
  id: number;
  vehicleCode?: string;
  amount?: number | string;
}

interface Alert {
  id: number;
  priority: "Critical" | "High" | "Medium" | "Low";
  category: string;
  title: string;
  description: string;
  action: string;
  vehicleCode?: string;
}

const API = "http://localhost:3001";

function num(value: unknown): number {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

function money(value: number): string {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;
}

export default function AlertsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuel, setFuel] = useState<Fuel[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<
    "All" | "Critical" | "High" | "Medium" | "Low"
  >("All");

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
        "Unable to load alert data. Make sure the backend is running on port 3001.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const alerts = useMemo(() => {
    const generated: Alert[] = [];
    let id = 1;

    const addAlert = (
      priority: Alert["priority"],
      category: string,
      title: string,
      description: string,
      action: string,
      vehicleCode?: string,
    ) => {
      generated.push({
        id: id++,
        priority,
        category,
        title,
        description,
        action,
        vehicleCode,
      });
    };

    const totalRevenue = trips.reduce(
      (sum, trip) => sum + num(trip.revenue),
      0,
    );

    const totalFuelCost = fuel.reduce(
      (sum, record) => sum + num(record.cost),
      0,
    );

    const totalMaintenanceCost = maintenance.reduce(
      (sum, record) => sum + num(record.cost),
      0,
    );

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + num(expense.amount),
      0,
    );

    const totalCost =
      totalFuelCost + totalMaintenanceCost + totalExpenses;

    const totalProfit = totalRevenue - totalCost;

    const totalDistance = trips.reduce(
      (sum, trip) => sum + num(trip.distance),
      0,
    );

    const totalFuelLiters = fuel.reduce(
      (sum, record) => sum + num(record.liters),
      0,
    );

    const fleetEfficiency =
      totalFuelLiters > 0
        ? totalDistance / totalFuelLiters
        : 0;

    // ---------------------------------------------------------
    // FLEET-LEVEL ALERTS
    // ---------------------------------------------------------

    if (totalProfit < 0) {
      addAlert(
        "Critical",
        "Financial",
        "Fleet operating result is negative",
        `The fleet has generated ${money(
          totalRevenue,
        )} in revenue against ${money(totalCost)} in operating costs.`,
        "Review profitability, fuel consumption, maintenance spending, and vehicle assignments.",
      );
    }

    if (
      totalCost > 0 &&
      totalFuelCost / totalCost > 0.5
    ) {
      addAlert(
        "High",
        "Fuel",
        "Fuel is the dominant operating cost",
        `Fuel represents ${(
          (totalFuelCost / totalCost) *
          100
        ).toFixed(1)}% of total operating costs.`,
        "Investigate fuel efficiency and high-consumption vehicles.",
      );
    }

    if (fleetEfficiency > 0 && fleetEfficiency < 3) {
      addAlert(
        "High",
        "Fuel Efficiency",
        "Fleet fuel efficiency is critically low",
        `Current fleet efficiency is ${fleetEfficiency.toFixed(
          2,
        )} km/L.`,
        "Inspect vehicle condition, driving behavior, idling, routes, and fuel usage.",
      );
    } else if (
      fleetEfficiency > 0 &&
      fleetEfficiency < 4
    ) {
      addAlert(
        "Medium",
        "Fuel Efficiency",
        "Fleet fuel efficiency needs attention",
        `Current fleet efficiency is ${fleetEfficiency.toFixed(
          2,
        )} km/L.`,
        "Monitor fuel consumption and investigate inefficient vehicles.",
      );
    }

    // ---------------------------------------------------------
    // VEHICLE-LEVEL ANALYSIS
    // ---------------------------------------------------------

    vehicles.forEach((vehicle) => {
      const code =
        String(vehicle.vehicleCode ?? "").trim() ||
        `Vehicle #${vehicle.id}`;

      const vehicleTrips = trips.filter(
        (trip) => String(trip.vehicleCode) === code,
      );

      const vehicleFuel = fuel.filter(
        (record) =>
          String(record.vehicleCode) === code,
      );

      const vehicleMaintenance = maintenance.filter(
        (record) =>
          String(record.vehicleCode) === code,
      );

      const vehicleExpenses = expenses.filter(
        (expense) =>
          String(expense.vehicleCode) === code,
      );

      const revenue = vehicleTrips.reduce(
        (sum, trip) => sum + num(trip.revenue),
        0,
      );

      const distance = vehicleTrips.reduce(
        (sum, trip) => sum + num(trip.distance),
        0,
      );

      const fuelLiters = vehicleFuel.reduce(
        (sum, record) => sum + num(record.liters),
        0,
      );

      const fuelCost = vehicleFuel.reduce(
        (sum, record) => sum + num(record.cost),
        0,
      );

      const maintenanceCost = vehicleMaintenance.reduce(
        (sum, record) => sum + num(record.cost),
        0,
      );

      const otherExpenses = vehicleExpenses.reduce(
        (sum, expense) => sum + num(expense.amount),
        0,
      );

      const totalVehicleCost =
        fuelCost +
        maintenanceCost +
        otherExpenses;

      const profit =
        revenue - totalVehicleCost;

      const efficiency =
        fuelLiters > 0
          ? distance / fuelLiters
          : 0;

      // Loss alert
      if (profit < 0 && totalVehicleCost > 0) {
        addAlert(
          "Critical",
          "Profitability",
          `${code} is operating at a loss`,
          `${code} generated ${money(
            revenue,
          )} in revenue while accumulating ${money(
            totalVehicleCost,
          )} in costs.`,
          "Review this vehicle's assignments, fuel consumption, maintenance, and expenses.",
          code,
        );
      }

      // High maintenance
      if (maintenanceCost >= 10000) {
        addAlert(
          "High",
          "Maintenance",
          `${code} has very high maintenance costs`,
          `${code} has accumulated ${money(
            maintenanceCost,
          )} in maintenance expenses.`,
          "Review maintenance history and consider preventive maintenance or replacement.",
          code,
        );
      } else if (maintenanceCost >= 5000) {
        addAlert(
          "Medium",
          "Maintenance",
          `${code} has elevated maintenance costs`,
          `Maintenance spending for ${code} has reached ${money(
            maintenanceCost,
          )}.`,
          "Monitor this vehicle's maintenance trend and investigate recurring repairs.",
          code,
        );
      }

      // Poor fuel efficiency
      if (
        efficiency > 0 &&
        efficiency < 3
      ) {
        addAlert(
          "High",
          "Fuel Efficiency",
          `${code} has poor fuel efficiency`,
          `${code} is averaging only ${efficiency.toFixed(
            2,
          )} km/L.`,
          "Inspect the vehicle and investigate driving behavior, idling, load, and route efficiency.",
          code,
        );
      } else if (
        efficiency > 0 &&
        efficiency < 4
      ) {
        addAlert(
          "Medium",
          "Fuel Efficiency",
          `${code} has below-target fuel efficiency`,
          `${code} is averaging ${efficiency.toFixed(
            2,
          )} km/L.`,
          "Monitor fuel usage and inspect the vehicle if the trend continues.",
          code,
        );
      }

      // High fuel cost
      if (fuelCost >= 25000) {
        addAlert(
          "High",
          "Fuel Cost",
          `${code} is a major fuel cost contributor`,
          `${code} has accumulated ${money(
            fuelCost,
          )} in fuel costs.`,
          "Investigate fuel consumption and compare fuel cost against distance and revenue.",
          code,
        );
      } else if (fuelCost >= 15000) {
        addAlert(
          "Medium",
          "Fuel Cost",
          `${code} has elevated fuel costs`,
          `${code} has recorded ${money(
            fuelCost,
          )} in fuel spending.`,
          "Monitor consumption and investigate whether fuel usage is justified by vehicle activity.",
          code,
        );
      }

      // No trips
      if (vehicleTrips.length === 0) {
        addAlert(
          "Medium",
          "Utilization",
          `${code} has no recorded trips`,
          "No trip activity is currently associated with this vehicle.",
          "Review whether the vehicle should be assigned work, repaired, or marked inactive.",
          code,
        );
      }

      // No maintenance history
      if (
        vehicleTrips.length > 0 &&
        vehicleMaintenance.length === 0
      ) {
        addAlert(
          "Medium",
          "Preventive Maintenance",
          `${code} has no maintenance history`,
          `${code} has recorded trip activity but no maintenance records.`,
          "Verify maintenance records and schedule a preventive inspection if necessary.",
          code,
        );
      }

      // Inactive vehicle
      if (
        String(vehicle.status ?? "").toLowerCase() ===
        "inactive"
      ) {
        addAlert(
          "Low",
          "Fleet Status",
          `${code} is currently inactive`,
          "The vehicle is marked as inactive in FleetFlow.",
          "Review whether the vehicle should remain inactive or be returned to service.",
          code,
        );
      }
    });

    // Sort by priority
    const priorityOrder: Record<
      Alert["priority"],
      number
    > = {
      Critical: 1,
      High: 2,
      Medium: 3,
      Low: 4,
    };

    return generated.sort(
      (a, b) =>
        priorityOrder[a.priority] -
        priorityOrder[b.priority],
    );
  }, [
    vehicles,
    trips,
    fuel,
    maintenance,
    expenses,
  ]);

  const filteredAlerts =
    filter === "All"
      ? alerts
      : alerts.filter(
          (alert) => alert.priority === filter,
        );

  const criticalCount = alerts.filter(
    (alert) => alert.priority === "Critical",
  ).length;

  const highCount = alerts.filter(
    (alert) => alert.priority === "High",
  ).length;

  const mediumCount = alerts.filter(
    (alert) => alert.priority === "Medium",
  ).length;

  const lowCount = alerts.filter(
    (alert) => alert.priority === "Low",
  ).length;

  const priorityClass = (
    priority: Alert["priority"],
  ) => {
    if (priority === "Critical") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    if (priority === "High") {
      return "border-orange-200 bg-orange-50 text-orange-700";
    }

    if (priority === "Medium") {
      return "border-yellow-200 bg-yellow-50 text-yellow-700";
    }

    return "border-green-200 bg-green-50 text-green-700";
  };

  const priorityDot = (
    priority: Alert["priority"],
  ) => {
    if (priority === "Critical") {
      return "bg-red-500";
    }

    if (priority === "High") {
      return "bg-orange-500";
    }

    if (priority === "Medium") {
      return "bg-yellow-500";
    }

    return "bg-green-500";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-700">
              Scanning FleetFlow...
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Checking the fleet for operational alerts.
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
              Alert Center Error
            </h1>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

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
              <p className="text-sm font-semibold uppercase tracking-widest text-red-400">
                FleetFlow Monitoring
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Alerts & Notifications
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                A centralized view of operational, financial,
                fuel, maintenance, and fleet risks detected
                automatically from FleetFlow data.
              </p>
            </div>

            <button
              onClick={loadData}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Scan Again
            </button>
          </div>
        </section>

        {/* ALERT SUMMARY */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => setFilter("Critical")}
            className={`rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-0.5 ${
              filter === "Critical"
                ? "border-red-400 bg-red-50"
                : "border-red-200 bg-white"
            }`}
          >
            <p className="text-sm font-medium text-slate-500">
              Critical Alerts
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {criticalCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Immediate attention
            </p>
          </button>

          <button
            onClick={() => setFilter("High")}
            className={`rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-0.5 ${
              filter === "High"
                ? "border-orange-400 bg-orange-50"
                : "border-orange-200 bg-white"
            }`}
          >
            <p className="text-sm font-medium text-slate-500">
              High Alerts
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {highCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Action recommended
            </p>
          </button>

          <button
            onClick={() => setFilter("Medium")}
            className={`rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-0.5 ${
              filter === "Medium"
                ? "border-yellow-400 bg-yellow-50"
                : "border-yellow-200 bg-white"
            }`}
          >
            <p className="text-sm font-medium text-slate-500">
              Medium Alerts
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {mediumCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Monitor closely
            </p>
          </button>

          <button
            onClick={() => setFilter("Low")}
            className={`rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-0.5 ${
              filter === "Low"
                ? "border-green-400 bg-green-50"
                : "border-green-200 bg-white"
            }`}
          >
            <p className="text-sm font-medium text-slate-500">
              Low Alerts
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {lowCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Informational
            </p>
          </button>
        </section>

        {/* FILTER BAR */}
        <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Alert Feed
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredAlerts.length} of{" "}
              {alerts.length} detected alerts
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                "All",
                "Critical",
                "High",
                "Medium",
                "Low",
              ] as const
            ).map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  filter === option
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        {/* ALERT FEED */}
        <section className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                  <div
                    className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${priorityDot(
                      alert.priority,
                    )}`}
                  />

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${priorityClass(
                          alert.priority,
                        )}`}
                      >
                        {alert.priority}
                      </span>

                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {alert.category}
                      </span>

                      {alert.vehicleCode && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {alert.vehicleCode}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-slate-900">
                      {alert.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {alert.description}
                    </p>
                  </div>
                </div>

                <div className="min-w-full rounded-xl bg-slate-50 p-4 lg:min-w-[320px] lg:max-w-[380px]">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                    Suggested Response
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {alert.action}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredAlerts.length === 0 && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-10 text-center">
              <div className="text-4xl">✓</div>

              <h3 className="mt-3 text-lg font-bold text-green-800">
                No alerts in this category
              </h3>

              <p className="mt-2 text-sm text-green-700">
                FleetFlow did not detect any issues matching
                the selected priority.
              </p>
            </div>
          )}
        </section>

        {/* MONITORING LOGIC */}
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Automated Monitoring
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            What FleetFlow Monitors
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="text-2xl">💰</div>

              <h3 className="mt-3 font-bold text-slate-900">
                Financial
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Detects operating losses and excessive cost
                concentrations.
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="text-2xl">⛽</div>

              <h3 className="mt-3 font-bold text-slate-900">
                Fuel
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Monitors fuel efficiency, consumption, and
                fuel-related costs.
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="text-2xl">🔧</div>

              <h3 className="mt-3 font-bold text-slate-900">
                Maintenance
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Identifies expensive maintenance and missing
                maintenance history.
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="text-2xl">🚚</div>

              <h3 className="mt-3 font-bold text-slate-900">
                Utilization
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Detects vehicles with little or no recorded
                operational activity.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          FleetFlow Alert Center • Alerts are automatically
          generated from current operational data.
        </footer>
      </div>
    </main>
  );
}
