import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer: React.FC = () => {
  const { profile } = useAuth();

  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto border-top border-secondary">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-3 col-md-6">
            <h4 className="fw-bold mb-3 text-warning">MéridaActiva</h4>
            <p className="text-white-50 small mb-4">
              La plataforma definitiva para descubrir la historia, cultura y eventos 
              de la ciudad de Mérida.
            </p>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3 text-uppercase small tracking-wider">Explorar</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to="/eventos" className="text-white-50 text-decoration-none hover-white">Eventos</Link></li>
              <li className="mb-2"><Link to="/lugares" className="text-white-50 text-decoration-none hover-white">Monumentos</Link></li>
              <li className="mb-2"><Link to="/mapas" className="text-white-50 text-decoration-none hover-white">Mapas</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3 text-uppercase small tracking-wider">Cuenta</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to="/perfil" className="text-white-50 text-decoration-none hover-white">Mi Perfil</Link></li>
              {['Administrador', 'Gestor (Editor)'].includes(profile?.roles?.nombre) && (
                <li className="mb-2"><Link to="/admin" className="text-warning text-decoration-none fw-bold">Panel Admin</Link></li>
              )}
            </ul>
          </div>

          {/* NUEVA COLUMNA: LEGAL */}
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3 text-uppercase small tracking-wider">Legal</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to="/aviso-legal" className="text-white-50 text-decoration-none">Aviso Legal</Link></li>
              <li className="mb-2"><Link to="/privacidad" className="text-white-50 text-decoration-none">Privacidad</Link></li>
              <li className="mb-2"><Link to="/cookies" className="text-white-50 text-decoration-none">Cookies</Link></li>
              <li className="mb-2"><Link to="/terminos" className="text-white-50 text-decoration-none">Términos</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3 text-uppercase small tracking-wider">Contacto</h6>
            <p className="text-white-50 small mb-2"><i className="bi bi-geo-alt-fill text-warning me-2"></i> Plaza de España, Mérida</p>
            <p className="text-white-50 small mb-2"><i className="bi bi-envelope-fill text-warning me-2"></i> info@meridaactiva.com</p>
          </div>
        </div>

        <hr className="my-4 border-secondary opacity-25" />
        
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="small text-white-50 mb-0">© 2026 MéridaActiva.</p>
          </div>
          <div className="col-md-6 text-center text-md-end mt-2 mt-md-0">
            <span className="small text-white-50">Hecho con <i className="bi bi-heart-fill text-danger"></i> para Extremadura</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;