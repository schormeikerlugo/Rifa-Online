// 📁 supabaseFunctions.js
import { supabase } from './supabaseClient.js';
import { mostrarModal } from './modalAdmin.js';

/**
 * 📌 Obtener rifas
 */
export async function obtenerRifas() {
  const { data, error } = await supabase
    .from("rifas")
    .select("*")
    .order("id", { ascending: false }); // ordenamos por id descendente
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
  try {
    const response = await fetch("/functions/v1/admin-create-rifa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rifaData),
    });

    if (!response.ok) {
      throw new Error("Error al crear rifa");
    }

    return await response.json();
  } catch (err) {
    mostrarModal("❌ Error creando rifa: " + err.message);
    return null;
  }
}

/**
 * 📌 Editar rifa vía Edge Function
 */
export async function editarRifa(rifaId, updateData) {
  try {
    const response = await fetch("/functions/v1/admin-update-rifa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rifaId, updateData }),
    });

    if (!response.ok) {
      throw new Error("Error al editar rifa");
    }

    return await response.json();
  } catch (err) {
    mostrarModal("❌ Error editando rifa: " + err.message);
    return null;
  }
}

/**
 * 📌 Eliminar rifa vía Edge Function
 */
export async function eliminarRifa(rifaId) {
  try {
    const response = await fetch("/functions/v1/admin-delete-rifa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rifaId }),
    });

    if (!response.ok) {
      throw new Error("Error al eliminar rifa");
    }

    return await response.json();
  } catch (err) {
    mostrarModal("❌ Error eliminando rifa: " + err.message);
    return null;
  }
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
  try {
    const response = await fetch("/functions/v1/admin-moderate-reserva", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservaId, nuevoEstado }),
    });

    if (!response.ok) {
      throw new Error("Error al moderar reserva");
    }

    return await response.json();
  } catch (err) {
    mostrarModal("❌ Error moderando reserva: " + err.message);
    return null;
  }
}