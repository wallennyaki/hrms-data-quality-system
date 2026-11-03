

import mysql from "mysql2/promise";
import fs from "node:fs";
import path from "node:path";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing.");
}

const database = new URL(databaseUrl);

// Use the certificate environment variable in deployment.
// If it is not provided, use the local certificate file.
const caCertificate =
  process.env.AIVEN_CA_CERT ||
  fs.readFileSync(
    path.join(process.cwd(), "certs", "ca.pem"),
    "utf8"
  );

const pool = mysql.createPool({
  host: database.hostname,
  port: Number(database.port || 3306),
  user: decodeURIComponent(database.username),
  password: decodeURIComponent(database.password),
  database: decodeURIComponent(database.pathname.slice(1)),
  ssl: {
    ca: caCertificate,
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
