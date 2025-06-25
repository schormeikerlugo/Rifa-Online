// js/modal.js

const gifsPorTipo = {
  exito: 'https://lottie.host/9cdcbd78-7e90-4272-b8b6-a1d986e6e398/el3cjwQECO.lottie',
  error: 'https://lottie.host/50fdcdac-797c-4f7b-a6eb-3472b4b4c0b1/aEozlummAd.lottie',
  info: 'https://lottie.host/b2dc22ab-80cb-4c94-ba83-1a2f439f66ac/rXEw8t4OUt.lottie',
  advertencia: 'https://lottie.host/f3cf0dd3-ff17-4d05-8181-2557e879cdd0/WFYcNia3yt.lottie'
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
}

export function prepararModal() {
  document.getElementById('modalCerrar')?.addEventListener('click', ocultarModal);
  document.querySelector('.modal-overlay')?.addEventListener('click', ocultarModal);
}

