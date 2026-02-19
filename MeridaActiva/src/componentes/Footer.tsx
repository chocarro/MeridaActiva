import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer: React.FC = () => {
  const { profile } = useAuth();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-white/5 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Marca y Propósito */}
          <div className="space-y-6">
            <Link to="/" className="text-2xl font-black text-white tracking-tighter">
              Mérida<span className="text-amber-500">Activa</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              La plataforma inteligente para descubrir el legado de Augusta Emerita. 
              Agenda cultural y monumentos en un solo lugar.
            </p>
            <div className="flex gap-4">
              {['facebook', 'instagram', 'twitter'].map((social) => (
                <a key={social} href={`#${social}`} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-all">
                  <i className={`bi bi-${social}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Navegación Rápida */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-6">Explorar</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/eventos" className="hover:text-amber-500 transition-colors">Eventos</Link></li>
              <li><Link to="/lugares" className="hover:text-amber-500 transition-colors">Monumentos</Link></li>
              <li><Link to="/mapa" className="hover:text-amber-500 transition-colors">Mapas</Link></li>
              {profile && <li><Link to="/perfil" className="hover:text-amber-500 transition-colors">Mi Perfil</Link></li>}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-6">Información</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/aviso-legal" className="hover:text-amber-500 transition-colors">Aviso Legal</Link></li>
              <li><Link to="/privacidad" className="hover:text-amber-500 transition-colors">Privacidad</Link></li>
              <li><Link to="/cookies" className="hover:text-amber-500 transition-colors">Cookies</Link></li>
              <li><Link to="/terminos" className="hover:text-amber-500 transition-colors">Términos</Link></li>
            </ul>
          </div>

          {/* Newsletter / Administración */}
          <div className="space-y-6">
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
              <h4 className="text-white font-bold text-sm mb-4">No te pierdas nada</h4>
              <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Tu email" 
                  className="w-full bg-slate-800 border-none rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                />
                <button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-black py-2.5 rounded-xl transition-all">
                  SUSCRIBIRME
                </button>
              </form>
            </div>
            {['Administrador', 'Gestor (Editor)'].includes(profile?.roles?.nombre) && (
              <Link to="/admin" className="block text-center bg-amber-500/10 text-amber-500 border border-amber-500/20 py-3 rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-slate-900 transition-all">
                PANEL DE GESTIÓN
              </Link>
            )}
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 text-center">
          <p>© 2026 MÉRIDAACTIVA</p>
          <div className="flex gap-8">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> 
              Sistema Online
            </span>
            <span>v2.1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;