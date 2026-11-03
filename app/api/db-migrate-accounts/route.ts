
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_accounts (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(50) DEFAULT NULL,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('HR', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
        account_status ENUM('PENDING', 'APPROVED', 'REJECTED')
          NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_user_accounts_employee
          FOREIGN KEY (employee_id)
          REFERENCES employees(employee_id)
          ON DELETE SET NULL
          ON UPDATE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS employee_verifications (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(50) NOT NULL,
        verification_status ENUM(
          'PENDING',
          'CONFIRMED',
          'CORRECTION_REQUESTED'
        ) NOT NULL DEFAULT 'PENDING',
        employee_comment TEXT DEFAULT NULL,
        reviewed_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_employee_verification (employee_id),
        CONSTRAINT fk_verification_employee
          FOREIGN KEY (employee_id)
          REFERENCES employees(employee_id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS employee_correction_requests (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(50) NOT NULL,
        field_name VARCHAR(100) NOT NULL,
        current_value TEXT DEFAULT NULL,
        requested_value TEXT NOT NULL,
        employee_comment TEXT DEFAULT NULL,
        request_status ENUM(
          'PENDING',
          'APPROVED',
          'REJECTED'
        ) NOT NULL DEFAULT 'PENDING',
        reviewed_by VARCHAR(150) DEFAULT NULL,
        reviewed_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_correction_employee
          FOREIGN KEY (employee_id)
          REFERENCES employees(employee_id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      )
    `);

    return NextResponse.json({
      success: true,
      message: "Account and employee verification tables are ready.",
      tablesCreated: [
        "user_accounts",
        "employee_verifications",
        "employee_correction_requests",
      ],
    });
  } catch (error) {
    console.error("Account migration failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Account migration failed. Check the VS Code terminal for details.",
      },
      { status: 500 }
    );
    
  }
}
