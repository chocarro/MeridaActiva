import React from 'react';

const AvisoLegal: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Legal</span>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-brand-dark leading-none mb-4">
            Aviso Legal
          </h1>
          <p className="text-slate-400 font-bold text-sm">Última actualización: 17 de marzo de 2026</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-sm border border-slate-100 space-y-10">

          <section>
            <h2 className="text-brand-dark font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xs font-black">1</span>
              Datos identificativos
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium mb-4">
              En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSICE), se facilitan los siguientes datos:
            </p>
            <div className="bg-brand-bg rounded-2xl p-6 space-y-3">
              {[
                ['Titular', 'Proyecto MéridaActiva'],
                ['Naturaleza', 'Proyecto educativo — DAW (Desarrollo de Aplicaciones Web)'],
                ['Centro', 'IES Mérida, Extremadura, España'],
                ['Email de contacto', 'info@meridaactiva.com'],
                ['URL', 'https://meridaactiva.vercel.app'],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col md:flex-row gap-2 text-sm">
                  <span className="text-slate-400 font-black uppercase tracking-widest text-[10px] md:w-40 flex-shrink-0 pt-0.5">{label}</span>
                  <span className="text-brand-dark font-bold">{value}</span>
                </div>
              ))}
            </div>
          </section>
          <div className="h-px bg-slate-100" />

          <section>
            <h2 className="text-brand-dark font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xs font-black">2</span>
              Propiedad intelectual e industrial
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Todos los contenidos de esta web —textos, imágenes, logotipos, diseño gráfico, código fuente y cualquier otro elemento— son propiedad de MéridaActiva o de sus respectivos autores, y están protegidos por la legislación española e internacional sobre propiedad intelectual e industrial. Queda expresamente prohibida su reproducción, distribución, comunicación pública o transformación sin autorización expresa y por escrito.
            </p>
            <p className="text-slate-600 leading-relaxed font-medium mt-4">
              Las fotografías de monumentos y espacios públicos de Mérida utilizadas en la plataforma son de dominio público o están licenciadas bajo Creative Commons. Las imágenes de Unsplash utilizadas como fallback están sujetas a la <a href="https://unsplash.com/license" className="text-brand-blue underline" target="_blank" rel="noopener noreferrer">licencia Unsplash</a>.
            </p>
          </section>
          <div className="h-px bg-slate-100" />

          <section>
            <h2 className="text-brand-dark font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xs font-black">3</span>
              Exclusión de responsabilidad
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              MéridaActiva no garantiza la exactitud, integridad o actualidad de los contenidos publicados por terceros (organizadores de eventos, reseñas de usuarios). La información sobre horarios, precios y ubicaciones debe verificarse directamente con los organizadores antes de asistir.
            </p>
          </section>
          <div className="h-px bg-slate-100" />

          <section>
            <h2 className="text-brand-dark font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xs font-black">4</span>
              Legislación aplicable y jurisdicción
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              El presente Aviso Legal se rige por la legislación española, en particular por la LSSICE (Ley 34/2002), la LOPDGDD (Ley 3/2018) y el RGPD (UE) 2016/679. Para la resolución de cualquier controversia, las partes se someten a los Juzgados y Tribunales de Mérida.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AvisoLegal;