
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Employee = {
  employeeId: string;
  name: string;
  department: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  status: string;
};

type AuditLog = {
  id: number;
  user: string;
  action: string;
  record: string;
  date: string;
  time: string;
};

type CorrectionRequest = {
  id: number;
  request_status: string;
};

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [correctionRequests, setCorrectionRequests] = useState<
    CorrectionRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const [employeeResponse, auditResponse, correctionResponse] =
          await Promise.all([
            fetch("/api/employees", { cache: "no-store" }),
            fetch("/api/audit-logs", { cache: "no-store" }),
            fetch("/api/hr/correction-requests", { cache: "no-store" }),
          ]);

        const [employeeResult, auditResult, correctionResult] =
          await Promise.all([
            employeeResponse.json(),
            auditResponse.json(),
            correctionResponse.json(),
          ]);

        if (cancelled) return;

        const errors: string[] = [];

        if (employeeResponse.ok && employeeResult.success) {
          setEmployees(
            Array.isArray(employeeResult.employees)
              ? employeeResult.employees
              : []
          );
        } else {
          errors.push(
            employeeResult.message || "Could not load employee records."
          );
        }

        if (auditResponse.ok && auditResult.success) {
          setAuditLogs(
            Array.isArray(auditResult.logs) ? auditResult.logs : []
          );
        } else {
          errors.push(
            auditResult.message || "Could not load audit logs."
          );
        }

        if (correctionResponse.ok && correctionResult.success) {
          setCorrectionRequests(
            Array.isArray(correctionResult.requests)
              ? correctionResult.requests
              : []
          );
        } else {
          errors.push(
            correctionResult.message ||
              "Could not load correction requests."
          );
        }

        setDashboardError(errors.join(" "));
      } catch {
        if (!cancelled) {
          setDashboardError(
            "Could not connect to the server. Please refresh the dashboard."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const dataIssues = employees.filter((employee) => {
    if (!employee.department?.trim() || !employee.email?.trim()) {
      return true;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailPattern.test(employee.email);
  });

  const duplicateRecords = employees.filter((employee, index, array) =>
    array.some(
      (otherEmployee, otherIndex) =>
        otherIndex !== index &&
        otherEmployee.employeeId === employee.employeeId
    )
  );

  const pendingCorrections = correctionRequests.filter(
    (request) => request.request_status === "PENDING"
  ).length;

  const displayAuditLogs = auditLogs.map((log) => ({
    ...log,
    user: log.user || "Unknown user",
    record: log.record || "N/A",
    date: log.date || "",
    time: log.time || "",
  }));

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              HRMS Data Quality System
            </h1>
            <p className="text-sm text-slate-500">
              Human Resource Management System
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">
              HR Administrator
            </p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="mt-1 text-slate-500">
            Overview of employee records and data quality.
          </p>
        </div>

        {dashboardError && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            {dashboardError}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Employees</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "..." : employees.length}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Database employee records
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Active Employees</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading
                ? "..."
                : employees.filter(
                    (employee) =>
                      employee.status?.toLowerCase() === "active"
                  ).length}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Records marked active
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Data Issues</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "..." : dataIssues.length}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Records requiring attention
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Duplicate Records</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "..." : duplicateRecords.length}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Potential duplicate IDs
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Audit Events</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "..." : auditLogs.length}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Database audit activities
            </p>
          </div>
        </div>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Employee Correction Requests
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Review requested changes before updating official employee
                records.
              </p>
              <p className="mt-2 font-medium text-amber-700">
                {loading ? "Loading..." : `${pendingCorrections} pending requests`}
              </p>
            </div>

            <Link
              href="/hr/correction-requests"
              className="inline-block rounded-lg bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
            >
              Review Corrections
            </Link>
          </div>
        </section>

        <section className="mb-6 mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Employee Account Approvals
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Review employee registrations and approve or reject access
                requests.
              </p>
            </div>

            <Link
              href="/hr/accounts"
              className="inline-block rounded-lg bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
            >
              Manage Approvals
            </Link>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Employee Management
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Manage employee information and maintain accurate personnel
              records.
            </p>
            <Link
              href="/employees"
              className="mt-5 inline-block rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Manage Employees
            </Link>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Data Quality Monitoring
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Review missing, duplicate, invalid and inconsistent employee
              information.
            </p>
            <Link
              href="/data-quality"
              className="mt-5 inline-block rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View Data Quality
            </Link>
          </section>
        </div>

        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Recent Activity
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Latest employee management activities from the database.
              </p>
            </div>

            <Link
              href="/audit-logs"
              className="text-sm font-semibold text-slate-700 hover:underline"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-8 text-center">
              <p className="text-sm text-slate-500">
                Loading recent activity...
              </p>
            </div>
          ) : displayAuditLogs.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-8 text-center">
              <p className="text-sm text-slate-500">
                No recent activity to display.
              </p>
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Record</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {displayAuditLogs.slice(0, 5).map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-3 text-slate-700">
                        {log.user}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {log.record}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {log.date}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {log.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
