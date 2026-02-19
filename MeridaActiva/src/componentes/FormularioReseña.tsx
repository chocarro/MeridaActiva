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
    if (!session) return;

    setEnviando(true);
    const { error } = await supabase.from('comentarios').insert([
      {
        evento_id: eventoId,
        usuario_id: session.user.id,
        texto: comentario,
        puntuacion: puntuacion,
        nombre_usuario: profile?.nombre || 'Usuario' 
      }
    ]);

    if (!error) {
      setComentario('');
      onPublicado(); 
    }
    setEnviando(false);
  };

  if (!session) return (
    <div className="bg-slate-100 rounded-[2rem] p-8 text-center border border-slate-200">
      <p className="text-slate-600 font-medium mb-4">Inicia sesión para dejar tu reseña.</p>
      <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-500 transition-all">
        Iniciar Sesión
      </button>
    </div>
  );

  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-[2.5rem] p-8 mb-10">
      <h5 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Escribe tu reseña</h5>
      <form onSubmit={enviarReseña} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Puntuación</label>
          <div className="flex gap-2 text-2xl">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPuntuacion(num)}
                className={`transition-transform hover:scale-125 ${num <= puntuacion ? 'text-amber-500' : 'text-slate-200'}`}
              >
                {num <= puntuacion ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>
        <textarea 
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 outline-none focus:ring-2 focus:ring-amber-500 transition-all" 
          rows={3} 
          placeholder="Comparte tu experiencia..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          required
        />
        <button 
          type="submit" 
          className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-sm hover:bg-amber-500 hover:text-slate-900 transition-all disabled:opacity-50" 
          disabled={enviando}
        >
          {enviando ? 'PUBLICANDO...' : 'PUBLICAR RESEÑA'}
        </button>
      </form>
    </div>
  );
};

export default FormularioReseña; // ESTA LÍNEA ES CRÍTICA PARA EVITAR EL ERROR 404/SYNTAX