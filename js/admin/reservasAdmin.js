// js/admin/reservasAdmin.js
import { supabase } from './supabaseClient.js'
import { mostrarModal, mostrarModalConfirmacion } from './modalAdmin.js'
import { mostrarInfoDeRifa } from './helpersAdmin.js'

// Función para escapar HTML y evitar XSS
function escapeHTML(str) {
  return String(str ?? '').replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}

/* 🔁 Cargar reservas y mostrar info de rifa */
export async function cargarReservasPorRifa(rifaId, filtro = 'pendiente') {
  const contenedor = document.getElementById('lista-reservas')
  contenedor.innerHTML = ''

  // 🔍 Obtener rifa
  const { data: rifa, error: errorRifa } = await supabase
    .from('rifas')
    .select('*')
    .eq('id', rifaId)
    .single()

  if (errorRifa) {
    mostrarModal('❌ Error al cargar información de la rifa.', 'error')
    return
  }

  mostrarInfoDeRifa(rifa)

  // 🔍 Obtener reservas
  let query = supabase
    .from('numeros')
    .select('*')
    .eq('rifa_id', rifaId)
    .order('fecha_seleccion', { ascending: true })

  if (filtro !== 'todas') {
    query = query.eq('estado', filtro)
  } else {
    query = query.neq('estado', 'disponible')
  }

  const { data, error } = await query

  if (error) {
    mostrarModal('❌ Error al cargar reservas.', 'error') //
    return
  }

  if (!data.length) {
    contenedor.innerHTML +=  '<p class="mensaje-final">No hay reservas disponibles.</p>'
    return
  }

  // 📄 Mostrar reservas
data.forEach(reserva => {
  const div = document.createElement('div')
  div.className = 'card'
  div.innerHTML = `
    <p><strong>🪙 Número:</strong> ${escapeHTML(reserva.numero)}</p>
    <p><strong>👤 Nombre:</strong> ${escapeHTML(reserva.nombre_cliente) || '-'}</p>
    <p><strong>📱 Teléfono:</strong> ${escapeHTML(reserva.telefono_cliente) || '-'}</p>
    <p><strong>📩 Correo:</strong> ${escapeHTML(reserva.correo_cliente) || '-'}</p>
    <p><strong>📍 Estado:</strong> ${escapeHTML(reserva.estado)}</p>
    <a href="${escapeHTML(reserva.comprobante_url)}" target="_blank">🔗 Ver comprobante</a>
    ${reserva.estado === 'pendiente' ? `
      <div class="admin-rifa-btns">
        <button class="aprobar" data-id="${escapeHTML(reserva.id)}">✅ Aprobar</button>
        <button class="rechazar" data-id="${escapeHTML(reserva.id)}">🗑️ Rechazar</button>
      </div>
    ` : ''}
  `
  contenedor.appendChild(div)
  })

  // 📌 Guardar contexto
  contenedor.dataset.rifaId = rifaId
  contenedor.dataset.filtro = filtro
}

/* ✅ Aprobar reserva */
export async function aprobarReserva(id) {
  const confirmar = await mostrarModalConfirmacion ('¿Estás seguro que deseas aprobar esta reserva?', 'enviado', 'aprobar')
  if (!confirmar) return false

  const { error } = await supabase
    .from('numeros')
    .update({ estado: 'confirmado' })
    .eq('id', id)

  if (error) {
    mostrarModal('Error al aprobar la reserva.', 'error') //❌
    return false
  }

  mostrarModal('Reserva aprobada correctamente.', 'aprobado') //✅
  return true
}

/* 🗑️ Rechazar reserva */
export async function rechazarReserva(id) {
  const confirmar = await mostrarModalConfirmacion ('¿Estás seguro que deseas rechazar esta reserva y liberar el número?', 'advertencia', 'rechazar')
  if (!confirmar) return false

  const { error } = await supabase
    .from('numeros')
    .update({
      estado: 'disponible',
      nombre_cliente: null,
      correo_cliente: null,
      telefono_cliente: null,
      comprobante_url: null,
      fecha_seleccion: null
    })
    .eq('id', id)

  if (error) {
    mostrarModal('Error al rechazar la reserva.', 'error') //❌
    return false
  }

  mostrarModal('ℹ️ Reserva rechazada y número liberado.', 'aprobado') //ℹ️
  return true
}