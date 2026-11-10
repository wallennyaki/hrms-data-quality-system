
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError(false);

    if (password !== confirmPassword) {
      setError(true);
      setMessage("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(true);
        setMessage(result.message || "Registration failed.");
        return;
      }

      setMessage(result.message);
      setEmployeeId("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError(true);
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f5f6f8] via-[#dce0e6] to-[#aeb6c2] px-5 py-12">

      {/* Bright abstract background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-white/80 blur-3xl" />
        <div className="absolute -right-40 top-20 h-[550px] w-[550px] rounded-full bg-slate-400/40 blur-3xl" />
        <div className="absolute -bottom-48 left-1/3 h-[500px] w-[500px] rounded-full bg-white/70 blur-3xl" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,#ffffff_1px,transparent_1px)] [background-size:55px_55px]" />
      </div>

      {/* Registration card */}
      <section className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[#333333] bg-[#0b0b0b] shadow-2xl">

        {/* Header */}
        <div className="border-b border-[#292929] bg-gradient-to-br from-[#171717] to-black px-8 py-8 sm:px-10">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#444] bg-white text-lg font-bold text-black">
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

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Employee Account Access
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Create your account.
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-gray-400">
            Register using the employee ID and email address recorded by HR.
            Your account will require HR approval before access is granted.
          </p>

          <div className="mt-6 h-[2px] w-16 bg-white" />
        </div>

        {/* Form */}
        <div className="px-8 py-8 sm:px-10">
          <form onSubmit={handleRegister} className="space-y-5">

            <div>
              <label
                htmlFor="employeeId"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Employee ID
              </label>

              <input
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                placeholder="e.g. EMP001"
                autoComplete="off"
                required
                className="w-full rounded-lg border border-[#353535] bg-[#080808] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-gray-400 focus:ring-1 focus:ring-gray-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Registered Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter the email recorded by HR"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-[#353535] bg-[#080808] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-gray-400 focus:ring-1 focus:ring-gray-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Create Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
                className="w-full rounded-lg border border-[#353535] bg-[#080808] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-gray-400 focus:ring-1 focus:ring-gray-500"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter your password again"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
                className="w-full rounded-lg border border-[#353535] bg-[#080808] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-gray-400 focus:ring-1 focus:ring-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-white bg-white px-4 py-3.5 text-sm font-bold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "SUBMITTING..." : "CREATE EMPLOYEE ACCOUNT"}
            </button>

            {message && (
              <p
                role="status"
                aria-live="polite"
                className={`rounded-lg border px-4 py-3 text-sm ${
                  error
                    ? "border-red-900/60 bg-red-950/30 text-red-400"
                    : "border-green-900/60 bg-green-950/30 text-green-400"
                }`}
              >
                {message}
              </p>
            )}
          </form>

          <div className="mt-8 border-t border-[#292929] pt-6">
            <p className="text-center text-sm text-gray-500">
              Already registered?{" "}
              <Link
                href="/"
                className="font-semibold text-white underline underline-offset-4 transition hover:text-gray-300"
              >
                Return to sign in
              </Link>
            </p>

            <p className="mt-7 text-center text-xs text-gray-600">
              HRMS Data Quality System © 2026
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

