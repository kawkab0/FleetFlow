"use client";

import { useEffect, useMemo, useState } from "react";

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
  tripDate?: string;
  status?: string;
}

interface Maintenance {
  id: number;
  vehicleCode?: string;
  maintenanceDate?: string;
  maintenanceType?: string;
  cost?: number | string;
  mileage?: number | string;
  status?: string;
}

interface Fuel {
  id: number;
  vehicleCode?: string;
  liters?: number | string;
  cost?: number | string;
}

interface MaintenanceAnalysis {
  vehicleCode: string;
  status: string;
  maintenanceCount: number;
  maintenanceCost: number;
  latestMaintenanceDate: string;
  latestMileage: number;
  distance: number;
  fuelCost: number;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  healthScore: number;
  urgency: string;
  reasons: string[];
}

const API_URL = "http://localhost:3001";

function number(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function daysSince(dateString: string): number {
  if (!dateString) return 0;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 0;

  const today = new Date();

  const difference =
    today.getTime() - date.getTime();

  return Math.max(
    0,
    Math.floor(difference / (1000 * 60 * 60 * 24))
  );
}

export default function MaintenanceIntelligencePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [fuel, setFuel] = useState<Fuel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        vehiclesResponse,
        tripsResponse,
        maintenanceResponse,
        fuelResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/vehicles`),
        fetch(`${API_URL}/trips`),
        fetch(`${API_URL}/maintenance`),
        fetch(`${API_URL}/fuel`),
      ]);

      if (
        !vehiclesResponse.ok ||
        !tripsResponse.ok ||
        !maintenanceResponse.ok ||
        !fuelResponse.ok
      ) {
        throw new Error("Failed to load maintenance data.");
      }

      const [
        vehiclesData,
        tripsData,
        maintenanceData,
        fuelData,
      ] = await Promise.all([
        vehiclesResponse.json(),
        tripsResponse.json(),
        maintenanceResponse.json(),
        fuelResponse.json(),
      ]);

      setVehicles(
        Array.isArray(vehiclesData) ? vehiclesData : []
      );

      setTrips(
        Array.isArray(tripsData) ? tripsData : []
      );

      setMaintenance(
        Array.isArray(maintenanceData)
          ? maintenanceData
          : []
      );

      setFuel(
        Array.isArray(fuelData) ? fuelData : []
      );
    } catch (err) {
      console.error(err);
      setError(
        "Could not connect to the FleetFlow backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const analysis = useMemo<MaintenanceAnalysis[]>(() => {
    return vehicles.map((vehicle) => {
      const vehicleCode =
        vehicle.vehicleCode ||
        `Vehicle #${vehicle.id}`;

      const vehicleMaintenance = maintenance.filter(
        (record) =>
          record.vehicleCode === vehicleCode
      );

      const vehicleTrips = trips.filter(
        (trip) =>
          trip.vehicleCode === vehicleCode
      );

      const vehicleFuel = fuel.filter(
        (record) =>
          record.vehicleCode === vehicleCode
      );

      const maintenanceCost =
        vehicleMaintenance.reduce(
          (sum, record) =>
            sum + number(record.cost),
          0
        );

      const distance = vehicleTrips.reduce(
        (sum, trip) =>
          sum + number(trip.distance),
        0
      );

      const fuelCost = vehicleFuel.reduce(
        (sum, record) =>
          sum + number(record.cost),
        0
      );

      const sortedMaintenance =
        [...vehicleMaintenance].sort(
          (a, b) =>
            new Date(
              b.maintenanceDate || ""
            ).getTime() -
            new Date(
              a.maintenanceDate || ""
            ).getTime()
        );

      const latestMaintenance =
        sortedMaintenance[0];

      const latestMaintenanceDate =
        latestMaintenance?.maintenanceDate || "";

      const latestMileage =
        number(latestMaintenance?.mileage);

      const daysFromMaintenance =
        daysSince(latestMaintenanceDate);

      let riskScore = 0;

      const reasons: string[] = [];

      // Maintenance frequency
      if (vehicleMaintenance.length === 0) {
        riskScore += 35;
        reasons.push(
          "No recorded maintenance history"
        );
      } else if (
        vehicleMaintenance.length >= 5
      ) {
        riskScore += 20;
        reasons.push(
          "Frequent maintenance activity"
        );
      } else if (
        vehicleMaintenance.length >= 3
      ) {
        riskScore += 10;
        reasons.push(
          "Multiple maintenance events"
        );
      }

      // Time since maintenance
      if (daysFromMaintenance >= 180) {
        riskScore += 30;
        reasons.push(
          "Long period since last maintenance"
        );
      } else if (daysFromMaintenance >= 90) {
        riskScore += 20;
        reasons.push(
          "Maintenance may be overdue"
        );
      } else if (daysFromMaintenance >= 60) {
        riskScore += 10;
        reasons.push(
          "Maintenance interval increasing"
        );
      }

      // Maintenance cost
      if (maintenanceCost >= 20000) {
        riskScore += 25;
        reasons.push(
          "Very high maintenance cost"
        );
      } else if (maintenanceCost >= 10000) {
        riskScore += 15;
        reasons.push(
          "High maintenance cost"
        );
      } else if (maintenanceCost >= 5000) {
        riskScore += 8;
        reasons.push(
          "Elevated maintenance cost"
        );
      }

      // Heavy vehicle usage
      if (distance >= 5000) {
        riskScore += 20;
        reasons.push(
          "High accumulated trip distance"
        );
      } else if (distance >= 2500) {
        riskScore += 10;
        reasons.push(
          "Moderate accumulated trip distance"
        );
      }

      // Fuel usage can indicate operational intensity
      const fuelLiters = vehicleFuel.reduce(
        (sum, record) =>
          sum + number(record.liters),
        0
      );

      if (fuelLiters >= 1000) {
        riskScore += 10;
        reasons.push(
          "High recorded fuel consumption"
        );
      }

      // Inactive vehicle
      if (
        vehicle.status &&
        vehicle.status.toLowerCase() ===
          "inactive"
      ) {
        riskScore += 5;
        reasons.push(
          "Vehicle is currently inactive"
        );
      }

      riskScore = Math.min(
        riskScore,
        100
      );

      let riskLevel:
        MaintenanceAnalysis["riskLevel"] =
        "Low";

      if (riskScore >= 70) {
        riskLevel = "Critical";
      } else if (riskScore >= 45) {
        riskLevel = "High";
      } else if (riskScore >= 20) {
        riskLevel = "Medium";
      }

      const healthScore =
        Math.max(0, 100 - riskScore);

      let urgency = "Routine monitoring";

      if (riskLevel === "Critical") {
        urgency =
          "Immediate maintenance review";
      } else if (riskLevel === "High") {
        urgency =
          "Schedule maintenance soon";
      } else if (riskLevel === "Medium") {
        urgency =
          "Monitor and plan maintenance";
      }

      if (reasons.length === 0) {
        reasons.push(
          "Vehicle maintenance profile is healthy"
        );
      }

      return {
        vehicleCode,
        status:
          vehicle.status || "Unknown",
        maintenanceCount:
          vehicleMaintenance.length,
        maintenanceCost,
        latestMaintenanceDate,
        latestMileage,
        distance,
        fuelCost,
        riskScore,
        riskLevel,
        healthScore,
        urgency,
        reasons,
      };
    });
  }, [
    vehicles,
    trips,
    maintenance,
    fuel,
  ]);

  const totals = useMemo(() => {
    const maintenanceCost =
      analysis.reduce(
        (sum, item) =>
          sum + item.maintenanceCost,
        0
      );

    const distance =
      analysis.reduce(
        (sum, item) =>
          sum + item.distance,
        0
      );

    const maintenanceEvents =
      analysis.reduce(
        (sum, item) =>
          sum + item.maintenanceCount,
        0
      );

    const averageHealth =
      analysis.length > 0
        ? analysis.reduce(
            (sum, item) =>
              sum + item.healthScore,
            0
          ) / analysis.length
        : 0;

    return {
      maintenanceCost,
      distance,
      maintenanceEvents,
      averageHealth,
    };
  }, [analysis]);

  const criticalCount =
    analysis.filter(
      (item) =>
        item.riskLevel === "Critical"
    ).length;

  const highCount =
    analysis.filter(
      (item) =>
        item.riskLevel === "High"
    ).length;

  const mediumCount =
    analysis.filter(
      (item) =>
        item.riskLevel === "Medium"
    ).length;

  const lowCount =
    analysis.filter(
      (item) =>
        item.riskLevel === "Low"
    ).length;

  const highestRiskVehicle =
    [...analysis].sort(
      (a, b) =>
        b.riskScore - a.riskScore
    )[0];

  const highestMaintenanceCost =
    [...analysis].sort(
      (a, b) =>
        b.maintenanceCost -
        a.maintenanceCost
    )[0];

  const healthiestVehicle =
    [...analysis].sort(
      (a, b) =>
        b.healthScore -
        a.healthScore
    )[0];

  function formatMoney(
    value: number
  ) {
    return `${value.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )} ETB`;
  }

  function formatNumber(
    value: number,
    decimals = 2
  ) {
    return value.toLocaleString(
      undefined,
      {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }
    );
  }

  function riskBadge(
    level: MaintenanceAnalysis["riskLevel"]
  ) {
    const styles = {
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

  function healthBarColor(
    score: number
  ) {
    if (score >= 70) {
      return "bg-green-500";
    }

    if (score >= 45) {
      return "bg-yellow-500";
    }

    if (score >= 20) {
      return "bg-orange-500";
    }

    return "bg-red-500";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-600">
              Loading Maintenance Intelligence...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-xl font-bold text-red-700">
              Maintenance Intelligence
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
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              FLEET INTELLIGENCE
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Predictive Maintenance Intelligence
            </h1>

            <p className="mt-2 text-slate-500">
              Identify maintenance risks before they become
              expensive operational problems.
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
              Maintenance Cost
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {formatMoney(
                totals.maintenanceCost
              )}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Total recorded maintenance spending
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Maintenance Events
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {totals.maintenanceEvents}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Recorded service events
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Fleet Health
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {formatNumber(
                totals.averageHealth,
                0
              )}
              /100
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Average vehicle health score
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Fleet Distance
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {formatNumber(
                totals.distance,
                0
              )}{" "}
              km
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Recorded trip distance
            </p>
          </div>
        </section>

        {/* RISK SUMMARY */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Maintenance Risk Summary
          </h2>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Critical Risk
              </p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                {criticalCount}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Immediate maintenance review
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
                Maintenance should be scheduled
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
                Continue monitoring
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
                Healthy maintenance profile
              </p>
            </div>
          </div>
        </section>

        {/* HIGHLIGHTS */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Highest Maintenance Risk
            </p>

            {highestRiskVehicle ? (
              <>
                <h3 className="mt-3 text-xl font-bold text-slate-900">
                  {highestRiskVehicle.vehicleCode}
                </h3>

                <div className="mt-3">
                  {riskBadge(
                    highestRiskVehicle.riskLevel
                  )}
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  Risk score:{" "}
                  {highestRiskVehicle.riskScore}
                  /100
                </p>
              </>
            ) : (
              <p className="mt-3 text-slate-400">
                No vehicle data available.
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Highest Maintenance Cost
            </p>

            {highestMaintenanceCost ? (
              <>
                <h3 className="mt-3 text-xl font-bold text-slate-900">
                  {
                    highestMaintenanceCost.vehicleCode
                  }
                </h3>

                <p className="mt-2 text-sm font-semibold text-orange-600">
                  {formatMoney(
                    highestMaintenanceCost.maintenanceCost
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {
                    highestMaintenanceCost.maintenanceCount
                  }{" "}
                  maintenance events
                </p>
              </>
            ) : (
              <p className="mt-3 text-slate-400">
                No maintenance data available.
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Healthiest Vehicle
            </p>

            {healthiestVehicle ? (
              <>
                <h3 className="mt-3 text-xl font-bold text-green-600">
                  {healthiestVehicle.vehicleCode}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Health score:{" "}
                  {healthiestVehicle.healthScore}
                  /100
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Lowest maintenance risk
                </p>
              </>
            ) : (
              <p className="mt-3 text-slate-400">
                No vehicle data available.
              </p>
            )}
          </div>
        </section>

        {/* VEHICLE HEALTH TABLE */}
        <section className="rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Vehicle Health & Maintenance Risk
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Automated assessment based on maintenance history,
              usage and operating cost.
            </p>
          </div>

          {analysis.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No vehicles found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Vehicle
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Maintenance
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Cost
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Distance
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Health
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Risk
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Urgency
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {[...analysis]
                    .sort(
                      (a, b) =>
                        b.riskScore -
                        a.riskScore
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
                            {item.status}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-700">
                            {
                              item.maintenanceCount
                            }{" "}
                            events
                          </p>

                          <p className="text-xs text-slate-400">
                            {item.latestMaintenanceDate
                              ? `Last: ${item.latestMaintenanceDate}`
                              : "No record"}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {formatMoney(
                            item.maintenanceCost
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatNumber(
                            item.distance,
                            0
                          )}{" "}
                          km
                        </td>

                        <td className="px-6 py-4">
                          <div className="w-32">
                            <div className="mb-1 flex justify-between text-xs">
                              <span className="text-slate-400">
                                Health
                              </span>

                              <span className="font-semibold text-slate-700">
                                {
                                  item.healthScore
                                }
                                %
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className={`h-full rounded-full ${healthBarColor(
                                  item.healthScore
                                )}`}
                                style={{
                                  width: `${item.healthScore}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-2">
                            {riskBadge(
                              item.riskLevel
                            )}

                            <span className="text-xs text-slate-400">
                              Score:{" "}
                              {
                                item.riskScore
                              }
                              /100
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.urgency}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* RISK DETAILS */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Vehicles Requiring Attention
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            FleetFlow explains the factors behind each
            maintenance risk score.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {analysis
              .filter(
                (item) =>
                  item.riskLevel ===
                    "Critical" ||
                  item.riskLevel === "High"
              )
              .sort(
                (a, b) =>
                  b.riskScore -
                  a.riskScore
              )
              .map((item) => (
                <div
                  key={item.vehicleCode}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">
                      {item.vehicleCode}
                    </h3>

                    {riskBadge(
                      item.riskLevel
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-700">
                      Risk factors
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
                      Recommended Action
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {item.urgency}
                    </p>
                  </div>
                </div>
              ))}

            {analysis.filter(
              (item) =>
                item.riskLevel ===
                  "Critical" ||
                item.riskLevel === "High"
            ).length === 0 && (
              <div className="rounded-xl bg-green-50 p-5 text-sm text-green-700 md:col-span-2">
                No high-risk maintenance issues
                detected.
              </div>
            )}
          </div>
        </section>

        {/* INTELLIGENCE METHOD */}
        <section className="rounded-2xl bg-slate-900 p-8 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            FLEETFLOW INTELLIGENCE
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            How Predictive Maintenance Works
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-4">
            <div>
              <p className="text-lg font-bold">
                01
              </p>

              <h3 className="mt-2 font-semibold">
                Analyze History
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                FleetFlow examines previous maintenance
                events and service patterns.
              </p>
            </div>

            <div>
              <p className="text-lg font-bold">
                02
              </p>

              <h3 className="mt-2 font-semibold">
                Measure Usage
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Trip distance and fuel consumption indicate
                operational intensity.
              </p>
            </div>

            <div>
              <p className="text-lg font-bold">
                03
              </p>

              <h3 className="mt-2 font-semibold">
                Calculate Risk
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Multiple indicators are combined into a
                maintenance risk score.
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
                Managers receive clear maintenance priorities
                before problems become costly.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <div className="pb-4 text-center text-xs text-slate-400">
          FleetFlow Predictive Maintenance Intelligence •
          Vehicle health and maintenance risk analysis
        </div>
      </div>
    </main>
  );
}
