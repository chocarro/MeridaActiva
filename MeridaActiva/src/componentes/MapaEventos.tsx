import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useSeoMeta } from '../hooks/useSeoMeta';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

// ── Fix Leaflet default icon ──────────────────────────────────────
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Tipos ────────────────────────────────────────────────────────
interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string | null;
  ubicacion: string;
  imagen_url: string | null;
  categoria: string;
  precio: string | null;
  latitud: number;
  longitud: number;
  animales_permitidos?: boolean | null;
}

interface Lugar {
  id: string;
  nombre_es: string;
  descripcion_es: string;
  ubicacion: string;
  imagen_url: string | null;
  categoria: string;
  google_maps_url: string | null;
  latitud: number | null;
  longitud: number | null;
  animales_permitidos?: boolean | null;
}

// ── Colores por categoría ─────────────────────────────────────────
const COLORS_EVENTOS: Record<string, string> = {
  Cultural: '#032B43',
  Música:   '#3F88C5',
  Teatro:   '#D00000',
  default:  '#6B7280',
};

const COLORS_LUGARES: Record<string, string> = {
  'Gastronomía': '#16a34a',
  'Actividades':  '#0891b2',
  'Sobre la ciudad': '#032B43',
  default:        '#6B7280',
};

function getColor(categoria: string, tipo: 'evento' | 'lugar'): string {
  const map = tipo === 'evento' ? COLORS_EVENTOS : COLORS_LUGARES;
  // Búsqueda exacta primero, luego case-insensitive
  if (map[categoria]) return map[categoria];
  const key = Object.keys(map).find(
    k => k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ===
         categoria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  );
  return key ? map[key] : map['default'];
}

function crearIcono(categoria: string, tipo: 'evento' | 'lugar') {
  const color = getColor(categoria, tipo);
  const inner = tipo === 'lugar'
    ? `<rect x="11" y="9" width="14" height="14" rx="2" fill="white" opacity="0.9"/>`
    : `<circle cx="18" cy="16" r="7" fill="white" opacity="0.9"/>`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <ellipse cx="18" cy="41" rx="7" ry="3" fill="rgba(0,0,0,0.15)"/>
      <path d="M18 0C9.163 0 2 7.163 2 16c0 10.55 14.5 26 15.1 26.7a1.2 1.2 0 001.8 0C19.5 42 34 26.55 34 16 34 7.163 26.837 0 18 0z" fill="${color}"/>
      ${inner}
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
}

// ── Centrar mapa al seleccionar marcador ──────────────────────────
function MapCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15, { animate: true });
  }, [lat, lng, map]);
  return null;
}

