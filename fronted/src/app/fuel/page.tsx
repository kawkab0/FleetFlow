"use client";

import { useEffect, useState } from "react";

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

export default function FuelPage() {
  const [fuelRecords, setFuelRecords] = useState<Fuel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
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
  });

  const fetchFuel = async () => {
    try {
      const response = await fetch("http://localhost:3001/fuel");

      if (!response.ok) {
        throw new Error("Failed to fetch fuel records");
      }

      const data = await response.json();
      setFuelRecords(data);
    } catch (error) {
      console.error("Error fetching fuel records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuel();
  }, []);

  const handleCreateFuel = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.fuelDate)) {
      alert("Please enter the date in YYYY-MM-DD format.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/fuel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      if (!response.ok) {
        throw new Error("Failed to create fuel record");
      }

      setForm({
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
      });

      setShowForm(false);
      fetchFuel();
    } catch (error) {
      console.error("Error creating fuel record:", error);
      alert("Failed to create fuel record.");
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "";

    return date.substring(0, 10);
  };

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
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              FUEL MANAGEMENT
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Fuel
            </h1>

            <p className="mt-2 text-slate-500">
              Track fuel consumption, costs, stations, and vehicle mileage.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Add Fuel"}
          </button>
        </div>

        {/* CREATE FUEL FORM */}
        {showForm && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">
              Add Fuel Record
            </h2>

            <form
              onSubmit={handleCreateFuel}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >

              {/* FUEL CODE */}
              <input
                type="text"
                placeholder="Fuel Code"
                value={form.fuelCode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fuelCode: e.target.value,
                  })
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* VEHICLE */}
              <input
                type="text"
                placeholder="Vehicle Code"
                value={form.vehicleCode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vehicleCode: e.target.value,
                  })
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* DRIVER */}
              <input
                type="text"
                placeholder="Driver Code"
                value={form.driverCode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    driverCode: e.target.value,
                  })
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* DATE - ALWAYS YYYY-MM-DD */}
              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={form.fuelDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fuelDate: e.target.value,
                  })
                }
                pattern="\d{4}-\d{2}-\d{2}"
                maxLength={10}
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* LITERS */}
              <input
                type="number"
                placeholder="Liters"
                value={form.liters}
                onChange={(e) =>
                  setForm({
                    ...form,
                    liters: e.target.value,
                  })
                }
                min="0"
                step="0.01"
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* COST */}
              <input
                type="number"
                placeholder="Cost"
                value={form.cost}
                onChange={(e) =>
                  setForm({
                    ...form,
                    cost: e.target.value,
                  })
                }
                min="0"
                step="0.01"
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* FUEL STATION */}
              <input
                type="text"
                placeholder="Fuel Station"
                value={form.fuelStation}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fuelStation: e.target.value,
                  })
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* ODOMETER */}
              <input
                type="number"
                placeholder="Odometer (km)"
                value={form.odometer}
                onChange={(e) =>
                  setForm({
                    ...form,
                    odometer: e.target.value,
                  })
                }
                min="0"
                step="0.01"
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* PAYMENT METHOD */}
              <select
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paymentMethod: e.target.value,
                  })
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Account">Account</option>
              </select>

              {/* NOTES */}
              <input
                type="text"
                placeholder="Notes"
                value={form.notes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes: e.target.value,
                  })
                }
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* SAVE */}
              <div className="sm:col-span-2 lg:col-span-4">
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
                >
                  Save Fuel Record
                </button>
              </div>

            </form>
          </div>
        )}

        {/* STATISTICS */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Fuel Records
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {fuelRecords.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Liters
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-600">
              {totalLiters.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              L
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Fuel Cost
            </p>

            <p className="mt-1 text-2xl font-bold text-orange-600">
              {totalCost.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Average Cost / Liter
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              {averageCostPerLiter.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

        </div>

        {/* FUEL REGISTRY */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Fuel Registry
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Fuel ID</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Driver</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Liters</th>
                  <th className="px-6 py-4">Cost</th>
                  <th className="px-6 py-4">Station</th>
                  <th className="px-6 py-4">Odometer</th>
                  <th className="px-6 py-4">Payment</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Loading fuel records...
                    </td>
                  </tr>
                ) : fuelRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No fuel records found.
                    </td>
                  </tr>
                ) : (
                  fuelRecords.map((fuel) => (
                    <tr
                      key={fuel.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {fuel.fuelCode}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {fuel.vehicleCode}
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {fuel.driverCode}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(fuel.fuelDate)}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {Number(fuel.liters).toLocaleString()} L
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {Number(fuel.cost).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {fuel.fuelStation}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {Number(fuel.odometer).toLocaleString()} km
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {fuel.paymentMethod}
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>

        </div>

      </div>
    </main>
  );
}
