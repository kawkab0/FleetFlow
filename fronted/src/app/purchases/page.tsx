"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/app/components/ProtectedPage";
import { apiFetch } from "@/lib/api";

interface Purchase {
  id: number;
  supplierId: number;
  warehouseId: number;
  purchaseDate: string;
  totalAmount: number | string;
  status: string;
  referenceNumber: string;
  notes: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface Warehouse {
  id: number;
  name: string;
}

interface PurchaseForm {
  supplierId: string;
  warehouseId: string;
  purchaseDate: string;
  totalAmount: string;
  status: string;
  referenceNumber: string;
  notes: string;
}

const emptyForm: PurchaseForm = {
  supplierId: "",
  warehouseId: "",
  purchaseDate: "",
  totalAmount: "",
  status: "Pending",
  referenceNumber: "",
  notes: "",
};

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [form, setForm] =
    useState<PurchaseForm>(emptyForm);

  const [saving, setSaving] = useState(false);

  const [editingPurchase, setEditingPurchase] =
    useState<Purchase | null>(null);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

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

      const [
        purchasesData,
        suppliersData,
        warehousesData,
      ] = await Promise.all([
        apiFetch("/purchases"),
        apiFetch("/suppliers"),
        apiFetch("/warehouses"),
      ]);

      setPurchases(purchasesData);
      setSuppliers(suppliersData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error(
        "Failed to fetch purchase data:",
        error,
      );

      setError(
        "Failed to load purchase data. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSupplierName = (supplierId: number) => {
    return (
      suppliers.find(
        (supplier) => supplier.id === supplierId,
      )?.name || `Supplier #${supplierId}`
    );
  };

  const getWarehouseName = (warehouseId: number) => {
    return (
      warehouses.find(
        (warehouse) => warehouse.id === warehouseId,
      )?.name || `Warehouse #${warehouseId}`
    );
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = editingPurchase
        ? `/purchases/${editingPurchase.id}`
        : "/purchases";

      const method = editingPurchase ? "PATCH" : "POST";

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify({
          supplierId: Number(form.supplierId),
          warehouseId: Number(form.warehouseId),
          purchaseDate: form.purchaseDate,
          totalAmount: Number(form.totalAmount),
          status: form.status,
          referenceNumber: form.referenceNumber,
          notes: form.notes,
        }),
      });

      const wasEditing = Boolean(editingPurchase);

      setForm(emptyForm);
      setEditingPurchase(null);

      await fetchData();

      setSuccess(
        wasEditing
          ? "Purchase updated successfully."
          : "Purchase added successfully.",
      );
    } catch (error) {
      console.error(error);

      setError(
        editingPurchase
          ? "Failed to update purchase."
          : "Failed to add purchase.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase);

    setForm({
      supplierId: String(purchase.supplierId),
      warehouseId: String(purchase.warehouseId),
      purchaseDate: purchase.purchaseDate,
      totalAmount: String(purchase.totalAmount),
      status: purchase.status,
      referenceNumber: purchase.referenceNumber,
      notes: purchase.notes || "",
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
      "Are you sure you want to delete this purchase?",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/purchases/${id}`, {
        method: "DELETE",
      });

      await fetchData();

      setSuccess("Purchase deleted successfully.");
    } catch (error) {
      console.error(error);
      setError("Failed to delete purchase.");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingPurchase(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  };

  const filteredPurchases = purchases.filter(
    (purchase) => {
      const searchText = search.toLowerCase().trim();

      if (!searchText) {
        return true;
      }

      return (
        purchase.referenceNumber
          .toLowerCase()
          .includes(searchText) ||
        getSupplierName(purchase.supplierId)
          .toLowerCase()
          .includes(searchText) ||
        getWarehouseName(purchase.warehouseId)
          .toLowerCase()
          .includes(searchText) ||
        purchase.status
          .toLowerCase()
          .includes(searchText) ||
        purchase.purchaseDate
          .toLowerCase()
          .includes(searchText)
      );
    },
  );

  const totalPurchases = purchases.length;

  const totalAmount = purchases.reduce(
    (total, purchase) =>
      total + Number(purchase.totalAmount || 0),
    0,
  );

  const pendingPurchases = purchases.filter(
    (purchase) =>
      purchase.status.toLowerCase() === "pending",
  ).length;

  const receivedPurchases = purchases.filter(
    (purchase) =>
      purchase.status.toLowerCase() === "received",
  ).length;

  return (
    <ProtectedPage permission="purchases">
      <main className="ml-64 min-h-screen bg-slate-50 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">↓</span>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Purchases
              </h1>
            </div>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Manage supplier purchases, warehouse deliveries,
              purchase amounts, and procurement records.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              className={
                refreshing ? "animate-spin" : ""
              }
            >
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
                  Total Purchases
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalPurchases}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg text-blue-600">
                ↓
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Amount
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-lg text-emerald-600">
                $
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending
                </p>

                <p className="mt-2 text-3xl font-bold text-amber-500">
                  {pendingPurchases}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-lg text-amber-600">
                ◷
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Received
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {receivedPurchases}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg text-blue-600">
                ✓
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Form */}
        <section className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingPurchase
                    ? "Edit Purchase"
                    : "Add Purchase"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingPurchase
                    ? "Update the purchase information below."
                    : "Create a new supplier purchase record."}
                </p>
              </div>

              {editingPurchase && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  Editing #{editingPurchase.id}
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
                Supplier *
              </label>

              <select
                value={form.supplierId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    supplierId: e.target.value,
                  })
                }
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select supplier
                </option>

                {suppliers.map((supplier) => (
                  <option
                    key={supplier.id}
                    value={supplier.id}
                  >
                    {supplier.name}
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
                <option value="">
                  Select warehouse
                </option>

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
                Purchase Date *
              </label>

              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={form.purchaseDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    purchaseDate: e.target.value,
                  })
                }
                required
                pattern="\d{4}-\d{2}-\d{2}"
                title="Please enter the date in YYYY-MM-DD format"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-left text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Format: YYYY-MM-DD
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Total Amount *
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                  $
                </span>

                <input
                  type="number"
                  placeholder="0.00"
                  value={form.totalAmount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      totalAmount: e.target.value,
                    })
                  }
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-8 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Status *
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Pending">
                  Pending
                </option>

                <option value="Received">
                  Received
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Reference Number *
              </label>

              <input
                type="text"
                placeholder="e.g. PO-0001"
                value={form.referenceNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    referenceNumber: e.target.value,
                  })
                }
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Notes
              </label>

              <textarea
                placeholder="Add purchase notes..."
                value={form.notes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes: e.target.value,
                  })
                }
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  : editingPurchase
                    ? "Update Purchase"
                    : "Add Purchase"}
              </button>

              {editingPurchase && (
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
                placeholder="Search by reference, supplier, warehouse, status, or date..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="text-sm text-slate-500">
              {filteredPurchases.length}{" "}
              {filteredPurchases.length === 1
                ? "purchase"
                : "purchases"}
            </div>
          </div>
        </section>

        {/* Purchase Table */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-sm font-medium text-slate-600">
              Loading purchases...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait.
            </p>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
              ↓
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No purchases found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              {search
                ? "No purchases match your current search. Try a different search term."
                : "There are no purchase records yet. Add your first purchase using the form above."}
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
                  Purchase Directory
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Supplier procurement records currently registered in FleetFlow.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {filteredPurchases.length} shown
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Reference
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Supplier
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Warehouse
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
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
                  {filteredPurchases.map(
                    (purchase) => {
                      const status =
                        purchase.status.toLowerCase();

                      return (
                        <tr
                          key={purchase.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                                ↓
                              </div>

                              <div>
                                <p className="font-semibold text-slate-900">
                                  {
                                    purchase.referenceNumber
                                  }
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  ID #{purchase.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-slate-700">
                              {getSupplierName(
                                purchase.supplierId,
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Supplier ID #
                              {purchase.supplierId}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-slate-700">
                              {getWarehouseName(
                                purchase.warehouseId,
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Warehouse ID #
                              {purchase.warehouseId}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {purchase.purchaseDate}
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-slate-900">
                              $
                              {Number(
                                purchase.totalAmount,
                              ).toFixed(2)}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            {status === "pending" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                Pending
                              </span>
                            ) : status === "received" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Received
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                {purchase.status}
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    purchase,
                                  )
                                }
                                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    purchase.id,
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  purchase.id
                                }
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingId ===
                                purchase.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredPurchases.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {purchases.length}
                </span>{" "}
                purchases
              </p>
            </div>
          </div>
        )}
      </main>
    </ProtectedPage>
  );
}
