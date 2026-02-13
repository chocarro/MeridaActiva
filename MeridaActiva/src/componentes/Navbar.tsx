import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { supabase } from '../supabaseClient';

const Navbar: React.FC = () => {
  const { session, profile } = useAuth();

  const handleLogout = async () => {
    // 1. Borramos token local PRIMERO (para que la web sepa que has salido)
    localStorage.clear();
    
    // 2. Intentamos avisar a Supabase (si falla, nos da igual)
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.log("Error de red al salir, pero forzamos salida local.");
    } finally {
      // 3. Recargamos la página sí o sí
      window.location.href = '/';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow fixed-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">MéridaActiva</Link>
        {/* ... resto del código del menú ... */}
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {/* ... tus enlaces ... */}
            <li className="nav-item"><Link className="nav-link" to="/eventos">Eventos</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/lugares">Lugares</Link></li>
             <li className="nav-item"><Link className="nav-link" to="/mapa">Mapas</Link></li>
             {(profile?.roles?.nombre === 'Administrador' || profile?.roles?.nombre === 'Gestor (Editor)') && (
              <li className="nav-item"><Link className="nav-link text-warning" to="/admin">Gestión</Link></li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {!session ? (
              <div className="d-flex gap-2">
                <Link className="btn btn-outline-light btn-sm" to="/login">Entrar</Link>
                <Link className="btn btn-primary btn-sm" to="/registro">Registro</Link>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-3">
                <Link to="/perfil" className="text-light text-decoration-none">
                  Hola, {profile?.nombre || 'Usuario'}
                </Link>
                <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                  Salir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;