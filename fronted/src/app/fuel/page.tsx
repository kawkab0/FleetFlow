"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedPage from "@/app/components/ProtectedPage";

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
  paymentMethod: string;
  notes: string | null;
}

const emptyForm = {
  fuelCode: "",
  vehicleCode: "",
  driverCode: "",
  fuelDate: "",
  liters: "",
  cost: "",
  fuelStation: "",
  odometer: "",
  paymentMethod: "Cash",
  notes: "",
};

export default function FuelPage() {
  const [fuelRecords, setFuelRecords] = useState<Fuel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [form, setForm] = useState(emptyForm);

  const fetchFuel = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const data = await apiFetch("/fuel");
      setFuelRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching fuel records:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to load fuel records.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFuel();
  }, []);

  const handleCreateFuel = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.fuelDate)) {
      setMessage({
        type: "error",
        text: "Please enter the date in YYYY-MM-DD format.",
      });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      await apiFetch("/fuel", {
        method: "POST",
        body: JSON.stringify({
          fuelCode: form.fuelCode,
          vehicleCode: form.vehicleCode,
          driverCode: form.driverCode,
          fuelDate: form.fuelDate,
          liters: Number(form.liters),
          cost: Number(form.cost),
          fuelStation: form.fuelStation,
          odometer: Number(form.odometer),
          paymentMethod: form.paymentMethod,
          notes: form.notes || null,
        }),
      });

      setForm(emptyForm);
      setShowForm(false);

      await fetchFuel(false);

      setMessage({
        type: "success",
        text: "Fuel record created successfully.",
      });
    } catch (error) {
      console.error("Error creating fuel record:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to create fuel record.",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    return date.substring(0, 10);
  };

  const formatNumber = (value: string | number, decimals = 2) =>
    Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });

  const filteredFuelRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return fuelRecords;

    return fuelRecords.filter((fuel) =>
      [
        fuel.fuelCode,
        fuel.vehicleCode,
        fuel.driverCode,
        fuel.fuelDate,
        fuel.fuelStation,
        fuel.paymentMethod,
        fuel.notes ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [fuelRecords, search]);

  const totalLiters = fuelRecords.reduce(
    (total, fuel) => total + Number(fuel.liters),
    0,
  );

  const totalCost = fuelRecords.reduce(
    (total, fuel) => total + Number(fuel.cost),
    0,
  );

  const averageCostPerLiter =
    totalLiters > 0 ? totalCost / totalLiters : 0;

  return (
    <ProtectedPage permission="fuel">
      <main className="ml-64 min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Fuel Management
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Fuel
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Track fuel consumption, operating costs, fuel stations,
                payment methods, and vehicle mileage.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fetchFuel(false)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <span>↻</span>
                    Refresh
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(!showForm);
                  setMessage(null);
                }}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                {showForm ? "Cancel" : "+ Add Fuel"}
              </button>
            </div>
          </div>

          {/* NOTIFICATION */}
          {message && (
            <div
              className={`mb-6 flex items-start justify-between gap-4 rounded-lg border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {message.type === "success" ? "✓" : "!"}
                </span>
                <span>{message.text}</span>
              </div>

              <button
                type="button"
                onClick={() => setMessage(null)}
                className="font-semibold opacity-60 transition hover:opacity-100"
              >
                ×
              </button>
            </div>
          )}

          {/* CREATE FORM */}
          {showForm && (
            <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Add Fuel Record
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter the fuel transaction and vehicle mileage details.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateFuel} className="p-6">
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                  {/* FUEL CODE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Fuel Code
                    </label>
                    <input
                      type="text"
                      value={form.fuelCode}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          fuelCode: e.target.value,
                        })
                      }
                      placeholder="e.g. FUEL-0001"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* VEHICLE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Vehicle Code
                    </label>
                    <input
                      type="text"
                      value={form.vehicleCode}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          vehicleCode: e.target.value,
                        })
                      }
                      placeholder="Vehicle code"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* DRIVER */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Driver Code
                    </label>
                    <input
                      type="text"
                      value={form.driverCode}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          driverCode: e.target.value,
                        })
                      }
                      placeholder="Driver code"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* DATE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Fuel Date
                    </label>
                    <input
                      type="text"
                      value={form.fuelDate}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          fuelDate: e.target.value,
                        })
                      }
                      placeholder="YYYY-MM-DD"
                      pattern="\d{4}-\d{2}-\d{2}"
                      maxLength={10}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* LITERS */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Liters
                    </label>
                    <input
                      type="number"
                      value={form.liters}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          liters: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* COST */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Cost
                    </label>
                    <input
                      type="number"
                      value={form.cost}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          cost: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* STATION */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Fuel Station
                    </label>
                    <input
                      type="text"
                      value={form.fuelStation}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          fuelStation: e.target.value,
                        })
                      }
                      placeholder="Station name"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* ODOMETER */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Odometer (km)
                    </label>
                    <input
                      type="number"
                      value={form.odometer}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          odometer: e.target.value,
                        })
                      }
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* PAYMENT METHOD */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Payment Method
                    </label>
                    <select
                      value={form.paymentMethod}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          paymentMethod: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Account">Account</option>
                    </select>
                  </div>

                  {/* NOTES */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={form.notes}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Optional notes"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-end gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save Fuel Record"}
                    </button>
                  </div>
                </div>
              </form>
            </section>
          )}

          {/* KPI CARDS */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Fuel Records
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {fuelRecords.length.toLocaleString()}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
                  ⛽
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Total recorded fuel transactions
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Liters
                  </p>
                  <p className="mt-2 text-2xl font-bold text-blue-600">
                    {formatNumber(totalLiters)} L
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
                  ◉
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Fuel volume consumed
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Fuel Cost
                  </p>
                  <p className="mt-2 text-2xl font-bold text-orange-600">
                    {formatNumber(totalCost)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-lg">
                  $
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Total recorded fuel expenditure
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Average Cost / Liter
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    {formatNumber(averageCostPerLiter)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-lg">
                  ↗
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Average fuel cost per liter
              </p>
            </div>
          </div>

          {/* REGISTRY */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            {/* TABLE HEADER */}
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Fuel Registry
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {search
                    ? `${filteredFuelRecords.length} of ${fuelRecords.length} records`
                    : `${fuelRecords.length} total records`}
                </p>
              </div>

              <div className="flex w-full gap-3 sm:w-auto">
                <div className="relative w-full sm:w-80">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    ⌕
                  </span>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search fuel records..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">

                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">
                      Fuel ID
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Vehicle
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Driver
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Date
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Liters
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Cost
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Station
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Odometer
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Payment
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {/* LOADING */}
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-14">
                        <div className="flex flex-col items-center justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                          <p className="mt-4 text-sm font-medium text-slate-600">
                            Loading fuel records...
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Please wait
                          </p>
                        </div>
                      </td>
                    </tr>

                  /* EMPTY / NO SEARCH RESULTS */
                  ) : filteredFuelRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-14">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                            ⛽
                          </div>

                          <h3 className="mt-4 text-sm font-semibold text-slate-900">
                            {search
                              ? "No matching fuel records"
                              : "No fuel records yet"}
                          </h3>

                          <p className="mt-1 max-w-sm text-sm text-slate-500">
                            {search
                              ? "Try a different search term or clear the search."
                              : "Add your first fuel record to start tracking fuel usage."}
                          </p>

                          {search ? (
                            <button
                              type="button"
                              onClick={() => setSearch("")}
                              className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              Clear Search
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowForm(true)}
                              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                              + Add Fuel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                  /* DATA */
                  ) : (
                    filteredFuelRecords.map((fuel) => (
                      <tr
                        key={fuel.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {fuel.fuelCode}
                          </div>

                          <div className="mt-0.5 text-xs text-slate-400">
                            Record #{fuel.id}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {fuel.vehicleCode}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-700">
                          {fuel.driverCode}
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-700">
                            {formatDate(fuel.fuelDate)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800">
                            {formatNumber(fuel.liters)}
                          </span>
                          <span className="ml-1 text-xs text-slate-400">
                            L
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800">
                            {formatNumber(fuel.cost)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {fuel.fuelStation}
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-700">
                            {formatNumber(fuel.odometer, 0)}
                          </span>
                          <span className="ml-1 text-xs text-slate-400">
                            km
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            {fuel.paymentMethod}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}

                </tbody>
              </table>
            </div>

            {/* TABLE FOOTER */}
            {!loading && filteredFuelRecords.length > 0 && (
              <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-3">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredFuelRecords.length}
                  </span>{" "}
                  fuel record
                  {filteredFuelRecords.length === 1 ? "" : "s"}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </ProtectedPage>
  );
}
