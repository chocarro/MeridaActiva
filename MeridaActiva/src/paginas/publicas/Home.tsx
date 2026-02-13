import React, { useEffect, useState } from 'react'; // Importación correcta de hooks
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Footer from '../../componentes/Footer';

const Home: React.FC = () => {
  const [reseñas, setReseñas] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Cargar reseñas con el título del evento relacionado
      const { data: dataReseñas } = await supabase
        .from('comentarios')
        .select('*, eventos(titulo)')
        .order('created_at', { ascending: false })
        .limit(3);
      if (dataReseñas) setReseñas(dataReseñas);

      // 2. Cargar eventos para filtrar por categoría en las secciones
      const { data: dataEventos } = await supabase
        .from('eventos')
        .select('*')
        .order('fecha', { ascending: true });
      if (dataEventos) setEventos(dataEventos);
    };

    fetchData();
  }, []);

  // Filtrado de eventos por categoría para las secciones visuales
  const eventosCulturales = eventos.filter(ev => ev.categoria === 'Cultural').slice(0, 3);
  const eventosMusica = eventos.filter(ev => ev.categoria === 'Música').slice(0, 3);

  return (
    <div className="main-wrapper">
      {/* HERO SECTION CON BUSCADOR */}
      <header className="hero-modern d-flex align-items-center text-white" style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("/imagenes/teatro-romano-merida.jpeg")',
        backgroundSize: 'cover', backgroundPosition: 'center', height: '80vh'
      }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-7">
              <span className="badge bg-light text-dark mb-3 rounded-pill px-3 py-2">Evento Destacado</span>
              <h1 className="display-3 fw-bold mb-3">Descubre los Mejores <br /><span className="text-warning">Eventos de Mérida</span></h1>
              <p className="lead mb-4">Explora la rica oferta cultural, gastronómica y de entretenimiento de la ciudad más histórica de Extremadura.</p>

              <div className="search-bar-modern bg-white p-2 rounded-3 shadow d-flex align-items-center mb-4 text-dark">
                <i className="bi bi-search text-muted mx-3"></i>
                <input type="text" className="form-control border-0" placeholder="Buscar eventos, categorías, ubicaciones..." />
                <button className="btn btn-dark px-4 ms-2">Buscar</button>
              </div>

              <div className="d-flex gap-3">
                <div className="d-flex gap-3">
                  <Link to="/mapa" className="btn btn-warning px-4 py-2 text-white fw-bold shadow-sm">
                    <i className="bi bi-geo-alt-fill me-2"></i> Ver Mapa
                  </Link>
                  <Link to="/eventos" className="btn btn-outline-light px-4 py-2">Todos los Eventos</Link>
                </div>          
                
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CATEGORÍAS */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="fw-bold mb-4">Explorar por Categoría</h2>
          <div className="row g-3 text-center">
            {[
              { icon: 'bi-grid-fill', label: 'Todos', color: 'primary' },
              { icon: 'bi-bank', label: 'Cultural', color: 'secondary' },
              { icon: 'bi-music-note-beamed', label: 'Música', color: 'secondary' },
              { icon: 'bi-utensils', label: 'Gastronomía', color: 'secondary' },
              { icon: 'bi-trophy', label: 'Deportes', color: 'secondary' },
              { icon: 'bi-people', label: 'Familiar', color: 'secondary' }
            ].map((cat, i) => (
              <div key={i} className="col-4 col-md-2">
                <div className="card h-100 border-0 shadow-sm py-4 hover-zoom cursor-pointer rounded-4">
                  <i className={`bi ${cat.icon} fs-2 text-${cat.color} mb-2`}></i>
                  <p className="small fw-bold mb-0">{cat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN: EVENTOS CULTURALES */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center p-4 rounded-4 mb-4 text-white shadow-sm"
            style={{ background: 'linear-gradient(90deg, #6f42c1 0%, #a445ed 100%)' }}>
            <div>
              <h3 className="fw-bold mb-1"><i className="bi bi-bank me-2"></i> Eventos Culturales</h3>
              <p className="mb-0 opacity-75 small">Descubre la rica herencia histórica y artística de Mérida</p>
            </div>
            <Link to="/eventos" className="btn btn-light btn-sm rounded-pill px-4 fw-bold text-primary shadow-sm">Ver Todos</Link>
          </div>

          <div className="row g-4">
            {eventosCulturales.map(ev => (
              <div key={ev.id} className="col-md-4">
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                  <img src={ev.imagen_url} className="card-img-top" style={{ height: '220px', objectFit: 'cover' }} alt={ev.titulo} />
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-1">{ev.titulo}</h5>
                    <p className="text-muted small mb-3"><i className="bi bi-geo-alt me-1 text-danger"></i>{ev.ubicacion}</p>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span className="h5 fw-bold text-primary mb-0">{ev.precio}€</span>
                      <Link to={`/eventos/${ev.id}`} className="btn btn-dark btn-sm rounded-pill px-4">Ver Detalles</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN: MÚSICA Y CONCIERTOS */}
      <section className="py-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center p-4 rounded-4 mb-4 text-white shadow-sm"
            style={{ background: 'linear-gradient(90deg, #0099cc 0%, #29abe2 100%)' }}>
            <div>
              <h3 className="fw-bold mb-1"><i className="bi bi-music-note-beamed me-2"></i> Música y Conciertos</h3>
              <p className="mb-0 opacity-75 small">Los mejores sonidos y ritmos en escenarios únicos</p>
            </div>
            <Link to="/eventos" className="btn btn-light btn-sm rounded-pill px-4 fw-bold text-info shadow-sm">Ver Todos</Link>
          </div>

          <div className="row g-4">
            {eventosMusica.map(ev => (
              <div key={ev.id} className="col-md-4">
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                  <img src={ev.imagen_url} className="card-img-top" style={{ height: '220px', objectFit: 'cover' }} alt={ev.titulo} />
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-1">{ev.titulo}</h5>
                    <p className="text-muted small mb-3"><i className="bi bi-geo-alt me-1 text-info"></i>{ev.ubicacion}</p>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span className="h5 fw-bold text-info mb-0">{ev.precio}€</span>
                      <Link to={`/eventos/${ev.id}`} className="btn btn-dark btn-sm rounded-pill px-4">Ver Detalles</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN: RESEÑAS RECIENTES */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-5">
            <h2 className="fw-bold mb-0">Reseñas Recientes</h2>
            <button className="btn btn-outline-dark rounded-pill px-4 btn-sm fw-bold">Ver Todas</button>
          </div>

          <div className="row g-4">
            {reseñas.length > 0 ? (
              reseñas.map((res: any) => (
                <div key={res.id} className="col-12">
                  <div className="card border-0 shadow-sm rounded-4 p-4 review-card">
                    <div className="row align-items-center g-3">
                      <div className="col-auto">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                          style={{ width: '60px', height: '60px', fontSize: '1.2rem' }}>
                          {res.nombre_usuario?.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="col">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <div>
                            <h6 className="fw-bold mb-0">{res.nombre_usuario}</h6>
                            <small className="text-primary fw-bold">{res.eventos?.titulo}</small>
                            <span className="text-muted small mx-2">•</span>
                            <small className="text-muted small">
                              {new Date(res.created_at).toLocaleDateString()}
                            </small>
                          </div>
                          <div className="text-warning small">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`bi bi-star${i < res.puntuacion ? '-fill' : ''} me-1`}></i>
                            ))}
                          </div>
                        </div>
                        <p className="mb-0 text-secondary fst-italic mt-2">"{res.texto}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <p className="text-muted">No hay reseñas disponibles actualmente.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ESTILOS INTERNOS */}
      <style>{`
        .hover-zoom:hover { transform: translateY(-5px); transition: transform 0.3s ease; }
        .cursor-pointer { cursor: pointer; }
        .review-card { transition: all 0.3s ease; border-left: 5px solid transparent !important; }
        .review-card:hover { transform: translateX(8px); border-left: 5px solid #ffc107 !important; box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
      `}</style>
    </div>
  );
};

export default Home;