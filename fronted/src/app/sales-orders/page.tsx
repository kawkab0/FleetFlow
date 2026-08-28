"use client";

import { useEffect, useState } from "react";

interface SalesOrder {
  id: number;
  orderNumber: string;
  customerId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
}

interface Customer {
  id: number;
  name: string;
}

interface SalesOrderForm {
  orderNumber: string;
  customerId: string;
  orderDate: string;
  status: string;
  totalAmount: string;
}

const emptyForm: SalesOrderForm = {
  orderNumber: "",
  customerId: "",
  orderDate: "",
  status: "Pending",
  totalAmount: "",
};

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<SalesOrderForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingOrder, setEditingOrder] =
    useState<SalesOrder | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [ordersResponse, customersResponse] =
        await Promise.all([
          fetch("http://localhost:3001/sales-orders"),
          fetch("http://localhost:3001/customers"),
        ]);

      if (!ordersResponse.ok || !customersResponse.ok) {
        throw new Error("Failed to fetch sales order data");
      }

      const [ordersData, customersData] = await Promise.all([
        ordersResponse.json(),
        customersResponse.json(),
      ]);

      setOrders(ordersData);
      setCustomers(customersData);
    } catch (error) {
      console.error(
        "Failed to fetch sales order data:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const convertDateToBackendFormat = (date: string) => {
    const parts = date.split("/");

    if (parts.length !== 3) {
      return date;
    }

    const [month, day, year] = parts;

    if (
      month.length !== 2 ||
      day.length !== 2 ||
      year.length !== 4
    ) {
      return date;
    }

    return `${year}-${month}-${day}`;
  };

  const convertDateToDisplayFormat = (date: string) => {
    if (!date) {
      return "";
    }

    const parts = date.slice(0, 10).split("-");

    if (parts.length !== 3) {
      return date;
    }

    const [year, month, day] = parts;

    return `${month}/${day}/${year}`;
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (
      !/^\d{2}\/\d{2}\/\d{4}$/.test(form.orderDate)
    ) {
      alert("Please enter the date in MM/DD/YYYY format.");
      return;
    }

    setSaving(true);

    try {
      const url = editingOrder
        ? `http://localhost:3001/sales-orders/${editingOrder.id}`
        : "http://localhost:3001/sales-orders";

      const method = editingOrder ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: form.orderNumber,
          customerId: Number(form.customerId),
          orderDate: convertDateToBackendFormat(
            form.orderDate
          ),
          status: form.status,
          totalAmount: Number(form.totalAmount),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save sales order");
      }

      setForm(emptyForm);
      setEditingOrder(null);

      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to save sales order.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (order: SalesOrder) => {
    setEditingOrder(order);

    setForm({
      orderNumber: order.orderNumber,
      customerId: String(order.customerId),
      orderDate: convertDateToDisplayFormat(
        order.orderDate
      ),
      status: order.status,
      totalAmount: String(order.totalAmount),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sales order?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(
        `http://localhost:3001/sales-orders/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete sales order");
      }

      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete sales order.");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingOrder(null);
    setForm(emptyForm);
  };

  const getCustomerName = (customerId: number) => {
    return (
      customers.find(
        (customer) => customer.id === customerId
      )?.name || `Customer #${customerId}`
    );
  };

  const filteredOrders = orders.filter((order) => {
    const searchText = search.toLowerCase();

    return (
      order.orderNumber
        ?.toLowerCase()
        .includes(searchText) ||
      order.status
        ?.toLowerCase()
        .includes(searchText) ||
      getCustomerName(order.customerId)
        .toLowerCase()
        .includes(searchText)
    );
  });

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const totalSales = orders.reduce(
    (total, order) =>
      total + Number(order.totalAmount || 0),
    0
  );

  return (
    <main className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Sales Orders
        </h1>

        <p className="mt-2 text-slate-500">
          Manage customer orders, order status, and sales totals.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Orders
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalOrders}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Pending Orders
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-600">
            {pendingOrders}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Sales
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            ${totalSales.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingOrder
              ? "Edit Sales Order"
              : "Add Sales Order"}
          </h2>

          {editingOrder && (
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
            placeholder="Order number"
            value={form.orderNumber}
            onChange={(e) =>
              setForm({
                ...form,
                orderNumber: e.target.value,
              })
            }
            required
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <select
            value={form.customerId}
            onChange={(e) =>
              setForm({
                ...form,
                customerId: e.target.value,
              })
            }
            required
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Select customer</option>

            {customers.map((customer) => (
              <option
                key={customer.id}
                value={customer.id}
              >
                {customer.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="MM/DD/YYYY"
            value={form.orderDate}
            onChange={(e) =>
              setForm({
                ...form,
                orderDate: e.target.value,
              })
            }
            required
            maxLength={10}
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
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

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

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingOrder
                ? "Update Order"
                : "Add Order"}
          </button>

          {editingOrder && (
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
          placeholder="Search by order number, customer, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">
          Loading sales orders...
        </p>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">
            No sales orders match your search.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Order
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Order Date
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Status
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
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {order.orderNumber}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID: {order.id}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {getCustomerName(order.customerId)}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {order.orderDate
                        ? convertDateToDisplayFormat(
                            order.orderDate
                          )
                        : "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {order.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      ${Number(order.totalAmount).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(order)
                          }
                          className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(order.id)
                          }
                          disabled={
                            deletingId === order.id
                          }
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          {deletingId === order.id
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
