import React from 'react';
import Footer from '../componentes/Footer';

const Privacidad: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 text-start">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-12 uppercase italic">
          Privacidad
        </h1>
        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-sm border border-slate-100">
          <section className="mb-10">
            <h5 className="text-amber-600 font-black uppercase tracking-widest text-sm mb-4">Tratamiento de Datos Personales</h5>
            <p className="text-slate-600 leading-relaxed font-medium">
              De conformidad con el RGPD, informamos que los datos recogidos a través del formulario de registro 
              (email y nombre) son utilizados exclusivamente para la gestión de tu perfil de usuario, favoritos y alertas.
            </p>
          </section>

          <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
            <h5 className="text-slate-900 font-black uppercase tracking-widest text-sm mb-4">Tus Derechos</h5>
            <p className="text-slate-600 leading-relaxed font-medium">
              Puedes ejercer tus derechos de acceso, rectificación o eliminación de tus datos enviando un 
              correo a nuestro contacto oficial. <span className="text-slate-900 font-bold italic">No cedemos datos a terceros.</span>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacidad;