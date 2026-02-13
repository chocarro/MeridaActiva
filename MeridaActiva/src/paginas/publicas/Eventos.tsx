import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext'; // Importante para el botón de favoritos

const Eventos: React.FC = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [categoriaSel, setCategoriaSel] = useState('Todos'); // Para el filtro visual
  const { profile } = useAuth(); // Obtenemos el perfil para gestionar permisos

  useEffect(() => {
    fetchEventos();
  }, [categoriaSel]); // Recarga cuando cambias de categoría

  const fetchEventos = async () => {
    let query = supabase.from('eventos').select('*');
    
    if (categoriaSel !== 'Todos') {
      query = query.eq('categoria', categoriaSel); // Filtro dinámico
    }

    const { data } = await query;
    if (data) setEventos(data);
  };

  return (
    <div className="container py-5 mt-4">
      {/* 1. SECCIÓN DE FILTROS POR ICONOS (Basado en tu diseño) */}
      <div className="mb-5">
        <h4 className="fw-bold mb-3">Explorar por Categoría</h4>
        <div className="d-flex gap-3 overflow-auto pb-2">
          {['Todos', 'Cultural', 'Música', 'Gastronomía', 'Deportes', 'Familiar'].map(cat => (
            <button 
              key={cat}
              onClick={() => setCategoriaSel(cat)}
              className={`btn rounded-4 px-4 py-3 shadow-sm border-0 ${categoriaSel === cat ? 'btn-primary' : 'btn-white bg-white'}`}
            >
              <span className="small fw-bold text-nowrap">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">Próximos Eventos</h1>
        <span className="text-muted">{eventos.length} resultados encontrados</span>
      </div>

      <div className="row g-4">
        {eventos.map((evento) => (
          <div key={evento.id} className="col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm overflow-hidden event-card-hover rounded-4">
              <div className="position-relative">
                <img 
                  src={evento.imagen_url || "/img/placeholder.jpg"} 
                  className="card-img-top" 
                  alt={evento.titulo_es} 
                  style={{height: '240px', objectFit: 'cover'}} 
                />
                <span className="position-absolute top-0 start-0 m-3 badge bg-dark-subtle backdrop-blur px-3 py-2 rounded-pill">
                  {evento.categoria || 'General'}
                </span>
                
                {/* 2. FUNCIONALIDAD ROL: Guardar favoritos (Solo Registrados, Gestores, Admin) */}
                {profile && (
                  <button className="btn btn-white position-absolute top-0 end-0 m-3 rounded-circle shadow-sm p-2 text-danger">
                    <i className="bi bi-heart"></i>
                  </button>
                )}
              </div>

              <div className="card-body p-4">
                <h5 className="fw-bold mb-2">{evento.titulo_es}</h5>
                <div className="text-muted small mb-2 d-flex align-items-center">
                  <i className="bi bi-calendar3 me-2 text-primary"></i> 
                  {new Date(evento.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <div className="text-muted small mb-3 d-flex align-items-center">
                  <i className="bi bi-geo-alt me-2 text-primary"></i> {evento.ubicacion || 'Mérida'}
                </div>
                
                <div className="d-flex justify-content-between align-items-center mt-3 border-top pt-3">
                  <span className="fw-bold fs-5 text-primary">
                    {evento.precio ? `${evento.precio}€` : 'Gratis'}
                  </span>
                  <button className="btn btn-dark btn-sm px-4 rounded-pill">Ver Detalles</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .event-card-hover { transition: transform 0.3s ease; cursor: pointer; }
        .event-card-hover:hover { transform: translateY(-8px); }
        .backdrop-blur { backdrop-filter: blur(8px); background: rgba(0,0,0,0.4); }
      `}</style>
    </div>
  );
};

export default Eventos;