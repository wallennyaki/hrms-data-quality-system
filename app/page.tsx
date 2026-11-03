
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(
          result.message || "Login failed. Please check your details."
        );
        return;
      }

if (result.user.role === "HR") {
  router.push("/dashboard");
} else if (result.user.role === "EMPLOYEE") {
  router.push("/employee/dashboard");
} else {
  setMessage("Your account has an unrecognized role. Please contact HR.");
  return;
}

router.refresh();
    } catch {
      setMessage(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">
        {/* Left side */}
        <section className="bg-slate-900 px-8 py-12 text-white md:px-12 md:py-16">
          <div className="mb-12">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white text-xl font-bold text-slate-900">
              HR
            </div>

            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-slate-300">
              Human Resource Management
            </p>

            <h1 className="text-4xl font-bold leading-tight">
              HRMS Data Quality System
            </h1>
          </div>

          <p className="max-w-md text-base leading-7 text-slate-300">
            A centralized human resource management system designed to
            support reliable employee records, data validation, monitoring
            and audit activities.
          </p>

          <div className="mt-10 space-y-4 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-white" />
              Employee record management
            </div>

            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-white" />
              Data quality monitoring
            </div>

            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-white" />
              Audit and accountability
            </div>
          </div>
        </section>

        {/* Login form */}
        <section className="px-8 py-12 md:px-12 md:py-16">
          <div className="mx-auto max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to access the HRMS portal.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              {message && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {message}
                </p>
              )}
            </form>

            <div className="mt-8 space-y-4">
              <p className="text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <a
                  href="/register"
                  className="font-semibold text-slate-900 underline hover:text-slate-700"
                >
                  Sign Up
                </a>
              </p>

              <p className="text-center text-xs text-slate-400">
                HRMS Data Quality System © 2026
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
