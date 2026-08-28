"use client";

import { useEffect, useState } from "react";

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
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/products",
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();
    setSaving(true);

    try {
      const url = editingProduct
        ? `http://localhost:3001/products/${editingProduct.id}`
        : "http://localhost:3001/products";

      const method = editingProduct ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
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

      if (!response.ok) {
        throw new Error("Failed to save product");
      }

      setForm(emptyForm);
      setEditingProduct(null);

      await fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Failed to save product.");
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

    try {
      const response = await fetch(
        `http://localhost:3001/products/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      await fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    return (
      product.name.toLowerCase().includes(searchText) ||
      product.category
        ?.toLowerCase()
        .includes(searchText) ||
      product.location
        ?.toLowerCase()
        .includes(searchText) ||
      product.status
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.status === "Active",
  ).length;

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0,
  );

  return (
    <main className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Products
        </h1>

        <p className="mt-2 text-slate-500">
          Manage products, pricing, stock, categories, and status.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Products
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalProducts}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Active Products
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {activeProducts}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {totalStock}
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingProduct
              ? "Edit Product"
              : "Add Product"}
          </h2>

          {editingProduct && (
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
            placeholder="Product name"
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
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value,
              })
            }
            required
            min="0"
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) =>
              setForm({
                ...form,
                stock: e.target.value,
              })
            }
            required
            min="0"
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="text"
            placeholder="Location"
            value={form.location}
            onChange={(e) =>
              setForm({
                ...form,
                location: e.target.value,
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
            placeholder="Category"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
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
              : editingProduct
                ? "Update Product"
                : "Add Product"}
          </button>

          {editingProduct && (
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
          placeholder="Search by product, category, location, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">
          Loading products...
        </p>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">
            No products match your search.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Product
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Price
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Stock
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Location
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
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID: {product.id}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.category || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      ${Number(product.price).toFixed(2)}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.stock}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.location || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {product.status === "Active" ? (
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
                            handleEdit(product)
                          }
                          className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
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
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
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
        </div>
      )}
    </main>
  );
}
