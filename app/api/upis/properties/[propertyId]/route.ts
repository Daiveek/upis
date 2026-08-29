import { NextResponse } from "next/server";
import { currentCitizen } from "@/lib/upis-session";
import { applicationForCitizen } from "@/lib/repositories/upis-repository";
export async function GET(_: Request, { params }: { params: Promise<{ propertyId: string }> }) { try { const citizen = await currentCitizen(); if (!citizen) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 }); const data = await applicationForCitizen(citizen.id, (await params).propertyId); if (!data) return NextResponse.json({ error: "Property not found." }, { status: 404 }); return NextResponse.json(data); } catch { return NextResponse.json({ error: "UPIS data is temporarily unavailable." }, { status: 503 }); } }
