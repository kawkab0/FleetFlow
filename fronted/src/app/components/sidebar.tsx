"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", href: "/" },
  { name: "Vehicles", href: "/vehicles" },
  { name: "Drivers", href: "/drivers" },
  { name: "Trips", href: "/trips" },
  { name: "Fuel", href: "/fuel" },
  { name: "Maintenance", href: "/maintenance" },
  { name: "Expenses", href: "/expenses" },
  { name: "Inventory", href: "/inventory" },
  { name: "Suppliers", href: "/suppliers" },
  { name: "Reports", href: "/reports" },
  { name: "Analytics", href: "/analytics" },
  { name: "Intelligence", href: "/intelligence" },
  { name: "Profitability", href: "/profitability" },
  { name: "Fuel Intelligence", href: "/fuel-intelligence" },
  {
    name: "Maintenance Intelligence",
    href: "/maintenance-intelligence",
  },
  {
    name: "Recommendations",
    href: "/recommendations",
  },
  {
    name: "Alerts",
    href: "/alerts",
  },
  {
    name: "Route Intelligence",
    href: "/route-intelligence",
  },
  {
    name: "Driver Intelligence",
    href: "/driver-intelligence",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-700 p-6">
        <h1 className="text-2xl font-bold">FleetFlow</h1>

        <p className="mt-1 text-sm text-slate-400">
          ERP Management System
        </p>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {menuItems.map((item) => {
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
