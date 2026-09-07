"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  FleetFlowRole,
  hasPermission,
} from "@/lib/permissions";

type ProtectedPageProps = {
  permission: keyof typeof import("@/lib/permissions").permissions;
  children: ReactNode;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: FleetFlowRole;
};

export default function ProtectedPage({
  permission,
  children,
}: ProtectedPageProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("fleetflow_user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser) as User;

      if (!hasPermission(permission, user.role)) {
        setAllowed(false);
        setChecking(false);
        return;
      }

      setAllowed(true);
      setChecking(false);
    } catch {
      localStorage.removeItem("fleetflow_user");
      localStorage.removeItem("fleetflow_token");

      router.replace("/login");
    }
  }, [permission, router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="text-lg font-semibold text-white">
            Checking permissions...
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Please wait.
          </p>
        </div>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="text-5xl">🔒</div>

          <h1 className="mt-4 text-2xl font-bold text-white">
            Access Denied
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            You do not have permission to access this section
            of FleetFlow.
          </p>

          <button
            onClick={() => router.push("/")}
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
