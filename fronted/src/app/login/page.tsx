"use client";

import { FormEvent, useState } from "react";

interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3001/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Invalid email or password",
        );
      }

      const loginData = data as LoginResponse;

      // Save JWT for authenticated API requests.
      localStorage.setItem(
        "fleetflow_token",
        loginData.accessToken,
      );

      // Save logged-in user information.
      localStorage.setItem(
        "fleetflow_user",
        JSON.stringify(loginData.user),
      );

      // Save JWT in cookie so Next.js middleware
      // recognizes the authenticated session.
      document.cookie =
        `fleetflow_token=${loginData.accessToken}; ` +
        "path=/; " +
        "max-age=86400; " +
        "SameSite=Lax";

      // Force a full navigation so the middleware
      // immediately receives the new authentication cookie.
      window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Something went wrong. Please try again.",
        );
      }

      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">
              FleetFlow
            </h1>

            <p className="mt-2 text-slate-400">
              Logistics ERP System
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              Sign in
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Enter your credentials to access FleetFlow.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="admin@fleetflow.com"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 rounded-lg bg-slate-800/60 p-4">
            <p className="text-xs text-slate-500">
              FleetFlow Authentication
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Secure role-based access for FleetFlow users.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
