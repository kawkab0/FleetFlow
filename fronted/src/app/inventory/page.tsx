"use client";

import { useEffect, useState } from "react";

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
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<InventoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingInventory, setEditingInventory] =
    useState<Inventory | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [inventoryResponse, productsResponse, warehousesResponse] =
        await Promise.all([
          fetch("http://localhost:3001/inventory"),
          fetch("http://localhost:3001/products"),
          fetch("http://localhost:3001/warehouses"),
        ]);

      if (
        !inventoryResponse.ok ||
        !productsResponse.ok ||
        !warehousesResponse.ok
      ) {
        throw new Error("Failed to fetch inventory data");
      }

      const [inventoryData, productsData, warehousesData] =
        await Promise.all([
          inventoryResponse.json(),
          productsResponse.json(),
          warehousesResponse.json(),
        ]);

      setInventory(inventoryData);
      setProducts(productsData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error("Failed to fetch inventory data:", error);
    } finally {
      setLoading(false);
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

    try {
      const url = editingInventory
        ? `http://localhost:3001/inventory/${editingInventory.id}`
        : "http://localhost:3001/inventory";

      const method = editingInventory ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: Number(form.productId),
          warehouseId: Number(form.warehouseId),
          quantity: Number(form.quantity),
          reorderLevel: Number(form.reorderLevel),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save inventory");
      }

      setForm(emptyForm);
      setEditingInventory(null);

      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to save inventory.");
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

    try {
      const response = await fetch(
        `http://localhost:3001/inventory/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete inventory");
      }

      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete inventory.");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingInventory(null);
    setForm(emptyForm);
  };

  const getProductName = (productId: number) => {
    return (
      products.find((product) => product.id === productId)?.name ||
      `Product #${productId}`
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
    const searchText = search.toLowerCase();

    const productName = getProductName(item.productId);
    const warehouseName = getWarehouseName(item.warehouseId);

    return (
      productName.toLowerCase().includes(searchText) ||
      warehouseName.toLowerCase().includes(searchText)
    );
  });

  const totalRecords = inventory.length;

  const totalQuantity = inventory.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  const lowStockItems = inventory.filter(
    (item) =>
      Number(item.quantity) <= Number(item.reorderLevel),
  ).length;

  return (
    <main className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Inventory
        </h1>

        <p className="mt-2 text-slate-500">
          Monitor product quantities across warehouse locations.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Inventory Records
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalRecords}
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
            Low Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {lowStockItems}
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingInventory
              ? "Edit Inventory"
              : "Add Inventory"}
          </h2>

          {editingInventory && (
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
            value={form.productId}
            onChange={(e) =>
              setForm({
                ...form,
                productId: e.target.value,
              })
            }
            required
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
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
            min="0"
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="number"
            placeholder="Reorder level"
            value={form.reorderLevel}
            onChange={(e) =>
              setForm({
                ...form,
                reorderLevel: e.target.value,
              })
            }
            required
            min="0"
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
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
          placeholder="Search by product or warehouse..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">
          Loading inventory...
        </p>
      ) : filteredInventory.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">
            No inventory records match your search.
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
                    Warehouse
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Reorder Level
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
                {filteredInventory.map((item) => {
                  const isLowStock =
                    Number(item.quantity) <=
                    Number(item.reorderLevel);

                  return (
                    <tr
                      key={item.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {getProductName(item.productId)}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Product ID: {item.productId}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {getWarehouseName(item.warehouseId)}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {item.quantity}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.reorderLevel}
                      </td>

                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Low Stock
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            In Stock
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(item)
                            }
                            className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
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
                            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
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
        </div>
      )}
    </main>
  );
}
