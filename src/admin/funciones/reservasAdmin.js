import { supabase } from '../../../api/supabaseAdmin.js';
import { mostrarModal, mostrarModalConfirmacion } from "../ui/modal/modalAdmin.js";
import { obtenerReservas, moderarReserva } from "../../../api/supabaseFunctions.js";
import { escapeHTML, mostrarReservasUI } from '../ui/utilsAdmin.js';
import { mostrarInfoDeRifa } from './helpersAdmin.js';

/**
 * 📌 Resalta el botón de filtro activo
 */
function marcarFiltroActivo(filtro) {
  document.querySelectorAll('#filtrosReservas .filtro').forEach(btn => {
    btn.classList.toggle('activo', btn.dataset.filtro === filtro);
  });
}

/**
 * 📌 Generar filtros dinámicamente
 */
function generarFiltros() {
  const filtros = document.createElement("aside");
  filtros.id = "filtrosReservas";
  filtros.className = "filtros";
  filtros.innerHTML = `
    <button type="button" class="btn btn-filter filtro" data-filtro="pendiente">Pendientes</button>
    <button type="button" class="btn btn-filter filtro" data-filtro="confirmado">Aprobadas</button>
    <button type="button" class="btn btn-filter filtro" data-filtro="todas">Todas</button>
  `;
  return filtros;
}

/**
 * 📌 Renderizar reservas en el contenedor
 */
function renderizarReservas(reservas, contenedor, rifaId, filtro = "pendiente") {
  if (!reservas.length) {
    contenedor.innerHTML += '<p class="mensaje-final">No hay reservas disponibles.</p>';
    return;
  }

  reservas.forEach(reserva => {
  const div = document.createElement("div");
  div.className = "card";

  // Construir el contenido HTML
  div.innerHTML = `
    <p><strong>🪙 Número:</strong> ${escapeHTML(reserva.numero)}</p>
    <p><strong>👤 Nombre:</strong> ${escapeHTML(reserva.nombre_cliente) || '-'}</p>
    <p><strong>📱 Teléfono:</strong> ${escapeHTML(reserva.telefono_cliente) || '-'}</p>
    <p><strong>📩 Correo:</strong> ${escapeHTML(reserva.correo_cliente) || '-'}</p>
    <p><strong>📍 Estado:</strong> ${escapeHTML(reserva.estado)}</p>
  `;

  // Crear el enlace del comprobante con estilos
  const linkComprobante = document.createElement("a");
  linkComprobante.href = escapeHTML(reserva.comprobante_url);
  linkComprobante.target = "_blank";
  linkComprobante.classList.add("comprobante-link");
  linkComprobante.textContent = "🔗 Ver comprobante";

  div.appendChild(linkComprobante);

  // Botones si está pendiente
  if (reserva.estado === "pendiente") {
    const btnContainer = document.createElement("div");
    btnContainer.classList.add("admin-rifa-btns");

    const btnAprobar = document.createElement("button");
    btnAprobar.textContent = "✅ Aprobar";
    btnAprobar.classList.add("aprobar");
    btnAprobar.dataset.id = escapeHTML(reserva.id);

    const btnRechazar = document.createElement("button");
    btnRechazar.textContent = "🗑️ Rechazar";
    btnRechazar.classList.add("rechazar");
    btnRechazar.dataset.id = escapeHTML(reserva.id);

    btnContainer.appendChild(btnAprobar);
    btnContainer.appendChild(btnRechazar);
    div.appendChild(btnContainer);
  }

  contenedor.appendChild(div);
});

  contenedor.dataset.rifaId = rifaId;
  contenedor.dataset.filtro = filtro;
}

/**
 * 📌 Cargar reservas de una rifa
 * @param {string} rifaId - ID de la rifa
 * @param {string} filtro - Filtro de estado
 * @param {boolean} mantenerInfo - Si true, no recarga la info de la rifa ni los filtros
 */
export async function cargarReservas(rifaId, filtro = "pendiente", mantenerInfo = false) {
  try {
    const contenedor = document.getElementById("lista-reservas");
    if (!contenedor) {
      console.error("⚠️ No se encontró el contenedor #lista-reservas en el HTML");
      return;
    }

    if (!mantenerInfo) {
      contenedor.innerHTML = "";

      // 1️⃣ Obtener info de la rifa
      const { data: rifa, error: errorRifa } = await supabase
        .from('rifas')
        .select('*')
        .eq('id', rifaId)
        .single();

      if (errorRifa) {
        mostrarModal('❌ Error al cargar información de la rifa.', 'error');
        return;
      }

      // 📄 Mostrar info de la rifa
      mostrarInfoDeRifa(rifa);

      // 📌 Generar e insertar filtros
      const filtros = generarFiltros();
      contenedor.appendChild(filtros);
    } else {
      // Si mantenemos la info, borramos solo las reservas previas
      document.querySelectorAll("#lista-reservas .card, #lista-reservas .mensaje-final")
        .forEach(el => el.remove());
    }

    // 2️⃣ Obtener reservas
    let reservas = await obtenerReservas(rifaId);

    if (filtro === "pendiente") {
      reservas = reservas.filter(r => r.estado === "pendiente");
    } else if (filtro === "confirmado") {
      reservas = reservas.filter(r => r.estado === "confirmado");
    } else if (filtro === "todas") {
      const ordenEstado = { pendiente: 1, confirmado: 2, rechazado: 3 };
      reservas.sort((a, b) => ordenEstado[a.estado] - ordenEstado[b.estado]);
    }

    // 3️⃣ Renderizar reservas
    renderizarReservas(reservas, contenedor, rifaId, filtro);

    marcarFiltroActivo(filtro);
  } catch (err) {
    mostrarModal("❌ Error al cargar reservas: " + err.message, "error");
  }

  mostrarReservasUI();
}

/**
 * 📌 Delegación de eventos
 */
document.addEventListener("click", async (event) => {
  const btn = event.target;
  const contenedor = document.getElementById("lista-reservas");

  // --- Filtros ---
  if (btn.closest('#filtrosReservas')?.classList.contains('filtros') && btn.classList.contains('filtro')) {
    event.preventDefault();
    const filtro = btn.dataset.filtro;
    const rifaId = contenedor?.dataset.rifaId;
    if (!rifaId) {
      console.warn("⚠️ No hay rifaId definido en el dataset");
      return;
    }
    await cargarReservas(rifaId, filtro, true); // 👈 mantenemos la info
    return;
  }

  if (!contenedor) return;

  const rifaId = contenedor.dataset.rifaId;
  const filtro = contenedor.dataset.filtro || "pendiente";

  // --- Aprobar ---
  if (btn.classList.contains("aprobar")) {
    event.preventDefault();
    const reservaId = btn.dataset.id;
    const confirmar = await mostrarModalConfirmacion("¿Aprobar esta reserva?");
    if (confirmar) {
      const result = await moderarReserva(reservaId, "confirmado");
      if (result?.success) {
        mostrarModal("✅ Reserva aprobada");
        await cargarReservas(rifaId, filtro, true);
      }
    }
  }

  // --- Rechazar ---
  if (btn.classList.contains("rechazar")) {
    event.preventDefault();
    const reservaId = btn.dataset.id;
    const confirmar = await mostrarModalConfirmacion("¿Rechazar esta reserva?");
    if (confirmar) {
      const result = await moderarReserva(reservaId, "disponible");
      if (result?.success) {
        mostrarModal("✅ Reserva rechazada");
        await cargarReservas(rifaId, filtro, true);
      }
    }
  }
});