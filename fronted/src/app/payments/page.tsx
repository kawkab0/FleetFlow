"use client";

import { useEffect, useState } from "react";

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

  const fetchData = async () => {
    try {
      const [
        paymentsResponse,
        salesOrdersResponse,
      ] = await Promise.all([
        fetch("http://localhost:3001/payments"),
        fetch("http://localhost:3001/sales-orders"),
      ]);

      if (
        !paymentsResponse.ok ||
        !salesOrdersResponse.ok
      ) {
        throw new Error("Failed to fetch payment data");
      }

      const [
        paymentsData,
        salesOrdersData,
      ] = await Promise.all([
        paymentsResponse.json(),
        salesOrdersResponse.json(),
      ]);

      setPayments(paymentsData);
      setSalesOrders(salesOrdersData);
    } catch (error) {
      console.error(
        "Failed to fetch payment data:",
        error
      );
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
        (order) => order.id === salesOrderId
      )?.orderNumber ||
      `Order #${salesOrderId}`
    );
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();
    setSaving(true);

    try {
      const url = editingPayment
        ? `http://localhost:3001/payments/${editingPayment.id}`
        : "http://localhost:3001/payments";

      const method = editingPayment ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
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

      if (!response.ok) {
        throw new Error("Failed to save payment");
      }

      setForm(emptyForm);
      setEditingPayment(null);

      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to save payment.");
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(
        `http://localhost:3001/payments/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete payment");
      }

      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete payment.");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingPayment(null);
    setForm(emptyForm);
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
    0
  );

  const completedPayments = payments.filter(
    (payment) =>
      payment.status.toLowerCase() === "completed"
  ).length;

  return (
    <main className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Payments
        </h1>

        <p className="mt-2 text-slate-500">
          Manage customer payments and payment records.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Payments
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalPayments}
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
            Completed Payments
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {completedPayments}
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingPayment
              ? "Edit Payment"
              : "Add Payment"}
          </h2>

          {editingPayment && (
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
            value={form.salesOrderId}
            onChange={(e) =>
              setForm({
                ...form,
                salesOrderId: e.target.value,
              })
            }
            required
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
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

          <input
            type="number"
            placeholder="Amount"
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
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

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
            className="rounded-lg border border-slate-300 px-4 py-3 text-left outline-none focus:border-blue-500"
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

          <select
            value={form.paymentMethod}
            onChange={(e) =>
              setForm({
                ...form,
                paymentMethod: e.target.value,
              })
            }
            required
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
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
              : editingPayment
                ? "Update Payment"
                : "Add Payment"}
          </button>

          {editingPayment && (
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
          placeholder="Search by order, reference, status, or payment method..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">
          Loading payments...
        </p>
      ) : filteredPayments.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">
            No payments found.
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
                    Sales Order
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Payment Method
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
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {payment.referenceNumber}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID: {payment.id}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {getOrderNumber(
                          payment.salesOrderId
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID: {payment.salesOrderId}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      $
                      {Number(
                        payment.amount
                      ).toFixed(2)}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {payment.paymentDate}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {payment.paymentMethod}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          payment.status.toLowerCase() ===
                          "completed"
                            ? "bg-emerald-50 text-emerald-600"
                            : payment.status.toLowerCase() ===
                              "pending"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(payment)
                          }
                          className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(payment.id)
                          }
                          disabled={
                            deletingId === payment.id
                          }
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          {deletingId === payment.id
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
