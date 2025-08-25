import { client } from '../../../api/supabaseClient.js';
import { mostrarElemento, ocultarElemento, actualizarTexto, resetearFormulario, mostrarSeccion } from '../ui/uiHelpers.js';
import { mostrarModal } from '../ui/modal/modal.js';
import { mostrarNumerosPorRifa } from '../ui/numerosUI.js';

let numeroSel = null;
let rifaSel = null;

const form = document.getElementById('formularioReserva');

export function mostrarFormularioReserva(num, rifaId) {
  numeroSel = num;
  rifaSel = rifaId;
  actualizarTexto('#numeroSeleccionado', num);
  mostrarElemento('#formularioReserva');
  form.scrollIntoView({ behavior: 'smooth' });
}

// Funciones de validación
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarTelefono(telefono) {
  return /^\d{7,15}$/.test(telefono); // Ajusta según tu país
}

document.getElementById('btnConfirmar').addEventListener('click', async () => {
  const nombre = document.getElementById('nombre').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const archivo = document.getElementById('comprobante').files[0];

  if (!nombre || !correo || !telefono || !archivo || !numeroSel || !rifaSel) {
    return mostrarModal('Completa todos los campos obligatorios.', 'advertencia');
  }

  if (!validarEmail(correo)) {
    return mostrarModal('Correo electrónico inválido.', 'advertencia');
  }

  if (!validarTelefono(telefono)) {
    return mostrarModal('Teléfono inválido. Solo números, entre 7 y 15 dígitos.', 'advertencia');
  }

  // Validación de tipo y tamaño de archivo
  const tiposPermitidos = ['image/png', 'image/jpeg', 'application/pdf'];
  if (!tiposPermitidos.includes(archivo.type) || archivo.size > 2 * 1024 * 1024) {
    return mostrarModal('Archivo no permitido o demasiado grande (máx 2MB). Solo JPG, PNG o PDF.', 'advertencia');
  }

  const path = `${numeroSel}_${Date.now()}_${archivo.name}`;
  const { error: upErr } = await client.storage.from('comprobantes').upload(path, archivo);
  if (upErr) return mostrarModal('Error al subir comprobante. Intenta nuevamente.', 'error');

  const { data: pu, error: puErr } = await client.storage.from('comprobantes').getPublicUrl(path);
  if (puErr) return mostrarModal('No se pudo obtener el enlace del comprobante.', 'error');

  // Verificar si el número sigue disponible
  const { data: disponibilidad, error: errVerificar } = await client
    .from('numeros')
    .select('estado')
    .eq('numero', numeroSel)
    .eq('rifa_id', rifaSel)
    .single();

  if (errVerificar || !disponibilidad || disponibilidad.estado !== 'disponible') {
    return mostrarModal('Ese número ya fue reservado. Por favor, elige otro.', 'advertencia');
  }

  const { error: updErr } = await client
    .from('numeros')
    .update({
      estado: 'pendiente',
      nombre_cliente: nombre,
      correo_cliente: correo,
      telefono_cliente: telefono,
      fecha_seleccion: new Date().toISOString(),
      comprobante_url: pu.publicUrl
    })
    .eq('numero', numeroSel)
    .eq('rifa_id', rifaSel);

    if (updErr) {
  console.error('Error al actualizar número:', updErr);
  return mostrarModal('No se pudo realizar la reserva.', 'error');
}

  if (updErr) return mostrarModal('No se pudo realizar la reserva.', 'error');

  mostrarModal('¡Reserva enviada! Te notificaremos cuando tu comprobante sea verificado.', 'exito');

  numeroSel = null;
  rifaSel = null;
  resetearFormulario('#formularioReserva');
  ocultarElemento('#formularioReserva');
  mostrarElemento('#rifasSection');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ✅ Botón para volver a seleccionar un número
document.getElementById('formVolver').addEventListener('click', async () => {
  resetearFormulario('#formularioReserva');
  ocultarElemento('#formularioReserva');
  const cont = document.getElementById('numerosContainer');
  cont.innerHTML = '';
  if (rifaSel) {
    await mostrarNumerosPorRifa(rifaSel);
    mostrarSeccion('numerosSection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});