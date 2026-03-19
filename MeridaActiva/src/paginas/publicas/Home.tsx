import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../../supabaseClient';
import GradientText from '../../componentes/animaciones/GradientText';
import RotatingText from '../../componentes/animaciones/RotatingText';
import ScrollFloat from '../../componentes/animaciones/ScrollFloat';
import ScrollStack, { ScrollStackItem } from '../../componentes/animaciones/ScrollStack';
import FluidGlass from '../../componentes/animaciones/FluidGlass';

import { useSeoMeta } from '../../hooks/useSeoMeta';

gsap.registerPlugin(ScrollTrigger);

// ── Datos ────────────────────────────────────────────────────────
const CATEGORIAS = [
  {
    title: 'Cultural', tag: 'Historia & Arte', icon: 'bi-bank2',
    image: '/Imagenes/CULTURAL.jpg', link: '/eventos',
    desc: 'Exposiciones, teatro romano e historia viva en Augusta Emerita.',
    gradient: 'linear-gradient(135deg, #FFBA08 0%, #ff8c42 50%, #032B43 100%)',
    accentColor: '#FFBA08',
  },
  {
    title: 'Música', tag: 'Conciertos', icon: 'bi-music-note-beamed',
    image: '/Imagenes/MUSICA.jpg', link: '/eventos',
    desc: 'Jazz internacional, folk extremeño y conciertos en vivo.',
    gradient: 'linear-gradient(135deg, #3F88C5 0%, #7c4dff 50%, #032B43 100%)',
    accentColor: '#3F88C5',
  },
  {
    title: 'Teatro', tag: 'Espectáculos', icon: 'bi-ticket-perforated',
    image: '/Imagenes/TEATRO.JPG', link: '/eventos',
    desc: 'Las mejores obras en los escenarios más emblemáticos de la ciudad.',
    gradient: 'linear-gradient(135deg, #D00000 0%, #ff6b6b 50%, #032B43 100%)',
    accentColor: '#D00000',
  },
  {
    title: 'Patrimonio', tag: 'Monumentos', icon: 'bi-building-fill',
    image: '/Imagenes/Museo Romano.webp', link: '/lugares',
    desc: '2.000 años de historia romana al alcance de tu mano.',
    gradient: 'linear-gradient(135deg, #136F63 0%, #52b788 50%, #032B43 100%)',
    accentColor: '#136F63',
  },
];

const STATS = [
  { num: '25 a.C.', label: 'Fundación romana', icon: 'bi-hourglass-split' },
  { num: '120+', label: 'Eventos al año', icon: 'bi-calendar-event' },
  { num: '8', label: 'Monumentos UNESCO', icon: 'bi-award' },
  { num: '100%', label: 'Gratuito', icon: 'bi-gift' },
];

const ROTATING_TEXTS = ['Cultural', 'Musical', 'Gastronómico', 'Histórico', 'Único'];

const TICKER_ITEMS = [
  { src: '/Imagenes/teatro-romano.jpg',              label: 'Teatro Romano' },
  { src: '/Imagenes/CULTURAL.jpg',                   label: 'Cultura' },
  { src: '/Imagenes/MUSICA.jpg',                     label: 'Música' },
  { src: '/Imagenes/TEATRO.JPG',                     label: 'Teatro' },
  { src: '/Imagenes/Museo Romano.webp',              label: 'MNAR' },
  { src: '/Imagenes/merida-maravilla-monumental.jpg', label: 'Monumentos' },
  { src: '/Imagenes/teatro-romano.jpg',              label: 'Teatro Romano' },
  { src: '/Imagenes/CULTURAL.jpg',                   label: 'Cultura' },
  { src: '/Imagenes/MUSICA.jpg',                     label: 'Música' },
  { src: '/Imagenes/TEATRO.JPG',                     label: 'Teatro' },
  { src: '/Imagenes/Museo Romano.webp',              label: 'MNAR' },
  { src: '/Imagenes/merida-maravilla-monumental.jpg', label: 'Monumentos' },
];

