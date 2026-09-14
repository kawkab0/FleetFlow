"use client";

import {
  useEffect,
  useState,
} from "react";

import ProtectedPage from "@/components/ProtectedPage";
import { apiFetch } from "@/lib/api";

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
};

function formatAge(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  const seconds = Math.floor(
    (Date.now() - value.getTime()) / 1000,
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(
    seconds / 60,
  );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return value.toLocaleString();
}

function getPriorityClasses(
  priority: string,
) {
  switch (
    priority?.toLowerCase()
  ) {
    case "critical":
      return "border-red-500/30 bg-red-500/10 text-red-300";

    case "high":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";

    case "low":
      return "border-slate-700 bg-slate-800/50 text-slate-400";

    default:
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
  }
}

function getPriorityLabel(
  priority: string,
) {
  switch (
    priority?.toLowerCase()
  ) {
    case "critical":
      return "Critical";

    case "high":
      return "High";

    case "low":
      return "Low";

    default:
      return "Medium";
  }
}

function priorityWeight(
  priority: string,
) {
  switch (
    priority?.toLowerCase()
  ) {
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

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch(
        "/notifications",
      );

      if (Array.isArray(data)) {
        const sorted = [...data].sort(
          (a, b) =>
            priorityWeight(
              b.priority,
            ) -
              priorityWeight(
                a.priority,
              ) ||
            new Date(
              b.createdAt,
            ).getTime() -
              new Date(
                a.createdAt,
              ).getTime(),
        );

        setNotifications(sorted);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load notifications.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(
    id: number,
  ) {
    try {
      await apiFetch(
        `/notifications/${id}/read`,
        {
          method: "PATCH",
        },
      );

      setNotifications((current) =>
        current.map(
          (notification) =>
            notification.id === id
              ? {
                  ...notification,
                  isRead: true,
                }
              : notification,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update notification.",
      );
    }
  }

  async function markAllAsRead() {
    try {
      await apiFetch(
        "/notifications/read-all",
        {
          method: "PATCH",
        },
      );

      setNotifications((current) =>
        current.map(
          (notification) => ({
            ...notification,
            isRead: true,
          }),
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update notifications.",
      );
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead,
    ).length;

  const criticalCount =
    notifications.filter(
      (notification) =>
        !notification.isRead &&
        notification.priority?.toLowerCase() ===
          "critical",
    ).length;

  const highCount =
    notifications.filter(
      (notification) =>
        !notification.isRead &&
        notification.priority?.toLowerCase() ===
          "high",
    ).length;

  return (
    <ProtectedPage permission="dashboard">
      <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                FleetFlow
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Notifications
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                System alerts and operational
                notifications from FleetFlow.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={loadNotifications}
                className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Refresh
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {!loading &&
            notifications.length > 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Unread
                  </p>

                  <p className="mt-2 text-2xl font-bold text-white">
                    {unreadCount}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Active notifications
                  </p>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-400">
                    Critical
                  </p>

                  <p className="mt-2 text-2xl font-bold text-red-300">
                    {criticalCount}
                  </p>

                  <p className="mt-1 text-xs text-red-400/70">
                    Requires immediate attention
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">
                    High Priority
                  </p>

                  <p className="mt-2 text-2xl font-bold text-amber-300">
                    {highCount}
                  </p>

                  <p className="mt-1 text-xs text-amber-400/70">
                    Requires management attention
                  </p>
                </div>
              </div>
            )}

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <h2 className="font-semibold text-white">
                  Notification Center
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {unreadCount} unread notification
                  {unreadCount === 1
                    ? ""
                    : "s"}
                </p>
              </div>
            </div>

            {loading && (
              <div className="px-5 py-16 text-center text-sm text-slate-500">
                Loading notifications...
              </div>
            )}

            {!loading &&
              notifications.length === 0 && (
                <div className="px-5 py-16 text-center">
                  <div className="text-4xl">
                    ✓
                  </div>

                  <h3 className="mt-4 font-semibold text-white">
                    No notifications
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    FleetFlow has no notifications
                    to show right now.
                  </p>
                </div>
              )}

            {!loading &&
              notifications.length > 0 && (
                <div className="divide-y divide-slate-800">
                  {notifications.map(
                    (notification) => (
                      <div
                        key={notification.id}
                        className={`flex flex-col gap-4 px-5 py-5 transition sm:flex-row sm:items-start sm:justify-between ${
                          notification.isRead
                            ? "opacity-60"
                            : "bg-slate-900/40"
                        }`}
                      >
                        <div className="flex gap-4">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${getPriorityClasses(
                              notification.priority,
                            )}`}
                          >
                            !
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-white">
                                {
                                  notification.title
                                }
                              </h3>

                              <span
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getPriorityClasses(
                                  notification.priority,
                                )}`}
                              >
                                {getPriorityLabel(
                                  notification.priority,
                                )}
                              </span>

                              {!notification.isRead && (
                                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-300">
                                  New
                                </span>
                              )}
                            </div>

                            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
                              {
                                notification.message
                              }
                            </p>

                            <p className="mt-2 text-xs text-slate-600">
                              {formatAge(
                                notification.createdAt,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          {notification.link && (
                            <button
                              type="button"
                              onClick={() => {
                                markAsRead(
                                  notification.id,
                                );

                                window.location.href =
                                  notification.link!;
                              }}
                              className="rounded-lg border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                            >
                              Open
                            </button>
                          )}

                          {!notification.isRead && (
                            <button
                              type="button"
                              onClick={() =>
                                markAsRead(
                                  notification.id,
                                )
                              }
                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
          </div>
        </div>
      </main>
    </ProtectedPage>
  );
}
