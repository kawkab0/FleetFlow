"use client";

import { useEffect, useState } from "react";

interface Expense {
  id: number;
  expenseCode: string;
  vehicleCode: string;
  driverCode: string;
  expenseDate: string;
  category: string;
  description: string;
  amount: string | number;
  vendor: string;
  paymentMethod: string;
  status: string;
  notes: string | null;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    expenseCode: "",
    vehicleCode: "",
    driverCode: "",
    expenseDate: "",
    category: "Fuel",
    description: "",
    amount: "",
    vendor: "",
    paymentMethod: "Cash",
    status: "Paid",
    notes: "",
  });

  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/expenses",
      );

      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }

      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreateExpense = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.expenseDate)) {
      alert("Please enter the date in YYYY-MM-DD format.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3001/expenses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            expenseCode: form.expenseCode,
            vehicleCode: form.vehicleCode,
            driverCode: form.driverCode,
            expenseDate: form.expenseDate,
            category: form.category,
            description: form.description,
            amount: Number(form.amount),
            vendor: form.vendor,
            paymentMethod: form.paymentMethod,
            status: form.status,
            notes: form.notes || null,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create expense");
      }

      setForm({
        expenseCode: "",
        vehicleCode: "",
        driverCode: "",
        expenseDate: "",
        category: "Fuel",
        description: "",
        amount: "",
        vendor: "",
        paymentMethod: "Cash",
        status: "Paid",
        notes: "",
      });

      setShowForm(false);

      await fetchExpenses();
    } catch (error) {
      console.error("Error creating expense:", error);
      alert("Failed to create expense.");
    }
  };

  const formatDate = (date: string) => {
    if (!date) {
      return "";
    }

    return date.substring(0, 10);
  };

  const totalAmount = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );

  const paidCount = expenses.filter(
    (expense) => expense.status === "Paid",
  ).length;

  const pendingCount = expenses.filter(
    (expense) => expense.status === "Pending",
  ).length;

  const approvedCount = expenses.filter(
    (expense) => expense.status === "Approved",
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              EXPENSE MANAGEMENT
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Expenses
            </h1>

            <p className="mt-2 text-slate-500">
              Track and manage fleet operating expenses.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Add Expense"}
          </button>
        </div>

        {/* ADD EXPENSE FORM */}
        {showForm && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">
              Add Expense
            </h2>

            <form
              onSubmit={handleCreateExpense}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {/* EXPENSE CODE */}
              <input
                type="text"
                placeholder="Expense Code"
                value={form.expenseCode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    expenseCode: e.target.value,
                  })
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* VEHICLE CODE */}
              <input
                type="text"
                placeholder="Vehicle Code"
                value={form.vehicleCode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vehicleCode: e.target.value,
                  })
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* DRIVER CODE */}
              <input
                type="text"
                placeholder="Driver Code"
                value={form.driverCode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    driverCode: e.target.value,
                  })
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* DATE */}
              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={form.expenseDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    expenseDate: e.target.value,
                  })
                }
                pattern="\d{4}-\d{2}-\d{2}"
                maxLength={10}
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* CATEGORY */}
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="Fuel">Fuel</option>
                <option value="Toll">Toll</option>
                <option value="Parking">Parking</option>
                <option value="Repair">Repair</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Insurance">Insurance</option>
                <option value="License">License</option>
                <option value="Parts">Parts</option>
                <option value="Other">Other</option>
              </select>

              {/* DESCRIPTION */}
              <input
                type="text"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 sm:col-span-2"
              />

              {/* AMOUNT */}
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
                min="0"
                step="0.01"
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* VENDOR */}
              <input
                type="text"
                placeholder="Vendor"
                value={form.vendor}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vendor: e.target.value,
                  })
                }
                required
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* PAYMENT METHOD */}
              <select
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paymentMethod: e.target.value,
                  })
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Mobile Money">Mobile Money</option>
              </select>

              {/* STATUS */}
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
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>

              {/* NOTES */}
              <input
                type="text"
                placeholder="Notes"
                value={form.notes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes: e.target.value,
                  })
                }
                className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 sm:col-span-2"
              />

              {/* SAVE */}
              <div className="sm:col-span-2 lg:col-span-4">
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STATISTICS */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Expenses
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {expenses.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Amount
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              {totalAmount.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Paid
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-600">
              {paidCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending
            </p>

            <p className="mt-1 text-2xl font-bold text-orange-600">
              {pendingCount}
            </p>

            {approvedCount > 0 && (
              <p className="mt-1 text-xs text-slate-400">
                {approvedCount} approved
              </p>
            )}
          </div>

        </div>

        {/* EXPENSE REGISTRY */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Expense Registry
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              All fleet expense records
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Expense ID</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Driver</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Loading expenses...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No expenses found.
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {expense.expenseCode}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {expense.vehicleCode}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {expense.driverCode}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(expense.expenseDate)}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {expense.category}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {expense.description}
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-900">
                        {Number(expense.amount).toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 2,
                          },
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {expense.vendor}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {expense.paymentMethod}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            expense.status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : expense.status === "Approved"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {expense.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>

        </div>

      </div>
    </main>
  );
}
