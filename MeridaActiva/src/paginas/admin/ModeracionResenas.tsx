import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

interface Resena {
  id: string;
  texto: string;
  puntuacion: number;
  created_at: string;
  nombre_usuario: string | null;   // campo directo en la tabla
  evento_id: string | null;
  eventos: { titulo: string } | null;  // join FK evento_id → eventos
}

const POR_PAGINA = 12;

const Estrellas: React.FC<{ n: number }> = ({ n }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`bi ${i < n ? 'bi-star-fill text-brand-gold' : 'bi-star text-white/10'} text-xs`}
      />
    ))}
  </div>
);

const ModeracionResenas: React.FC = () => {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const totalPaginas = Math.ceil(total / POR_PAGINA);

  const fetchResenas = async (p = pagina) => {
    setLoading(true);
    try {
      const from = p * POR_PAGINA;
      const to = from + POR_PAGINA - 1;

      const { data, count, error } = await supabase
        .from('comentarios')
        .select('id, texto, puntuacion, created_at, nombre_usuario, evento_id, eventos(titulo)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      if (data) setResenas(data as unknown as Resena[]);
      if (count !== null) setTotal(count);
    } catch (e) {
      console.error('[ModeracionResenas]', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResenas(pagina); }, [pagina]);

  const cambiarPagina = (nueva: number) => {
    if (nueva < 0 || nueva >= totalPaginas) return;
    setPagina(nueva);
  };

  const eliminar = async (id: string) => {
    if (!window.confirm('¿Eliminar esta reseña permanentemente?')) return;
    setEliminando(id);
    try {
      await supabase.from('comentarios').delete().eq('id', id);
      fetchResenas(pagina);
    } catch {
      alert('Error al eliminar la reseña.');
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-14 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h2 className="text-6xl font-[900] text-white italic uppercase tracking-tighter leading-none">
              Moderación de <span className="text-brand-gold">Reseñas</span>
            </h2>
            <p className="text-white/30 font-black uppercase text-[10px] tracking-[0.3em] mt-4 ml-1">
              {total} reseña{total !== 1 ? 's' : ''} · Página {pagina + 1} de {totalPaginas || 1}
            </p>
          </div>
        </header>

        {/* Grid de tarjetas */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-[2rem] bg-white/5 border border-white/5" />
            ))}
          </div>
        ) : resenas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <i className="bi bi-chat-left-quote text-5xl text-white/10 mb-4" />
            <p className="text-white/20 font-black uppercase tracking-widest text-xs">Sin reseñas disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {resenas.map(r => (
              <div
                key={r.id}
                className="bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col gap-4 hover:bg-white/[0.08] transition-all group"
              >
                {/* Cabecera de la tarjeta */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold font-[900] italic text-lg flex-shrink-0">
                      {(r.nombre_usuario ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-[900] text-white uppercase italic text-sm leading-none truncate">
                        {r.nombre_usuario ?? 'Usuario desconocido'}
                      </p>
                      <p className="text-[9px] text-white/30 font-bold mt-0.5">
                        {new Date(r.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {/* Botón eliminar */}
                  <button
                    onClick={() => eliminar(r.id)}
                    disabled={eliminando === r.id}
                    title="Eliminar reseña"
                    className="w-9 h-9 rounded-xl bg-white/5 text-white/20 hover:bg-brand-red hover:text-white transition-all active:scale-90 disabled:opacity-40 flex-shrink-0 flex items-center justify-center"
                  >
                    {eliminando === r.id ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <i className="bi bi-trash3-fill text-sm" />
                    )}
                  </button>
                </div>

                {/* Evento */}
                <div className="flex items-center gap-2">
                  <i className="bi bi-calendar-event text-brand-blue text-xs flex-shrink-0" />
                  <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest truncate">
                    {r.eventos?.titulo ?? 'Evento eliminado'}
                  </p>
                </div>

                {/* Puntuación */}
                <Estrellas n={r.puntuacion ?? 0} />

                {/* Texto */}
                <p className="text-sm text-white/50 leading-relaxed font-medium flex-1 line-clamp-4">
                  {r.texto || <span className="italic text-white/20">Sin comentario escrito</span>}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={() => cambiarPagina(pagina - 1)}
              disabled={pagina === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <i className="bi bi-chevron-left" /> Anterior
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPaginas }, (_, i) => (
                <button
                  key={i}
                  onClick={() => cambiarPagina(i)}
                  className={`w-9 h-9 rounded-xl font-black text-[10px] transition-all ${i === pagina ? 'bg-brand-gold text-brand-dark' : 'text-white/30 hover:bg-white/10 hover:text-white'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => cambiarPagina(pagina + 1)}
              disabled={pagina >= totalPaginas - 1}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Siguiente <i className="bi bi-chevron-right" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ModeracionResenas;