// ── Hooks ────────────────────────────────────────────────────────
function useFadeInOnScroll(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useStaggerOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    children.forEach((c, i) => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(40px)';
      c.style.transition = `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`;
    });
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((c) => { c.style.opacity = '1'; c.style.transform = 'translateY(0)'; });
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function useCountUp(target: string, active: boolean) {
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    if (!active) return;
    const num = parseFloat(target.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) { setDisplay(target); return; }
    const suffix = target.replace(/[0-9.]/g, '');
    let start = 0;
    const step = 16;
    const increment = num / (1400 / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= num) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.floor(start) + suffix);
    }, step);
    return () => clearInterval(timer);
  }, [active, target]);
  return display;
}

function StatCard({ num, label, icon, active }: { num: string; label: string; icon: string; active: boolean }) {
  const display = useCountUp(num, active);
  return (
    <div className="flex flex-col items-center text-center p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 hover:border-brand-gold/30 hover:-translate-y-1 transition-all duration-300 group cursor-default">
      <i className={`bi ${icon} text-brand-gold text-2xl mb-4 group-hover:scale-125 transition-transform duration-300`} />
      <p className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none mb-2 group-hover:text-brand-gold transition-colors duration-300">
        {display}
      </p>
      <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">{label}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
const Home: React.FC = () => {
  const [reseñas, setReseñas] = useState<any[]>([]);
  const [totalReseñas, setTotalReseñas] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const reseñasScrollRef = useRef<HTMLDivElement>(null);
  const [statsActive, setStatsActive] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroBadgeRef = useRef<HTMLSpanElement>(null);
  const heroCTARef = useRef<HTMLDivElement>(null);
  const parallaxBgRef = useRef<HTMLImageElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);


  const razonesRef = useStaggerOnScroll();
  const iaCardsRef = useStaggerOnScroll();

  const { ref: bandRef, visible: bandVisible } = useFadeInOnScroll();
  const { ref: categoriasHeaderRef, visible: categoriasHeaderVisible } = useFadeInOnScroll();
  const { ref: reseñasHeaderRef } = useFadeInOnScroll();
  const { ref: iaHeaderRef, visible: iaHeaderVisible } = useFadeInOnScroll();

  useSeoMeta({
    title: 'MeridaActiva — Eventos, Turismo y Rutas con IA en Mérida',
    description: 'Descubre la agenda cultural, el patrimonio romano y genera rutas personalizadas con IA en Mérida (Extremadura). La ciudad más romana de España te espera.',
    image: '/Imagenes/teatro-romano.jpg',
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (heroBadgeRef.current)
        tl.fromTo(heroBadgeRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8 });
      if (heroTextRef.current)
        tl.fromTo(heroTextRef.current, { opacity: 0, y: 60, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1 }, '-=0.4');
      if (heroCTARef.current)
        tl.fromTo(heroCTARef.current.children, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.15 }, '-=0.5');
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!parallaxBgRef.current) return;
    const anim = gsap.to(parallaxBgRef.current, {
      yPercent: 25, ease: 'none',
      scrollTrigger: { trigger: parallaxBgRef.current.closest('header'), start: 'top top', end: 'bottom top', scrub: true },
    });
    return () => { anim.scrollTrigger?.kill(); anim.kill(); };
  }, []);

  useEffect(() => {
    if (!bannerRef.current) return;
    const children = bannerRef.current.querySelectorAll('.banner-animate');
    const anim = gsap.fromTo(children,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out', scrollTrigger: { trigger: bannerRef.current, start: 'top 75%' } }
    );
    return () => { anim.scrollTrigger?.kill(); anim.kill(); };
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsActive(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const fetchReseñas = async () => {
      const { data, count } = await supabase
        .from('comentarios')
        .select('id, texto, nombre_usuario, puntuacion, created_at, evento_id', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(12);
      if (!data?.length) return;
      setTotalReseñas(count || data.length);
      const ids = [...new Set(data.map((r: any) => r.evento_id).filter(Boolean))];
      if (ids.length) {
        const { data: evs } = await supabase.from('eventos').select('id, titulo').in('id', ids);
        const map = new Map((evs || []).map((e: any) => [e.id, e.titulo]));
        setReseñas(data.map((r: any) => ({ ...r, titulo_evento: map.get(r.evento_id) || '' })));
      } else setReseñas(data);
    };
    fetchReseñas();
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg overflow-x-hidden">

      {/* ══════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════ */}
      <header className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            ref={parallaxBgRef}
            src="/Imagenes/teatro-romano.jpg"
            className="w-full h-[120%] object-cover absolute -top-[10%] animate-slow-zoom"
            alt="Teatro Romano de Mérida"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/50 to-brand-bg" />
        </div>

        <div className="relative z-10 w-full max-w-5xl px-6 text-center">
          <span ref={heroBadgeRef} className="inline-flex items-center gap-2 text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-8 bg-brand-gold/10 border border-brand-gold/20 px-5 py-2.5 rounded-full" style={{ opacity: 0 }}>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
            Mérida · Patrimonio de la Humanidad · UNESCO 1993
          </span>

          <div ref={heroTextRef} style={{ opacity: 0 }}>
            <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter italic uppercase leading-[0.85] mb-6">
              <GradientText
                colors={['#FFBA08', '#ffffff', '#3F88C5', '#ffffff', '#FFBA08']}
                animationSpeed={6}
                className="text-6xl md:text-[7rem] font-black tracking-tighter italic uppercase leading-[0.85]"
              >
                MÉRIDA ACTIVA
              </GradientText>
            </h1>
            <p className="text-white/70 text-lg font-medium max-w-xl mx-auto mb-10 leading-relaxed">
              Eventos, monumentos romanos, rutas inteligentes con IA y todo lo que necesitas para vivir Mérida al máximo.
            </p>
          </div>

          <div ref={heroCTARef} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/eventos"
              className="inline-flex items-center justify-center gap-3 bg-brand-gold text-brand-dark px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:scale-105 transition-all shadow-2xl shadow-brand-gold/30"
              style={{ opacity: 0 }}
            >
              <i className="bi bi-calendar-event" />
              Ver Agenda
            </Link>
            <Link
              to="/rutas"
              className="inline-flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-blue hover:border-brand-blue hover:scale-105 transition-all"
              style={{ opacity: 0 }}
            >
              <i className="bi bi-stars" />
              Crear Ruta Personalizada
            </Link>
            <Link
              to="/faq"
              className="inline-flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 hover:scale-105 transition-all"
              style={{ opacity: 0 }}
            >
              <i className="bi bi-robot" />
              Chat IA
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/30 text-[9px] font-black uppercase tracking-widest">Descubre</span>
          <i className="bi bi-chevron-down text-white/30 text-lg" />
        </div>
      </header>

      {/* ══════════════════════════════════════════
          2. TICKER
      ══════════════════════════════════════════ */}
      <div className="overflow-hidden bg-brand-dark py-6 border-y border-white/5">
        <style>{`
          @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .ticker-track { animation: ticker 30s linear infinite; }
          .ticker-track:hover { animation-play-state: paused; }
        `}</style>
        <div className="ticker-track flex gap-4 w-max">
          {TICKER_ITEMS.map((item, i) => (
            <div key={i} className="relative w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0 group cursor-pointer">
              <img src={item.src} alt={item.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-brand-dark/40 group-hover:bg-brand-dark/20 transition-colors" />
              <span className="absolute bottom-3 left-3 text-[8px] font-black text-white uppercase tracking-widest">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          3. BAND — Texto rotativo
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-brand-dark text-center overflow-hidden relative">
        {/* Decorative background thread */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img src="/Imagenes/hilo-decorativo-verde.jpg" alt="" className="w-full h-full object-cover opacity-10 select-none" aria-hidden="true" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div
          ref={bandRef}
          className="max-w-4xl mx-auto px-6 transition-all duration-1000 relative z-10"
          style={{ opacity: bandVisible ? 1 : 0, transform: bandVisible ? 'translateY(0)' : 'translateY(40px)' }}
        >
          <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Descubre Mérida</span>
          <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
            Mérida{' '}
            <span className="text-brand-gold">
              <RotatingText texts={ROTATING_TEXTS} rotationInterval={2000} className="text-5xl md:text-7xl font-black text-brand-gold uppercase italic tracking-tighter" />
            </span>
          </h2>
          <p className="text-slate-400 font-medium text-lg max-w-lg mx-auto mb-10">
            Eventos, espectáculos y experiencias únicas en Augusta Emerita, capital de la Lusitania romana.
          </p>
          <Link to="/eventos" className="inline-flex items-center gap-3 bg-brand-gold text-brand-dark px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:scale-105 transition-all">
            <i className="bi bi-grid-3x3-gap" />
            Ver Agenda Completa
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. STATS
      ══════════════════════════════════════════ */}
      <section ref={statsRef} className="py-20 bg-brand-dark border-t border-white/5 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => <StatCard key={i} {...s} active={statsActive} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. RUTAS IA + CHAT — Sección destacada
      ══════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-white relative overflow-hidden">
        {/* Decorative background thread */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img src="/Imagenes/hilo-decorativo-azul.jpg" alt="" className="w-full h-full object-cover opacity-[0.07] select-none" aria-hidden="true" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div
            ref={iaHeaderRef}
            className="text-center mb-16 transition-all duration-1000"
            style={{ opacity: iaHeaderVisible ? 1 : 0, transform: iaHeaderVisible ? 'translateY(0)' : 'translateY(30px)' }}
          >
            <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">
              <i className="bi bi-stars mr-2" />
              Mérida Activa
            </span>
            <ScrollFloat textClassName="text-5xl md:text-6xl font-black text-brand-dark italic uppercase tracking-tighter">
              Tu viaje, a tu medida
            </ScrollFloat>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto mt-6">
              Herramientas inteligentes que hacen que descubrir Mérida sea más fácil, más personal y más memorable.
            </p>
          </div>

          {/* Cards IA — 2 grandes */}
          <div ref={iaCardsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

            {/* Rutas IA */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-brand-dark group hover:-translate-y-2 transition-all duration-500 shadow-2xl">
              <div className="absolute inset-0 z-0">
                <img
                  src="/Imagenes/merida-maravilla-monumental.jpg"
                  alt="Rutas IA"
                  className="w-full h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-700"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-brand-dark/40" />
              </div>
              <div className="relative z-10 p-10 flex flex-col h-full min-h-[420px]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-brand-gold rounded-2xl flex items-center justify-center shadow-lg shadow-brand-gold/30">
                    <i className="bi bi-stars text-brand-dark text-2xl" />
                  </div>
                  <div>
                    <span className="text-brand-gold font-black uppercase tracking-widest text-[10px] block">Novedad</span>
                    <h3 className="text-white font-black text-xl uppercase italic tracking-tighter">Rutas con IA</h3>
                  </div>
                </div>
                <p className="text-slate-300 font-medium leading-relaxed mb-6 flex-1">
                  Dinos cuánto tiempo tienes, con quién vienes y tu ritmo de viaje. En segundos tendrás un itinerario personalizado con monumentos, horarios y descripciones reales de Mérida.
                </p>
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { icon: 'bi-clock', label: '¿Cuánto tiempo?' },
                    { icon: 'bi-people', label: '¿Con quién?' },
                    { icon: 'bi-lightning-charge', label: '¿Qué ritmo?' },
                  ].map(({ icon, label }) => (
                    <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 hover:border-brand-gold/30 transition-all group/card">
                      <i className={`bi ${icon} text-brand-gold text-xl mb-2 block group-hover/card:scale-110 transition-transform`} />
                      <p className="text-[9px] font-black text-white/50 uppercase tracking-widest leading-tight">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <Link
                    to="/rutas"
                    className="inline-flex items-center gap-3 bg-brand-gold text-brand-dark px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:scale-105 transition-all shadow-xl shadow-brand-gold/20"
                  >
                    <i className="bi bi-stars" />
                    Crear Mi Ruta
                  </Link>
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                    <i className="bi bi-shield-check mr-1" />
                    Con registro
                  </span>
                </div>
              </div>
            </div>

            {/* Chat IA */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-brand-blue/10 to-brand-dark/5 border border-brand-blue/20 group hover:-translate-y-2 transition-all duration-500 shadow-xl">
              <div className="p-10 flex flex-col h-full min-h-[420px]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-brand-blue rounded-2xl flex items-center justify-center shadow-lg shadow-brand-blue/30">
                    <i className="bi bi-robot text-white text-2xl" />
                  </div>
                  <div>
                    <span className="text-brand-blue font-black uppercase tracking-widest text-[10px] block">Siempre disponible</span>
                    <h3 className="text-brand-dark font-black text-xl uppercase italic tracking-tighter">Asistente IA</h3>
                  </div>
                </div>
                <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-1">
                  Pregunta lo que quieras sobre Mérida: horarios de monumentos, restaurantes recomendados, historia romana, qué hacer con niños... La IA te responde al instante.
                </p>

                {/* Chat preview */}
                <div className="bg-white rounded-[1.5rem] p-5 mb-8 shadow-sm border border-slate-100 space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-brand-dark text-white text-xs font-medium px-4 py-2.5 rounded-[1rem] rounded-br-sm max-w-[80%]">
                      ¿Qué monumentos puedo ver en 3 horas?
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 bg-brand-blue rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="bi bi-robot text-white text-xs" />
                    </div>
                    <div className="bg-slate-50 text-slate-600 text-xs font-medium px-4 py-2.5 rounded-[1rem] rounded-bl-sm max-w-[80%] leading-relaxed">
                      En 3 horas puedes visitar el Teatro Romano, Anfiteatro y el MNAR. Te recomiendo empezar a las 10:00...
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="flex gap-1">
                      {[0, 150, 300].map(d => (
                        <span key={d} className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  to="/faq"
                  className="inline-flex items-center gap-3 bg-brand-dark text-brand-gold px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-blue hover:text-white transition-all self-start"
                >
                  <i className="bi bi-robot" />
                  Abrir Chat IA
                </Link>
              </div>
            </div>
          </div>

          {/* Mini features IA */}
          <div ref={razonesRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: 'bi-calendar-check', titulo: 'Agenda Centralizada', desc: 'Todos los eventos de Mérida en un solo lugar, actualizado en tiempo real.', color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { icon: 'bi-geo-alt-fill', titulo: 'Mapa Interactivo', desc: 'Explora monumentos, restaurantes y eventos en el mapa de la ciudad.', color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
              { icon: 'bi-bookmark-star', titulo: 'Tu Agenda Personal', desc: 'Guarda favoritos y organiza tu visita con un calendario gratuito.', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { icon: 'bi-columns-gap', titulo: 'Patrimonio UNESCO', desc: 'Información detallada de los monumentos romanos más importantes de España.', color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
            ].map((r) => (
              <div key={r.titulo} className="rounded-[2rem] p-7 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white group cursor-default">
                <div className={`w-11 h-11 ${r.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <i className={`bi ${r.icon} ${r.color} text-xl`} />
                </div>
                <h3 className="font-black text-brand-dark uppercase italic tracking-tight text-sm mb-2">{r.titulo}</h3>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. CATEGORÍAS — ScrollStack
      ══════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-brand-bg relative z-0 overflow-hidden">
        {/* Decorative background thread */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img src="/Imagenes/hilo-decorativo-rosa.jpg" alt="" className="w-full h-full object-cover opacity-[0.05] select-none" aria-hidden="true" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div
            ref={categoriasHeaderRef}
            className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6 transition-all duration-1000"
            style={{ opacity: categoriasHeaderVisible ? 1 : 0, transform: categoriasHeaderVisible ? 'translateY(0)' : 'translateY(30px)' }}
          >
            <div>
              <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Explora por categoría</span>
              <ScrollFloat textClassName="text-5xl md:text-6xl font-black text-brand-dark italic uppercase tracking-tighter">
                ¿Qué te apetece hoy?
              </ScrollFloat>
            </div>
            <Link to="/eventos" className="inline-flex items-center gap-2 text-brand-dark font-black text-[10px] uppercase tracking-widest border-2 border-brand-dark px-8 py-4 rounded-2xl hover:bg-brand-dark hover:text-brand-gold transition-all self-start md:self-auto group">
              Ver todo
              <i className="bi bi-arrow-right group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <ScrollStack itemDistance={180} itemScale={0.04} itemStackDistance={14} stackTopPercent={12}>
            {CATEGORIAS.map((cat, i) => (
              <ScrollStackItem key={i}>
                <Link to={cat.link} className="block group">
                  <div className="relative w-full h-80 md:h-[28rem] rounded-[2.5rem] overflow-hidden" style={{ background: cat.gradient }}>
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/80 border border-white/30 px-4 py-2 rounded-full backdrop-blur-sm bg-black/10">
                        {cat.tag}
                      </span>
                      <div
                        className="w-12 h-12 rounded-2xl backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-all duration-300"
                        style={{ backgroundColor: cat.accentColor + '33', border: `1px solid ${cat.accentColor}55` }}
                      >
                        <i className={`bi ${cat.icon} text-white text-xl`} />
                      </div>
                    </div>
                    <div className="absolute top-8 right-24 text-[8rem] font-black text-white/5 leading-none select-none pointer-events-none">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <h3 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-3 transition-colors duration-300" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
                        {cat.title}
                      </h3>
                      <p className="text-white/70 text-sm font-medium leading-relaxed max-w-lg mb-5">{cat.desc}</p>
                      <div
                        className="inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-full transition-all duration-300 group-hover:gap-4"
                        style={{ backgroundColor: cat.accentColor, color: '#032B43' }}
                      >
                        <i className="bi bi-arrow-right" />
                        Explorar
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
          7. CTA RUTAS IA — Banner oscuro
      ══════════════════════════════════════════ */}
      <section className="py-0 relative z-10">
        <div ref={bannerRef} className="relative overflow-hidden bg-brand-dark">
          <div className="absolute inset-0 z-0">
            <img
              src="/Imagenes/merida-maravilla-monumental.jpg"
              alt="Mérida monumental"
              className="w-full h-full object-cover opacity-25"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783483458-83d02161294e?w=1600&q=80'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/90 to-brand-dark/60" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-28 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <span className="banner-animate block text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-5" style={{ opacity: 0 }}>
                <i className="bi bi-stars mr-2" />
                Rutas Inteligentes con IA
              </span>
              <h2 className="banner-animate text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-6" style={{ opacity: 0 }}>
                Tu itinerario <span className="text-brand-gold">perfecto</span> en 3 preguntas
              </h2>
              <p className="banner-animate text-slate-400 font-medium text-lg leading-relaxed" style={{ opacity: 0 }}>
                Dinos tu tiempo disponible, con quién vienes y tu ritmo de viaje. La IA creará un itinerario personalizado con monumentos, horarios y descripciones reales de Mérida.
              </p>
            </div>
            <div className="banner-animate flex flex-col gap-4 lg:items-end" style={{ opacity: 0 }}>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { icon: 'bi-clock', label: '¿Cuánto tiempo?' },
                  { icon: 'bi-people', label: '¿Con quién?' },
                  { icon: 'bi-lightning-charge', label: '¿Qué ritmo?' },
                ].map(({ icon, label }) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 hover:border-brand-gold/30 transition-all group">
                    <i className={`bi ${icon} text-brand-gold text-xl mb-2 block group-hover:scale-110 transition-transform`} />
                    <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">{label}</p>
                  </div>
                ))}
              </div>
              <Link to="/rutas" className="inline-flex items-center gap-3 bg-brand-gold text-brand-dark px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:scale-105 transition-all shadow-2xl shadow-brand-gold/20">
                <i className="bi bi-stars" />
                Crear Mi Ruta Ahora
              </Link>
              <Link to="/faq" className="inline-flex items-center gap-3 text-brand-gold/60 hover:text-brand-gold transition-colors font-black uppercase tracking-widest text-xs">
                <i className="bi bi-robot" />
                O pregúntale a la IA
              </Link>
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                <i className="bi bi-shield-check mr-1" />
                Gratis · Solo requiere registro
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          8. RESEÑAS
      ══════════════════════════════════════════ */}
      {reseñas.length > 0 && (
        <section className="pt-20 pb-24 bg-brand-dark relative overflow-hidden">
          {/* Ambient glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-gold/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          {/* Decorative background thread */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img src="/Imagenes/hilo-decorativo-liso.jpg" alt="" className="w-full h-full object-cover opacity-[0.07] select-none" aria-hidden="true" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6">

            {/* ── Header ─────────────────────────────── */}
            <div
              ref={reseñasHeaderRef}
              className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px]">
                    <i className="bi bi-chat-quote-fill mr-2" />
                    Experiencias reales
                  </span>
                  {totalReseñas > 0 && (
                    <span className="bg-brand-gold/15 border border-brand-gold/25 text-brand-gold font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">
                      {totalReseñas}+ opiniones
                    </span>
                  )}
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
                  Voces de la <span className="text-brand-blue">ciudad</span>
                </h2>
                <p className="text-slate-500 font-medium text-sm mt-3 max-w-md">
                  Lo que dicen quienes ya han vivido Mérida a través de MéridaActiva.
                </p>
              </div>

              {/* Controles de navegación */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-white/30 font-black text-[9px] uppercase tracking-widest mr-1">
                  {activeCardIndex + 1} / {reseñas.length}
                </span>
                <button
                  onClick={() => {
                    const el = reseñasScrollRef.current;
                    if (!el) return;
                    const cardW = el.querySelector('div')?.offsetWidth ?? 380;
                    el.scrollBy({ left: -(cardW + 24), behavior: 'smooth' });
                  }}
                  className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-brand-gold hover:border-brand-gold text-white hover:text-brand-dark transition-all duration-200 flex items-center justify-center group"
                  aria-label="Anterior"
                >
                  <i className="bi bi-chevron-left text-sm" />
                </button>
                <button
                  onClick={() => {
                    const el = reseñasScrollRef.current;
                    if (!el) return;
                    const cardW = el.querySelector('div')?.offsetWidth ?? 380;
                    el.scrollBy({ left: cardW + 24, behavior: 'smooth' });
                  }}
                  className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-brand-gold hover:border-brand-gold text-white hover:text-brand-dark transition-all duration-200 flex items-center justify-center"
                  aria-label="Siguiente"
                >
                  <i className="bi bi-chevron-right text-sm" />
                </button>
              </div>
            </div>

            {/* ── Carrusel ───────────────────────────── */}
            <div className="relative">
              {/* Fade edges */}
              <div className="absolute left-0 top-0 bottom-6 w-16 bg-gradient-to-r from-brand-dark to-transparent z-10 pointer-events-none rounded-l-3xl" />
              <div className="absolute right-0 top-0 bottom-6 w-16 bg-gradient-to-l from-brand-dark to-transparent z-10 pointer-events-none rounded-r-3xl" />

              <div
                ref={reseñasScrollRef}
                onScroll={() => {
                  const el = reseñasScrollRef.current;
                  if (!el) return;
                  const cardW = (el.querySelector('div')?.offsetWidth ?? 380) + 24;
                  setActiveCardIndex(Math.round(el.scrollLeft / cardW));
                }}
                className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {reseñas.map((res, idx) => (
                  <div
                    key={res.id}
                    className="min-w-[300px] md:min-w-[380px] bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/8 hover:border-brand-gold/20 hover:-translate-y-1 transition-all duration-300 snap-center flex flex-col"
                    style={{ opacity: idx === activeCardIndex ? 1 : 0.65, transition: 'opacity 0.3s, transform 0.3s' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <i className="bi bi-quote text-brand-gold text-3xl opacity-40" />
                      <div className="flex gap-0.5">
                        {Array.from({ length: res.puntuacion || 5 }).map((_, j) => (
                          <i key={j} className="bi bi-star-fill text-brand-gold text-[9px]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-300 italic leading-relaxed font-medium flex-1 mb-8 text-sm">{res.texto}</p>
                    <div className="flex items-center gap-4 border-t border-white/5 pt-5">
                      <div className="w-11 h-11 bg-brand-gold rounded-xl flex items-center justify-center font-black text-brand-dark text-lg shadow-lg flex-shrink-0">
                        {res.nombre_usuario?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-white text-[10px] uppercase tracking-widest truncate">{res.nombre_usuario || 'Explorador'}</p>
                        {res.titulo_evento && (
                          <p className="text-[9px] text-brand-gold/70 font-bold uppercase tracking-widest mt-0.5 truncate">
                            <i className="bi bi-calendar-event mr-1 opacity-60" />
                            {res.titulo_evento}
                          </p>
                        )}
                        {res.created_at && (
                          <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest mt-1">
                            {new Date(res.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Dot indicators + CTA ───────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-6">
              <div className="flex gap-2">
                {reseñas.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const el = reseñasScrollRef.current;
                      if (!el) return;
                      const cardW = (el.querySelector('div')?.offsetWidth ?? 380) + 24;
                      el.scrollTo({ left: cardW * i, behavior: 'smooth' });
                    }}
                    className={`rounded-full transition-all duration-300 ${i === activeCardIndex ? 'w-6 h-2 bg-brand-gold' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
                    aria-label={`Ir a reseña ${i + 1}`}
                  />
                ))}
              </div>
              {totalReseñas > reseñas.length && (
                <Link
                  to="/eventos"
                  className="inline-flex items-center gap-2 text-brand-gold/70 hover:text-brand-gold transition-colors font-black uppercase tracking-widest text-[9px]"
                >
                  Ver todas las opiniones
                  <i className="bi bi-arrow-right" />
                </Link>
              )}
            </div>

          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          9. CTA FINAL
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-32 px-6">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #032B43 0%, #1a2744 40%, #2d4a6e 70%, #3F88C5 100%)' }} />
        <div className="absolute inset-0 opacity-15">
          <img src="/Imagenes/teatro-romano.jpg" alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div className="max-w-3xl mx-auto relative z-10">
          <FluidGlass blur={28} tintOpacity={0.12} borderColor="rgba(255,255,255,0.2)" className="p-12 md:p-16 text-center">
            <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-5 block">
              <i className="bi bi-geo-alt-fill mr-2" />
              ¿Listo para explorar?
            </span>
            <h2 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-6">
              Empieza a descubrir<br />
              <span className="text-brand-gold">Mérida hoy</span>
            </h2>
            <p className="text-white/70 font-medium text-lg max-w-lg mx-auto mb-10 leading-relaxed">
              Regístrate gratis y accede a rutas inteligentes con IA, agenda personal, favoritos y mucho más.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/registro" className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl shadow-brand-gold/20 bg-brand-gold text-brand-dark">
                <i className="bi bi-person-plus-fill" />
                Registrarse
              </Link>
              <Link to="/rutas" className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs border hover:scale-105 transition-all border-white/25 text-white hover:bg-white/10">
                <i className="bi bi-stars" />
                Crear Ruta Personalizada
              </Link>
              <Link to="/faq" className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs border hover:scale-105 transition-all border-white/25 text-white hover:bg-white/10">
                <i className="bi bi-robot" />
                Chat IA
              </Link>
            </div>
          </FluidGlass>
        </div>
      </section>

    </div>
  );
};

export default Home;