
import { cookies } from "next/headers";
import { jwtVerify, type JWTPayload } from "jose";

export type HRMSSession = JWTPayload & {
  role: "HR" | "EMPLOYEE";
  employeeId: string | null;
  email: string;
  name: string;
};

export async function getSession(): Promise<HRMSSession | null> {
  const secretValue = process.env.AUTH_SECRET;

  if (!secretValue) {
    throw new Error("AUTH_SECRET is missing.");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("hrms_session")?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(secretValue);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      (payload.role !== "HR" && payload.role !== "EMPLOYEE") ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }

    return payload as HRMSSession;
  } catch {
    return null;
  }
}
