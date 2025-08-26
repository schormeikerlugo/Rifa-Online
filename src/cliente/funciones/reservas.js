import { subirComprobante, reservarNumeroCliente } from '../../../api/supabaseFunctions.js';
import {
  mostrarElemento,
  ocultarElemento,
  actualizarTexto,
  resetearFormulario,
  mostrarSeccion,
  mostrarLoader,
  ocultarLoader
} from '../ui/uiHelpers.js';
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

// Validaciones
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarTelefono(telefono) {
  return /^\d{7,15}$/.test(telefono);
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

  const tiposPermitidos = ['image/png', 'image/jpeg', 'application/pdf'];
  if (!tiposPermitidos.includes(archivo.type) || archivo.size > 2 * 1024 * 1024) {
    return mostrarModal('Archivo no permitido o demasiado grande (máx 2MB). Solo JPG, PNG o PDF.', 'advertencia');
  }

  try {
    mostrarLoader();

    const comprobante_url = await subirComprobante(archivo, numeroSel);

    const resultado = await reservarNumeroCliente({
      numero: numeroSel,
      rifa_id: rifaSel,
      nombre,
      correo,
      telefono,
      comprobante_url
    });

    ocultarLoader();

    if (!resultado || resultado.error) {
      if (resultado.error === 'numero_ocupado') {
        return mostrarModal(`😕 El número ${numeroSel} ya fue reservado por otra persona. Por favor, elige otro disponible.`, 'error');
      }

      return mostrarModal(resultado.error || 'No se pudo realizar la reserva.', 'error');
    }

    mostrarModal('¡Reserva enviada! Te notificaremos cuando tu comprobante sea verificado.', 'exito');

    numeroSel = null;
    rifaSel = null;
    resetearFormulario('#formularioReserva');
    ocultarElemento('#formularioReserva');
    mostrarElemento('#rifasSection');
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    ocultarLoader();
    mostrarModal('❌ ' + err.message);
  }
});

// Botón para volver a seleccionar un número
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