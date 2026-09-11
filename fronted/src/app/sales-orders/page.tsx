"use client";

import { useEffect, useState } from "react";

import ProtectedPage from "@/components/ProtectedPage";
import { apiFetch } from "@/lib/api";

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

  const [form, setForm] =
    useState<SalesOrderForm>(emptyForm);

  const [saving, setSaving] = useState(false);

  const [editingOrder, setEditingOrder] =
    useState<SalesOrder | null>(null);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [ordersData, customersData] =
        await Promise.all([
          apiFetch("/sales-orders"),
          apiFetch("/customers"),
        ]);

      setOrders(ordersData);
      setCustomers(customersData);
    } catch (error) {
      console.error(
        "Failed to fetch sales order data:",
        error,
      );

      setErrorMessage(
        "Failed to load sales orders.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const convertDateToBackendFormat = (
    date: string,
  ) => {
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

  const convertDateToDisplayFormat = (
    date: string,
  ) => {
    if (!date) {
      return "";
    }

    const cleanDate = date.slice(0, 10);
    const parts = cleanDate.split("-");

    if (parts.length !== 3) {
      return date;
    }

    const [year, month, day] = parts;

    return `${month}/${day}/${year}`;
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (
      !/^\d{2}\/\d{2}\/\d{4}$/.test(
        form.orderDate,
      )
    ) {
      setErrorMessage(
        "Please enter the date in MM/DD/YYYY format.",
      );
      return;
    }

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const endpoint = editingOrder
        ? `/sales-orders/${editingOrder.id}`
        : "/sales-orders";

      const method = editingOrder
        ? "PATCH"
        : "POST";

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify({
          orderNumber: form.orderNumber,
          customerId: Number(form.customerId),
          orderDate:
            convertDateToBackendFormat(
              form.orderDate,
            ),
          status: form.status,
          totalAmount: Number(
            form.totalAmount,
          ),
        }),
      });

      setForm(emptyForm);
      setEditingOrder(null);

      setMessage(
        editingOrder
          ? "Sales order updated successfully."
          : "Sales order created successfully.",
      );

      await fetchData();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Failed to save sales order.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (
    order: SalesOrder,
  ) => {
    setEditingOrder(order);

    setForm({
      orderNumber: order.orderNumber,
      customerId: String(
        order.customerId,
      ),
      orderDate:
        convertDateToDisplayFormat(
          order.orderDate,
        ),
      status: order.status,
      totalAmount: String(
        order.totalAmount,
      ),
    });

    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (
    id: number,
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sales order?",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setMessage("");
    setErrorMessage("");

    try {
      await apiFetch(
        `/sales-orders/${id}`,
        {
          method: "DELETE",
        },
      );

      setMessage(
        "Sales order deleted successfully.",
      );

      await fetchData();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Failed to delete sales order.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingOrder(null);
    setForm(emptyForm);
    setMessage("");
    setErrorMessage("");
  };

  const getCustomerName = (
    customerId: number,
  ) => {
    return (
      customers.find(
        (customer) =>
          customer.id === customerId,
      )?.name ||
      `Customer #${customerId}`
    );
  };

  const filteredOrders = orders.filter(
    (order) => {
      const searchText =
        search.toLowerCase();

      return (
        order.orderNumber
          ?.toLowerCase()
          .includes(searchText) ||
        order.status
          ?.toLowerCase()
          .includes(searchText) ||
        getCustomerName(
          order.customerId,
        )
          .toLowerCase()
          .includes(searchText)
      );
    },
  );

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "Pending",
  ).length;

  const completedOrders = orders.filter(
    (order) =>
      order.status === "Delivered",
  ).length;

  const totalSales = orders.reduce(
    (total, order) =>
      total +
      Number(order.totalAmount || 0),
    0,
  );

  const averageOrderValue =
    totalOrders > 0
      ? totalSales / totalOrders
      : 0;

  const getStatusClasses = (
    status: string,
  ) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700";

      case "Shipped":
        return "bg-blue-50 text-blue-700";

      case "Processing":
        return "bg-violet-50 text-violet-700";

      case "Cancelled":
        return "bg-red-50 text-red-700";

      case "Pending":
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  return (
    <ProtectedPage permission="orders">
      <main className="ml-64 min-h-screen bg-slate-50 p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-600">
                SO
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Sales Orders
                </h1>

                <p className="mt-1 text-slate-500">
                  Manage customer orders, order status, and sales totals.
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
              onClick={() =>
                setMessage("")
              }
              className="text-emerald-600 hover:text-emerald-900"
            >
              ×
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            <span>
              {errorMessage}
            </span>

            <button
              type="button"
              onClick={() =>
                setErrorMessage("")
              }
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
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalOrders}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              All sales orders
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Pending Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-600">
              {pendingOrders}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Awaiting processing
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Sales
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              ${totalSales.toFixed(2)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Combined order value
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Delivered
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {completedOrders}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Average ${averageOrderValue.toFixed(2)} / order
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="mb-8 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {editingOrder
                  ? "Edit Sales Order"
                  : "Add Sales Order"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editingOrder
                  ? "Update the selected customer order."
                  : "Create a new customer sales order."}
              </p>
            </div>

            {editingOrder && (
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                Editing #{editingOrder.id}
              </span>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {/* Order Number */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Order Number
              </label>

              <input
                type="text"
                placeholder="e.g. SO-0001"
                value={form.orderNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    orderNumber:
                      e.target.value,
                  })
                }
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Customer */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Customer
              </label>

              <select
                value={form.customerId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    customerId:
                      e.target.value,
                  })
                }
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select customer
                </option>

                {customers.map(
                  (customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Order Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Order Date
              </label>

              <input
                type="text"
                placeholder="MM/DD/YYYY"
                value={form.orderDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    orderDate:
                      e.target.value,
                  })
                }
                required
                maxLength={10}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Use MM/DD/YYYY
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Pending">
                  Pending
                </option>

                <option value="Processing">
                  Processing
                </option>

                <option value="Shipped">
                  Shipped
                </option>

                <option value="Delivered">
                  Delivered
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>
              </select>
            </div>

            {/* Total Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Total Amount
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  $
                </span>

                <input
                  type="number"
                  placeholder="0.00"
                  value={form.totalAmount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      totalAmount:
                        e.target.value,
                    })
                  }
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-8 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 md:items-end">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
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
                placeholder="Search by order number, customer, or status..."
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
                {filteredOrders.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {totalOrders}
              </span>{" "}
              orders
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="rounded-xl border border-slate-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-sm text-slate-500">
              Loading sales orders...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">
              SO
            </div>

            <h3 className="font-semibold text-slate-900">
              No sales orders found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {search
                ? "Try changing your search."
                : "Add your first sales order to get started."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="mt-4 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
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
                  Sales Order List
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Customer orders and current fulfillment status
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Order
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Order Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
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
                  {filteredOrders.map(
                    (order) => (
                      <tr
                        key={order.id}
                        className="border-t border-slate-100 transition hover:bg-slate-50"
                      >
                        {/* Order */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-600">
                              SO
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {order.orderNumber}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                ID: {order.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">
                              {getCustomerName(
                                order.customerId,
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {getCustomerName(
                                  order.customerId,
                                )}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Customer ID:{" "}
                                {order.customerId}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {order.orderDate
                            ? convertDateToDisplayFormat(
                                order.orderDate,
                              )
                            : "—"}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900">
                            $
                            {Number(
                              order.totalAmount,
                            ).toFixed(2)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  order,
                                )
                              }
                              className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  order.id,
                                )
                              }
                              disabled={
                                deletingId ===
                                order.id
                              }
                              className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId ===
                              order.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </ProtectedPage>
  );
}

