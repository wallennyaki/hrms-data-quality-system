
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        user_name AS user,
        action,
        record_id AS record,
        created_at AS createdAt
      FROM audit_logs
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      success: true,
      logs: rows,
    });
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load audit logs from the database.",
      },
      { status: 500 }
    );
  }
}
