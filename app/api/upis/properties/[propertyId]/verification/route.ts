import { NextResponse } from "next/server";
import { currentCitizen } from "@/lib/upis-session";
import { simulateVerification } from "@/lib/repositories/upis-repository";
export async function POST(_: Request, { params }: { params: Promise<{ propertyId: string }> }) { try { const citizen = await currentCitizen(); if (!citizen) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 }); const result = await simulateVerification(citizen.id, (await params).propertyId); if (!result) return NextResponse.json({ error: "Property not found." }, { status: 404 }); return NextResponse.json(result); } catch { return NextResponse.json({ error: "We couldn’t complete verification right now." }, { status: 503 }); } }
