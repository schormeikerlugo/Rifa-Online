export function mostrarPreloader(container, opciones = {}) {
  document.body.classList.add('preloading');

  const destino = container || document.body;
  const { mensaje = 'Cargando...', tipo = 'casino', animacion = 'fadeIn' } = opciones;

  const preloader = document.createElement('div');
  preloader.className = `preloader-global animate__animated animate__${animacion}`;
  preloader.innerHTML = `
    <div class="spinner"></div>
    <p>${mensaje}</p>
  `;

  destino.appendChild(preloader);
}

export function ocultarPreloader(delay = 0) {
  const preloader = document.querySelector('.preloader-global');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('animate__fadeOut');
      setTimeout(() => {
        preloader.remove();
        document.body.classList.remove('preloading');
      }, 600); // tiempo de animación de salida
    }, delay);
  }
}
