// js/cargarRifas.js
import { client } from '../../api/supabaseClient.js';
import { mostrarNumerosPorRifa } from '../ui/numerosUI.js';
import { mostrarSeccion, crearBarraDeProgreso } from '../ui/uiHelpers.js';

async function obtenerPorcentajeOcupado(rifaId) {
  const { data, error } = await client
    .from('numeros')
    .select('estado')
    .eq('rifa_id', rifaId);

  if (error || !data) return 0;

  const total = data.length;
  const ocupados = data.filter(n => n.estado === 'ocupado' || n.estado === 'confirmado').length;

  return total > 0 ? Math.round((ocupados / total) * 100) : 0;
}

export async function cargarRifas() {
  const { data, error } = await client
    .from('rifas')
    .select('id, titulo, descripcion, imagen_url, fecha_inicio, fecha_fin, imagenes_extra')
    .order('fecha_inicio', { ascending: true });

  if (error) {
    mostrarModal('Error al cargar rifas.', 'error');
    return;
  }

  const contenedor = document.getElementById('rifasContainer');
  if (!contenedor) {
    mostrarModal('Contenedor de rifas no encontrado.', 'error');
    return;
  }

  function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  contenedor.innerHTML = '';

  // ✅ Usamos for...of para manejar await correctamente
  for (const rifa of data) {
    const card = document.createElement('div');
    card.classList.add('rifa-card');

    const img = document.createElement('img');
    img.src = rifa.imagen_url || 'https://via.placeholder.com/300x150';
    img.alt = rifa.titulo;

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('rifa-info');

    const titulo = document.createElement('h3');
    titulo.classList.add('rifa-titulo');
    titulo.textContent = rifa.titulo;
    infoDiv.appendChild(titulo);

    const porcentaje = await obtenerPorcentajeOcupado(rifa.id);
    const barra = crearBarraDeProgreso(porcentaje);
    infoDiv.appendChild(barra);

    const fechaInicio = document.createElement('p');
    fechaInicio.classList.add('fecha_inicio');
    fechaInicio.innerHTML = `📅 <strong>Inicio:</strong> ${formatearFecha(rifa.fecha_inicio)}`;

    const fechaFin = document.createElement('p');
    fechaFin.classList.add('fecha_fin');
    fechaFin.innerHTML = `📅 <strong>Fin:</strong> ${formatearFecha(rifa.fecha_fin)}`;

    const descripcion = document.createElement('p');
    descripcion.classList.add('rifa-descripcion');
    descripcion.textContent = rifa.descripcion || '';

    infoDiv.appendChild(fechaInicio);
    infoDiv.appendChild(fechaFin);
    infoDiv.appendChild(descripcion);

    card.appendChild(img);
    card.appendChild(infoDiv);

    card.addEventListener('click', () => {
      mostrarNumerosPorRifa(rifa.id, rifa);
      mostrarSeccion('numerosSection');
    });

    contenedor.appendChild(card);
  }

  // ✅ Activar animación y lógica visual de las barras una vez renderizadas
  setTimeout(() => {
    document.querySelectorAll('.barra-relleno').forEach(barra => {
      const progreso = parseInt(barra.dataset.progreso, 10);
      const contenedor = barra.closest('.barra-progreso');

      let colorBorde = '#ccc';

      if (progreso < 50) {
        colorBorde = '#00c8ff';
      } else if (progreso < 80) {
        colorBorde = '#ff9800';
      } else {
        colorBorde = '#f44336';
        contenedor.classList.add('borde-brillante');
      }

      contenedor.style.setProperty('--casino-border', colorBorde);

      barra.classList.add('animar-carga');
      barra.style.width = '0%';

      requestAnimationFrame(() => {
        barra.style.width = progreso + '%';
        barra.classList.remove('animar-carga');
      });
    });
  }, 50);
}

function actualizarListaDeRifas(rifas) {
  const lista = document.getElementById('lista-de-rifas');
  rifas.forEach(rifa => {
    const porcentajeVendido = (rifa.numerosVendidos / rifa.totalNumeros) * 100;
    const barraDeProgreso = crearBarraDeProgreso(porcentajeVendido);
    item.appendChild(barraDeProgreso);
    lista.appendChild(item);
  });
}
