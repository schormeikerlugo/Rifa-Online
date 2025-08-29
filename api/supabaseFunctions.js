// 📁 supabaseFunctions.js
import { supabase } from './supabaseAdmin.js';
import { mostrarModal } from '../src/admin/ui/modal/modalAdmin.js';

/**
 * 📌 Obtener token del admin logueado
 */
async function obtenerTokenAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("No hay sesión activa. Inicia sesión como admin.");
  return token;
}

/**
 * 📌 Llamada genérica a Edge Function con token (JSON)
 */
async function llamarEdgeFunction(url, method = "POST", body = {}) {
  try {
    const token = await obtenerTokenAdmin();

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Error en función ${url}`);
    }

    return data;
  } catch (err) {
    mostrarModal("❌ " + err.message);
    return null;
  }
}

/**
 * 📌 Obtener rifas
 */
export async function obtenerRifas() {
  const { data, error } = await supabase
    .from("rifas")
    .select("*")
    .order("id", { ascending: false });
  if (error) {
    mostrarModal("❌ Error al obtener rifas: " + error.message);
    return [];
  }
  return data || [];
}

/**
 * 📌 Crear rifa vía Edge Function
 */
export async function crearRifa(rifaData) {
  return await llamarEdgeFunction(
    "https://wvebiyuoszwzsxavoitp.supabase.co/functions/v1/admin-create-rifa",
    "POST",
    rifaData
  );
}

/**
 * 📌 Editar rifa vía Edge Function (JSON plano)
 *     -> Las imágenes YA deben haberse subido a Storage en el frontend.
 *     -> Aquí solo mandamos las URLs nuevas (si las hay).
 */
export async function editarRifa(rifaId, updateData) {
  // NOTE: updateData debe contener campos como:
  // { titulo, descripcion, fecha_inicio, fecha_fin, imagen_url, imagenes_extra }
  return await llamarEdgeFunction(
    "https://wvebiyuoszwzsxavoitp.supabase.co/functions/v1/admin-edit-rifa",
    "PATCH",
    { rifaId, ...updateData }   // << importante: expandir, no anidar
  );
}

/**
 * 📌 Eliminar rifa vía Edge Function
 */
export async function eliminarRifa(rifaId) {
  return await llamarEdgeFunction(
    "https://wvebiyuoszwzsxavoitp.supabase.co/functions/v1/admin-delete-rifa",
    "DELETE",
    { rifaId }
  );
}

/**
 * 📌 Obtener reservas (números ocupados)
 */
export async function obtenerReservas(rifaId) {
  const { data, error } = await supabase
    .from("numeros")
    .select("id,numero,estado,nombre_cliente,correo_cliente,telefono_cliente,comprobante_url")
    .eq("rifa_id", rifaId)
    .neq("estado", "disponible");

  if (error) {
    mostrarModal("❌ Error al obtener reservas: " + error.message);
    return [];
  }
  return data || [];
}

/**
 * 📌 Moderar reserva (aprobar/rechazar)
 */
export async function moderarReserva(reservaId, nuevoEstado) {
  return await llamarEdgeFunction(
    "https://wvebiyuoszwzsxavoitp.supabase.co/functions/v1/admin-moderate-reserva",
    "POST",
    { numeroId: reservaId, nuevoEstado }
  );
}

/**
 * 📌 Reservar número desde cliente (sin login)
 */
export async function reservarNumeroCliente(datosReserva) {
  try {
    const response = await fetch(
      "https://wvebiyuoszwzsxavoitp.supabase.co/functions/v1/cliente-reservar-numero",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datosReserva)
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Error al reservar número");
    }

    return data;
  } catch (err) {
    console.error("❌ Error en reserva cliente:", err.message);
    return null;
  }
}

export async function subirComprobante(archivo, numeroSel) {
  const nombreLimpio = archivo.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
  const path = `${numeroSel}_${Date.now()}_${nombreLimpio}`;

  const { error: upErr } = await supabase.storage.from('comprobantes').upload(path, archivo);
  if (upErr) throw new Error('Error al subir comprobante');

  const { data: pu, error: puErr } = await supabase.storage.from('comprobantes').getPublicUrl(path);
  if (puErr || !pu?.publicUrl) throw new Error('No se pudo obtener el enlace del comprobante');

  return pu.publicUrl;
}

/**
 * 📌 Obtener notificaciones
 */
export async function obtenerNotificaciones() {
  const { data, error } = await supabase
    .from("notificaciones")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    mostrarModal("❌ Error al obtener notificaciones: " + error.message);
    return [];
  }
  return data || [];
}

/**
 * 📌 Marcar notificación como leída
 */
export async function marcarNotificacionLeida(id) {
  const { error } = await supabase
    .from("notificaciones")
    .update({ leido: true })
    .eq("id", id);

  if (error) {
    mostrarModal("❌ Error al actualizar notificación: " + error.message);
    return false;
  }
  return true;
}