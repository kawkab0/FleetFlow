"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedPage from "@/app/components/ProtectedPage";

interface Inventory {
  id: number;
  productId: number;
  warehouseId: number;
  quantity: number;
  reorderLevel: number;
  lastUpdated: string;
}

interface Product {
  id: number;
  name: string;
}

interface Warehouse {
  id: number;
  name: string;
}

interface InventoryForm {
  productId: string;
  warehouseId: string;
  quantity: string;
  reorderLevel: string;
}

const emptyForm: InventoryForm = {
  productId: "",
  warehouseId: "",
  quantity: "",
  reorderLevel: "",
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState<InventoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [editingInventory, setEditingInventory] =
    useState<Inventory | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [inventoryData, productsData, warehousesData] =
        await Promise.all([
          apiFetch("/inventory"),
          apiFetch("/products"),
          apiFetch("/warehouses"),
        ]);

      setInventory(inventoryData);
      setProducts(productsData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error("Failed to fetch inventory data:", error);
      setError(
        "Failed to load inventory data. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = editingInventory
        ? `/inventory/${editingInventory.id}`
        : "/inventory";

      const method = editingInventory ? "PATCH" : "POST";

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify({
          productId: Number(form.productId),
          warehouseId: Number(form.warehouseId),
          quantity: Number(form.quantity),
          reorderLevel: Number(form.reorderLevel),
        }),
      });

      const wasEditing = Boolean(editingInventory);

      setForm(emptyForm);
      setEditingInventory(null);

      await fetchData();

      setSuccess(
        wasEditing
          ? "Inventory record updated successfully."
          : "Inventory record added successfully.",
      );
    } catch (error) {
      console.error(error);

      setError(
        editingInventory
          ? "Failed to update inventory record."
          : "Failed to add inventory record.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Inventory) => {
    setEditingInventory(item);

    setForm({
      productId: String(item.productId),
      warehouseId: String(item.warehouseId),
      quantity: String(item.quantity),
      reorderLevel: String(item.reorderLevel),
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this inventory record?",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/inventory/${id}`, {
        method: "DELETE",
      });

      await fetchData();

      setSuccess("Inventory record deleted successfully.");
    } catch (error) {
      console.error(error);
      setError("Failed to delete inventory record.");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingInventory(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  };

  const getProductName = (productId: number) => {
    return (
      products.find((product) => product.id === productId)
        ?.name || `Product #${productId}`
    );
  };

  const getWarehouseName = (warehouseId: number) => {
    return (
      warehouses.find(
        (warehouse) => warehouse.id === warehouseId,
      )?.name || `Warehouse #${warehouseId}`
    );
  };

  const filteredInventory = inventory.filter((item) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    const productName = getProductName(item.productId);
    const warehouseName = getWarehouseName(item.warehouseId);

    return (
      productName.toLowerCase().includes(searchText) ||
      warehouseName.toLowerCase().includes(searchText) ||
      String(item.productId).includes(searchText) ||
      String(item.warehouseId).includes(searchText)
    );
  });

  const totalRecords = inventory.length;

  const totalQuantity = inventory.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0,
  );

  const lowStockItems = inventory.filter(
    (item) =>
      Number(item.quantity) <=
      Number(item.reorderLevel),
  ).length;

  const healthyStockItems =
    totalRecords - lowStockItems;

  return (
    <ProtectedPage permission="inventory">
      <main className="ml-64 min-h-screen bg-slate-50 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">▥</span>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Inventory
              </h1>
            </div>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Monitor product quantities, warehouse stock
              levels, and replenishment needs.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={refreshing ? "animate-spin" : ""}>
              ↻
            </span>

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Notifications */}
        {success && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <span>✓ {success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="font-bold text-emerald-600 hover:text-emerald-800"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>⚠ {error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-bold text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Inventory Records
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalRecords}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg text-blue-600">
                ▥
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Quantity
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {totalQuantity}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg text-blue-600">
                #
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Healthy Stock
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {healthyStockItems}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-lg text-emerald-600">
                ✓
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Low Stock
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {lowStockItems}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-lg text-red-600">
                !
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Form */}
        <section className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingInventory
                    ? "Edit Inventory"
                    : "Add Inventory"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingInventory
                    ? "Update the stock record below."
                    : "Create a new inventory record for a product and warehouse."}
                </p>
              </div>

              {editingInventory && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  Editing #{editingInventory.id}
                </span>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Product *
              </label>

              <select
                value={form.productId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    productId: e.target.value,
                  })
                }
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select product</option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Warehouse *
              </label>

              <select
                value={form.warehouseId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    warehouseId: e.target.value,
                  })
                }
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select warehouse</option>

                {warehouses.map((warehouse) => (
                  <option
                    key={warehouse.id}
                    value={warehouse.id}
                  >
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Quantity *
              </label>

              <input
                type="number"
                placeholder="Enter quantity"
                value={form.quantity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    quantity: e.target.value,
                  })
                }
                required
                min="0"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Reorder Level *
              </label>

              <input
                type="number"
                placeholder="Minimum stock level"
                value={form.reorderLevel}
                onChange={(e) =>
                  setForm({
                    ...form,
                    reorderLevel: e.target.value,
                  })
                }
                required
                min="0"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-end gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingInventory
                    ? "Update Inventory"
                    : "Add Inventory"}
              </button>

              {editingInventory && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Search */}
        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search by product, warehouse, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="text-sm text-slate-500">
              {filteredInventory.length}{" "}
              {filteredInventory.length === 1
                ? "record"
                : "records"}
            </div>
          </div>
        </section>

        {/* Inventory Table */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-sm font-medium text-slate-600">
              Loading inventory...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait.
            </p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
              ▥
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No inventory records found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              {search
                ? "No inventory records match your current search. Try another search term."
                : "There are no inventory records yet. Add your first record using the form above."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Inventory Overview
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Current stock levels across FleetFlow warehouses.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {filteredInventory.length} shown
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Product
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Warehouse
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Quantity
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Reorder Level
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => {
                    const quantity = Number(
                      item.quantity || 0,
                    );

                    const reorderLevel = Number(
                      item.reorderLevel || 0,
                    );

                    const isLowStock =
                      quantity <= reorderLevel;

                    const productName = getProductName(
                      item.productId,
                    );

                    const warehouseName =
                      getWarehouseName(
                        item.warehouseId,
                      );

                    return (
                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                              {productName
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {productName}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                Product ID #{item.productId}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-700">
                            {warehouseName}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            Warehouse ID #{item.warehouseId}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-bold ${
                              isLowStock
                                ? "text-red-600"
                                : "text-slate-900"
                            }`}
                          >
                            {quantity}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {reorderLevel}
                        </td>

                        <td className="px-6 py-4">
                          {isLowStock ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              In Stock
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(item)
                              }
                              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(item.id)
                              }
                              disabled={
                                deletingId === item.id
                              }
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === item.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredInventory.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {inventory.length}
                </span>{" "}
                inventory records
              </p>
            </div>
          </div>
        )}
      </main>
    </ProtectedPage>
  );
}
