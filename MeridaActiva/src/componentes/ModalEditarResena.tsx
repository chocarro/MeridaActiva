import React, { useState } from 'react';
import { actualizarResenaPropia, eliminarResenaPropia } from '../utils/comentariosApi';
import { toastExito, toastError } from '../utils/toast';

export interface ResenaEditable {
  id: string;
  texto: string;
  puntuacion: number;
  tituloEvento?: string;
}

interface Props {
  resena: ResenaEditable;
  usuarioId: string;
  onCerrar: () => void;
  onActualizado: () => void;
}

const ModalEditarResena: React.FC<Props> = ({ resena, usuarioId, onCerrar, onActualizado }) => {
  const [texto, setTexto] = useState(resena.texto);
  const [puntuacion, setPuntuacion] = useState(resena.puntuacion);
  const [guardando, setGuardando] = useState(false);
  const [pendienteBorrar, setPendienteBorrar] = useState(false);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    setGuardando(true);
    try {
      await actualizarResenaPropia(resena.id, usuarioId, texto.trim(), puntuacion);
      toastExito('Reseña actualizada.');
      onActualizado();
      onCerrar();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async () => {
    setGuardando(true);
    try {
      await eliminarResenaPropia(resena.id, usuarioId);
      toastExito('Reseña eliminada.');
      onActualizado();
      onCerrar();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'No se pudo eliminar.');
    } finally {
      setGuardando(false);
      setPendienteBorrar(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative">
        <button
          type="button"
          onClick={onCerrar}
          className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-brand-bg hover:bg-brand-red hover:text-white transition-all flex items-center justify-center text-slate-400"
          aria-label="Cerrar"
        >
          <i className="bi bi-x-lg" />
        </button>
        <h3 className="text-xl font-black text-brand-dark italic uppercase tracking-tighter mb-1 pr-10">
          Editar reseña
        </h3>
        {resena.tituloEvento && (
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6 truncate">
            {resena.tituloEvento}
          </p>
        )}

        {pendienteBorrar ? (
          <div className="space-y-4">
            <p className="text-sm text-brand-dark font-medium">¿Eliminar esta reseña?</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPendienteBorrar(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest">
                Cancelar
              </button>
              <button type="button" onClick={borrar} disabled={guardando} className="flex-1 py-3 rounded-xl bg-brand-red text-white font-black text-[10px] uppercase tracking-widest disabled:opacity-50">
                {guardando ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={guardar} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Puntuación</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setPuntuacion(n)} className="text-2xl hover:scale-110 transition-transform" aria-label={`${n} estrellas`}>
                    <i className={`bi bi-star${n <= puntuacion ? '-fill text-brand-gold' : ' text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tu reseña</label>
              <textarea value={texto} onChange={e => setTexto(e.target.value)} rows={4} maxLength={500} required className="input-field resize-none" />
            </div>
            <button type="submit" disabled={guardando || !texto.trim()} className="w-full bg-brand-dark text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl hover:bg-brand-blue transition-all disabled:opacity-50">
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={() => setPendienteBorrar(true)} className="w-full text-brand-red font-black uppercase tracking-widest text-[10px] py-2 hover:underline">
              Eliminar reseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModalEditarResena;
