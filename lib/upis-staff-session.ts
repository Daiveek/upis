import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export type StaffRole = "OFFICER" | "SUPERVISOR";
type Staff = { id: "KA-0472" | "SUP-019"; role: StaffRole };
const secret = () => process.env.UPIS_STAFF_SESSION_SECRET ?? "upis-fictional-demo-staff-session";
const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");
export function createStaffSession(staff: Staff) { const payload = `${staff.id}:${staff.role}`; return `${payload}.${sign(payload)}`; }
export async function currentStaff(): Promise<Staff | undefined> { const token = (await cookies()).get("upis_staff_session")?.value; if (!token) return; const [id, role, signature] = token.split(/[.:]/); if (!id || !role || !signature || !["KA-0472", "SUP-019"].includes(id) || !["OFFICER", "SUPERVISOR"].includes(role)) return; const expected = sign(`${id}:${role}`); if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return; return { id: id as Staff["id"], role: role as StaffRole }; }
