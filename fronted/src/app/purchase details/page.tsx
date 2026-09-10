"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/app/components/ProtectedPage";
import { apiFetch } from "@/lib/api";

interface PurchaseDetail {
  id: number;
  purchaseId: number;
  productId: number;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
}

interface Purchase {
  id: number;
  referenceNumber: string;
}

interface Product {
  id: number;
  name: string;
  price: number | string;
}

interface DetailForm {
  purchaseId: string;
  productId: string;
  quantity: string;
  unitPrice: string;
}

const emptyForm: DetailForm = {
  purchaseId: "",
  productId: "",
  quantity: "",
  unitPrice: "",
};

export default function PurchaseDetailsPage() {
  const [details, setDetails] = useState<PurchaseDetail[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState<DetailForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [editingDetail, setEditingDetail] =
    useState<PurchaseDetail | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        detailsData,
        purchasesData,
        productsData,
      ] = await Promise.all([
        apiFetch("/purchase-details"),
        apiFetch("/purchases"),
        apiFetch("/products"),
      ]);

      setDetails(detailsData);
      setPurchases(purchasesData);
      setProducts(productsData);
    } catch (error) {
      console.error(
        "Failed to fetch purchase details data:",
        error,
      );

      setErrorMessage(
        "Failed to load purchase details.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPurchaseReference = (purchaseId: number) => {
    return (
      purchases.find(
        (purchase) => purchase.id === purchaseId,
      )?.referenceNumber ||
      `Purchase #${purchaseId}`
    );
  };

  const getProductName = (productId: number) => {
    return (
      products.find(
        (product) => product.id === productId,
      )?.name || `Product #${productId}`
    );
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(
      (item) => item.id === Number(productId),
    );

    setForm({
      ...form,
      productId,
      unitPrice: product
        ? String(product.price)
        : "",
    });
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const quantity = Number(form.quantity);
      const unitPrice = Number(form.unitPrice);

      const endpoint = editingDetail
        ? `/purchase-details/${editingDetail.id}`
        : "/purchase-details";

      const method = editingDetail ? "PATCH" : "POST";

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify({
          purchaseId: Number(form.purchaseId),
          productId: Number(form.productId),
          quantity,
          unitPrice,
          totalPrice: quantity * unitPrice,
        }),
      });

      setForm(emptyForm);
      setEditingDetail(null);

      setMessage(
        editingDetail
          ? "Purchase detail updated successfully."
          : "Purchase detail added successfully.",
      );

      await fetchData();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Failed to save purchase detail.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (detail: PurchaseDetail) => {
    setEditingDetail(detail);

    setForm({
      purchaseId: String(detail.purchaseId),
      productId: String(detail.productId),
      quantity: String(detail.quantity),
      unitPrice: String(detail.unitPrice),
    });

    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this purchase detail?",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setMessage("");
    setErrorMessage("");

    try {
      await apiFetch(`/purchase-details/${id}`, {
        method: "DELETE",
      });

      setMessage(
        "Purchase detail deleted successfully.",
      );

      await fetchData();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Failed to delete purchase detail.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingDetail(null);
    setForm(emptyForm);
    setMessage("");
    setErrorMessage("");
  };

  const filteredDetails = details.filter((detail) => {
    const searchText = search.toLowerCase();

    return (
      getPurchaseReference(detail.purchaseId)
        .toLowerCase()
        .includes(searchText) ||
      getProductName(detail.productId)
        .toLowerCase()
        .includes(searchText)
    );
  });

  const totalDetails = details.length;

  const totalQuantity = details.reduce(
    (total, detail) =>
      total + Number(detail.quantity || 0),
    0,
  );

  const totalValue = details.reduce(
    (total, detail) =>
      total + Number(detail.totalPrice || 0),
    0,
  );

  const averageLineValue =
    totalDetails > 0
      ? totalValue / totalDetails
      : 0;

  return (
    <ProtectedPage permission="purchases">
      <main className="ml-64 min-h-screen bg-slate-50 p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-600">
                PO
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Purchase Details
                </h1>

                <p className="mt-1 text-slate-500">
                  Manage products, quantities, and pricing for purchase orders.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Notifications */}
        {message && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            <span>{message}</span>

            <button
              type="button"
              onClick={() => setMessage("")}
              className="text-emerald-600 hover:text-emerald-900"
            >
              ×
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            <span>{errorMessage}</span>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="text-red-600 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Line Items
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalDetails}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Purchase detail records
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Quantity
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {totalQuantity}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Units purchased
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Value
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              ${totalValue.toFixed(2)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Combined purchase value
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Average Line Value
            </p>

            <p className="mt-2 text-3xl font-bold text-violet-600">
              ${averageLineValue.toFixed(2)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Average per line item
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="mb-8 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {editingDetail
                  ? "Edit Purchase Detail"
                  : "Add Purchase Detail"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editingDetail
                  ? "Update the selected purchase line item."
                  : "Add a product line to an existing purchase."}
              </p>
            </div>

            {editingDetail && (
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                Editing #{editingDetail.id}
              </span>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {/* Purchase */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Purchase
              </label>

              <select
                value={form.purchaseId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    purchaseId: e.target.value,
                  })
                }
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select purchase
                </option>

                {purchases.map((purchase) => (
                  <option
                    key={purchase.id}
                    value={purchase.id}
                  >
                    {purchase.referenceNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Product */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Product
              </label>

              <select
                value={form.productId}
                onChange={(e) =>
                  handleProductChange(e.target.value)
                }
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select product
                </option>

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

            {/* Quantity */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Quantity
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
                min="1"
                step="1"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Unit Price */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Unit Price
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  $
                </span>

                <input
                  type="number"
                  placeholder="0.00"
                  value={form.unitPrice}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      unitPrice: e.target.value,
                    })
                  }
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-8 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">
                  Line Total
                </span>

                <span className="text-lg font-bold text-blue-900">
                  $
                  {(
                    Number(form.quantity || 0) *
                    Number(form.unitPrice || 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingDetail
                  ? "Update Detail"
                  : "Add Detail"}
            </button>

            {editingDetail && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* Search */}
        <div className="mb-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search by purchase or product..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {filteredDetails.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {totalDetails}
              </span>{" "}
              records
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="rounded-xl border border-slate-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-sm text-slate-500">
              Loading purchase details...
            </p>
          </div>
        ) : filteredDetails.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
              PO
            </div>

            <h3 className="font-semibold text-slate-900">
              No purchase details found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {search
                ? "Try changing your search."
                : "Add your first purchase detail to get started."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Purchase Line Items
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Products assigned to purchase orders
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Purchase
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Product
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Quantity
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Unit Price
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDetails.map((detail) => (
                    <tr
                      key={detail.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      {/* Purchase */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-600">
                            PO
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {getPurchaseReference(
                                detail.purchaseId,
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              ID: {detail.purchaseId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-600">
                            {getProductName(
                              detail.productId,
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {getProductName(
                                detail.productId,
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Product ID: {detail.productId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          {detail.quantity}
                        </span>
                        <span className="ml-1 text-xs text-slate-400">
                          units
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        $
                        {Number(
                          detail.unitPrice,
                        ).toFixed(2)}
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">
                          $
                          {Number(
                            detail.totalPrice,
                          ).toFixed(2)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(detail)
                            }
                            className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(detail.id)
                            }
                            disabled={
                              deletingId === detail.id
                            }
                            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === detail.id
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
    </ProtectedPage>
  );
}
