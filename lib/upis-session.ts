import { cookies } from "next/headers";
import { citizenForSession } from "@/lib/repositories/upis-repository";
export async function currentCitizen() { return citizenForSession((await cookies()).get("upis_session")?.value); }
