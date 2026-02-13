import React from 'react';

const Privacidad: React.FC = () => {
  return (
    <div className="container py-5 mt-5">
      <h1 className="fw-bold mb-4">Política de Privacidad</h1>
      <div className="card shadow-sm p-4 border-0 rounded-4">
        <h5 className="fw-bold">Tratamiento de Datos Personales</h5>
        <p className="text-muted">
          De conformidad con el RGPD, informamos que los datos recogidos a través del formulario de registro 
          (email y nombre) son utilizados exclusivamente para la gestión de tu perfil de usuario, favoritos y alertas.
        </p>
        <h5 className="fw-bold mt-4">Tus Derechos</h5>
        <p className="text-muted mb-0">
          Puedes ejercer tus derechos de acceso, rectificación o eliminación de tus datos enviando un 
          correo a nuestro contacto oficial. No cedemos datos a terceros.
        </p>
      </div>
    </div>
  );
};

export default Privacidad;