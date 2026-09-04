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

interface VehicleFuelAnalysis {
  vehicleCode: string;
  status: string;
  fuelLiters: number;
  fuelCost: number;
  distance: number;
  fuelEfficiency: number;
  costPerKm: number;
  trips: number;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  reasons: string[];
}

const API_URL = "http://localhost:3001";

function number(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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

      const [vehiclesRes, tripsRes, fuelRes] = await Promise.all([
        fetch(`${API_URL}/vehicles`),
        fetch(`${API_URL}/trips`),
        fetch(`${API_URL}/fuel`),
      ]);

      if (!vehiclesRes.ok || !tripsRes.ok || !fuelRes.ok) {
        throw new Error("Failed to load fuel intelligence data.");
      }

      const [vehiclesData, tripsData, fuelData] = await Promise.all([
        vehiclesRes.json(),
        tripsRes.json(),
        fuelRes.json(),
      ]);

      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setTrips(Array.isArray(tripsData) ? tripsData : []);
      setFuel(Array.isArray(fuelData) ? fuelData : []);
    } catch (err) {
      console.error(err);
      setError("Could not connect to the FleetFlow backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const analysis = useMemo<VehicleFuelAnalysis[]>(() => {
    return vehicles.map((vehicle) => {
      const vehicleCode =
        vehicle.vehicleCode || `Vehicle #${vehicle.id}`;

      const vehicleTrips = trips.filter(
        (trip) => trip.vehicleCode === vehicleCode
      );

      const vehicleFuel = fuel.filter(
        (record) => record.vehicleCode === vehicleCode
      );

      const fuelLiters = vehicleFuel.reduce(
        (sum, record) => sum + number(record.liters),
        0
      );

      const fuelCost = vehicleFuel.reduce(
        (sum, record) => sum + number(record.cost),
        0
      );

      const distance = vehicleTrips.reduce(
        (sum, trip) => sum + number(trip.distance),
        0
      );

      const fuelEfficiency =
        fuelLiters > 0 ? distance / fuelLiters : 0;

      const costPerKm =
        distance > 0 ? fuelCost / distance : 0;

      let riskScore = 0;
      const reasons: string[] = [];

      // Poor fuel efficiency
      if (fuelEfficiency > 0 && fuelEfficiency < 3) {
        riskScore += 35;
        reasons.push("Very poor fuel efficiency");
      } else if (fuelEfficiency > 0 && fuelEfficiency < 4) {
        riskScore += 20;
        reasons.push("Below-average fuel efficiency");
      }

      // High fuel cost
      if (fuelCost >= 25000) {
        riskScore += 30;
        reasons.push("Very high fuel cost");
      } else if (fuelCost >= 15000) {
        riskScore += 15;
        reasons.push("High fuel cost");
      }

      // High cost per kilometer
      if (costPerKm >= 50) {
        riskScore += 25;
        reasons.push("High fuel cost per kilometer");
      } else if (costPerKm >= 30) {
        riskScore += 15;
        reasons.push("Elevated fuel cost per kilometer");
      }

      // No recorded distance
      if (fuelLiters > 0 && distance === 0) {
        riskScore += 20;
        reasons.push("Fuel recorded without trip distance");
      }

      // No fuel records
      if (vehicleTrips.length > 0 && fuelLiters === 0) {
        riskScore += 15;
        reasons.push("Trips recorded without fuel data");
      }

      riskScore = Math.min(riskScore, 100);

      let riskLevel: VehicleFuelAnalysis["riskLevel"] = "Low";

      if (riskScore >= 70) {
        riskLevel = "Critical";
      } else if (riskScore >= 45) {
        riskLevel = "High";
      } else if (riskScore >= 20) {
        riskLevel = "Medium";
      }

      if (reasons.length === 0) {
        reasons.push("Fuel performance is within normal range");
      }

      return {
        vehicleCode,
        status: vehicle.status || "Unknown",
        fuelLiters,
        fuelCost,
        distance,
        fuelEfficiency,
        costPerKm,
        trips: vehicleTrips.length,
        riskScore,
        riskLevel,
        reasons,
      };
    });
  }, [vehicles, trips, fuel]);

  const totals = useMemo(() => {
    const fuelLiters = analysis.reduce(
      (sum, item) => sum + item.fuelLiters,
      0
    );

    const fuelCost = analysis.reduce(
      (sum, item) => sum + item.fuelCost,
      0
    );

    const distance = analysis.reduce(
      (sum, item) => sum + item.distance,
      0
    );

    const efficiency =
      fuelLiters > 0 ? distance / fuelLiters : 0;

    const costPerKm =
      distance > 0 ? fuelCost / distance : 0;

    return {
      fuelLiters,
      fuelCost,
      distance,
      efficiency,
      costPerKm,
    };
  }, [analysis]);

  const criticalCount = analysis.filter(
    (item) => item.riskLevel === "Critical"
  ).length;

  const highCount = analysis.filter(
    (item) => item.riskLevel === "High"
  ).length;

  const mediumCount = analysis.filter(
    (item) => item.riskLevel === "Medium"
  ).length;

  const lowCount = analysis.filter(
    (item) => item.riskLevel === "Low"
  ).length;

  const highestFuelConsumer =
    [...analysis].sort(
      (a, b) => b.fuelCost - a.fuelCost
    )[0];

  const worstEfficiency =
    [...analysis]
      .filter((item) => item.fuelEfficiency > 0)
      .sort(
        (a, b) => a.fuelEfficiency - b.fuelEfficiency
      )[0];

  const mostEfficient =
    [...analysis]
      .filter((item) => item.fuelEfficiency > 0)
      .sort(
        (a, b) => b.fuelEfficiency - a.fuelEfficiency
      )[0];

  function formatMoney(value: number) {
    return `${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ETB`;
  }

  function formatNumber(value: number, decimals = 2) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function riskBadge(level: VehicleFuelAnalysis["riskLevel"]) {
    const styles = {
      Critical: "bg-red-100 text-red-700",
      High: "bg-orange-100 text-orange-700",
      Medium: "bg-yellow-100 text-yellow-700",
      Low: "bg-green-100 text-green-700",
    };

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[level]}`}
      >
        {level}
      </span>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-600">
              Loading Fuel Intelligence...
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
              Fuel Intelligence
            </h1>

            <p className="mt-2 text-red-600">{error}</p>

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
              Fuel Intelligence
            </h1>

            <p className="mt-2 text-slate-500">
              Detect fuel inefficiency, abnormal consumption and
              vehicle fuel risks.
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
              {formatMoney(totals.fuelCost)}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Across {analysis.length} vehicles
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Fuel Consumption
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {formatNumber(totals.fuelLiters)} L
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Recorded fuel usage
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Fleet Efficiency
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {formatNumber(totals.efficiency)} km/L
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Distance per liter
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Fuel Cost / KM
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {formatMoney(totals.costPerKm)}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Average fuel cost per kilometer
            </p>
          </div>
        </section>

        {/* RISK SUMMARY */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Fuel Risk Summary
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
        <section className="grid gap-6 lg:grid-cols-3">
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
                  {formatMoney(highestFuelConsumer.fuelCost)}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {formatNumber(highestFuelConsumer.fuelLiters)} liters
                </p>
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
                  {formatNumber(worstEfficiency.fuelEfficiency)} km/L
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Requires fuel efficiency review
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
                  {formatNumber(mostEfficient.fuelEfficiency)} km/L
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Best recorded fuel efficiency
                </p>
              </>
            ) : (
              <p className="mt-3 text-slate-400">
                No efficiency data available.
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
              Automated analysis of fuel usage and efficiency.
            </p>
          </div>

          {analysis.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No vehicles found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
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
                      Cost / KM
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Risk
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {[...analysis]
                    .sort((a, b) => b.riskScore - a.riskScore)
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

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.trips}
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-700">
                            {formatNumber(item.fuelLiters)} L
                          </div>

                          <div className="text-xs text-slate-400">
                            {formatMoney(item.fuelCost)}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatNumber(item.distance, 0)} km
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-semibold ${
                              item.fuelEfficiency > 0 &&
                              item.fuelEfficiency < 3
                                ? "text-red-600"
                                : item.fuelEfficiency < 4
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {item.fuelEfficiency > 0
                              ? `${formatNumber(item.fuelEfficiency)} km/L`
                              : "N/A"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {item.costPerKm > 0
                            ? formatMoney(item.costPerKm)
                            : "N/A"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-2">
                            {riskBadge(item.riskLevel)}

                            <span className="text-xs text-slate-400">
                              Score: {item.riskScore}/100
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

        {/* RISK DETAILS */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Fuel Risk Detection
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            FleetFlow automatically identifies potential fuel
            problems.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {analysis
              .filter(
                (item) =>
                  item.riskLevel === "Critical" ||
                  item.riskLevel === "High"
              )
              .sort((a, b) => b.riskScore - a.riskScore)
              .map((item) => (
                <div
                  key={item.vehicleCode}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">
                      {item.vehicleCode}
                    </h3>

                    {riskBadge(item.riskLevel)}
                  </div>

                  <ul className="mt-4 space-y-2">
                    {item.reasons.map((reason) => (
                      <li
                        key={reason}
                        className="text-sm text-slate-600"
                      >
                        • {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

            {analysis.filter(
              (item) =>
                item.riskLevel === "Critical" ||
                item.riskLevel === "High"
            ).length === 0 && (
              <div className="rounded-xl bg-green-50 p-5 text-sm text-green-700 md:col-span-2">
                No high-risk fuel issues detected.
              </div>
            )}
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
              <p className="text-lg font-bold">01</p>
              <h3 className="mt-2 font-semibold">
                Collect Data
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Fuel records and trip distances are collected
                from FleetFlow.
              </p>
            </div>

            <div>
              <p className="text-lg font-bold">02</p>
              <h3 className="mt-2 font-semibold">
                Calculate Efficiency
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Fuel consumption is compared against vehicle
                distance.
              </p>
            </div>

            <div>
              <p className="text-lg font-bold">03</p>
              <h3 className="mt-2 font-semibold">
                Detect Anomalies
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Unusual costs and inefficient fuel usage are
                automatically flagged.
              </p>
            </div>

            <div>
              <p className="text-lg font-bold">04</p>
              <h3 className="mt-2 font-semibold">
                Recommend Action
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Managers can identify vehicles that require
                investigation or optimization.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <div className="pb-4 text-center text-xs text-slate-400">
          FleetFlow Fuel Intelligence • Automated fleet fuel
          analysis
        </div>
      </div>
    </main>
  );
}
