type QueryOptions = { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown; prefer?: string };

export class SupabaseRequestError extends Error {
  constructor(table: string, status: number, details: string) {
    super(`Supabase ${table} request failed with HTTP ${status}: ${details}`);
    this.name = "SupabaseRequestError";
  }
}

/** Server-only Supabase REST adapter. Domain services call this module, never the browser. */
export async function supabaseQuery<T>(table: string, path = "", options: QueryOptions = {}): Promise<T> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("UPIS database is not configured.");
  const response = await fetch(`${url}/rest/v1/${table}${path}`, {
    method: options.method ?? "GET",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: options.prefer ?? "return=representation" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });
  if (!response.ok) {
    const details = await response.text();
    throw new SupabaseRequestError(table, response.status, details);
  }
  return response.json() as Promise<T>;
}
