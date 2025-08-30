import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
serve(async (req)=>{
  try {
    const { rifa_id, numero_id, titulo, mensaje, usuario_id } = await req.json();
    if (!rifa_id || !numero_id || !titulo || !mensaje) {
      return new Response(JSON.stringify({
        error: "Faltan campos obligatorios"
      }), {
        status: 400
      });
    }
    const { error } = await supabase.from("notificaciones").insert([
      {
        rifa_id,
        numero_id,
        titulo,
        mensaje,
        leido: false,
        created_at: new Date().toISOString()
      }
    ]);
    if (error) {
      console.error("❌ Error al crear notificación:", error.message);
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500
      });
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Notificación creada correctamente"
    }), {
      status: 200
    });
  } catch (err) {
    console.error("❌ Error en admin-send-notificacion:", err);
    return new Response(JSON.stringify({
      error: "Error interno",
      details: err.message
    }), {
      status: 500
    });
  }
});
