export default function ExpensesPage() {
  const expenses = [
    {
      id: "EX-1001",
      category: "Fuel",
      vehicle: "FL-001",
      description: "Diesel purchase",
      amount: 156,
      date: "24 Aug 2026",
      status: "Approved",
    },
    {
      id: "EX-1002",
      category: "Maintenance",
      vehicle: "FL-003",
      description: "Brake inspection",
      amount: 320,
      date: "24 Aug 2026",
      status: "Pending",
    },
    {
      id: "EX-1003",
      category: "Fuel",
      vehicle: "FL-004",
      description: "Diesel purchase",
      amount: 182,
      date: "23 Aug 2026",
      status: "Approved",
    },
    {
      id: "EX-1004",
      category: "Insurance",
      vehicle: "FL-006",
      description: "Monthly insurance",
      amount: 540,
      date: "23 Aug 2026",
      status: "Approved",
    },
    {
      id: "EX-1005",
      category: "Maintenance",
      vehicle: "FL-008",
      description: "Engine service",
      amount: 1200,
      date: "22 Aug 2026",
      status: "Pending",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              FINANCE MANAGEMENT
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Expenses
            </h1>

            <p className="mt-2 text-slate-500">
              Track fleet expenses, approvals, and operating costs.
            </p>
          </div>

          <button className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700">
            + Add Expense
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Expenses
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              $42,680
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Fuel
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-600">
              $16,224
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Maintenance
            </p>

            <p className="mt-1 text-2xl font-bold text-orange-600">
              $8,420
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending Approval
            </p>

            <p className="mt-1 text-2xl font-bold text-red-600">
              $3,840
            </p>
          </div>

        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Expense Transactions
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Expense ID</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {expense.id}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {expense.category}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {expense.vehicle}
                    </td>

                    <td className="px-6 py-4 text-slate-700">
                      {expense.description}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-900">
                      ${expense.amount}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {expense.date}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          expense.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))}

              </tbody>

            </table>
          </div>

        </div>

      </div>
    </main>
  );
}
