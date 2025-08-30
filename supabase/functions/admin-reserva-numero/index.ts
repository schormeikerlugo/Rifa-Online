import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SERVICE_ROLE_KEY");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
serve(async (req)=>{
  // 🛡️ Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
  try {
    // 📦 Leer body JSON
    let body;
    try {
      body = await req.json();
    } catch  {
      return new Response(JSON.stringify({
        error: 'body_invalido',
        mensaje: 'Body inválido. No es JSON.'
      }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    const { numero, rifa_id, nombre, correo, telefono, comprobante_url } = body;
    // ✅ Validar campos obligatorios
    if (!numero || !rifa_id || !nombre || !correo || !telefono || !comprobante_url) {
      return new Response(JSON.stringify({
        error: 'campos_faltantes',
        mensaje: 'Faltan campos obligatorios.'
      }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    // 🔍 Verificar disponibilidad del número
    const { data, error } = await supabase.from('numeros').select('id, estado').eq('numero', numero).eq('rifa_id', rifa_id).single();
    if (error) throw error;
    if (!data) {
      return new Response(JSON.stringify({
        error: 'numero_no_encontrado',
        mensaje: 'Número no encontrado.'
      }), {
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    if (data.estado !== 'disponible') {
      return new Response(JSON.stringify({
        error: 'numero_ocupado',
        mensaje: `El número ${numero} ya fue reservado o no está disponible.`
      }), {
        status: 409,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    // 📝 Actualizar estado del número (con condición de carrera controlada)
    const { error: updateError } = await supabase.from('numeros').update({
      estado: 'pendiente',
      nombre_cliente: nombre,
      correo_cliente: correo,
      telefono_cliente: telefono,
      fecha_seleccion: new Date().toISOString(),
      comprobante_url
    }).eq('numero', numero).eq('rifa_id', rifa_id).eq('estado', 'disponible');
    if (updateError) throw updateError;
    // 🔹 Obtener título de la rifa
    const { data: rifaData, error: rifaError } = await supabase.from('rifas').select('titulo').eq('id', rifa_id).single();
    if (rifaError) {
      console.error('❌ Error al obtener título de la rifa:', rifaError.message);
    }
    const tituloRifa = rifaData?.titulo || 'Reserva realizada';
    // 📣 Llamar a admin-send-notificacion
    try {
      const notifResponse = await fetch(`https://wvebiyuoszwzsxavoitp.supabase.co/functions/v1/admin-send-notificacion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({
          rifa_id,
          numero_id: data.id,
          titulo: tituloRifa,
          mensaje: `El cliente ${nombre} ha reservado el número ${numero} en la rifa "${tituloRifa}"`
        })
      });
      if (!notifResponse.ok) {
        const respText = await notifResponse.text();
        console.error('❌ Error al enviar notificación:', respText);
      }
    } catch (err) {
      console.error('❌ Error en llamada a admin-send-notificacion:', err);
    }
    return new Response(JSON.stringify({
      mensaje: 'Reserva registrada correctamente.'
    }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    console.error('❌ Error inesperado en cliente-reservar-numero:', err);
    return new Response(JSON.stringify({
      error: 'error_inesperado',
      mensaje: err.message || 'Error interno'
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});
