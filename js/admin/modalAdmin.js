// js/modalAdmin.js
/**
 * Muestra un modal con un textarea para editar el mensaje antes de enviar el correo.
 * @param {string} mensajePredeterminado - El mensaje que se muestra por defecto.
 * @param {string} titulo - El título del modal.
 * @returns {Promise<string>} - El mensaje final escrito por el admin.
 */
export function mostrarModalMensajeEditable(mensajePredeterminado, titulo = 'Editar mensaje') {
  return new Promise((resolve) => {
    const modal = document.getElementById('modalCustom');
    const mensajeEl = document.getElementById('modalMensaje');
    const lottieEl = document.getElementById('modalLottie');
    mensajeEl.innerHTML = '';
    lottieEl.load('https://lottie.host/b2dc22ab-80cb-4c94-ba83-1a2f439f66ac/rXEw8t4OUt.lottie');

    // Crear título y textarea
    const tituloEl = document.createElement('h3');
    tituloEl.textContent = titulo;
    const textarea = document.createElement('textarea');
    textarea.value = mensajePredeterminado;
    textarea.rows = 6;
    textarea.style.width = '100%';
    textarea.style.marginTop = '10px';

    // Crear botón Confirmar
    const btnConfirmar = document.createElement('button');
    btnConfirmar.id = 'modalConfirmarEditable';
    btnConfirmar.textContent = 'Enviar mensaje';
    btnConfirmar.className = 'btn btn-accent';

    // Crear botón Cancelar
    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.className = 'btn btn-neutral';
    btnCancelar.style.marginLeft = '10px';

    // Limpiar y agregar elementos al modal
    mensajeEl.appendChild(tituloEl);
    mensajeEl.appendChild(textarea);
    mensajeEl.appendChild(btnConfirmar);
    mensajeEl.appendChild(btnCancelar);

    modal.classList.remove('oculto');
    modal.classList.add('visible');

    btnConfirmar.onclick = () => {
      modal.classList.remove('visible');
      modal.classList.add('oculto');
      resolve(textarea.value);
    };
    btnCancelar.onclick = () => {
      modal.classList.remove('visible');
      modal.classList.add('oculto');
      resolve(null);
    };
  });
}

const gifsPorTipo = {
  exito: 'https://lottie.host/68cbc10e-d652-433a-8ea5-2e878a9b4cdb/Gwx6IP053J.lottie',
  aprobado: 'https://lottie.host/9cdcbd78-7e90-4272-b8b6-a1d986e6e398/el3cjwQECO.lottie',
  error: 'https://lottie.host/50fdcdac-797c-4f7b-a6eb-3472b4b4c0b1/aEozlummAd.lottie',
  info: 'https://lottie.host/b2dc22ab-80cb-4c94-ba83-1a2f439f66ac/rXEw8t4OUt.lottie',
  advertencia: 'https://lottie.host/f3cf0dd3-ff17-4d05-8181-2557e879cdd0/WFYcNia3yt.lottie',
  enviado: 'https://lottie.host/e0d4eba3-c72f-4a70-9756-cfcbd918c03c/xXGELx9tm3.lottie',
  premio: 'https://lottie.host/f2b66b2d-a505-4f17-9496-0f8518a09611/836mBev6JF.lottie',
};

export function mostrarModal(mensaje, tipo = 'info') {
  const modal = document.getElementById('modalCustom');
  const mensajeEl = document.getElementById('modalMensaje');
  const lottieEl = document.getElementById('modalLottie');

  modal.dataset.type = tipo;
  mensajeEl.textContent = mensaje;
  lottieEl.load(gifsPorTipo[tipo] || gifsPorTipo['info']);

  modal.classList.remove('oculto');
  modal.classList.add('visible');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function ocultarModal() {
  const modal = document.getElementById('modalCustom');
  modal.classList.remove('visible');
  modal.classList.add('oculto');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Limpiar botón dinámico si existe
  const btnConfirmar = document.getElementById('modalConfirmar');
  if (btnConfirmar) btnConfirmar.remove();
}

export function mostrarModalConfirmacion(mensaje, tipo = 'advertencia', accion = 'confirmar') {
  return new Promise((resolve) => {
    mostrarModal(mensaje, tipo);

    const modal = document.getElementById('modalCustom');
    const btnCerrar = document.getElementById('modalCerrar');

    // Crear botón Confirmar dinámicamente
    const btnConfirmar = document.createElement('button');
    btnConfirmar.id = 'modalConfirmar';
    btnConfirmar.textContent = accion.charAt(0).toUpperCase() + accion.slice(1);

    // Asignar clase según acción
    switch (accion.toLowerCase()) {
      case 'eliminar':
      case 'rechazar':
        btnConfirmar.className = 'btn btn-danger';
        break;
      case 'aprobar':
        btnConfirmar.className = 'btn btn-accent';
        break;
      case 'cancelar':
        btnConfirmar.className = 'btn btn-neutral';
        break;
      default:
        btnConfirmar.className = 'btn btn-outline';
        break;
    }

    // Confirmar acción
    btnConfirmar.addEventListener('click', () => {
      ocultarModal();
      resolve(true);
    });

    // Cancelar acción
    btnCerrar.onclick = () => {
      ocultarModal();
      resolve(false);
    };

    document.querySelector('.modal-overlay')?.addEventListener('click', () => {
      ocultarModal();
      resolve(false);
    });

    // Insertar botón después del cerrar
    btnCerrar.after(btnConfirmar);
  });
}

export function prepararModal() {
  document.getElementById('modalCerrar')?.addEventListener('click', ocultarModal);
  document.querySelector('.modal-overlay')?.addEventListener('click', ocultarModal);
}
