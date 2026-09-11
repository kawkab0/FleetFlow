"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import {
  FleetFlowRole,
  permissions,
} from "@/lib/permissions";

type ProtectedPageProps = {
  permission: keyof typeof permissions;
  children: ReactNode;
};

type StoredUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function ProtectedPage({
  permission,
  children,
}: ProtectedPageProps) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("fleetflow_user");

    if (!storedUser) {
      setAllowed(false);
      setChecking(false);
      return;
    }

    try {
      const user = JSON.parse(
        storedUser,
      ) as StoredUser;

      const role =
        user.role.trim() as FleetFlowRole;

      const allowedRoles =
        permissions[permission] ?? [];

      setAllowed(
        allowedRoles.includes(role),
      );
    } catch {
      setAllowed(false);
    } finally {
      setChecking(false);
    }
  }, [permission]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-lg font-semibold text-white">
          Checking permissions...
        </div>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="text-5xl">
            🔒
          </div>

          <h1 className="mt-4 text-2xl font-bold text-white">
            Access Denied
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            You do not have permission to access
            this section of FleetFlow.
          </p>

          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

