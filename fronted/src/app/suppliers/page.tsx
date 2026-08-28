"use client";

import { useEffect, useState } from "react";

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
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<SupplierForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingSupplier, setEditingSupplier] =
    useState<Supplier | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/suppliers",
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
      }

      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();
    setSaving(true);

    try {
      const url = editingSupplier
        ? `http://localhost:3001/suppliers/${editingSupplier.id}`
        : "http://localhost:3001/suppliers";

      const method = editingSupplier ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to save supplier");
      }

      setForm(emptyForm);
      setEditingSupplier(null);

      await fetchSuppliers();
    } catch (error) {
      console.error(error);
      alert("Failed to save supplier.");
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

    try {
      const response = await fetch(
        `http://localhost:3001/suppliers/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete supplier");
      }

      await fetchSuppliers();
    } catch (error) {
      console.error(error);
      alert("Failed to delete supplier.");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingSupplier(null);
    setForm(emptyForm);
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const searchText = search.toLowerCase();

    return (
      supplier.name.toLowerCase().includes(searchText) ||
      supplier.contactPerson
        ?.toLowerCase()
        .includes(searchText) ||
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
    <main className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Suppliers
        </h1>

        <p className="mt-2 text-slate-500">
          Manage suppliers, contacts, addresses, and supplier status.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Suppliers
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalSuppliers}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Active Suppliers
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {activeSuppliers}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Inactive Suppliers
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-600">
            {inactiveSuppliers}
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingSupplier
              ? "Edit Supplier"
              : "Add Supplier"}
          </h2>

          {editingSupplier && (
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
            placeholder="Supplier name"
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
            placeholder="Contact person"
            value={form.contactPerson}
            onChange={(e) =>
              setForm({
                ...form,
                contactPerson: e.target.value,
              })
            }
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
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
              : editingSupplier
                ? "Update Supplier"
                : "Add Supplier"}
          </button>

          {editingSupplier && (
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
          placeholder="Search by supplier, contact, email, phone, or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">
          Loading suppliers...
        </p>
      ) : filteredSuppliers.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">
            No suppliers match your search.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Supplier
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Address
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
                {filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {supplier.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID: {supplier.id}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {supplier.contactPerson || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {supplier.email || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {supplier.phone || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {supplier.address || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {supplier.isActive ? (
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
                            handleEdit(supplier)
                          }
                          className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
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
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
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
        </div>
      )}
    </main>
  );
}
