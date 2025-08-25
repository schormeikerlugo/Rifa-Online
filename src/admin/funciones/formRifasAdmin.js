// 📁 formRifasAdmin.js
import { supabase } from '../../../js/supabaseAdmin.js';
import { mostrarModal } from '../ui/modal/modalAdmin.js';
import { ocultarFormulario } from '../ui/utilsAdmin.js';
import { cargarRifas } from './rifasAdmin.js';
import { crearRifa, editarRifa } from '../../../js/supabaseFunctions.js';

export function manejarFormularioRifa(formRifa) {
  formRifa.addEventListener('submit', async e => {
    e.preventDefault();

    const id = formRifa.dataset.editando === 'true' ? formRifa.dataset.rifaId : null;
    const titulo = formRifa.titulo.value.trim();
    const descripcion = formRifa.descripcion.value.trim();
    const fecha_inicio = formRifa.fecha_inicio.value;
    const fecha_fin = formRifa.fecha_fin.value;
    const imagenFile = formRifa.imagen_rifa.files[0];
    const extrasFiles = formRifa.imagenesExtra.files;

    if (!titulo || !descripcion || !fecha_inicio || !fecha_fin) {
      mostrarModal('Completa todos los campos.', 'info');
      return;
    }

    // 📤 Subir imagen principal
    let imagen_url = formRifa.dataset.imagenActual || null;
    if (imagenFile) {
      const path = `rifas/${Date.now()}_${imagenFile.name}`;
      const { error: upErr } = await supabase.storage.from('comprobantes').upload(path, imagenFile);
      if (upErr) { mostrarModal('Error al subir imagen principal.', 'error'); return; }

      const { data, error: urlErr } = supabase.storage.from('comprobantes').getPublicUrl(path);
      if (urlErr) { mostrarModal('Error obteniendo URL pública de la imagen principal.', 'error'); return; }

      imagen_url = data?.publicUrl;
    }

    // 📤 Subir imágenes extras
    let imagenes_extra = [];
    if (extrasFiles.length) {
      for (const file of extrasFiles) {
        const path = `rifas/extras/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from('comprobantes').upload(path, file);
        if (error) { mostrarModal(`Error al subir imagen extra ${file.name}`, 'error'); return; }

        const { data, error: urlErr } = supabase.storage.from('comprobantes').getPublicUrl(path);
        if (urlErr) { mostrarModal(`Error obteniendo URL pública de ${file.name}`, 'error'); return; }

        imagenes_extra.push(data?.publicUrl);
      }
    }

    // 📌 Payload base
    const payload = { titulo, descripcion, fecha_inicio, fecha_fin };
    if (imagen_url) payload.imagen_url = imagen_url;
    if (imagenes_extra.length) payload.imagenes_extra = imagenes_extra;

    if (id) {
      // Edición
      const ok = await editarRifa(id, payload);
      if (!ok) return;
      mostrarModal('Rifa actualizada con éxito.', 'aprobado');
    } else {
      // Creación
      const cantidadNumeros = parseInt(formRifa.cantidad_numeros.value);
      if (!imagen_url) { mostrarModal('Debes subir imagen principal.', 'info'); return; }
      if (isNaN(cantidadNumeros) || cantidadNumeros <= 0) {
        mostrarModal('Debes ingresar una cantidad válida de números.', 'info');
        return;
      }

      const nuevaRifa = { ...payload, cantidadNumeros };
      const ok = await crearRifa(nuevaRifa);
      if (!ok) return;
      mostrarModal(`Rifa creada con ${cantidadNumeros} números.`, 'aprobado');
    }

    ocultarFormulario();
    cargarRifas();
  });
}
