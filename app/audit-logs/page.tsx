"use client";

import { useState } from "react";
import Link from "next/link";

type AuditLog = {
  id: number;
  user: string;
  action: string;
  record: string;
  date: string;
  time: string;
};

export default function AuditLogsPage() {
  const [logs] = useState<AuditLog[]>(() => {
  if (typeof window !== "undefined") {
    const savedLogs = localStorage.getItem("hrms-audit-logs");

    if (savedLogs) {
      return JSON.parse(savedLogs);
    }
  }

  return [];
});
  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              HRMS Data Quality System
            </h1>
            <p className="text-sm text-slate-500">Audit Logs</p>
          </div>

          <nav className="flex gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Dashboard
            </Link>

            <Link
              href="/employees"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Employees
            </Link>

            <Link
              href="/data-quality"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Data Quality
            </Link>

            <Link
              href="/audit-logs"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Audit Logs
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Audit Logs
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Track activities performed within the HRMS Data Quality System.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  User
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Action
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Record
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Date
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Time
                </th>
              </tr>
            </thead>

            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="border-t">
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {log.user}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {log.action}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {log.record}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {log.date}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {log.time}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No audit activities have been recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}