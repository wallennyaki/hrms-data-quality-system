
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Employee = {
  employeeId: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  status: string;
};

const emptyForm: Employee = {
  employeeId: "",
  name: "",
  department: "",
  position: "",
  email: "",
  phone: "",
  status: "Active",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEmployeeId, setEditingEmployeeId] =
    useState<string | null>(null);
  const [form, setForm] = useState<Employee>(emptyForm);

  async function loadEmployees() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/employees");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load employees.");
      }

      setEmployees(data.employees);
    } catch (error) {
      console.error("Loading employees failed:", error);
      setError("Could not load employees from the database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  let cancelled = false;

  async function fetchEmployees() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/employees");

      if (!response.ok) {
        throw new Error("Failed to load employees from the database.");
      }

      const data = await response.json();

      if (!cancelled) {
        setEmployees(data.employees ?? []);
      }
    } catch (err) {
      if (!cancelled) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading employees."
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void fetchEmployees();

  return () => {
    cancelled = true;
  };
}, []);
  const filteredEmployees = employees.filter((employee) =>
    `${employee.employeeId} ${employee.name} ${employee.department} ${employee.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const isEditing = editingEmployeeId !== null;

      const response = await fetch("/api/employees", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          employeeId: isEditing ? editingEmployeeId : form.employeeId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            (isEditing
              ? "Failed to update employee."
              : "Failed to add employee.")
        );
      }

      setMessage(
        isEditing
          ? "Employee updated successfully."
          : "Employee added successfully."
      );

      setForm(emptyForm);
      setEditingEmployeeId(null);
      setShowForm(false);

      await loadEmployees();
    } catch (error) {
      console.error("Saving employee failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Could not save employee."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(employee: Employee) {
    setForm({ ...employee });
    setEditingEmployeeId(employee.employeeId);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function handleAddEmployee() {
    setForm(emptyForm);
    setEditingEmployeeId(null);
    setError("");
    setMessage("");
    setShowForm((previous) => !previous);
  }

  function handleCancel() {
    setForm(emptyForm);
    setEditingEmployeeId(null);
    setShowForm(false);
    setError("");
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              HRMS Data Quality System
            </h1>
            <p className="text-sm text-slate-500">
              Employee Management
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Dashboard
            </Link>

            <Link
              href="/employees"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Employees
            </Link>

            <Link
              href="/data-quality"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
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
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Employee Management
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              View and manage employee records.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddEmployee}
            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            + Add Employee
          </button>
        </div>

        {message && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
            <button
              type="button"
              onClick={() => void loadEmployees()}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 rounded-xl bg-white p-6 shadow-sm"
          >
            <h3 className="mb-5 text-xl font-semibold text-slate-900">
              {editingEmployeeId
                ? "Edit Employee"
                : "Add New Employee"}
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                placeholder="Employee ID"
                required
                disabled={editingEmployeeId !== null}
                className="rounded-lg border p-3 disabled:bg-slate-100 disabled:text-slate-500"
              />

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="rounded-lg border p-3"
              />

              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Department"
                required
                className="rounded-lg border p-3"
              />

              <input
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="Position"
                required
                className="rounded-lg border p-3"
              />

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="rounded-lg border p-3"
              />

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                required
                className="rounded-lg border p-3"
              />

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="rounded-lg border p-3"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingEmployeeId
                    ? "Update Employee"
                    : "Save Employee"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-lg border px-6 py-3 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by Employee ID, name, department or email..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Loading employees...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    {searchTerm
                      ? "No matching employees found."
                      : "No employee records found. Click Add Employee to create one."}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr
                    key={employee.employeeId}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      {employee.employeeId}
                    </td>
                    <td className="px-6 py-4">{employee.name}</td>
                    <td className="px-6 py-4">
                      {employee.department || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {employee.position || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {employee.email || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {employee.phone || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {employee.status}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleEdit(employee)}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
