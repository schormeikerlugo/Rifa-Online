// js/admin/helpersAdmin.js
import { mostrarElemento, ocultarElemento} from '../ui/uiAdminHelpers.js'
import { escapeHTML } from '../ui/utilsAdmin.js';


/* 📝 Mostrar formulario con datos de una rifa (modo edición) */
export function mostrarFormularioEdicion(rifa) {
  const form = document.getElementById('form-rifa')
  const seccionPrincipal = document.getElementById('lista-rifas')
  const seccionReservas = document.getElementById('lista-reservas')
  const filtros = document.getElementById('filtrosReservas')
  const btnCrear = document.getElementById('btn-crear')
  const btnVolver = document.getElementById('btn-volver')

  mostrarElemento(form)
  ocultarElemento(seccionPrincipal)
  ocultarElemento(seccionReservas)
  ocultarElemento(filtros)
  ocultarElemento(btnCrear)
  mostrarElemento(btnVolver)

  form.titulo.value = rifa.titulo
  form.descripcion.value = rifa.descripcion
  form.fecha_inicio.value = rifa.fecha_inicio.slice(0, 16)
  form.fecha_fin.value = rifa.fecha_fin.slice(0, 16)

  const inputCantidad = form.cantidad_numeros
  if (inputCantidad) {
    inputCantidad.value = ''
    inputCantidad.disabled = true
    inputCantidad.classList.add('oculto')
  }

  form.imagen_rifa.required = false
  form.imagenesExtra.required = false

  let inputId = document.getElementById('rifa_id')
  if (!inputId) {
    inputId = document.createElement('input')
    inputId.type = 'hidden'
    inputId.id = 'rifa_id'
    inputId.name = 'rifa_id'
    form.appendChild(inputId)
  }
  inputId.value = rifa.id

  const imgActual = document.getElementById('imagenActual')
  if (!imgActual) {
    const preview = document.createElement('img')
    preview.id = 'imagenActual'
    preview.src = rifa.imagen_url
    preview.alt = 'Imagen actual'
    preview.style.maxWidth = '200px'
    preview.style.marginBottom = '10px'
    form.imagen_rifa.insertAdjacentElement('beforebegin', preview)
  } else {
    imgActual.src = rifa.imagen_url
  }
}

/* 📄 Mostrar información visual de la rifa en la sección de reservas */
export function mostrarInfoDeRifa(rifa) {
  const contenedor = document.getElementById('lista-reservas');

  const infoRifaHtml = `
    <div class="detalle-rifa-admin">
      <h3 class="rifa-titulo">${escapeHTML(rifa.titulo)}</h3>
      <p class="rifa-descripcion">${escapeHTML(rifa.descripcion)}</p>
      <p>
        <strong>Inicio:</strong> 
        <span class="rifa-fecha-inicio">${new Date(rifa.fecha_inicio).toLocaleString()}</span>
      </p>
      <p>
        <strong>Fin:</strong> 
        <span class="rifa-fecha-fin">${new Date(rifa.fecha_fin).toLocaleString()}</span>
      </p>
      <div class="galeria-extra">
        ${
          Array.isArray(rifa.imagenes_extra) 
            ? rifa.imagenes_extra
                .map(url => `<img class="rifa-imagen-extra" src="${escapeHTML(url)}" alt="extra">`)
                .join('') 
            : ''
        }
      </div>
    </div>
  `;

  contenedor.innerHTML += infoRifaHtml;
}

