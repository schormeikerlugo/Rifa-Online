// js/admin/rifasAdmin.js
import { prepararEdicionRifa } from './editarRifa.js';
import { cargarReservasPorRifa } from './reservasAdmin.js';
import { mostrarReservasUI } from './utilsAdmin.js';      // <<<
import { mostrarModal, mostrarModalConfirmacion } from './modalAdmin.js';
import { supabase } from './supabaseClient.js';

const contenedor = document.getElementById('lista-rifas');
const template  = document.getElementById('rifa-card-template');

export async function cargarRifas() {
  // Loader (puede ser un spinner animado en tu CSS)
  contenedor.innerHTML = `
    <div class="loader-container">
      <div class="loader"></div>
      <p>Cargando rifas...</p>
    </div>
  `;

  const { data, error } = await supabase
    .from('rifas')
    .select('*')
    .order('fecha_inicio');

  contenedor.innerHTML = ''; // limpiar el loader

  // Error al cargar
  if (error) {
    return mostrarModal('Error al cargar rifas.', 'error'); //❌
  }

  // Si no hay rifas disponibles
  if (!data.length) {
    contenedor.innerHTML = `
      <div class="no-rifas">
        <img src="assets/img/no-rifas.gif" alt="No hay rifas" class="gif-no-rifas" />
        <p>No hay rifas disponibles en este momento.</p>
      </div>
    `;
    return;
  }

  // Renderizar rifas
  data.forEach(rifa => {
    const clone = template.content.cloneNode(true);

    // Rellenar datos
    clone.querySelector('img').src = rifa.imagen_url || 'assets/img/default.jpg';
    clone.querySelector('.rifa-titulo').textContent       = rifa.titulo;
    clone.querySelector('.rifa-descripcion').textContent = rifa.descripcion;
    clone.querySelector('.rifa-fecha-inicio').textContent = new Date(rifa.fecha_inicio).toLocaleString();
    clone.querySelector('.rifa-fecha-fin').textContent    = new Date(rifa.fecha_fin).toLocaleString();

    // Botón: ver reservas
    const btnVer = clone.querySelector('.ver-reservas');
    btnVer.dataset.id = rifa.id;
    btnVer.addEventListener('click', () => {
      mostrarReservasUI();
      cargarReservasPorRifa(rifa.id);
    });

    // Botón: eliminar rifa
    const btnDel = clone.querySelector('.eliminar-rifa');
    btnDel.dataset.id = rifa.id;
    btnDel.addEventListener('click', async () => {
      if (!await mostrarModalConfirmacion('¿Eliminar rifa?', 'advertencia', 'eliminar')) return;
      const { error } = await supabase.from('rifas').delete().eq('id', rifa.id);
      if (error) return mostrarModal('No se pudo eliminar.', 'error'); //❌
      mostrarModal('Rifa eliminada.', 'aprobado');
      cargarRifas();
    });

    // Botón: editar rifa
    const btnEdit = clone.querySelector('.editar-rifa');
    btnEdit.dataset.id = rifa.id;
    btnEdit.addEventListener('click', async () => {
      const { data: r, error } = await supabase
        .from('rifas')
        .select('*')
        .eq('id', rifa.id)
        .single();
      if (error) return mostrarModal('No se pudo cargar.', 'error'); //❌
      prepararEdicionRifa(btnEdit, r);
    });

    contenedor.appendChild(clone);
  });
}