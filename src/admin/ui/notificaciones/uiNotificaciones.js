const btnNotificaciones = document.getElementById("btnNotificaciones");
const listaNotificaciones = document.getElementById("listaNotificaciones");

/**
 * Mostrar/ocultar dropdown al hacer click en la campana
 */
export function initNotificacionesUI() {
  btnNotificaciones.addEventListener("click", () => {
    if (listaNotificaciones.style.display === "block") {
      listaNotificaciones.style.display = "none";
    } else {
      listaNotificaciones.style.display = "block";
    }
  });

  // Cerrar dropdown al hacer click fuera
  document.addEventListener("click", (e) => {
    if (!btnNotificaciones.contains(e.target) && !listaNotificaciones.contains(e.target)) {
      listaNotificaciones.style.display = "none";
    }
  });
}

/**
 * Renderizar notificaciones (añade clases de estilo según estado)
 */
export function renderNotificacionesUI(notificaciones, contadorElement) {
  listaNotificaciones.innerHTML = "";

  if (!notificaciones || notificaciones.length === 0) {
    listaNotificaciones.innerHTML = "<li>No hay notificaciones nuevas</li>";
    contadorElement.textContent = "0";
    return;
  }

  contadorElement.textContent = notificaciones.filter(n => !n.leido).length;

  notificaciones.forEach(n => {
    const li = document.createElement("li");
    li.classList.add(n.leido ? "notificacion-leida" : "notificacion-no-leida");
    li.innerHTML = `
      <span class="notificacion-titulo">${n.titulo}</span><br>
      <span class="notificacion-mensaje">${n.mensaje}</span><br>
      <small class="notificacion-fecha">${new Date(n.created_at).toLocaleString()}</small>
      ${n.leido ? "" : `<button data-id="${n.id}" class="marcar-leida">Marcar como leída</button>`}
    `;
    listaNotificaciones.appendChild(li);
  });
}
