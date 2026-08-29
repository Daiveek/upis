import { NextResponse } from "next/server";
import { requestPassportReplacement } from "@/lib/repositories/upis-repository";
import { currentCitizen } from "@/lib/upis-session";

export async function POST() {
  try {
    const citizen = await currentCitizen();
    if (!citizen) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    const replacement = await requestPassportReplacement(citizen.id);
    if (!replacement) return NextResponse.json({ error: "Property Passport not found." }, { status: 404 });
    return NextResponse.json({ success: true, ...replacement });
  } catch {
    return NextResponse.json({ error: "We couldn’t process the replacement right now." }, { status: 503 });
  }
}
