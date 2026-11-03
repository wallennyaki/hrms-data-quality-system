
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

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 rounded-xl bg-slate-900 p-6 text-white">
          <p className="text-sm text-slate-300">
            Human Resource Management System
          </p>
          <h1 className="mt-2 text-3xl font-bold">Employee Dashboard</h1>
          <p className="mt-2 text-slate-300">
            Review your information and confirm whether it is accurate.
          </p>
        </header>

        {loading ? (
          <div className="rounded-xl bg-white p-8 text-slate-600 shadow-sm">
            Loading your employee record...
          </div>
        ) : !employee ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
          >
            {message || "No employee record was returned."}
          </div>
        ) : (
          <>
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                My Employee Record
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Review these details carefully. Official records cannot be
                edited directly from this dashboard.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {[
                  ["Employee ID", employee.employeeId],
                  ["Full Name", employee.name],
                  ["Department", employee.department],
                  ["Position", employee.position],
                  ["Email", employee.email],
                  ["Phone", employee.phone],
                  ["Employment Status", employee.status],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {value || "Not provided"}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Verify Your Information
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                If everything is correct, confirm your details. If something
                is incorrect, submit a correction request for HR to review.
              </p>

              {verificationStatus && (
                <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
                  Your current response:{" "}
                  <strong>
                    {verificationStatus.replaceAll("_", " ")}
                  </strong>
                </p>
              )}

              {message && (
                <p
                  role="status"
                  className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800"
                >
                  {message}
                </p>
              )}

              <button
                type="button"
                onClick={() => void submitVerification("CONFIRM")}
                disabled={submitting}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "14px",
                  marginTop: "20px",
                  backgroundColor: "#047857",
                  color: "#ffffff",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  border: "2px solid #047857",
                  cursor: submitting ? "wait" : "pointer",
                }}
              >
                {submitting ? "Saving..." : "CONFIRM MY DETAILS"}
              </button>

              <div className="mt-8 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Request a Correction
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Select the incorrect field, enter the value you believe is
                  correct, and explain the issue. HR must review your request
                  before the official record is changed.
                </p>

                <label
                  htmlFor="correction-field"
                  className="mt-5 block text-sm font-medium text-slate-700"
                >
                  Field to correct
                </label>
                <select
                  id="correction-field"
                  value={fieldName}
                  onChange={(event) =>
                    setFieldName(event.target.value as CorrectionField)
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900"
                >
                  {correctionFields.map((field) => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>

                <div className="mt-4 rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Current value</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {currentValue || "Not provided"}
                  </p>
                </div>

                <label
                  htmlFor="requested-value"
                  className="mt-4 block text-sm font-medium text-slate-700"
                >
                  Requested correct value
                </label>
                <input
                  id="requested-value"
                  type="text"
                  value={requestedValue}
                  onChange={(event) => setRequestedValue(event.target.value)}
                  maxLength={1000}
                  placeholder="Enter the value you believe is correct"
                  className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-slate-900"
                />

                <label
                  htmlFor="correction-comment"
                  className="mt-4 block text-sm font-medium text-slate-700"
                >
                  Explanation
                </label>
                <textarea
                  id="correction-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Explain why this information needs correcting."
                  className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-slate-900"
                />

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    void submitVerification("CORRECTION_REQUESTED")
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "14px",
                    marginTop: "16px",
                    backgroundColor: "#1e293b",
                    color: "#ffffff",
                    fontWeight: "bold",
                    borderRadius: "8px",
                    border: "2px solid #1e293b",
                    cursor: submitting ? "wait" : "pointer",
                  }}
                >
                  {submitting
                    ? "Submitting..."
                    : "SUBMIT CORRECTION REQUEST"}
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
