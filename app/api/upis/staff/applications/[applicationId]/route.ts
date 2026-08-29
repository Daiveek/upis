import { NextResponse } from "next/server";
import { staffApplicationDetail } from "@/lib/repositories/upis-repository";
import { currentStaff } from "@/lib/upis-staff-session";

export async function GET(_: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  const staff = await currentStaff();
  if (!staff) return NextResponse.json({ error: "Demo staff sign-in required." }, { status: 401 });

  try {
    const application = await staffApplicationDetail((await params).applicationId);
    if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });
    return NextResponse.json({ application });
  } catch {
    return NextResponse.json({ error: "UPIS staff data is temporarily unavailable." }, { status: 503 });
  }
}
