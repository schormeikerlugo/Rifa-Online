// public/js/numerosUI.js
import { client } from '../../../js/supabaseClient.js';
import { mostrarFormularioReserva } from '../funciones/reservas.js';
import { mostrarSeccion } from './uiHelpers.js';
import { mostrarInfoRifa } from './infoRifaUI.js';

export async function mostrarNumerosPorRifa(rifaId, datosRifa) {
  // ✅ Mostrar la información de la rifa
  mostrarInfoRifa(datosRifa);

  // 🔄 Cargar los números
  const { data, error } = await client
    .from('numeros')
    .select('numero, estado')
    .eq('rifa_id', rifaId)
    .order('numero', { ascending: true });

  if (error) {    
    return mostrarModal('❌ Error al cargar números.', 'error');
  }

  const cont = document.getElementById('numerosContainer');
  cont.innerHTML = '';

  data.forEach(({ numero, estado }) => {
    const div = document.createElement('div');
    div.textContent = numero;
    div.classList.add('numero');

    if (estado === 'pendiente') {
      div.classList.add('pendiente');
    } else if (estado === 'confirmado' || estado === 'ocupado') {
      div.classList.add('ocupado');
    }

    if (estado === 'disponible') {
      div.addEventListener('click', () => {
        mostrarFormularioReserva(numero, rifaId);
        mostrarSeccion('formularioReserva');
        document.getElementById('numerosContainer').innerHTML = ''; // 🧹 Vacía los números
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Llevar al inicio de la sección
      });
    } else {
      div.style.cursor = 'not-allowed';
    }

    cont.appendChild(div);
  });
}
