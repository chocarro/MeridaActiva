import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Importación de Páginas
import Home from './paginas/publicas/Home';
import Eventos from './paginas/publicas/Eventos';
import Lugares from './paginas/publicas/Lugares';
import LugaresDetalle from './paginas/publicas/LugaresDetalle';
import DetalleEvento from './paginas/publicas/DetalleEvento';
import Contacto from './paginas/publicas/Contacto';
import Login from './paginas/auth/Login';
import Registro from './paginas/auth/Registro';
import ResetPassword from './paginas/auth/ResetPassword';
import MiPerfil from './paginas/privadas/MiPerfil';
import GestionEventos from './paginas/admin/GestionEventos';
import GestionUsuarios from './paginas/admin/GestionUsuarios';
import MapaEventos from './componentes/MapaEventos';
import AvisoLegal from './legales/AvisoLegal';
import Privacidad from './legales/Privacidad';
import Cookies from './legales/Cookies';
import Terminos from './legales/Terminos';
import Calendario from './paginas/privadas/Calendario';
import Dashboard from './paginas/admin/Dashboard';
import FAQPage from './paginas/publicas/FAQ';
import RutaInteligente from './paginas/privadas/RutaInteligente';
import NotFound from './paginas/NotFound';

// COMPONENTE DE PROTECCIÓN DE RUTAS
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { session, profile, loading } = useAuth();

  if (loading) return <div className="p-5 text-center">Verificando acceso...</div>;
  if (!session) return <Navigate to="/login" />;

  if (allowedRoles && profile && !allowedRoles.includes(profile.roles?.nombre || '')) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/eventos" element={<Eventos />} />
      <Route path="/eventos/:id" element={<DetalleEvento />} />
      <Route path="/lugares" element={<Lugares />} />
      <Route path="/mapa" element={<MapaEventos />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/lugares/:id" element={<LugaresDetalle />} />
      <Route path="/contacto" element={<Contacto />} />
      <Route path="/faq" element={<FAQPage />} />

      {/* Rutas Legales */}
      <Route path="/aviso-legal" element={<AvisoLegal />} />
      <Route path="/privacidad" element={<Privacidad />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/terminos" element={<Terminos />} />

      <Route
        path="/calendario"
        element={
          <ProtectedRoute>
            <Calendario />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rutas"
        element={
          <ProtectedRoute>
            <RutaInteligente />
          </ProtectedRoute>
        }
      />

      {/* Rutas Privadas */}
      <Route path="/perfil" element={<ProtectedRoute><MiPerfil /></ProtectedRoute>} />


      {/* Rutas Admin */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Administrador', 'Gestor (Editor)']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
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

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;