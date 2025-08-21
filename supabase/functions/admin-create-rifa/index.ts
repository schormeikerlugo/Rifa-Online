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
    return { ok: false as const, reason: "UNAUTHORIZED" as const };
  }
  return { ok: true as const };
}

Deno.serve(async (req) => {
  // CORS preflight
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

  const {
    titulo,
    descripcion,
    fecha_inicio,
    fecha_fin,
    imagen_url,
    imagenes_extra = [],
    cantidad_numeros,
  } = payload || {};

  if (
    !titulo || !descripcion || !fecha_inicio || !fecha_fin ||
    !cantidad_numeros || typeof cantidad_numeros !== "number"
  ) {
    return json({ error: "Faltan campos obligatorios" }, 400);
  }

  const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // 1) Crear rifa
  const { data: rifa, error: errRifa } = await service
    .from("rifas")
    .insert([
      {
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        imagen_url: imagen_url ?? null,
        imagenes_extra: Array.isArray(imagenes_extra) ? imagenes_extra : [],
      },
    ])
    .select()
    .single();

  if (errRifa || !rifa) {
    return json({ error: errRifa?.message || "No se pudo crear la rifa" }, 400);
  }

  // 2) Generar números en lotes
  const total = cantidad_numeros;
  const batch = 1000;

  for (let start = 1; start <= total; start += batch) {
    const end = Math.min(start + batch - 1, total);
    const rows = Array.from({ length: end - start + 1 }, (_, i) => ({
      numero: start + i,
      estado: "disponible",
      rifa_id: rifa.id,
    }));
    const { error: errNums } = await service.from("numeros").insert(rows);
    if (errNums) {
      return json({ error: `Error generando números: ${errNums.message}` }, 400);
    }
  }

  return json({ message: "Rifa creada", rifa_id: rifa.id });
});