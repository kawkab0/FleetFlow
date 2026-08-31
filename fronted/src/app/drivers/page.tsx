"use client";

import { useEffect, useState } from "react";

interface Driver {
  id: number;
  driverCode: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseType: string;
  status: string;
  hireDate: string | null;
  assignedVehicle: string | null;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    driverCode: "",
    name: "",
    phone: "",
    licenseNumber: "",
    licenseType: "Professional",
    status: "Active",
    hireDate: "",
    assignedVehicle: "",
  });

  const fetchDrivers = async () => {
    try {
      const response = await fetch("http://localhost:3001/drivers");

      if (!response.ok) {
        throw new Error("Failed to fetch drivers");
      }

      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/drivers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driverCode: form.driverCode,
          name: form.name,
          phone: form.phone,
          licenseNumber: form.licenseNumber,
          licenseType: form.licenseType,
          status: form.status,
          hireDate: form.hireDate || null,
          assignedVehicle: form.assignedVehicle || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add driver");
      }

      setForm({
        driverCode: "",
        name: "",
        phone: "",
        licenseNumber: "",
        licenseType: "Professional",
        status: "Active",
        hireDate: "",
        assignedVehicle: "",
      });

      setShowForm(false);
      fetchDrivers();
    } catch (error) {
      console.error("Error adding driver:", error);
      alert("Failed to add driver.");
    }
  };

  const activeDrivers = drivers.filter(
    (driver) => driver.status === "Active",
  ).length;

  const offDutyDrivers = drivers.filter(
    (driver) => driver.status === "Off Duty",
  ).length;

  const unassignedDrivers = drivers.filter(
    (driver) => !driver.assignedVehicle,
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              DRIVER MANAGEMENT
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Drivers
            </h1>

            <p className="mt-2 text-slate-500">
              Manage drivers, licenses, assignments, and availability.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Add Driver"}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">
              Add New Driver
            </h2>

            <form
              onSubmit={handleAddDriver}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <input
                type="text"
                placeholder="Driver Code"
                value={form.driverCode}
                onChange={(e) =>
                  setForm({ ...form, driverCode: e.target.value })
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="License Number"
                value={form.licenseNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    licenseNumber: e.target.value,
                  })
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <select
                value={form.licenseType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    licenseType: e.target.value,
                  })
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="Professional">Professional</option>
                <option value="Commercial">Commercial</option>
                <option value="Heavy Vehicle">Heavy Vehicle</option>
                <option value="Light Vehicle">Light Vehicle</option>
              </select>

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
                <option value="Active">Active</option>
                <option value="Off Duty">Off Duty</option>
                <option value="Inactive">Inactive</option>
              </select>

              <input
                type="date"
                value={form.hireDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    hireDate: e.target.value,
                  })
                }
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="Assigned Vehicle"
                value={form.assignedVehicle}
                onChange={(e) =>
                  setForm({
                    ...form,
                    assignedVehicle: e.target.value,
                  })
                }
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <div className="sm:col-span-2 lg:col-span-4">
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
                >
                  Save Driver
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Drivers
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {drivers.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Active
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              {activeDrivers}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Off Duty
            </p>

            <p className="mt-1 text-2xl font-bold text-orange-600">
              {offDutyDrivers}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Unassigned
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-500">
              {unassignedDrivers}
            </p>
          </div>

        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Driver Registry
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Driver ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">License</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Loading drivers...
                    </td>
                  </tr>
                ) : drivers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No drivers found.
                    </td>
                  </tr>
                ) : (
                  drivers.map((driver) => (
                    <tr
                      key={driver.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {driver.driverCode}
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {driver.name}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {driver.licenseNumber}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {driver.phone}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {driver.assignedVehicle || "Unassigned"}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            driver.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {driver.status}
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
