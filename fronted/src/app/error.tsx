"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error("FleetFlow application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-3xl">
          ⚠️
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-widest text-red-400">
          FleetFlow Error
        </p>

        <h1 className="mt-2 text-2xl font-bold text-white">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          FleetFlow encountered an unexpected problem while
          loading this section.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => reset()}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Try Again
          </button>

          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}
