import React from 'react';
import Footer from '../componentes/Footer';

const Terminos: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 text-start">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-12 uppercase italic">
          Términos
        </h1>
        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-sm border border-slate-100">
          <section className="mb-10">
            <h5 className="text-amber-600 font-black uppercase tracking-widest text-sm mb-4">Uso de la Plataforma</h5>
            <p className="text-slate-600 leading-relaxed font-medium italic border-l-4 border-amber-500 pl-6">
              Al usar MéridaActiva, te comprometes a hacer un uso lícito de los contenidos y a no publicar 
              reseñas falsas o contenido ofensivo en los eventos de la ciudad.
            </p>
          </section>

          <section>
            <h5 className="text-amber-600 font-black uppercase tracking-widest text-sm mb-4">Responsabilidad</h5>
            <p className="text-slate-600 leading-relaxed font-medium">
              MéridaActiva no se hace responsable de cambios de última hora en los eventos organizados por 
              terceros, aunque intentamos mantener la información siempre actualizada.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terminos;