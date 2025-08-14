// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// No se requiere librería externa, se usa fetch para llamar a la API de Resend
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), { status: 405, ...corsHeaders });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
  return new Response(JSON.stringify({ error: "JSON inválido" }), { status: 400, ...corsHeaders });
  }

  const { to, subject, text } = body;
  if (!to || !subject || !text) {
  return new Response(JSON.stringify({ error: "Faltan datos obligatorios" }), { status: 400, ...corsHeaders });
  }

  // Leer API Key de Resend
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
  return new Response(JSON.stringify({ error: "API Key de Resend no configurada" }), { status: 500, ...corsHeaders });
  }

  // Usar remitente de pruebas de Resend
  const from = "onboarding@resend.dev";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text,
      }),
    });
    const result = await response.json();
    if (response.ok) {
  return new Response(JSON.stringify({ message: "Correo enviado correctamente", result }), { status: 200, ...corsHeaders });
    } else {
  return new Response(JSON.stringify({ error: result.error || "Error al enviar correo" }), { status: 500, ...corsHeaders });
    }
  } catch (error) {
  return new Response(JSON.stringify({ error: error.message }), { status: 500, ...corsHeaders });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
