"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedPage from "@/components/ProtectedPage";

interface Vehicle {
  id: number;
  vehicleCode?: string;
  plateNumber?: string;
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
}

interface Expense {
  id: number;
  vehicleCode?: string;
  amount?: number | string;
}

type Priority = "Critical" | "High" | "Medium" | "Low";

type Alert = {
  id: number;
  priority: Priority;
  category: string;
  title: string;
  description: string;
  action: string;
  vehicleCode?: string;
};

function num(value: unknown): number {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

function money(value: number): string {
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} ETB`;
}

function percent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
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

function priorityRank(priority: Priority): number {
  if (priority === "Critical") return 1;
  if (priority === "High") return 2;
  if (priority === "Medium") return 3;
  return 4;
}

function priorityClasses(priority: Priority): string {
  if (priority === "Critical") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (priority === "High") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  if (priority === "Medium") {
    return "border-yellow-200 bg-yellow-50 text-yellow-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function priorityDot(priority: Priority): string {
  if (priority === "Critical") return "bg-red-500";
  if (priority === "High") return "bg-orange-500";
  if (priority === "Medium") return "bg-yellow-500";
  return "bg-emerald-500";
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
    "All" | Priority
  >("All");

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
          "Unable to load alert data. Make sure the backend is running on port 3001.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const alerts = useMemo<Alert[]>(() => {
    const generated: Alert[] = [];
    let id = 1;

    const addAlert = (
      priority: Priority,
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

    /*
     * FLEET-LEVEL OPERATIONAL DATA
     */
    const completedTrips = trips.filter((trip) =>
      isCompletedTrip(trip.status),
    );

    const totalRevenue = completedTrips.reduce(
      (sum, trip) => sum + num(trip.revenue),
      0,
    );

    const totalDistance = completedTrips.reduce(
      (sum, trip) => sum + num(trip.distance),
      0,
    );

    const totalOperationalFuel = completedTrips.reduce(
      (sum, trip) => sum + num(trip.fuelUsed),
      0,
    );

    const totalFuelCost = fuel.reduce(
      (sum, record) => sum + num(record.cost),
      0,
    );

    const totalFuelLiters = fuel.reduce(
      (sum, record) => sum + num(record.liters),
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
      totalFuelCost +
      totalMaintenanceCost +
      totalExpenses;

    const totalResult = totalRevenue - totalCost;

    const fleetMargin =
      totalRevenue > 0
        ? (totalResult / totalRevenue) * 100
        : 0;

    const operationalFuelEfficiency =
      totalOperationalFuel > 0
        ? totalDistance / totalOperationalFuel
        : 0;

    const purchasedFuelEfficiency =
      totalFuelLiters > 0
        ? totalDistance / totalFuelLiters
        : 0;

    const fleetCostPerKm =
      totalDistance > 0
        ? totalCost / totalDistance
        : 0;

    /*
     * VEHICLE BASE DATA
     */
    const vehicleData = vehicles.map((vehicle) => {
      const code =
        String(vehicle.vehicleCode ?? "").trim() ||
        String(vehicle.plateNumber ?? "").trim() ||
        `Vehicle #${vehicle.id}`;

      const vehicleTrips = trips.filter(
        (trip) => trip.vehicleCode === code,
      );

      const vehicleCompletedTrips =
        vehicleTrips.filter((trip) =>
          isCompletedTrip(trip.status),
        );

      const vehicleFuel = fuel.filter(
        (record) => record.vehicleCode === code,
      );

      const vehicleMaintenance = maintenance.filter(
        (record) => record.vehicleCode === code,
      );

      const vehicleExpenses = expenses.filter(
        (expense) => expense.vehicleCode === code,
      );

      const distance = vehicleCompletedTrips.reduce(
        (sum, trip) => sum + num(trip.distance),
        0,
      );

      const revenue = vehicleCompletedTrips.reduce(
        (sum, trip) => sum + num(trip.revenue),
        0,
      );

      const operationalFuel = vehicleCompletedTrips.reduce(
        (sum, trip) => sum + num(trip.fuelUsed),
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

      const maintenanceCost =
        vehicleMaintenance.reduce(
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

      const result =
        revenue - totalVehicleCost;

      const margin =
        revenue > 0
          ? (result / revenue) * 100
          : 0;

      const revenuePerKm =
        distance > 0
          ? revenue / distance
          : 0;

      const costPerKm =
        distance > 0
          ? totalVehicleCost / distance
          : 0;

      const fuelEfficiency =
        operationalFuel > 0
          ? distance / operationalFuel
          : 0;

      return {
        code,
        status: vehicle.status || "Unknown",
        trips: vehicleTrips.length,
        completedTrips: vehicleCompletedTrips.length,
        distance,
        revenue,
        fuelLiters,
        fuelCost,
        maintenanceCost,
        maintenanceEvents:
          vehicleMaintenance.length,
        otherExpenses,
        totalVehicleCost,
        result,
        margin,
        revenuePerKm,
        costPerKm,
        fuelEfficiency,
      };
    });

    /*
     * FLEET BENCHMARKS
     */
    const activeVehicles = vehicleData.filter(
      (vehicle) =>
        vehicle.status.toLowerCase() !==
        "inactive",
    );

    const activeWithFuel = activeVehicles.filter(
      (vehicle) => vehicle.fuelEfficiency > 0,
    );

    const averageRevenuePerKm =
      activeVehicles.length > 0
        ? activeVehicles.reduce(
            (sum, vehicle) =>
              sum + vehicle.revenuePerKm,
            0,
          ) / activeVehicles.length
        : 0;

    const averageCostPerKm =
      activeVehicles.length > 0
        ? activeVehicles.reduce(
            (sum, vehicle) =>
              sum + vehicle.costPerKm,
            0,
          ) / activeVehicles.length
        : 0;

    const averageFuelEfficiency =
      activeWithFuel.length > 0
        ? activeWithFuel.reduce(
            (sum, vehicle) =>
              sum + vehicle.fuelEfficiency,
            0,
          ) / activeWithFuel.length
        : 0;

    const averageMaintenanceCost =
      activeVehicles.length > 0
        ? activeVehicles.reduce(
            (sum, vehicle) =>
              sum + vehicle.maintenanceCost,
            0,
          ) / activeVehicles.length
        : 0;

    const averageMaintenanceEvents =
      activeVehicles.length > 0
        ? activeVehicles.reduce(
            (sum, vehicle) =>
              sum + vehicle.maintenanceEvents,
            0,
          ) / activeVehicles.length
        : 0;

    /*
     * FLEET-LEVEL ALERTS
     */

    if (totalResult < 0) {
      addAlert(
        "Critical",
        "Financial",
        "Fleet operating result is negative",
        `The fleet generated ${money(
          totalRevenue,
        )} in revenue against ${money(
          totalCost,
        )} in operating costs.`,
        "Review vehicle profitability, route performance, fuel consumption, maintenance, and operating expenses.",
      );
    }

    if (
      totalRevenue > 0 &&
      fleetMargin < 10
    ) {
      addAlert(
        "High",
        "Profitability",
        "Fleet operating margin is below target",
        `Current fleet operating margin is ${percent(
          fleetMargin,
        )}.`,
        "Review low-margin vehicles and prioritize improvements in revenue per km and cost per km.",
      );
    }

    if (
      totalRevenue > 0 &&
      fleetMargin >= 25
    ) {
      addAlert(
        "Low",
        "Profitability",
        "Fleet profitability is strong",
        `The fleet is currently operating at a ${percent(
          fleetMargin,
        )} margin.`,
        "Continue monitoring the strongest vehicles and replicate their operating practices where possible.",
      );
    }

    if (
      totalDistance > 0 &&
      operationalFuelEfficiency > 0 &&
      operationalFuelEfficiency <
        Math.max(
          2.5,
          averageFuelEfficiency * 0.75,
        )
    ) {
      addAlert(
        "High",
        "Fuel Efficiency",
        "Fleet fuel efficiency is significantly below benchmark",
        `Operational fuel efficiency is ${operationalFuelEfficiency.toFixed(
          2,
        )} km/L.`,
        "Investigate vehicle condition, driving behavior, idling, loads, and route efficiency.",
      );
    }

    if (
      totalDistance > 0 &&
      fleetCostPerKm >
        Math.max(
          0,
          averageCostPerKm * 1.25,
        )
    ) {
      addAlert(
        "High",
        "Operating Cost",
        "Fleet cost per km requires attention",
        `Fleet operating cost is ${money(
          fleetCostPerKm,
        )} per km.`,
        "Investigate vehicles with unusually high operating cost per km.",
      );
    }

    if (
      totalCost > 0 &&
      totalFuelCost / totalCost >= 0.5
    ) {
      addAlert(
        "High",
        "Fuel Cost",
        "Fuel is the dominant operating cost",
        `Fuel represents ${percent(
          (totalFuelCost / totalCost) * 100,
        )} of recorded operating costs.`,
        "Review fuel efficiency, high-consumption vehicles, routes, and fuel usage records.",
      );
    }

    if (
      totalDistance > 0 &&
      totalFuelLiters === 0
    ) {
      addAlert(
        "Medium",
        "Data Quality",
        "Fleet distance has no linked fuel purchase data",
        "Completed-trip distance exists, but no fuel purchase records are linked to the fleet.",
        "Verify fuel records and vehicle codes before relying heavily on fuel-cost analysis.",
      );
    }

    if (
      completedTrips.length === 0 &&
      trips.length > 0
    ) {
      addAlert(
        "Medium",
        "Trip Status",
        "No completed trips are available for analysis",
        `${trips.length} trip records exist, but none are currently marked as completed.`,
        "Review trip statuses so completed operations can be included in profitability and efficiency analysis.",
      );
    }

    /*
     * VEHICLE ALERTS
     */
    vehicleData.forEach((vehicle) => {
      const {
        code,
        status,
        trips: vehicleTripCount,
        completedTrips: vehicleCompletedTripCount,
        distance,
        revenue,
        fuelLiters,
        fuelCost,
        maintenanceCost,
        maintenanceEvents,
        totalVehicleCost,
        result,
        margin,
        revenuePerKm,
        costPerKm,
        fuelEfficiency,
      } = vehicle;

      const isInactive =
        status.toLowerCase() === "inactive";

      /*
       * LOSS-MAKING
       */
      if (
        result < 0 &&
        totalVehicleCost > 0
      ) {
        addAlert(
          "Critical",
          "Profitability",
          `${code} is operating at a loss`,
          `${code} generated ${money(
            revenue,
          )} in revenue against ${money(
            totalVehicleCost,
          )} in operating costs.`,
          "Review this vehicle's assignments, routes, fuel consumption, maintenance, and expenses.",
          code,
        );
      }

      /*
       * VERY LOW MARGIN
       */
      if (
        revenue > 0 &&
        margin < 10 &&
        result >= 0
      ) {
        addAlert(
          "High",
          "Profitability",
          `${code} has a weak operating margin`,
          `${code} is profitable but operating at only ${percent(
            margin,
          )} margin.`,
          "Review pricing, route profitability, fuel costs, and maintenance spending.",
          code,
        );
      }

      /*
       * LOW REVENUE / KM
       */
      if (
        distance > 0 &&
        averageRevenuePerKm > 0 &&
        revenuePerKm <
          averageRevenuePerKm * 0.75
      ) {
        addAlert(
          "High",
          "Revenue Efficiency",
          `${code} has low revenue per km`,
          `${code} generates ${money(
            revenuePerKm,
          )} per km, significantly below the fleet benchmark.`,
          "Review route selection, pricing, utilization, and customer assignments.",
          code,
        );
      }

      /*
       * HIGH COST / KM
       */
      if (
        distance > 0 &&
        averageCostPerKm > 0 &&
        costPerKm >
          averageCostPerKm * 1.5
      ) {
        addAlert(
          "High",
          "Operating Cost",
          `${code} has unusually high cost per km`,
          `${code} costs approximately ${money(
            costPerKm,
          )} per km, above the fleet benchmark.`,
          "Investigate fuel, maintenance, and other vehicle-related expenses.",
          code,
        );
      }

      /*
       * FUEL EFFICIENCY
       */
      if (
        fuelEfficiency > 0 &&
        averageFuelEfficiency > 0 &&
        fuelEfficiency <
          averageFuelEfficiency * 0.75
      ) {
        addAlert(
          "High",
          "Fuel Efficiency",
          `${code} has poor fuel efficiency`,
          `${code} is averaging ${fuelEfficiency.toFixed(
            2,
          )} km/L, significantly below the fleet average.`,
          "Investigate fuel consumption, driving behavior, idling, vehicle condition, and route conditions.",
          code,
        );
      }

      /*
       * HIGH FUEL COST
       */
      if (
        fuelCost > 0 &&
        totalVehicleCost > 0 &&
        fuelCost / totalVehicleCost >= 0.5
      ) {
        addAlert(
          "Medium",
          "Fuel Cost",
          `${code} has a high fuel cost concentration`,
          `Fuel represents ${percent(
            (fuelCost / totalVehicleCost) * 100,
          )} of this vehicle's recorded operating cost.`,
          "Compare fuel consumption against distance and investigate abnormal fuel usage.",
          code,
        );
      }

      /*
       * MAINTENANCE
       */
      if (
        averageMaintenanceCost > 0 &&
        maintenanceCost >
          averageMaintenanceCost * 1.5
      ) {
        addAlert(
          "High",
          "Maintenance",
          `${code} has above-benchmark maintenance spending`,
          `${code} has ${money(
            maintenanceCost,
          )} in maintenance costs, significantly above the fleet average.`,
          "Review recurring repairs, maintenance history, and preventive service requirements.",
          code,
        );
      }

      if (
        maintenanceEvents >= 3 &&
        averageMaintenanceEvents > 0 &&
        maintenanceEvents >
          averageMaintenanceEvents * 1.5
      ) {
        addAlert(
          "Medium",
          "Maintenance Frequency",
          `${code} has frequent maintenance events`,
          `${code} has ${maintenanceEvents} maintenance records compared with a fleet average of ${averageMaintenanceEvents.toFixed(
            1,
          )}.`,
          "Review recurring faults and determine whether preventive maintenance or replacement is appropriate.",
          code,
        );
      }

      /*
       * UTILIZATION
       */
      if (vehicleTripCount === 0) {
        addAlert(
          "Medium",
          "Utilization",
          `${code} has no recorded trips`,
          "No trip activity is currently associated with this vehicle.",
          "Review whether the vehicle should be assigned work, repaired, or marked inactive.",
          code,
        );
      } else if (
        vehicleCompletedTripCount === 0
      ) {
        addAlert(
          "Medium",
          "Trip Status",
          `${code} has no completed trips`,
          `${code} has ${vehicleTripCount} trip record${
            vehicleTripCount === 1 ? "" : "s"
          }, but none are marked completed.`,
          "Review trip statuses and confirm whether completed operations are being recorded correctly.",
          code,
        );
      }

      /*
       * MISSING MAINTENANCE
       */
      if (
        vehicleCompletedTripCount > 0 &&
        maintenanceEvents === 0
      ) {
        addAlert(
          "Medium",
          "Preventive Maintenance",
          `${code} has no maintenance history`,
          `${code} has completed trip activity but no maintenance records.`,
          "Verify maintenance records and schedule a preventive inspection if necessary.",
          code,
        );
      }

      /*
       * MISSING FUEL DATA
       */
      if (
        distance > 0 &&
        fuelLiters === 0
      ) {
        addAlert(
          "Medium",
          "Data Quality",
          `${code} has no linked fuel purchase data`,
          `${code} has ${formatNumber(
            distance,
          )} km of completed-trip distance but no linked fuel purchase records.`,
          "Verify fuel records and confirm the vehicle code is consistent across modules.",
          code,
        );
      }

      /*
       * INACTIVE
       */
      if (isInactive) {
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

    return generated.sort(
      (a, b) =>
        priorityRank(a.priority) -
        priorityRank(b.priority),
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

  const uniqueVehiclesWithAlerts = new Set(
    alerts
      .map((alert) => alert.vehicleCode)
      .filter(Boolean),
  ).size;

  const criticalVehicleAlerts = alerts.filter(
    (alert) =>
      alert.priority === "Critical" &&
      alert.vehicleCode,
  ).length;

  if (loading) {
    return (
      <ProtectedPage permission="alerts">
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-5 text-lg font-semibold text-slate-700">
                Scanning FleetFlow...
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Checking operational, financial, fuel,
                maintenance, and utilization signals.
              </p>
            </div>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  if (error) {
    return (
      <ProtectedPage permission="alerts">
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
              <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                Monitoring Error
              </p>

              <h1 className="mt-2 text-2xl font-bold text-red-800">
                Alert Center could not load
              </h1>

              <p className="mt-2 text-sm text-red-700">
                {error}
              </p>

              <button
                onClick={loadData}
                className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Retry Scan
              </button>
            </div>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage permission="alerts">
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                  FleetFlow Monitoring
                </p>

                <h1 className="mt-2 text-3xl font-bold">
                  Alerts & Notifications
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                  A centralized decision-support feed for
                  financial, operational, fuel, maintenance,
                  utilization, and data-quality risks detected
                  across FleetFlow.
                </p>
              </div>

              <button
                onClick={loadData}
                disabled={loading}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? "Scanning..." : "Scan Again"}
              </button>
            </div>
          </section>

          {/* Summary */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(
              [
                {
                  label: "Critical",
                  count: criticalCount,
                  description: "Immediate attention",
                  value: "Critical" as const,
                  active:
                    filter === "Critical",
                  classes:
                    "border-red-200 bg-white hover:border-red-400",
                  activeClasses:
                    "border-red-400 bg-red-50",
                  text: "text-red-600",
                },
                {
                  label: "High",
                  count: highCount,
                  description: "Action recommended",
                  value: "High" as const,
                  active:
                    filter === "High",
                  classes:
                    "border-orange-200 bg-white hover:border-orange-400",
                  activeClasses:
                    "border-orange-400 bg-orange-50",
                  text: "text-orange-600",
                },
                {
                  label: "Medium",
                  count: mediumCount,
                  description: "Monitor closely",
                  value: "Medium" as const,
                  active:
                    filter === "Medium",
                  classes:
                    "border-yellow-200 bg-white hover:border-yellow-400",
                  activeClasses:
                    "border-yellow-400 bg-yellow-50",
                  text: "text-yellow-600",
                },
                {
                  label: "Low",
                  count: lowCount,
                  description: "Informational",
                  value: "Low" as const,
                  active:
                    filter === "Low",
                  classes:
                    "border-emerald-200 bg-white hover:border-emerald-400",
                  activeClasses:
                    "border-emerald-400 bg-emerald-50",
                  text: "text-emerald-600",
                },
              ] as const
            ).map((item) => (
              <button
                key={item.value}
                onClick={() =>
                  setFilter(item.value)
                }
                className={`rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 ${
                  item.active
                    ? item.activeClasses
                    : item.classes
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    {item.label} Alerts
                  </p>

                  <span
                    className={`text-xs font-bold ${item.text}`}
                  >
                    {item.description}
                  </span>
                </div>

                <p
                  className={`mt-3 text-3xl font-bold ${item.text}`}
                >
                  {item.count}
                </p>
              </button>
            ))}
          </section>

          {/* Alert Health */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Alerts
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {alerts.length}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Generated from current data
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Vehicles With Alerts
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {uniqueVehiclesWithAlerts}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Vehicles requiring review
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Critical Vehicle Alerts
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {criticalVehicleAlerts}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Highest-priority vehicle signals
              </p>
            </div>
          </section>

          {/* Filter */}
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
                  onClick={() =>
                    setFilter(option)
                  }
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

          {/* Alert Feed */}
          <section className="space-y-4">
            {filteredAlerts.map((alert) => (
              <article
                key={alert.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div
                      className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${priorityDot(
                        alert.priority,
                      )}`}
                    />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${priorityClasses(
                            alert.priority,
                          )}`}
                        >
                          {alert.priority}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {alert.category}
                        </span>

                        {alert.vehicleCode && (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
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

                  <div className="w-full rounded-xl bg-slate-50 p-4 xl:max-w-[380px]">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                      Suggested Response
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {alert.action}
                    </p>
                  </div>
                </div>
              </article>
            ))}

            {filteredAlerts.length === 0 && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-600">
                  ✓
                </div>

                <h3 className="mt-4 text-lg font-bold text-emerald-800">
                  No alerts in this category
                </h3>

                <p className="mt-2 text-sm text-emerald-700">
                  FleetFlow did not detect any issues
                  matching the selected priority.
                </p>
              </div>
            )}
          </section>

          {/* Monitoring Logic */}
          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Automated Monitoring
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              What FleetFlow Monitors
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Alerts are generated from the same operational
              signals used throughout FleetFlow Intelligence.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [
                  "01",
                  "Financial",
                  "Detects operating losses, weak margins, and poor revenue efficiency.",
                ],
                [
                  "02",
                  "Fuel",
                  "Monitors fuel efficiency, fuel cost concentration, and missing fuel data.",
                ],
                [
                  "03",
                  "Maintenance",
                  "Identifies unusually high maintenance spending and recurring service activity.",
                ],
                [
                  "04",
                  "Utilization",
                  "Detects idle vehicles, incomplete trip data, and underused capacity.",
                ],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="rounded-xl bg-white p-5 shadow-sm"
                >
                  <p className="text-xs font-bold text-blue-600">
                    {number}
                  </p>

                  <h3 className="mt-2 font-bold text-slate-900">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Model Note */}
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Monitoring Model
            </p>

            <h2 className="mt-2 text-lg font-bold text-slate-900">
              Decision-support alerts
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              FleetFlow alerts are generated from operational
              rules, fleet-relative benchmarks, and current
              transaction data. They are designed to prioritize
              management attention rather than replace human
              operational judgment. Future versions can add
              historical alert trends, alert acknowledgement,
              escalation workflows, and machine-learning-based
              anomaly detection.
            </p>
          </section>

          <footer className="border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
            FleetFlow Alert Center • Automated Operational
            Decision Support
          </footer>
        </div>
      </main>
    </ProtectedPage>
  );
}

