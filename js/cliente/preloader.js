export function mostrarPreloader() {
  const preloader = document.getElementById('preloaderGlobal');
  document.body.classList.add('preloading');
  preloader.classList.add('animate__animated', 'animate__zoomIn');
}

export function ocultarPreloader(delay = 1000) {
  const preloader = document.getElementById('preloaderGlobal');
  if (!preloader) return;

  setTimeout(() => {
    preloader.classList.remove('animate__zoomIn');
    preloader.classList.add('animate__fadeOut');

    preloader.addEventListener('animationend', () => {
      preloader.remove();
      document.body.classList.remove('preloading');
    });
  }, delay);
}

