// 📁 editarRifa.js
import { mostrarFormulario } from '../ui/utilsAdmin.js';

/**
 * Prepara el formulario para editar una rifa existente
 */
export function abrirFormularioEdicion(rifa) {
  const form = document.getElementById('form-rifa');
  if (!form) return;

  form.dataset.editando = 'true';
  form.dataset.rifaId = rifa.id;
  form.dataset.imagenActual = rifa.imagen_url || '';
  form.dataset.imagenesExtrasActuales = JSON.stringify(rifa.imagenes_extra || []);

  // Rellenar campos
  form.titulo.value = rifa.titulo || "";
  form.descripcion.value = rifa.descripcion || "";

  // Asegurar formato "YYYY-MM-DDTHH:mm" para input datetime-local
  const toLocalInput = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };
  form.fecha_inicio.value = toLocalInput(rifa.fecha_inicio);
  form.fecha_fin.value = toLocalInput(rifa.fecha_fin);

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
  preview.src = rifa.imagen_url || "";

  // Renderizar previews de imágenes extra
  const contenedor = document.getElementById("contenedor-imagenes-extras");
  if (contenedor) {
    contenedor.innerHTML = "";
    (rifa.imagenes_extra || []).forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      img.style.maxWidth = "150px";
      img.style.margin = "5px";
      contenedor.appendChild(img);
    });
  }

  // Mostrar el formulario de edición
  mostrarFormulario();
}