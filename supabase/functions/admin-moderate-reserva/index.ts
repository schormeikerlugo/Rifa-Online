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
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    const { numeroId, nuevoEstado } = await req.json();
    if (!numeroId || !nuevoEstado) {
      return new Response(JSON.stringify({
        error: "Datos incompletos"
      }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Content-Type": "application/json"
        }
      });
    }
    const estadosValidos = [
      "pendiente",
      "confirmado",
      "disponible"
    ];
    if (!estadosValidos.includes(nuevoEstado)) {
      return new Response(JSON.stringify({
        error: "Estado no válido"
      }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Content-Type": "application/json"
        }
      });
    }
    const { error } = await supabase.from("numeros").update({
      estado: nuevoEstado
    }).eq("id", numeroId);
    if (error) throw error;
    return new Response(JSON.stringify({
      success: true,
      numeroId,
      nuevoEstado
    }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Content-Type": "application/json"
      }
    });
  }
});
