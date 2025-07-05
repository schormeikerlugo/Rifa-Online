export function activarScroll() {
  document.body.classList.remove('sin-scroll');
  document.body.classList.add('con-scroll');
}

export function desactivarScroll() {
  document.body.classList.remove('con-scroll');
  document.body.classList.add('sin-scroll');
}

export function inicializarBotonIrArriba(btnId = 'btnIrArriba', targetId = null) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.style.display = 'block';
    } else {
      btn.style.display = 'none';
    }
  });

  btn.addEventListener('click', () => {
    if (targetId && document.getElementById(targetId)) {
      document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}
