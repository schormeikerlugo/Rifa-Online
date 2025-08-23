import { mostrarElemento, ocultarElemento } from './uiAdminHelpers.js';

/**
 * Mostrar el formulario de creación de rifa
 */
export function mostrarFormulario() {
  mostrarElemento('#seccion-formulario');
  ocultarElemento('#seccion-principal');
  ocultarElemento('#lista-rifas');
  ocultarElemento('#lista-reservas');
  mostrarElemento('#form-rifa');
  ocultarElemento('#filtrosReservas');
  mostrarElemento('#btn-volver');
  ocultarElemento('#btn-crear');
}

/**
 * Ocultar el formulario y volver a la pantalla principal
 */
export function ocultarFormulario() {
  ocultarElemento('#seccion-formulario');
  mostrarElemento('#seccion-principal');
  mostrarElemento('#lista-rifas');
  ocultarElemento('#lista-reservas');
  ocultarElemento('#form-rifa');
  ocultarElemento('#filtrosReservas');
  mostrarElemento('#btn-crear');
  ocultarElemento('#btn-volver');
}

/**
 * Mostrar la lista de reservas de una rifa
 */
export function mostrarReservasUI() {
  ocultarElemento('#form-rifa');
  ocultarElemento('#lista-rifas');
  ocultarElemento('#btn-crear');
  mostrarElemento('#lista-reservas');
  mostrarElemento('#btn-volver');
  mostrarElemento('#filtrosReservas');
}

/**
 * Volver a la pantalla principal desde reservas
 */
export function volverAPrincipal() {
  ocultarElemento('#form-rifa');
  ocultarElemento('#lista-reservas');
  mostrarElemento('#lista-rifas');
  mostrarElemento('#btn-crear');
  ocultarElemento('#btn-volver');
  ocultarElemento('#filtrosReservas');
}

export function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Resetea el formulario de rifa a su estado inicial.
 */
export function resetearFormularioRifa(formRifa) {
  formRifa.reset();

  Array.from(formRifa.elements).forEach(el => {
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.value = "";
    } else if (el.tagName === "SELECT") {
      el.selectedIndex = 0;
    }
  });

  // Restaurar campo de cantidad de números
  formRifa.cantidad_numeros.disabled = false;
  formRifa.cantidad_numeros.value = "";

  // Limpiar dataset
  delete formRifa.dataset.editando;
  delete formRifa.dataset.rifaId;
  delete formRifa.dataset.imagenActual;
  delete formRifa.dataset.imagenesExtrasActuales;

  // 🧽 Limpiar imagen principal
  document.getElementById('imagenActual')?.remove();

  // 🧽 Limpiar imágenes extra
  document.querySelector("#contenedor-imagenes-extras")?.replaceChildren();
}

