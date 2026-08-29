import { NextResponse } from "next/server";
import { approveApplication } from "@/lib/repositories/upis-repository";
import { currentStaff } from "@/lib/upis-staff-session";

export async function POST(_: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  const staff = await currentStaff();
  if (!staff) return NextResponse.json({ error: "Demo staff sign-in required." }, { status: 401 });
  if (staff.role !== "SUPERVISOR" || staff.id !== "SUP-019") {
    return NextResponse.json({ error: "Only a demo supervisor can approve an application." }, { status: 403 });
  }

  try {
    const result = await approveApplication((await params).applicationId);
    if (result.kind === "missing") return NextResponse.json({ error: "Application not found." }, { status: 404 });
    if (result.kind === "incomplete") {
      return NextResponse.json({
        error: "Officer verification is incomplete.",
        code: "OFFICER_VERIFICATION_INCOMPLETE",
        missingActions: result.missingActions,
      }, { status: 409 });
    }
    return NextResponse.json({
      success: true,
      alreadyApproved: result.alreadyApproved,
      applicationId: result.applicationId,
      applicationStatus: result.applicationStatus,
      verificationStatus: result.verificationStatus,
      approvalEvent: result.approvalEvent,
    });
  } catch {
    return NextResponse.json({ error: "We couldn’t complete approval right now." }, { status: 503 });
  }
}
