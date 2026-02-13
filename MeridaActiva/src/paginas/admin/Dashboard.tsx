import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';

const DashboardAdmin: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) return <div className="text-center mt-5">Cargando permisos...</div>;
  
  // Seguridad: Si no es Gestor o Admin, redirigimos a Home
  if (!['Administrador', 'Gestor (Editor)'].includes(profile?.roles?.nombre)) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container py-5 mt-5">
      <div className="row mb-5">
        <div className="col-12">
          <h1 className="fw-bold">Panel de Gestión Administrativa</h1>
          <p className="text-muted">Bienvenido, {profile.nombre}. Tienes acceso de <strong>{profile.roles.nombre}</strong>.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* SECCIÓN EVENTOS: Disponible para Gestor y Admin */}
        <div className="col-md-6">
          <div className="card h-100 border-0 shadow-sm rounded-4 p-4 overflow-hidden position-relative border-start border-primary border-5">
            <div className="mb-3 text-primary">
              <i className="bi bi-calendar-event-fill display-5"></i>
            </div>
            <h3 className="fw-bold h4">Gestión de Eventos</h3>
            <p className="text-muted small mb-4">Añade nuevos eventos, edita los existentes o elimina contenido caducado. (RF5)</p>
            <Link to="/admin/eventos" className="btn btn-primary rounded-pill px-4 mt-auto w-fit">
              Gestionar Contenidos
            </Link>
          </div>
        </div>

        {/* SECCIÓN USUARIOS: Solo disponible para Admin */}
        {profile.roles.nombre === 'Administrador' && (
          <div className="col-md-6">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-dark text-white overflow-hidden position-relative border-start border-warning border-5">
              <div className="mb-3 text-warning">
                <i className="bi bi-shield-lock-fill display-5"></i>
              </div>
              <h3 className="fw-bold h4">Usuarios y Permisos</h3>
              <p className="text-white-50 small mb-4">Modifica roles de usuarios registrados y gestiona permisos de acceso al sistema.</p>
              <Link to="/admin/usuarios" className="btn btn-warning rounded-pill px-4 mt-auto w-fit fw-bold">
                Administrar Usuarios
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Resumen de actividad rápido */}
      <div className="mt-5 row g-3">
        <div className="col-md-4">
          <div className="bg-light p-4 rounded-4 border d-flex align-items-center gap-3">
            <i className="bi bi-people fs-2 text-primary"></i>
            <div>
              <h5 className="mb-0 fw-bold">Activos</h5>
              <small className="text-muted">Usuarios en la plataforma</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;