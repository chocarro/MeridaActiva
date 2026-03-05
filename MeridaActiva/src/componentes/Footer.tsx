import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer: React.FC = () => {
  const { profile } = useAuth();
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  const handleSuscribir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setSubStatus('error');
      return;
    }
    // Simulación — aquí podrías guardar en Supabase o algún servicio
    setSubStatus('ok');
    setEmail('');
    setTimeout(() => setSubStatus('idle'), 4000);
  };

  return (
    <footer className="bg-brand-dark text-white border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

          <div className="space-y-8">
            <Link to="/" className="text-3xl font-[900] text-white italic uppercase tracking-tighter">
              Mérida<span className="text-brand-gold">Activa</span>
            </Link>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Explora el legado de Augusta Emerita con la plataforma inteligente de gestión cultural de Extremadura.
            </p>
            <div className="flex gap-4">
              {['facebook', 'instagram', 'twitter-x'].map((social) => (
                <a key={social} href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-brand-gold hover:text-brand-dark transition-all text-xl">
                  <i className={`bi bi-${social}`}></i>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-brand-gold text-[10px] font-black uppercase tracking-[0.3em] mb-10">Explorar</h4>
            <ul className="space-y-4">
              {[
                { label: 'Eventos', to: '/eventos' },
                { label: 'Patrimonio', to: '/lugares' },
                { label: 'Mapa Interactivo', to: '/mapa' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-slate-400 hover:text-white transition-colors font-bold text-sm">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-brand-gold text-[10px] font-black uppercase tracking-[0.3em] mb-10">Ayuda</h4>
            <ul className="space-y-4">
              {['Contacto', 'Privacidad', 'Términos de Uso'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-slate-400 hover:text-white transition-colors font-bold text-sm">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-brand-gold text-[10px] font-black uppercase tracking-[0.3em]">Newsletter</h4>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">Recibe la agenda cultural de Mérida cada semana en tu correo.</p>

            <form className="space-y-3" onSubmit={handleSuscribir}>
              <input
                type="email"
                placeholder="Tu email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs focus:ring-1 focus:ring-brand-gold outline-none transition-all text-white placeholder:text-white/30"
                disabled={subStatus === 'ok'}
              />
              <button
                type="submit"
                disabled={subStatus === 'ok'}
                className="w-full btn-primary !py-4 !text-[9px] disabled:opacity-60"
              >
                {subStatus === 'ok' ? '¡Suscrito! ✓' : 'Suscribirme'}
              </button>
              {subStatus === 'error' && (
                <p className="text-brand-red text-[9px] font-black uppercase tracking-widest text-center">Introduce un email válido</p>
              )}
              {subStatus === 'ok' && (
                <p className="text-brand-green text-[9px] font-black uppercase tracking-widest text-center">¡Te avisaremos cada semana!</p>
              )}
            </form>

            {['Administrador', 'Gestor (Editor)'].includes(profile?.roles?.nombre) && (
              <Link to="/admin" className="block text-center bg-brand-blue/20 text-brand-blue border border-brand-blue/30 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all">
                Panel Admin
              </Link>
            )}
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
            © 2026 MÉRIDAACTIVA. HECHO EN EXTREMADURA.
          </p>
          <div className="flex gap-8">
            <span className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
              <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></span> Sistema Online
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;