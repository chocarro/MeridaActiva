import React from 'react';
import { Link } from 'react-router-dom';

const Privacidad: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Legal</span>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-brand-dark leading-none mb-4">
            Política de Privacidad
          </h1>
          <p className="text-slate-400 font-bold text-sm">Última actualización: 17 de marzo de 2026</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-sm border border-slate-100 space-y-10">

          <section>
            <h2 className="text-brand-dark font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xs font-black">1</span>
              Responsable del tratamiento
            </h2>
            <div className="bg-brand-bg rounded-2xl p-6 space-y-2">
              {[['Titular', 'Proyecto MéridaActiva (DAW Mérida)'], ['Email', 'info@meridaactiva.com'], ['Ubicación', 'Mérida, Extremadura, España']].map(([label, value]) => (
                <div key={label} className="flex gap-3 text-sm">
                  <span className="text-slate-400 font-black uppercase tracking-widest text-[10px] w-20 flex-shrink-0 pt-0.5">{label}</span>
                  <span className="text-brand-dark font-bold">{value}</span>
                </div>
              ))}
            </div>
          </section>
          <div className="h-px bg-slate-100" />

          <section>
            <h2 className="text-brand-dark font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xs font-black">2</span>
              Datos que recogemos
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium mb-4">De conformidad con el <strong className="text-brand-dark">RGPD (UE) 2016/679</strong> y la LOPDGDD, recogemos:</p>
            <ul className="space-y-2 text-slate-600 font-medium">
              {[
                'Datos de registro: email y nombre de usuario (obligatorios para crear una cuenta).',
                'Datos de uso: eventos favoritos, eventos en agenda personal y reseñas publicadas.',
                'Datos de suscripción: email para el newsletter (solo si te suscribes voluntariamente).',
                'Datos técnicos: dirección IP y cookies de sesión (necesarias para el funcionamiento).',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3"><i className="bi bi-dot text-brand-gold text-xl flex-shrink-0 -mt-1" />{item}</li>
              ))}
            </ul>
          </section>
          <div className="h-px bg-slate-100" />

          <section>
            <h2 className="text-brand-dark font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xs font-black">3</span>
              Finalidad y base legal
            </h2>
            <div className="space-y-4">
              {[
                { fin: 'Gestión de cuenta', base: 'Ejecución de contrato (Art. 6.1.b RGPD)' },
                { fin: 'Newsletter semanal', base: 'Consentimiento expreso (Art. 6.1.a RGPD)' },
                { fin: 'Seguridad y prevención de fraude', base: 'Interés legítimo (Art. 6.1.f RGPD)' },
              ].map((row, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-2 p-4 bg-brand-bg rounded-2xl">
                  <span className="font-black text-brand-dark text-sm md:w-48 flex-shrink-0">{row.fin}</span>
                  <span className="text-slate-500 text-sm font-medium">{row.base}</span>
                </div>
              ))}
            </div>
          </section>
          <div className="h-px bg-slate-100" />

          <section>
            <h2 className="text-brand-dark font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xs font-black">4</span>
              Tus derechos
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium mb-4">Puedes ejercer en cualquier momento los siguientes derechos escribiéndonos a <strong className="text-brand-dark">info@meridaactiva.com</strong>:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Acceso', 'Rectificación', 'Supresión', 'Oposición', 'Portabilidad', 'Limitación'].map((derecho) => (
                <div key={derecho} className="bg-brand-bg rounded-xl p-3 text-center">
                  <i className="bi bi-shield-check text-brand-green block mb-1" />
                  <span className="font-black text-brand-dark text-[10px] uppercase tracking-widest">{derecho}</span>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-sm font-medium mt-4">
              También tienes derecho a presentar una reclamación ante la <strong className="text-brand-dark">Agencia Española de Protección de Datos</strong> (aepd.es).
            </p>
          </section>
          <div className="h-px bg-slate-100" />

          <section>
            <h2 className="text-brand-dark font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xs font-black">5</span>
              Conservación y seguridad
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Tus datos se almacenan en servidores de <strong className="text-brand-dark">Supabase</strong> (infraestructura europea, Frankfurt). Conservamos los datos mientras mantengas tu cuenta activa o mientras sean necesarios para las finalidades indicadas. <strong className="text-brand-dark">No cedemos datos a terceros</strong> ni los usamos para publicidad.
            </p>
          </section>

          <div className="bg-brand-bg rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-black text-brand-dark uppercase tracking-wide text-sm mb-1">¿Quieres ejercer tus derechos?</p>
              <p className="text-slate-400 text-sm font-medium">Contáctanos y gestionamos tu solicitud en 72h.</p>
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

export default Privacidad;