// functions/admin-create-rifa/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type, apikey"
      }
    });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN
      }
    });
  }
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  try {
    const { titulo, descripcion, cantidadNumeros, fecha_inicio, fecha_fin, imagen_url, imagenes_extra } = await req.json();
    const { data: rifa, error } = await supabase.from("rifas").insert([
      {
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        imagen_url,
        imagenes_extra
      }
    ]).select().single();
    if (error) throw error;
    const numeros = Array.from({
      length: cantidadNumeros
    }, (_, i)=>({
        numero: i + 1,
        estado: "disponible",
        rifa_id: rifa.id
      }));
    await supabase.from("numeros").insert(numeros);
    return new Response(JSON.stringify({
      success: true,
      rifa
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN
      }
    });
  }
});