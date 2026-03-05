import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const Navbar: React.FC = () => {
  const { session, profile } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Eventos', path: '/eventos' },
    { name: 'Patrimonio', path: '/lugares' },
    { name: 'Mapa', path: '/mapa' },
  ];

  // Colores adaptativos según el scroll
  const navBg = isScrolled ? 'bg-brand-dark/95 backdrop-blur-md py-4 shadow-2xl' : 'bg-transparent py-8';
  const textColor = isScrolled ? 'text-white' : 'text-brand-dark';
  const logoColor = isScrolled ? 'text-white' : 'text-brand-dark';

  // Verificación de permisos para el Dashboard
  const esAdmin = profile?.roles?.nombre === 'Administrador' || profile?.roles?.nombre === 'Gestor (Editor)';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-[72px]">

        {/* LOGO */}
        <Link to="/" className={`text-2xl font-[900] uppercase italic tracking-tighter transition-colors ${logoColor}`}>
          Mérida<span className="text-brand-blue">Activa</span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-12">
          <div className="flex gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[10px] font-black uppercase tracking-[0.2em] hover:text-brand-blue transition-colors ${location.pathname === link.path ? 'text-brand-blue' : textColor
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* ÁREA DE USUARIO */}
          <div className="flex items-center gap-4 border-l border-white/10 pl-12">
            {!session ? (
              <Link to="/login" className="btn-primary py-3 px-8 text-[10px]">
                Acceder
              </Link>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 group focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-2xl bg-brand-blue flex items-center justify-center text-white font-black italic shadow-lg shadow-brand-blue/20 group-hover:scale-110 transition-transform">
                    {profile?.nombre?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest hidden lg:block ${textColor}`}>
                    {profile?.nombre?.split(' ')[0]}
                  </span>
                </button>

                {/* DROPDOWN MENU */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-white rounded-[2.5rem] shadow-2xl py-6 border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="px-8 pb-4 border-b border-slate-50 mb-2">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Conectado como</p>
                      <p className="text-xs font-black text-brand-dark uppercase italic truncate">{profile?.nombre}</p>
                    </div>

                    <Link to="/perfil" onClick={() => setUserMenuOpen(false)} className="block px-8 py-3 text-[10px] font-black text-brand-dark uppercase tracking-widest hover:bg-brand-bg transition-colors">
                      <i className="bi bi-person-circle mr-3 text-brand-blue"></i> Mi Perfil
                    </Link>

                    <Link to="/calendario" onClick={() => setUserMenuOpen(false)} className="block px-8 py-3 text-[10px] font-black text-brand-dark uppercase tracking-widest hover:bg-brand-bg transition-colors">
                      <i className="bi bi-calendar-week mr-3 text-brand-blue"></i> Mi Agenda
                    </Link>

                    {/* SECCIÓN DASHBOARD (SOLO ADMIN) */}
                    {esAdmin && (
                      <>
                        <div className="h-[1px] bg-slate-100 my-2 mx-6"></div>
                        <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="block px-8 py-3 text-[10px] font-black text-brand-blue uppercase tracking-widest hover:bg-brand-blue/5 transition-colors">
                          <i className="bi bi-speedometer2 mr-3"></i> Dashboard
                        </Link>
                      </>
                    )}

                    <div className="h-[1px] bg-slate-100 my-2 mx-6"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-8 py-3 text-[10px] font-black text-brand-red uppercase tracking-widest hover:bg-brand-red/5 transition-colors"
                    >
                      <i className="bi bi-power mr-3"></i> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MOBILE TOGGLE */}
        <button className={`md:hidden transition-colors ${textColor}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <i className={`bi bi-${mobileMenuOpen ? 'x-lg' : 'list'} text-3xl`}></i>
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[72px] bg-brand-dark z-[90] p-10 animate-in slide-in-from-right duration-300">
          <div className="flex flex-col gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-4xl font-[900] text-white uppercase italic tracking-tighter"
              >
                {link.name}
              </Link>
            ))}

            <div className="h-[1px] bg-white/10 my-4"></div>

            {session ? (
              <>
                <Link to="/perfil" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black text-brand-blue uppercase italic">Mi Perfil</Link>
                <Link to="/calendario" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black text-brand-blue uppercase italic">Mi Agenda</Link>
                {esAdmin && (
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black text-brand-gold uppercase italic">Dashboard Admin</Link>
                )}
                <button onClick={handleLogout} className="text-left text-xl font-black text-brand-red uppercase italic">Cerrar Sesión</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-primary py-5 text-center">Acceder</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;