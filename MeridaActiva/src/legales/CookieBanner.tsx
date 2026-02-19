import React, { useState, useEffect } from 'react';

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[400px] bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl border border-white/10 z-[1000] animate-fade-in-up">
      <div className="flex flex-col gap-6">
        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900 text-2xl">
          <i className="bi bi-cookie"></i>
        </div>
        <div>
          <h4 className="font-black uppercase tracking-widest text-xs mb-2 text-amber-500">Política de Cookies</h4>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Usamos cookies para guardar tus favoritos y mostrar eventos en el mapa de Mérida.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={accept} className="flex-1 bg-white text-slate-900 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 transition-all">
            ACEPTAR TODAS
          </button>
          <button onClick={() => setVisible(false)} className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-white transition-all">
            RECHAZAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;