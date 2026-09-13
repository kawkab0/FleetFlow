import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <div className="text-6xl font-black text-blue-500">
          404
        </div>

        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">
          FleetFlow ERP
        </p>

        <h1 className="mt-2 text-2xl font-bold text-white">
          Page not found
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          The page you're looking for doesn't exist or
          may have been moved.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
