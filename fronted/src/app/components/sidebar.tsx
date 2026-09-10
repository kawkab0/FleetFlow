"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
        roles: ["Admin", "Fleet Manager", "Operations"],
        icon: "▣",
      },
      {
        name: "Drivers",
        href: "/drivers",
        roles: ["Admin", "Fleet Manager", "Operations"],
        icon: "♙",
      },
      {
        name: "Trips",
        href: "/trips",
        roles: ["Admin", "Fleet Manager", "Operations"],
        icon: "➜",
      },
      {
        name: "Fuel",
        href: "/fuel",
        roles: ["Admin", "Fleet Manager", "Operations"],
        icon: "◈",
      },
      {
        name: "Maintenance",
        href: "/maintenance",
        roles: ["Admin", "Fleet Manager"],
        icon: "⚙",
      },
      {
        name: "Expenses",
        href: "/expenses",
        roles: ["Admin", "Finance"],
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
        roles: ["Admin", "Operations"],
        icon: "♧",
      },
      {
        name: "Products",
        href: "/products",
        roles: ["Admin", "Operations"],
        icon: "□",
      },
      {
        name: "Suppliers",
        href: "/suppliers",
        roles: ["Admin", "Operations"],
        icon: "◇",
      },
      {
        name: "Warehouses",
        href: "/warehouses",
        roles: ["Admin", "Operations"],
        icon: "▤",
      },
      {
        name: "Inventory",
        href: "/inventory",
        roles: ["Admin", "Operations"],
        icon: "▥",
      },
      {
        name: "Purchases",
        href: "/purchases",
        roles: ["Admin", "Operations", "Finance"],
        icon: "↓",
      },
      {
        name: "Orders",
        href: "/sales-orders",
        roles: ["Admin", "Operations", "Finance"],
        icon: "↑",
      },
      {
        name: "Payments",
        href: "/payments",
        roles: ["Admin", "Finance"],
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
        roles: ["Admin", "Fleet Manager", "Finance"],
        icon: "↗",
      },
      {
        name: "Fuel Intelligence",
        href: "/fuel-intelligence",
        roles: ["Admin", "Fleet Manager", "Operations"],
        icon: "◉",
      },
      {
        name: "Maintenance Intelligence",
        href: "/maintenance-intelligence",
        roles: ["Admin", "Fleet Manager"],
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
        roles: ["Admin", "Fleet Manager", "Operations"],
        icon: "⌁",
      },
      {
        name: "Driver Intelligence",
        href: "/driver-intelligence",
        roles: ["Admin", "Fleet Manager", "Operations"],
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

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("fleetflow_user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("fleetflow_token");
    localStorage.removeItem("fleetflow_user");

    document.cookie =
      "fleetflow_token=; path=/; max-age=0; SameSite=Lax";

    router.push("/login");
  }

  const visibleSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        user ? item.roles.includes(user.role) : false,
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-slate-950 text-white shadow-xl">
      {/* Brand */}
      <div className="border-b border-slate-800 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold shadow-lg shadow-blue-900/30">
            F
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">
              FleetFlow
            </h1>

            <p className="text-xs text-slate-500">
              Logistics ERP
            </p>
          </div>
        </div>

        {/* User profile */}
        {user && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
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
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {visibleSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
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
                      {item.icon}
                    </span>

                    <span className="truncate">
                      {item.name}
                    </span>

                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-800 p-4">
        <button
          onClick={handleLogout}
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
  );
}
