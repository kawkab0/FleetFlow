"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/sidebar";
import { apiFetch } from "@/lib/api";

type NotificationPriority =
  | "critical"
  | "high"
  | "medium"
  | "low";

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: NotificationPriority | string;
  isRead: boolean;
  link?: string | null;
  userId?: number | null;
  sourceKey?: string | null;
  createdAt: string;
};

type Filter =
  | "all"
  | "unread"
  | "critical"
  | "high"
  | "medium"
  | "low";

function priorityWeight(priority: string) {
  switch (priority?.toLowerCase()) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    default:
      return 2;
  }
}

function priorityClasses(priority: string) {
  switch (priority?.toLowerCase()) {
    case "critical":
      return {
        badge:
          "bg-red-100 text-red-700 ring-1 ring-inset ring-red-200",
        border:
          "border-red-200 bg-red-50/40",
        icon:
          "bg-red-100 text-red-600",
        dot: "bg-red-500",
      };

    case "high":
      return {
        badge:
          "bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-200",
        border:
          "border-orange-200 bg-orange-50/40",
        icon:
          "bg-orange-100 text-orange-600",
        dot: "bg-orange-500",
      };

    case "low":
      return {
        badge:
          "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
        border:
          "border-slate-200 bg-white",
        icon:
          "bg-slate-100 text-slate-500",
        dot: "bg-slate-400",
      };

    default:
      return {
        badge:
          "bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200",
        border:
          "border-blue-100 bg-blue-50/30",
        icon:
          "bg-blue-100 text-blue-600",
        dot: "bg-blue-500",
      };
  }
}

function formatAge(value: string) {
  const created = new Date(value).getTime();

  if (!Number.isFinite(created)) {
    return "Unknown time";
  }

  const seconds = Math.max(
    0,
    Math.floor(
      (Date.now() - created) /
        1000,
    ),
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(
    seconds / 60,
  );

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days < 7) {
    return `${days} day${
      days === 1 ? "" : "s"
    } ago`;
  }

  return new Date(value).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
}

