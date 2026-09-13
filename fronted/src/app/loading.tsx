export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-900/30">
          F
        </div>

        <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

        <p className="mt-4 text-sm font-semibold text-white">
          Loading FleetFlow...
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Preparing your workspace
        </p>
      </div>
    </main>
  );
}
