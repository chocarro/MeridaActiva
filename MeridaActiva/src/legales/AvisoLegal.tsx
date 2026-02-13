import React from 'react';
const AvisoLegal: React.FC = () => {
  return (
    <div className="container py-5 mt-5">
      <h1 className="fw-bold mb-4">Aviso Legal</h1>
      <div className="card shadow-sm p-4 border-0 rounded-4">
        <section className="mb-4">
          <h5 className="fw-bold">1. Datos Identificativos</h5>
          <p className="text-muted">En cumplimiento con el deber de información, se facilitan los siguientes datos:</p>
          <ul className="text-muted">
            <li><strong>Titular:</strong> Proyecto MéridaActiva (DAW Mérida)</li>
            <li><strong>Email:</strong> info@meridaactiva.com</li>
            <li><strong>Ubicación:</strong> Mérida, Extremadura, España</li>
          </ul>
        </section>
        <section>
          <h5 className="fw-bold">2. Propiedad Intelectual</h5>
          <p className="text-muted mb-0">
            Todos los derechos sobre los contenidos de esta web (textos, imágenes, diseño) pertenecen a MéridaActiva.
            Queda prohibida su reproducción sin permiso previo.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AvisoLegal;