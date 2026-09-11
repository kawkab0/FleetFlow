"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedPage from "@/components/ProtectedPage";

interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
}

interface SupplierForm {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
}

const emptyForm: SupplierForm = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  isActive: true,
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState<SupplierForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [editingSupplier, setEditingSupplier] =
    useState<Supplier | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSuppliers = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await apiFetch("/suppliers");

      setSuppliers(data);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      setError("Failed to load suppliers. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = editingSupplier
        ? `/suppliers/${editingSupplier.id}`
        : "/suppliers";

      const method = editingSupplier ? "PATCH" : "POST";

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(form),
      });

      setForm(emptyForm);
      setEditingSupplier(null);

      await fetchSuppliers();

      setSuccess(
        editingSupplier
          ? "Supplier updated successfully."
          : "Supplier added successfully.",
      );
    } catch (error) {
      console.error(error);

      setError(
        editingSupplier
          ? "Failed to update supplier."
          : "Failed to add supplier.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);

    setForm({
      name: supplier.name,
      contactPerson: supplier.contactPerson || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      isActive: supplier.isActive,
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
      "Are you sure you want to delete this supplier?",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/suppliers/${id}`, {
        method: "DELETE",
      });

      await fetchSuppliers();

      setSuccess("Supplier deleted successfully.");
    } catch (error) {
      console.error(error);
      setError("Failed to delete supplier.");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingSupplier(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    return (
      supplier.name.toLowerCase().includes(searchText) ||
      supplier.contactPerson?.toLowerCase().includes(searchText) ||
      supplier.email?.toLowerCase().includes(searchText) ||
      supplier.phone?.toLowerCase().includes(searchText) ||
      supplier.address?.toLowerCase().includes(searchText)
    );
  });

  const totalSuppliers = suppliers.length;

  const activeSuppliers = suppliers.filter(
    (supplier) => supplier.isActive,
  ).length;

  const inactiveSuppliers =
    totalSuppliers - activeSuppliers;

  return (
    <ProtectedPage permission="suppliers">
      <main className="ml-64 min-h-screen bg-slate-50 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">◇</span>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Suppliers
              </h1>
            </div>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Manage supplier information, contacts, addresses,
              and supplier account status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchSuppliers(true)}
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
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Suppliers
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalSuppliers}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg text-blue-600">
                ◇
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Suppliers
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {activeSuppliers}
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
                  Inactive Suppliers
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-600">
                  {inactiveSuppliers}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-lg text-slate-500">
                —
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Form */}
        <section className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingSupplier
                    ? "Edit Supplier"
                    : "Add Supplier"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingSupplier
                    ? "Update the supplier's information below."
                    : "Create a new supplier record."}
                </p>
              </div>

              {editingSupplier && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  Editing #{editingSupplier.id}
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
                Supplier Name *
              </label>

              <input
                type="text"
                placeholder="Enter supplier name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Contact Person
              </label>

              <input
                type="text"
                placeholder="Contact person's name"
                value={form.contactPerson}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contactPerson: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                placeholder="supplier@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone
              </label>

              <input
                type="text"
                placeholder="+251..."
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Address
              </label>

              <input
                type="text"
                placeholder="Supplier address"
                value={form.address}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                value={form.isActive ? "Active" : "Inactive"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isActive: e.target.value === "Active",
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingSupplier
                    ? "Update Supplier"
                    : "Add Supplier"}
              </button>

              {editingSupplier && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
                placeholder="Search suppliers by name, contact, email, phone, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="text-sm text-slate-500">
              {filteredSuppliers.length}{" "}
              {filteredSuppliers.length === 1
                ? "supplier"
                : "suppliers"}
            </div>
          </div>
        </section>

        {/* Table */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-sm font-medium text-slate-600">
              Loading suppliers...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait.
            </p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
              ◇
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No suppliers found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              {search
                ? "No suppliers match your current search. Try a different search term."
                : "There are no suppliers yet. Add your first supplier using the form above."}
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
                  Supplier Directory
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Supplier records currently in FleetFlow.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {filteredSuppliers.length} shown
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Supplier
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Phone / Email
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Address
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
                  {filteredSuppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                            {supplier.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {supplier.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              ID #{supplier.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {supplier.contactPerson || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <p className="text-slate-700">
                            {supplier.phone || "No phone"}
                          </p>

                          <p className="text-xs text-slate-400">
                            {supplier.email || "No email"}
                          </p>
                        </div>
                      </td>

                      <td className="max-w-xs px-6 py-4 text-sm text-slate-600">
                        {supplier.address || "—"}
                      </td>

                      <td className="px-6 py-4">
                        {supplier.isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(supplier)
                            }
                            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(supplier.id)
                            }
                            disabled={
                              deletingId === supplier.id
                            }
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === supplier.id
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

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredSuppliers.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {suppliers.length}
                </span>{" "}
                suppliers
              </p>
            </div>
          </div>
        )}
      </main>
    </ProtectedPage>
  );
}

