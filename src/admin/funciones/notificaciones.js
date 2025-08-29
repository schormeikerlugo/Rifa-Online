// src/admin/funciones/notificaciones.js
import { obtenerNotificaciones, marcarNotificacionLeida } from "../../../api/supabaseFunctions.js";
import { supabase } from "../../../api/supabaseAdmin.js";
import { initNotificacionesUI, renderNotificacionesUI } from "../ui/notificaciones/uiNotificaciones.js";

const contadorNotificaciones = document.getElementById("contadorNotificaciones");

/**
 * 📌 Cargar y mostrar notificaciones
 * - Obtiene las notificaciones desde Supabase
 * - Llama a la función de renderizado UI
 * - Agrega eventos a botones "marcar como leída"
 */
export async function cargarNotificaciones() {
  const notificaciones = await obtenerNotificaciones();

  // Renderizar UI con clases según estado leída/no leída
  renderNotificacionesUI(notificaciones, contadorNotificaciones);

  // 🔹 Eventos para marcar notificaciones como leídas
  document.querySelectorAll(".marcar-leida").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      await marcarNotificacionLeida(id);

      // 🔄 Recargar notificaciones para actualizar contador y estado
      await cargarNotificaciones();
    });
  });
}

/**
 * 📌 Inicializar UI
 * - Dropdown de notificaciones
 * - Eventos de click para abrir/cerrar
 */
initNotificacionesUI();

/**
 * 📌 Escuchar notificaciones en tiempo real
 * - Cada vez que se inserta una nueva notificación en Supabase
 * - Se recargan automáticamente las notificaciones
 */
export function escucharNotificacionesTiempoReal() {
  supabase
    .channel("notificaciones-ch")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notificaciones" },
      async payload => {
        console.log("🔔 Nueva notificación recibida:", payload.new);
        await cargarNotificaciones();
      }
    )
    .subscribe();
}