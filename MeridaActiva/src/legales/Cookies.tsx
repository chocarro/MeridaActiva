import React from 'react';

const Cookies: React.FC = () => {
  return (
    <div className="container py-5 mt-5">
      <h1 className="fw-bold mb-4">Política de Cookies</h1>
      <div className="card shadow-sm p-4 border-0 rounded-4">
        <p className="text-muted">MéridaActiva utiliza cookies para mejorar tu experiencia:</p>
        <table className="table table-hover mt-3">
          <thead className="table-light">
            <tr>
              <th>Tipo</th>
              <th>Propósito</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Técnicas</strong></td>
              <td>Necesarias para que mantengas tu sesión iniciada (Supabase).</td>
            </tr>
            <tr>
              <td><strong>Analíticas</strong></td>
              <td>Permiten saber qué eventos son los más populares en la ciudad.</td>
            </tr>
            <tr>
              <td><strong>Mapas</strong></td>
              <td>Gestionadas por OpenStreetMap para mostrar la ubicación de los eventos.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Cookies;