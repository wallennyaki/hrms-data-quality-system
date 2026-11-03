
import { NextResponse } from "next/server";
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
    const [rows] = await pool.execute(
      `SELECT email, role, account_status AS accountStatus
       FROM user_accounts
       WHERE email = ?`,
      [session.email]
    );

    return NextResponse.json({ success: true, accounts: rows });
  } catch (error) {
    console.error("Account diagnostic failed:", error);

    return NextResponse.json(
      { success: false, message: "Could not check account status." },
      { status: 500 }
    );
  }
}
