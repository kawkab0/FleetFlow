"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import GlobalSearch from "@/components/GlobalSearch";
import NotificationBell from "@/components/NotificationBell";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type MenuItem = {
  name: string;
  href: string;
  roles: string[];
  icon: string;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const ALL_ROLES = [
  "Admin",
  "Fleet Manager",
  "Operations",
  "Finance",
  "Viewer",
];

const menuSections: MenuSection[] = [
  {
    title: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/",
        roles: ALL_ROLES,
        icon: "▦",
      },
    ],
  },

  {
    title: "Operations",
    items: [
      {
        name: "Vehicles",
        href: "/vehicles",
        roles: [
          "Admin",
          "Fleet Manager",
          "Operations",
        ],
        icon: "▣",
      },
      {
        name: "Drivers",
        href: "/drivers",
        roles: [
          "Admin",
          "Fleet Manager",
          "Operations",
        ],
        icon: "♙",
      },
      {
        name: "Trips",
        href: "/trips",
        roles: [
          "Admin",
          "Fleet Manager",
          "Operations",
        ],
        icon: "➜",
      },
      {
        name: "Fuel",
        href: "/fuel",
        roles: [
          "Admin",
          "Fleet Manager",
          "Operations",
        ],
        icon: "◈",
      },
      {
        name: "Maintenance",
        href: "/maintenance",
        roles: [
          "Admin",
          "Fleet Manager",
        ],
        icon: "⚙",
      },
      {
        name: "Expenses",
        href: "/expenses",
        roles: [
          "Admin",
          "Finance",
        ],
        icon: "◆",
      },
    ],
  },

  {
    title: "Sales & Procurement",
    items: [
      {
        name: "Customers",
        href: "/customers",
        roles: [
          "Admin",
          "Operations",
        ],
        icon: "♧",
      },
      {
        name: "Products",
        href: "/products",
        roles: [
          "Admin",
          "Operations",
        ],
        icon: "□",
      },
      {
        name: "Suppliers",
        href: "/suppliers",
        roles: [
          "Admin",
          "Operations",
        ],
        icon: "◇",
      },
      {
        name: "Warehouses",
        href: "/warehouses",
        roles: [
          "Admin",
          "Operations",
        ],
        icon: "▤",
      },
      {
        name: "Inventory",
        href: "/inventory",
        roles: [
          "Admin",
          "Operations",
        ],
        icon: "▥",
      },
      {
        name: "Purchases",
        href: "/purchases",
        roles: [
          "Admin",
          "Operations",
          "Finance",
        ],
        icon: "↓",
      },
      {
        name: "Orders",
        href: "/sales-orders",
        roles: [
          "Admin",
          "Operations",
          "Finance",
        ],
        icon: "↑",
      },
      {
        name: "Payments",
        href: "/payments",
        roles: [
          "Admin",
          "Finance",
        ],
        icon: "$",
      },
    ],
  },

  {
    title: "Insights & Intelligence",
    items: [
      {
        name: "Reports",
        href: "/reports",
        roles: ALL_ROLES,
        icon: "▥",
      },
      {
        name: "Analytics",
        href: "/analytics",
        roles: ALL_ROLES,
        icon: "◒",
      },
      {
        name: "Intelligence",
        href: "/intelligence",
        roles: ALL_ROLES,
        icon: "✦",
      },
      {
        name: "Profitability",
        href: "/profitability",
        roles: [
          "Admin",
          "Fleet Manager",
          "Finance",
        ],
        icon: "↗",
      },
      {
        name: "Fuel Intelligence",
        href: "/fuel-intelligence",
        roles: [
          "Admin",
          "Fleet Manager",
          "Operations",
        ],
        icon: "◉",
      },
      {
        name: "Maintenance Intelligence",
        href: "/maintenance-intelligence",
        roles: [
          "Admin",
          "Fleet Manager",
        ],
        icon: "⚡",
      },
      {
        name: "Recommendations",
        href: "/recommendations",
        roles: ALL_ROLES,
        icon: "★",
      },
      {
        name: "Alerts",
        href: "/alerts",
        roles: ALL_ROLES,
        icon: "!",
      },
      {
        name: "Route Intelligence",
        href: "/route-intelligence",
        roles: [
          "Admin",
          "Fleet Manager",
          "Operations",
        ],
        icon: "⌁",
      },
      {
        name: "Driver Intelligence",
        href: "/driver-intelligence",
        roles: [
          "Admin",
          "Fleet Manager",
          "Operations",
        ],
        icon: "♟",
      },
    ],
  },

  {
    title: "Administration",
    items: [
      {
        name: "Users",
        href: "/users",
        roles: ["Admin"],
        icon: "♟",
      },
      {
        name: "Audit Logs",
        href: "/audit-logs",
        roles: ["Admin"],
        icon: "☷",
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  useEffect(() => {
    const storedUser =
      localStorage.getItem(
        "fleetflow_user",
      );

    if (storedUser) {
      try {
        setUser(
          JSON.parse(storedUser),
        );
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [mobileOpen]);

  function handleLogout() {
    localStorage.removeItem(
      "fleetflow_token",
    );

    localStorage.removeItem(
      "fleetflow_user",
    );

    document.cookie =
      "fleetflow_token=; path=/; max-age=0; SameSite=Lax";

    router.push("/login");
  }

  const visibleSections =
    menuSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            user
              ? item.roles.includes(
                  user.role,
                )
              : false,
        ),
      }))
      .filter(
        (section) =>
          section.items.length > 0,
      );

  function isActive(
    href: string,
  ) {
    return href === "/"
      ? pathname === "/"
      : pathname === href ||
          pathname.startsWith(
            `${href}/`,
          );
  }

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="fixed left-0 right-0 top-0 z-[60] flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 shadow-lg md:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-base font-bold shadow-lg shadow-blue-900/30">
            F
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">
              FleetFlow
            </p>

            <p className="truncate text-[10px] text-slate-500">
              Logistics ERP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />

          <button
            type="button"
            aria-label={
              mobileOpen
                ? "Close navigation"
                : "Open navigation"
            }
            aria-expanded={mobileOpen}
            onClick={() =>
              setMobileOpen(
                (current) =>
                  !current,
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-200 transition hover:bg-slate-800"
          >
            {mobileOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l12 12M18 6L6 18"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h16M4 12h16M4 17h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() =>
            setMobileOpen(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-200 ease-out md:z-40 md:w-64 md:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* TOP SECTION */}
        <div className="shrink-0 border-b border-slate-800 px-4 py-5">
          {/* Brand */}
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold shadow-lg shadow-blue-900/30">
                F
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight">
                  FleetFlow
                </h1>

                <p className="text-xs text-slate-500">
                  Logistics ERP
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() =>
                setMobileOpen(false)
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-900 hover:text-white md:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l12 12M18 6L6 18"
                />
              </svg>
            </button>
          </div>

          {/* User profile */}
          {user && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
                {user.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user.name}
                </p>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  <p className="truncate text-xs text-slate-400">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Global Search + Notifications */}
          <div className="relative z-50 mt-4 flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <GlobalSearch />
            </div>

            <div className="hidden md:block">
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-5">
          {visibleSections.map(
            (section) => (
              <div
                key={section.title}
              >
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {section.title}
                </p>

                <div className="space-y-1">
                  {section.items.map(
                    (item) => {
                      const active =
                        isActive(
                          item.href,
                        );

                      return (
                        <Link
                          key={
                            item.href
                          }
                          href={
                            item.href
                          }
                          onClick={() =>
                            setMobileOpen(
                              false,
                            )
                          }
                          className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                            active
                              ? "bg-blue-600 text-white shadow-md shadow-blue-950/30"
                              : "text-slate-400 hover:bg-slate-900 hover:text-white"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm ${
                              active
                                ? "bg-blue-500 text-white"
                                : "bg-slate-900 text-slate-500 group-hover:bg-slate-800 group-hover:text-slate-300"
                            }`}
                          >
                            {
                              item.icon
                            }
                          </span>

                          <span className="truncate">
                            {
                              item.name
                            }
                          </span>

                          {active && (
                            <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                          )}
                        </Link>
                      );
                    },
                  )}
                </div>
              </div>
            ),
          )}
        </nav>

        {/* BOTTOM SECTION */}
        <div className="shrink-0 border-t border-slate-800 p-4">
          <button
            onClick={
              handleLogout
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:border-red-900 hover:bg-red-950/40 hover:text-red-400"
          >
            <span>↪</span>
            Logout
          </button>

          <div className="mt-4 flex items-center justify-between px-1">
            <p className="text-[11px] text-slate-600">
              FleetFlow ERP
            </p>

            <span className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-slate-500">
              v1.0.0
            </span>
          </div>
        </div>
      </aside>

      {/* RESPONSIVE GLOBAL OFFSETS */}
      <style jsx global>{`
        @media (max-width: 767px) {
          .ml-64 {
            margin-left: 0 !important;
          }

          body {
            padding-top: 4rem;
          }
        }

        @media (min-width: 768px) {
          body {
            padding-top: 0;
          }
        }
      `}</style>
    </>
  );
}
