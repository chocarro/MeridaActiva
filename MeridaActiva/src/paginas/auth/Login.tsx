import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg('Credenciales incorrectas o usuario no confirmado.');
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Usamos la clase bento-card-light definida en el CSS */}
        <div className="bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100 relative overflow-hidden">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-[900] text-brand-dark mb-3 uppercase italic tracking-tighter">
              ¡Hola de <span className="text-brand-gold">nuevo</span>!
            </h2>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Accede a tu cuenta MéridaActiva</p>
          </div>

          {errorMsg && (
            <div className="bg-brand-red/10 text-brand-red p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center mb-8 border border-brand-red/20">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[9px] font-[900] uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2">Email</label>
              <input 
                type="email" 
                className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-blue transition-all outline-none font-bold text-brand-dark" 
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div>
              <label className="block text-[9px] font-[900] uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2">Contraseña</label>
              <input 
                type="password" 
                className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-blue transition-all outline-none font-bold text-brand-dark" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <button 
              type="submit" 
              className="w-full btn-dark py-5 text-xs"
              disabled={loading}
            >
              {loading ? 'Validando...' : 'Entrar ahora'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-[10px] font-[900] uppercase tracking-widest">
              ¿No tienes cuenta? <Link to="/registro" className="text-brand-blue hover:text-brand-gold transition-colors">Crea una aquí</Link>
            </p>
          </div>
          
          {/* Decoración sutil */}
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-brand-gold/10 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;