"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedPage from "@/components/ProtectedPage";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  location: string;
  phone: string;
  category: string;
  status: string;
}

interface ProductForm {
  name: string;
  price: string;
  stock: string;
  location: string;
  phone: string;
  category: string;
  status: string;
}

const emptyForm: ProductForm = {
  name: "",
  price: "",
  stock: "",
  location: "",
  phone: "",
  category: "",
  status: "Active",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await apiFetch("/products");

      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = editingProduct
        ? `/products/${editingProduct.id}`
        : "/products";

      const method = editingProduct ? "PATCH" : "POST";

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          stock: Number(form.stock),
          location: form.location,
          phone: form.phone,
          category: form.category,
          status: form.status,
        }),
      });

      setForm(emptyForm);
      setEditingProduct(null);

      await fetchProducts();

      setSuccess(
        editingProduct
          ? "Product updated successfully."
          : "Product added successfully.",
      );
    } catch (error) {
      console.error(error);

      setError(
        editingProduct
          ? "Failed to update product."
          : "Failed to add product.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);

    setForm({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      location: product.location || "",
      phone: product.phone || "",
      category: product.category || "",
      status: product.status || "Active",
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
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/products/${id}`, {
        method: "DELETE",
      });

      await fetchProducts();

      setSuccess("Product deleted successfully.");
    } catch (error) {
      console.error(error);
      setError("Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  };

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    return (
      product.name.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText) ||
      product.location?.toLowerCase().includes(searchText) ||
      product.status?.toLowerCase().includes(searchText)
    );
  });

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.status === "Active",
  ).length;

  const inactiveProducts =
    totalProducts - activeProducts;

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0,
  );

  return (
    <ProtectedPage permission="products">
      <main className="ml-64 min-h-screen bg-slate-50 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">□</span>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Products
              </h1>
            </div>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Manage products, pricing, stock levels,
              categories, locations, and status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchProducts(true)}
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
                  Total Products
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalProducts}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg text-blue-600">
                □
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Products
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {activeProducts}
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
                  Inactive Products
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-600">
                  {inactiveProducts}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-lg text-slate-500">
                —
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Stock
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {totalStock}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg text-blue-600">
                ▥
              </div>
            </div>
          </div>
        </div>

        {/* Product Form */}
        <section className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingProduct
                    ? "Update the product information below."
                    : "Create a new product record."}
                </p>
              </div>

              {editingProduct && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  Editing #{editingProduct.id}
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
                Product Name *
              </label>

              <input
                type="text"
                placeholder="Enter product name"
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
                Price *
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  $
                </span>

                <input
                  type="number"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value,
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
                Stock *
              </label>

              <input
                type="number"
                placeholder="Enter stock quantity"
                value={form.stock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stock: e.target.value,
                  })
                }
                required
                min="0"
                step="1"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Category
              </label>

              <input
                type="text"
                placeholder="e.g. Electronics"
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Location
              </label>

              <input
                type="text"
                placeholder="Product location"
                value={form.location}
                onChange={(e) =>
                  setForm({
                    ...form,
                    location: e.target.value,
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
                Status
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
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
                  : editingProduct
                    ? "Update Product"
                    : "Add Product"}
              </button>

              {editingProduct && (
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
                placeholder="Search products by name, category, location, or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="text-sm text-slate-500">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}
            </div>
          </div>
        </section>

        {/* Products Table */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-sm font-medium text-slate-600">
              Loading products...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
              □
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No products found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              {search
                ? "No products match your current search. Try a different search term."
                : "There are no products yet. Add your first product using the form above."}
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
                  Product Catalog
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Product records currently in FleetFlow.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {filteredProducts.length} shown
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
                      Category
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Price
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Stock
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Location
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
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                            {product.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {product.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              ID #{product.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {product.category || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-900">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-semibold ${
                            Number(product.stock) > 0
                              ? "text-slate-700"
                              : "text-red-600"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td className="max-w-xs px-6 py-4 text-sm text-slate-600">
                        {product.location || "—"}
                      </td>

                      <td className="px-6 py-4">
                        {product.status === "Active" ? (
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
                              handleEdit(product)
                            }
                            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(product.id)
                            }
                            disabled={
                              deletingId === product.id
                            }
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === product.id
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
                  {filteredProducts.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {products.length}
                </span>{" "}
                products
              </p>
            </div>
          </div>
        )}
      </main>
    </ProtectedPage>
  );
}

