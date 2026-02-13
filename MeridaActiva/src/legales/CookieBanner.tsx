import React, { useState, useEffect } from 'react';

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed-bottom bg-dark text-white p-4 shadow-lg border-top border-warning animate__animated animate__fadeInUp" style={{ zIndex: 1050 }}>
      <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between">
        <div className="mb-3 mb-md-0 me-md-4 text-center text-md-start">
          <p className="small mb-0">
            Usamos cookies para que puedas guardar tus monumentos favoritos y ver los eventos en el mapa. 
            Consulta nuestra <a href="/cookies" className="text-warning">Política de Cookies</a>.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={() => setVisible(false)} className="btn btn-outline-light btn-sm px-4 rounded-pill">Rechazar</button>
          <button onClick={accept} className="btn btn-warning btn-sm px-4 rounded-pill fw-bold">Aceptar todas</button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;