import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

// --- COMPONENTE INTERNO: BOTÓN DE FAVORITO ---
const BotonFavorito = ({ eventoId }: { eventoId: string }) => {
  const { session } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) checkStatus();
  }, [session, eventoId]);

  const checkStatus = async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from('favoritos')
      .select('id')
      .eq('usuario_id', session.user.id)
      .eq('elemento_id', eventoId)
      .eq('tipo_elemento', 'evento')
      .maybeSingle();
    if (data) setIsFav(true);
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user?.id) return alert("Inicia sesión para guardar favoritos");

    setLoading(true);
    try {
      if (isFav) {
        await supabase.from('favoritos').delete()
          .eq('usuario_id', session.user.id)
          .eq('elemento_id', eventoId)
          .eq('tipo_elemento', 'evento');
        setIsFav(false);
      } else {
        await supabase.from('favoritos').insert([{
          usuario_id: session.user.id,
          elemento_id: eventoId,
          tipo_elemento: 'evento'
        }]);
        setIsFav(true);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  return (
    <button onClick={handleToggle} disabled={loading} className="text-2xl transition-all active:scale-90">
      <i className={`bi bi-heart${isFav ? '-fill text-brand-red' : ' text-white'}`}></i>
    </button>
  );
};

const Eventos: React.FC = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [orden, setOrden] = useState<'asc' | 'desc' | 'reciente'>('reciente');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      const { data, error } = await supabase.from('eventos').select('*').order('fecha', { ascending: true });
      if (error) throw error;
      if (data) setEventos(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const categorias = ['Todos', 'Cultural', 'Música', 'Teatro', 'Deportes', 'Gastronomía'];

  const eventosProcesados = eventos
    .filter(ev => categoriaActiva === 'Todos' ? true : ev.categoria === categoriaActiva)
    .sort((a, b) => {
      if (orden === 'asc') return (a.titulo || "").localeCompare(b.titulo || "");
      if (orden === 'desc') return (b.titulo || "").localeCompare(a.titulo || "");
      return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    });

  if (loading) return (
    <div className="loading-state">
      Cargando Agenda...
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title">
            Agenda <span className="text-brand-gold">Cultural</span>
          </h2>
          <p className="section-subtitle">No te pierdas nada en la ciudad</p>
        </div>

        {/* Filtros */}
        <div className="filter-toolbar">
          <div className="flex flex-wrap justify-center gap-2">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className={categoriaActiva === cat ? 'filter-btn-active' : 'filter-btn'}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={orden}
            onChange={(e: any) => setOrden(e.target.value)}
            className="select-field"
          >
            <option value="reciente">Próximos eventos</option>
            <option value="asc">A - Z</option>
            <option value="desc">Z - A</option>
          </select>
        </div>

        {/* Grid de Eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventosProcesados.map((evento) => (
            <div key={evento.id} className="card-overlay group">
              <img
                src={evento.imagen_url}
                className="card-overlay-img"
                alt={evento.titulo}
              />
              <div className="card-overlay-gradient"></div>

              <div className="absolute top-6 right-6 z-20">
                <BotonFavorito eventoId={evento.id} />
              </div>

              <Link to={`/eventos/${evento.id}`} className="absolute inset-0 p-10 flex flex-col justify-end z-10">
                <div className="mb-4">
                  <span className="tag-badge">{evento.categoria}</span>
                </div>
                <h4 className="text-3xl font-black text-white mb-3 uppercase italic tracking-tighter leading-none group-hover:text-brand-gold transition-colors">
                  {evento.titulo}
                </h4>
                <div className="flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-widest border-t border-white/10 pt-6">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-brand-gold group-hover:text-brand-dark transition-all">
                    <i className="bi bi-geo-alt-fill text-lg text-brand-gold group-hover:text-brand-dark"></i>
                  </div>
                  <span>{evento.ubicacion}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Eventos;