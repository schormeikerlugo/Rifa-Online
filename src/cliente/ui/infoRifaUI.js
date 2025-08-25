// infoRifaUI.js
import { mostrarElemento, actualizarTexto } from './uiHelpers.js';
import { mostrarModal } from '../ui/modal/modal.js';

export function mostrarInfoRifa(datosRifa) {
  if (!datosRifa) {
    mostrarModal('si has realizado un pago sin reservar un número puedes hacerlo ahora mismo antes que ocupen tu número preferido.', 'info');
    return;
  }

  // Texto principal
  actualizarTexto('#infoTitulo', datosRifa.titulo || '');
  actualizarTexto('#infoDescripcion', datosRifa.descripcion || '');
  actualizarTexto('#infoInicio', formatearFecha(datosRifa.fecha_inicio));
  actualizarTexto('#infoFin', formatearFecha(datosRifa.fecha_fin));

  // Imagen principal
  const img = document.getElementById('infoImagen');
  img.src = datosRifa.imagen_url || '';
  img.alt = datosRifa.titulo || 'Imagen de la rifa';

  // ✅ Galería de imágenes extra
const galeria = document.getElementById('galeria-imagenes-extra');
galeria.innerHTML = '';

document.querySelectorAll('.modal-imagen').forEach(m => m.remove());

if (Array.isArray(datosRifa.imagenes_extra)) {
  datosRifa.imagenes_extra.forEach((url, index) => {
    // Galería: imagen miniatura dentro de un enlace
    const enlace = document.createElement('a');
    enlace.href = `#modal-img-${index}`;
    enlace.className = 'imagen-extra';

    const imgExtra = document.createElement('img');
    imgExtra.src = url;
    imgExtra.alt = `Imagen extra ${index + 1}`;

    enlace.appendChild(imgExtra);
    galeria.appendChild(enlace);

    // Modal ampliado (insertado al final del body)
    const modal = document.createElement('div');
    modal.id = `modal-img-${index}`;
    modal.className = 'modal-imagen';
    modal.innerHTML = `
      <a href="#" class="cerrar-modal">&times;</a>
      <img src="${url}" alt="Imagen ampliada ${index + 1}" />
    `;
    document.body.appendChild(modal);
  });
  }

  mostrarElemento('#infoRifa');
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return '';
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
