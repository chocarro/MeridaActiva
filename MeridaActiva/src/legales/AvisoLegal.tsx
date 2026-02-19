import React from 'react';
import Footer from '../componentes/Footer';

const AvisoLegal: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 text-start">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-12 uppercase italic">
          Aviso Legal
        </h1>
        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-sm border border-slate-100">
          <section className="mb-10">
            <h5 className="text-amber-600 font-black uppercase tracking-widest text-sm mb-4">1. Datos Identificativos</h5>
            <p className="text-slate-600 leading-relaxed font-medium mb-4">
              En cumplimiento con el deber de información, se facilitan los siguientes datos:
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2 text-slate-700 font-bold"><span className="text-slate-400">Titular:</span> Proyecto MéridaActiva (DAW Mérida)</li>
              <li className="flex gap-2 text-slate-700 font-bold"><span className="text-slate-400">Email:</span> info@meridaactiva.com</li>
              <li className="flex gap-2 text-slate-700 font-bold"><span className="text-slate-400">Ubicación:</span> Mérida, Extremadura, España</li>
            </ul>
          </section>

          <section>
            <h5 className="text-amber-600 font-black uppercase tracking-widest text-sm mb-4">2. Propiedad Intelectual</h5>
            <p className="text-slate-600 leading-relaxed font-medium">
              Todos los derechos sobre los contenidos de esta web (textos, imágenes, diseño) pertenecen a 
              <span className="text-slate-900 font-bold"> MéridaActiva</span>. Queda prohibida su reproducción sin permiso previo.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AvisoLegal;