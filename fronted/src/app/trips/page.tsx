"use client";

import { useEffect, useMemo, useState } from "react";

import ProtectedPage from "@/app/components/ProtectedPage";
import { apiFetch } from "@/lib/api";

interface Trip {
  id: number;
  tripCode: string;
  origin: string;
  destination: string;
  vehicleCode: string;
  driverCode: string;
  tripDate: string;
  distance: string | number;
  fuelUsed: string | number;
  revenue: string | number;
  cargo: string | null;
  status: string;
  notes: string | null;
}

interface TripForm {
  tripCode: string;
  origin: string;
  destination: string;
  vehicleCode: string;
  driverCode: string;
  tripDate: string;
  distance: string;
  fuelUsed: string;
  revenue: string;
  cargo: string;
  status: string;
  notes: string;
}

const emptyForm: TripForm = {
  tripCode: "",
  origin: "",
  destination: "",
  vehicleCode: "",
  driverCode: "",
  tripDate: "",
  distance: "",
  fuelUsed: "0",
  revenue: "0",
  cargo: "",
  status: "Planned",
  notes: "",
};

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingTripId, setEditingTripId] = useState<number | null>(null);

  const [form, setForm] = useState<TripForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchTrips = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }

    try {
      const data = await apiFetch("/trips");
      setTrips(data);
    } catch (error) {
      console.error("Error fetching trips:", error);

      setNotification({
        type: "error",
        message: "Failed to load trips.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [notification]);

  const updateForm = (
    field: keyof TripForm,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingTripId(null);
    setShowForm(false);
  };

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.tripDate)) {
      setNotification({
        type: "error",
        message: "Please enter the date in YYYY-MM-DD format.",
      });
      return;
    }

    setSaving(true);

    const isEditing = editingTripId !== null;

    const tripData = {
      tripCode: form.tripCode,
      origin: form.origin,
      destination: form.destination,
      vehicleCode: form.vehicleCode,
      driverCode: form.driverCode,
      tripDate: form.tripDate,
      distance: Number(form.distance),
      fuelUsed: Number(form.fuelUsed),
      revenue: Number(form.revenue),
      cargo: form.cargo || null,
      status: form.status,
      notes: form.notes || null,
    };

    try {
      const endpoint = isEditing
        ? `/trips/${editingTripId}`
        : "/trips";

      const method = isEditing ? "PATCH" : "POST";

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(tripData),
      });

      resetForm();
      await fetchTrips();

      setNotification({
        type: "success",
        message: isEditing
          ? "Trip updated successfully."
          : "Trip created successfully.",
      });
    } catch (error) {
      console.error("Error saving trip:", error);

      setNotification({
        type: "error",
        message: isEditing
          ? "Failed to update trip."
          : "Failed to create trip.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (trip: Trip) => {
    setForm({
      tripCode: trip.tripCode,
      origin: trip.origin,
      destination: trip.destination,
      vehicleCode: trip.vehicleCode,
      driverCode: trip.driverCode,
      tripDate: trip.tripDate.substring(0, 10),
      distance: String(trip.distance),
      fuelUsed: String(trip.fuelUsed),
      revenue: String(trip.revenue),
      cargo: trip.cargo ?? "",
      status: trip.status,
      notes: trip.notes ?? "",
    });

    setEditingTripId(trip.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trip?",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      await apiFetch(`/trips/${id}`, {
        method: "DELETE",
      });

      await fetchTrips();

      setNotification({
        type: "success",
        message: "Trip deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting trip:", error);

      setNotification({
        type: "error",
        message: "Failed to delete trip.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const formatDate = (date: string) => {
    if (!date) {
      return "";
    }

    return date.substring(0, 10);
  };

  const filteredTrips = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return trips;
    }

    return trips.filter((trip) => {
      return (
        trip.tripCode?.toLowerCase().includes(searchText) ||
        trip.origin?.toLowerCase().includes(searchText) ||
        trip.destination?.toLowerCase().includes(searchText) ||
        trip.vehicleCode?.toLowerCase().includes(searchText) ||
        trip.driverCode?.toLowerCase().includes(searchText) ||
        trip.status?.toLowerCase().includes(searchText) ||
        trip.cargo?.toLowerCase().includes(searchText)
      );
    });
  }, [trips, search]);

  const inProgressTrips = trips.filter(
    (trip) => trip.status === "In Progress",
  ).length;

  const scheduledTrips = trips.filter(
    (trip) =>
      trip.status === "Scheduled" ||
      trip.status === "Planned",
  ).length;

  const completedTrips = trips.filter(
    (trip) => trip.status === "Completed",
  ).length;

  const totalDistance = trips.reduce(
    (total, trip) =>
      total + Number(trip.distance || 0),
    0,
  );

  const totalRevenue = trips.reduce(
    (total, trip) =>
      total + Number(trip.revenue || 0),
    0,
  );

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";

      case "In Progress":
        return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";

      case "Cancelled":
        return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";

      case "Scheduled":
        return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";

      default:
        return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
    }
  };

  return (
    <ProtectedPage permission="trips">
      <main className="ml-64 min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Trip Management
                </p>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Trips
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Plan, monitor, and manage fleet trips.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fetchTrips(true)}
                disabled={refreshing}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (showForm) {
                    handleCancel();
                  } else {
                    setForm(emptyForm);
                    setEditingTripId(null);
                    setShowForm(true);
                  }
                }}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                {showForm ? "Cancel" : "+ Create Trip"}
              </button>
            </div>
          </div>

          {/* NOTIFICATION */}
          {notification && (
            <div
              className={`mb-6 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
                notification.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <span>{notification.message}</span>

              <button
                type="button"
                onClick={() => setNotification(null)}
                className="ml-4 font-bold opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </div>
          )}

          {/* KPI CARDS */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total Trips
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {trips.length}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-100 px-3 py-2 text-lg">
                  🚚
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    In Progress
                  </p>

                  <p className="mt-2 text-3xl font-bold text-blue-600">
                    {inProgressTrips}
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 px-3 py-2 text-lg">
                  ↗
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Scheduled
                  </p>

                  <p className="mt-2 text-3xl font-bold text-amber-600">
                    {scheduledTrips}
                  </p>
                </div>

                <div className="rounded-lg bg-amber-50 px-3 py-2 text-lg">
                  ◷
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Completed
                  </p>

                  <p className="mt-2 text-3xl font-bold text-emerald-600">
                    {completedTrips}
                  </p>
                </div>

                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-lg">
                  ✓
                </div>
              </div>
            </div>
          </div>

          {/* SECONDARY METRICS */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Distance
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalDistance.toLocaleString()}{" "}
                <span className="text-sm font-medium text-slate-400">
                  km
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Revenue
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                ${totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* FORM */}
          {showForm && (
            <div className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {editingTripId !== null
                      ? "Edit Trip"
                      : "Create New Trip"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {editingTripId !== null
                      ? "Update the trip information below."
                      : "Enter the trip information below."}
                  </p>
                </div>

                {editingTripId !== null && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    Editing Trip #{editingTripId}
                  </span>
                )}
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6"
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

                  {/* TRIP CODE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Trip Code
                    </label>

                    <input
                      type="text"
                      placeholder="e.g. TRP-001"
                      value={form.tripCode}
                      onChange={(e) =>
                        updateForm(
                          "tripCode",
                          e.target.value,
                        )
                      }
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* ORIGIN */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Origin
                    </label>

                    <input
                      type="text"
                      placeholder="Starting location"
                      value={form.origin}
                      onChange={(e) =>
                        updateForm(
                          "origin",
                          e.target.value,
                        )
                      }
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* DESTINATION */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Destination
                    </label>

                    <input
                      type="text"
                      placeholder="Destination"
                      value={form.destination}
                      onChange={(e) =>
                        updateForm(
                          "destination",
                          e.target.value,
                        )
                      }
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* VEHICLE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Vehicle Code
                    </label>

                    <input
                      type="text"
                      placeholder="Vehicle code"
                      value={form.vehicleCode}
                      onChange={(e) =>
                        updateForm(
                          "vehicleCode",
                          e.target.value,
                        )
                      }
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* DRIVER */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Driver Code
                    </label>

                    <input
                      type="text"
                      placeholder="Driver code"
                      value={form.driverCode}
                      onChange={(e) =>
                        updateForm(
                          "driverCode",
                          e.target.value,
                        )
                      }
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* DATE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Trip Date
                    </label>

                    <input
                      type="text"
                      placeholder="YYYY-MM-DD"
                      value={form.tripDate}
                      onChange={(e) =>
                        updateForm(
                          "tripDate",
                          e.target.value,
                        )
                      }
                      pattern="\d{4}-\d{2}-\d{2}"
                      maxLength={10}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="mt-1 text-xs text-slate-400">
                      Use YYYY-MM-DD
                    </p>
                  </div>

                  {/* DISTANCE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Distance (km)
                    </label>

                    <input
                      type="number"
                      placeholder="0"
                      value={form.distance}
                      onChange={(e) =>
                        updateForm(
                          "distance",
                          e.target.value,
                        )
                      }
                      min="0"
                      step="0.01"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* FUEL */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Fuel Used (L)
                    </label>

                    <input
                      type="number"
                      placeholder="0"
                      value={form.fuelUsed}
                      onChange={(e) =>
                        updateForm(
                          "fuelUsed",
                          e.target.value,
                        )
                      }
                      min="0"
                      step="0.01"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* REVENUE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Revenue
                    </label>

                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.revenue}
                      onChange={(e) =>
                        updateForm(
                          "revenue",
                          e.target.value,
                        )
                      }
                      min="0"
                      step="0.01"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* CARGO */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Cargo
                    </label>

                    <input
                      type="text"
                      placeholder="Cargo description"
                      value={form.cargo}
                      onChange={(e) =>
                        updateForm(
                          "cargo",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* STATUS */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Status
                    </label>

                    <select
                      value={form.status}
                      onChange={(e) =>
                        updateForm(
                          "status",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Planned">
                        Planned
                      </option>

                      <option value="Scheduled">
                        Scheduled
                      </option>

                      <option value="In Progress">
                        In Progress
                      </option>

                      <option value="Completed">
                        Completed
                      </option>

                      <option value="Cancelled">
                        Cancelled
                      </option>
                    </select>
                  </div>

                  {/* NOTES */}
                  <div className="md:col-span-2 lg:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Notes
                    </label>

                    <textarea
                      placeholder="Additional trip notes..."
                      value={form.notes}
                      onChange={(e) =>
                        updateForm(
                          "notes",
                          e.target.value,
                        )
                      }
                      rows={3}
                      className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* FORM ACTIONS */}
                <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : editingTripId !== null
                        ? "Update Trip"
                        : "Save Trip"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SEARCH / REGISTRY HEADER */}
          <div className="mb-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Trip Registry
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? `Showing ${filteredTrips.length} of ${trips.length} trips`
                    : `${trips.length} total trips`}
                </p>
              </div>

              <div className="flex w-full gap-3 lg:w-auto">
                <div className="relative w-full lg:w-96">
                  <input
                    type="text"
                    placeholder="Search trips..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-slate-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Trip
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Vehicle
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Driver
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Route
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Distance
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Revenue
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-14 text-center"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                          <p className="mt-3 text-sm text-slate-500">
                            Loading trips...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTrips.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-14 text-center"
                      >
                        <div className="mx-auto max-w-sm">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                            🚚
                          </div>

                          <h3 className="mt-4 font-semibold text-slate-900">
                            {search
                              ? "No matching trips"
                              : "No trips found"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {search
                              ? "Try changing your search term."
                              : "Create your first trip to start managing fleet operations."}
                          </p>

                          {search && (
                            <button
                              type="button"
                              onClick={() => setSearch("")}
                              className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTrips.map((trip) => (
                      <tr
                        key={trip.id}
                        className="transition hover:bg-slate-50"
                      >
                        {/* TRIP */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
                              {trip.tripCode
                                ?.slice(0, 2)
                                .toUpperCase() || "TR"}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {trip.tripCode}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                ID: {trip.id}
                              </p>

                              {trip.cargo && (
                                <p className="mt-1 max-w-[160px] truncate text-xs text-slate-500">
                                  Cargo: {trip.cargo}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* VEHICLE */}
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-700">
                            {trip.vehicleCode}
                          </span>
                        </td>

                        {/* DRIVER */}
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-700">
                            {trip.driverCode}
                          </span>
                        </td>

                        {/* ROUTE */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium text-slate-700">
                                {trip.origin}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                → {trip.destination}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* DATE */}
                        <td className="px-6 py-4 text-slate-600">
                          {formatDate(trip.tripDate) || "—"}
                        </td>

                        {/* DISTANCE */}
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-700">
                            {Number(
                              trip.distance || 0,
                            ).toLocaleString()}
                          </span>

                          <span className="ml-1 text-xs text-slate-400">
                            km
                          </span>
                        </td>

                        {/* REVENUE */}
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">
                            $
                            {Number(
                              trip.revenue || 0,
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              trip.status,
                            )}`}
                          >
                            {trip.status}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(trip)
                              }
                              className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(trip.id)
                              }
                              disabled={
                                deletingId === trip.id
                              }
                              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === trip.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading &&
              filteredTrips.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50 px-6 py-3">
                  <p className="text-xs text-slate-500">
                    Showing {filteredTrips.length} of{" "}
                    {trips.length} trips
                  </p>
                </div>
              )}
          </div>
        </div>
      </main>
    </ProtectedPage>
  );
}
