import { NextResponse } from "next/server";
import { currentCitizen } from "@/lib/upis-session";
import { dashboardForCitizen } from "@/lib/repositories/upis-repository";
export async function GET() { try { const citizen = await currentCitizen(); if (!citizen) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 }); return NextResponse.json(await dashboardForCitizen(citizen.id)); } catch { return NextResponse.json({ error: "UPIS data is temporarily unavailable." }, { status: 503 }); } }
