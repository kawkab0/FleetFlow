"use client";

import { useEffect, useState } from "react";

interface Maintenance {
  id: number;
  maintenanceCode: string;
  vehicleCode: string;
  maintenanceDate: string;
  maintenanceType: string;
  description: string;
  mileage: string | number;
  cost: string | number;
  serviceProvider: string;
  status: string;
  notes: string | null;
}

export default function MaintenancePage() {
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    maintenanceCode: "",
    vehicleCode: "",
    maintenanceDate: "",
    maintenanceType: "Oil Change",
    description: "",
    mileage: "",
    cost: "",
    serviceProvider: "",
    status: "Pending",
    notes: "",
  });

  const fetchMaintenance = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/maintenance",
      );

      if (!response.ok) {
        throw new Error("Failed to fetch maintenance records");
      }

      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error(
        "Error fetching maintenance records:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const handleCreateMaintenance = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.maintenanceDate)) {
      alert("Please enter the date in YYYY-MM-DD format.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3001/maintenance",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            maintenanceCode: form.maintenanceCode,
            vehicleCode: form.vehicleCode,
            maintenanceDate: form.maintenanceDate,
            maintenanceType: form.maintenanceType,
            description: form.description,
            mileage: Number(form.mileage),
            cost: Number(form.cost),
            serviceProvider: form.serviceProvider,
            status: form.status,
            notes: form.notes || null,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to create maintenance record",
        );
      }

      setForm({
        maintenanceCode: "",
        vehicleCode: "",
        maintenanceDate: "",
        maintenanceType: "Oil Change",
        description: "",
        mileage: "",
        cost: "",
        serviceProvider: "",
        status: "Pending",
        notes: "",
      });

      setShowForm(false);
      fetchMaintenance();
    } catch (error) {
      console.error(
        "Error creating maintenance record:",
        error,
      );

      alert("Failed to create maintenance record.");
    }
  };

  const formatDate = (date: string) => {
    if (!date) {
      return "";
    }

    return date.substring(0, 10);
  };

  const totalCost = records.reduce(
    (total, record) => total + Number(record.cost),
    0,
  );

  const pendingCount = records.filter(
    (record) => record.status === "Pending",
  ).length;

  const inProgressCount = records.filter(
    (record) => record.status === "In Progress",
  ).length;

  const completedCount = records.filter(
    (record) => record.status === "Completed",
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              MAINTENANCE MANAGEMENT
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Maintenance
            </h1>

            <p className="mt-2 text-slate-500">
              Schedule, track, and manage vehicle maintenance.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Add Maintenance"}
          </button>
        </div>

        {/* ADD MAINTENANCE FORM */}
        {showForm && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">
              Add Maintenance Record
            </h2>

            <form
              onSubmit={handleCreateMaintenance}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >

              {/* MAINTENANCE CODE */}
              <input
                type="text"
                placeholder="Maintenance Code"
                value={form.maintenanceCode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maintenanceCode: e.target.value,
                  })
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* VEHICLE CODE */}
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

              {/* DATE */}
              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={form.maintenanceDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maintenanceDate: e.target.value,
                  })
                }
                pattern="\d{4}-\d{2}-\d{2}"
                maxLength={10}
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* MAINTENANCE TYPE */}
              <select
                value={form.maintenanceType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maintenanceType: e.target.value,
                  })
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="Oil Change">
                  Oil Change
                </option>

                <option value="Engine Service">
                  Engine Service
                </option>

                <option value="Brake Service">
                  Brake Service
                </option>

                <option value="Tire Replacement">
                  Tire Replacement
                </option>

                <option value="Electrical">
                  Electrical
                </option>

                <option value="Inspection">
                  Inspection
                </option>

                <option value="Repair">
                  Repair
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

              {/* DESCRIPTION */}
              <input
                type="text"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 sm:col-span-2"
              />

              {/* MILEAGE */}
              <input
                type="number"
                placeholder="Mileage (km)"
                value={form.mileage}
                onChange={(e) =>
                  setForm({
                    ...form,
                    mileage: e.target.value,
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

              {/* SERVICE PROVIDER */}
              <input
                type="text"
                placeholder="Service Provider"
                value={form.serviceProvider}
                onChange={(e) =>
                  setForm({
                    ...form,
                    serviceProvider: e.target.value,
                  })
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* STATUS */}
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="Pending">
                  Pending
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>
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
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 sm:col-span-2"
              />

              {/* SAVE BUTTON */}
              <div className="sm:col-span-2 lg:col-span-4">
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
                >
                  Save Maintenance Record
                </button>
              </div>

            </form>
          </div>
        )}

        {/* STATISTICS */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Records
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {records.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending
            </p>

            <p className="mt-1 text-2xl font-bold text-orange-600">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              In Progress
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-600">
              {inProgressCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Maintenance Cost
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              {totalCost.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

        </div>

        {/* REGISTRY */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Maintenance Registry
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {completedCount} completed maintenance record
                  {completedCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">
                    Maintenance ID
                  </th>

                  <th className="px-6 py-4">
                    Vehicle
                  </th>

                  <th className="px-6 py-4">
                    Date
                  </th>

                  <th className="px-6 py-4">
                    Type
                  </th>

                  <th className="px-6 py-4">
                    Mileage
                  </th>

                  <th className="px-6 py-4">
                    Cost
                  </th>

                  <th className="px-6 py-4">
                    Service Provider
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Loading maintenance records...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No maintenance records found.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {record.maintenanceCode}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {record.vehicleCode}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(record.maintenanceDate)}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {record.maintenanceType}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {Number(record.mileage).toLocaleString()} km
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {Number(record.cost).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {record.serviceProvider}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            record.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : record.status === "In Progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {record.status}
                        </span>
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