export default function NotificationsPage() {
  const router = useRouter();

  const [
    notifications,
    setNotifications,
  ] = useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState<number | "all" | null>(
      null,
    );

  const [error, setError] =
    useState("");

  const [filter, setFilter] =
    useState<Filter>("all");

  const loadNotifications =
    useCallback(
      async (manual = false) => {
        if (manual) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        try {
          setError("");

          const data =
            await apiFetch(
              "/notifications",
            );

          const items =
            Array.isArray(data)
              ? data
              : [];

          const sorted =
            [...items].sort(
              (a, b) => {
                const priorityDifference =
                  priorityWeight(
                    b.priority,
                  ) -
                  priorityWeight(
                    a.priority,
                  );

                if (
                  priorityDifference !==
                  0
                ) {
                  return priorityDifference;
                }

                return (
                  new Date(
                    b.createdAt,
                  ).getTime() -
                  new Date(
                    a.createdAt,
                  ).getTime()
                );
              },
            );

          setNotifications(sorted);
        } catch (err) {
          console.error(
            "Failed to load notification center:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load notifications.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useEffect(() => {
    loadNotifications();

    const interval =
      window.setInterval(() => {
        loadNotifications();
      }, 30000);

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [loadNotifications]);

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          (item) =>
            !item.isRead,
        ).length,
      [notifications],
    );

  const criticalCount =
    useMemo(
      () =>
        notifications.filter(
          (item) =>
            item.priority?.toLowerCase() ===
            "critical",
        ).length,
      [notifications],
    );

  const highCount =
    useMemo(
      () =>
        notifications.filter(
          (item) =>
            item.priority?.toLowerCase() ===
            "high",
        ).length,
      [notifications],
    );

  const mediumCount =
    useMemo(
      () =>
        notifications.filter(
          (item) =>
            item.priority?.toLowerCase() ===
            "medium",
        ).length,
      [notifications],
    );

  const filteredNotifications =
    useMemo(() => {
      switch (filter) {
        case "unread":
          return notifications.filter(
            (item) =>
              !item.isRead,
          );

        case "critical":
          return notifications.filter(
            (item) =>
              item.priority?.toLowerCase() ===
              "critical",
          );

        case "high":
          return notifications.filter(
            (item) =>
              item.priority?.toLowerCase() ===
              "high",
          );

        case "medium":
          return notifications.filter(
            (item) =>
              item.priority?.toLowerCase() ===
              "medium",
          );

        case "low":
          return notifications.filter(
            (item) =>
              item.priority?.toLowerCase() ===
              "low",
          );

        default:
          return notifications;
      }
    }, [
      filter,
      notifications,
    ]);

  async function markAsRead(
    notification: Notification,
  ) {
    if (actionLoading !== null) {
      return;
    }

    try {
      setActionLoading(
        notification.id,
      );

      await apiFetch(
        `/notifications/${notification.id}/read`,
        {
          method: "PATCH",
        },
      );

      setNotifications(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              notification.id
                ? {
                    ...item,
                    isRead: true,
                  }
                : item,
          ),
      );

      if (notification.link) {
        router.push(
          notification.link,
        );
      }
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update notification.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function markAllAsRead() {
    if (
      unreadCount === 0 ||
      actionLoading !== null
    ) {
      return;
    }

    try {
      setActionLoading("all");

      await apiFetch(
        "/notifications/read-all",
        {
          method: "PATCH",
        },
      );

      setNotifications(
        (current) =>
          current.map(
            (item) => ({
              ...item,
              isRead: true,
            }),
          ),
      );
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update notifications.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                  FleetFlow Operations
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Notification Center
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  Monitor operational exceptions,
                  financial attention points,
                  fleet risks, and other
                  actions requiring management
                  attention.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  loadNotifications(true)
                }
                disabled={
                  refreshing ||
                  loading
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h5M20 20v-5h-5M19.07 9A8 8 0 0 0 5.64 5.64L4 9m16 6-1.64 3.36A8 8 0 0 1 4.93 15"
                  />
                </svg>

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              {
                label: "Total",
                value:
                  notifications.length,
                icon: "◉",
                color:
                  "text-slate-900",
                bg:
                  "bg-slate-100",
              },
              {
                label: "Unread",
                value: unreadCount,
                icon: "●",
                color:
                  "text-blue-600",
                bg:
                  "bg-blue-50",
              },
              {
                label: "Critical",
                value:
                  criticalCount,
                icon: "!",
                color:
                  "text-red-600",
                bg:
                  "bg-red-50",
              },
              {
                label: "High",
                value:
                  highCount,
                icon: "▲",
                color:
                  "text-orange-600",
                bg:
                  "bg-orange-50",
              },
              {
                label: "Medium",
                value:
                  mediumCount,
                icon: "•",
                color:
                  "text-blue-600",
                bg:
                  "bg-blue-50",
              },
            ].map(
              (item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        {item.label}
                      </p>

                      <p
                        className={`mt-2 text-3xl font-bold ${item.color}`}
                      >
                        {loading
                          ? "..."
                          : item.value}
                      </p>
                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${item.bg} ${item.color}`}
                    >
                      {item.icon}
                    </div>
                  </div>
                </div>
              ),
            )}
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-bold text-slate-900">
                  Operational alerts
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Prioritized automatically by
                  operational severity.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    ["all", "All"],
                    ["unread", "Unread"],
                    ["critical", "Critical"],
                    ["high", "High"],
                    ["medium", "Medium"],
                    ["low", "Low"],
                  ] as [
                    Filter,
                    string,
                  ][]
                ).map(
                  ([
                    value,
                    label,
                  ]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFilter(
                          value,
                        )
                      }
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        filter ===
                        value
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {label}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={
                    unreadCount ===
                      0 ||
                    actionLoading !==
                      null
                  }
                  onClick={
                    markAllAsRead
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {actionLoading ===
                  "all"
                    ? "Marking..."
                    : "Mark all read"}
                </button>
              </div>
            </div>
          </section>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
              <p className="text-sm font-semibold text-red-800">
                Notification error
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                {error}
              </p>
            </div>
          )}

          <section className="mt-6">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Loading notifications...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Fetching the latest FleetFlow alerts
                </p>
              </div>
            ) : filteredNotifications.length ===
              0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-7 w-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m5 12 4 4L19 6"
                    />
                  </svg>
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {filter === "all"
                    ? "No notifications"
                    : "No matching notifications"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {filter === "all"
                    ? "FleetFlow currently has no notification records."
                    : "There are no notifications matching the selected filter."}
                </p>

                {filter !== "all" && (
                  <button
                    type="button"
                    onClick={() =>
                      setFilter(
                        "all",
                      )
                    }
                    className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    View all notifications
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map(
                  (notification) => {
                    const styles =
                      priorityClasses(
                        notification.priority,
                      );

                    const isProcessing =
                      actionLoading ===
                      notification.id;

                    return (
                      <div
                        key={
                          notification.id
                        }
                        className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
                          notification.isRead
                            ? "border-slate-200 bg-white"
                            : styles.border
                        }`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
                          >
                            <span
                              className={`h-3 w-3 rounded-full ${styles.dot}`}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3
                                    className={`text-sm font-bold ${
                                      notification.isRead
                                        ? "text-slate-700"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {
                                      notification.title
                                    }
                                  </h3>

                                  {!notification.isRead && (
                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-700">
                                      Unread
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 text-xs font-medium text-slate-400">
                                  {formatAge(
                                    notification.createdAt,
                                  )}
                                </p>
                              </div>

                              <span
                                className={`w-fit rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${styles.badge}`}
                              >
                                {
                                  notification.priority
                                }
                              </span>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-slate-600">
                              {
                                notification.message
                              }
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              {!notification.isRead && (
                                <button
                                  type="button"
                                  disabled={
                                    isProcessing ||
                                    actionLoading !==
                                      null
                                  }
                                  onClick={() =>
                                    markAsRead(
                                      notification,
                                    )
                                  }
                                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isProcessing
                                    ? "Updating..."
                                    : notification.link
                                      ? "Mark read & open"
                                      : "Mark as read"}
                                </button>
                              )}

                              {notification.isRead &&
                                notification.link && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      router.push(
                                        notification.link!,
                                      )
                                    }
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                  >
                                    Open related page →
                                  </button>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Automatic monitoring enabled
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  FleetFlow refreshes operational
                  notifications automatically every
                  30 seconds while this application is
                  open.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push("/")
                }
                className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to dashboard
              </button>
            </div>
          </section>

          <footer className="mt-10 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
            FleetFlow ERP · Notification Center
          </footer>
        </div>
      </main>
    </div>
  );
}
