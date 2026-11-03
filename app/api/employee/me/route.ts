

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    if (session.role !== "EMPLOYEE") {
      return NextResponse.json(
        { success: false, message: "Employee access only." },
        { status: 403 }
      );
    }

    if (!session.employeeId) {
      return NextResponse.json(
        { success: false, message: "Employee ID is missing." },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      `SELECT
        employee_id AS employeeId,
        name,
        department,
        position,
        email,
        phone,
        status
       FROM employees
       WHERE employee_id = ?
       LIMIT 1`,
      [session.employeeId]
    );

    const employees = rows as Array<{
      employeeId: string;
      name: string;
      department: string | null;
      position: string | null;
      email: string | null;
      phone: string | null;
      status: string | null;
    }>;

    if (employees.length === 0) {
      return NextResponse.json(
        { success: false, message: "Employee record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      employee: employees[0],
    });
  } catch (error) {
    console.error("Employee profile error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load employee details." },
      { status: 500 }
    );
  }
}
