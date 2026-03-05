import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Footer from '../../componentes/Footer';

const Home: React.FC = () => {
  const [reseñas, setReseñas] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');

  const categorias = [
    { nombre: 'Todos', icono: 'bi-grid-fill' },
    { nombre: 'Cultural', icono: 'bi-bank' },
    { nombre: 'Música', icono: 'bi-music-note-beamed' },
    { nombre: 'Teatro', icono: 'bi-masks' },
    { nombre: 'Deportes', icono: 'bi-trophy' },
    { nombre: 'Gastronomía', icono: 'bi-egg-fried' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      // Fetch comentarios without the join to avoid 400 errors
      const { data: dataReseñas } = await supabase
        .from('comentarios')
        .select('id, texto, nombre_usuario, puntuacion, created_at, evento_id')
        .order('created_at', { ascending: false })
        .limit(6);

      if (dataReseñas && dataReseñas.length > 0) {
        // Get unique event IDs and fetch their titles
        const eventoIds = [...new Set(dataReseñas.map((r: any) => r.evento_id).filter(Boolean))];
        if (eventoIds.length > 0) {
          const { data: eventosData } = await supabase
            .from('eventos')
            .select('id, titulo')
            .in('id', eventoIds);

          const eventosMap = new Map((eventosData || []).map((ev: any) => [ev.id, ev.titulo]));
          const reseñasConEvento = dataReseñas.map((r: any) => ({
            ...r,
            titulo_evento: eventosMap.get(r.evento_id) || ''
          }));
          setReseñas(reseñasConEvento);
        } else {
          setReseñas(dataReseñas);
        }
      }

      const { data: dataEventos } = await supabase.from('eventos').select('*').order('fecha', { ascending: true });
      if (dataEventos) setEventos(dataEventos);
    };
    fetchData();
  }, []);

  const eventosFiltrados = eventos.filter(ev => {
    const coincideBusqueda = ev.titulo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaActiva === 'Todos' || ev.categoria === categoriaActiva;
    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="min-h-screen bg-brand-bg">

      {/* --- HERO SECTION --- */}
      <header className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/Imagenes/teatro-romano.jpg" className="w-full h-full object-cover animate-slow-zoom" alt="Mérida" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/40 to-brand-bg"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl px-4 text-center">
          <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-xs mb-6 block animate-fade-in-up">Mérida, Patrimonio de la Humanidad</span>
          <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter italic uppercase leading-[0.8] mb-12 animate-fade-in-up">
            MÉRIDA <span className="text-brand-gold">ACTIVA</span>
          </h1>

          <div className="flex flex-col items-center gap-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row gap-4">
              <Link to="/eventos" className="bg-brand-gold text-brand-dark px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-brand-dark transition-all shadow-2xl shadow-brand-gold/20">
                Explorar Agenda
              </Link>
              <Link to="/mapa" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-blue transition-all">
                Ver Mapa Interactivo
              </Link>
            </div>

            <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl p-2 rounded-[2.5rem] border border-white/20 shadow-2xl">
              <div className="relative flex items-center">
                <i className="bi bi-search absolute left-6 text-white/50 text-xl"></i>
                <input
                  type="text"
                  placeholder="Busca un evento, lugar o actividad..."
                  className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-white text-brand-dark font-bold outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-brand-blue"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- CATEGORÍAS --- */}
      <section className="py-12 bg-white border-b border-slate-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-4 overflow-x-auto no-scrollbar justify-start md:justify-center">
          {categorias.map((cat) => (
            <button
              key={cat.nombre}
              onClick={() => setCategoriaActiva(cat.nombre)}
              className={`filter-pill ${categoriaActiva === cat.nombre ? 'filter-pill-active' : ''}`}
            >
              <i className={`bi ${cat.icono} text-base`}></i>
              {cat.nombre}
            </button>
          ))}
        </div>
      </section>

      {/* --- LISTADO DE EVENTOS --- */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {eventosFiltrados.length > 0 ? (
            eventosFiltrados.map((ev) => (
              <Link key={ev.id} to={`/eventos/${ev.id}`} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-soft hover:shadow-premium transition-all duration-500 border border-slate-100">
                <div className="h-72 overflow-hidden relative">
                  <img src={ev.imagen_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={ev.titulo} />
                  <div className="absolute top-6 right-6">
                    <span className="tag-badge">{ev.categoria}</span>
                  </div>
                </div>
                <div className="p-10 text-start">
                  <h3 className="text-2xl font-black text-brand-dark mb-2 tracking-tight group-hover:text-brand-blue transition-colors">{ev.titulo}</h3>
                  <p className="text-slate-500 font-medium text-sm mb-6 line-clamp-2">{ev.descripcion}</p>
                  <div className="flex justify-between items-center border-t border-slate-50 pt-6">
                    <span className="text-brand-red font-black text-lg">{ev.precio}€</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark/50"><i className="bi bi-geo-alt-fill text-brand-gold"></i> {ev.ubicacion}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <p className="font-black text-slate-400 uppercase tracking-widest">No hay eventos que coincidan</p>
            </div>
          )}
        </div>
      </section>

      {/* --- SECCIÓN COMENTARIOS --- */}
      <section className="py-32 bg-brand-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Experiencias reales</span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-20 tracking-tighter uppercase italic">
            Voces de la <span className="text-brand-blue">ciudad</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {reseñas.map((res) => (
              <div key={res.id} className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <div className="text-brand-gold text-4xl mb-6 font-serif opacity-50 group-hover:opacity-100 transition-opacity">"</div>
                <p className="text-slate-300 italic leading-relaxed mb-10 font-medium text-lg">
                  {res.texto}
                </p>
                <div className="flex items-center gap-4 mt-auto border-t border-white/5 pt-8">
                  <div className="w-12 h-12 bg-brand-gold rounded-2xl flex items-center justify-center font-black text-brand-dark text-xl shadow-lg shadow-brand-gold/20">
                    {res.nombre_usuario?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-black text-white text-[10px] uppercase tracking-widest">{res.nombre_usuario || 'Explorador'}</h4>
                    <p className="text-[9px] text-brand-blue font-bold uppercase tracking-widest mt-0.5 truncate">Sobre: {res.titulo_evento}</p>
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{new Date(res.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;