import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type, apikey"
      }
    });
  }
  if (req.method !== "DELETE") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN
      }
    });
  }
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  try {
    const { rifaId } = await req.json();
    await supabase.from("numeros").delete().eq("rifa_id", rifaId);
    const { error } = await supabase.from("rifas").delete().eq("id", rifaId);
    if (error) throw error;
    return new Response(JSON.stringify({
      success: true
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
