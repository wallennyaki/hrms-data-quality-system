
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== "HR") {
    return NextResponse.json(
      { success: false, message: "HR administrator access required." },
      { status: 403 }
    );
  }

  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        employee_id AS employeeId,
        full_name AS fullName,
        email,
        account_status AS accountStatus,
        created_at AS createdAt
      FROM user_accounts
      WHERE account_status = 'PENDING'
        AND role = 'EMPLOYEE'
      ORDER BY created_at ASC
    `);

    return NextResponse.json({ success: true, accounts: rows });
  } catch (error) {
    console.error("Loading pending accounts failed:", error);

    return NextResponse.json(
      { success: false, message: "Could not load pending accounts." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== "HR") {
    return NextResponse.json(
      { success: false, message: "HR administrator access required." },
      { status: 403 }
    );
  }

  let body: { id?: number; decision?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const id = Number(body.id);
  const decision = body.decision;

  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json(
      { success: false, message: "A valid account ID is required." },
      { status: 400 }
    );
  }

  if (decision !== "APPROVED" && decision !== "REJECTED") {
    return NextResponse.json(
      { success: false, message: "Decision must be APPROVED or REJECTED." },
      { status: 400 }
    );
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `UPDATE user_accounts
       SET account_status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND role = 'EMPLOYEE' AND account_status = 'PENDING'`,
      [decision, id]
    );

    const updateResult = result as { affectedRows: number };

    if (updateResult.affectedRows !== 1) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Account not found or it has already been reviewed.",
        },
        { status: 409 }
      );
    }

    const [accountRows] = await connection.execute(
      `SELECT employee_id AS employeeId, full_name AS fullName
       FROM user_accounts WHERE id = ?`,
      [id]
    );

    const accounts = accountRows as {
      employeeId: string | null;
      fullName: string;
    }[];

    const account = accounts[0];

    if (account?.employeeId) {
      await connection.execute(
        `INSERT INTO audit_logs (user_name, action, record_id)
         VALUES (?, ?, ?)`,
        [
          session.name,
          decision === "APPROVED" ? "Account Approved" : "Account Rejected",
          account.employeeId,
        ]
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message:
        decision === "APPROVED"
          ? "Employee account approved successfully."
          : "Employee account rejected successfully.",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Reviewing employee account failed:", error);

    return NextResponse.json(
      { success: false, message: "Could not review the account." },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

