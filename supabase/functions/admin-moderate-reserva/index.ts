// supabase/functions/admin-moderate-reserva/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
serve(async (req)=>{
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    const { numeroId, nuevoEstado } = await req.json();
    if (!numeroId || !nuevoEstado) {
      return new Response(JSON.stringify({
        error: "Datos incompletos"
      }), {
        status: 400
      });
    }
    // 🔎 Validar estados permitidos
    const estadosValidos = [
      "pendiente",
      "aprobado",
      "rechazado"
    ];
    if (!estadosValidos.includes(nuevoEstado)) {
      return new Response(JSON.stringify({
        error: "Estado no válido"
      }), {
        status: 400
      });
    }
    // ✅ Actualizar la reserva (estado del número)
    const { error } = await supabase.from("numeros").update({
      estado: nuevoEstado
    }).eq("id", numeroId);
    if (error) {
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 400
      });
    }
    return new Response(JSON.stringify({
      success: true,
      numeroId,
      nuevoEstado
    }), {
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500
    });
  }
});
