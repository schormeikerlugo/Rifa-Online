// 📁 rifasAdmin.js
import { mostrarModal, mostrarModalConfirmacion } from './modalAdmin.js';
import { obtenerRifas, eliminarRifa } from './supabaseFunctions.js';
import { cargarReservas } from './reservasAdmin.js';
// 👇 Importa la función para abrir el formulario de edición
import { abrirFormularioEdicion } from './editarRifa.js';

/**
 * 📌 Cargar rifas en la interfaz usando el template HTML
 */
export async function cargarRifas() {
  try {
    const rifas = await obtenerRifas();
    const contenedor = document.getElementById("lista-rifas");
    const template = document.getElementById("rifa-card-template");

    if (!contenedor || !template) {
      console.error("⚠️ No se encontró el contenedor #lista-rifas o el template #rifa-card-template");
      return;
    }

    contenedor.innerHTML = "";

    if (rifas.length === 0) {
      contenedor.innerHTML = `
        <div class="no-rifas">
          <img src="assets/img/no-rifas.gif" alt="No hay rifas" class="gif-no-rifas" />
          <p>No hay rifas disponibles en este momento.</p>
        </div>
      `;
      return;
    }

    rifas.forEach(rifa => {
      const clone = template.content.cloneNode(true);

      // Rellenar datos
      const img = clone.querySelector("img");
      img.src = rifa.imagen_url || "assets/img/default.jpg";
      img.alt = `Imagen de ${rifa.titulo}`;

      clone.querySelector(".rifa-titulo").textContent = rifa.titulo;
      clone.querySelector(".rifa-descripcion").textContent = rifa.descripcion || "Sin descripción";
      clone.querySelector(".rifa-fecha-inicio").textContent = new Date(rifa.fecha_inicio).toLocaleString();
      clone.querySelector(".rifa-fecha-fin").textContent = new Date(rifa.fecha_fin).toLocaleString();

      // Crear botones dinámicos
      const btnContainer = document.createElement("div");
      btnContainer.classList.add("admin-rifa-btns");

      // 🔹 Cambiado: ahora abre el formulario de edición
      const btnEditar = document.createElement("button");
      btnEditar.textContent = "Editar";
      btnEditar.classList.add("btn", "btn-accent");
      btnEditar.addEventListener("click", () => {
        abrirFormularioEdicion(rifa); // 👈 aquí abrimos el modal con los datos de la rifa
      });
      btnContainer.appendChild(btnEditar);

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "Eliminar";
      btnEliminar.classList.add("btn", "btn-danger");
      btnEliminar.addEventListener("click", async () => {
        const confirmar = await mostrarModalConfirmacion("¿Seguro que deseas eliminar esta rifa?");
        if (confirmar) {
          const result = await eliminarRifa(rifa.id);
          if (result) mostrarModal("✅ Rifa eliminada con éxito");
          cargarRifas();
        }
      });
      btnContainer.appendChild(btnEliminar);

      const btnVerReserva = document.createElement("button");
      btnVerReserva.textContent = "Ver reservas";
      btnVerReserva.classList.add("btn", "btn-outline");
      btnVerReserva.addEventListener("click", async () => {
        await cargarReservas(rifa.id);
      });
      btnContainer.appendChild(btnVerReserva);

      // Insertar los botones en el card
      clone.querySelector(".admin-rifa-card").appendChild(btnContainer);

      contenedor.appendChild(clone);
    });
  } catch (error) {
    console.error("❌ Error al cargar las rifas:", error);
  }
}