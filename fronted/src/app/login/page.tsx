"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password",
        );
      }

      const loginData = data as LoginResponse;

      // Keep the token in localStorage for frontend API requests.
      localStorage.setItem(
        "fleetflow_token",
        loginData.accessToken,
      );

      // Keep the logged-in user's information.
      localStorage.setItem(
        "fleetflow_user",
        JSON.stringify(loginData.user),
      );

      // Store the JWT in a browser cookie so Next.js middleware
      // can detect that the user is authenticated.
      document.cookie = `fleetflow_token=${loginData.accessToken}; path=/; max-age=86400; SameSite=Lax`;

      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              FleetFlow
            </h1>

            <p className="text-slate-400 mt-2">
              Logistics ERP System
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              Sign in
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Enter your credentials to access FleetFlow.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2"
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
                className="block text-sm font-medium text-slate-300 mb-2"
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

            <p className="text-xs text-slate-400 mt-1">
              Secure role-based access for FleetFlow users.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
