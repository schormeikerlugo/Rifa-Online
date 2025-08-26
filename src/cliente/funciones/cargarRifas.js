// js/cargarRifas.js
import { supabase } from '../../../api/supabaseAdmin.js';
import { mostrarNumerosPorRifa } from '../ui/numerosUI.js';
import { mostrarSeccion, crearBarraDeProgreso } from '../ui/uiHelpers.js';

// 🎰 Función principal para cargar rifas y renderizar tarjetas
export async function cargarRifas() {
  const { data, error } = await supabase
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

  // 📅 Función auxiliar para formatear fechas
  function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  contenedor.innerHTML = '';

  // 🔁 Iterar rifas y construir tarjetas visuales
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

    // 👆 Evento para mostrar números al hacer clic
    card.addEventListener('click', () => {
      mostrarNumerosPorRifa(rifa.id, rifa);
      mostrarSeccion('numerosSection');
    });

    contenedor.appendChild(card);
  }

  // 📊 Función para obtener el porcentaje de ocupación de una rifa
async function obtenerPorcentajeOcupado(rifaId) {
  const { data, error } = await supabase
    .from('numeros')
    .select('estado')
    .eq('rifa_id', rifaId);

  if (error || !data) return 0;

  const total = data.length;
  const ocupados = data.filter(n =>
    ['ocupado', 'confirmado', 'pendiente'].includes(n.estado)
  ).length;

  return total > 0 ? Math.round((ocupados / total) * 100) : 0;
}

  // 🎨 Aplicar color dinámico y animación según porcentaje
  setTimeout(() => {
    document.querySelectorAll('.barra-relleno').forEach(barra => {
      const progreso = parseInt(barra.dataset.progreso, 10);
      const contenedor = barra.closest('.barra-progreso');

      let claseColor = 'progreso-bajo';
      let colorBorde = '#00c8ff';

      if (progreso >= 50 && progreso < 80) {
        claseColor = 'progreso-medio';
        colorBorde = '#ff9800';
      } else if (progreso >= 80) {
        claseColor = 'progreso-alto';
        colorBorde = '#f44336';
        contenedor.classList.add('borde-brillante');
      }

      contenedor.style.setProperty('--casino-border', colorBorde);
      barra.classList.add(claseColor, 'animar-carga');
      barra.style.width = '0%';

      requestAnimationFrame(() => {
        barra.style.width = progreso + '%';
        barra.classList.remove('animar-carga');
      });
    });
  }, 50);
}