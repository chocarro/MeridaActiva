import React from 'react';

const Favoritos: React.FC = () => {
  return (
    <div className="container py-5 mt-5 text-center">
      <i className="bi bi-heart-fill text-danger display-1 mb-3"></i>
      <h2 className="fw-bold">Mis Favoritos</h2>
      <p className="text-muted">Aquí aparecerán los monumentos y eventos que más te gusten.</p>
      {/* Aquí irá el mapa de los eventos que el usuario haya marcado */}
    </div>
  );
};

export default Favoritos;