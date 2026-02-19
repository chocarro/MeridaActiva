import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import FormularioReseña from '../../componentes/FormularioReseña'; // Ruta corregida

const DetalleEvento: React.FC = () => {
  const { id } = useParams(); 
  const [evento, setEvento] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [comentarios, setComentarios] = useState<any[]>([]);

  const fetchEventoData = async () => {
    // 1. Cargar datos del evento
    const { data: eventoData } = await supabase.from('eventos').select('*').eq('id', id).single();
    if (eventoData) setEvento(eventoData);

    // 2. Cargar comentarios de este evento
    const { data: comentariosData } = await supabase
      .from('comentarios')
      .select('*')
      .eq('evento_id', id)
      .order('created_at', { ascending: false });

    if (comentariosData) setComentarios(comentariosData);
    setCargando(false);
  };

  useEffect(() => {
    fetchEventoData();
  }, [id]);

  if (cargando) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Cargando...</div>;
  if (!evento) return <div className="min-h-screen flex items-center justify-center font-black">Evento no encontrado</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/eventos" className="hover:text-amber-500 transition-colors">Eventos</Link>
          <span>/</span>
          <span className="text-slate-900">{evento.titulo}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Columna Izquierda */}
          <div className="lg:col-span-8">
            <div className="rounded-[3rem] overflow-hidden shadow-2xl mb-12 h-[500px]">
              <img src={evento.imagen_url} className="w-full h-full object-cover" alt={evento.titulo} />
            </div>

            <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-tight">{evento.titulo}</h1>
            <p className="text-xl text-amber-600 font-bold mb-10 flex items-center gap-2">
              📍 {evento.ubicacion}
            </p>
            
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm mb-16">
              <h5 className="text-xl font-black mb-6 border-b border-slate-50 pb-4 uppercase tracking-tight">Sobre este evento</h5>
              <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-line">
                {evento.descripcion}
              </p>
            </div>

            {/* SECCIÓN DE RESEÑAS */}
            <section className="mt-16">
              <h2 className="text-3xl font-black mb-10 tracking-tight uppercase">Opiniones</h2>
              
              <FormularioReseña 
                eventoId={id || ''} 
                onPublicado={fetchEventoData} 
              />

              <div className="space-y-6 mt-12">
                {comentarios.length > 0 ? (
                  comentarios.map((res) => (
                    <div key={res.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-900 text-amber-500 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                            {res.nombre_usuario?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{res.nombre_usuario}</h4>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                              {new Date(res.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-amber-500 text-lg">
                          {"★".repeat(res.puntuacion)}{"☆".repeat(5 - res.puntuacion)}
                        </div>
                      </div>
                      <p className="text-slate-600 italic leading-relaxed text-lg">"{res.texto}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Sé el primero en opinar sobre este evento</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl border border-white/5">
              <h4 className="text-amber-500 font-black uppercase tracking-widest text-[10px] mb-8">Información Útil</h4>
              
              <div className="space-y-8 mb-10">
                <div className="flex items-center gap-5 border-b border-white/10 pb-6">
                  <span className="text-3xl">📅</span>
                  <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Fecha del evento</p>
                    <p className="font-bold text-lg">{new Date(evento.fecha).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <span className="text-3xl">🎟️</span>
                  <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Inversión</p>
                    <p className="text-4xl font-black text-amber-500">{evento.precio}€</p>
                  </div>
                </div>
              </div>

              <a href={evento.enlace_externo} target="_blank" rel="noreferrer" 
                 className="block w-full text-center bg-white text-slate-900 py-5 rounded-2xl font-black shadow-xl hover:bg-amber-500 hover:scale-[1.02] transition-all uppercase tracking-widest text-sm">
                Conseguir Entradas
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleEvento;