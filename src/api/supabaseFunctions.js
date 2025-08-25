// 📁 supabaseFunctions.js
import { supabase } from '../api/supabaseAdmin.js';
import { mostrarModal } from '../admin/ui/modal/modalAdmin.js';

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