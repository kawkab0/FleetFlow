"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

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

function getPriorityClasses(priority: string) {
  switch (priority?.toLowerCase()) {
    case "critical":
      return {
        badge:
          "bg-red-100 text-red-700 ring-1 ring-inset ring-red-200",
        dot: "bg-red-500",
        icon: "bg-red-50 text-red-600",
      };

    case "high":
      return {
        badge:
          "bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-200",
        dot: "bg-orange-500",
        icon: "bg-orange-50 text-orange-600",
      };

    case "low":
      return {
        badge:
          "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
        dot: "bg-slate-400",
        icon: "bg-slate-50 text-slate-500",
      };

    default:
      return {
        badge:
          "bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200",
        dot: "bg-blue-500",
        icon: "bg-blue-50 text-blue-600",
      };
  }
}

function formatAge(value: string) {
  const created = new Date(value).getTime();
  const now = Date.now();

  if (!Number.isFinite(created)) {
    return "";
  }

  const seconds = Math.max(
    0,
    Math.floor((now - created) / 1000),
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(value).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    },
  );
}

export default function NotificationBell() {
  const router = useRouter();

  const containerRef =
    useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState<number | "all" | null>(null);

  const [error, setError] = useState("");

  const loadNotifications = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setLoading(true);
      }

      try {
        setError("");

        const [unread, count] =
          await Promise.all([
            apiFetch("/notifications/unread"),
            apiFetch("/notifications/count"),
          ]);

        const unreadItems =
          Array.isArray(unread)
            ? unread
            : [];

        const sorted = [...unreadItems].sort(
          (a, b) => {
            const priorityDifference =
              priorityWeight(b.priority) -
              priorityWeight(a.priority);

            if (priorityDifference !== 0) {
              return priorityDifference;
            }

            return (
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
            );
          },
        );

        setNotifications(
          sorted.slice(0, 8),
        );

        const numericCount = Number(count);

        setUnreadCount(
          Number.isFinite(numericCount)
            ? numericCount
            : sorted.length,
        );
      } catch (err) {
        console.error(
          "Failed to load notifications:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load notifications.",
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    loadNotifications();

    const interval = window.setInterval(
      () => {
        loadNotifications();
      },
      30000,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [loadNotifications]);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  async function markAsRead(
    notification: Notification,
  ) {
    if (actionLoading !== null) {
      return;
    }

    try {
      setActionLoading(notification.id);

      await apiFetch(
        `/notifications/${notification.id}/read`,
        {
          method: "PATCH",
        },
      );

      setNotifications((current) =>
        current.filter(
          (item) =>
            item.id !== notification.id,
        ),
      );

      setUnreadCount((current) =>
        Math.max(0, current - 1),
      );

      if (notification.link) {
        setOpen(false);
        router.push(notification.link);
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
      actionLoading !== null ||
      unreadCount === 0
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

      setNotifications([]);
      setUnreadCount(0);
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

  function openCenter() {
    setOpen(false);
    router.push("/notifications");
  }

  const visibleCritical =
    notifications.filter(
      (item) =>
        item.priority?.toLowerCase() ===
          "critical" ||
        item.priority?.toLowerCase() ===
          "high",
    ).length;

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
    >
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => !current);

          if (!open) {
            loadNotifications();
          }
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9a6 6 0 1 0-12 0v.75a8.967 8.967 0 0 1-2.31 6.022c1.733.64 3.55 1.085 5.453 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-[100] w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900">
                    Notifications
                  </h3>

                  {unreadCount > 0 && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  FleetFlow operational alerts
                </p>
              </div>

              <button
                type="button"
                onClick={openCenter}
                className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
              >
                View all
              </button>
            </div>

            {visibleCritical > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />

                <span className="text-xs font-semibold text-red-700">
                  {visibleCritical} high-priority{" "}
                  {visibleCritical === 1
                    ? "alert"
                    : "alerts"}{" "}
                  need attention
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="max-h-[430px] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length ===
              0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m5 12 4 4L19 6"
                    />
                  </svg>
                </div>

                <h4 className="mt-4 text-sm font-bold text-slate-800">
                  All caught up
                </h4>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  There are no unread operational alerts right now.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map(
                  (notification) => {
                    const priority =
                      getPriorityClasses(
                        notification.priority,
                      );

                    const isProcessing =
                      actionLoading ===
                      notification.id;

                    return (
                      <button
                        type="button"
                        key={notification.id}
                        disabled={isProcessing}
                        onClick={() =>
                          markAsRead(
                            notification,
                          )
                        }
                        className={`group w-full px-4 py-4 text-left transition hover:bg-slate-50 ${
                          isProcessing
                            ? "opacity-60"
                            : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${priority.icon}`}
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${priority.dot}`}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-900">
                                {
                                  notification.title
                                }
                              </p>

                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${priority.badge}`}
                              >
                                {
                                  notification.priority
                                }
                              </span>
                            </div>

                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                              {
                                notification.message
                              }
                            </p>

                            <div className="mt-2 flex items-center justify-between gap-3">
                              <span className="text-[10px] font-medium text-slate-400">
                                {formatAge(
                                  notification.createdAt,
                                )}
                              </span>

                              {notification.link && (
                                <span className="text-[10px] font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">
                                  Open →
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={
                  unreadCount === 0 ||
                  actionLoading !== null
                }
                onClick={markAllAsRead}
                className="text-xs font-semibold text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {actionLoading === "all"
                  ? "Marking..."
                  : "Mark all as read"}
              </button>

              <button
                type="button"
                onClick={openCenter}
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                Open notification center
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
