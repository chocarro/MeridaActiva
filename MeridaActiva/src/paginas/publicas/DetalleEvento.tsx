import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import FormularioReseña from '../../componentes/FormularioReseña';
import BotonFavorito from '../../componentes/BotonFavorito';
import { SkeletonDetalleEvento } from '../../componentes/Skeletons';
import LazyImg from '../../componentes/LazyImg';
import { useSeoMeta } from '../../hooks/useSeoMeta';
import { toastError } from '../../utils/toast';

const CATEGORY_COLORS: Record<string, string> = {
  Cultural: '#032B43',
  Música: '#3F88C5',
  Teatro: '#D00000',
};

const DetalleEvento: React.FC = () => {
  const { id } = useParams();
  const [evento, setEvento] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [comentarios, setComentarios] = useState<any[]>([]);

  // ── SEO dinámico (se actualiza cuando llegan los datos del evento) ──
  useSeoMeta({
    title: evento ? evento.titulo : 'Cargando evento...',
    description: evento
      ? `${evento.titulo} — ${(evento.descripcion || '').slice(0, 140)}...`
      : 'Descubre este evento en Mérida.',
    image: evento?.imagen_url,
    type: 'article',
  });

  const fetchEventoData = async () => {
    setError(false);
    setCargando(true);
    try {
      const { data: eventoData, error: eventoError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', id)
        .single();

      if (eventoError) throw eventoError;
      if (eventoData) setEvento(eventoData);

      const { data: comentariosData } = await supabase
        .from('comentarios')
        .select('*')
        .eq('evento_id', id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (comentariosData) setComentarios(comentariosData);
    } catch {
      setError(true);
      toastError('No se pudo cargar el evento. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchEventoData();
  }, [id]);

  if (cargando) return <SkeletonDetalleEvento />;

  if (error || !evento) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="text-center max-w-sm mx-auto px-4">
        <div className="text-8xl mb-6">🎭</div>
        <h2 className="text-3xl font-black uppercase italic text-brand-dark mb-4">
          {error ? 'Error de conexión' : 'Evento no encontrado'}
        </h2>
        <p className="text-slate-400 font-medium mb-6">
          {error
            ? 'No se pudo cargar este evento. Comprueba tu conexión a internet.'
            : 'El evento que buscas ya no está disponible.'}
        </p>
        <div className="flex gap-3 justify-center">
          {error && (
            <button
              onClick={fetchEventoData}
              className="bg-brand-gold text-brand-dark px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
              aria-label="Reintentar carga del evento"
            >
              <i className="bi bi-arrow-clockwise mr-2" />Reintentar
            </button>
          )}
          <Link to="/eventos" className="bg-brand-dark text-brand-gold px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all inline-block">
            Ver eventos
          </Link>
        </div>
      </div>
    </div>
  );

  const accentColor = CATEGORY_COLORS[evento.categoria] ?? '#032B43';
  const fechaFormateada = new Date(evento.fecha).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const avgPuntuacion = comentarios.length > 0
    ? (comentarios.reduce((s, c) => s + (c.puntuacion || 5), 0) / comentarios.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-brand-bg">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className="relative h-[45vh] md:h-[75vh] w-full overflow-hidden">
        <LazyImg
          src={evento.imagen_url}
          alt={evento.titulo}
          priority
          className="w-full h-full object-cover scale-105 animate-slow-zoom"
          wrapperClassName="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent" />

        {/* Back button */}
        <Link
          to="/eventos"
          className="absolute top-20 md:top-28 left-4 md:left-20 z-20 flex items-center gap-2 text-white/70 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all group"
        >
          <i className="bi bi-arrow-left group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Volver a eventos</span>
          <span className="sm:hidden">Volver</span>
        </Link>

        <div className="absolute bottom-0 left-0 w-full p-4 md:p-20 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span
                className="text-[9px] font-black uppercase tracking-[0.3em] text-white px-4 py-2 rounded-full"
                style={{ background: accentColor }}
              >
                {evento.categoria}
              </span>
              {evento.precio === 0 || evento.precio === null ? (
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-gold bg-brand-gold/10 border border-brand-gold/30 px-4 py-2 rounded-full">
                  Entrada gratuita
                </span>
              ) : (
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white bg-white/10 border border-white/20 px-4 py-2 rounded-full">
                  Desde {evento.precio}€
                </span>
              )}
            </div>
            <div className="flex items-end justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1
                  style={{ fontSize: 'clamp(1.6rem, 6vw, 5rem)' }}
                  className="font-black text-white italic uppercase tracking-tighter leading-[0.9] mb-2 max-w-4xl"
                >
                  {evento.titulo}
                </h1>
                <p className="text-white/50 font-bold text-xs md:text-sm truncate">
                  <i className="bi bi-calendar3 mr-2" />
                  {fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)}
                  <span className="mx-2 text-white/20">·</span>
                  <i className="bi bi-geo-alt-fill mr-1" />
                  {evento.ubicacion}
                </p>
              </div>
              <div className="flex-shrink-0">
                <BotonFavorito eventoId={id} tipo="evento" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16">

        {/* Sidebar ticket en móvil: visible arriba del contenido */}
        <div className="lg:hidden mb-8">
          <div className="ticket-sidebar !sticky-none">
            <div className="relative z-10">
              <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-2">Precio de entrada</p>
              <div className="flex items-baseline gap-1 mb-6">
                {evento.precio ? (
                  <><p className="text-5xl font-black text-brand-gold italic tracking-tighter">{evento.precio}</p><span className="text-xl font-black text-brand-gold">€</span></>
                ) : (
                  <p className="text-3xl font-black text-brand-gold italic tracking-tighter">Gratis</p>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mb-6 text-white/60 text-sm">
                <span><i className="bi bi-geo-alt-fill text-brand-gold mr-2" />{evento.ubicacion}</span>
                <span><i className="bi bi-tag-fill text-brand-gold mr-2" />{evento.categoria}</span>
              </div>
              <a
                href={evento.enlace_externo || 'https://merida.es/agenda'}
                target="_blank"
                rel="noreferrer"
                className="block w-full bg-brand-gold text-brand-dark py-4 rounded-2xl font-black text-center shadow-lg hover:bg-white transition-all uppercase tracking-[0.2em] text-[11px]"
              >
                <i className="bi bi-ticket-perforated mr-2" />Conseguir Entradas
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">

          {/* ── LEFT COLUMN ─── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Description */}
            <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-sm">
              <h3 className="text-brand-blue font-black uppercase tracking-[0.2em] text-[10px] mb-8 flex items-center gap-3">
                <span className="w-12 h-[2px] bg-brand-gold" />
                Sobre el evento
              </h3>
              <p className="text-brand-dark text-xl font-medium leading-relaxed opacity-80 whitespace-pre-line">
                {evento.descripcion}
              </p>

              {/* Extra info blocks */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-brand-bg rounded-[2rem] p-8 border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                      <i className="bi bi-universal-access text-brand-blue text-lg" />
                    </div>
                    <h4 className="font-black text-brand-dark text-[10px] uppercase tracking-widest">Accesibilidad</h4>
                  </div>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    El recinto dispone de acceso adaptado para personas con movilidad reducida. Si necesitas asistencia especial, contacta con el organizador con antelación.
                  </p>
                </div>

                <div className="bg-brand-bg rounded-[2rem] p-8 border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-brand-gold/10 rounded-2xl flex items-center justify-center">
                      <i className="bi bi-lightbulb-fill text-brand-gold text-lg" />
                    </div>
                    <h4 className="font-black text-brand-dark text-[10px] uppercase tracking-widest">Consejos prácticos</h4>
                  </div>
                  <ul className="text-slate-500 text-sm font-medium leading-relaxed space-y-2">
                    <li className="flex items-start gap-2"><i className="bi bi-check2 text-brand-green mt-0.5" /> Llega al menos 15 minutos antes para encontrar aparcamiento.</li>
                    <li className="flex items-start gap-2"><i className="bi bi-check2 text-brand-green mt-0.5" /> Consulta si el evento requiere entradas o inscripción previa.</li>
                    <li className="flex items-start gap-2"><i className="bi bi-check2 text-brand-green mt-0.5" /> El centro histórico es peatonal — ideal para llegar a pie o en bicicleta.</li>
                  </ul>
                </div>
              </div>

              {/* Info about the venue */}
              <div className="mt-6 bg-brand-dark rounded-[2rem] p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <i className="bi bi-geo-alt-fill text-brand-gold text-xl" />
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-white/80">Sobre el lugar: {evento.ubicacion}</h4>
                </div>
                <p className="text-white/60 text-sm font-medium leading-relaxed">
                  Mérida, declarada Patrimonio de la Humanidad por la UNESCO en 1993, alberga uno de los conjuntos de monumentos romanos mejor conservados del mundo. Cada rincón de la ciudad respira historia y cultura, convirtiendo cada evento en una experiencia única e irrepetible.
                </p>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(evento.ubicacion + ' Mérida, Extremadura')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-brand-gold font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                >
                  <i className="bi bi-map" />
                  Ver en Google Maps
                </a>
              </div>
            </div>

            {/* Quick info chips */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: 'bi-geo-alt-fill', label: 'Lugar', value: evento.ubicacion, color: 'text-brand-blue' },
                { icon: 'bi-calendar3', label: 'Fecha', value: new Date(evento.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }), color: 'text-brand-green' },
                { icon: 'bi-ticket-perforated', label: 'Precio', value: evento.precio ? `${evento.precio}€` : 'Gratis', color: 'text-brand-gold' },
                { icon: 'bi-chat-heart', label: 'Reseñas', value: comentarios.length > 0 ? `${avgPuntuacion}★ (${comentarios.length})` : 'Sin reseñas', color: 'text-brand-red' },
              ].map((chip) => (
                <div key={chip.label} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <i className={`bi ${chip.icon} ${chip.color} text-2xl mb-3 block`} />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{chip.label}</p>
                  <p className="font-black text-brand-dark text-sm leading-tight">{chip.value}</p>
                </div>
              ))}
            </div>

            {/* Comentarios */}
            <div aria-live="polite" aria-label="Opiniones del púблico">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-brand-dark">
                  Voces del público
                </h2>
                {avgPuntuacion && (
                  <div className="flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/30 rounded-2xl px-5 py-3">
                    <span className="text-2xl font-black text-brand-gold">{avgPuntuacion}</span>
                    <i className="bi bi-heart-fill text-brand-red" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">promedio</span>
                  </div>
                )}
              </div>

              <FormularioReseña eventoId={id!} onPublicado={fetchEventoData} />

              {comentarios.length > 0 ? (
                <div className="grid gap-6 mt-8">
                  {comentarios.map((c) => (
                    <div key={c.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center text-white font-black text-lg uppercase shadow-lg shadow-brand-blue/20">
                          {c.nombre_usuario?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-[10px] uppercase text-brand-dark tracking-widest">{c.nombre_usuario || 'Visitante'}</p>
                          <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                            {new Date(c.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(n => (
                            <i key={n} className={`bi bi-heart${n <= (c.puntuacion || 5) ? '-fill text-brand-red' : ' text-slate-200'} text-sm`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-brand-dark opacity-70 font-medium italic text-lg leading-relaxed">
                        "{c.texto}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 py-16 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                  <div className="text-5xl mb-4">💬</div>
                  <p className="font-black text-sm uppercase tracking-widest text-slate-300">Sé el primero en compartir tu experiencia</p>
                </div>
              )}
            </div>
          </div>

          {/* ── SIDEBAR ─── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ticket */}
            <div className="ticket-sidebar sticky top-28">
              <div className="relative z-10">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-2">Precio de entrada</p>
                <div className="flex items-baseline gap-1 mb-8">
                  {evento.precio ? (
                    <>
                      <p className="text-7xl font-black text-brand-gold italic tracking-tighter">{evento.precio}</p>
                      <span className="text-2xl font-black text-brand-gold">€</span>
                    </>
                  ) : (
                    <p className="text-4xl font-black text-brand-gold italic tracking-tighter">Gratis</p>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-white/60">
                    <i className="bi bi-geo-alt-fill text-brand-gold text-lg" />
                    <span className="font-bold text-sm">{evento.ubicacion}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/60">
                    <i className="bi bi-calendar3 text-brand-gold text-lg" />
                    <span className="font-bold text-sm">
                      {new Date(evento.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-white/60">
                    <i className="bi bi-tag-fill text-brand-gold text-lg" />
                    <span className="font-bold text-sm">{evento.categoria}</span>
                  </div>
                </div>

                <a
                  href={evento.enlace_externo || `https://merida.es/agenda`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full bg-brand-gold text-brand-dark py-5 rounded-[1.5rem] font-black text-center shadow-lg hover:bg-white hover:scale-[1.03] transition-all duration-300 uppercase tracking-[0.2em] text-[11px] mb-4"
                >
                  <i className="bi bi-ticket-perforated mr-2" />
                  Conseguir Entradas
                </a>

                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(evento.ubicacion + ' Mérida')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full bg-white/10 text-white border border-white/20 py-4 rounded-[1.5rem] font-black text-center hover:bg-white/20 transition-all uppercase tracking-[0.2em] text-[10px]"
                >
                  <i className="bi bi-map mr-2" />
                  Cómo llegar
                </a>

                <div className="mt-6 flex items-center justify-center gap-3 text-white/20">
                  <i className="bi bi-shield-check text-lg" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Reserva segura y oficial</span>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-blue/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-red/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleEvento;