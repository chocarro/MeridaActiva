import React from 'react';

const Cookies: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Legal</span>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-brand-dark leading-none mb-4">
            Política de Cookies
          </h1>
          <p className="text-slate-400 font-bold text-sm">Última actualización: 17 de marzo de 2026</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-sm border border-slate-100 space-y-10">

          <section>
            <h2 className="text-brand-dark font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xs font-black">1</span>
              ¿Qué es una cookie?
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Una cookie es un pequeño archivo de texto que se almacena en tu dispositivo cuando visitas una página web. Permite que la web recuerde información sobre tu visita para mejorar tu experiencia en futuras visitas.
            </p>
          </section>
          <div className="h-px bg-slate-100" />

          <section>
            <h2 className="text-brand-dark font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xs font-black">2</span>
              Cookies utilizadas en MéridaActiva
            </h2>
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-brand-dark text-white">
                  <tr>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Tipo</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Nombre</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Finalidad</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Duración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { tipo: 'Técnica', nombre: 'sb-*-auth-token', fin: 'Mantiene tu sesión iniciada (Supabase Auth)', dur: 'Sesión' },
                    { tipo: 'Funcional', nombre: 'cookie-consent', fin: 'Recuerda tus preferencias de cookies', dur: '1 año' },
                    { tipo: 'Terceros', nombre: '(OpenStreetMap)', fin: 'Tiles del mapa interactivo de monumentos', dur: 'Sesión' },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-brand-bg/50'}>
                      <td className="px-6 py-4">
                        <span className="font-black text-brand-dark text-xs">{row.tipo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-[10px] bg-brand-bg px-2 py-1 rounded font-mono text-brand-blue">{row.nombre}</code>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm font-medium">{row.fin}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs font-black uppercase tracking-widest">{row.dur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-slate-500 text-sm font-medium mt-4">
              <strong className="text-brand-dark">No utilizamos</strong> cookies de publicidad comportamental ni de seguimiento de terceros.
            </p>
          </section>
          <div className="h-px bg-slate-100" />

          <section>
            <h2 className="text-brand-dark font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xs font-black">3</span>
              Cómo gestionar las cookies
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium mb-4">
              Puedes configurar tu navegador para aceptar, rechazar o eliminar las cookies en cualquier momento:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { nav: 'Chrome', url: 'support.google.com' },
                { nav: 'Firefox', url: 'support.mozilla.org' },
                { nav: 'Safari', url: 'support.apple.com' },
                { nav: 'Edge', url: 'support.microsoft.com' },
              ].map((b) => (
                <div key={b.nav} className="bg-brand-bg rounded-xl p-4 text-center">
                  <i className="bi bi-browser-chrome text-brand-blue text-xl block mb-2" />
                  <span className="font-black text-brand-dark text-[10px] uppercase tracking-widest block">{b.nav}</span>
                  <span className="text-slate-400 text-[9px]">{b.url}</span>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-sm font-medium mt-4">
              Ten en cuenta que deshabilitar las cookies técnicas puede afectar al funcionamiento de tu sesión en la plataforma.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Cookies;