import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const Registro: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre: nombre } }
    });

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
      navigate('/login'); 
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 pt-24 pb-12">
      <div className="max-w-md w-full">
        {/* Card con estilo Bento Light */}
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 md:p-12 border border-slate-100 relative overflow-hidden">
          
          <div className="text-center mb-10">
            <h2 className="text-4xl font-[900] text-brand-dark mb-3 uppercase italic tracking-tighter">
              Únete a la <span className="text-brand-green">Comunidad</span>
            </h2>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Crea tu perfil en MéridaActiva</p>
          </div>

          <form onSubmit={handleRegistro} className="space-y-5">
            <div>
              <label className="block text-[9px] font-[900] uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2">Nombre Completo</label>
              <input 
                type="text" 
                className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-blue transition-all outline-none font-bold text-brand-dark" 
                placeholder="Ej. Juan Pérez"
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                required 
              />
            </div>

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
              className="w-full btn-primary py-5 text-xs mt-4"
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Comenzar ahora'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-[10px] font-[900] uppercase tracking-widest">
              ¿Ya tienes cuenta? <Link to="/login" className="text-brand-blue hover:text-brand-dark transition-colors">Inicia sesión</Link>
            </p>
          </div>

          {/* Decoración sutil */}
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-brand-green/5 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-brand-blue/10 rounded-full blur-2xl"></div>
        </div>
        
        <p className="text-center mt-8 text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">
          MéridaActiva © 2024 - Patrimonio vivo
        </p>
      </div>
    </div>
  );
};

export default Registro;