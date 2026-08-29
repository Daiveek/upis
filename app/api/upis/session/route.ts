import { NextResponse } from "next/server";
export async function DELETE() { const response = NextResponse.json({ ok: true }); response.cookies.set("upis_session", "", { httpOnly: true, path: "/", maxAge: 0 }); return response; }
