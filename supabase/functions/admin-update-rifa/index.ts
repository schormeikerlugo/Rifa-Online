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

  const { id, titulo, descripcion, fecha_inicio, fecha_fin, imagen_url, imagenes_extra } = payload || {};
  if (!id) return json({ error: "Falta id" }, 400);

  const toUpdate: Record<string, any> = {};
  if (titulo !== undefined) toUpdate.titulo = titulo;
  if (descripcion !== undefined) toUpdate.descripcion = descripcion;
  if (fecha_inicio !== undefined) toUpdate.fecha_inicio = fecha_inicio;
  if (fecha_fin !== undefined) toUpdate.fecha_fin = fecha_fin;
  if (imagen_url !== undefined) toUpdate.imagen_url = imagen_url;
  if (imagenes_extra !== undefined) toUpdate.imagenes_extra = imagenes_extra;

  if (Object.keys(toUpdate).length === 0) {
    return json({ error: "Nada que actualizar" }, 400);
  }

  const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data, error } = await service.from("rifas").update(toUpdate).eq("id", id).select().single();

  if (error) return json({ error: error.message }, 400);
  return json({ message: "Rifa actualizada", rifa: data });
});