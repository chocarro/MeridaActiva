import React, { useEffect, useState, lazy, Suspense } from 'react';
import { supabase } from '../../supabaseClient';
import 'react-quill/dist/quill.snow.css';
import type { Evento } from '../../types';

// Lazy import para no bloquear el bundle principal
const ReactQuill = lazy(() => import('react-quill'));

const CATEGORIAS = ['Cultural', 'Teatro', 'Música', 'Deportes', 'Infantil', 'Gastronomía', 'Patrimonio'];
const POR_PAGINA = 10;

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};
const QUILL_FORMATS = ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link'];

const FORM_INICIAL = {
  titulo: '',
  descripcion: '',
  fecha: '',
  hora: '',
  ubicacion: '',
  precio: '',
  imagen_url: '',
  enlace_externo: '',
  categoria: 'Cultural',
  animales_permitidos: '', // '' = null (no configurado)
};

// ── Extrae el nombre de archivo de una URL de Supabase Storage ──
const extraerNombreArchivo = (url: string): string | null => {
  try {
    // La URL pública tiene el formato: .../storage/v1/object/public/imagenes-eventos/NOMBRE
    const partes = url.split('/imagenes-eventos/');
    return partes.length > 1 ? decodeURIComponent(partes[1]) : null;
  } catch {
    return null;
  }
};

