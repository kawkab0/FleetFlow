"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedPage from "@/app/components/ProtectedPage";

type Driver = {
  id: number;
  driverCode?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
};

type Vehicle = {
  id: number;
  vehicleCode: string;
  registrationNumber: string;
  type: string;
  model: string;
  status: string;
  mileage: number;
  driver: Driver | null;
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] =
    useState<Vehicle | null>(null);

  const [form, setForm] = useState({
    vehicleCode: "",
    registrationNumber: "",
    type: "",
    model: "",
    status: "Active",
    mileage: "",
    driverId: "",
  });

  // =========================
  // DRIVER DISPLAY
  // =========================

  const getDriverName = (driver: Driver | null) => {
    if (!driver) return "Unassigned";

    if (driver.name) {
      return driver.name;
    }

    const fullName = [
      driver.firstName,
      driver.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    if (fullName) {
      return fullName;
    }

    if (driver.driverCode) {
      return driver.driverCode;
    }

    return `Driver #${driver.id}`;
  };

  // =========================
  // GET VEHICLES + DRIVERS
  // =========================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [vehicleData, driverData] = await Promise.all([
        apiFetch("/vehicles"),
        apiFetch("/drivers"),
      ]);

      setVehicles(vehicleData);
      setDrivers(driverData);
    } catch (err) {
      console.error(err);
      setError("Could not load vehicles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // FORM
  // =========================

  const openAddModal = () => {
    setEditingVehicle(null);

    setForm({
      vehicleCode: "",
      registrationNumber: "",
      type: "",
      model: "",
      status: "Active",
      mileage: "",
      driverId: "",
    });

    setShowModal(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);

    setForm({
      vehicleCode: vehicle.vehicleCode,
      registrationNumber: vehicle.registrationNumber,
      type: vehicle.type,
      model: vehicle.model,
      status: vehicle.status,
      mileage: String(vehicle.mileage),
      driverId: vehicle.driver
        ? String(vehicle.driver.id)
        : "",
    });

    setShowModal(true);
  };

  // =========================
  // ADD / UPDATE
  // =========================

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    try {
      const vehicleData = {
        vehicleCode:
          form.vehicleCode.trim(),

        registrationNumber:
          form.registrationNumber.trim(),

        type: form.type.trim(),

        model: form.model.trim(),

        status: form.status,

        mileage: Number(form.mileage),

        driverId: form.driverId
          ? Number(form.driverId)
          : null,
      };

      const endpoint = editingVehicle
        ? `/vehicles/${editingVehicle.id}`
        : "/vehicles";

      const method = editingVehicle
        ? "PATCH"
        : "POST";

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(vehicleData),
      });

      setShowModal(false);
      setEditingVehicle(null);

      await fetchData();
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Could not save vehicle.",
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const deleteVehicle = async (
    id: number,
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vehicle?",
    );

    if (!confirmed) return;

    try {
      await apiFetch(`/vehicles/${id}`, {
        method: "DELETE",
      });

      await fetchData();
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Could not delete vehicle.",
      );
    }
  };

  // =========================
  // FILTERING
  // =========================

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const driverName =
        getDriverName(vehicle.driver);

      const matchesSearch =
        vehicle.vehicleCode
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        vehicle.registrationNumber
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        vehicle.model
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        driverName
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        vehicle.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    vehicles,
    search,
    statusFilter,
  ]);

  // =========================
  // DASHBOARD COUNTS
  // =========================

  const totalVehicles =
    vehicles.length;

  const activeVehicles =
    vehicles.filter(
      (vehicle) =>
        vehicle.status === "Active",
    ).length;

  const maintenanceVehicles =
    vehicles.filter(
      (vehicle) =>
        vehicle.status === "Maintenance",
    ).length;

  const inactiveVehicles =
    vehicles.filter(
      (vehicle) =>
        vehicle.status === "Inactive",
    ).length;

  return (
    <ProtectedPage permission="vehicles">
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}

          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                FLEET MANAGEMENT
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Vehicles
              </h1>

              <p className="mt-2 text-slate-500">
                Manage and monitor your entire vehicle fleet.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              + Add Vehicle
            </button>
          </div>

          {/* STAT CARDS */}

          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Vehicles
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {totalVehicles}
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Active
              </p>

              <p className="mt-1 text-2xl font-bold text-green-600">
                {activeVehicles}
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Maintenance
              </p>

              <p className="mt-1 text-2xl font-bold text-orange-600">
                {maintenanceVehicles}
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Inactive
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-500">
                {inactiveVehicles}
              </p>
            </div>

          </div>

          {/* SEARCH + FILTER */}

          <div className="mb-6 flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm md:flex-row">

            <input
              type="text"
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Maintenance">
                Maintenance
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>

          </div>

          {/* TABLE */}

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">

            <div className="border-b border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900">
                Vehicle Registry
              </h2>
            </div>

            {loading ? (
              <div className="p-10 text-center text-slate-500">
                Loading vehicles...
              </div>
            ) : error ? (
              <div className="p-10 text-center text-red-600">
                {error}
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No vehicles found.
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-6 py-4">
                        Vehicle ID
                      </th>

                      <th className="px-6 py-4">
                        Registration
                      </th>

                      <th className="px-6 py-4">
                        Type
                      </th>

                      <th className="px-6 py-4">
                        Model
                      </th>

                      <th className="px-6 py-4">
                        Driver
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                      <th className="px-6 py-4">
                        Mileage
                      </th>

                      <th className="px-6 py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredVehicles.map(
                      (vehicle) => (
                        <tr
                          key={vehicle.id}
                          className="hover:bg-slate-50"
                        >

                          <td className="px-6 py-4 font-medium text-slate-900">
                            {vehicle.vehicleCode}
                          </td>

                          <td className="px-6 py-4 text-slate-600">
                            {vehicle.registrationNumber}
                          </td>

                          <td className="px-6 py-4 text-slate-600">
                            {vehicle.type}
                          </td>

                          <td className="px-6 py-4 text-slate-600">
                            {vehicle.model}
                          </td>

                          <td className="px-6 py-4 text-slate-600">
                            {getDriverName(
                              vehicle.driver,
                            )}
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                vehicle.status ===
                                "Active"
                                  ? "bg-green-100 text-green-700"
                                  : vehicle.status ===
                                    "Maintenance"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {vehicle.status}
                            </span>

                          </td>

                          <td className="px-6 py-4 text-slate-600">
                            {vehicle.mileage.toLocaleString()} km
                          </td>

                          <td className="px-6 py-4">

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  openEditModal(
                                    vehicle,
                                  )
                                }
                                className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  deleteVehicle(
                                    vehicle.id,
                                  )
                                }
                                className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>
                      ),
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </div>

        {/* ADD / EDIT MODAL */}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

              <div className="mb-6 flex items-center justify-between">

                <h2 className="text-xl font-bold text-slate-900">
                  {editingVehicle
                    ? "Edit Vehicle"
                    : "Add Vehicle"}
                </h2>

                <button
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="text-xl text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>

              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Vehicle Code
                  </label>

                  <input
                    required
                    value={form.vehicleCode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        vehicleCode:
                          e.target.value,
                      })
                    }
                    placeholder="FL-001"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Registration Number
                  </label>

                  <input
                    required
                    value={
                      form.registrationNumber
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        registrationNumber:
                          e.target.value,
                      })
                    }
                    placeholder="ET-45231"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Type
                    </label>

                    <input
                      required
                      value={form.type}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          type: e.target.value,
                        })
                      }
                      placeholder="Truck"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Model
                    </label>

                    <input
                      required
                      value={form.model}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          model: e.target.value,
                        })
                      }
                      placeholder="Volvo FH"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
                    />
                  </div>

                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Status
                    </label>

                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Maintenance">
                        Maintenance
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Mileage
                    </label>

                    <input
                      required
                      type="number"
                      min="0"
                      value={form.mileage}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          mileage:
                            e.target.value,
                        })
                      }
                      placeholder="82450"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
                    />
                  </div>

                </div>

                {/* DRIVER DROPDOWN */}

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Driver
                  </label>

                  <select
                    value={form.driverId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        driverId:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {drivers.map((driver) => (
                      <option
                        key={driver.id}
                        value={driver.id}
                      >
                        {getDriverName(driver)}
                        {driver.driverCode
                          ? ` — ${driver.driverCode}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">

                  <button
                    type="button"
                    onClick={() =>
                      setShowModal(false)
                    }
                    className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
                  >
                    {editingVehicle
                      ? "Update Vehicle"
                      : "Add Vehicle"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      </main>
    </ProtectedPage>
  );
}
