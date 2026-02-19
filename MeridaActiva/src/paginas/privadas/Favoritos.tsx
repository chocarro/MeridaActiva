import React from 'react';
import { Link } from 'react-router-dom';

const Favoritos: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
      <div className="max-w-md w-full px-8 text-center">
        <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner">
          <i className="bi bi-heart-fill"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Mis Favoritos</h2>
        <p className="text-slate-500 leading-relaxed mb-10 font-medium">
          Aquí aparecerán los monumentos y eventos que marques como preferidos durante tu exploración de Mérida.
        </p>
        <Link to="/eventos" className="inline-block bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl">
          Explorar Agenda
        </Link>
      </div>
    </div>
  );
};

export default Favoritos;