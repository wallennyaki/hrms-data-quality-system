
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        employee_id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        department VARCHAR(100) DEFAULT NULL,
        position VARCHAR(100) DEFAULT NULL,
        email VARCHAR(255) DEFAULT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_name VARCHAR(150) NOT NULL DEFAULT 'HR Administrator',
        action VARCHAR(100) NOT NULL,
        record_id VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    return NextResponse.json({
      success: true,
      message: "Employees and audit_logs tables are ready.",
    });
  } catch (error) {
    console.error("Database setup failed:", error);

    return NextResponse.json(
      { success: false, message: "Database setup failed. Check the VS Code terminal." },
      { status: 500 }
    );
  }
}
