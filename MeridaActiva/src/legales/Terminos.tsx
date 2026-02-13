import React from 'react';

const Terminos: React.FC = () => {
  return (
    <div className="container py-5 mt-5">
      <h1 className="fw-bold mb-4">Términos y Condiciones</h1>
      <div className="card shadow-sm p-4 border-0 rounded-4">
        <h5 className="fw-bold">Uso de la Plataforma</h5>
        <p className="text-muted">
          Al usar MéridaActiva, te comprometes a hacer un uso lícito de los contenidos y a no publicar 
          reseñas falsas o contenido ofensivo en los eventos de la ciudad.
        </p>
        <h5 className="fw-bold mt-4">Responsabilidad</h5>
        <p className="text-muted mb-0">
          MéridaActiva no se hace responsable de cambios de última hora en los eventos organizados por 
          terceros, aunque intentamos mantener la información siempre actualizada.
        </p>
      </div>
    </div>
  );
};

export default Terminos;