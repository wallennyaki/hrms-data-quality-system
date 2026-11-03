
"use client";

import { useEffect, useState } from "react";

type PendingAccount = {
  id: number;
  employeeId: string;
  fullName: string;
  email: string;
  accountStatus: string;
  createdAt: string;
};

export default function HRAccountsPage() {
  const [accounts, setAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
async function loadAccounts() {
  setLoading(true);
  setMessage("");

  try {
    const response = await fetch("/api/hr/accounts", {
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      setError(true);
      setMessage(result.message || "Unable to load pending accounts.");
      return;
    }

    setError(false);
    setAccounts(result.accounts || []);
  } catch {
    setError(true);
    setMessage("Could not connect to the server.");
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  let cancelled = false;

  async function fetchAccounts() {
    setLoading(true);

    try {
      const response = await fetch("/api/hr/accounts", {
        cache: "no-store",
      });

      const result = await response.json();

      if (cancelled) return;

      if (!response.ok || !result.success) {
        setError(true);
        setMessage(result.message || "Unable to load pending accounts.");
        return;
      }

      setError(false);
      setMessage("");
      setAccounts(result.accounts || []);
    } catch {
      if (!cancelled) {
        setError(true);
        setMessage("Could not connect to the server.");
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void fetchAccounts();

  return () => {
    cancelled = true;
  };
}, []);


  async function reviewAccount(
    id: number,
    decision: "APPROVED" | "REJECTED"
  ) {
    const action = decision === "APPROVED" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this account?`)) {
      return;
    }

    setBusyId(id);
    setMessage("");

    try {
      const response = await fetch("/api/hr/accounts", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, decision }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(true);
        setMessage(result.message || "Could not review this account.");
        return;
      }

      setError(false);
      setMessage(result.message);
      await loadAccounts();
    } catch {
      setError(true);
      setMessage("Could not connect to the server.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              HR Administration
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Employee Account Approvals
            </h1>
            <p className="mt-2 text-slate-600">
              Review employee registrations before granting system access.
            </p>
          </div>

          <button
            onClick={() => void loadAccounts()}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {message && (
          <div
            role="status"
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {message}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Pending Registrations
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {accounts.length} account
              {accounts.length === 1 ? "" : "s"} awaiting review
            </p>
          </div>

          {loading ? (
            <p className="px-6 py-10 text-center text-slate-500">
              Loading registrations...
            </p>
          ) : error && accounts.length === 0 ? (
            <p className="px-6 py-10 text-center text-slate-500">
              Registrations could not be loaded. Check your HR login and try
              refreshing.
            </p>
          ) : accounts.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <h3 className="font-semibold text-slate-800">
                No pending registrations
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                New employee registrations will appear here for review.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-175 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Employee</th>
                    <th className="px-6 py-4 font-semibold">Employee ID</th>
                    <th className="px-6 py-4 font-semibold">Registration Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map((account) => (
                    <tr key={account.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {account.fullName}
                        </p>
                        <p className="mt-1 text-slate-500">{account.email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {account.employeeId}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(account.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              void reviewAccount(account.id, "APPROVED")
                            }
                            disabled={busyId !== null}
                            className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                          >
                            {busyId === account.id ? "Working..." : "Approve"}
                          </button>
                          <button
                            onClick={() =>
                              void reviewAccount(account.id, "REJECTED")
                            }
                            disabled={busyId !== null}
                            className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-4 text-xs text-slate-500">
          Only an authenticated HR administrator can review registrations.
          Decisions are recorded in the audit log.
        </p>
      </div>
    </main>
  );
}
