"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedPage from "@/app/components/ProtectedPage";

interface Payment {
  id: number;
  salesOrderId: number;
  amount: number | string;
  paymentDate: string;
  status: string;
  paymentMethod: string;
  referenceNumber: string;
  notes: string;
}

interface SalesOrder {
  id: number;
  orderNumber: string;
}

interface PaymentForm {
  salesOrderId: string;
  amount: string;
  paymentDate: string;
  status: string;
  paymentMethod: string;
  referenceNumber: string;
  notes: string;
}

const emptyForm: PaymentForm = {
  salesOrderId: "",
  amount: "",
  paymentDate: "",
  status: "Completed",
  paymentMethod: "Cash",
  referenceNumber: "",
  notes: "",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<PaymentForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingPayment, setEditingPayment] =
    useState<Payment | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);

      const [paymentsData, salesOrdersData] =
        await Promise.all([
          apiFetch("/payments"),
          apiFetch("/sales-orders"),
        ]);

      setPayments(paymentsData);
      setSalesOrders(salesOrdersData);
    } catch (error) {
      console.error(
        "Failed to fetch payment data:",
        error,
      );

      setErrorMessage("Failed to load payment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getOrderNumber = (salesOrderId: number) => {
    return (
      salesOrders.find(
        (order) => order.id === salesOrderId,
      )?.orderNumber ||
      `Order #${salesOrderId}`
    );
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const endpoint = editingPayment
        ? `/payments/${editingPayment.id}`
        : "/payments";

      const method = editingPayment ? "PATCH" : "POST";

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify({
          salesOrderId: Number(form.salesOrderId),
          amount: Number(form.amount),
          paymentDate: form.paymentDate,
          status: form.status,
          paymentMethod: form.paymentMethod,
          referenceNumber: form.referenceNumber,
          notes: form.notes,
        }),
      });

      setForm(emptyForm);
      setEditingPayment(null);

      setMessage(
        editingPayment
          ? "Payment updated successfully."
          : "Payment added successfully.",
      );

      await fetchData();
    } catch (error) {
      console.error(error);

      setErrorMessage("Failed to save payment.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);

    setForm({
      salesOrderId: String(payment.salesOrderId),
      amount: String(payment.amount),
      paymentDate: payment.paymentDate,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber,
      notes: payment.notes || "",
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
      "Are you sure you want to delete this payment?",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setMessage("");
    setErrorMessage("");

    try {
      await apiFetch(`/payments/${id}`, {
        method: "DELETE",
      });

      setMessage(
        "Payment deleted successfully.",
      );

      await fetchData();
    } catch (error) {
      console.error(error);

      setErrorMessage("Failed to delete payment.");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingPayment(null);
    setForm(emptyForm);
    setMessage("");
    setErrorMessage("");
  };

  const filteredPayments = payments.filter((payment) => {
    const searchText = search.toLowerCase();

    return (
      getOrderNumber(payment.salesOrderId)
        .toLowerCase()
        .includes(searchText) ||
      payment.referenceNumber
        .toLowerCase()
        .includes(searchText) ||
      payment.status
        .toLowerCase()
        .includes(searchText) ||
      payment.paymentMethod
        .toLowerCase()
        .includes(searchText)
    );
  });

  const totalPayments = payments.length;

  const totalAmount = payments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0,
  );

  const completedPayments = payments.filter(
    (payment) =>
      payment.status.toLowerCase() === "completed",
  ).length;

  const pendingPayments = payments.filter(
    (payment) =>
      payment.status.toLowerCase() === "pending",
  ).length;

  return (
    <ProtectedPage permission="payments">
      <main className="ml-64 min-h-screen bg-slate-50 p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-600">
                $
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Payments
                </h1>

                <p className="mt-1 text-slate-500">
                  Manage customer payments and transaction records.
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
              Total Payments
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalPayments}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              All payment records
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Amount
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              ${totalAmount.toFixed(2)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Recorded transaction value
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {completedPayments}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Successfully completed
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-500">
              {pendingPayments}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Awaiting completion
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="mb-8 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {editingPayment
                  ? "Edit Payment"
                  : "Add Payment"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editingPayment
                  ? "Update the selected payment record."
                  : "Record a new customer payment."}
              </p>
            </div>

            {editingPayment && (
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                Editing #{editingPayment.id}
              </span>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {/* Sales Order */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sales Order
              </label>

              <select
                value={form.salesOrderId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    salesOrderId: e.target.value,
                  })
                }
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select sales order
                </option>

                {salesOrders.map((order) => (
                  <option
                    key={order.id}
                    value={order.id}
                  >
                    {order.orderNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Amount
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  $
                </span>

                <input
                  type="number"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      amount: e.target.value,
                    })
                  }
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-8 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Payment Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Payment Date
              </label>

              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={form.paymentDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paymentDate: e.target.value,
                  })
                }
                required
                pattern="\d{4}-\d{2}-\d{2}"
                title="Please enter the date in YYYY-MM-DD format"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-left outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
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
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Completed">
                  Completed
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Failed">
                  Failed
                </option>

                <option value="Refunded">
                  Refunded
                </option>
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Payment Method
              </label>

              <select
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paymentMethod: e.target.value,
                  })
                }
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Cash">
                  Cash
                </option>

                <option value="Bank Transfer">
                  Bank Transfer
                </option>

                <option value="Credit Card">
                  Credit Card
                </option>

                <option value="Debit Card">
                  Debit Card
                </option>

                <option value="Mobile Money">
                  Mobile Money
                </option>
              </select>
            </div>

            {/* Reference */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Reference Number
              </label>

              <input
                type="text"
                placeholder="PAY-0001"
                value={form.referenceNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    referenceNumber: e.target.value,
                  })
                }
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Notes
              </label>

              <textarea
                placeholder="Add payment notes..."
                value={form.notes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes: e.target.value,
                  })
                }
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Buttons */}
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingPayment
                  ? "Update Payment"
                  : "Add Payment"}
            </button>

            {editingPayment && (
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
                placeholder="Search by order, reference, status, or payment method..."
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
                {filteredPayments.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {totalPayments}
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
              Loading payments...
            </p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-xl font-bold text-emerald-600">
              $
            </div>

            <h3 className="font-semibold text-slate-900">
              No payments found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {search
                ? "Try changing your search."
                : "Add your first payment to get started."}
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
                  Payment Transactions
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Customer payment records
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Reference
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Sales Order
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Method
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map((payment) => {
                    const status =
                      payment.status.toLowerCase();

                    const statusClass =
                      status === "completed"
                        ? "bg-emerald-50 text-emerald-600"
                        : status === "pending"
                          ? "bg-amber-50 text-amber-600"
                          : status === "refunded"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-red-50 text-red-600";

                    return (
                      <tr
                        key={payment.id}
                        className="border-t border-slate-100 transition hover:bg-slate-50"
                      >
                        {/* Reference */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-600">
                              $
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {payment.referenceNumber}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                ID: {payment.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Sales Order */}
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">
                            {getOrderNumber(
                              payment.salesOrderId,
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            ID: {payment.salesOrderId}
                          </p>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900">
                            $
                            {Number(
                              payment.amount,
                            ).toFixed(2)}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {payment.paymentDate}
                        </td>

                        {/* Method */}
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {payment.paymentMethod}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
                          >
                            {payment.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(payment)
                              }
                              className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(payment.id)
                              }
                              disabled={
                                deletingId ===
                                payment.id
                              }
                              className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId ===
                              payment.id
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
    </ProtectedPage>
  );
}
