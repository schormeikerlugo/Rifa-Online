// 📁 editarRifa.js
import { mostrarFormulario } from './utilsAdmin.js';

/**
 * Prepara el formulario para editar una rifa existente
 */
export function prepararEdicionRifa(btn, rifa) {
  const form = document.getElementById('form-rifa');
  form.dataset.editando = 'true';
  form.dataset.rifaId = rifa.id;
  form.dataset.imagenActual = rifa.imagen_url || '';
  form.dataset.imagenesExtrasActuales = JSON.stringify(rifa.imagenes_extra || []);

  // Rellenar campos
  form.titulo.value = rifa.titulo;
  form.descripcion.value = rifa.descripcion;
  form.fecha_inicio.value = new Date(rifa.fecha_inicio).toISOString().slice(0,16);
  form.fecha_fin.value = new Date(rifa.fecha_fin).toISOString().slice(0,16);

  // Bloquear cantidad de números
  form.cantidad_numeros.value = 'Bloqueado';
  form.cantidad_numeros.disabled = true;

  // Preview de imagen principal
  let preview = document.getElementById('imagenActual');
  if (!preview) {
    preview = document.createElement('img');
    preview.id = 'imagenActual';
    preview.style.maxWidth = '200px';
    preview.style.margin = '10px 0';
    form.imagen_rifa.insertAdjacentElement('beforebegin', preview);
  }
  preview.src = rifa.imagen_url;

  mostrarFormulario();
}
