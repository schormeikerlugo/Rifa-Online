// 📁 formRifasAdmin.js
import { supabase } from './supabaseClient.js';
import { mostrarModal } from './modalAdmin.js';
import { ocultarFormulario } from './utilsAdmin.js';
import { cargarRifas } from './rifasAdmin.js';
import { callFn } from './callFn.js';

export function manejarFormularioRifa(formRifa) {
  formRifa.addEventListener('submit', async e => {
    e.preventDefault();

    const id = formRifa.dataset.editando === 'true' ? formRifa.dataset.rifaId : null;
    const titulo = formRifa.titulo.value.trim();
    const descripcion = formRifa.descripcion.value.trim();
    const fechaInicio = formRifa.fecha_inicio.value;
    const fechaFin = formRifa.fecha_fin.value;
    const imagenFile = formRifa.imagen_rifa.files[0];
    const extrasFiles = formRifa.imagenesExtra.files;

    if (!titulo || !descripcion || !fechaInicio || !fechaFin) {
      mostrarModal('Completa todos los campos.', 'info'); //⚠️
      return;
    }

    // 📤 Subir imágenes
    let imagenUrl = formRifa.dataset.imagenActual || null;
    if (imagenFile) {
      const path = `rifas/${Date.now()}_${imagenFile.name}`;
      const { error: upErr } = await supabase.storage.from('comprobantes').upload(path, imagenFile);
      if (upErr) { mostrarModal('Error al subir imagen.', 'error'); return; } //❌
      imagenUrl = supabase.storage.from('comprobantes').getPublicUrl(path).data.publicUrl;
    }

    let extrasUrls = JSON.parse(formRifa.dataset.imagenesExtrasActuales || '[]');
    if (extrasFiles.length) {
      extrasUrls = [];
      for (const file of extrasFiles) {
        const path = `rifas/extras/${Date.now()}_${file.name}`;
        const { error: err } = await supabase.storage.from('comprobantes').upload(path, file);
        if (err) { mostrarModal(`Error al subir extra ${file.name}`, 'error'); return; } //❌
        extrasUrls.push(supabase.storage.from('comprobantes').getPublicUrl(path).data.publicUrl);
      }
    }

    // 📦 Preparar payload
    const payload = { 
      titulo, 
      descripcion, 
      fecha_inicio: fechaInicio, 
      fecha_fin: fechaFin 
    };
    if (imagenUrl) payload.imagen_url = imagenUrl;
    if (extrasUrls.length) payload.imagenes_extra = extrasUrls;

    // ✏️ Editar
    if (id) {
      const { error } = await callFn('admin-update-rifa', { id, ...payload });
      if (error) return mostrarModal('No se pudo actualizar.', 'error'); //❌
      mostrarModal('Rifa actualizada con éxito.', 'aprobado'); //✅
    } 
    // 🆕 Crear
    else {
      if (!imagenUrl) { mostrarModal('Debes subir imagen principal.', 'info'); return; } //❌
      const cantidadNumeros = parseInt(formRifa.cantidad_numeros.value);
      const { error } = await callFn('admin-create-rifa', { ...payload, cantidad_numeros: cantidadNumeros });
      if (error) return mostrarModal('No se creó la rifa.', 'error'); //❌
      mostrarModal(`Felicidades, has creado tu rifa con ${cantidadNumeros} números.`, 'enviado'); 
    }

    // 🔄 Refrescar listado
    ocultarFormulario();
    cargarRifas();
  });
}