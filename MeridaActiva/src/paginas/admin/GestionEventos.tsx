import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const GestionEventos: React.FC = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    ubicacion: '',
    precio: '',
    imagen_url: '',
    enlace_externo: '',
    categoria: 'Cultural'
  });

  useEffect(() => { fetchEventos(); }, []);

  const fetchEventos = async () => {
    const { data } = await supabase.from('eventos').select('*').order('created_at', { ascending: false });
    if (data) setEventos(data);
  };

  const manejarSubidaImagen = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from('imagenes-eventos').upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('imagenes-eventos').getPublicUrl(fileName);
    return publicUrl;
  };

  const guardarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubiendo(true);
    try {
      let url = formData.imagen_url;
      if (archivo) url = await manejarSubidaImagen(archivo);

      const payload = { ...formData, imagen_url: url };

      if (editandoId) {
        await supabase.from('eventos').update(payload).eq('id', editandoId);
      } else {
        await supabase.from('eventos').insert([payload]);
      }

      setMostrarForm(false);
      setEditandoId(null);
      setArchivo(null);
      setFormData({ titulo: '', descripcion: '', fecha: '', ubicacion: '', precio: '', imagen_url: '', enlace_externo: '', categoria: 'Cultural' });
      fetchEventos();
    } catch (error) {
      alert("Error al guardar");
    } finally {
      setSubiendo(false);
    }
  };

  const prepararEdicion = (ev: any) => {
    setFormData(ev);
    setEditandoId(ev.id);
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminarEvento = async (id: string) => {
    if (window.confirm('¿Eliminar este evento permanentemente?')) {
      await supabase.from('eventos').delete().eq('id', id);
      fetchEventos();
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
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] mt-4 ml-1">Control de cartelera y agenda</p>
          </div>
          
          <button 
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-brand-dark text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-brand-blue transition-all shadow-xl active:scale-95"
          >
            {mostrarForm ? 'Cerrar Formulario' : 'Crear Nuevo Evento'}
          </button>
        </header>

        {/* FORMULARIO ESTILO BENTO */}
        {mostrarForm && (
          <div className="bg-white rounded-[3.5rem] p-10 md:p-16 border border-slate-100 shadow-2xl mb-12 animate-in slide-in-from-top duration-500">
            <form onSubmit={guardarEvento} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Título del Evento</label>
                  <input required className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 font-bold text-brand-dark focus:ring-2 focus:ring-brand-blue outline-none" 
                    value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Descripción</label>
                  <textarea rows={4} className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 font-bold text-brand-dark focus:ring-2 focus:ring-brand-blue outline-none" 
                    value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Fecha</label>
                    <input type="date" className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 font-bold text-brand-dark outline-none" 
                      value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Precio (€)</label>
                    <input className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 font-bold text-brand-dark outline-none" 
                      value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Ubicación</label>
                  <input className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 font-bold text-brand-dark outline-none" 
                    value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Categoría</label>
                  <select className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 font-bold text-brand-dark outline-none appearance-none" 
                    value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                    <option>Cultural</option>
                    <option>Teatro</option>
                    <option>Música</option>
                    <option>Deportes</option>
                    <option>Infantil</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Imagen del Evento</label>
                  <input type="file" onChange={e => setArchivo(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-brand-blue file:text-white hover:file:bg-brand-dark transition-all" />
                </div>
                <button disabled={subiendo} className="w-full bg-brand-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:shadow-brand-blue/20 transition-all disabled:opacity-50">
                  {subiendo ? 'Procesando...' : (editandoId ? 'Guardar Cambios' : 'Publicar Evento')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LISTADO DE EVENTOS */}
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
                      <img src={ev.imagen_url} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt="" />
                      <div>
                        <p className="font-[900] text-brand-dark uppercase italic leading-none mb-1">{ev.titulo}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-tighter">{new Date(ev.fecha).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-black text-brand-blue uppercase italic">{ev.categoria}</td>
                  <td className="px-8 py-6 font-black text-brand-dark">{ev.precio}</td>
                  <td className="px-12 py-6 text-right">
                    <button onClick={() => prepararEdicion(ev)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-brand-blue hover:text-white transition-all mr-2"><i className="bi bi-pencil-square"></i></button>
                    <button onClick={() => eliminarEvento(ev.id)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-brand-red hover:text-white transition-all"><i className="bi bi-trash3"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GestionEventos;