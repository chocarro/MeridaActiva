import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const DashboardAdmin: React.FC = () => {
  const { profile, loading } = useAuth();
  const [stats, setStats] = useState({ eventos: 0, usuarios: 0, reseñas: 0, alertas: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [{ count: ev }, { count: us }, { count: re }] = await Promise.all([
          supabase.from('eventos').select('id', { count: 'exact', head: true }),
          supabase.from('usuarios').select('id', { count: 'exact', head: true }),
          supabase.from('comentarios').select('id', { count: 'exact', head: true }),
        ]);
        setStats({ eventos: ev || 0, usuarios: us || 0, reseñas: re || 0, alertas: 0 });
      } catch (e) { console.error(e); }
      finally { setLoadingStats(false); }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-blue"></div>
    </div>
  );

  if (!['Administrador', 'Gestor (Editor)'].includes(profile?.roles?.nombre)) {
    return <Navigate to="/" />;
  }

  const statCards = [
    { label: 'Eventos activos', value: loadingStats ? '…' : stats.eventos, icon: 'bi-lightning-charge', color: 'text-brand-blue' },
    { label: 'Usuarios', value: loadingStats ? '…' : stats.usuarios, icon: 'bi-people-fill', color: 'text-brand-green' },
    { label: 'Reseñas totales', value: loadingStats ? '…' : stats.reseñas, icon: 'bi-chat-left-quote', color: 'text-brand-gold' },
    { label: 'Alertas sistema', value: '00', icon: 'bi-check-circle', color: 'text-slate-300' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Cabecera */}
        <header className="mb-16 relative">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-blue/10 rounded-full blur-3xl"></div>
          <h1 className="text-6xl md:text-7xl font-black text-brand-dark tracking-tighter uppercase italic leading-none relative z-10">
            DASH<span className="text-brand-blue">BOARD</span>
          </h1>
          <div className="flex items-center gap-3 mt-4 ml-1">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
              <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></span>
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">
                ADMIN: <span className="text-brand-dark">{profile.nombre}</span>
              </p>
            </div>
            <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-brand-bg border border-slate-100 rounded-full">
              {profile.roles.nombre}
            </span>
          </div>
        </header>

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Tarjeta 1: Gestión de Eventos */}
          <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-20 h-20 bg-brand-bg rounded-[2rem] flex items-center justify-center text-brand-blue text-4xl mb-12 group-hover:bg-brand-blue group-hover:text-white transition-all duration-500 shadow-inner">
                <i className="bi bi-calendar-check-fill"></i>
              </div>
              <h3 className="text-4xl font-black text-brand-dark uppercase italic tracking-tighter mb-4">Agenda Cultural</h3>
              <p className="text-slate-500 font-medium mb-12 leading-relaxed max-w-md">
                Control centralizado de eventos. Publica, supervisa y modera toda la cartelera de Augusta Emerita.
              </p>
              <div className="mt-auto flex gap-4 flex-wrap">
                <Link to="/admin/eventos" className="inline-flex items-center gap-3 bg-brand-dark text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-brand-blue transition-all shadow-xl hover:-translate-y-1 active:scale-95">
                  Gestionar Eventos <i className="bi bi-arrow-right text-lg"></i>
                </Link>
              </div>
            </div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-brand-blue/5 rounded-full blur-[100px] group-hover:bg-brand-blue/10 transition-all"></div>
          </div>

          {/* Tarjeta 2: Usuarios (solo admin) */}
          {profile.roles.nombre === 'Administrador' && (
            <div className="bg-brand-dark p-12 rounded-[4rem] shadow-2xl border border-white/5 relative overflow-hidden group flex flex-col justify-between">
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-brand-gold text-4xl mb-12 group-hover:bg-brand-gold group-hover:text-brand-dark transition-all duration-500">
                  <i className="bi bi-person-lock"></i>
                </div>
                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">Control<br />Usuarios</h3>
                <p className="text-white/30 font-medium mb-12 leading-relaxed text-sm">
                  Gestión de privilegios, roles y accesos críticos del sistema.
                </p>
              </div>
              <Link to="/admin/usuarios" className="relative z-10 w-full text-center bg-brand-gold text-brand-dark px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl active:scale-95">
                Acceder a Usuarios
              </Link>
              <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 right-10 w-32 h-32 border border-white rounded-full"></div>
              </div>
            </div>
          )}
        </div>

        {/* Stats reales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:border-brand-blue/30 transition-all shadow-sm">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-3xl font-black italic leading-none ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`text-2xl ${stat.color} opacity-20 group-hover:opacity-100 transition-opacity`}>
                <i className={`bi ${stat.icon}`}></i>
              </div>
            </div>
          ))}
        </div>

        {/* Pie */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-2">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
            Sistema de administración v2.0 • Mérida Activa
          </p>
          <Link to="/" className="text-[10px] font-black text-brand-dark hover:text-brand-blue transition-colors uppercase tracking-widest flex items-center gap-2">
            <i className="bi bi-house"></i> Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;