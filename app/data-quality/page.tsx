"use client";

import { useState } from "react";
import Link from "next/link";

type Employee = {
  employeeId: string;
  name: string;
  department: string;
  email: string;
  status: string;
};

export default function DataQualityPage() {
  const [employees] = useState<Employee[]>(() => {
    if (typeof window !== "undefined") {
      const savedEmployees = localStorage.getItem("hrms-employees");

      if (savedEmployees) {
        return JSON.parse(savedEmployees);
      }
    }

    return [
      {
        employeeId: "EMP001",
        name: "John Kamau",
        department: "Finance",
        email: "john.kamau@example.com",
        status: "Active",
      },
      {
        employeeId: "EMP002",
        name: "Mary Wanjiku",
        department: "Human Resources",
        email: "mary.wanjiku@example.com",
        status: "Active",
      },
    ];
  });

  function getQualityStatus(employee: Employee) {
    const duplicateCount = employees.filter(
      (item) => item.employeeId === employee.employeeId
    ).length;

    if (!employee.department || !employee.email) {
      return "Missing Information";
    }

    if (duplicateCount > 1) {
      return "Duplicate ID";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(employee.email)) {
      return "Invalid Email";
    }

    return "Valid";
  }

  const qualityRecords = employees.map((employee) => ({
    ...employee,
    qualityStatus: getQualityStatus(employee),
  }));

  const validRecords = qualityRecords.filter(
    (employee) => employee.qualityStatus === "Valid"
  ).length;

  const issues = qualityRecords.length - validRecords;

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              HRMS Data Quality System
            </h1>

            <p className="text-sm text-slate-500">
              Data Quality Monitoring
            </p>
          </div>

          <nav className="flex gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Dashboard
            </Link>

            <Link
              href="/employees"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Employees
            </Link>

            <Link
              href="/data-quality"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Data Quality
            </Link>

            <Link
              href="/audit-logs"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Audit Logs
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Data Quality Monitoring
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Identify missing, duplicate and invalid employee information.
          </p>
        </div>

        {/* Summary */}
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Records
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {qualityRecords.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Valid Records
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {validRecords}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Records With Issues
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {issues}
            </p>
          </div>
        </div>

        {/* Quality table */}
        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Data Quality Issues
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Review employee records requiring attention.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4">
                    Employee ID
                  </th>

                  <th className="px-6 py-4">
                    Employee Name
                  </th>

                  <th className="px-6 py-4">
                    Department
                  </th>

                  <th className="px-6 py-4">
                    Email
                  </th>

                  <th className="px-6 py-4">
                    Quality Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {qualityRecords.map((employee, index) => (
                  <tr
                    key={`${employee.employeeId}-${index}`}
                    className="border-t"
                  >
                    <td className="px-6 py-4 font-medium">
                      {employee.employeeId}
                    </td>

                    <td className="px-6 py-4">
                      {employee.name}
                    </td>

                    <td className="px-6 py-4">
                      {employee.department || "Missing"}
                    </td>

                    <td className="px-6 py-4">
                      {employee.email}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                        {employee.qualityStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Quality Checks
          </h3>

          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>• Missing employee information</li>
            <li>• Duplicate employee identification numbers</li>
            <li>• Invalid email addresses</li>
            <li>• Incomplete employee records</li>
          </ul>
        </div>
      </div>
    </main>
  );
}