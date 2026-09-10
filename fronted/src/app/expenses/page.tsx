"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedPage from "@/app/components/ProtectedPage";

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

const initialForm = {
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
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [form, setForm] = useState(initialForm);

  const fetchExpenses = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const data = await apiFetch("/expenses");
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);

      setMessage({
        type: "error",
        text: "Failed to load expense records.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [message]);

  const handleCreateExpense = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.expenseDate)) {
      setMessage({
        type: "error",
        text: "Please enter the date in YYYY-MM-DD format.",
      });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      await apiFetch("/expenses", {
        method: "POST",
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
      });

      setForm(initialForm);
      setShowForm(false);

      await fetchExpenses(false);

      setMessage({
        type: "success",
        text: "Expense created successfully.",
      });
    } catch (error) {
      console.error("Error creating expense:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create expense.";

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    return date.substring(0, 10);
  };

  const formatNumber = (value: string | number) => {
    return Number(value).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
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

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return expenses;

    return expenses.filter((expense) =>
      [
        expense.expenseCode,
        expense.vehicleCode,
        expense.driverCode,
        expense.expenseDate,
        expense.category,
        expense.description,
        expense.amount,
        expense.vendor,
        expense.paymentMethod,
        expense.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [expenses, search]);

  const getStatusClasses = (status: string) => {
    if (status === "Paid") {
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    }

    if (status === "Approved") {
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    }

    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  };

  return (
    <ProtectedPage permission="expenses">
      <main className="ml-64 min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  Expense Management
                </p>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Expenses
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Track and manage fleet operating expenses, payments,
                vendors, and spending activity.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fetchExpenses(false)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h5M20 20v-5h-5M5.5 9A7 7 0 0118 6.5L20 9M19 15a7 7 0 01-12.5 2.5L4 15"
                  />
                </svg>

                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(!showForm);
                  setMessage(null);
                }}
                className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                  showForm
                    ? "bg-slate-700 hover:bg-slate-800"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {showForm ? "Cancel" : "+ Add Expense"}
              </button>
            </div>
          </div>

          {/* MESSAGE */}
          {message && (
            <div
              className={`mb-6 flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    message.type === "success"
                      ? "bg-emerald-100"
                      : "bg-red-100"
                  }`}
                >
                  {message.type === "success" ? "✓" : "!"}
                </span>

                <span className="font-medium">
                  {message.text}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setMessage(null)}
                className="text-current opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </div>
          )}

          {/* ADD EXPENSE FORM */}
          {showForm && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    $
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Add Expense
                    </h2>

                    <p className="mt-0.5 text-sm text-slate-500">
                      Enter the details for a new fleet expense.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleCreateExpense}
                className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4"
              >
                {/* EXPENSE CODE */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Expense Code
                  </label>

                  <input
                    type="text"
                    placeholder="EXP-0001"
                    value={form.expenseCode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        expenseCode: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* VEHICLE CODE */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Vehicle Code
                  </label>

                  <input
                    type="text"
                    placeholder="VH-001"
                    value={form.vehicleCode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        vehicleCode: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* DRIVER CODE */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Driver Code
                  </label>

                  <input
                    type="text"
                    placeholder="DRV-001"
                    value={form.driverCode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        driverCode: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* DATE */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Expense Date
                  </label>

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
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* CATEGORY */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Category
                  </label>

                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                </div>

                {/* DESCRIPTION */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Description
                  </label>

                  <input
                    type="text"
                    placeholder="Describe the expense"
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* AMOUNT */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Amount
                  </label>

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
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* VENDOR */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Vendor
                  </label>

                  <input
                    type="text"
                    placeholder="Vendor name"
                    value={form.vendor}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        vendor: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* PAYMENT METHOD */}
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
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>
                    <option value="Card">Card</option>
                    <option value="Mobile Money">
                      Mobile Money
                    </option>
                  </select>
                </div>

                {/* STATUS */}
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
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>

                {/* NOTES */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Notes
                  </label>

                  <input
                    type="text"
                    placeholder="Optional notes"
                    value={form.notes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notes: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* SAVE */}
                <div className="flex items-end sm:col-span-2 lg:col-span-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}

                    {saving ? "Saving..." : "Save Expense"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* KPI CARDS */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Expenses
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {expenses.length}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    All recorded expenses
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  #
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Amount
                  </p>

                  <p className="mt-2 text-3xl font-bold text-emerald-600">
                    {formatNumber(totalAmount)}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Total recorded spending
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  $
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Paid
                  </p>

                  <p className="mt-2 text-3xl font-bold text-blue-600">
                    {paidCount}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Completed payments
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  ✓
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Pending
                  </p>

                  <p className="mt-2 text-3xl font-bold text-amber-600">
                    {pendingCount}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {approvedCount} approved
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  !
                </div>
              </div>
            </div>

          </div>

          {/* EXPENSE REGISTRY */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Expense Registry
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Showing {filteredExpenses.length} of{" "}
                    {expenses.length} expense record
                    {expenses.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="flex w-full max-w-md items-center gap-2">
                  <div className="relative flex-1">
                    <svg
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path
                        strokeLinecap="round"
                        d="m20 20-4-4"
                      />
                    </svg>

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search expenses..."
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">
                      Expense ID
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Vehicle
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Driver
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Date
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Category
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Description
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Amount
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Vendor
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Payment
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {loading ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-6 py-14 text-center"
                      >
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                          <p className="mt-4 text-sm font-medium text-slate-600">
                            Loading expenses...
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Fetching the latest expense records
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredExpenses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-6 py-14 text-center"
                      >
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-400">
                            $
                          </div>

                          <h3 className="mt-4 font-semibold text-slate-800">
                            {search
                              ? "No matching expenses"
                              : "No expenses found"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {search
                              ? "Try a different search term or clear the search."
                              : "Add your first expense record to get started."}
                          </p>

                          {search ? (
                            <button
                              type="button"
                              onClick={() => setSearch("")}
                              className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Clear Search
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowForm(true)}
                              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                              + Add Expense
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {expense.expenseCode}
                          </div>

                          <div className="mt-0.5 text-xs text-slate-400">
                            #{expense.id}
                          </div>
                        </td>

                        <td className="px-6 py-4 font-medium text-slate-700">
                          {expense.vehicleCode}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {expense.driverCode}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          {formatDate(expense.expenseDate)}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {expense.category}
                          </span>
                        </td>

                        <td className="max-w-[240px] px-6 py-4 text-slate-600">
                          <div
                            className="truncate"
                            title={expense.description}
                          >
                            {expense.description}
                          </div>
                        </td>

                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {formatNumber(expense.amount)}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {expense.vendor}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {expense.paymentMethod}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                              expense.status,
                            )}`}
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
    </ProtectedPage>
  );
}
