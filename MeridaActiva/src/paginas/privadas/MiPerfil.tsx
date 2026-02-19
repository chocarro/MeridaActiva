import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const MiPerfil: React.FC = () => {
  const { profile, session, loading } = useAuth();
  const [seccionActiva, setSeccionActiva] = useState<'perfil' | 'favoritos' | 'alertas'>('perfil');

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); } catch (error) { console.warn(error); }
    finally { localStorage.clear(); window.location.href = '/'; }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-amber-500"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar de Perfil */}
          <div className="lg:col-span-4 space-y-6 text-start">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 text-center">
              <div className="w-24 h-24 bg-slate-900 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-4xl font-black shadow-xl">
                {profile?.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-1 tracking-tighter">{profile?.nombre || 'Explorador'}</h4>
              <p className="text-slate-400 text-sm font-medium mb-6">{session?.user.email}</p>
              <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-slate-200">
                Rango: {profile?.roles?.nombre || 'Usuario'}
              </span>
              
              {(profile?.roles?.nombre === 'Administrador' || profile?.roles?.nombre === 'Gestor (Editor)') && (
                <Link to="/admin" className="block mt-8 bg-amber-500 text-slate-900 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg">
                  Panel de Gestión
                </Link>
              )}
            </div>

            <nav className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
              {[
                { id: 'perfil', label: 'Mis Datos', icon: 'bi-person' },
                { id: 'favoritos', label: 'Favoritos', icon: 'bi-heart' },
                { id: 'alertas', label: 'Alertas', icon: 'bi-bell' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSeccionActiva(item.id as any)}
                  className={`w-full flex items-center gap-4 px-8 py-5 text-sm font-bold transition-all border-b border-slate-50 last:border-0 ${seccionActiva === item.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <i className={`bi ${item.icon} text-lg`}></i> {item.label}
                </button>
              ))}
              <button onClick={handleLogout} className="w-full flex items-center gap-4 px-8 py-5 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all">
                <i className="bi bi-box-arrow-right text-lg"></i> Cerrar Sesión
              </button>
            </nav>
          </div>

          {/* Contenido Principal */}
          <div className="lg:col-span-8 text-start">
            <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-sm border border-slate-100 h-full">
              {seccionActiva === 'perfil' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Detalles de Cuenta</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Nombre Completo</label>
                      <div className="bg-slate-50 px-6 py-4 rounded-xl font-bold text-slate-700 border border-slate-100">{profile?.nombre}</div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Email Registrado</label>
                      <div className="bg-slate-50 px-6 py-4 rounded-xl font-bold text-slate-700 border border-slate-100">{session?.user.email}</div>
                    </div>
                  </div>
                </div>
              )}
              {seccionActiva === 'favoritos' && (
                <div className="text-center py-20 animate-fade-in">
                  <div className="text-5xl mb-6"></div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Aún no hay favoritos</h4>
                  <p className="text-slate-400">Guarda eventos o monumentos para verlos aquí.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default MiPerfil;