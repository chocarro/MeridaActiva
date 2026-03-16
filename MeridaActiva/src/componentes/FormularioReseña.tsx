import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const FormularioReseña: React.FC<{ eventoId: string, onPublicado: () => void }> = ({ eventoId, onPublicado }) => {
  const { profile, session } = useAuth();
  const [comentario, setComentario] = useState('');
  const [puntuacion, setPuntuacion] = useState(5);
  const [enviando, setEnviando] = useState(false);

  const enviarReseña = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error('Debes iniciar sesión para publicar una reseña');
      return;
    }

    setEnviando(true);

    try {
      const { error } = await supabase.from('comentarios').insert([
        {
          evento_id: eventoId,
          usuario_id: session.user.id,
          texto: comentario,
          puntuacion: puntuacion,
          nombre_usuario: profile?.nombre || session.user.user_metadata?.full_name || 'Explorador'
        }
      ]);

      if (error) throw error;

      setComentario('');
      setPuntuacion(5);
      onPublicado();
      toast.success('¡Reseña publicada!');
    } catch (error: any) {
      console.error('Error al publicar:', error.message);
      toast.error('Error: ' + error.message);
    } finally {
      setEnviando(false);
    }
  };

  if (!session) return (
    <div className="bg-slate-50 rounded-[2.5rem] p-10 text-center border border-slate-100 shadow-inner">
      <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <i className="bi bi-person-lock text-2xl" />
      </div>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">
        Inicia sesión para compartir tu experiencia
      </p>
    </div>
  );

  return (
    <div className="bg-white border border-slate-100 shadow-2xl rounded-[3rem] p-10 mb-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full -mr-16 -mt-16 blur-3xl" />

      <h5 className="text-2xl font-[900] text-brand-dark mb-8 uppercase italic tracking-tighter">
        Deja tu <span className="text-brand-red">Valoración</span>
      </h5>

      <form onSubmit={enviarReseña} className="space-y-8 relative z-10">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Puntuación</label>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPuntuacion(num)}
                className={`text-3xl transition-all duration-300 hover:scale-125 ${num <= puntuacion ? 'text-brand-gold' : 'text-slate-200'
                  }`}
              >
                <i className={`bi bi-star${num <= puntuacion ? '-fill' : ''}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <textarea
            className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-8 text-slate-700 outline-none focus:ring-4 focus:ring-brand-red/10 focus:bg-white transition-all font-medium text-sm"
            rows={4}
            placeholder="¿Qué te ha parecido? Tu opinión ayuda a otros exploradores..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={enviando || !comentario.trim()}
          className="w-full bg-brand-dark text-white py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-brand-blue transition-all disabled:opacity-50 flex items-center justify-center gap-4 shadow-xl"
        >
          {enviando ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <i className="bi bi-send-fill" />
              <span>Publicar Reseña</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FormularioReseña;