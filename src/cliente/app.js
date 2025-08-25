// public/js/app.js
import { cargarRifas } from '../cliente/funciones/cargarRifas.js';
import { mostrarSeccion } from '../cliente/ui/uiHelpers.js';
import { prepararModal } from '../cliente/ui/modal/modal.js';
import { inicializarBotonIrArriba } from '../cliente/ui/scrollControl.js';
import { mostrarPreloader, ocultarPreloader } from '../cliente/ui/preloader/preloader.js';

// Mostrar el preloader al inicio
mostrarPreloader();

// Esperar a que todo esté cargado (DOM + imágenes + fuentes)
window.addEventListener('load', () => {
  ocultarPreloader(2500); // puedes ajustar el delay si quieres más dramatismo
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