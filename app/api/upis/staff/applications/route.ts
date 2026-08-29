import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/upis-staff-session";
import { staffApplicationList } from "@/lib/repositories/upis-repository";
export async function GET() { try { const staff = await currentStaff(); if (!staff) return NextResponse.json({ error: "Demo staff sign-in required." }, { status: 401 }); return NextResponse.json({ staff: { id: staff.id, role: staff.role }, applications: await staffApplicationList() }); } catch { return NextResponse.json({ error: "UPIS staff data is temporarily unavailable." }, { status: 503 }); } }
