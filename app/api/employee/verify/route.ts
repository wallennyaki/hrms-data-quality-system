

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

const allowedFields = [
  "name",
  "department",
  "position",
  "email",
  "phone",
  "status",
] as const;

type CorrectionField = (typeof allowedFields)[number];

export async function POST(request: Request) {
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

    const body = await request.json();
    const action = body.action;
    const comment =
      typeof body.comment === "string" ? body.comment.trim() : "";

    if (action !== "CONFIRM" && action !== "CORRECTION_REQUESTED") {
      return NextResponse.json(
        { success: false, message: "Invalid verification action." },
        { status: 400 }
      );
    }

    const employeeId = session.employeeId;

    const [employees] = await pool.execute(
      `SELECT employee_id, name, department, position, email, phone, status
       FROM employees
       WHERE employee_id = ?
       LIMIT 1`,
      [employeeId]
    );

    const employeeRows = employees as Array<{
      employee_id: string;
      name: string;
      department: string | null;
      position: string | null;
      email: string | null;
      phone: string | null;
      status: string;
    }>;

    if (employeeRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Employee record not found." },
        { status: 404 }
      );
    }

    const employee = employeeRows[0];

    if (action === "CORRECTION_REQUESTED") {
      const fieldName = body.fieldName;
      const requestedValue =
        typeof body.requestedValue === "string"
          ? body.requestedValue.trim()
          : "";

      if (
        typeof fieldName !== "string" ||
        !allowedFields.includes(fieldName as CorrectionField)
      ) {
        return NextResponse.json(
          { success: false, message: "Please select a valid field to correct." },
          { status: 400 }
        );
      }

      if (!requestedValue) {
        return NextResponse.json(
          { success: false, message: "Enter the correct value you are requesting." },
          { status: 400 }
        );
      }

      if (!comment) {
        return NextResponse.json(
          { success: false, message: "Please explain the requested correction." },
          { status: 400 }
        );
      }

      const field = fieldName as CorrectionField;
      const currentValue = employee[field];

      if (
        String(currentValue ?? "").trim().toLowerCase() ===
        requestedValue.toLowerCase()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "The requested value matches the current value.",
          },
          { status: 400 }
        );
      }

      await pool.execute(
        `INSERT INTO employee_correction_requests
          (employee_id, field_name, current_value, requested_value,
           employee_comment, request_status)
         VALUES (?, ?, ?, ?, ?, 'PENDING')`,
        [
          employeeId,
          field,
          currentValue == null ? null : String(currentValue),
          requestedValue,
          comment,
        ]
      );

      await pool.execute(
        `INSERT INTO employee_verifications
          (employee_id, verification_status, employee_comment, reviewed_at)
         VALUES (?, 'CORRECTION_REQUESTED', ?, NULL)
         ON DUPLICATE KEY UPDATE
           verification_status = 'CORRECTION_REQUESTED',
           employee_comment = VALUES(employee_comment),
           reviewed_at = NULL`,
        [employeeId, comment]
      );

      await pool.execute(
        `INSERT INTO audit_logs (user_name, action, record_id)
         VALUES (?, ?, ?)`,
        [
          session.name || session.email || "Employee",
          `Correction Requested: ${field}`,
          employeeId,
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Your correction request has been submitted for HR review.",
        verificationStatus: "CORRECTION_REQUESTED",
      });
    }

    await pool.execute(
      `INSERT INTO employee_verifications
        (employee_id, verification_status, employee_comment, reviewed_at)
       VALUES (?, 'CONFIRMED', NULL, NULL)
       ON DUPLICATE KEY UPDATE
         verification_status = 'CONFIRMED',
         employee_comment = NULL,
         reviewed_at = NULL`,
      [employeeId]
    );

    await pool.execute(
      `INSERT INTO audit_logs (user_name, action, record_id)
       VALUES (?, ?, ?)`,
      [
        session.name || session.email || "Employee",
        "Employee Confirmed Details",
        employeeId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Your details have been confirmed successfully.",
      verificationStatus: "CONFIRMED",
    });
  } catch (error) {
    console.error("Employee verification failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to save your verification." },
      { status: 500 }
    );
  }
}
