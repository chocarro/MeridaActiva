import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forceNuclearLogout } from '../../context/AuthContext';
import Logo from '../../componentes/Logo';

/**
 * Ruta pública de emergencia: limpia el estado de Supabase en el navegador
 * cuando la sesión queda corrupta y la app no responde bien.
 * No requiere iniciar sesión.
 */
const RecuperarSesion: React.FC = () => {
  const [limpiando, setLimpiando] = useState(false);

  const limpiar = async () => {
    setLimpiando(true);
    await forceNuclearLogout();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-brand-bg">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-10 md:p-12 text-center">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <h1 className="text-2xl font-black text-brand-dark uppercase italic tracking-tight mb-3">
          Recuperar sesión
        </h1>
        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
          Si la página se queda colgada, no puedes cerrar sesión o ves datos raros, pulsa el botón.
          Se borrarán las credenciales guardadas en este navegador y volverás al inicio.
        </p>
        <button
          type="button"
          onClick={limpiar}
          disabled={limpiando}
          className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-brand-red text-white hover:bg-red-700 transition-all disabled:opacity-50 mb-4"
        >
          {limpiando ? 'Limpiando…' : 'Limpiar sesión y continuar'}
        </button>
        <Link
          to="/login"
          className="text-[10px] font-black uppercase tracking-widest text-brand-blue hover:text-brand-dark"
        >
          Ir al inicio de sesión
        </Link>
      </div>
    </div>
  );
};

export default RecuperarSesion;
