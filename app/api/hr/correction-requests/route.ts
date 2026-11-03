
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

type CorrectionRequest = {
  id: number;
  employee_id: string;
  field_name: string;
  current_value: string | null;
  requested_value: string;
  employee_comment: string | null;
  request_status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: Date | string;
  employee_name: string | null;
};

async function requireHR() {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      response: NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "HR") {
    return {
      session: null,
      response: NextResponse.json(
        { success: false, message: "HR access only." },
        { status: 403 }
      ),
    };
  }

  return { session, response: null };
}

export async function GET() {
  try {
    const auth = await requireHR();

    if (auth.response) return auth.response;

    const [rows] = await pool.execute(
      `SELECT
         r.id,
         r.employee_id,
         r.field_name,
         r.current_value,
         r.requested_value,
         r.employee_comment,
         r.request_status,
         r.created_at,
         e.name AS employee_name
       FROM employee_correction_requests r
       LEFT JOIN employees e ON e.employee_id = r.employee_id
       ORDER BY
         CASE WHEN r.request_status = 'PENDING' THEN 0 ELSE 1 END,
         r.created_at DESC`
    );

    return NextResponse.json({
      success: true,
      requests: rows as CorrectionRequest[],
    });
  } catch (error) {
    console.error("Loading correction requests failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load correction requests." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  let connection;

  try {
    const auth = await requireHR();

    if (auth.response) return auth.response;

    const body = await request.json();
    const id = Number(body.id);
    const decision = body.decision;

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "A valid request ID is required." },
        { status: 400 }
      );
    }

    if (decision !== "APPROVED" && decision !== "REJECTED") {
      return NextResponse.json(
        { success: false, message: "Choose approve or reject." },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT id, employee_id, field_name, requested_value, request_status
       FROM employee_correction_requests
       WHERE id = ?
       FOR UPDATE`,
      [id]
    );

    const requests = rows as Array<{
      id: number;
      employee_id: string;
      field_name: string;
      requested_value: string;
      request_status: string;
    }>;

    if (requests.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { success: false, message: "Correction request not found." },
        { status: 404 }
      );
    }

    const correction = requests[0];

    if (correction.request_status !== "PENDING") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "This request has already been reviewed.",
        },
        { status: 409 }
      );
    }

    if (decision === "APPROVED") {
      if (
        !allowedFields.includes(correction.field_name as CorrectionField)
      ) {
        await connection.rollback();

        return NextResponse.json(
          { success: false, message: "The requested field is not allowed." },
          { status: 400 }
        );
      }

      const field = correction.field_name as CorrectionField;

      const [updateResult] = await connection.execute(
        `UPDATE employees SET \`${field}\` = ? WHERE employee_id = ?`,
        [correction.requested_value, correction.employee_id]
      );

      const resultInfo = updateResult as { affectedRows: number };

      if (resultInfo.affectedRows === 0) {
        await connection.rollback();

        return NextResponse.json(
          { success: false, message: "Employee record could not be updated." },
          { status: 404 }
        );
      }
    }

    await connection.execute(
      `UPDATE employee_correction_requests
       SET request_status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        decision,
        auth.session?.name || auth.session?.email || "HR Administrator",
        id,
      ]
    );

    await connection.execute(
      `INSERT INTO audit_logs (user_name, action, record_id)
       VALUES (?, ?, ?)`,
      [
        auth.session?.name || auth.session?.email || "HR Administrator",
        decision === "APPROVED"
          ? `Correction Request #${id} Approved`
          : `Correction Request #${id} Rejected`,
        correction.employee_id,
      ]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      message:
        decision === "APPROVED"
          ? "Correction approved. The employee record has been updated."
          : "Correction request rejected. The employee record was not changed.",
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {
        // Ignore rollback errors.
      }
    }

    console.error("Reviewing correction request failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to review the correction request." },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}
