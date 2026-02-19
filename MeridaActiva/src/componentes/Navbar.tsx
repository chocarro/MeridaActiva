import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { supabase } from '../supabaseClient';

const Navbar: React.FC = () => {
  const { session, profile } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Cambiar el estilo al hacer scroll para que sea más profesional
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error("Error al salir:", error);
    }
  };

  const navLinks = [
    { name: 'Eventos', path: '/eventos' },
    { name: 'Lugares', path: '/lugares' },
    { name: 'Mapas', path: '/mapa' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-slate-900/90 backdrop-blur-xl py-3 shadow-lg' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo con tipografía profesional */}
        <Link to="/" className="text-2xl font-black text-white tracking-tighter group">
          Mérida<span className="text-amber-500 group-hover:text-amber-400 transition-colors">Activa</span>
        </Link>

        {/* Links Desktop - Microinteracciones con Tailwind */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`text-sm font-bold uppercase tracking-widest transition-all hover:text-amber-500 ${
                location.pathname === link.path ? 'text-amber-500' : 'text-slate-200'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          {/* Badge de Administración dinámico */}
          {['Administrador', 'Gestor (Editor)'].includes(profile?.roles?.nombre) && (
            <Link 
              to="/admin" 
              className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter hover:bg-amber-500 hover:text-slate-900 transition-all"
            >
              Panel Gestión
            </Link>
          )}
        </div>

        {/* Sección de Usuario / Auth */}
        <div className="flex items-center gap-6">
          {!session ? (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-white text-sm font-bold hover:text-amber-500 transition-colors">
                Log in
              </Link>
              <Link 
                to="/registro" 
                className="bg-white text-slate-900 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl shadow-white/5"
              >
                Únete
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <Link to="/perfil" className="group flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Hola,</p>
                  <p className="text-sm font-bold text-white leading-none">{profile?.nombre || 'Usuario'}</p>
                </div>
                <div className="w-10 h-10 bg-slate-800 border border-white/10 rounded-xl flex items-center justify-center text-white font-black group-hover:border-amber-500 transition-all">
                  {profile?.nombre?.charAt(0).toUpperCase()}
                </div>
              </Link>
              <button 
                onClick={handleLogout} 
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                title="Cerrar sesión"
              >
                <i className="bi bi-power text-xl"></i>
              </button>
            </div>
          )}

          {/* Botón Menú Móvil */}
          <button 
            className="md:hidden text-white text-2xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={`bi bi-${mobileMenuOpen ? 'x' : 'list'}`}></i>
          </button>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-white/5 px-6 py-8 space-y-6 animate-fade-in-down">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-2xl font-black text-white"
            >
              {link.name}
            </Link>
          ))}
          {!session && (
            <Link 
              to="/registro" 
              className="block w-full bg-amber-500 text-center py-4 rounded-2xl font-black text-slate-900"
            >
              REGISTRARSE
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;