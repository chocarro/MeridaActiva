import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import LazyImg from '../../componentes/LazyImg';
import { useSeoMeta } from '../../hooks/useSeoMeta';
import { toastInfo, toastError, toastExito } from '../../utils/toast';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';

const CATEGORIA_ICONS: Record<string, string> = {
  'Sobre la ciudad': 'bi-bank2',
  Gastronomía: 'bi-egg-fried',
  Monumento: 'bi-building-fill',
  Museos: 'bi-easel2',
};

const LugaresDetalle: React.FC = () => {
  const { id } = useParams();
  const { session } = useAuth();
  const { precacheUrls } = useOfflineStatus();
  const [lugar, setLugar] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [esFavorito, setEsFavorito] = useState(false);

  // ── SEO dinámico (actualiza tags OG con datos del lugar) ──
  useSeoMeta({
    title: lugar ? (lugar.nombre || lugar.nombre_es) : 'Cargando lugar...',
    description: lugar
      ? `${lugar.nombre || lugar.nombre_es} — ${(lugar.descripcion || lugar.descripcion_es || '').slice(0, 140)}...`
      : 'Descubre este lugar en Mérida.',
    image: lugar?.imagen_url,
    type: 'article',
  });

  useEffect(() => {
    fetchLugarData();
    if (session?.user) verificarFavorito();
  }, [id, session]);

  const fetchLugarData = async () => {
    setFetchError(false);
    setCargando(true);
    try {
      const { data, error } = await supabase.from('lugares').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) setLugar(data);
    } catch {
      setFetchError(true);
      toastError('No se pudo cargar el lugar. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const verificarFavorito = async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from('favoritos')
      .select('id')
      .eq('usuario_id', session.user.id)
      .eq('elemento_id', id)
      .maybeSingle();
    if (data) setEsFavorito(true);
  };

  const toggleFavorito = async () => {
    if (!session?.user) {
      toastInfo('Inicia sesión para guardar este lugar entre tus favoritos');
      return;
    }
    try {
      if (esFavorito) {
        await supabase.from('favoritos_lugares').delete()
          .eq('user_id', session.user.id).eq('lugar_id', id);
        setEsFavorito(false);
        toastExito('Lugar eliminado de favoritos');
      } else {
        await supabase.from('favoritos_lugares').insert([{ user_id: session.user.id, lugar_id: id }]);
        setEsFavorito(true);
        toastExito('Lugar guardado en favoritos. Disponible sin conexión');
        // Pre-cachear esta página y su imagen para modo offline
        const urlsToCache: string[] = [`/lugares/${id}`];
        if (lugar?.imagen_url) urlsToCache.push(lugar.imagen_url);
        precacheUrls(urlsToCache);
      }
    } catch (err: any) {
      console.error('Error:', err.message);
      toastError('No se pudo actualizar favoritos.');
    }
  };

  if (cargando) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-brand-dark font-black uppercase tracking-widest text-xs">Descubriendo Mérida...</p>
      </div>
    </div>
  );

  if (fetchError || !lugar) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="text-center max-w-sm mx-auto px-4">
        <div className="w-20 h-20 bg-brand-gold/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
          <i className="bi bi-building-fill text-5xl text-brand-dark/30" />
        </div>
        <h2 className="text-3xl font-black uppercase italic text-brand-dark mb-4">
          {fetchError ? 'Error de conexión' : 'Lugar no encontrado'}
        </h2>
        <p className="text-slate-400 font-medium mb-6">
          {fetchError
            ? 'No se pudo cargar este lugar. Comprueba tu conexión a internet.'
            : 'Este lugar ya no está disponible.'}
        </p>
        <div className="flex gap-3 justify-center">
          {fetchError && (
            <button
              onClick={fetchLugarData}
              className="bg-brand-gold text-brand-dark px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
              aria-label="Reintentar carga del lugar"
            >
              <i className="bi bi-arrow-clockwise mr-2" />Reintentar
            </button>
          )}
          <Link to="/lugares" className="bg-brand-dark text-brand-gold px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all inline-block">
            Ver lugares
          </Link>
        </div>
      </div>
    </div>
  );

  const nombre = lugar.nombre || lugar.nombre_es;
  const descripcion = lugar.descripcion || lugar.descripcion_es;
  const catIcon = CATEGORIA_ICONS[lugar.categoria] ?? 'bi-geo-alt-fill';
  const isGastro = lugar.categoria === 'Gastronomía';

  return (
    <div className="min-h-screen bg-brand-bg">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className="relative h-[55vh] md:h-[80vh] min-h-[400px] w-full overflow-hidden">
        <LazyImg
          src={lugar.imagen_url}
          alt={nombre}
          priority
          className="w-full h-full object-cover"
          wrapperClassName="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" />

        {/* Back button */}
        <Link
          to="/lugares"
          className="absolute top-20 md:top-28 left-4 md:left-20 z-20 flex items-center gap-2 text-white/70 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all group"
        >
          <i className="bi bi-arrow-left group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Volver a lugares</span>
          <span className="sm:hidden">Volver</span>
        </Link>

        <div className="absolute bottom-0 left-0 w-full p-4 md:p-20 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-3 md:mb-6">
              <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-white px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-fit">
                <i className={`bi ${catIcon}`} />
                {lugar.categoria}
              </span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1
                  style={{ fontSize: 'clamp(1.8rem, 7vw, 5rem)' }}
                  className="font-black text-white italic uppercase tracking-tighter leading-[0.9] mb-2 max-w-4xl"
                >
                  {nombre}
                </h1>
                {lugar.ubicacion && (
                  <p className="text-white/50 font-bold text-xs md:text-sm">
                    <i className="bi bi-geo-alt-fill mr-2 text-brand-gold" />
                    {lugar.ubicacion}
                  </p>
                )}
              </div>
              <button
                onClick={toggleFavorito}
                aria-label={esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                aria-pressed={esFavorito}
                className={`w-14 h-14 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-xl md:text-2xl transition-all duration-500 shadow-2xl flex-shrink-0 ${esFavorito
                  ? 'bg-brand-red text-white scale-110'
                  : 'bg-white/10 backdrop-blur-xl text-white border border-white/20 hover:bg-white hover:text-brand-dark'
                  }`}
              >
                <i className={`bi bi-heart${esFavorito ? '-fill' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16">
        {/* Sidebar ticket en móvil: aparece arriba del contenido para no quedar oculto */}
        <div className="lg:hidden mb-8">
          <div className="bg-brand-dark rounded-[2rem] p-7 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-brand-gold font-black uppercase italic tracking-widest text-base mb-5">
                {isGastro ? 'Reservar' : 'Planifica tu visita'}
              </h4>
              <div className="flex flex-wrap gap-4 mb-6">
                {lugar.ubicacion && (
                  <div className="flex items-center gap-3">
                    <i className="bi bi-geo-alt-fill text-brand-gold" />
                    <span className="text-white/70 text-sm font-bold">{lugar.ubicacion}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <i className="bi bi-clock text-white/40" />
                  <span className="text-white/70 text-sm font-bold italic">{isGastro ? 'Consultar en local' : 'Mar–Dom 9:30–18:30 h'}</span>
                </div>
              </div>
              <a
                href={lugar.google_maps_url || `https://www.google.com/maps/search/${encodeURIComponent((lugar.nombre_es || nombre) + ' Mérida')}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full bg-brand-blue text-white py-4 rounded-2xl font-black text-center shadow-lg hover:bg-brand-gold hover:text-brand-dark transition-all uppercase tracking-[0.2em] text-[10px]"
              >
                <i className="bi bi-map mr-2" />Cómo llegar
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
                {isGastro ? 'Sobre el restaurante' : 'Sobre el lugar'}
              </h3>
              <p className="text-brand-dark text-xl font-medium leading-relaxed opacity-80 whitespace-pre-line">
                {descripcion}
              </p>

              {/* Extra info blocks */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                {!isGastro && (
                  <div className="bg-brand-bg rounded-[2rem] p-8 border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-brand-gold/10 rounded-2xl flex items-center justify-center">
                        <i className="bi bi-hourglass-split text-brand-gold text-lg" />
                      </div>
                      <h4 className="font-black text-brand-dark text-[10px] uppercase tracking-widest">Contexto histórico</h4>
                    </div>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                      Fundada en el año 25 a.C. como <em>Augusta Emerita</em>, Mérida fue capital de la provincia romana de Lusitania. Sus monumentos preservados figuran entre los vestigios romanos más completos de Europa, declarados Patrimonio de la Humanidad por la UNESCO en 1993.
                    </p>
                  </div>
                )}

                {isGastro && (
                  <div className="bg-brand-bg rounded-[2rem] p-8 border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-brand-green/10 rounded-2xl flex items-center justify-center">
                        <i className="bi bi-stars text-brand-green text-lg" />
                      </div>
                      <h4 className="font-black text-brand-dark text-[10px] uppercase tracking-widest">Gastronomía extremeña</h4>
                    </div>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                      La cocina extremeña destaca por productos de alta calidad: ibérico de bellota, queso de la Serena, pimentón de la Vera y vinos de la D.O. Ribera del Guadiana. Una experiencia gastronómica auténtica y arraigada en la tradición regional.
                    </p>
                  </div>
                )}

                <div className="bg-brand-bg rounded-[2rem] p-8 border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                      <i className="bi bi-lightbulb-fill text-brand-blue text-lg" />
                    </div>
                    <h4 className="font-black text-brand-dark text-[10px] uppercase tracking-widest">
                      {isGastro ? 'Consejos al visitar' : 'Consejos para la visita'}
                    </h4>
                  </div>
                  <ul className="text-slate-500 text-sm font-medium leading-relaxed space-y-2">
                    {isGastro ? (
                      <>
                        <li className="flex items-start gap-2"><i className="bi bi-check2 text-brand-green mt-0.5" /> Reserva con antelación, especialmente en fin de semana.</li>
                        <li className="flex items-start gap-2"><i className="bi bi-check2 text-brand-green mt-0.5" /> Prueba el menú del día para disfrutar de platos locales a mejor precio.</li>
                        <li className="flex items-start gap-2"><i className="bi bi-check2 text-brand-green mt-0.5" /> Pregunta por los productos de temporada y denominación de origen.</li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start gap-2"><i className="bi bi-check2 text-brand-green mt-0.5" /> Visítalo por la mañana para evitar aglomeraciones.</li>
                        <li className="flex items-start gap-2"><i className="bi bi-check2 text-brand-green mt-0.5" /> Lleva calzado cómodo: los suelos históricos son irregulares.</li>
                        <li className="flex items-start gap-2"><i className="bi bi-check2 text-brand-green mt-0.5" /> Descarga la app de audioguías del Consorcio de Mérida.</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* Accessibility block */}
              <div className="mt-6 bg-brand-dark rounded-[2rem] p-8 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <i className="bi bi-universal-access text-brand-gold text-xl" />
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-white/80">Accesibilidad</h4>
                </div>
                <p className="text-white/60 text-sm font-medium leading-relaxed">
                  {isGastro
                    ? 'El local cuenta con acceso a nivel de calle. Consulta con el establecimiento si necesitas asistencia especial para tu visita.'
                    : 'Los monumentos del conjunto arqueológico de Mérida disponen de itinerarios adaptados para personas con movilidad reducida. Algunos espacios pueden presentar desniveles propios de su antigüedad histórica.'}
                </p>
              </div>
            </div>

            {/* Quick info chips */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: 'bi-geo-alt-fill', label: 'Dirección', value: lugar.ubicacion || 'Mérida, Extremadura', color: 'text-brand-blue' },
                { icon: 'bi-tag-fill', label: 'Categoría', value: lugar.categoria, color: 'text-brand-gold' },
                { icon: 'bi-clock-history', label: isGastro ? 'Tipo de cocina' : 'Época', value: isGastro ? 'Cocina extremeña' : 'Época romana · S. I a.C.', color: 'text-brand-green' },
              ].map((chip) => (
                <div key={chip.label} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <i className={`bi ${chip.icon} ${chip.color} text-2xl mb-3 block`} />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{chip.label}</p>
                  <p className="font-black text-brand-dark text-sm leading-tight">{chip.value}</p>
                </div>
              ))}
            </div>

            {/* Gallery placeholder — if we had multiple images */}
            <div className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm">
              <img
                src={lugar.imagen_url}
                alt={nombre}
                className="w-full h-64 object-cover"
              />
              <div className="p-8">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">
                  {nombre} · Mérida, Extremadura
                </p>
              </div>
            </div>

          </div>

          {/* ── SIDEBAR ─── */}
          <div className="lg:col-span-1">
            <div className="ticket-sidebar sticky top-28">
              <div className="relative z-10">
                <h4 className="text-brand-gold font-black uppercase italic tracking-widest text-lg mb-8">
                  {isGastro ? 'Reservar' : 'Planifica tu visita'}
                </h4>

                <div className="space-y-5 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center">
                      <i className="bi bi-ticket-perforated text-brand-gold text-xl" />
                    </div>
                    <div>
                      <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Entrada</p>
                      <p className="font-bold text-white text-sm italic">
                        {isGastro ? 'Sin reserva obligatoria' : 'Acceso libre / Gratuito'}
                      </p>
                    </div>
                  </div>

                  {lugar.ubicacion && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                        <i className="bi bi-geo-alt-fill text-brand-blue text-xl" />
                      </div>
                      <div>
                        <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Dirección</p>
                        <p className="font-bold text-white text-sm">{lugar.ubicacion}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <i className="bi bi-clock text-white/60 text-xl" />
                    </div>
                    <div>
                      <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Horario</p>
                      <p className="font-bold text-white text-sm italic">
                        {isGastro ? 'Consultar en local' : 'Mar–Dom 9:30–18:30 h'}
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={lugar.google_maps_url || `https://www.google.com/maps/search/${encodeURIComponent((lugar.nombre_es || nombre) + ' Mérida')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full bg-brand-blue text-white py-5 rounded-[1.5rem] font-black text-center shadow-lg hover:bg-brand-gold hover:text-brand-dark transition-all uppercase tracking-[0.2em] text-[10px] mb-4"
                >
                  <i className="bi bi-map mr-2" />
                  Cómo llegar
                </a>

                {isGastro && (
                  <a
                    href={lugar.google_maps_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full bg-white/10 text-white border border-white/20 py-4 rounded-[1.5rem] font-black text-center hover:bg-white/20 transition-all uppercase tracking-[0.2em] text-[10px]"
                  >
                    <i className="bi bi-telephone mr-2" />
                    Llamar para reservar
                  </a>
                )}
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-blue/10 rounded-full blur-3xl" />
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-red/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LugaresDetalle;