const GestionEventos: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [totalEventos, setTotalEventos] = useState(0);
  const [paginaActual, setPaginaActual] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [pendienteEliminar, setPendienteEliminar] = useState<string | null>(null);

  const [formData, setFormData] = useState(FORM_INICIAL);

  const totalPaginas = Math.ceil(totalEventos / POR_PAGINA);

  // ── Fetch paginado ──────────────────────────────────────────
  const fetchEventos = async (pagina = paginaActual, q = busqueda) => {
    const from = pagina * POR_PAGINA;
    const to = from + POR_PAGINA - 1;

    let query = supabase
      .from('eventos')
      .select('id, titulo, fecha, hora, imagen_url, categoria, precio, ubicacion, enlace_externo, descripcion, animales_permitidos', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (q.trim()) {
      const safe = q.trim();
      query = query.or(`titulo.ilike.%${safe}%,ubicacion.ilike.%${safe}%,categoria.ilike.%${safe}%`);
    }

    const { data, count, error } = await query;
    if (error) {
      setMensaje('No se pudieron cargar los eventos.');
      return;
    }

    if (data) setEventos(data);
    if (count !== null) setTotalEventos(count);
  };

  useEffect(() => {
    fetchEventos(paginaActual, busqueda);
  }, [paginaActual, busqueda]);

  const cambiarPagina = (nueva: number) => {
    if (nueva < 0 || nueva >= totalPaginas) return;
    setPaginaActual(nueva);
  };

  // ── Subida de imagen ────────────────────────────────────────
  const manejarSubidaImagen = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { error } = await supabase.storage.from('imagenes-eventos').upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('imagenes-eventos').getPublicUrl(fileName);
    return publicUrl;
  };

  // ── Guardar (INSERT / UPDATE) ───────────────────────────────
  const guardarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubiendo(true);
    try {
      let url = formData.imagen_url;

      // Si hay nuevo archivo, borrar el anterior (en edición) y subir el nuevo
      if (archivo) {
        if (editandoId && formData.imagen_url) {
          const nombreViejo = extraerNombreArchivo(formData.imagen_url);
          if (nombreViejo) {
            await supabase.storage.from('imagenes-eventos').remove([nombreViejo]);
          }
        }
        url = await manejarSubidaImagen(archivo);
      }

      // Convertir el string de animales_permitidos a booleano o null
      let animalesFormat = null;
      if (formData.animales_permitidos === 'true') animalesFormat = true;
      if (formData.animales_permitidos === 'false') animalesFormat = false;

      const payload = { ...formData, imagen_url: url, animales_permitidos: animalesFormat };

      if (editandoId) {
        await supabase.from('eventos').update(payload).eq('id', editandoId);
        setMensaje('Evento actualizado correctamente.');
      } else {
        await supabase.from('eventos').insert([payload]);
        setMensaje('Evento creado correctamente.');
      }

      cerrarFormulario();
      fetchEventos(0, busqueda);
      setPaginaActual(0);
    } catch {
      setMensaje('Error al guardar el evento. Comprueba los datos e inténtalo de nuevo.');
    } finally {
      setSubiendo(false);
    }
  };

  const cerrarFormulario = () => {
    setMostrarForm(false);
    setEditandoId(null);
    setArchivo(null);
    setFormData(FORM_INICIAL);
  };

  const prepararEdicion = (ev: Evento) => {
    const formEvent = {
      ...ev,
      hora: ev.hora ?? '',
      precio: ev.precio?.toString() ?? '',
      animales_permitidos: ev.animales_permitidos === true ? 'true' : ev.animales_permitidos === false ? 'false' : ''
    };
    setFormData(formEvent as typeof FORM_INICIAL);
    setEditandoId(ev.id);
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Eliminar con limpieza de Storage ───────────────────────
  const eliminarEvento = async (id: string, imagen_url: string) => {
    setPendienteEliminar(null);
    setEliminando(id);
    try {
      // 1. Borrar imagen del bucket si existe
      if (imagen_url) {
        const nombreArchivo = extraerNombreArchivo(imagen_url);
        if (nombreArchivo) {
          await supabase.storage.from('imagenes-eventos').remove([nombreArchivo]);
        }
      }
      // 2. Borrar fila de BD
      await supabase.from('eventos').delete().eq('id', id);
      fetchEventos(paginaActual, busqueda);
      setMensaje('Evento eliminado correctamente.');
    } catch {
      setMensaje('Error al eliminar el evento.');
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h2 className="text-6xl font-[900] text-brand-dark italic uppercase tracking-tighter leading-none">
              Gestión de <span className="text-brand-blue">Eventos</span>
            </h2>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] mt-4 ml-1">
              {totalEventos} evento{totalEventos !== 1 ? 's' : ''} · Página {paginaActual + 1} de {totalPaginas || 1}
            </p>
          </div>
          <button
            onClick={() => mostrarForm ? cerrarFormulario() : setMostrarForm(true)}
            className="bg-brand-dark text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-brand-blue transition-all shadow-xl active:scale-95"
          >
            {mostrarForm ? 'Cerrar Formulario' : 'Crear Nuevo Evento'}
          </button>
        </header>

        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <i className="bi bi-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => { setPaginaActual(0); setBusqueda(e.target.value); }}
              placeholder="Buscar por título, ubicación o categoría"
              className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-brand-dark outline-none focus:border-brand-blue transition-all"
            />
          </div>
          <button
            onClick={() => fetchEventos(paginaActual, busqueda)}
            className="px-5 py-3 rounded-xl bg-brand-dark text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue transition-all"
          >
            <i className="bi bi-arrow-clockwise mr-2" />Recargar
          </button>
        </div>

        {mensaje && (
          <div className="mb-8 bg-brand-blue/10 border border-brand-blue/20 rounded-2xl px-5 py-3">
            <p className="text-[11px] font-black uppercase tracking-widest text-brand-blue">{mensaje}</p>
          </div>
        )}

        {/* ── FORMULARIO BENTO ── */}
        {mostrarForm && (
          <div className="bg-white rounded-[3.5rem] p-10 md:p-16 border border-slate-100 shadow-2xl mb-12 animate-in slide-in-from-top duration-500">
            <form onSubmit={guardarEvento} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Título */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Título del Evento *</label>
                  <input
                    required
                    className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 font-bold text-brand-dark focus:ring-2 focus:ring-brand-blue outline-none"
                    value={formData.titulo}
                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  />
                </div>

                {/* Descripción con editor enriquecido */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                    Descripción <span className="font-bold normal-case tracking-normal text-slate-300">(soporta negritas, listas y enlaces)</span>
                  </label>
                  <div className="rounded-2xl overflow-hidden border border-slate-100 bg-white">
                    <Suspense fallback={
                      <div className="h-40 bg-brand-bg rounded-2xl flex items-center justify-center">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Cargando editor…</span>
                      </div>
                    }>
                      <ReactQuill
                        theme="snow"
                        value={formData.descripcion}
                        onChange={(val) => setFormData({ ...formData, descripcion: val })}
                        modules={QUILL_MODULES}
                        formats={QUILL_FORMATS}
                        style={{ fontFamily: 'inherit' }}
                      />
                    </Suspense>
                  </div>
                </div>

                {/* Fecha + Hora + Precio */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Fecha</label>
                    <input
                      type="date"
                      className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 font-bold text-brand-dark outline-none"
                      value={formData.fecha}
                      onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Hora</label>
                    <input
                      type="time"
                      className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 font-bold text-brand-dark outline-none"
                      value={formData.hora}
                      onChange={e => setFormData({ ...formData, hora: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Precio (€)</label>
                    <input
                      className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 font-bold text-brand-dark outline-none"
                      value={formData.precio}
                      placeholder="Gratis / 5 €"
                      onChange={e => setFormData({ ...formData, precio: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Ubicación */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Ubicación</label>
                  <input
                    className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 font-bold text-brand-dark outline-none"
                    value={formData.ubicacion}
                    onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
                  />
                </div>

                {/* Enlace externo */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Enlace externo (URL)</label>
                  <input
                    type="url"
                    className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 font-bold text-brand-dark outline-none"
                    value={formData.enlace_externo}
                    placeholder="https://..."
                    onChange={e => setFormData({ ...formData, enlace_externo: e.target.value })}
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Categoría</label>
                  <select
                    className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 font-bold text-brand-dark outline-none appearance-none"
                    value={formData.categoria}
                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                  >
                    {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* Animales */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Acceso de Animales</label>
                  <select
                    className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 font-bold text-brand-dark outline-none appearance-none"
                    value={formData.animales_permitidos}
                    onChange={e => setFormData({ ...formData, animales_permitidos: e.target.value })}
                  >
                    <option value="">No configurado / Consultar</option>
                    <option value="true">Permitido (🐾)</option>
                    <option value="false">No permitido (🚫)</option>
                  </select>
                </div>

                {/* Imagen */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                    Imagen {editandoId && formData.imagen_url ? '(sube una nueva para reemplazar la actual)' : ''}
                  </label>
                  {editandoId && formData.imagen_url && (
                    <img src={formData.imagen_url} alt="" className="w-20 h-20 rounded-2xl object-cover mb-3 border border-slate-100" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setArchivo(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-brand-blue file:text-white hover:file:bg-brand-dark transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={subiendo}
                  className="w-full bg-brand-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:shadow-brand-blue/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {subiendo ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                      Procesando…
                    </>
                  ) : editandoId ? 'Guardar Cambios' : 'Publicar Evento'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TABLA DE EVENTOS ── */}
        <div className="bg-white rounded-[3.5rem] overflow-hidden border border-slate-100 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-12 py-8">Evento</th>
                <th className="px-8 py-8">Categoría</th>
                <th className="px-8 py-8">Inversión</th>
                <th className="px-12 py-8 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {eventos.map(ev => (
                <tr key={ev.id} className="group hover:bg-brand-bg/50 transition-colors">
                  <td className="px-12 py-6">
                    <div className="flex items-center gap-4">
                      {ev.imagen_url ? (
                        <img src={ev.imagen_url} className="w-14 h-14 rounded-2xl object-cover shadow-sm flex-shrink-0" alt="" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <i className="bi bi-image text-slate-300" />
                        </div>
                      )}
                      <div>
                        <p className="font-[900] text-brand-dark uppercase italic leading-none mb-1">{ev.titulo}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-tighter">
                          {ev.fecha ? new Date(ev.fecha).toLocaleDateString('es-ES') : '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-black text-brand-blue uppercase italic">{ev.categoria}</td>
                  <td className="px-8 py-6 font-black text-brand-dark">{ev.precio || '—'}</td>
                  <td className="px-12 py-6 text-right">
                    <button
                      onClick={() => prepararEdicion(ev as Evento)}
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-brand-blue hover:text-white transition-all mr-2"
                      title="Editar"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    {pendienteEliminar === ev.id ? (
                      <span className="inline-flex gap-1">
                        <button
                          onClick={() => eliminarEvento(ev.id, ev.imagen_url)}
                          className="px-3 py-2 rounded-xl bg-brand-red text-white text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                        >
                          Borrar
                        </button>
                        <button
                          onClick={() => setPendienteEliminar(null)}
                          className="px-3 py-2 rounded-xl bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                        >
                          No
                        </button>
                      </span>
                    ) : (
                    <button
                      onClick={() => setPendienteEliminar(ev.id)}
                      disabled={eliminando === ev.id}
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-brand-red hover:text-white transition-all disabled:opacity-40"
                      title="Eliminar"
                    >
                      {eliminando === ev.id
                        ? <svg className="animate-spin w-4 h-4 mx-auto" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
                        : <i className="bi bi-trash3" />}
                    </button>
                    )}
                  </td>
                </tr>
              ))}
              {eventos.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">
                    No hay eventos en esta página
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ── PAGINACIÓN ── */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between px-12 py-6 border-t border-slate-50">
              <button
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-bg text-brand-dark font-black text-[10px] uppercase tracking-widest hover:bg-brand-dark hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <i className="bi bi-chevron-left" /> Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPaginas }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => cambiarPagina(i)}
                    className={`w-8 h-8 rounded-lg font-black text-[10px] transition-all ${i === paginaActual ? 'bg-brand-dark text-white' : 'text-slate-400 hover:bg-brand-bg'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual >= totalPaginas - 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-bg text-brand-dark font-black text-[10px] uppercase tracking-widest hover:bg-brand-dark hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Siguiente <i className="bi bi-chevron-right" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GestionEventos;