"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

interface AuditLog {
  id: number;
  userId: number | null;
  userName: string | null;
  userRole: string | null;
  action: string;
  module: string;
  recordId: number | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  description: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");

  useEffect(() => {
    loadAuditLogs();
  }, []);

  async function loadAuditLogs() {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/audit-logs");

      setLogs(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }

  const modules = useMemo(() => {
    return ["All", ...Array.from(new Set(logs.map((log) => log.module)))];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const query = search.toLowerCase().trim();

    return logs.filter((log) => {
      const matchesSearch =
        !query ||
        log.userName?.toLowerCase().includes(query) ||
        log.module.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.description?.toLowerCase().includes(query) ||
        String(log.recordId ?? "").includes(query);

      const matchesModule =
        moduleFilter === "All" || log.module === moduleFilter;

      const matchesAction =
        actionFilter === "All" || log.action === actionFilter;

      return matchesSearch && matchesModule && matchesAction;
    });
  }, [logs, search, moduleFilter, actionFilter]);

  function formatDate(date: string) {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date.substring(0, 10);
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    const hours = String(parsed.getHours()).padStart(2, "0");
    const minutes = String(parsed.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  function getActionClass(action: string) {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-700";
      case "UPDATE":
        return "bg-blue-100 text-blue-700";
      case "DELETE":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Audit Logs
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Track system activity and changes across FleetFlow.
          </p>
        </div>

        <button
          onClick={loadAuditLogs}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Logs</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {logs.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Creates</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {logs.filter((log) => log.action === "CREATE").length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Updates</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {logs.filter((log) => log.action === "UPDATE").length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Deletes</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {logs.filter((log) => log.action === "DELETE").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, module, action..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Module
            </label>

            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
            >
              {modules.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Action
            </label>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
            >
              <option value="All">All</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading audit logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No audit logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-3 font-semibold text-gray-700">
                    Action
                  </th>

                  <th className="px-5 py-3 font-semibold text-gray-700">
                    Module
                  </th>

                  <th className="px-5 py-3 font-semibold text-gray-700">
                    User
                  </th>

                  <th className="px-5 py-3 font-semibold text-gray-700">
                    Record
                  </th>

                  <th className="px-5 py-3 font-semibold text-gray-700">
                    Description
                  </th>

                  <th className="px-5 py-3 font-semibold text-gray-700">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getActionClass(
                          log.action,
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">
                      {log.module}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">
                        {log.userName || "Unknown"}
                      </div>

                      {log.userRole && (
                        <div className="text-xs text-gray-500">
                          {log.userRole}
                        </div>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {log.recordId ?? "—"}
                    </td>

                    <td className="max-w-xs px-5 py-4 text-gray-600">
                      {log.description || "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500">
          Showing {filteredLogs.length} of {logs.length} logs
        </p>
      )}
    </div>
  );
}
