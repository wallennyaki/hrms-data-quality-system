
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const employeeId =
      typeof body.employeeId === "string"
        ? body.employeeId.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!employeeId || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Your password must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    if (password.length > 72) {
      return NextResponse.json(
        {
          success: false,
          message: "Your password must not exceed 72 characters.",
        },
        { status: 400 }
      );
    }

    const [employeeRows] = await pool.execute(
      `SELECT employee_id, name, email
       FROM employees
       WHERE employee_id = ?
       LIMIT 1`,
      [employeeId]
    );

    const employees = employeeRows as {
      employee_id: string;
      name: string;
      email: string | null;
    }[];

    const employee = employees[0];

    if (!employee || !employee.email ||
        employee.email.trim().toLowerCase() !== email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "We could not match that employee ID and email to an employee record. Please contact HR.",
        },
        { status: 400 }
      );
    }

    const [existingRows] = await pool.execute(
      `SELECT id FROM user_accounts
       WHERE email = ? OR employee_id = ?
       LIMIT 1`,
      [email, employeeId]
    );

    if ((existingRows as unknown[]).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account already exists for this email or employee ID. Please contact HR.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.execute(
      `INSERT INTO user_accounts
       (employee_id, full_name, email, password_hash, role, account_status)
       VALUES (?, ?, ?, ?, 'EMPLOYEE', 'PENDING')`,
      [employee.employee_id, employee.name, email, passwordHash]
    );

    await pool.execute(
      `INSERT INTO employee_verifications
       (employee_id, verification_status)
       VALUES (?, 'PENDING')
       ON DUPLICATE KEY UPDATE
       verification_status = 'PENDING',
       employee_comment = NULL,
       reviewed_at = NULL`,
      [employee.employee_id]
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Registration submitted. Your account is awaiting HR approval.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Registration could not be completed. Please try again.",
      },
      { status: 500 }
    );
  }
}
