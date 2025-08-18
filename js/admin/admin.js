// 📁 admin.js

import { manejarFormularioRifa } from './formRifasAdmin.js';
import { cargarReservasPorRifa, aprobarReserva, rechazarReserva } from './reservasAdmin.js';
import { supabaseKey, supabase } from './supabaseClient.js';
import { mostrarModalMensajeEditable } from './modalAdmin.js';
import { mostrarFormulario, ocultarFormulario, volverAPrincipal, resetearFormularioRifa } from './utilsAdmin.js';
import { prepararModal } from './modalAdmin.js';
import { inicializarBotonIrArriba } from './scrollControlAdmin.js';
import { cargarRifas } from './rifasAdmin.js';

document.addEventListener('DOMContentLoaded', () => {

  prepararModal();       // 🎬 Inicializar eventos de modal

  // Cargar rifas al iniciar
  
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      // El usuario ha iniciado sesión, así que puedes cargar las rifas
      cargarRifas();
    }
  });

  // Manejo del formulario
  const formRifa = document.getElementById('form-rifa');
  

  // Crear nueva rifa
  document.getElementById('btn-crear')?.addEventListener('click', () => {  
    mostrarFormulario();
    resetearFormularioRifa(formRifa);
  });

  // Botón volver
  document.getElementById('btn-volver')?.addEventListener('click', () => {
    ocultarFormulario();
    volverAPrincipal();
    resetearFormularioRifa(formRifa);
  });

  // Manejo de formulario rifa
  if (formRifa) manejarFormularioRifa(formRifa);
  /**
   * Envía un correo al cliente usando la Supabase Function 'send-email'.
   * @param {string} to - Correo del cliente
   * @param {string} subject - Asunto del correo
   * @param {string} text - Mensaje del correo
   */
  async function enviarCorreoCliente(to, subject, text) {
    try {
      const response = await fetch('https://wvebiyuoszwzsxavoitp.supabase.co/functions/v1/resend-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ to, subject, text })
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Correo enviado:', data.message);
      } else {
        console.error('Error al enviar correo:', data.error);
      }
    } catch (error) {
      console.error('Error de red al enviar correo:', error);
    }
  }

  // Filtros de reservas
  document.querySelectorAll('#filtrosReservas .filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      const filtro = btn.dataset.filtro;
      const rifaId = document.getElementById('lista-reservas').dataset.rifaId;
      cargarReservasPorRifa(rifaId, filtro);
    });
  });

  // Eventos delegados para aprobar/rechazar reservas
  const lista = document.getElementById('lista-reservas');
  if (lista) {
    lista.addEventListener('click', async e => {
      const btn = e.target;
      const rifaId = lista.dataset.rifaId;
      const filtroActual = lista.dataset.filtro || 'pendiente';

      if (btn.matches('.aprobar')) {
          const reservaId = btn.dataset.id;
          const ok = await aprobarReserva(reservaId);
          if (ok) {
            // Obtener datos de la reserva para el correo
            const { data } = await supabase
              .from('numeros')
              .select('correo_cliente, nombre_cliente')
              .eq('id', reservaId)
              .single();
            if (data && data.correo_cliente) {
              const asunto = 'Reserva aprobada';
              const mensajePredeterminado = `Hola ${data.nombre_cliente || ''}, tu reserva ha sido aprobada. ¡Gracias por participar!`;
              const mensajeFinal = await mostrarModalMensajeEditable(mensajePredeterminado, 'Mensaje para cliente');
              if (mensajeFinal) {
                enviarCorreoCliente(data.correo_cliente, asunto, mensajeFinal);
              }
            }
            await cargarReservasPorRifa(rifaId, filtroActual);
          }
      }

      if (btn.matches('.rechazar')) {
          const reservaId = btn.dataset.id;
          // Obtener datos de la reserva antes de rechazar
          const { data } = await supabase
            .from('numeros')
            .select('correo_cliente, nombre_cliente')
            .eq('id', reservaId)
            .single();
          const ok = await rechazarReserva(reservaId);
          if (ok) {
            if (data && data.correo_cliente) {
              const asunto = 'Reserva rechazada';
              const mensajePredeterminado = `Hola ${data.nombre_cliente || ''}, lamentamos informarte que tu reserva ha sido rechazada. Puedes intentar con otro número.`;
              const mensajeFinal = await mostrarModalMensajeEditable(mensajePredeterminado, 'Mensaje para cliente');
              if (mensajeFinal) {
                enviarCorreoCliente(data.correo_cliente, asunto, mensajeFinal);
              }
            }
            await cargarReservasPorRifa(rifaId, filtroActual);
          }
      }
    });
  }
  inicializarBotonIrArriba('btnIrArriba', 'descripcionRifa'); // Cambia 'descripcionRifa' por el id real de la descripción si lo tienes, o quítalo para ir al top
});
