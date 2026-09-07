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
};

const ALL_ROLES = [
  "Admin",
  "Fleet Manager",
  "Operations",
  "Finance",
  "Viewer",
];

const VIEWER_ROLES = ["Admin", "Fleet Manager", "Operations", "Finance", "Viewer"];

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    href: "/",
    roles: ALL_ROLES,
  },

  {
    name: "Vehicles",
    href: "/vehicles",
    roles: ["Admin", "Fleet Manager", "Operations"],
  },
  {
    name: "Drivers",
    href: "/drivers",
    roles: ["Admin", "Fleet Manager", "Operations"],
  },
  {
    name: "Trips",
    href: "/trips",
    roles: ["Admin", "Fleet Manager", "Operations"],
  },
  {
    name: "Fuel",
    href: "/fuel",
    roles: ["Admin", "Fleet Manager", "Operations"],
  },
  {
    name: "Maintenance",
    href: "/maintenance",
    roles: ["Admin", "Fleet Manager"],
  },
  {
    name: "Expenses",
    href: "/expenses",
    roles: ["Admin", "Finance"],
  },

  {
    name: "Customers",
    href: "/customers",
    roles: ["Admin", "Operations"],
  },
  {
    name: "Products",
    href: "/products",
    roles: ["Admin", "Operations"],
  },
  {
    name: "Suppliers",
    href: "/suppliers",
    roles: ["Admin", "Operations"],
  },
  {
    name: "Warehouses",
    href: "/warehouses",
    roles: ["Admin", "Operations"],
  },
  {
    name: "Inventory",
    href: "/inventory",
    roles: ["Admin", "Operations"],
  },
  {
    name: "Purchases",
    href: "/purchases",
    roles: ["Admin", "Operations", "Finance"],
  },
  {
    name: "Orders",
    href: "/sales-orders",
    roles: ["Admin", "Operations", "Finance"],
  },
  {
    name: "Payments",
    href: "/payments",
    roles: ["Admin", "Finance"],
  },

  {
    name: "Reports",
    href: "/reports",
    roles: ALL_ROLES,
  },
  {
    name: "Analytics",
    href: "/analytics",
    roles: ALL_ROLES,
  },
  {
    name: "Intelligence",
    href: "/intelligence",
    roles: ALL_ROLES,
  },
  {
    name: "Profitability",
    href: "/profitability",
    roles: ["Admin", "Fleet Manager", "Finance"],
  },
  {
    name: "Fuel Intelligence",
    href: "/fuel-intelligence",
    roles: ["Admin", "Fleet Manager", "Operations"],
  },
  {
    name: "Maintenance Intelligence",
    href: "/maintenance-intelligence",
    roles: ["Admin", "Fleet Manager"],
  },
  {
    name: "Recommendations",
    href: "/recommendations",
    roles: ALL_ROLES,
  },
  {
    name: "Alerts",
    href: "/alerts",
    roles: ALL_ROLES,
  },
  {
    name: "Route Intelligence",
    href: "/route-intelligence",
    roles: ["Admin", "Fleet Manager", "Operations"],
  },
  {
    name: "Driver Intelligence",
    href: "/driver-intelligence",
    roles: ["Admin", "Fleet Manager", "Operations"],
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

  const visibleMenuItems = menuItems.filter((item) =>
    user ? item.roles.includes(user.role) : false,
  );

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-700 p-6">
        <h1 className="text-2xl font-bold">
          FleetFlow
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          ERP Management System
        </p>

        {user && (
          <div className="mt-4 rounded-lg bg-slate-800 p-3">
            <p className="text-sm font-medium text-white">
              {user.name}
            </p>

            <p className="mt-1 text-xs text-blue-400">
              {user.role}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {visibleMenuItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-4">
        <button
          onClick={handleLogout}
          className="mb-4 w-full rounded-lg border border-red-800 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-950 hover:text-red-300"
        >
          Logout
        </button>

        <p className="text-xs text-slate-500">
          FleetFlow ERP
        </p>

        <p className="text-sm text-slate-300">
          v1.0.0
        </p>
      </div>
    </aside>
  );
}
