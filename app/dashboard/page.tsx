
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
  createdAt?: string;
  date?: string;
  time?: string;
};

type CorrectionRequest = {
  id: number;
  request_status?: string;
  requestStatus?: string;
};

const navigation = [
  { label: "Dashboard", href: "/", icon: "▦" },
  { label: "Employees", href: "/employees", icon: "♙" },
  { label: "Data Quality", href: "/data-quality", icon: "◈" },
  { label: "Audit Logs", href: "/audit-logs", icon: "▤" },
  { label: "Account Approvals", href: "/hr/accounts", icon: "✓" },
  { label: "Correction Requests", href: "/hr/correction-requests", icon: "✎" },
];

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [correctionRequests, setCorrectionRequests] =
    useState<CorrectionRequest[]>([]);
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
          errors.push(employeeResult.message || "Could not load employees.");
        }

        if (auditResponse.ok && auditResult.success) {
          setAuditLogs(
            Array.isArray(auditResult.logs) ? auditResult.logs : []
          );
        } else {
          errors.push(auditResult.message || "Could not load audit logs.");
        }

        if (correctionResponse.ok && correctionResult.success) {
          setCorrectionRequests(
            Array.isArray(correctionResult.requests)
              ? correctionResult.requests
              : []
          );
        } else {
          errors.push(
            correctionResult.message || "Could not load correction requests."
          );
        }

        setDashboardError(errors.join(" "));
      } catch {
        if (!cancelled) {
          setDashboardError(
            "Unable to connect to the server. Please refresh the dashboard."
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

  const activeEmployees = employees.filter(
    (employee) => employee.status?.toLowerCase() === "active"
  ).length;

  const dataIssues = employees.filter((employee) => {
    if (
      !employee.name?.trim() ||
      !employee.department?.trim() ||
      !employee.email?.trim()
    ) {
      return true;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailPattern.test(employee.email);
  });

  const duplicateRecords = employees.filter((employee, index, array) =>
    array.some(
      (other, otherIndex) =>
        otherIndex !== index &&
        other.employeeId === employee.employeeId
    )
  );

  const pendingCorrections = correctionRequests.filter(
    (request) =>
      (request.request_status || request.requestStatus) === "PENDING"
  ).length;

  const healthyRecords = Math.max(0, employees.length - dataIssues.length);

  const qualityPercentage =
    employees.length > 0
      ? Math.round((healthyRecords / employees.length) * 100)
      : 0;

  function activityDate(log: AuditLog) {
    if (log.createdAt) {
      const date = new Date(log.createdAt);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
    }

    return log.date || "N/A";
  }

  function activityTime(log: AuditLog) {
    if (log.createdAt) {
      const date = new Date(log.createdAt);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }

    return log.time || "N/A";
  }

  const stats = [
    {
      title: "Total Employees",
      value: employees.length,
      icon: "♙",
      color: "bg-blue-50 text-blue-700",
      description: "Registered employee records",
    },
    {
      title: "Active Employees",
      value: activeEmployees,
      icon: "✓",
      color: "bg-emerald-50 text-emerald-700",
      description: "Currently active records",
    },
    {
      title: "Data Issues",
      value: dataIssues.length,
      icon: "!",
      color: "bg-amber-50 text-amber-700",
      description: "Records requiring attention",
    },
    {
      title: "Duplicate Records",
      value: duplicateRecords.length,
      icon: "↗",
      color: "bg-rose-50 text-rose-700",
      description: "Potential duplicate IDs",
    },
    {
      title: "Audit Events",
      value: auditLogs.length,
      icon: "▤",
      color: "bg-violet-50 text-violet-700",
      description: "Recorded system activities",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 lg:flex">
      {/* Sidebar */}
      <aside className="w-full shrink-0 bg-slate-950 text-white lg:min-h-screen lg:w-64">
        <div className="border-b border-slate-800 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold">
              H
            </div>
            <div>
              <h1 className="font-bold tracking-wide">HRMS</h1>
              <p className="text-xs text-slate-400">Data Quality System</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-6">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Main Menu
          </p>

          <nav className="space-y-2">
            {navigation.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                  index === 0
                    ? "bg-blue-600 font-semibold text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="w-5 text-center text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mx-4 mt-2 rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm font-semibold">System Status</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-300">
              Database connected
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            HRMS management environment
          </p>
        </div>

        <div className="mt-6 border-t border-slate-800 px-6 py-5">
          <p className="text-sm font-semibold">HR Administrator</p>
          <p className="mt-1 text-xs text-slate-400">System Management</p>
        </div>
      </aside>

      {/* Main content */}
      <section className="min-w-0 flex-1">
        {/* Top bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5 lg:px-9">
          <div>
            <p className="text-sm text-slate-500">
              Human Resource Management System
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Administration Portal
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                HR Administrator
              </p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              HR
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-7 px-5 py-8 lg:px-9">
          {/* Page heading */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-700">
                OVERVIEW
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Dashboard
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Monitor employee records, data quality and system activities.
              </p>
            </div>

            <Link
              href="/employees"
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              + Add Employee
            </Link>
          </div>

          {dashboardError && (
            <div
              role="alert"
              className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
            >
              {dashboardError}
            </div>
          )}

          {/* Statistics */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${stat.color}`}
                  >
                    {stat.icon}
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold text-slate-900">
                  {loading ? "..." : stat.value}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>

          {/* Data quality overview */}
          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Data Quality Overview
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Summary of employee information completeness.
                  </p>
                </div>
                <Link
                  href="/data-quality"
                  className="text-sm font-semibold text-blue-700 hover:underline"
                >
                  View Details →
                </Link>
              </div>

              <div className="mt-7 flex items-center gap-5">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[9px] border-blue-100">
                  <span className="text-xl font-bold text-blue-700">
                    {loading ? "..." : `${qualityPercentage}%`}
                  </span>
                </div>

                <div>
                  <p className="font-semibold text-slate-800">
                    Employee record quality
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {loading
                      ? "Calculating records..."
                      : `${healthyRecords} of ${employees.length} records have passed the basic completeness checks.`}
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-5">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-600">
                      Complete records
                    </span>
                    <span className="font-semibold text-emerald-700">
                      {loading ? "..." : healthyRecords}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${qualityPercentage}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-600">
                      Records requiring attention
                    </span>
                    <span className="font-semibold text-amber-700">
                      {loading ? "..." : dataIssues.length}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{
                        width: `${
                          employees.length
                            ? (dataIssues.length / employees.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <p className="mt-5 text-xs text-slate-400">
                Based on basic checks for employee name, department and email.
              </p>
            </section>

            {/* Quick actions */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                Quick Actions
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Common administration tasks.
              </p>

              <div className="mt-5 space-y-3">
                <Link
                  href="/employees"
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Employee Management
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Manage personnel records
                    </p>
                  </div>
                  <span className="text-lg text-blue-600">→</span>
                </Link>

                <Link
                  href="/hr/accounts"
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Account Approvals
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Review employee registrations
                    </p>
                  </div>
                  <span className="text-lg text-blue-600">→</span>
                </Link>

                <Link
                  href="/hr/correction-requests"
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Correction Requests
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {loading
                        ? "Loading..."
                        : `${pendingCorrections} pending requests`}
                    </p>
                  </div>
                  <span className="text-lg text-blue-600">→</span>
                </Link>
              </div>
            </section>
          </div>

          {/* Recent activity */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Recent System Activity
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Latest recorded employee management activities.
                </p>
              </div>

              <Link
                href="/audit-logs"
                className="text-sm font-semibold text-blue-700 hover:underline"
              >
                View All Activities →
              </Link>
            </div>

            {loading ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Loading system activities...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No recent activity to display.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">User</th>
                      <th className="px-6 py-4 font-semibold">Activity</th>
                      <th className="px-6 py-4 font-semibold">Record ID</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {auditLogs.slice(0, 5).map((log) => (
                      <tr
                        key={log.id}
                        className="border-t border-slate-100 transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-800">
                          {log.user || "Unknown user"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-700">
                          {log.action}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                          {log.record || "N/A"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                          {activityDate(log)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                          {activityTime(log)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <footer className="pb-4 text-center text-xs text-slate-400">
            HRMS Data Quality System · Human Resource Management System
          </footer>
        </div>
      </section>
    </main>
  );
}

