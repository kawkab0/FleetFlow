"use client";

import { useEffect, useState } from "react";

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

  const [showForm, setShowForm] = useState(false);
  const [editingTripId, setEditingTripId] = useState<number | null>(null);

  const [form, setForm] = useState<TripForm>(emptyForm);

  const fetchTrips = async () => {
    try {
      const response = await fetch("http://localhost:3001/trips");

      if (!response.ok) {
        throw new Error("Failed to fetch trips");
      }

      const data = await response.json();
      setTrips(data);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const updateForm = (
    field: keyof TripForm,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.tripDate)) {
      alert("Please enter the date in YYYY-MM-DD format.");
      return;
    }

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
      const url =
        editingTripId !== null
          ? `http://localhost:3001/trips/${editingTripId}`
          : "http://localhost:3001/trips";

      const method =
        editingTripId !== null ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) {
        throw new Error(
          editingTripId !== null
            ? "Failed to update trip"
            : "Failed to create trip",
        );
      }

      setForm(emptyForm);
      setEditingTripId(null);
      setShowForm(false);

      await fetchTrips();

      alert(
        editingTripId !== null
          ? "Trip updated successfully."
          : "Trip created successfully.",
      );
    } catch (error) {
      console.error("Error saving trip:", error);
      alert(
        editingTripId !== null
          ? "Failed to update trip."
          : "Failed to create trip.",
      );
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
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trip?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/trips/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete trip");
      }

      await fetchTrips();

      alert("Trip deleted successfully.");
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip.");
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingTripId(null);
    setShowForm(false);
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    return date.substring(0, 10);
  };

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

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              TRIP MANAGEMENT
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Trips
            </h1>

            <p className="mt-2 text-slate-500">
              Plan, monitor, and manage fleet trips.
            </p>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                handleCancel();
              } else {
                setForm(emptyForm);
                setEditingTripId(null);
                setShowForm(true);
              }
            }}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            {showForm
              ? "Cancel"
              : "+ Create Trip"}
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingTripId !== null
                  ? "Edit Trip"
                  : "Create New Trip"}
              </h2>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >

              {/* TRIP CODE */}
              <input
                type="text"
                placeholder="Trip Code"
                value={form.tripCode}
                onChange={(e) =>
                  updateForm(
                    "tripCode",
                    e.target.value,
                  )
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* ORIGIN */}
              <input
                type="text"
                placeholder="Origin"
                value={form.origin}
                onChange={(e) =>
                  updateForm(
                    "origin",
                    e.target.value,
                  )
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* DESTINATION */}
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
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* VEHICLE */}
              <input
                type="text"
                placeholder="Vehicle Code"
                value={form.vehicleCode}
                onChange={(e) =>
                  updateForm(
                    "vehicleCode",
                    e.target.value,
                  )
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
                  updateForm(
                    "driverCode",
                    e.target.value,
                  )
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* DATE */}
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
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* DISTANCE */}
              <input
                type="number"
                placeholder="Distance (km)"
                value={form.distance}
                onChange={(e) =>
                  updateForm(
                    "distance",
                    e.target.value,
                  )
                }
                min="0"
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* FUEL */}
              <input
                type="number"
                placeholder="Fuel Used (L)"
                value={form.fuelUsed}
                onChange={(e) =>
                  updateForm(
                    "fuelUsed",
                    e.target.value,
                  )
                }
                min="0"
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* REVENUE */}
              <input
                type="number"
                placeholder="Revenue"
                value={form.revenue}
                onChange={(e) =>
                  updateForm(
                    "revenue",
                    e.target.value,
                  )
                }
                min="0"
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* CARGO */}
              <input
                type="text"
                placeholder="Cargo"
                value={form.cargo}
                onChange={(e) =>
                  updateForm(
                    "cargo",
                    e.target.value,
                  )
                }
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* STATUS */}
              <select
                value={form.status}
                onChange={(e) =>
                  updateForm(
                    "status",
                    e.target.value,
                  )
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
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

              {/* NOTES */}
              <textarea
                placeholder="Notes"
                value={form.notes}
                onChange={(e) =>
                  updateForm(
                    "notes",
                    e.target.value,
                  )
                }
                className="min-h-[48px] rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 sm:col-span-2 lg:col-span-2"
              />

              {/* SAVE */}
              <div className="flex gap-3 sm:col-span-2 lg:col-span-4">
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
                >
                  {editingTripId !== null
                    ? "Update Trip"
                    : "Save Trip"}
                </button>

                {editingTripId !== null && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-lg bg-slate-200 px-6 py-3 font-medium text-slate-700 hover:bg-slate-300"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

            </form>
          </div>
        )}

        {/* STATISTICS */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Trips
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {trips.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              In Progress
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-600">
              {inProgressTrips}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Scheduled
            </p>

            <p className="mt-1 text-2xl font-bold text-orange-600">
              {scheduledTrips}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Completed
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              {completedTrips}
            </p>
          </div>

        </div>

        {/* TRIP REGISTRY */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Trip Registry
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">
                    Trip
                  </th>

                  <th className="px-6 py-4">
                    Vehicle
                  </th>

                  <th className="px-6 py-4">
                    Driver
                  </th>

                  <th className="px-6 py-4">
                    Route
                  </th>

                  <th className="px-6 py-4">
                    Date
                  </th>

                  <th className="px-6 py-4">
                    Distance
                  </th>

                  <th className="px-6 py-4">
                    Revenue
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Loading trips...
                    </td>
                  </tr>
                ) : trips.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No trips found.
                    </td>
                  </tr>
                ) : (
                  trips.map((trip) => (
                    <tr
                      key={trip.id}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {trip.tripCode}
                        </div>

                        {trip.cargo && (
                          <div className="mt-1 text-xs text-slate-400">
                            Cargo: {trip.cargo}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {trip.vehicleCode}
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {trip.driverCode}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-slate-700">
                          {trip.origin}
                        </div>

                        <div className="text-xs text-slate-400">
                          → {trip.destination}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(trip.tripDate)}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {Number(
                          trip.distance,
                        ).toLocaleString()}{" "}
                        km
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-700">
                        {Number(
                          trip.revenue,
                        ).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            trip.status ===
                            "Completed"
                              ? "bg-green-100 text-green-700"
                              : trip.status ===
                                  "In Progress"
                                ? "bg-blue-100 text-blue-700"
                                : trip.status ===
                                    "Cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {trip.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              handleEdit(trip)
                            }
                            className="rounded-md bg-blue-100 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-200"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(trip.id)
                            }
                            className="rounded-md bg-red-100 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-200"
                          >
                            Delete
                          </button>

                        </div>
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
