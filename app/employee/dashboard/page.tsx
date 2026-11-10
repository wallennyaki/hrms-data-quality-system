
"use client";

import { useEffect, useState } from "react";

type Employee = {
  employeeId: string;
  name: string;
  department: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  status: string;
};

const correctionFields = [
  { value: "name", label: "Full Name" },
  { value: "department", label: "Department" },
  { value: "position", label: "Position" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "status", label: "Employment Status" },
] as const;

type CorrectionField = (typeof correctionFields)[number]["value"];

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [comment, setComment] = useState("");
  const [fieldName, setFieldName] = useState<CorrectionField>("department");
  const [requestedValue, setRequestedValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMyRecord() {
      try {
        const response = await fetch("/api/employee/me", {
          cache: "no-store",
        });
        const result = await response.json();

        if (cancelled) return;

        if (!response.ok || !result.success) {
          setMessage(result.message || "Unable to load your employee record.");
          return;
        }

        setEmployee(result.employee);
      } catch {
        if (!cancelled) {
          setMessage("Could not connect to the server.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadMyRecord();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentValue = employee ? employee[fieldName] ?? "" : "";

  async function submitVerification(
    action: "CONFIRM" | "CORRECTION_REQUESTED"
  ) {
    if (submitting) return;

    if (
      action === "CORRECTION_REQUESTED" &&
      (!requestedValue.trim() || !comment.trim())
    ) {
      setMessage("Enter the requested correct value and explain the issue.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/employee/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          fieldName: action === "CORRECTION_REQUESTED" ? fieldName : undefined,
          requestedValue:
            action === "CORRECTION_REQUESTED"
              ? requestedValue.trim()
              : undefined,
          comment: action === "CORRECTION_REQUESTED" ? comment.trim() : "",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(result.message || "Could not save your response.");
        return;
      }

      setVerificationStatus(result.verificationStatus);
      setMessage(result.message);

      if (action === "CORRECTION_REQUESTED") {
        setComment("");
        setRequestedValue("");
      }
    } catch {
      setMessage("Could not connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-[#3b3b3b] bg-[#080808] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-gray-400 focus:ring-1 focus:ring-gray-500";

  const labelClass =
    "block text-sm font-medium text-gray-300";

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f5f6f8] via-[#dce0e6] to-[#aeb6c2] px-4 py-8 sm:px-8">

      {/* Bright abstract background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-white/80 blur-3xl" />
        <div className="absolute -right-40 top-20 h-[550px] w-[550px] rounded-full bg-slate-400/40 blur-3xl" />
        <div className="absolute -bottom-48 left-1/3 h-[500px] w-[500px] rounded-full bg-white/70 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">

        {/* Header */}
        <header className="overflow-hidden rounded-2xl border border-[#333] bg-gradient-to-r from-[#171717] via-[#090909] to-black p-7 text-white shadow-2xl sm:p-9">

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#444] bg-white text-lg font-bold text-black">
              HR
            </div>

            <div>
              <p className="text-sm font-semibold tracking-[0.2em]">
                HRMS
              </p>
              <p className="mt-1 text-xs text-gray-500">
                EMPLOYEE PORTAL
              </p>
            </div>
          </div>

          <div className="mt-9">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Human Resource Management System
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Employee Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
              Review your employee information, confirm its accuracy
              or request corrections through the HR department.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="mt-6 rounded-xl border border-[#333] bg-[#101010] p-8 text-gray-300 shadow-xl">
            Loading your employee record...
          </div>
        ) : !employee ? (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-900 bg-[#160909] p-5 text-red-400"
          >
            {message || "No employee record was returned."}
          </div>
        ) : (
          <>
            {/* Employee information */}
            <section className="mt-6 rounded-2xl border border-[#333] bg-[#101010] p-6 text-white shadow-xl sm:p-8">

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Personal Information
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    My Employee Record
                  </h2>
                </div>

                <span className="rounded-full border border-[#444] bg-[#1b1b1b] px-4 py-2 text-xs font-medium text-gray-300">
                  {employee.status || "Status unavailable"}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Review these details carefully. Official records cannot be
                edited directly from this dashboard.
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {[
                  ["Employee ID", employee.employeeId],
                  ["Full Name", employee.name],
                  ["Department", employee.department],
                  ["Position", employee.position],
                  ["Email Address", employee.email],
                  ["Phone Number", employee.phone],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-[#303030] bg-[#080808] p-4"
                  >
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      {label}
                    </p>
                    <p className="mt-2 break-words font-medium text-white">
                      {value || "Not provided"}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Verification section */}
            <section className="mt-6 rounded-2xl border border-[#333] bg-[#101010] p-6 text-white shadow-xl sm:p-8">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Record Verification
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Verify Your Information
              </h2>

              <p className="mt-3 text-sm leading-7 text-gray-400">
                If everything is correct, confirm your details. If something
                is incorrect, submit a correction request for HR to review.
              </p>

              {verificationStatus && (
                <div className="mt-5 rounded-lg border border-[#444] bg-[#191919] p-4 text-sm text-gray-300">
                  Your current response:{" "}
                  <strong className="text-white">
                    {verificationStatus.replaceAll("_", " ")}
                  </strong>
                </div>
              )}

              {message && (
                <p
                  role="status"
                  aria-live="polite"
                  className="mt-5 rounded-lg border border-blue-900/60 bg-blue-950/30 p-4 text-sm text-blue-300"
                >
                  {message}
                </p>
              )}

              <button
                type="button"
                onClick={() => void submitVerification("CONFIRM")}
                disabled={submitting}
                className="mt-6 w-full rounded-lg border border-emerald-600 bg-emerald-700 px-4 py-4 text-sm font-bold tracking-wide text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "SAVING..." : "CONFIRM MY DETAILS"}
              </button>

              {/* Correction request */}
              <div className="mt-9 border-t border-[#303030] pt-7">

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Employee Support
                </p>

                <h3 className="mt-2 text-xl font-semibold">
                  Request a Correction
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-400">
                  Select the incorrect field, enter the value you believe
                  is correct, and explain the issue. HR must review your
                  request before the official record is changed.
                </p>

                <div className="mt-6">
                  <label htmlFor="correction-field" className={labelClass}>
                    Field to correct
                  </label>

                  <select
                    id="correction-field"
                    value={fieldName}
                    onChange={(event) =>
                      setFieldName(event.target.value as CorrectionField)
                    }
                    className={inputClass}
                  >
                    {correctionFields.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 rounded-lg border border-[#303030] bg-[#080808] p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Current value
                  </p>
                  <p className="mt-2 font-medium text-white">
                    {currentValue || "Not provided"}
                  </p>
                </div>

                <div className="mt-5">
                  <label htmlFor="requested-value" className={labelClass}>
                    Requested correct value
                  </label>

                  <input
                    id="requested-value"
                    type="text"
                    value={requestedValue}
                    onChange={(event) =>
                      setRequestedValue(event.target.value)
                    }
                    maxLength={1000}
                    placeholder="Enter the value you believe is correct"
                    className={inputClass}
                  />
                </div>

                <div className="mt-5">
                  <label htmlFor="correction-comment" className={labelClass}>
                    Explanation
                  </label>

                  <textarea
                    id="correction-comment"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    rows={4}
                    maxLength={2000}
                    placeholder="Explain why this information needs correcting."
                    className={inputClass}
                  />
                </div>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    void submitVerification("CORRECTION_REQUESTED")
                  }
                  className="mt-6 w-full rounded-lg border border-white bg-white px-4 py-4 text-sm font-bold tracking-wide text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "SUBMITTING..."
                    : "SUBMIT CORRECTION REQUEST"}
                </button>
              </div>
            </section>
          </>
        )}

        <footer className="mt-8 pb-4 text-center text-xs tracking-wide text-gray-600">
          HRMS Data Quality System © 2026
        </footer>
      </div>
    </main>
  );
}
