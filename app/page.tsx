
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
        setMessage(
          "Your account has an unrecognized role. Please contact HR."
        );
        return;
      }

      router.refresh();
    } catch {
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f5f6f8] via-[#dce0e6] to-[#aeb6c2] px-5 py-12 text-white">

      {/* Bright abstract background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-white/80 blur-3xl" />

        <div className="absolute -right-40 top-20 h-[550px] w-[550px] rounded-full bg-slate-400/40 blur-3xl" />

        <div className="absolute -bottom-48 left-1/3 h-[500px] w-[500px] rounded-full bg-white/70 blur-3xl" />

        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,#ffffff_1px,transparent_1px)] [background-size:55px_55px]" />
      </div>

      {/* Main login card */}
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[#333333] bg-[#0b0b0b] shadow-2xl md:grid-cols-2">

        {/* Branding section */}
        <section className="relative flex flex-col justify-between border-b border-[#292929] bg-gradient-to-br from-[#171717] via-[#090909] to-black px-8 py-12 md:border-b-0 md:border-r md:px-12 md:py-16">

          <div>
            <div className="mb-12 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[#444] bg-white text-xl font-bold tracking-wider text-black">
                HR
              </div>

              <div>
                <p className="text-sm font-semibold tracking-[0.2em] text-white">
                  HRMS
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  MANAGEMENT PORTAL
                </p>
              </div>
            </div>

            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
              Human Resource Management System
            </p>

            <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
              HRMS Data Quality System
            </h1>

            <div className="mt-7 h-[2px] w-16 bg-white" />

            <p className="mt-7 max-w-md text-sm leading-7 text-gray-400">
              A centralized platform for managing employee information,
              maintaining reliable records and monitoring human resource
              data quality.
            </p>
          </div>

          <div className="mt-12 space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#333] bg-[#151515] text-sm text-gray-300">
                01
              </div>
              <span className="text-sm text-gray-300">
                Employee Record Management
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#333] bg-[#151515] text-sm text-gray-300">
                02
              </div>
              <span className="text-sm text-gray-300">
                Data Quality Monitoring
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#333] bg-[#151515] text-sm text-gray-300">
                03
              </div>
              <span className="text-sm text-gray-300">
                Audit and Accountability
              </span>
            </div>
          </div>

          <p className="mt-12 text-xs tracking-wide text-gray-600">
            HUMAN RESOURCE MANAGEMENT
          </p>
        </section>

        {/* Login form section */}
        <section className="flex items-center bg-[#101010] px-8 py-12 md:px-12 md:py-16">

          <div className="mx-auto w-full max-w-md">

            <div className="mb-10">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Secure Access
              </p>

              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Welcome back.
              </h2>

              <p className="mt-3 text-sm text-gray-500">
                Enter your account details to continue.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">

              <div>
                <label
                  htmlFor="email"
                  className="mb-3 block text-sm font-medium text-gray-300"
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
                  className="w-full rounded-lg border border-[#353535] bg-[#080808] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-gray-400 focus:ring-1 focus:ring-gray-500"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-3 block text-sm font-medium text-gray-300"
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
                  className="w-full rounded-lg border border-[#353535] bg-[#080808] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-gray-400 focus:ring-1 focus:ring-gray-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg border border-white bg-white px-4 py-3.5 text-sm font-bold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "SIGN IN"}
              </button>

              {message && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-400"
                >
                  {message}
                </p>
              )}
            </form>

            <div className="mt-9 border-t border-[#292929] pt-7">
              <p className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <a
                  href="/register"
                  className="font-semibold text-white underline underline-offset-4 transition hover:text-gray-300"
                >
                  Create Account
                </a>
              </p>

              <p className="mt-8 text-center text-xs text-gray-600">
                HRMS Data Quality System © 2026
              </p>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
