// loginAdmin.js

import { supabase } from '../../api/supabaseAdmin.js'
import { mostrarModal } from '../ui/modal/modalAdmin.js'
import { mostrarElemento, ocultarElemento } from '../ui/uiAdminHelpers.js'
import { cargarRifas } from '../funciones/rifasAdmin.js';


// ✅ Configura aquí tu correo de administrador
const ADMIN_EMAIL = 'schormeikerl@gmail.com'

// 🎯 Elementos DOM
const loginSection = document.getElementById('admin-login')
const panelSection = document.getElementById('admin-panel')
const loginForm = document.getElementById('login-form')
const logoutBtn = document.getElementById('btn-logout')

const header             = document.getElementById('admin-header');
const seccionPrincipal   = document.getElementById('seccion-principal');
const seccionFormulario  = document.getElementById('seccion-formulario');
const listaReservas      = document.getElementById('lista-reservas');
const accionesAdmin      = document.getElementById('acciones-admin');
const btnVolver          = document.getElementById('btn-volver');


// 🔐 Iniciar sesión

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = document.getElementById('login-email').value.trim()
    const password = document.getElementById('login-password').value.trim()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    cargarRifas();         // 🚀 Cargar rifas al inicio

    if (error || data?.user?.email !== ADMIN_EMAIL) {
      mostrarModal('⚠️ Acceso restringido al administrador', 'advertencia')
      await supabase.auth.signOut()
      return
    }

    ocultarElemento(loginSection);
    mostrarElemento(header);
    mostrarElemento(seccionPrincipal);
    mostrarElemento(accionesAdmin);
    

    // ✅ Mostrar panel y ocultar login con animación
    ocultarElemento('#admin-login')
    mostrarElemento('#admin-panel')


    
  })

  // 📌 Verificar sesión activa al cargar
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user?.email === ADMIN_EMAIL) {
      ocultarElemento(loginSection);
      mostrarElemento(header);
      mostrarElemento(seccionPrincipal);
      mostrarElemento(accionesAdmin);
    }
  })
}

// 🔓 Cerrar sesión

const btnLogout = document.getElementById('btn-logout');

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut()

    // 🔄 Animación visual para volver al login
    ocultarElemento(header);
    ocultarElemento(seccionPrincipal);
    ocultarElemento(seccionFormulario);
    ocultarElemento(listaReservas);
    ocultarElemento(accionesAdmin);
    ocultarElemento(btnVolver);

    mostrarElemento(loginSection);
    
        // ✅ Resetear el formulario
    loginForm.reset();

    // 🔒 Asegurar que no haya scroll sobrante
    document.body.style.overflow = 'hidden'
    document.body.style.overflowX = 'hidden'
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  })
}
