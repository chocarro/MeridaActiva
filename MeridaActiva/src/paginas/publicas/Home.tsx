import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Footer from '../../componentes/Footer';

const Home: React.FC = () => {
  const [reseñas, setReseñas] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Cargar reseñas
      const { data: dataReseñas } = await supabase
        .from('comentarios')
        .select('*, eventos(titulo)') 
        .order('created_at', { ascending: false })
        .limit(3);
      if (dataReseñas) setReseñas(dataReseñas);

      // 2. Cargar eventos
      const { data: dataEventos } = await supabase
        .from('eventos')
        .select('*')
        .order('fecha', { ascending: true });
      if (dataEventos) setEventos(dataEventos);
    };

    fetchData();
  }, []);

  // Filtrado de eventos por categoría para las secciones
  const eventosCulturales = eventos.filter(ev => ev.categoria === 'Cultural').slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. HERO SECTION */}
      <header className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/Imagenes/teatro-romano.jpg" 
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
            alt="Teatro Romano de Mérida"
          />
          {/* Overlay oscuro para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <span className="inline-block bg-amber-500 text-slate-900 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Patrimonio de la Humanidad
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Mérida <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Activa</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Explora la agenda cultural, los monumentos más impresionantes y vive la historia de la antigua Emérita Augusta.
          </p>
          
          {/* Buscador */}
          <div className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2">
            <input 
              type="text" 
              placeholder="¿Qué evento buscas hoy?" 
              className="flex-1 px-6 py-4 text-slate-700 focus:outline-none font-medium"
            />
            <button className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105">
              Buscar
            </button>
          </div>
        </div>
        
      </header>

      {/* 2. CATEGORÍAS RÁPIDAS */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: 'Cultura' },
            {  label: 'Música' },
            { label: 'Gastro' },
            {  label: 'Deporte' },
            {  label: 'Familia' },
            {  label: 'Todos' }
          ].map((cat, i) => (
            <button key={i} className="bg-white p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all group border border-slate-100 flex flex-col items-center">
              <span className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>


      {/* 3. EVENTOS DESTACADOS (Culturales) */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900">Eventos Culturales</h2>
            <p className="text-slate-500 mt-2 font-medium">No te pierdas lo mejor de la semana</p>
          </div>
          <Link to="/eventos" className="text-amber-600 font-bold hover:underline">Ver todos →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {eventosCulturales.map((evento) => (
            <div key={evento.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-slate-100 group">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={evento.imagen_url || '/imagenes/placeholder.jpg'} 
                  alt={evento.titulo}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                  {evento.categoria}
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
                  {evento.titulo}
                </h3>
                <div className="flex items-center text-slate-500 text-sm mb-6 gap-4">
                  <span className="flex items-center gap-1">📅 {new Date(evento.fecha).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1">📍 {evento.ubicacion}</span>
                </div>
                <Link 
                  to={`/eventos/${evento.id}`} 
                  className="block text-center bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-900 py-3 rounded-xl font-bold transition-all"
                >
                  Más información
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SECCIÓN DE RESEÑAS */}
      <section className="bg-slate-900 py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black mb-16">Lo que dicen los visitantes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {reseñas.length > 0 ? (
              reseñas.map((res) => (
                <div key={res.id} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center font-bold text-slate-900 text-xl">
                      {res.nombre_usuario?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{res.nombre_usuario}</h4>
                      <div className="text-amber-400 text-sm">
                        {"★".repeat(res.puntuacion)}{"☆".repeat(5 - res.puntuacion)}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-400 italic leading-relaxed mb-4">"{res.texto}"</p>
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                    Sobre: {res.eventos?.titulo}
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-slate-500">Cargando experiencias...</p>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;