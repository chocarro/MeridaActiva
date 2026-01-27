import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Sección Hero: Búsqueda destacada [cite: 48] */}
      <section className="hero-section text-center py-5 bg-light rounded-3 mb-5">
        <div className="container">
          <h1 className="display-4 fw-bold">Explora Mérida</h1>
          <p className="lead">Encuentra monumentos, gastronomía y eventos en la Ciudad Eterna.</p>
          <div className="row justify-content-center mt-4">
            <div className="col-md-8">
              <div className="input-group input-group-lg shadow-sm">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="¿Qué quieres hacer hoy? (ej. Festival de Teatro, Tapas...)" 
                />
                <button className="btn btn-primary" type="button">Buscar</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros visuales por iconos [cite: 49] */}
      <section className="categories-section mb-5">
        <div className="row text-center g-4">
          <div className="col-6 col-md-2">
            <div className="p-3 border rounded shadow-sm hover-shadow cursor-pointer">
              <span className="display-6">🏛️</span>
              <p className="mt-2 mb-0">Museos</p>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <div className="p-3 border rounded shadow-sm">
              <span className="display-6">🍴</span>
              <p className="mt-2 mb-0">Gastronomía</p>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <div className="p-3 border rounded shadow-sm">
              <span className="display-6">⚽</span>
              <p className="mt-2 mb-0">Deportes</p>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <div className="p-3 border rounded shadow-sm">
              <span className="display-6">👨‍👩‍👧</span>
              <p className="mt-2 mb-0">Familiar</p>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <div className="p-3 border rounded shadow-sm">
              <span className="display-6">🌙</span>
              <p className="mt-2 mb-0">Nocturno</p>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <div className="p-3 border rounded shadow-sm">
              <span className="display-6">🗺️</span>
              <p className="mt-2 mb-0">Rutas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Próximos Eventos (Calendario visual) [cite: 48] */}
      <section className="events-preview">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h3">Próximos Eventos</h2>
          <button className="btn btn-outline-secondary btn-sm">Ver calendario completo</button>
        </div>
        
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {/* Ejemplo de Ficha de Evento [cite: 51] */}
          <div className="col">
            <div className="card h-100 shadow-sm">
              <div className="bg-secondary text-white p-5 text-center rounded-top">Imagen Evento</div>
              <div className="card-body">
                <h5 className="card-title">Festival de Teatro Clásico</h5>
                <p className="card-text text-muted small">📍 Teatro Romano | 📅 Julio - Agosto</p>
                <p className="card-text text-truncate">Disfruta de las mejores obras en un entorno histórico único.</p>
              </div>
              <div className="card-footer bg-transparent border-0 pb-3">
                <button className="btn btn-primary w-100">Ver detalles</button>
              </div>
            </div>
          </div>
          {/* ... más tarjetas ... */}
        </div>
      </section>
    </div>
  );
};

export default Home;