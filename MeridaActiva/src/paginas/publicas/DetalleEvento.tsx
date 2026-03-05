import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import FormularioReseña from '../../componentes/FormularioReseña';
import { useAuth } from '../../context/AuthContext';

const DetalleEvento: React.FC = () => {
  const { id } = useParams();
  const [evento, setEvento] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const { session } = useAuth();
  const [esFavorito, setEsFavorito] = useState(false);

  const fetchEventoData = async () => {
    const { data: eventoData } = await supabase.from('eventos').select('*').eq('id', id).single();
    if (eventoData) setEvento(eventoData);

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
    if (session?.user) verificarFavorito();
  }, [id, session]);

  const verificarFavorito = async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from('favoritos')
      .select('id')
      .eq('usuario_id', session.user.id)
      .eq('elemento_id', id)
      .maybeSingle();
    if (data) setEsFavorito(true);
  };

  const handleToggleFavorito = async () => {
    if (!session) {
      alert('Inicia sesión para guardar favoritos');
      return;
    }
    if (esFavorito) {
      await supabase.from('favoritos').delete().eq('usuario_id', session.user.id).eq('elemento_id', id).eq('tipo_elemento', 'evento');
      setEsFavorito(false);
    } else {
      await supabase.from('favoritos').insert({ usuario_id: session.user.id, elemento_id: id, tipo_elemento: 'evento' });
      setEsFavorito(true);
    }
  };

  if (cargando) return <div className="loading-state">Abriendo Agenda...</div>;
  if (!evento) return <div className="loading-state text-brand-red">Evento no encontrado</div>;

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* HERO SECTION */}
      <div className="relative h-[60vh] md:h-[75vh] w-full overflow-hidden">
        <img src={evento.imagen_url} className="w-full h-full object-cover" alt={evento.titulo} />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent"></div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <span className="tag-badge mb-6 block w-fit shadow-lg">
                {evento.categoria}
              </span>
              <h1 className="text-5xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-[0.8]">
                {evento.titulo}
              </h1>
            </div>

            <button
              onClick={handleToggleFavorito}
              className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-2xl transition-all duration-500 shadow-2xl ${esFavorito
                ? 'bg-brand-red text-white scale-110'
                : 'bg-white/10 backdrop-blur-xl text-white border border-white/20 hover:bg-white hover:text-brand-dark'
                }`}
            >
              <i className={`bi bi-heart${esFavorito ? '-fill' : ''}`}></i>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* DETALLES */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-sm">
              <h3 className="text-brand-blue font-black uppercase tracking-[0.2em] text-[10px] mb-8 flex items-center gap-3">
                <span className="w-12 h-[2px] bg-brand-gold"></span> Sobre el evento
              </h3>
              <p className="text-brand-dark text-xl font-medium leading-relaxed opacity-80 whitespace-pre-line">
                {evento.descripcion}
              </p>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-wrap gap-8">
              <div className="flex items-center gap-4">
                <div className="info-chip text-brand-blue">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ubicación</p>
                  <p className="font-bold text-brand-dark">{evento.ubicacion}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="info-chip text-brand-green">
                  <i className="bi bi-calendar3"></i>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha</p>
                  <p className="font-bold text-brand-dark">{new Date(evento.fecha).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* COMENTARIOS */}
            <div className="space-y-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-brand-dark">Conversación</h2>
              <FormularioReseña
                eventoId={id!}
                onPublicado={fetchEventoData}
              />
              <div className="grid gap-6 mt-8">
                {comentarios.map((c) => (
                  <div key={c.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white font-black text-xs uppercase">
                        {c.nombre_usuario?.charAt(0)}
                      </div>
                      <p className="font-black text-[10px] uppercase text-brand-dark tracking-widest">{c.nombre_usuario}</p>
                    </div>
                    <p className="text-brand-dark opacity-70 font-medium italic">"{c.texto}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR TICKET */}
          <div className="lg:col-span-1">
            <div className="ticket-sidebar">
              <div className="relative z-10">
                <div className="mb-10">
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-2">Inversión</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-6xl font-black text-brand-gold italic tracking-tighter">{evento.precio || '0'}</p>
                    <span className="text-xl font-black text-brand-gold">€</span>
                  </div>
                </div>

                <a
                  href={evento.enlace_externo || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full bg-brand-gold text-brand-dark py-6 rounded-[1.5rem] font-black text-center shadow-lg hover:bg-white hover:scale-[1.03] transition-all duration-300 uppercase tracking-[0.2em] text-[11px]"
                >
                  Conseguir Entradas
                </a>

                <div className="mt-8 flex items-center justify-center gap-3 text-white/20">
                  <i className="bi bi-shield-check text-xl"></i>
                  <span className="text-[8px] font-black uppercase tracking-widest">Reserva segura y oficial</span>
                </div>
              </div>
              {/* Decoraciones */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-blue/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-red/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleEvento;