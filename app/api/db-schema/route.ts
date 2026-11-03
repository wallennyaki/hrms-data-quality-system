

import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [tables] = await pool.query("SHOW TABLES");

    const [employees] = await pool.query("DESCRIBE employees");
    const [auditLogs] = await pool.query("DESCRIBE audit_logs");
    const [verifications] = await pool.query(
      "DESCRIBE employee_verifications"
    );
    const [correctionRequests] = await pool.query(
      "DESCRIBE employee_correction_requests"
    );

    return NextResponse.json({
      success: true,
      tables,
      employeeColumns: employees,
      auditLogColumns: auditLogs,
      verificationColumns: verifications,
      correctionRequestColumns: correctionRequests,
    });
  } catch (error) {
    console.error("Schema check failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not inspect database schema.",
      },
      { status: 500 }
    );
  }
}
