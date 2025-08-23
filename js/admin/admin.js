import { manejarFormularioRifa } from './formRifasAdmin.js';
import { supabaseKey, supabase } from './supabaseClient.js';
import { mostrarFormulario, ocultarFormulario, volverAPrincipal, resetearFormularioRifa } from './utilsAdmin.js';
import { prepararModal } from './modalAdmin.js';
import { inicializarBotonIrArriba } from './scrollControlAdmin.js';
import { cargarRifas } from './rifasAdmin.js';

document.addEventListener('DOMContentLoaded', () => {
  prepararModal();

  // Cargar rifas si usuario logueado
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) cargarRifas();
  });

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

  // Función para enviar correo usando Supabase Function
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
      if (!response.ok) console.error('Error al enviar correo:', data.error);
    } catch (error) {
      console.error('Error de red al enviar correo:', error);
    }
  }

  inicializarBotonIrArriba('btnIrArriba', 'descripcionRifa');
});
