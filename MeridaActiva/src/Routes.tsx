import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { getNombreRolUsuario } from './utils/perfilUsuario';

// ── Importaciones estáticas (páginas ligeras / críticas) ──────────
import Home from './paginas/publicas/Home';
import Eventos from './paginas/publicas/Eventos';
import Lugares from './paginas/publicas/Lugares';
import LugaresDetalle from './paginas/publicas/LugaresDetalle';
import DetalleEvento from './paginas/publicas/DetalleEvento';
import Contacto from './paginas/publicas/Contacto';
import Login from './paginas/auth/Login';
import Registro from './paginas/auth/Registro';
import ResetPassword from './paginas/auth/ResetPassword';
import RecuperarSesion from './paginas/auth/RecuperarSesion';
import AvisoLegal from './legales/AvisoLegal';
import Privacidad from './legales/Privacidad';
import Cookies from './legales/Cookies';
import Terminos from './legales/Terminos';
import NotFound from './paginas/NotFound';
import RutaCompartida from './paginas/publicas/RutaCompartida';

// ── Importaciones lazy (páginas pesadas — se cargan bajo demanda) ─
// Esto reduce el bundle inicial mejorando el tiempo de First Load.
const MapaEventos     = lazy(() => import('./componentes/MapaEventos'));
const ChatPage        = lazy(() => import('./paginas/publicas/Chat'));
const MiPerfil        = lazy(() => import('./paginas/privadas/MiPerfil'));
const Calendario      = lazy(() => import('./paginas/privadas/Calendario'));
const RutaInteligente = lazy(() => import('./paginas/privadas/RutaInteligente'));
const Favoritos       = lazy(() => import('./paginas/privadas/Favoritos'));
const Dashboard       = lazy(() => import('./paginas/admin/Dashboard'));
const GestionEventos  = lazy(() => import('./paginas/admin/GestionEventos'));
const GestionUsuarios = lazy(() => import('./paginas/admin/GestionUsuarios'));
const ModeracionResenas = lazy(() => import('./paginas/admin/ModeracionResenas'));

// ── Spinner de carga (usado en Suspense fallback) ─────────────────
const LoadingSpinner = () => (
  <div className="min-h-screen bg-brand-bg flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Cargando…</p>
    </div>
  </div>
);

// ── Componente de protección de rutas ─────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { session, profile, loading } = useAuth();
  const [cargaLenta, setCargaLenta] = useState(false);

  useEffect(() => {
    if (!loading) {
      setCargaLenta(false);
      return;
    }
    const t = setTimeout(() => setCargaLenta(true), 12_000);
    return () => clearTimeout(t);
  }, [loading]);

  if (loading) {
    return (
      <div className="p-6 text-center max-w-lg mx-auto py-20">
        <p className="text-slate-600 font-medium">Verificando acceso…</p>
        {cargaLenta && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-sm text-slate-600">
            <p className="mb-3">
              Si esto no termina, la sesión del navegador puede estar corrupta. No hace falta abrir las herramientas de desarrollador.
            </p>
            <Link
              to="/recuperar-sesion"
              className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest text-brand-blue hover:text-brand-dark"
            >
              <i className="bi bi-arrow-counterclockwise" />
              Recuperar sesión
            </Link>
          </div>
        )}
      </div>
    );
  }
  if (!session) return <Navigate to="/login" />;

  const nombreRol = getNombreRolUsuario(profile);
  if (allowedRoles) {
    if (!nombreRol || !allowedRoles.includes(nombreRol)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

// ── Definición de rutas ───────────────────────────────────────────
const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Públicas */}
        <Route path="/"          element={<Home />} />
        <Route path="/eventos"   element={<Eventos />} />
        <Route path="/eventos/:id" element={<DetalleEvento />} />
        <Route path="/lugares"   element={<Lugares />} />
        <Route path="/lugares/:id" element={<LugaresDetalle />} />
        <Route path="/mapa"      element={<MapaEventos />} />
        <Route path="/contacto"  element={<Contacto />} />
        <Route path="/ruta/:id"  element={<RutaCompartida />} />

        {/* Auth */}
        <Route path="/login"             element={<Login />} />
        <Route path="/registro"          element={<Registro />} />
        <Route path="/reset-password"    element={<ResetPassword />} />
        <Route path="/recuperar-sesion"  element={<RecuperarSesion />} />

        {/* Legales */}
        <Route path="/aviso-legal" element={<AvisoLegal />} />
        <Route path="/privacidad"  element={<Privacidad />} />
        <Route path="/cookies"     element={<Cookies />} />
        <Route path="/terminos"    element={<Terminos />} />

        {/* Privadas (requieren login) */}
        <Route path="/faq"       element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/perfil"    element={<ProtectedRoute><MiPerfil /></ProtectedRoute>} />
        <Route path="/favoritos" element={<ProtectedRoute><Favoritos /></ProtectedRoute>} />
        <Route path="/calendario" element={
          <ProtectedRoute>
            <Calendario />
          </ProtectedRoute>
        } />
        <Route path="/rutas" element={
          <ProtectedRoute>
            <RutaInteligente />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['Administrador', 'Gestor (Editor)']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/eventos" element={
          <ProtectedRoute allowedRoles={['Administrador', 'Gestor (Editor)']}>
            <GestionEventos />
          </ProtectedRoute>
        } />
        <Route path="/admin/usuarios" element={
          <ProtectedRoute allowedRoles={['Administrador']}>
            <GestionUsuarios />
          </ProtectedRoute>
        } />
        <Route path="/admin/resenas" element={
          <ProtectedRoute allowedRoles={['Administrador', 'Gestor (Editor)']}>
            <ModeracionResenas />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;