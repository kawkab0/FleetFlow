"use client";

import { useEffect, useState } from "react";

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
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<PurchaseForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingPurchase, setEditingPurchase] =
    useState<Purchase | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [
        purchasesResponse,
        suppliersResponse,
        warehousesResponse,
      ] = await Promise.all([
        fetch("http://localhost:3001/purchases"),
        fetch("http://localhost:3001/suppliers"),
        fetch("http://localhost:3001/warehouses"),
      ]);

      if (
        !purchasesResponse.ok ||
        !suppliersResponse.ok ||
        !warehousesResponse.ok
      ) {
        throw new Error("Failed to fetch purchase data");
      }

      const [
        purchasesData,
        suppliersData,
        warehousesData,
      ] = await Promise.all([
        purchasesResponse.json(),
        suppliersResponse.json(),
        warehousesResponse.json(),
      ]);

      setPurchases(purchasesData);
      setSuppliers(suppliersData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error("Failed to fetch purchase data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSupplierName = (supplierId: number) => {
    return (
      suppliers.find(
        (supplier) => supplier.id === supplierId
      )?.name || `Supplier #${supplierId}`
    );
  };

  const getWarehouseName = (warehouseId: number) => {
    return (
      warehouses.find(
        (warehouse) => warehouse.id === warehouseId
      )?.name || `Warehouse #${warehouseId}`
    );
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();
    setSaving(true);

    try {
      const url = editingPurchase
        ? `http://localhost:3001/purchases/${editingPurchase.id}`
        : "http://localhost:3001/purchases";

      const method = editingPurchase ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
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

      if (!response.ok) {
        throw new Error("Failed to save purchase");
      }

      setForm(emptyForm);
      setEditingPurchase(null);

      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to save purchase.");
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this purchase?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(
        `http://localhost:3001/purchases/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete purchase");
      }

      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete purchase.");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingPurchase(null);
    setForm(emptyForm);
  };

  const filteredPurchases = purchases.filter((purchase) => {
    const searchText = search.toLowerCase();

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
        .includes(searchText)
    );
  });

  const totalPurchases = purchases.length;

  const totalAmount = purchases.reduce(
    (total, purchase) =>
      total + Number(purchase.totalAmount || 0),
    0
  );

  const pendingPurchases = purchases.filter(
    (purchase) =>
      purchase.status.toLowerCase() === "pending"
  ).length;

  return (
    <main className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Purchases
        </h1>

        <p className="mt-2 text-slate-500">
          Manage supplier purchases, warehouse deliveries, and purchase records.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Purchases
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalPurchases}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Amount
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            ${totalAmount.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Pending Purchases
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-500">
            {pendingPurchases}
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingPurchase
              ? "Edit Purchase"
              : "Add Purchase"}
          </h2>

          {editingPurchase && (
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
          <select
            value={form.supplierId}
            onChange={(e) =>
              setForm({
                ...form,
                supplierId: e.target.value,
              })
            }
            required
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
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

          <select
            value={form.warehouseId}
            onChange={(e) =>
              setForm({
                ...form,
                warehouseId: e.target.value,
              })
            }
            required
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
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
            className="rounded-lg border border-slate-300 px-4 py-3 text-left outline-none focus:border-blue-500"
          />

          <input
            type="number"
            placeholder="Total amount"
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
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <select
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value,
              })
            }
            required
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
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

          <input
            type="text"
            placeholder="Reference number"
            value={form.referenceNumber}
            onChange={(e) =>
              setForm({
                ...form,
                referenceNumber: e.target.value,
              })
            }
            required
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) =>
              setForm({
                ...form,
                notes: e.target.value,
              })
            }
            rows={3}
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 md:col-span-2"
          />

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
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
          placeholder="Search by reference, supplier, warehouse, or status..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">
          Loading purchases...
        </p>
      ) : filteredPurchases.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">
            No purchases found.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Reference
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Supplier
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Warehouse
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Amount
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
                {filteredPurchases.map(
                  (purchase) => (
                    <tr
                      key={purchase.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {purchase.referenceNumber}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          ID: {purchase.id}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {getSupplierName(
                          purchase.supplierId
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {getWarehouseName(
                          purchase.warehouseId
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {purchase.purchaseDate}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        $
                        {Number(
                          purchase.totalAmount
                        ).toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            purchase.status
                              .toLowerCase() ===
                            "pending"
                              ? "bg-amber-50 text-amber-600"
                              : purchase.status
                                  .toLowerCase() ===
                                "received"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {purchase.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                purchase
                              )
                            }
                            className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                purchase.id
                              )
                            }
                            disabled={
                              deletingId ===
                              purchase.id
                            }
                            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                          >
                            {deletingId ===
                            purchase.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