// ── Capas del mapa ────────────────────────────────────────────────
const CAPAS = [
  { id: 'light',  label: 'Claro',   url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' },
  { id: 'dark',   label: 'Oscuro',  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
  { id: 'osm',    label: 'Mapa',    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
];

// ── Categorías de eventos (alineadas con la BD) ───────────────────
const CATS_EVENTOS = ['Todos', 'Cultural', 'Música', 'Teatro'];
const CATS_LUGARES = ['Todos', 'Gastronomía', 'Actividades', 'Sobre la ciudad'];
// ── Helper: formatear fecha ───────────────────────────────────────
function formatFecha(fecha: string) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── Skeleton fila lista ───────────────────────────────────────────
function SkeletonFila() {
  return (
    <div className="px-6 py-4 border-b border-slate-50 flex gap-4 items-start animate-pulse">
      <div className="w-14 h-14 rounded-2xl bg-slate-200 flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-slate-200 rounded-full w-16" />
        <div className="h-4 bg-slate-200 rounded-full w-full" />
        <div className="h-3 bg-slate-200 rounded-full w-2/3" />
      </div>
    </div>
  );
}

// ── Helpers de fetch paginado (fuera del componente) ─────────────
async function fetchTodosEventos(hoy: string): Promise<Evento[]> {
  const PAGE = 1000;
  let pagina = 0;
  let acumulados: Evento[] = [];
  let hayMas = true;
  while (hayMas) {
    const { data, error } = await supabase
      .from('eventos')
      .select('id, titulo, descripcion, fecha, hora, ubicacion, imagen_url, categoria, precio, latitud, longitud')
      .gte('fecha', hoy)
      .order('fecha', { ascending: true })
      .range(pagina * PAGE, (pagina + 1) * PAGE - 1);
    if (error || !data) break;
    acumulados = [...acumulados, ...(data as Evento[])];
    hayMas = data.length === PAGE;
    pagina++;
  }
  return acumulados;
}

async function fetchTodosLugares(): Promise<Lugar[]> {
  const PAGE = 1000;
  let pagina = 0;
  let acumulados: Lugar[] = [];
  let hayMas = true;
  while (hayMas) {
    const { data, error } = await supabase
      .from('lugares')
      .select('id, nombre_es, descripcion_es, ubicacion, imagen_url, categoria, google_maps_url, latitud, longitud')
      .order('nombre_es', { ascending: true })
      .range(pagina * PAGE, (pagina + 1) * PAGE - 1);
    if (error || !data) break;
    acumulados = [...acumulados, ...(data as Lugar[])];
    hayMas = data.length === PAGE;
    pagina++;
  }
  return acumulados;
}

// ════════════════════════════════════════════════════════════════
const MapaEventos: React.FC = () => {
  const { session } = useAuth();
  useSeoMeta({
    title: 'Mapa de Eventos y Lugares — MeridaActiva',
    description: 'Explora en el mapa interactivo todos los eventos, monumentos y lugares de interés de Mérida. Teatro Romano, Anfiteatro, festivales y mucho más.',
  });

  const [tab, setTab] = useState<'eventos' | 'lugares'>('eventos');
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [loadingLugares, setLoadingLugares] = useState(true);

  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
const [capaActiva, setCapaActiva] = useState('light');

  const [seleccionado, setSeleccionado] = useState<Evento | Lugar | null>(null);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [centroMapa, setCentroMapa] = useState<{ lat: number; lng: number } | null>(null);

  // ── Carga de datos (paginada para traer todos los registros) ────
  useEffect(() => {
    const loadEventos = async () => {
      setLoadingEventos(true);
      const hoy = new Date().toISOString().split('T')[0];
      const data = await fetchTodosEventos(hoy);
      setEventos(data.filter(ev => ev.latitud && ev.longitud));
      setLoadingEventos(false);
    };

    const loadLugares = async () => {
      setLoadingLugares(true);
      const data = await fetchTodosLugares();
      setLugares(data.filter(l => l.latitud && l.longitud));
      setLoadingLugares(false);
    };

    loadEventos();
    loadLugares();
  }, []);

  const loading = tab === 'eventos' ? loadingEventos : loadingLugares;

  // ── Filtrado ───────────────────────────────────────────────────
  const eventosFiltrados = eventos.filter(ev => {
    const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const matchCat = categoriaActiva === 'Todos' || normalize(ev.categoria) === normalize(categoriaActiva);
    const matchBusq = !busqueda.trim() || ev.titulo?.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusq;
  });

  const lugaresFiltrados = lugares.filter(l => {
    const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const matchCat = categoriaActiva === 'Todos' || normalize(l.categoria) === normalize(categoriaActiva);
    const matchBusq = !busqueda.trim() || l.nombre_es?.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusq;
  });

  const itemsFiltrados = tab === 'eventos' ? eventosFiltrados : lugaresFiltrados;
  const totalFiltrados = itemsFiltrados.length;

  const capaUrl = CAPAS.find(c => c.id === capaActiva)?.url ?? CAPAS[0].url;
  const categorias = tab === 'eventos' ? CATS_EVENTOS : CATS_LUGARES;

  const handleClick = useCallback((item: Evento | Lugar) => {
    const lat = 'latitud' in item ? item.latitud : null;
    const lng = 'longitud' in item ? item.longitud : null;
    setSeleccionado(item);
    setPanelAbierto(true);
    if (lat && lng) setCentroMapa({ lat, lng });
  }, []);

  const cerrarPanel = () => { setPanelAbierto(false); setSeleccionado(null); };

  const isEvento = (item: Evento | Lugar | null): item is Evento => !!item && 'titulo' in item;
  const isLugar  = (item: Evento | Lugar | null): item is Lugar  => !!item && 'nombre_es' in item;

  // ── Cambiar tab resetea filtros ────────────────────────────────
  const cambiarTab = (t: 'eventos' | 'lugares') => {
    setTab(t);
    setCategoriaActiva('Todos');
    setBusqueda('');
    cerrarPanel();
  };

  return (
    <div className="min-h-screen bg-brand-bg overflow-x-hidden relative">
      {/* Decorative thread — full page background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img src="/Imagenes/hilo-decorativo-azul.jpg" alt="" className="w-full h-full object-cover opacity-[0.04] select-none" aria-hidden="true" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      </div>

      {/* ── HERO ── */}
      <header className="relative z-10 h-72 md:h-96 flex items-end justify-start overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/Imagenes/teatro-edited.webp"
            alt="Mapa de Mérida"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12 w-full">
          <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-3 block">
            <i className="bi bi-geo-alt-fill mr-2" />
            Explora la ciudad
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
            Mérida en el <span className="text-brand-gold">Mapa</span>
          </h1>
          <p className="text-white/60 font-medium max-w-lg">
            Todos los eventos y monumentos de Mérida en un solo mapa interactivo.
          </p>
        </div>
      </header>

      {/* ── BANNER IA ── */}
      <div className="bg-brand-dark border-b border-white/5 relative z-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <img alt="" className="w-full h-full object-cover opacity-[0.08] select-none" aria-hidden="true" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="bi bi-map text-brand-gold text-sm" />
            </div>
            <p className="text-white/70 text-sm font-medium">
              <span className="text-brand-gold font-black">Mapa interactivo</span> — Eventos y monumentos de Mérida en tiempo real
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link to={session ? '/rutas' : '/login'} className="inline-flex items-center gap-2 bg-brand-gold text-brand-dark px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all">
              <i className="bi bi-stars text-xs" />
              Crear Ruta
            </Link>
            <Link to={session ? '/faq' : '/login'} className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all">
              <i className="bi bi-robot text-xs" />
              Chat IA
            </Link>
          </div>
        </div>
      </div>

      {/* ── FILTROS Y CONTENIDO ── */}
      <div className="pb-6 px-4 pt-6 relative z-10">
        <div className="max-w-7xl mx-auto">

          {/* ── Tabs Eventos / Lugares ── */}
          <div className="flex justify-center gap-3 mb-6">
            {(['eventos', 'lugares'] as const).map(t => (
              <button
                key={t}
                onClick={() => cambiarTab(t)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  tab === t ? 'bg-brand-dark text-brand-gold shadow-lg' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                }`}
              >
                <i className={`bi ${t === 'eventos' ? 'bi-calendar-event-fill' : 'bi-geo-alt-fill'}`} />
                {t === 'eventos' ? 'Eventos' : 'Lugares'}
              </button>
            ))}
          </div>

          {/* ── Buscador y filtros ── */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
            {/* Buscador */}
            <div className="relative w-full md:w-64 flex-shrink-0">
              <i className="bi bi-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={tab === 'eventos' ? 'Buscar evento…' : 'Buscar lugar…'}
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-brand-blue/20 text-sm font-medium text-brand-dark"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-dark transition-colors"
                >
                  <i className="bi bi-x-circle-fill text-sm" />
                </button>
              )}
            </div>

            {/* Filtros categoría */}
            <div className="flex gap-2 flex-wrap justify-center flex-1">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaActiva(cat)}
                  className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all capitalize ${
                    categoriaActiva === cat
                      ? 'bg-brand-dark text-brand-gold shadow-lg'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          {/* Capas del mapa — selector compacto */}
<div className="relative flex-shrink-0">
  <i className="bi bi-layers-fill absolute left-4 top-1/2 -translate-y-1/2 text-brand-blue pointer-events-none text-sm" />
  <select
    value={capaActiva}
    onChange={e => setCapaActiva(e.target.value)}
    className="pl-10 pr-8 py-3.5 rounded-2xl bg-slate-100 border-none outline-none focus:ring-2 focus:ring-brand-blue/20 text-[10px] font-black uppercase tracking-widest text-slate-600 appearance-none cursor-pointer hover:bg-slate-200 transition-colors"
  >
    {CAPAS.map(capa => (
      <option key={capa.id} value={capa.id}>{capa.label}</option>
    ))}
  </select>
  <i className="bi bi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs" />
</div>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="flex-1 px-4 pb-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 h-[620px]">

          {/* ── Panel lateral lista ── */}
          <div className="lg:w-80 flex-shrink-0 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-brand-dark uppercase tracking-widest text-[10px]">
                  {tab === 'eventos' ? 'Eventos' : 'Lugares'}
                </h3>
                <p className="text-slate-400 text-xs font-medium mt-0.5">
                  {totalFiltrados} resultado{totalFiltrados !== 1 ? 's' : ''}
                </p>
              </div>
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="text-[9px] font-black uppercase tracking-widest text-brand-blue hover:text-brand-dark transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonFila key={i} />)
              ) : totalFiltrados === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-3 flex items-center justify-center">
                    <i className="bi bi-map text-slate-400 text-4xl" />
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sin resultados</p>
                  <button
                    onClick={() => { setBusqueda(''); setCategoriaActiva('Todos'); }}
                    className="mt-4 text-[9px] font-black uppercase tracking-widest text-brand-blue hover:text-brand-dark transition-colors"
                  >
                    Ver todos
                  </button>
                </div>
              ) : tab === 'eventos' ? (
                eventosFiltrados.map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => handleClick(ev)}
                    className={`w-full text-left px-6 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-4 items-start ${
                      isEvento(seleccionado) && seleccionado.id === ev.id
                        ? 'bg-brand-blue/5 border-l-4 border-l-brand-blue'
                        : ''
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100">
                      {ev.imagen_url ? (
                        <img src={ev.imagen_url} alt={ev.titulo} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <i className="bi bi-calendar-event text-xl" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span
                        className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg inline-block mb-1"
                        style={{ backgroundColor: `${getColor(ev.categoria, 'evento')}20`, color: getColor(ev.categoria, 'evento') }}
                      >
                        {ev.categoria}
                      </span>
                      <h4 className="text-xs font-black text-brand-dark uppercase italic tracking-tight leading-tight line-clamp-2">
                        {ev.titulo}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                        <i className="bi bi-calendar3" />
                        {new Date(ev.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        {ev.hora && ` · ${ev.hora}`}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                lugaresFiltrados.map(l => (
                  <button
                    key={l.id}
                    onClick={() => handleClick(l)}
                    className={`w-full text-left px-6 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-4 items-start ${
                      isLugar(seleccionado) && seleccionado.id === l.id
                        ? 'bg-brand-gold/5 border-l-4 border-l-brand-gold'
                        : ''
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100">
                      {l.imagen_url ? (
                        <img src={l.imagen_url} alt={l.nombre_es} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <i className="bi bi-geo-alt text-xl" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span
                        className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg inline-block mb-1"
                        style={{ backgroundColor: `${getColor(l.categoria, 'lugar')}20`, color: getColor(l.categoria, 'lugar') }}
                      >
                        {l.categoria}
                      </span>
                      <h4 className="text-xs font-black text-brand-dark uppercase italic tracking-tight leading-tight line-clamp-2">
                        {l.nombre_es}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold mt-1 flex items-center gap-1 truncate">
                        <i className="bi bi-geo-alt-fill" />
                        {l.ubicacion}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Mapa ── */}
          <div className="flex-1 relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white min-h-[400px]">
            <MapContainer
              center={[38.9161, -6.3437]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer url={capaUrl} />
              {centroMapa && <MapCenter lat={centroMapa.lat} lng={centroMapa.lng} />}

              {/* Marcadores eventos */}
              {tab === 'eventos' && eventosFiltrados.map(ev => (
                <Marker
                  key={ev.id}
                  position={[ev.latitud, ev.longitud]}
                  icon={crearIcono(ev.categoria, 'evento')}
                  eventHandlers={{ click: () => handleClick(ev) }}
                >
                  <Popup>
                    <div className="p-3 text-center min-w-[190px]">
                      {ev.imagen_url && (
                        <img src={ev.imagen_url} alt={ev.titulo} className="w-full h-24 object-cover rounded-xl mb-3" />
                      )}
                      <h3 className="text-sm font-[900] text-brand-dark uppercase italic mb-1 leading-tight">
                        {ev.titulo}
                      </h3>
                      <p className="text-[9px] font-black text-brand-blue uppercase tracking-widest mb-1">
                        <i className="bi bi-geo-alt-fill" /> {ev.ubicacion}
                      </p>
                      {ev.fecha && (
                        <p className="text-[9px] font-bold text-slate-400 mb-1">
                          <i className="bi bi-calendar3 mr-1" /> {new Date(ev.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          {ev.hora && ` · ${ev.hora}`}
                        </p>
                      )}
                      {ev.precio && (
                        <p className="text-[9px] font-bold text-emerald-600 mb-3">
                          <i className="bi bi-ticket-perforated mr-1" /> {ev.precio}
                        </p>
                      )}
                      <Link
                        to={`/eventos/${ev.id}`}
                        className="block bg-brand-dark text-white text-[9px] font-black py-2 rounded-xl hover:bg-brand-gold hover:text-brand-dark transition-all no-underline tracking-widest uppercase"
                      >
                        Ver detalles →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Marcadores lugares */}
              {tab === 'lugares' && lugaresFiltrados.map(l => l.latitud && l.longitud ? (
                <Marker
                  key={l.id}
                  position={[l.latitud, l.longitud]}
                  icon={crearIcono(l.categoria, 'lugar')}
                  eventHandlers={{ click: () => handleClick(l) }}
                >
                  <Popup>
                    <div className="p-3 text-center min-w-[190px]">
                      {l.imagen_url && (
                        <img src={l.imagen_url} alt={l.nombre_es} className="w-full h-24 object-cover rounded-xl mb-3" />
                      )}
                      <h3 className="text-sm font-[900] text-brand-dark uppercase italic mb-1 leading-tight">
                        {l.nombre_es}
                      </h3>
                      <p className="text-[9px] font-black text-brand-blue uppercase tracking-widest mb-3">
                        <i className="bi bi-geo-alt-fill" /> {l.ubicacion}
                      </p>
                      <Link
                        to={`/lugares/${l.id}`}
                        className="block bg-brand-dark text-white text-[9px] font-black py-2 rounded-xl hover:bg-brand-gold hover:text-brand-dark transition-all no-underline tracking-widest uppercase"
                      >
                        Ver detalles →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ) : null)}
            </MapContainer>

            {/* Badge flotante */}
            <div className="absolute bottom-6 left-6 z-[1000] bg-brand-dark text-white px-6 py-4 rounded-[1.5rem] shadow-2xl border border-white/10">
              <p className="text-[8px] font-black text-brand-gold uppercase tracking-[0.2em] mb-0.5">Radar Activo</p>
              <p className="text-lg font-[900] italic uppercase tracking-tighter">
                {totalFiltrados} <span className="text-brand-blue">{tab === 'eventos' ? 'Eventos' : 'Lugares'}</span>
              </p>
            </div>

            {/* Leyenda */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md rounded-[1.5rem] p-4 shadow-xl border border-slate-100">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-3">Categorías</p>
              <div className="space-y-1.5">
                {Object.entries(tab === 'eventos' ? COLORS_EVENTOS : COLORS_LUGARES)
                  .filter(([k]) => k !== 'default')
                  .map(([cat, color]) => (
                    <div key={cat} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[9px] font-black text-brand-dark uppercase tracking-widest capitalize">{cat}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Panel Detalle slide-in ── */}
      {panelAbierto && seleccionado && (
        <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center md:justify-end pointer-events-none">
          <div className="pointer-events-auto w-full md:w-[420px] md:h-full md:max-h-screen md:overflow-y-auto bg-white md:rounded-none rounded-t-[2.5rem] shadow-2xl border-t md:border-l border-slate-100 p-8 animate-in slide-in-from-bottom duration-300 md:slide-in-from-right">

            {/* Cerrar */}
            <button
              onClick={cerrarPanel}
              className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all"
            >
              <i className="bi bi-x-lg text-sm font-black" />
            </button>

            {/* Imagen */}
            {(isEvento(seleccionado) ? seleccionado.imagen_url : seleccionado.imagen_url) && (
              <img
                src={(seleccionado as Evento | Lugar).imagen_url!}
                alt={isEvento(seleccionado) ? seleccionado.titulo : seleccionado.nombre_es}
                className="w-full h-52 object-cover rounded-[1.5rem] mb-6"
              />
            )}

            {/* Badge categoría */}
            <span
              className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl inline-block mb-4"
              style={{
                backgroundColor: `${getColor(seleccionado.categoria, tab === 'eventos' ? 'evento' : 'lugar')}20`,
                color: getColor(seleccionado.categoria, tab === 'eventos' ? 'evento' : 'lugar'),
              }}
            >
              {seleccionado.categoria}
            </span>

            {/* Título */}
            <h2 className="text-2xl font-black text-brand-dark uppercase italic tracking-tighter mb-4 leading-tight">
              {isEvento(seleccionado) ? seleccionado.titulo : seleccionado.nombre_es}
            </h2>

            {/* Datos */}
            <div className="space-y-3 mb-6">
              {/* Ubicación */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-brand-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="bi bi-geo-alt-fill text-brand-blue text-sm" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ubicación</p>
                  <p className="text-sm font-bold text-brand-dark">
                    {isEvento(seleccionado) ? seleccionado.ubicacion : seleccionado.ubicacion}
                  </p>
                </div>
              </div>

              {/* Fecha + hora (solo eventos) */}
              {isEvento(seleccionado) && seleccionado.fecha && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-brand-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="bi bi-calendar-event-fill text-brand-gold text-sm" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha</p>
                    <p className="text-sm font-bold text-brand-dark capitalize">
                      {formatFecha(seleccionado.fecha)}
                      {seleccionado.hora && (
                        <span className="text-brand-blue"> · {seleccionado.hora}</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Precio (solo eventos) */}
              {isEvento(seleccionado) && seleccionado.precio && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="bi bi-tag-fill text-emerald-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Precio</p>
                    <p className="text-sm font-bold text-brand-dark">{seleccionado.precio}</p>
                  </div>
                </div>
              )}

              {/* Google Maps (solo lugares) */}
              {isLugar(seleccionado) && seleccionado.google_maps_url && (
                <a
                  href={seleccionado.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group"
                >
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                    <i className="bi bi-map-fill text-red-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Google Maps</p>
                    <p className="text-sm font-bold text-brand-blue group-hover:text-brand-dark transition-colors">
                      Abrir en Maps →
                    </p>
                  </div>
                </a>
              )}
            </div>

            {/* Descripción */}
            <p className="text-slate-500 text-sm leading-relaxed font-medium mb-8 line-clamp-4">
              {isEvento(seleccionado) ? seleccionado.descripcion : seleccionado.descripcion_es}
            </p>

            {/* CTA */}
            <Link
              to={`/${tab === 'eventos' ? 'eventos' : 'lugares'}/${seleccionado.id}`}
              className="block w-full bg-brand-dark text-brand-gold py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-center hover:bg-brand-blue hover:text-white transition-all shadow-lg"
            >
              Ver página completa →
            </Link>
          </div>
        </div>
      )}

      {/* Backdrop panel mobile */}
      {panelAbierto && (
        <div
          className="fixed inset-0 z-[1999] bg-black/30 backdrop-blur-sm md:hidden"
          onClick={cerrarPanel}
        />
      )}

      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 1.5rem !important;
          padding: 4px !important;
          border: 1px solid #f1f5f9;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12) !important;
        }
        .leaflet-popup-tip { display: none; }
        .leaflet-container { font-family: inherit; }
        .leaflet-control-zoom { border-radius: 1rem !important; overflow: hidden; }
        .leaflet-control-attribution { display: none !important; }
      `}</style>
    </div>
  );
};

export default MapaEventos;