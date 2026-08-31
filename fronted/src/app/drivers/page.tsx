"use client";

import { useEffect, useMemo, useState } from "react";

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

const API_URL = "http://localhost:3001/drivers";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);

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

  // =========================
  // GET DRIVERS
  // =========================

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch drivers");
      }

      const data = await response.json();

      setDrivers(data);
    } catch (err) {
      console.error("Fetch drivers error:", err);
      setError("Could not load drivers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // =========================
  // DATE HELPERS
  // IMPORTANT:
  // DO NOT use new Date() here.
  // Hire dates are DATE-ONLY values.
  // =========================

  const normalizeDate = (date: string | null | undefined) => {
    if (!date) {
      return "";
    }

    // If backend returns:
    // 2026-08-31
    // keep it exactly as it is.
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    // If backend happens to return:
    // 2026-08-31T00:00:00.000Z
    // extract only the date portion.
    const match = date.match(/^(\d{4}-\d{2}-\d{2})/);

    if (match) {
      return match[1];
    }

    return "";
  };

  const formatDate = (date: string | null) => {
    const normalizedDate = normalizeDate(date);

    if (!normalizedDate) {
      return "N/A";
    }

    return normalizedDate;
  };

  // =========================
  // OPEN ADD MODAL
  // =========================

  const openAddModal = () => {
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

    setShowModal(true);
  };

  // =========================
  // ADD DRIVER
  // =========================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Keep the date as YYYY-MM-DD.
      // Do NOT use new Date(form.hireDate).
      const hireDate = form.hireDate
        ? normalizeDate(form.hireDate)
        : null;

      const driverData = {
        driverCode: form.driverCode.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        licenseNumber: form.licenseNumber.trim(),
        licenseType: form.licenseType,
        status: form.status,
        hireDate: hireDate,
        assignedVehicle:
          form.assignedVehicle.trim() || null,
      };

      console.log("Sending driver data:", driverData);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(driverData),
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "Backend error:",
          errorText
        );

        throw new Error("Failed to create driver");
      }

      setShowModal(false);

      await fetchDrivers();
    } catch (err) {
      console.error("Add driver error:", err);
      alert("Could not add driver.");
    }
  };

  // =========================
  // SEARCH + FILTER
  // =========================

  const filteredDrivers = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return drivers.filter((driver) => {
      const matchesSearch =
        driver.driverCode
          .toLowerCase()
          .includes(searchText) ||
        driver.name
          .toLowerCase()
          .includes(searchText) ||
        driver.phone
          .toLowerCase()
          .includes(searchText) ||
        driver.licenseNumber
          .toLowerCase()
          .includes(searchText) ||
        (driver.assignedVehicle || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        driver.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [drivers, search, statusFilter]);

  // =========================
  // DASHBOARD COUNTS
  // =========================

  const totalDrivers = drivers.length;

  const activeDrivers = drivers.filter(
    (driver) => driver.status === "Active"
  ).length;

  const inactiveDrivers = drivers.filter(
    (driver) => driver.status === "Inactive"
  ).length;

  const onLeaveDrivers = drivers.filter(
    (driver) => driver.status === "On Leave"
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-8 flex items-center justify-between">

          <div>

            <p className="text-sm font-medium text-blue-600">
              FLEET MANAGEMENT
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Drivers
            </h1>

            <p className="mt-2 text-slate-500">
              Manage and monitor your fleet drivers.
            </p>

          </div>

          <button
            onClick={openAddModal}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            + Add Driver
          </button>

        </div>

        {/* =========================
            STAT CARDS
        ========================= */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Total Drivers
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {loading ? "..." : totalDrivers}
            </p>

          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Active
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              {loading ? "..." : activeDrivers}
            </p>

          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Inactive
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-500">
              {loading ? "..." : inactiveDrivers}
            </p>

          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              On Leave
            </p>

            <p className="mt-1 text-2xl font-bold text-orange-600">
              {loading ? "..." : onLeaveDrivers}
            </p>

          </div>

        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =========================
            SEARCH + FILTER
        ========================= */}

        <div className="mb-6 flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm md:flex-row">

          <input
            type="text"
            placeholder="Search drivers..."
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

            <option value="Inactive">
              Inactive
            </option>

            <option value="On Leave">
              On Leave
            </option>
          </select>

        </div>

        {/* =========================
            DRIVER TABLE
        ========================= */}

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">

            <h2 className="font-semibold text-slate-900">
              Driver Registry
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Drivers currently registered in FleetFlow.
            </p>

          </div>

          {loading ? (

            <div className="p-10 text-center text-slate-500">
              Loading drivers...
            </div>

          ) : error ? (

            <div className="p-10 text-center text-red-600">
              {error}
            </div>

          ) : filteredDrivers.length === 0 ? (

            <div className="p-10 text-center text-slate-500">
              No drivers found.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead className="bg-slate-50 text-slate-500">

                  <tr>

                    <th className="px-6 py-4">
                      Driver ID
                    </th>

                    <th className="px-6 py-4">
                      Name
                    </th>

                    <th className="px-6 py-4">
                      Phone
                    </th>

                    <th className="px-6 py-4">
                      License
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Assigned Vehicle
                    </th>

                    <th className="px-6 py-4">
                      Hire Date
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredDrivers.map((driver) => (

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
                        {driver.phone}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {driver.licenseType}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            driver.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : driver.status === "On Leave"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {driver.status}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {driver.assignedVehicle ||
                          "Unassigned"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(driver.hireDate)}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* =========================
          ADD DRIVER MODAL
      ========================= */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">

            {/* MODAL HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Add Driver
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Register a new driver in FleetFlow.
                </p>

              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-2xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* DRIVER CODE + NAME */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Driver Code
                  </label>

                  <input
                    required
                    value={form.driverCode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        driverCode:
                          e.target.value,
                      })
                    }
                    placeholder="DR-002"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />

                </div>

                <div>

                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Full Name
                  </label>

                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="Daniel Mekonnen"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />

                </div>

              </div>

              {/* PHONE + LICENSE NUMBER */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Phone
                  </label>

                  <input
                    required
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                    placeholder="0911223344"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />

                </div>

                <div>

                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    License Number
                  </label>

                  <input
                    required
                    value={form.licenseNumber}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        licenseNumber:
                          e.target.value,
                      })
                    }
                    placeholder="LIC-002"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />

                </div>

              </div>

              {/* LICENSE TYPE + STATUS */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    License Type
                  </label>

                  <select
                    value={form.licenseType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        licenseType:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  >
                    <option value="Professional">
                      Professional
                    </option>

                    <option value="Heavy">
                      Heavy
                    </option>

                    <option value="Light">
                      Light
                    </option>
                  </select>

                </div>

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

                    <option value="Inactive">
                      Inactive
                    </option>

                    <option value="On Leave">
                      On Leave
                    </option>
                  </select>

                </div>

              </div>

              {/* HIRE DATE + VEHICLE */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Hire Date
                  </label>

                  <input
                    type="date"
                    value={form.hireDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        hireDate:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Date format: YYYY-MM-DD
                  </p>

                </div>

                <div>

                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Assigned Vehicle
                  </label>

                  <input
                    value={form.assignedVehicle}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        assignedVehicle:
                          e.target.value,
                      })
                    }
                    placeholder="FL-001"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />

                </div>

              </div>

              {/* BUTTONS */}

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
                  Add Driver
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}
