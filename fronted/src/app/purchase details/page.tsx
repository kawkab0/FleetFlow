"use client";

import { useEffect, useState } from "react";

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

  const fetchData = async () => {
    try {
      const [
        detailsResponse,
        purchasesResponse,
        productsResponse,
      ] = await Promise.all([
        fetch("http://localhost:3001/purchase-details"),
        fetch("http://localhost:3001/purchases"),
        fetch("http://localhost:3001/products"),
      ]);

      if (
        !detailsResponse.ok ||
        !purchasesResponse.ok ||
        !productsResponse.ok
      ) {
        throw new Error(
          "Failed to fetch purchase details data"
        );
      }

      const [
        detailsData,
        purchasesData,
        productsData,
      ] = await Promise.all([
        detailsResponse.json(),
        purchasesResponse.json(),
        productsResponse.json(),
      ]);

      setDetails(detailsData);
      setPurchases(purchasesData);
      setProducts(productsData);
    } catch (error) {
      console.error(
        "Failed to fetch purchase details data:",
        error
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
        (purchase) => purchase.id === purchaseId
      )?.referenceNumber ||
      `Purchase #${purchaseId}`
    );
  };

  const getProductName = (productId: number) => {
    return (
      products.find(
        (product) => product.id === productId
      )?.name || `Product #${productId}`
    );
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(
      (item) => item.id === Number(productId)
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
    event: React.FormEvent
  ) => {
    event.preventDefault();
    setSaving(true);

    try {
      const quantity = Number(form.quantity);
      const unitPrice = Number(form.unitPrice);

      const url = editingDetail
        ? `http://localhost:3001/purchase-details/${editingDetail.id}`
        : "http://localhost:3001/purchase-details";

      const method = editingDetail ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purchaseId: Number(form.purchaseId),
          productId: Number(form.productId),
          quantity,
          unitPrice,
          totalPrice: quantity * unitPrice,
        }),
      });

      if (!response.ok) {
        throw new Error(
          "Failed to save purchase detail"
        );
      }

      setForm(emptyForm);
      setEditingDetail(null);

      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to save purchase detail.");
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this purchase detail?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(
        `http://localhost:3001/purchase-details/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete purchase detail"
        );
      }

      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete purchase detail.");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingDetail(null);
    setForm(emptyForm);
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
    0
  );

  const totalValue = details.reduce(
    (total, detail) =>
      total + Number(detail.totalPrice || 0),
    0
  );

  return (
    <main className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Purchase Details
        </h1>

        <p className="mt-2 text-slate-500">
          Manage products and quantities assigned to purchases.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Line Items
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalDetails}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Quantity
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {totalQuantity}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Value
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            ${totalValue.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingDetail
              ? "Edit Purchase Detail"
              : "Add Purchase Detail"}
          </h2>

          {editingDetail && (
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
            value={form.purchaseId}
            onChange={(e) =>
              setForm({
                ...form,
                purchaseId: e.target.value,
              })
            }
            required
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
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

          <select
            value={form.productId}
            onChange={(e) =>
              handleProductChange(e.target.value)
            }
            required
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
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

          <input
            type="number"
            placeholder="Quantity"
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
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="number"
            placeholder="Unit price"
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
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
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
          placeholder="Search by purchase or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">
          Loading purchase details...
        </p>
      ) : filteredDetails.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">
            No purchase details found.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Purchase
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Product
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Unit Price
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Total
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredDetails.map((detail) => (
                  <tr
                    key={detail.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {getPurchaseReference(
                          detail.purchaseId
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID: {detail.purchaseId}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {getProductName(detail.productId)}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {detail.quantity}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      $
                      {Number(
                        detail.unitPrice
                      ).toFixed(2)}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      $
                      {Number(
                        detail.totalPrice
                      ).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(detail)
                          }
                          className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
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
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
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
  );
}
