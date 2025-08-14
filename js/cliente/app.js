// public/js/app.js
import { cargarRifas } from './cargarRifas.js';
import { mostrarSeccion } from './uiHelpers.js';
import { prepararModal } from './modal.js';
import { inicializarBotonIrArriba } from './scrollControl.js';
import { mostrarPreloader, ocultarPreloader } from './preloader.js';


// Mostrar el preloader al inicio
mostrarPreloader(null, {
  mensaje: '🎰 Cargando la experiencia...',
  tipo: 'casino',
  animacion: 'fadeIn'
});

// Esperar a que todo esté cargado (DOM + imágenes + fuentes)
window.addEventListener('load', () => {
  // Esperar 2 segundos extra antes de mostrar el contenido
  ocultarPreloader(2000);
});


document.addEventListener('DOMContentLoaded', () => {
  prepararModal();
});

document.addEventListener('DOMContentLoaded', async () => {
  await cargarRifas();

  // Función para manejar el click en ambos botones
  function volverHandler() {
    document.getElementById('numerosContainer').innerHTML = '';
    mostrarSeccion('rifasSection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Asigna el handler a ambos botones si existen
  const volverBtn = document.getElementById('volverBtn');
  if (volverBtn) volverBtn.addEventListener('click', volverHandler);

  const volverBtn2 = document.getElementById('volverBtn2');
  if (volverBtn2) volverBtn2.addEventListener('click', volverHandler);

  inicializarBotonIrArriba('btnIrArriba', 'descripcionRifa'); // Cambia 'descripcionRifa' por el id real de la descripción si lo tienes, o quítalo para ir al top
});