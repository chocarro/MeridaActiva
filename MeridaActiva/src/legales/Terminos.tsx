import React from 'react';
import { Link } from 'react-router-dom';

const Terminos: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Legal</span>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-brand-dark leading-none mb-4">
            Términos de Uso
          </h1>
          <p className="text-slate-400 font-bold text-sm">Última actualización: 17 de marzo de 2026</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-sm border border-slate-100 space-y-10">

          <section>
            <h2 className="text-brand-dark font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xs font-black">1</span>
              Objeto y ámbito de aplicación
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Los presentes Términos regulan el acceso y uso de <strong className="text-brand-dark">MéridaActiva</strong>, disponible en <em>meridaactiva.vercel.app</em>, desarrollada como Proyecto Integrado del Ciclo Formativo de Desarrollo de Aplicaciones Web en Mérida, Extremadura, España. El acceso implica la aceptación plena de estos Términos.
            </p>
          </section>
          <div className="h-px bg-slate-100" />

          <section>
            <h2 className="text-brand-dark font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xs font-black">2</span>
              Registro de usuario
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium mb-4">Al registrarte te comprometes a:</p>
            <ul className="space-y-2 text-slate-600 font-medium">
              {['Proporcionar información veraz y completa.', 'Custodiar tus credenciales y no cederlas a terceros.', 'Notificar cualquier uso no autorizado de tu cuenta.'].map((item, i) => (
                <li key={i} className="flex items-start gap-3"><i className="bi bi-check2 text-brand-gold mt-0.5 flex-shrink-0" />{item}</li>
              ))}
            </ul>
          </section>
          <div className="h-px bg-slate-100" />

          <section>
            <h2 className="text-brand-dark font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xs font-black">3</span>
              Usos prohibidos
            </h2>
            <ul className="space-y-2 text-slate-600 font-medium">
              {['Publicar reseñas falsas o difamatorias.', 'Usar la plataforma con fines comerciales no autorizados.', 'Acceder a cuentas ajenas o áreas restringidas.', 'Reproducir o distribuir contenidos sin autorización.', 'Utilizar bots o scrapers para acceder a la plataforma.'].map((item, i) => (
                <li key={i} className="flex items-start gap-3"><i className="bi bi-x text-brand-red mt-0.5 flex-shrink-0" />{item}</li>
              ))}
            </ul>
          </section>
          <div className="h-px bg-slate-100" />

          <section>
            <h2 className="text-brand-dark font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xs font-black">4</span>
              Limitación de responsabilidad
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">MéridaActiva no se hace responsable de cambios en eventos de terceros, inexactitudes en horarios o precios, ni interrupciones del servicio por causas ajenas a nuestro control.</p>
          </section>
          <div className="h-px bg-slate-100" />

          <section>
            <h2 className="text-brand-dark font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xs font-black">5</span>
              Legislación aplicable
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">Estos Términos se rigen por la legislación española. Cualquier controversia se someterá a los juzgados de Mérida, con renuncia a cualquier otro fuero.</p>
          </section>

          <div className="bg-brand-bg rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-black text-brand-dark uppercase tracking-wide text-sm mb-1">¿Tienes alguna pregunta?</p>
              <p className="text-slate-400 text-sm font-medium">Escríbenos y te responderemos.</p>
            </div>
            <Link to="/contacto" className="flex items-center gap-2 bg-brand-dark text-brand-gold px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all flex-shrink-0">
              <i className="bi bi-envelope-fill" />Contactar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminos;