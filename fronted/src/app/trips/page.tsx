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
  status: string;
  fuelUsed: string | number;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    tripCode: "",
    origin: "",
    destination: "",
    vehicleCode: "",
    driverCode: "",
    tripDate: "",
    distance: "",
    status: "Planned",
    fuelUsed: "0",
  });

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

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.tripDate)) {
      alert("Please enter the date in YYYY-MM-DD format.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tripCode: form.tripCode,
          origin: form.origin,
          destination: form.destination,
          vehicleCode: form.vehicleCode,
          driverCode: form.driverCode,
          tripDate: form.tripDate,
          distance: Number(form.distance),
          status: form.status,
          fuelUsed: Number(form.fuelUsed),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create trip");
      }

      setForm({
        tripCode: "",
        origin: "",
        destination: "",
        vehicleCode: "",
        driverCode: "",
        tripDate: "",
        distance: "",
        status: "Planned",
        fuelUsed: "0",
      });

      setShowForm(false);
      fetchTrips();
    } catch (error) {
      console.error("Error creating trip:", error);
      alert("Failed to create trip.");
    }
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
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Create Trip"}
          </button>
        </div>

        {/* CREATE TRIP FORM */}
        {showForm && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">
              Create New Trip
            </h2>

            <form
              onSubmit={handleCreateTrip}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >

              {/* TRIP CODE */}
              <input
                type="text"
                placeholder="Trip Code"
                value={form.tripCode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tripCode: e.target.value,
                  })
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
                  setForm({
                    ...form,
                    origin: e.target.value,
                  })
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
                  setForm({
                    ...form,
                    destination: e.target.value,
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

              {/* DATE — ALWAYS YYYY-MM-DD */}
              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={form.tripDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tripDate: e.target.value,
                  })
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
                  setForm({
                    ...form,
                    distance: e.target.value,
                  })
                }
                min="0"
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
                <option value="Planned">Planned</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* FUEL */}
              <input
                type="number"
                placeholder="Fuel Used (L)"
                value={form.fuelUsed}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fuelUsed: e.target.value,
                  })
                }
                min="0"
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* SAVE */}
              <div className="sm:col-span-2 lg:col-span-4">
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
                >
                  Save Trip
                </button>
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
                  <th className="px-6 py-4">Trip ID</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Driver</th>
                  <th className="px-6 py-4">Origin</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Distance</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Loading trips...
                    </td>
                  </tr>
                ) : trips.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
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
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {trip.tripCode}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {trip.vehicleCode}
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {trip.driverCode}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {trip.origin}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {trip.destination}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(trip.tripDate)}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {Number(trip.distance).toLocaleString()} km
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            trip.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : trip.status === "In Progress"
                                ? "bg-blue-100 text-blue-700"
                                : trip.status === "Cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {trip.status}
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
