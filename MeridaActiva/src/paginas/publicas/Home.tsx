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
import AnimatedList from '../../componentes/animaciones/AnimatedList';
import { useSeoMeta } from '../../hooks/useSeoMeta';

gsap.registerPlugin(ScrollTrigger);

// ── Datos ────────────────────────────────────────────────────────
const RAZONES = [
  { num: '1', titulo: 'Agenda Centralizada', desc: 'Todos los eventos culturales, gastronómicos y de ocio de Mérida en un solo lugar, actualizado en tiempo real.', icon: 'bi-calendar-check', gradient: 'from-amber-400/20 via-yellow-300/10 to-transparent' },
  { num: '2', titulo: 'Rutas con IA', desc: 'Genera itinerarios personalizados con inteligencia artificial adaptados a tu tiempo, compañía y ritmo de viaje.', icon: 'bi-cpu', gradient: 'from-blue-400/20 via-sky-300/10 to-transparent' },
  { num: '3', titulo: 'Patrimonio UNESCO', desc: 'Accede a información detallada de los monumentos romanos más importantes de España en un clic.', icon: 'bi-columns-gap', gradient: 'from-emerald-400/20 via-teal-300/10 to-transparent' },
  { num: '4', titulo: 'Tu Agenda Personal', desc: 'Guarda favoritos, crea recordatorios y organiza tu visita con un calendario personal completamente gratis.', icon: 'bi-bookmark-star', gradient: 'from-rose-400/20 via-pink-300/10 to-transparent' },
];

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
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75', fallback: '/Imagenes/teatro-romano.jpg', label: 'Teatro Romano' },
  { src: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=75', fallback: '/Imagenes/CULTURAL.jpg', label: 'Anfiteatro' },
  { src: 'https://images.unsplash.com/photo-1579783483458-83d02161294e?w=400&q=75', fallback: '/Imagenes/MUSICA.jpg', label: 'Puente Romano' },
  { src: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&q=75', fallback: '/Imagenes/Museo Romano.webp', label: 'Acueducto' },
  { src: 'https://images.unsplash.com/photo-1567529684892-09290a1b2d05?w=400&q=75', fallback: '/Imagenes/TEATRO.JPG', label: 'Templo de Diana' },
  { src: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=400&q=75', fallback: '/Imagenes/merida-maravilla-monumental.jpg', label: 'Gastronomía' },
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75', fallback: '/Imagenes/teatro-romano.jpg', label: 'Teatro Romano' },
  { src: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=75', fallback: '/Imagenes/CULTURAL.jpg', label: 'Anfiteatro' },
  { src: 'https://images.unsplash.com/photo-1579783483458-83d02161294e?w=400&q=75', fallback: '/Imagenes/MUSICA.jpg', label: 'Puente Romano' },
  { src: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&q=75', fallback: '/Imagenes/Museo Romano.webp', label: 'Acueducto' },
  { src: 'https://images.unsplash.com/photo-1567529684892-09290a1b2d05?w=400&q=75', fallback: '/Imagenes/TEATRO.JPG', label: 'Templo de Diana' },
  { src: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=400&q=75', fallback: '/Imagenes/merida-maravilla-monumental.jpg', label: 'Gastronomía' },
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

function Img({ src, fallback, alt, className }: { src: string; fallback: string; alt: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
      loading="lazy"
    />
  );
}

// ════════════════════════════════════════════════════════════════
const Home: React.FC = () => {
  const [reseñas, setReseñas] = useState<any[]>([]);
  const [statsActive, setStatsActive] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroBadgeRef = useRef<HTMLSpanElement>(null);
  const heroCTARef = useRef<HTMLDivElement>(null);
  const parallaxBgRef = useRef<HTMLImageElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const razonesRef = useStaggerOnScroll();

  const { ref: bandRef, visible: bandVisible } = useFadeInOnScroll();
  const { ref: razonesHeaderRef, visible: razonesHeaderVisible } = useFadeInOnScroll();
  const { ref: categoriasHeaderRef, visible: categoriasHeaderVisible } = useFadeInOnScroll();
  const { ref: reseñasHeaderRef, visible: reseñasHeaderVisible } = useFadeInOnScroll();

  useSeoMeta({
    title: 'MeridaActiva — Eventos, Turismo y Gastronomía en Mérida',
    description: 'Descubre la agenda cultural, el patrimonio romano y los mejores restaurantes de Mérida (Extremadura). La ciudad más romana de España te espera.',
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
      const { data } = await supabase
        .from('comentarios')
        .select('id, texto, nombre_usuario, puntuacion, created_at, evento_id')
        .order('created_at', { ascending: false })
        .limit(6);
      if (!data?.length) return;
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
              La plataforma definitiva para descubrir eventos, monumentos romanos y gastronomía en la ciudad más antigua de España.
            </p>
          </div>

          <div ref={heroCTARef} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/eventos" className="inline-flex items-center justify-center gap-3 bg-brand-gold text-brand-dark px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:scale-105 transition-all shadow-2xl shadow-brand-gold/30" style={{ opacity: 0 }}>
              <i className="bi bi-calendar-event" />
              Ver Agenda
            </Link>
            <Link to="/rutas" className="inline-flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-blue hover:border-brand-blue hover:scale-105 transition-all" style={{ opacity: 0 }}>
              <i className="bi bi-cpu" />
              Crear Ruta con IA
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/30 text-[9px] font-black uppercase tracking-widest">Descubre</span>
          <i className="bi bi-chevron-down text-white/30 text-lg" />
        </div>
      </header>

      {/* ══════════════════════════════════════════
          2. FRANJA TICKER
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
              <Img src={item.src} fallback={item.fallback} alt={item.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-brand-dark/40 group-hover:bg-brand-dark/20 transition-colors" />
              <span className="absolute bottom-3 left-3 text-[8px] font-black text-white uppercase tracking-widest">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          3. BAND — Texto rotativo
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-brand-dark text-center overflow-hidden">
        <div
          ref={bandRef}
          className="max-w-4xl mx-auto px-6 transition-all duration-1000"
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
      <section ref={statsRef} className="py-20 bg-brand-dark border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => <StatCard key={i} {...s} active={statsActive} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. POR QUÉ MERIDAACTIVA — tarjetas con gradiente metta
      ══════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div
            ref={razonesHeaderRef}
            className="text-center mb-20 transition-all duration-1000"
            style={{ opacity: razonesHeaderVisible ? 1 : 0, transform: razonesHeaderVisible ? 'translateY(0)' : 'translateY(30px)' }}
          >
            <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">¿Por qué elegirnos?</span>
            <ScrollFloat textClassName="text-5xl md:text-6xl font-black text-brand-dark italic uppercase tracking-tighter">
              4 razones para usar MeridaActiva
            </ScrollFloat>
          </div>

          <div ref={razonesRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {RAZONES.map((r) => (
              <div
                key={r.num}
                className={`relative rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-default overflow-hidden bg-gradient-to-br ${r.gradient} bg-brand-bg`}
              >
                <span className="absolute -right-2 -top-4 text-[7rem] font-black text-black/5 select-none leading-none pointer-events-none">
                  {r.num}
                </span>
                <div className="w-12 h-12 bg-brand-dark rounded-2xl flex items-center justify-center mb-5 group-hover:bg-brand-gold group-hover:scale-110 transition-all duration-300 relative z-10">
                  <i className={`bi ${r.icon} text-brand-gold group-hover:text-brand-dark text-xl transition-colors`} />
                </div>
                <h3 className="font-black text-brand-dark uppercase italic tracking-tight text-lg mb-3 group-hover:text-brand-blue transition-colors relative z-10">
                  {r.titulo}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed relative z-10">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. CATEGORÍAS — ScrollStack con gradiente metta
      ══════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-brand-bg">
        <div className="max-w-4xl mx-auto">
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
                  <div
                    className="relative w-full h-80 md:h-[28rem] rounded-[2.5rem] overflow-hidden"
                    style={{ background: cat.gradient }}
                  >
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
                      <h3
                        className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-3 transition-colors duration-300"
                        style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
                      >
                        {cat.title}
                      </h3>
                      <p className="text-white/70 text-sm font-medium leading-relaxed max-w-lg mb-5">
                        {cat.desc}
                      </p>
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
          7. CTA RUTAS IA
      ══════════════════════════════════════════ */}
      <section className="py-0">
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
                <i className="bi bi-cpu mr-2" />
                Inteligencia Artificial
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
        <section className="py-32 bg-brand-dark relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="relative z-10">
            <div
              ref={reseñasHeaderRef}
              className="text-center mb-16 px-6 transition-all duration-1000"
              style={{ opacity: reseñasHeaderVisible ? 1 : 0, transform: reseñasHeaderVisible ? 'translateY(0)' : 'translateY(30px)' }}
            >
              <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Experiencias reales</span>
              <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
                Voces de la <span className="text-brand-blue">ciudad</span>
              </h2>
            </div>
            <AnimatedList className="flex overflow-x-auto gap-6 pb-6 px-6 md:px-16 snap-x snap-mandatory hide-scrollbar">
              {reseñas.map((res) => (
                <div key={res.id} className="min-w-[300px] md:min-w-[380px] bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/10 hover:border-brand-gold/20 hover:-translate-y-1 transition-all duration-300 snap-center flex flex-col">
                  <i className="bi bi-quote text-brand-gold text-4xl opacity-40 mb-4" />
                  <p className="text-slate-300 italic leading-relaxed font-medium flex-1 mb-8">{res.texto}</p>
                  <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                    <div className="w-11 h-11 bg-brand-gold rounded-xl flex items-center justify-center font-black text-brand-dark text-lg shadow-lg flex-shrink-0">
                      {res.nombre_usuario?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-white text-[10px] uppercase tracking-widest truncate">{res.nombre_usuario || 'Explorador'}</p>
                      {res.titulo_evento && <p className="text-[9px] text-brand-gold/70 font-bold uppercase tracking-widest mt-0.5 truncate">{res.titulo_evento}</p>}
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: res.puntuacion || 5 }).map((_, j) => <i key={j} className="bi bi-star-fill text-brand-gold text-[8px]" />)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </AnimatedList>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          9. CTA FINAL — FluidGlass sobre gradiente
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-32 px-6">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #032B43 0%, #1a2744 40%, #2d4a6e 70%, #3F88C5 100%)' }}
        />
        <div className="absolute inset-0 opacity-15">
          <img
            src="/Imagenes/teatro-romano.jpg"
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
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
              Regístrate gratis y accede a rutas inteligentes, agenda personal, favoritos y mucho más.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/registro" className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl shadow-brand-gold/20 bg-brand-gold text-brand-dark">
                <i className="bi bi-person-plus-fill" />
                Crear Cuenta Gratis
              </Link>
              <Link to="/contacto" className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs border hover:scale-105 transition-all border-white/25 text-white">
                <i className="bi bi-envelope-fill" />
                Contactar
              </Link>
            </div>
          </FluidGlass>
        </div>
      </section>

    </div>
  );
};

export default Home;