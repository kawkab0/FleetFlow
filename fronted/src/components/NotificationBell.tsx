"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

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

  return value.toLocaleDateString();
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
      return "CRITICAL";

    case "high":
      return "HIGH";

    case "low":
      return "LOW";

    default:
      return "MEDIUM";
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

export default function NotificationBell() {
  const [open, setOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(false);

  const wrapperRef =
    useRef<HTMLDivElement>(null);

  const unreadCount =
    notifications.length;

  const criticalCount =
    notifications.filter(
      (notification) =>
        notification.priority?.toLowerCase() ===
        "critical",
    ).length;

  function sortNotifications(
    items: Notification[],
  ) {
    return [...items].sort(
      (a, b) =>
        priorityWeight(b.priority) -
          priorityWeight(a.priority) ||
        new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
    );
  }

  async function loadNotifications() {
    try {
      setLoading(true);

      const data = await apiFetch(
        "/notifications/unread",
      );

      if (Array.isArray(data)) {
        setNotifications(
          sortNotifications(data),
        );
      }
    } catch {
      // Global API handling manages errors.
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(
    notification: Notification,
  ) {
    try {
      await apiFetch(
        `/notifications/${notification.id}/read`,
        {
          method: "PATCH",
        },
      );

      setNotifications((current) =>
        current.filter(
          (item) =>
            item.id !==
            notification.id,
        ),
      );

      if (notification.link) {
        window.location.href =
          notification.link;
      }
    } catch {
      // Keep notification visible.
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

      setNotifications([]);
    } catch {
      // Keep notifications visible.
    }
  }

  useEffect(() => {
    loadNotifications();

    const interval =
      window.setInterval(
        loadNotifications,
        30000,
      );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);

          if (!open) {
            loadNotifications();
          }
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
        aria-label="Notifications"
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-slate-950 bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-[100] w-[380px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-white">
                Notifications
              </p>

              <div className="mt-1 flex items-center gap-2">
                <p className="text-xs text-slate-500">
                  {unreadCount} unread
                </p>

                {criticalCount > 0 && (
                  <>
                    <span className="text-slate-700">
                      •
                    </span>

                    <p className="text-xs font-semibold text-red-400">
                      {criticalCount} critical
                    </p>
                  </>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-semibold text-blue-400 transition hover:text-blue-300"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading && (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                Loading notifications...
              </div>
            )}

            {!loading &&
              notifications.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <div className="text-3xl">
                    ✓
                  </div>

                  <p className="mt-3 text-sm font-semibold text-white">
                    You&apos;re all caught up
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    No unread notifications.
                  </p>
                </div>
              )}

            {!loading &&
              notifications.map(
                (notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      markAsRead(
                        notification,
                      )
                    }
                    className="block w-full border-b border-slate-900 px-4 py-4 text-left transition hover:bg-slate-900"
                  >
                    <div className="flex gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${getPriorityClasses(
                          notification.priority,
                        )}`}
                      >
                        !
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-white">
                            {notification.title}
                          </p>

                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wide ${getPriorityClasses(
                              notification.priority,
                            )}`}
                          >
                            {getPriorityLabel(
                              notification.priority,
                            )}
                          </span>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-[10px] text-slate-600">
                          {formatAge(
                            notification.createdAt,
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                ),
              )}
          </div>

          <div className="border-t border-slate-800 p-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                window.location.href =
                  "/notifications";
              }}
              className="w-full rounded-lg border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}