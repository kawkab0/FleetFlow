"use client";

import { useEffect, useState } from "react";

interface Warehouse {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  manager: string;
  phone: string;
  isActive: boolean;
}

interface WarehouseForm {
  name: string;
  address: string;
  city: string;
  country: string;
  manager: string;
  phone: string;
  isActive: boolean;
}

const emptyForm: WarehouseForm = {
  name: "",
  address: "",
  city: "",
  country: "",
  manager: "",
  phone: "",
  isActive: true,
};

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<WarehouseForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingWarehouse, setEditingWarehouse] =
    useState<Warehouse | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchWarehouses = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/warehouses",
      );

      if (!response.ok) {
        throw new Error("Failed to fetch warehouses");
      }

      const data = await response.json();
      setWarehouses(data);
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();
    setSaving(true);

    try {
      const url = editingWarehouse
        ? `http://localhost:3001/warehouses/${editingWarehouse.id}`
        : "http://localhost:3001/warehouses";

      const method = editingWarehouse ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to save warehouse");
      }

      setForm(emptyForm);
      setEditingWarehouse(null);

      await fetchWarehouses();
    } catch (error) {
      console.error(error);
      alert("Failed to save warehouse.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);

    setForm({
      name: warehouse.name,
      address: warehouse.address || "",
      city: warehouse.city || "",
      country: warehouse.country || "",
      manager: warehouse.manager || "",
      phone: warehouse.phone || "",
      isActive: warehouse.isActive,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this warehouse?",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(
        `http://localhost:3001/warehouses/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete warehouse");
      }

      await fetchWarehouses();
    } catch (error) {
      console.error(error);
      alert("Failed to delete warehouse.");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingWarehouse(null);
    setForm(emptyForm);
  };

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const searchText = search.toLowerCase();

    return (
      warehouse.name.toLowerCase().includes(searchText) ||
      warehouse.city?.toLowerCase().includes(searchText) ||
      warehouse.country?.toLowerCase().includes(searchText) ||
      warehouse.manager?.toLowerCase().includes(searchText)
    );
  });

  const totalWarehouses = warehouses.length;

  const activeWarehouses = warehouses.filter(
    (warehouse) => warehouse.isActive,
  ).length;

  const inactiveWarehouses =
    totalWarehouses - activeWarehouses;

  return (
    <main className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Warehouses
        </h1>

        <p className="mt-2 text-slate-500">
          Manage warehouse locations, managers, and operating status.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Warehouses
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalWarehouses}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Active Warehouses
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {activeWarehouses}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Inactive Warehouses
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-600">
            {inactiveWarehouses}
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingWarehouse
              ? "Edit Warehouse"
              : "Add Warehouse"}
          </h2>

          {editingWarehouse && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <input
            type="text"
            placeholder="Warehouse name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            required
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="text"
            placeholder="Address"
            value={form.address}
            onChange={(e) =>
              setForm({
                ...form,
                address: e.target.value,
              })
            }
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="text"
            placeholder="City"
            value={form.city}
            onChange={(e) =>
              setForm({
                ...form,
                city: e.target.value,
              })
            }
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="text"
            placeholder="Country"
            value={form.country}
            onChange={(e) =>
              setForm({
                ...form,
                country: e.target.value,
              })
            }
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="text"
            placeholder="Manager"
            value={form.manager}
            onChange={(e) =>
              setForm({
                ...form,
                manager: e.target.value,
              })
            }
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="text"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <select
            value={form.isActive ? "Active" : "Inactive"}
            onChange={(e) =>
              setForm({
                ...form,
                isActive: e.target.value === "Active",
              })
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingWarehouse
                ? "Update Warehouse"
                : "Add Warehouse"}
          </button>

          {editingWarehouse && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search by warehouse, city, country, or manager..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">
          Loading warehouses...
        </p>
      ) : filteredWarehouses.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">
            No warehouses match your search.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Warehouse
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Location
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Manager
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredWarehouses.map((warehouse) => (
                  <tr
                    key={warehouse.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {warehouse.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {warehouse.address || "No address"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {warehouse.city || "—"},{" "}
                      {warehouse.country || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {warehouse.manager || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {warehouse.phone || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {warehouse.isActive ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(warehouse)
                          }
                          className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(warehouse.id)
                          }
                          disabled={
                            deletingId === warehouse.id
                          }
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          {deletingId === warehouse.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
