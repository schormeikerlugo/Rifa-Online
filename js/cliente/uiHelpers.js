// js/uiHelpers.js

export function mostrarElemento(selector) {
  const el = document.querySelector(selector);
  if (el) {
    el.classList.add('visible');
    el.classList.remove('oculto');
  }
}

export function ocultarElemento(selector) {
 const el = document.querySelector(selector);
  if (el) {
    el.classList.add('oculto');
    el.classList.remove('visible');
  }
}

export function actualizarTexto(selector, texto) {
  const el = document.querySelector(selector);
  if (el) el.textContent = texto;
}

export function resetearFormulario(selector) {
  const form = document.querySelector(selector);
  if (form) form.reset();
}

// ✅ Mostrar solo una sección a la vez


export function mostrarSeccion(id) {
  const secciones = ['rifasSection', 'numerosSection', 'formularioReserva'];

  secciones.forEach(seccionId => {
    const seccion = document.getElementById(seccionId);
    if (seccion) {
      const esVisible = seccionId === id;
      seccion.classList.toggle('visible', esVisible);
      seccion.classList.toggle('oculto', !esVisible);
    }
  });

  if (id === 'formularioReserva' || id === 'numerosSection') {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}

// ✅ NUEVA FUNCIÓN: volver a la vista principal (rifas)

export function volverAPrincipal() {
  mostrarSeccion('rifasSection');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function crearBarraDeProgreso(porcentaje) {
  const barra = document.createElement('div');
  barra.classList.add('barra-progreso');

  const relleno = document.createElement('div');
  relleno.classList.add('barra-relleno');
  relleno.style.width = `${porcentaje}%`;
  relleno.setAttribute('data-progreso', porcentaje); // 👈 clave para CSS

  const texto = document.createElement('span');
  texto.classList.add('barra-texto');
  texto.textContent = `${porcentaje}% Ocupado`;

  barra.appendChild(relleno);
  barra.appendChild(texto);

  return barra;
}

