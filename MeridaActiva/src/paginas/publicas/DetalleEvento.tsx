import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const DetalleEvento: React.FC = () => {
  const { id } = useParams();
  const [evento, setEvento] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [comentario, setComentario] = useState('');
  const [puntuacion, setPuntuacion] = useState(5);

  useEffect(() => {
    const fetchEvento = async () => {
      const { data } = await supabase.from('eventos').select('*').eq('id', id).single();
      if (data) setEvento(data);
    };
    fetchEvento();
  }, [id]);

  const enviarReseña = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('comentarios').insert([
      {
        evento_id: id,
        nombre_usuario: nombre,
        texto: comentario,
        puntuacion: puntuacion
      }
    ]);

    if (!error) {
      alert("¡Reseña enviada con éxito!");
      setNombre('');
      setComentario('');
      window.location.reload(); // Recargamos para que veas que se ha guardado
    }
  };

  if (!evento) return <div className="container mt-5 pt-5">Cargando...</div>;

  return (
    <div className="container py-5 mt-5">
      <div className="row g-5">
        <div className="col-lg-8">
          <img src={evento.imagen_url} className="img-fluid rounded-4 mb-4" alt={evento.titulo} />
          <h1 className="fw-bold">{evento.titulo}</h1>
          <p className="lead text-muted">{evento.descripcion}</p>

          {/* --- AQUÍ ESTÁ EL FORMULARIO QUE BUSCAS --- */}
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-light mt-5">
            <h4 className="fw-bold mb-4">Escribe tu reseña sobre este evento</h4>
            <form onSubmit={enviarReseña}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Tu Nombre</label>
                  <input type="text" className="form-control" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Ej: Juan Pérez" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Puntuación</label>
                  <select className="form-select" value={puntuacion} onChange={e => setPuntuacion(Number(e.target.value))}>
                    <option value="5">⭐⭐⭐⭐⭐ Excelente</option>
                    <option value="4">⭐⭐⭐⭐ Muy bueno</option>
                    <option value="3">⭐⭐⭐ Normal</option>
                    <option value="2">⭐⭐ Pobre</option>
                    <option value="1">⭐ Malo</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Comentario</label>
                  <textarea className="form-control" rows={3} value={comentario} onChange={e => setComentario(e.target.value)} required placeholder="¿Qué te ha parecido?"></textarea>
                </div>
                <div className="col-12 text-end">
                  <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold">Publicar Reseña</button>
                </div>
              </div>
            </form>
          </div>
          {/* ------------------------------------------ */}
        </div>

        <div className="col-lg-4">
          <div className="card p-4 shadow-sm border-0 rounded-4 sticky-top" style={{top: '100px'}}>
             <h5 className="fw-bold mb-3 text-primary">Detalles</h5>
             <p className="mb-2"><strong>Fecha:</strong> {evento.fecha}</p>
             <p className="mb-4"><strong>Lugar:</strong> {evento.ubicacion}</p>
             <a href={evento.enlace_externo} target="_blank" className="btn btn-dark w-100 rounded-pill">Comprar Entradas</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleEvento;