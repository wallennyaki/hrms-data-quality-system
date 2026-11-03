
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Enter your email and password." },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      `SELECT id, employee_id AS employeeId, full_name AS fullName,
              email, password_hash AS passwordHash,
              role, account_status AS accountStatus
       FROM user_accounts
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    const accounts = rows as {
      id: number;
      employeeId: string | null;
      fullName: string;
      email: string;
      passwordHash: string;
      role: "HR" | "EMPLOYEE";
      accountStatus: "PENDING" | "APPROVED" | "REJECTED";
    }[];

    const account = accounts[0];

    // Use a generic message so the API does not reveal which emails exist.
    if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (account.accountStatus !== "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          message:
            account.accountStatus === "PENDING"
              ? "Your account is awaiting HR approval."
              : "Your account has not been approved. Please contact HR.",
        },
        { status: 403 }
      );
    }

    const secretValue = process.env.AUTH_SECRET;

    if (!secretValue) {
      throw new Error("AUTH_SECRET is missing from .env.local");
    }

    const secret = new TextEncoder().encode(secretValue);

    const token = await new SignJWT({
      role: account.role,
      employeeId: account.employeeId,
      email: account.email,
      name: account.fullName,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(account.id))
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(secret);

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        name: account.fullName,
        email: account.email,
        role: account.role,
      },
    });

    response.cookies.set("hrms_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to sign in. Please try again." },
      { status: 500 }
    );
  }
}
