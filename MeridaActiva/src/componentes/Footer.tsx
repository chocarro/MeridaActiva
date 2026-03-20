import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import Logo from './Logo';

const Footer: React.FC = () => {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'ok' | 'exists' | 'error'>('idle');

  const handleSuscribir = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setSubStatus('error');
      return;
    }

    setSubStatus('loading');

    try {
      // Intentar insertar en la tabla newsletter_suscriptores
      const { error } = await supabase
        .from('newsletter_suscriptores')
        .insert({ email: trimmed });

      if (error) {
        // Código 23505 = unique_violation (ya suscrito)
        if (error.code === '23505') {
          setSubStatus('exists');
        } else {
          console.error('[Newsletter]', error);
          setSubStatus('error');
        }
      } else {
        setSubStatus('ok');
        setEmail('');
      }
    } catch {
      setSubStatus('error');
    }

    // Reset después de 5 segundos
    setTimeout(() => setSubStatus('idle'), 5000);
  };

  return (
    <footer className="bg-brand-dark text-white border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

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
            </ul>
          </div>

          {/* Columna 4 — Newsletter */}
          <div className="space-y-6">
            <h4 className="text-brand-gold text-[10px] font-black uppercase tracking-[0.3em]">Newsletter</h4>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              Recibe la agenda cultural de Mérida cada semana en tu correo.
            </p>

            <form className="space-y-3" onSubmit={handleSuscribir}>
              <input
                type="email"
                placeholder="Tu email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs focus:ring-1 focus:ring-brand-gold outline-none transition-all text-white placeholder:text-white/30"
                disabled={subStatus === 'ok' || subStatus === 'loading'}
              />
              <button
                type="submit"
                disabled={subStatus === 'ok' || subStatus === 'loading'}
                className="w-full btn-primary !py-4 !text-[9px] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {subStatus === 'loading' && (
                  <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                )}
                {subStatus === 'ok' ? (
                  <><i className="bi bi-check2-circle" /> ¡Suscrito!</>
                ) : subStatus === 'loading' ? 'Guardando…' : (
                  <><i className="bi bi-envelope-fill" /> Suscribirme</>
                )}
              </button>

              {subStatus === 'error' && (
                <p className="text-brand-red text-[9px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-1">
                  <i className="bi bi-exclamation-circle" /> Introduce un email válido
                </p>
              )}
              {subStatus === 'exists' && (
                <p className="text-brand-gold text-[9px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-1">
                  <i className="bi bi-info-circle" /> Este email ya está suscrito
                </p>
              )}
              {subStatus === 'ok' && (
                <p className="text-brand-green text-[9px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-1">
                  <i className="bi bi-check2" /> ¡Te avisaremos cada semana!
                </p>
              )}
            </form>

            {['Administrador', 'Gestor (Editor)'].includes(profile?.roles?.nombre) && (
              <Link to="/admin" className="block text-center bg-brand-blue/20 text-brand-blue border border-brand-blue/30 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all">
                <i className="bi bi-speedometer2 mr-2" />Panel Admin
              </Link>
            )}
          </div>
        </div>

        {/* Bottom bar — limpio, sin duplicados */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
            © 2026 MéridaActiva · Hecho en Extremadura
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