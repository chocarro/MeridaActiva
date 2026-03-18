import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import Logo from './Logo';

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close user dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Eventos', path: '/eventos', icon: 'bi-calendar-event' },
    { name: 'Patrimonio', path: '/lugares', icon: 'bi-bank2' },
    { name: 'Mapa', path: '/mapa', icon: 'bi-map' },
    { name: 'Contacto', path: '/contacto', icon: 'bi-envelope' },
  ];

  // ── Links exclusivos para usuarios registrados ──────────────────
const navLinksAuth = [
    { name: 'Rutas', path: '/rutas', icon: 'bi-stars' },
    { name: 'Chat IA', path: '/faq', icon: 'bi-robot' },
];

  const esAdmin = profile?.roles?.nombre === 'Administrador' || profile?.roles?.nombre === 'Gestor (Editor)';
  const userInitial = profile?.nombre?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || 'U';
  const userName = profile?.nombre?.split(' ')[0] || 'Usuario';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-4 shadow-2xl' : 'py-3'
          }`}
        style={{
          backgroundColor: isScrolled ? 'rgba(15,23,42,0.97)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">

            {/* LOGO */}
            <Logo isScrolled={isScrolled || mobileMenuOpen} />

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="relative text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-200 group"
                    style={{
                      color: isActive
                        ? '#FFBA08'
                        : isScrolled ? 'rgba(250,250,250,0.8)' : '#032B43',
                    }}
                  >
                    {link.name}
                    <span
                      className="absolute -bottom-1 left-0 h-0.5 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: '#FFBA08',
                        width: isActive ? '100%' : '0%',
                      }}
                    />
                  </Link>
                );
              })}

              {/* Links IA — solo para usuarios registrados */}
              {session && (
                <div className="flex items-center gap-3 border-l pl-6 ml-2"
                  style={{ borderColor: isScrolled ? 'rgba(255,255,255,0.12)' : 'rgba(3,43,67,0.12)' }}
                >
                  {navLinksAuth.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="relative flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200 px-3 py-1.5 rounded-xl"
                        style={{
                          color: isActive ? '#032B43' : '#FFBA08',
                          backgroundColor: isActive ? '#FFBA08' : 'rgba(255,186,8,0.12)',
                        }}
                      >
                        <i className={`bi ${link.icon} text-xs`} />
                        {link.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* USER AREA */}
            <div className="hidden md:flex items-center gap-4">
              {!session ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/registro"
                    className="text-[10px] font-black uppercase tracking-widest transition-colors hover:opacity-70"
                    style={{ color: isScrolled ? 'rgba(250,250,250,0.7)' : '#64748b' }}
                  >
                    Registrarse
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 shadow-lg"
                    style={{
                      backgroundColor: '#FFBA08',
                      color: '#032B43',
                      boxShadow: '0 4px 16px rgba(255,186,8,0.3)',
                    }}
                  >
                    Acceder
                  </Link>
                </div>
              ) : (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 group focus:outline-none"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center font-black italic text-sm shadow-lg transition-transform group-hover:scale-110"
                      style={{ backgroundColor: '#FFBA08', color: '#032B43' }}
                    >
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                      ) : userInitial}
                    </div>
                    {/* Name */}
                    <span
                      className="text-[10px] font-black uppercase tracking-widest hidden lg:block transition-colors"
                      style={{ color: isScrolled ? 'rgba(250,250,250,0.9)' : '#032B43' }}
                    >
                      {userName}
                    </span>
                    <i
                      className={`bi bi-chevron-${userMenuOpen ? 'up' : 'down'} text-xs transition-transform`}
                      style={{ color: isScrolled ? 'rgba(250,250,250,0.5)' : '#94a3b8' }}
                    />
                  </button>

                  {/* DROPDOWN */}
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-4 w-72 rounded-[2rem] shadow-2xl py-4 overflow-hidden"
                      style={{
                        backgroundColor: '#FAFAFA',
                        border: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 24px 80px rgba(3,43,67,0.18)',
                      }}
                    >
                      {/* User info header */}
                      <div className="px-6 pb-4 mb-2" style={{ borderBottom: '1px solid #f0f2f5' }}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-sm flex-shrink-0"
                            style={{ backgroundColor: '#FFBA08', color: '#032B43' }}
                          >
                            {profile?.avatar_url ? (
                              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                            ) : userInitial}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black uppercase italic truncate" style={{ color: '#032B43' }}>
                              {profile?.nombre || 'Usuario'}
                            </p>
                            <p className="text-[9px] font-medium truncate" style={{ color: '#94a3b8' }}>
                              {session.user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Links */}
                      {[
                        { to: '/perfil', icon: 'bi-person-circle', label: 'Mi Perfil', color: '#3F88C5' },
                        { to: '/calendario', icon: 'bi-calendar-week', label: 'Mi Agenda', color: '#3F88C5' },
                      ].map(item => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all hover:pl-8"
                          style={{ color: '#032B43' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0F2F5')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <i className={`bi ${item.icon} text-sm`} style={{ color: item.color }} />
                          {item.label}
                        </Link>
                      ))}

                      {esAdmin && (
                        <>
                          <div className="h-px my-2 mx-6" style={{ backgroundColor: '#f0f2f5' }} />
                          <Link
                            to="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all"
                            style={{ color: '#FFBA08' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,186,8,0.08)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <i className="bi bi-speedometer2 text-sm" />
                            Dashboard Admin
                          </Link>
                        </>
                      )}

                      <div className="h-px my-2 mx-6" style={{ backgroundColor: '#f0f2f5' }} />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all"
                        style={{ color: '#D00000' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(208,0,0,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <i className="bi bi-power text-sm" />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="md:hidden flex items-center gap-3">              
              {/* MOBILE TOGGLE (Menu) */}
              <button
                className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all"
                style={{
                  backgroundColor: mobileMenuOpen ? '#0F172A' : isScrolled ? 'rgba(255,255,255,0.1)' : 'rgba(3,43,67,0.08)',
                  color: mobileMenuOpen ? '#FFBA08' : isScrolled ? '#FAFAFA' : '#032B43',
                }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menú de navegación"
              >
                <i className={`bi bi-${mobileMenuOpen ? 'x-lg' : 'list'} text-xl`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-[90] flex flex-col pt-24"
          style={{ backgroundColor: '#0F172A' }}
        >
          {/* Nav links */}
          <div className="flex-1 overflow-y-auto px-6 space-y-1">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-5 py-5 rounded-2xl transition-all"
                  style={{
                    backgroundColor: isActive ? 'rgba(255,186,8,0.12)' : 'transparent',
                    color: isActive ? '#FFBA08' : 'rgba(250,250,250,0.8)',
                  }}
                >
                  <i className={`bi ${link.icon} text-xl flex-shrink-0`} />
                  <span className="text-2xl font-black uppercase italic tracking-tighter">{link.name}</span>
                </Link>
              );
            })}

            {/* Links IA solo para registrados */}
            {session && (
              <>
                <div className="h-px my-2 mx-2" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
                <p className="text-[9px] font-black text-brand-gold/50 uppercase tracking-widest px-5 py-2">
                  <i className="bi bi-stars mr-1" />Herramientas IA
                </p>
                {navLinksAuth.map(link => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all"
                      style={{
                        backgroundColor: isActive ? 'rgba(255,186,8,0.15)' : 'rgba(255,186,8,0.06)',
                        color: '#FFBA08',
                      }}
                    >
                      <i className={`bi ${link.icon} text-xl flex-shrink-0`} />
                      <span className="text-xl font-black uppercase italic tracking-tighter">{link.name}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </div>

          {/* Bottom user actions */}
          <div className="px-6 pb-10 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.5rem' }}>
            {session ? (
              <>
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl mb-4"
                  style={{ backgroundColor: 'rgba(255,186,8,0.08)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black italic text-sm"
                    style={{ backgroundColor: '#FFBA08', color: '#032B43' }}>
                    {userInitial}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase italic" style={{ color: '#FAFAFA' }}>{userName}</p>
                    <p className="text-[9px]" style={{ color: 'rgba(250,250,250,0.4)' }}>{session.user.email}</p>
                  </div>
                </div>
                <Link to="/perfil" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black uppercase italic transition-all"
                  style={{ color: '#FAFAFA', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <i className="bi bi-person-circle text-brand-gold" /> Mi Perfil
                </Link>
                <Link to="/calendario" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black uppercase italic"
                  style={{ color: '#FAFAFA', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <i className="bi bi-calendar-week text-brand-gold" /> Mi Agenda
                </Link>
                {esAdmin && (
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black uppercase italic"
                    style={{ color: '#FFBA08', backgroundColor: 'rgba(255,186,8,0.08)' }}>
                    <i className="bi bi-speedometer2" /> Dashboard
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black uppercase italic"
                  style={{ color: '#D00000', backgroundColor: 'rgba(208,0,0,0.06)' }}>
                  <i className="bi bi-power" /> Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-6 py-4 rounded-2xl text-sm font-black uppercase italic tracking-widest transition-all"
                  style={{ backgroundColor: '#FFBA08', color: '#032B43' }}>
                  Iniciar Sesión
                </Link>
                <Link to="/registro" onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-6 py-4 rounded-2xl text-sm font-black uppercase italic tracking-widest"
                  style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: '#FAFAFA' }}>
                  Crear Cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;