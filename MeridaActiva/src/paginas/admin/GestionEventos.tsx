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
      let finalImageUrl = formData.imagen_url;
      if (archivo) finalImageUrl = await manejarSubidaImagen(archivo);

      const payload = { ...formData, imagen_url: finalImageUrl, precio: parseFloat(formData.precio) || 0 };

      if (editandoId) {
        await supabase.from('eventos').update(payload).eq('id', editandoId);
      } else {
        await supabase.from('eventos').insert([payload]);
      }
      limpiarFormulario();
      fetchEventos();
      setMostrarForm(false);
    } catch (error) {
      alert("Error al guardar");
    } finally {
      setSubiendo(false);
    }
  };

  const eliminarEvento = async (id: string) => {
    if (window.confirm("¿Eliminar este evento?")) {
      await supabase.from('eventos').delete().eq('id', id);
      fetchEventos();
    }
  };

  const prepararEdicion = (ev: any) => {
    setEditandoId(ev.id);
    setFormData({
      titulo: ev.titulo,
      descripcion: ev.descripcion,
      fecha: ev.fecha,
      ubicacion: ev.ubicacion,
      precio: ev.precio.toString(),
      imagen_url: ev.imagen_url,
      enlace_externo: ev.enlace_externo || '',
      categoria: ev.categoria
    });
    setMostrarForm(true);
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setArchivo(null);
    setFormData({ titulo: '', descripcion: '', fecha: '', ubicacion: '', precio: '', imagen_url: '', enlace_externo: '', categoria: 'Cultural' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Agenda</h2>
            <p className="text-slate-500 font-medium">Control total de eventos y actividades</p>
          </div>
          <button 
            onClick={() => { editandoId ? limpiarFormulario() : setMostrarForm(!mostrarForm) }}
            className={`px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${mostrarForm ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-900'}`}
          >
            {mostrarForm ? 'CANCELAR' : 'NUEVO EVENTO'}
          </button>
        </div>

        {mostrarForm && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-12 mb-12 animate-fade-in">
            <form onSubmit={guardarEvento} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <input type="text" placeholder="Título" className="w-full bg-slate-100 border-none rounded-xl p-4" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} required />
                <textarea placeholder="Descripción" className="w-full bg-slate-100 border-none rounded-xl p-4" rows={4} value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})}></textarea>
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" className="bg-slate-100 border-none rounded-xl p-4" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} required />
                  <input type="number" placeholder="Precio €" className="bg-slate-100 border-none rounded-xl p-4" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} />
                </div>
              </div>
              <div className="space-y-6">
                <input type="text" placeholder="Ubicación" className="w-full bg-slate-100 border-none rounded-xl p-4" value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} />
                <select className="w-full bg-slate-100 border-none rounded-xl p-4" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                  <option value="Cultural">Cultural</option>
                  <option value="Música">Música</option>
                  <option value="Deportes">Deportes</option>
                </select>
                <input type="file" className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-900 file:text-white" onChange={e => setArchivo(e.target.files ? e.target.files[0] : null)} />
                <button type="submit" disabled={subiendo} className="w-full bg-amber-500 text-slate-900 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                  {subiendo ? 'PROCESANDO...' : (editandoId ? 'GUARDAR CAMBIOS' : 'PUBLICAR AHORA')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-6">Evento</th>
                <th className="px-8 py-6">Categoría</th>
                <th className="px-8 py-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eventos.map(ev => (
                <tr key={ev.id} className="hover:bg-slate-50">
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-900">{ev.titulo}</p>
                    <p className="text-xs text-slate-400">{ev.fecha}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border border-slate-200">{ev.categoria}</span>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button onClick={() => prepararEdicion(ev)} className="p-2 text-slate-400 hover:text-amber-500"><i className="bi bi-pencil-fill"></i></button>
                    <button onClick={() => eliminarEvento(ev.id)} className="p-2 text-slate-400 hover:text-rose-500"><i className="bi bi-trash-fill"></i></button>
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