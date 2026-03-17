// src/paginas/NotFound.tsx
// ─────────────────────────────────────────────────────────────────
// Página 404 personalizada.
// CAMBIOS: Creado desde cero con diseño propio del sistema de
// diseño (brand-dark, brand-gold, rounded-[2rem], font-black italic
// uppercase) y animación de entrada con GSAP, como todas las demás
// páginas de la app.
// ─────────────────────────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

const NotFound: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const numRef     = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Número 404 — baja desde arriba con un ligero rebote
      if (numRef.current)
        tl.fromTo(
          numRef.current,
          { opacity: 0, y: -80, scale: 0.7 },
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'back.out(1.4)' }
        );

      // Texto y botón — suben desde abajo en stagger
      if (contentRef.current)
        tl.fromTo(
          Array.from(contentRef.current.children),
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 },
          '-=0.5'
        );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="min-h-screen bg-brand-bg flex items-center justify-center px-6 py-20"
    >
      {/* Halo decorativo de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-gold/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-brand-blue/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">

        {/* Número 404 — elemento decorativo */}
        <div
          ref={numRef}
          className="text-[12rem] md:text-[16rem] font-black italic uppercase tracking-tighter leading-none text-brand-dark select-none"
          style={{ opacity: 0 }}
          aria-hidden="true"
        >
          <span className="text-brand-gold">4</span>
          0
          <span className="text-brand-gold">4</span>
        </div>

        {/* Contenido */}
        <div ref={contentRef} className="space-y-6 -mt-6 md:-mt-12">

          {/* Icono */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-[2rem] bg-brand-dark flex items-center justify-center shadow-xl">
              <i className="bi bi-compass text-brand-gold text-2xl" />
            </div>
          </div>

          {/* Título */}
          <div>
            <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-3 block">
              Error 404
            </span>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-brand-dark leading-none">
              Página no encontrada
            </h1>
          </div>

          {/* Descripción */}
          <p className="text-slate-500 font-medium text-base leading-relaxed max-w-sm mx-auto">
            Parece que esta ruta no existe en Mérida Activa. Quizás fue movida o el enlace es incorrecto.
          </p>

          {/* Botón volver */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-3 bg-brand-dark text-brand-gold px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-gold hover:text-brand-dark transition-all shadow-2xl hover:-translate-y-1 active:scale-95"
            >
              <i className="bi bi-house-fill" />
              Volver al Inicio
            </Link>
            <Link
              to="/eventos"
              className="inline-flex items-center justify-center gap-3 bg-white border-2 border-brand-dark text-brand-dark px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-dark hover:text-brand-gold transition-all active:scale-95"
            >
              <i className="bi bi-calendar-event" />
              Ver Agenda
            </Link>
          </div>

          {/* Nota decorativa */}
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] pt-4">
            <i className="bi bi-geo-alt mr-1" />
            MeridaActiva · Augusta Emerita
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
