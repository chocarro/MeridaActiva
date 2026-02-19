import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';

const DashboardAdmin: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-amber-500"></div>
    </div>
  );
  
  if (!['Administrador', 'Gestor (Editor)'].includes(profile?.roles?.nombre)) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
            Panel de <span className="text-amber-500">Gestión</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Bienvenido, <span className="text-slate-900 font-bold">{profile.nombre}</span>. Nivel de acceso: {profile.roles.nombre}.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* GESTIÓN DE EVENTOS */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-2xl transition-all">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-amber-500 text-3xl mb-8 group-hover:scale-110 transition-transform">
              <i className="bi bi-calendar-event-fill"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">Eventos y Contenidos</h3>
            <p className="text-slate-500 mb-8 leading-relaxed">Añade nuevos eventos, edita los existentes o elimina contenido caducado para mantener la agenda al día.</p>
            <Link to="/admin/eventos" className="inline-block bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl">
              Gestionar Agenda
            </Link>
          </div>

          {/* GESTIÓN DE USUARIOS */}
          {profile.roles.nombre === 'Administrador' && (
            <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900 text-3xl mb-8">
                <i className="bi bi-shield-lock-fill"></i>
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Usuarios y Permisos</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">Modifica roles de acceso y gestiona los privilegios de los administradores y gestores del sistema.</p>
              <Link to="/admin/usuarios" className="inline-block bg-amber-500 text-slate-900 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl">
                Administrar Usuarios
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;