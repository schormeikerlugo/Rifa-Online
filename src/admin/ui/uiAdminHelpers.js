// uiAdminHelpers.js

export function mostrarElemento(selector) {
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (el) {
    el.classList.add('transicion', 'visible');
    el.classList.remove('oculto');
    el.style.display = 'block';

    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // ✅ Solo permitir scroll si el contenido lo requiere
    ajustarOverflowGlobal();
  }
}

export function ocultarElemento(selector) {
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (el) {
    el.classList.add('transicion', 'oculto');
    el.classList.remove('visible');
    setTimeout(() => {
      el.style.display = 'none';
      ajustarOverflowGlobal();
    }, 300);
  }
}

// 🔁 Verifica si hay algún elemento visible con scroll
function ajustarOverflowGlobal() {
  const tieneContenidoDesbordado = [...document.querySelectorAll('.visible')]
    .some(el => el.scrollHeight > window.innerHeight);


}
