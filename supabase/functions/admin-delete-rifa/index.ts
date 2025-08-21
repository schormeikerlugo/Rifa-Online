// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL")!;

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

async function ensureAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data.user || data.user.email !== ADMIN_EMAIL) {
    return { ok: false as const };
  }
  return { ok: true as const };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const admin = await ensureAdmin(req);
  if (!admin.ok) return json({ error: "Unauthorized" }, 401);

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { id } = payload || {};
  if (!id) return json({ error: "Falta id" }, 400);

  const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // 1) Borrar números de la rifa
  const { error: errNums } = await service.from("numeros").delete().eq("rifa_id", id);
  if (errNums) return json({ error: `Error borrando números: ${errNums.message}` }, 400);

  // 2) Borrar rifa
  const { error: errRifa } = await service.from("rifas").delete().eq("id", id);
  if (errRifa) return json({ error: `Error borrando rifa: ${errRifa.message}` }, 400);

  return json({ message: "Rifa eliminada" });
});