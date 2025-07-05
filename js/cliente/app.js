// public/js/app.js
import { cargarRifas } from './cargarRifas.js';
import { mostrarSeccion } from './uiHelpers.js';
import { prepararModal } from './modal.js';
import { inicializarBotonIrArriba } from './scrollControl.js';

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