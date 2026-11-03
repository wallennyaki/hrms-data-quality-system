
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT
        employee_id AS employeeId,
        name,
        department,
        position,
        email,
        phone,
        status
       FROM employees
       ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      employees: rows,
    });
  } catch (error) {
    console.error("Fetching employees failed:", error);

    return NextResponse.json(
      { success: false, message: "Could not fetch employees." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const employeeId = String(body.employeeId ?? "").trim();
    const name = String(body.name ?? "").trim();
    const department =
      String(body.department ?? "").trim() || null;
    const position = String(body.position ?? "").trim() || null;
    const email = String(body.email ?? "").trim() || null;
    const phone = String(body.phone ?? "").trim() || null;
    const status =
      String(body.status ?? "Active").trim() || "Active";

    if (!employeeId || !name) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee ID and name are required.",
        },
        { status: 400 }
      );
    }

    await pool.execute(
      `INSERT INTO employees
        (employee_id, name, department, position, email, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employeeId, name, department, position, email, phone, status]
    );

    await pool.execute(
      `INSERT INTO audit_logs (action, record_id)
       VALUES (?, ?)`,
      ["Employee Added", employeeId]
    );

    return NextResponse.json(
      { success: true, message: "Employee added successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Adding employee failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not add employee. Check whether the ID already exists.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const employeeId = String(body.employeeId ?? "").trim();
    const name = String(body.name ?? "").trim();
    const department =
      String(body.department ?? "").trim() || null;
    const position = String(body.position ?? "").trim() || null;
    const email = String(body.email ?? "").trim() || null;
    const phone = String(body.phone ?? "").trim() || null;
    const status =
      String(body.status ?? "Active").trim() || "Active";

    if (!employeeId || !name) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee ID and name are required.",
        },
        { status: 400 }
      );
    }

    const [existing] = await pool.execute(
      "SELECT employee_id FROM employees WHERE employee_id = ?",
      [employeeId]
    );

    if ((existing as unknown[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "Employee not found." },
        { status: 404 }
      );
    }

    await pool.execute(
      `UPDATE employees
       SET name = ?, department = ?, position = ?,
           email = ?, phone = ?, status = ?
       WHERE employee_id = ?`,
      [
        name,
        department,
        position,
        email,
        phone,
        status,
        employeeId,
      ]
    );

    await pool.execute(
      `INSERT INTO audit_logs (action, record_id)
       VALUES (?, ?)`,
      ["Employee Updated", employeeId]
    );

    return NextResponse.json({
      success: true,
      message: "Employee updated successfully.",
    });
  } catch (error) {
    console.error("Updating employee failed:", error);

    return NextResponse.json(
      { success: false, message: "Could not update employee." },
      { status: 500 }
    );
  }
}

