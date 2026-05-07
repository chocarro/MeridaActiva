import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { getNombreRolUsuario } from '../utils/perfilUsuario';

const Footer: React.FC = () => {
  const { session, profile } = useAuth();
  const navigate = useNavigate();


  return (
    <footer className="bg-brand-dark text-white border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mb-20">

          {/* Columna 1 — Marca */}
          <div className="space-y-8">
            <Logo isScrolled={true} className="!text-3xl" />
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Explora el legado de Augusta Emerita con la plataforma inteligente de gestión cultural de Extremadura.
            </p>
            <div className="flex gap-4">
              {['facebook', 'instagram', 'twitter-x'].map((social) => (
                <a key={social} href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-brand-gold hover:text-brand-dark transition-all text-xl">
                  <i className={`bi bi-${social}`} />
                </a>
              ))}
            </div>
          </div>

          {/* Columna 2 — Explorar */}
          <div>
            <h4 className="text-brand-gold text-[10px] font-black uppercase tracking-[0.3em] mb-10">Explorar</h4>
            <ul className="space-y-4">
              <li><Link to="/eventos" className="text-slate-400 hover:text-white transition-colors font-bold text-sm">Eventos</Link></li>
              <li><Link to="/lugares" className="text-slate-400 hover:text-white transition-colors font-bold text-sm">Patrimonio</Link></li>
              <li>
                <button
                  onClick={() => navigate(session ? '/rutas' : '/login')}
                  className="text-slate-400 hover:text-white transition-colors font-bold text-sm text-left"
                >
                  Rutas con IA
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate(session ? '/faq' : '/login')}
                  className="text-slate-400 hover:text-white transition-colors font-bold text-sm text-left"
                >
                  Chat IA (Asistente)
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 3 — Legal */}
          <div>
            <h4 className="text-brand-gold text-[10px] font-black uppercase tracking-[0.3em] mb-10">Legal</h4>
            <ul className="space-y-4">
              <li><Link to="/privacidad" className="text-slate-400 hover:text-white transition-colors font-bold text-sm">Política de Privacidad</Link></li>
              <li><Link to="/terminos" className="text-slate-400 hover:text-white transition-colors font-bold text-sm">Términos de Uso</Link></li>
              <li><Link to="/cookies" className="text-slate-400 hover:text-white transition-colors font-bold text-sm">Política de Cookies</Link></li>
              <li><Link to="/aviso-legal" className="text-slate-400 hover:text-white transition-colors font-bold text-sm">Aviso Legal</Link></li>
              <li><Link to="/contacto" className="text-slate-400 hover:text-white transition-colors font-bold text-sm">Contacto</Link></li>
              <li>
                <Link to="/recuperar-sesion" className="text-slate-400 hover:text-white transition-colors font-bold text-sm">
                  Problemas con la sesión
                </Link>
              </li>
            </ul>
            {['Administrador', 'Gestor (Editor)'].includes(getNombreRolUsuario(profile) || '') && (
              <Link to="/dashboard" className="mt-6 block text-center bg-brand-blue/20 text-brand-blue border border-brand-blue/30 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all">
                <i className="bi bi-speedometer2 mr-2" />Panel Admin
              </Link>
            )}
          </div>

        </div>

        {/* Bottom bar — limpio, sin duplicados */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
            © 2026 MéridaActiva
          </p>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <i className="bi bi-award-fill text-brand-gold" />
            Mérida, Patrimonio UNESCO 1993
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;