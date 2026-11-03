
"use client";

import { useCallback, useEffect, useState } from "react";

type CorrectionRequest = {
  id: number;
  employee_id: string;
  field_name: string;
  current_value: string | null;
  requested_value: string;
  employee_comment: string | null;
  request_status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  employee_name: string | null;
};

const fieldLabels: Record<string, string> = {
  name: "Full Name",
  department: "Department",
  position: "Position",
  email: "Email",
  phone: "Phone",
  status: "Employment Status",
};

export default function CorrectionRequestsPage() {
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("PENDING");

  const loadRequests = useCallback(async () => {

    try {
      const response = await fetch("/api/hr/correction-requests", {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(true);
        setMessage(result.message || "Unable to load correction requests.");
        return;
      }

      setRequests(result.requests);
      setError(false);
      setMessage("");
    } catch {
      setError(true);
      setMessage("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, []);

useEffect(() => {
  let cancelled = false;

  async function fetchRequests() {
    try {
      const response = await fetch("/api/hr/correction-requests", {
        cache: "no-store",
      });
      const result = await response.json();

      if (cancelled) return;

      if (!response.ok || !result.success) {
        setError(true);
        setMessage(result.message || "Unable to load correction requests.");
        return;
      }

      setRequests(result.requests);
      setError(false);
      setMessage("");
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

  void fetchRequests();

  return () => {
    cancelled = true;
  };
}, []);

  async function reviewRequest(
    id: number,
    decision: "APPROVED" | "REJECTED"
  ) {
    const actionLabel = decision === "APPROVED" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${actionLabel} request #${id}?`)) {
      return;
    }

    setBusyId(id);
    setMessage("");
    setError(false);

    try {
      const response = await fetch("/api/hr/correction-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, decision }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(true);
        setMessage(result.message || "Unable to review this request.");
        return;
      }

      setMessage(result.message);
      await loadRequests();
    } catch {
      setError(true);
      setMessage("Could not connect to the server. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  const visibleRequests =
    filter === "ALL"
      ? requests
      : requests.filter((request) => request.request_status === filter);

  const pendingCount = requests.filter(
    (request) => request.request_status === "PENDING"
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-xl bg-slate-900 p-6 text-white">
          <p className="text-sm text-slate-300">
            Human Resource Management System
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            Employee Correction Requests
          </h1>
          <p className="mt-2 text-slate-300">
            Review employee requests before changing official records.
          </p>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending Requests</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {pendingCount}
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Approved Requests</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {requests.filter((r) => r.request_status === "APPROVED").length}
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Rejected Requests</p>
            <p className="mt-2 text-3xl font-bold text-red-700">
              {requests.filter((r) => r.request_status === "REJECTED").length}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Review Requests
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Approving a request updates the corresponding employee field.
                Rejecting it leaves the record unchanged.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadRequests()}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="mt-5">
            <label
              htmlFor="request-filter"
              className="block text-sm font-medium text-slate-700"
            >
              Filter requests
            </label>
            <select
              id="request-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 sm:max-w-xs"
            >
              <option value="PENDING">Pending only</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ALL">All requests</option>
            </select>
          </div>

          {message && (
            <p
              role="status"
              className={`mt-5 rounded-lg p-3 text-sm ${
                error
                  ? "bg-red-50 text-red-700"
                  : "bg-emerald-50 text-emerald-800"
              }`}
            >
              {message}
            </p>
          )}

          {loading ? (
            <p className="py-10 text-center text-slate-500">
              Loading correction requests...
            </p>
          ) : visibleRequests.length === 0 ? (
            <div className="py-10 text-center text-slate-500">
              No requests found for this filter.
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {visibleRequests.map((request) => (
                <article
                  key={request.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Request #{request.id}:{" "}
                        {fieldLabels[request.field_name] || request.field_name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Employee: {request.employee_name || "Unknown"} (
                        {request.employee_id})
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Submitted:{" "}
                        {new Date(request.created_at).toLocaleString()}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        request.request_status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : request.request_status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {request.request_status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Current value</p>
                      <p className="mt-1 wrap-break-words font-medium text-slate-900">
                        {request.current_value || "Not provided"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-4">
                      <p className="text-sm text-blue-700">
                       Employee&apos;s requested valueEmployee&apos;s requested value
                      </p>
                      <p className="mt-1 wrap-break-word font-medium text-slate-900">
                        {request.requested_value}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-700">
                      Employee explanation
                    </p>
                    <p className="mt-1 whitespace-pre-wrap wrap-break-word text-slate-600">
                      {request.employee_comment || "No explanation provided."}
                    </p>
                  </div>

                  {request.request_status === "PENDING" && (
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() =>
                          void reviewRequest(request.id, "APPROVED")
                        }
                        className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busyId === request.id
                          ? "Processing..."
                          : "Approve and Update Record"}
                      </button>

                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() =>
                          void reviewRequest(request.id, "REJECTED")
                        }
                        className="rounded-lg bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busyId === request.id ? "Processing..." : "Reject"}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
