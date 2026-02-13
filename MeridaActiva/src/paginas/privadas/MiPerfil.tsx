import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom'; // Quitamos useNavigate, usaremos window.location
import { supabase } from '../../supabaseClient';

const MiPerfil: React.FC = () => {
  const { profile, session, loading } = useAuth();
  const [seccionActiva, setSeccionActiva] = useState<'perfil' | 'favoritos' | 'alertas'>('perfil');

  // --- FUNCIÓN BLINDADA TAMBIÉN AQUÍ ---
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("Error al salir:", error);
    } finally {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="container py-5 mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Cargando perfil...</p>
      </div>
    );
  }

  // Si falla la carga del perfil, ofrecemos botón de salida de emergencia
  if (!profile) {
    return (
      <div className="container py-5 mt-5 text-center">
        <div className="alert alert-warning">
          No se pudo cargar la información. Intenta acceder de nuevo.
          <br/>
          <button onClick={handleLogout} className="btn btn-sm btn-danger mt-3">
            Forzar Cierre de Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 mt-5 text-start">
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center mb-4">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                 style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
              {profile.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h4 className="fw-bold mb-1">{profile.nombre || 'Usuario'}</h4>
            <p className="small text-muted mb-3">{session?.user.email}</p>
            <span className="badge bg-light text-dark border rounded-pill px-3 py-2 mb-3">
              Rol: {profile.roles?.nombre || 'Usuario'}
            </span>

            {(profile.roles?.nombre === 'Administrador' || profile.roles?.nombre === 'Gestor (Editor)') && (
              <Link to="/admin" className="btn btn-warning w-100 rounded-pill fw-bold mb-2">
                Panel de Administración
              </Link>
            )}
          </div>

          <div className="list-group shadow-sm rounded-4 overflow-hidden border-0">
            <button 
              onClick={() => setSeccionActiva('perfil')}
              className={`list-group-item list-group-item-action py-3 border-0 ${seccionActiva === 'perfil' ? 'active text-white' : ''}`}
            >
              <i className="bi bi-person me-3"></i> Mis Datos
            </button>
            <button 
              onClick={() => setSeccionActiva('favoritos')}
              className={`list-group-item list-group-item-action py-3 border-0 ${seccionActiva === 'favoritos' ? 'active text-white' : ''}`}
            >
              <i className="bi bi-heart me-3"></i> Mis Favoritos
            </button>
            <button 
              onClick={() => setSeccionActiva('alertas')}
              className={`list-group-item list-group-item-action py-3 border-0 ${seccionActiva === 'alertas' ? 'active text-white' : ''}`}
            >
              <i className="bi bi-bell me-3"></i> Mis Alertas
            </button>
            
            <button 
              className="list-group-item list-group-item-action py-3 text-danger border-0" 
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-3"></i> Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            {seccionActiva === 'perfil' && (
              <div>
                <h3 className="fw-bold mb-4">Información de la Cuenta</h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Nombre Completo</label>
                    <input type="text" className="form-control bg-light" value={profile.nombre || ''} readOnly />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Correo Electrónico</label>
                    <input type="text" className="form-control bg-light" value={session?.user.email || ''} readOnly />
                  </div>
                </div>
              </div>
            )}
            
            {seccionActiva === 'favoritos' && (
               <div className="text-center p-5">
                 <i className="bi bi-heart text-muted display-4 mb-3"></i>
                 <p className="text-muted">No tienes favoritos guardados todavía.</p>
               </div>
            )}

            {seccionActiva === 'alertas' && (
               <div className="p-3">
                 <p className="text-muted">Configuración de alertas próximamente...</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiPerfil;