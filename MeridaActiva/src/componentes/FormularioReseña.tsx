import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const FormularioReseña: React.FC<{ eventoId: string, onPublicado: () => void }> = ({ eventoId, onPublicado }) => {
  const { profile, session } = useAuth();
  const [comentario, setComentario] = useState('');
  const [puntuacion, setPuntuacion] = useState(5);
  const [enviando, setEnviando] = useState(false);

  const enviarReseña = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return alert("Debes iniciar sesión para comentar");

    setEnviando(true);
    const { error } = await supabase.from('comentarios').insert([
      {
        evento_id: eventoId,
        usuario_id: session.user.id,
        texto: comentario,
        puntuacion: puntuacion,
        nombre_usuario: profile.nombre 
      }
    ]);

    if (!error) {
      setComentario('');
      onPublicado(); 
      alert("¡Reseña publicada!");
    }
    setEnviando(false);
  };

  if (!session) return (
    <div className="alert alert-light border rounded-4 p-4 text-center">
      <p className="mb-3">¿Te ha gustado el evento? Inicia sesión para dejar tu reseña.</p>
      <button className="btn btn-dark rounded-pill px-4">Iniciar Sesión</button>
    </div>
  );

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 mb-5">
      <h5 className="fw-bold mb-4">Escribe tu reseña</h5>
      <form onSubmit={enviarReseña}>
        <div className="mb-3">
          <label className="form-label small fw-bold">Puntuación</label>
          <div className="text-warning fs-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <i 
                key={num} 
                className={`bi bi-star${num <= puntuacion ? '-fill' : ''} me-2`}
                style={{ cursor: 'pointer' }}
                onClick={() => setPuntuacion(num)}
              ></i>
            ))}
          </div>
        </div>
        <div className="mb-3">
          <textarea 
            className="form-control rounded-3" 
            rows={3} 
            placeholder="Comparte tu experiencia..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold" disabled={enviando}>
          {enviando ? 'Publicando...' : 'Publicar Reseña'}
        </button>
      </form>
    </div>
  );
};