export function activarScroll() {
  document.body.classList.remove('sin-scroll');
  document.body.classList.add('con-scroll');
}

export function desactivarScroll() {
  document.body.classList.remove('con-scroll');
  document.body.classList.add('sin-scroll');
}

// Inicializa el botón "Ir Arriba" con comportamiento personalizado

export function inicializarBotonIrArriba(btnId = 'btnIrArriba', targetId = null) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  let visible = false; // Estado para evitar animaciones repetidas

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      if (!visible) {
        btn.classList.remove('btn-hide');
        btn.classList.add('btn-show');
        btn.style.display = 'block';
        visible = true;
      }
    } else {
      if (visible) {
        btn.classList.remove('btn-show');
        btn.classList.add('btn-hide');
        setTimeout(() => {
          btn.style.display = 'none';
        }, 0); // espera que termine la animación
        visible = false;
      }
    }
  });

  btn.addEventListener('click', () => {
    btn.classList.add('btn-clicked');
    setTimeout(() => btn.classList.remove('btn-clicked'), 400);

    if (targetId && document.getElementById(targetId)) {
      document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

