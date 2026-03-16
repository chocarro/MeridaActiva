import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

import GradientText from '../../componentes/animaciones/GradientText';
import RotatingText from '../../componentes/animaciones/RotatingText';
import ScrollStack, { ScrollStackItem } from '../../componentes/animaciones/ScrollStack';
import ScrollFloat from '../../componentes/animaciones/ScrollFloat';
import FluidGlass from '../../componentes/animaciones/FluidGlass';
import AnimatedList from '../../componentes/animaciones/AnimatedList';
import { useSeoMeta } from '../../hooks/useSeoMeta';

// ── Categorías con sus imágenes y datos ─────────────────────────────────────
const CATEGORIAS = [
  {
    title: 'Cultural',
    description: 'Exposiciones, teatro romano, historia viva y tradición en el corazón de Augusta Emerita.',
    icon: 'bi-bank2',
    image: '/Imagenes/CULTURAL.jpg',
    color: '#032B43',
    link: '/eventos',
    tag: 'Historia & Arte',
  },
  {
    title: 'Música',
    description: 'Conciertos en vivo para todos los gustos, desde jazz internacional hasta folk extremeño.',
    icon: 'bi-music-note-beamed',
    image: '/Imagenes/MUSICA.jpg',
    color: '#3F88C5',
    link: '/eventos',
    tag: 'Conciertos',
  },
  {
    title: 'Teatro',
    description: 'Las mejores obras escenificadas en los teatros más emblemáticos de la ciudad.',
    icon: 'bi-ticket-detailed-fill',
    image: '/Imagenes/TEATRO.JPG',
    color: '#D00000',
    link: '/eventos',
    tag: 'Espectáculos',
  },
  {
    title: 'Patrimonio',
    description: 'Monumentos, museos y espacios únicos: 2.000 años de historia a tu alcance.',
    icon: 'bi-building-fill',
    image: '/Imagenes/Museo Romano.webp',
    color: '#5c3d1e',
    link: '/lugares',
    tag: 'Sobre la ciudad',
  },
];


const ROTATING_TEXTS = [
  'Cultural', 'Música', 'Teatro', 'Gastronomía', 'Patrimonio',
];

const Home: React.FC = () => {
  const [reseñas, setReseñas] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');

  // ── SEO ─────────────────────────────────────────────────────────
  useSeoMeta({
    title: 'Mérida — Eventos, Turismo y Gastronomía',
    description: 'Descubre la agenda cultural, el patrimonio romano y los mejores restaurantes de Mérida (Extremadura). La ciudad más romana de España te espera.',
    image: '/Imagenes/teatro-romano.jpg',
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: dataReseñas } = await supabase
        .from('comentarios')
        .select('id, texto, nombre_usuario, puntuacion, created_at, evento_id')
        .order('created_at', { ascending: false })
        .limit(6);

      if (dataReseñas && dataReseñas.length > 0) {
        const eventoIds = [...new Set(dataReseñas.map((r: any) => r.evento_id).filter(Boolean))];
        if (eventoIds.length > 0) {
          const { data: eventosData } = await supabase
            .from('eventos')
            .select('id, titulo')
            .in('id', eventoIds);

          const eventosMap = new Map((eventosData || []).map((ev: any) => [ev.id, ev.titulo]));
          const reseñasConEvento = dataReseñas.map((r: any) => ({
            ...r,
            titulo_evento: eventosMap.get(r.evento_id) || '',
          }));
          setReseñas(reseñasConEvento);
        } else {
          setReseñas(dataReseñas);
        }
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg">

      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <header className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/Imagenes/teatro-romano.jpg" className="w-full h-full object-cover animate-slow-zoom" alt="Mérida" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/40 to-brand-bg" />
        </div>

        <div className="relative z-10 w-full max-w-5xl px-4 text-center">
          <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-xs mb-6 block animate-fade-in-up">
            Mérida, Patrimonio de la Humanidad
          </span>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter italic uppercase leading-[0.8] mb-12 animate-fade-in-up">
            <GradientText
              colors={['#FFBA08', '#ffffff', '#3F88C5', '#ffffff', '#FFBA08']}
              animationSpeed={6}
              className="text-6xl md:text-9xl font-black tracking-tighter italic uppercase leading-[0.8]"
            >
              MÉRIDA ACTIVA
            </GradientText>
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

            {/* ── FluidGlass search bar ── */}
            <div className="w-full max-w-2xl">
              <FluidGlass blur={20} tintOpacity={0.1} borderColor="rgba(255,255,255,0.3)">
                <div className="relative flex items-center px-2">
                  <i className="bi bi-search absolute left-6 text-white/50 text-xl" />
                  <input
                    type="text"
                    placeholder="Busca un evento, lugar o actividad..."
                    className="w-full pl-14 pr-6 py-5 rounded-[2rem] bg-transparent text-white font-bold outline-none placeholder:text-white/40 focus:placeholder:text-white/20 transition-all"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                  {busqueda && (
                    <Link
                      to={`/eventos`}
                      className="mr-2 bg-brand-gold text-brand-dark px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all whitespace-nowrap"
                    >
                      Buscar →
                    </Link>
                  )}
                </div>
              </FluidGlass>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          ROTATING TEXT BAND
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-brand-dark text-center">
        <div className="max-w-4xl mx-auto px-4">
          <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-xs mb-4 block">
            Descubre Mérida
          </span>
          <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">
            Todo lo{' '}
            <span className="text-brand-gold inline-flex items-baseline">
              <RotatingText
                texts={ROTATING_TEXTS}
                rotationInterval={2000}
                className="text-5xl md:text-7xl font-black text-brand-gold uppercase italic tracking-tighter"
              />
            </span>
          </h2>
          <p className="text-slate-400 font-medium mt-6 mb-10 text-lg">
            Eventos, espectáculos y experiencias únicos en Augusta Emerita
          </p>
          <Link
            to="/eventos"
            className="inline-block bg-brand-gold text-brand-dark px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-2xl shadow-brand-gold/20"
          >
            Ver Agenda Completa
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SCROLL STACK — CATEGORÍAS
          (Each category card stacks as you scroll)
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with ScrollFloat */}
          <div className="text-center mb-20">
            <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-xs mb-4 block">
              Explora por categoría
            </span>
            <ScrollFloat
              containerClassName="text-center"
              textClassName="text-4xl md:text-6xl font-black text-brand-dark uppercase italic tracking-tighter"
            >
              ¿Qué te apetece?
            </ScrollFloat>
          </div>

          {/* ── ScrollStack cards ── */}
          <ScrollStack
            itemDistance={180}
            itemScale={0.04}
            itemStackDistance={14}
            stackTopPercent={10}
          >
            {CATEGORIAS.map((cat, i) => (
              <ScrollStackItem key={i} className="overflow-hidden">
                <Link to={cat.link} className="block group">
                  <div
                    className="relative w-full h-80 md:h-96 rounded-[2.5rem] overflow-hidden"
                    style={{ background: cat.color }}
                  >
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Content overlay */}
                    <div className="absolute inset-0 p-10 flex flex-col justify-between">
                      {/* Top */}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/60 border border-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                          {cat.tag}
                        </span>
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                          <i className={`bi ${cat.icon} text-white text-xl`} />
                        </div>
                      </div>

                      {/* Bottom */}
                      <div>
                        <h3 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-3 group-hover:text-brand-gold transition-colors">
                          {cat.title}
                        </h3>
                        <p className="text-white/60 text-sm font-medium leading-relaxed max-w-md">
                          {cat.description}
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest">
                          <span>Ver eventos</span>
                          <i className="bi bi-arrow-right group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FLUID GLASS STATS BAND
      ══════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-brand-dark">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { num: '2000+', label: 'Años de Historia', icon: 'bi-hourglass-split' },
              { num: '120+', label: 'Eventos al Año', icon: 'bi-calendar-event' },
              { num: '8', label: 'Monumentos UNESCO', icon: 'bi-award' },
              { num: '60k', label: 'Habitantes', icon: 'bi-people-fill' },
            ].map((stat, i) => (
              <FluidGlass
                key={i}
                blur={16}
                tintOpacity={0.08}
                borderColor="rgba(255,255,255,0.15)"
                className="p-8 text-center"
              >
                <i className={`bi ${stat.icon} text-brand-gold text-2xl mb-4 block`} />
                <p className="text-4xl font-black text-white italic uppercase tracking-tighter">{stat.num}</p>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mt-2">{stat.label}</p>
              </FluidGlass>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COMENTARIOS — AnimatedList
      ══════════════════════════════════════════ */}
      <section className="py-32 bg-brand-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

        <div className="w-full relative z-10 text-center">
          <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 block px-4">Experiencias reales</span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-20 tracking-tighter uppercase italic px-4">
            Voces de la <span className="text-brand-blue">ciudad</span>
          </h2>

          {reseñas.length > 0 ? (
            <AnimatedList className="flex overflow-x-auto gap-6 pb-8 px-4 md:px-12 snap-x snap-mandatory hide-scrollbar">
              {reseñas.map((res) => (
                <div key={res.id} className="min-w-[300px] md:min-w-[400px] bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-sm hover:bg-white/10 transition-colors group snap-center flex flex-col">
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
                      <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">
                        {new Date(res.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </AnimatedList>
          ) : (
            <p className="text-slate-500 font-bold text-sm">Todavía no hay reseñas.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;