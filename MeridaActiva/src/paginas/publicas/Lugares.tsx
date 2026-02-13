import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const Lugares: React.FC = () => {
  const [lugares, setLugares] = useState<any[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');

  useEffect(() => {
    const fetchLugares = async () => {
      // Pedimos los datos ordenados para evitar errores de consola
      const { data } = await supabase.from('lugares').select('*').order('created_at', { ascending: false });
      if (data) setLugares(data);
    };
    fetchLugares();
  }, []);

  const lugaresFiltrados = categoriaActiva === 'Todos' 
    ? lugares 
    : lugares.filter(l => l.categoria === categoriaActiva);

  return (
    <div className="container py-5 mt-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold display-4 text-dark">Guía de Mérida</h1>
        <p className="text-muted">Toca cualquier tarjeta para ver su ubicación real en el mapa.</p>
        
        <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap">
          {['Todos', 'Monumento', 'Museo', 'Gastronomía'].map(cat => (
            <button 
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`btn rounded-pill px-4 fw-bold shadow-sm ${categoriaActiva === cat ? 'btn-primary text-white' : 'btn-light border'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="row g-4">
        {lugaresFiltrados.map(lugar => (
          <div key={lugar.id} className="col-md-6 col-lg-4">
            {/* Toda la tarjeta es el enlace a Google Maps */}
            <a href={lugar.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
              <div className="card h-100 border-0 shadow rounded-4 overflow-hidden position-relative card-interactive">
                
                <div className="position-absolute top-0 start-0 m-3 z-3">
                  <span className={`badge rounded-pill px-3 py-2 ${lugar.categoria === 'Gastronomía' ? 'bg-danger' : 'bg-dark'}`}>
                    {lugar.categoria}
                  </span>
                </div>
                
                <img 
                  src={lugar.imagen_url} 
                  className="card-img-top" 
                  style={{height: '220px', objectFit: 'cover'}} 
                  alt={lugar.nombre_es}
                />

                <div className="card-body p-4 d-flex flex-column">
                  <h4 className="fw-bold mb-1 text-dark">{lugar.nombre_es}</h4>
                  <p className="text-primary small mb-3">
                    <i className="bi bi-geo-alt-fill me-1"></i> Mérida Patrimonio UNESCO
                  </p>
                  <p className="card-text text-secondary small mb-4 flex-grow-1">
                    {lugar.descripcion_es}
                  </p>
                  
                  {/* Botón visual claro sin elementos que sobren */}
                  <div className="btn btn-dark w-100 rounded-pill py-2 fw-bold shadow-sm mt-auto">
                    <i className="bi bi-map-fill me-2"></i> Abrir Ubicación Real
                  </div>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>

      <style>{`
        .card-interactive { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
        .card-interactive:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(0,0,0,0.15) !important; }
      `}</style>
    </div>
  );
};

export default Lugares;