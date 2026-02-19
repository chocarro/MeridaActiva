import React from 'react';
import Footer from '../componentes/Footer';

const Cookies: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 text-start">
        {/* Título Estilizado */}
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-12 uppercase italic">
          Política de <span className="text-amber-500">Cookies</span>
        </h1>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-sm border border-slate-100">
          <p className="text-slate-600 leading-relaxed font-medium mb-10 text-lg">
            En <span className="text-slate-900 font-bold">MéridaActiva</span> utilizamos cookies propias y de terceros para que tu experiencia explorando la ciudad sea perfecta. A continuación, detallamos qué son y para qué las usamos.
          </p>

          <section className="mb-12">
            <h5 className="text-amber-600 font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
              <i className="bi bi-info-circle-fill"></i> ¿Qué es una cookie?
            </h5>
            <p className="text-slate-600 leading-relaxed font-medium">
              Una cookie es un pequeño archivo de texto que se almacena en tu navegador cuando visitas casi cualquier página web. Su utilidad es que la web sea capaz de recordar tu visita cuando vuelvas a navegar por esa página.
            </p>
          </section>

          {/* Tabla de Cookies Estilizada */}
          <section className="mb-12">
            <h5 className="text-amber-600 font-black uppercase tracking-widest text-sm mb-6">Cookies utilizadas en esta web</h5>
            <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Tipo de Cookie</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Finalidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">Técnicas</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Propias</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      Necesarias para mantener tu sesión iniciada (Supabase) y recordar tus preferencias de seguridad.
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">Funcionales</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Propias</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      Permiten guardar tus monumentos favoritos y personalizar tu dashboard de usuario.
                    </td>
                  </tr>
                  <tr className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">Mapas</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Terceros</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      Gestionadas por OpenStreetMap para geolocalizar los eventos y monumentos en el mapa de Mérida.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-slate-900 rounded-[2rem] p-8 text-white">
            <h5 className="text-amber-500 font-black uppercase tracking-widest text-xs mb-4">¿Cómo desactivarlas?</h5>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Puedes restringir, bloquear o borrar las cookies de MéridaActiva utilizando la configuración de tu navegador. En cada navegador la operativa es diferente, la función de 'Ayuda' te mostrará cómo hacerlo.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cookies;