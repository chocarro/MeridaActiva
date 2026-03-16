import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';
import L from 'leaflet';


// ── Fix Leaflet default icon ──────────────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Iconos de categoría ───────────────────────────────────────────────────────
const COLORS: Record<string, string> = {
  Cultural: '#032B43',
  Música: '#3F88C5',
  Teatro: '#D00000',
  'Sobre la ciudad': '#FFBA08',
  Gastronomía: '#16a34a',
  default: '#6B7280',
};

function crearIcono(categoria: string) {
  const color = COLORS[categoria] ?? COLORS.default;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <ellipse cx="18" cy="41" rx="7" ry="3" fill="rgba(0,0,0,0.15)"/>
      <path d="M18 0C9.163 0 2 7.163 2 16c0 10.55 14.5 26 15.1 26.7a1.2 1.2 0 001.8 0C19.5 42 34 26.55 34 16 34 7.163 26.837 0 18 0z" fill="${color}"/>
      <circle cx="18" cy="16" r="7" fill="white" opacity="0.9"/>
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

// ── Subcomponente para centrar mapa ──────────────────────────────────────────
function MapCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15, { animate: true });
  }, [lat, lng, map]);
  return null;
}

// ── Tipos de capas del mapa ──────────────────────────────────────────────────
const CAPAS = [
  { id: 'light', label: 'Luminoso', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' },
  { id: 'dark', label: 'Oscuro', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
  { id: 'osm', label: 'Satélite', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
];

const CATEGORIAS = ['Todos', 'Cultural', 'Música', 'Teatro', 'Sobre la ciudad', 'Gastronomía'];

// ════════════════════════════════════════════════════════════════════════════
const MapaEventos: React.FC = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [capaActiva, setCapaActiva] = useState('light');
  const [eventoSeleccionado, setEventoSeleccionado] = useState<any | null>(null);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [centroMapa, setCentroMapa] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const fetchEventos = async () => {
      setLoading(true);
      const { data } = await supabase.from('eventos').select('*');
      if (data) setEventos(data.filter((ev) => ev.latitud && ev.longitud));
      setLoading(false);
    };
    fetchEventos();
  }, []);

  // Filtrado
  const eventosFiltrados = eventos.filter((ev) => {
    const matchCat = categoriaActiva === 'Todos' || ev.categoria === categoriaActiva;
    const matchBusq = !busqueda.trim() || ev.titulo?.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusq;
  });

  const capaUrl = CAPAS.find((c) => c.id === capaActiva)?.url ?? CAPAS[0].url;

  const handleEventoClick = (ev: any) => {
    setEventoSeleccionado(ev);
    setPanelAbierto(true);
    setCentroMapa({ lat: ev.latitud, lng: ev.longitud });
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* ── CABECERA ── */}
      <div className="pt-28 pb-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-xs mb-3 block">
              Explora la ciudad
            </span>
            <h1 className="text-5xl md:text-7xl font-[900] text-brand-dark italic uppercase tracking-tighter">
              Mérida en el <span className="text-brand-blue">Mapa</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">
              {loading ? 'Cargando eventos…' : `${eventosFiltrados.length} evento${eventosFiltrados.length !== 1 ? 's' : ''} en el mapa`}
            </p>
          </div>

          {/* ── Buscador y filtros ── */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
            {/* Buscador */}
            <div className="relative w-full md:w-64">
              <i className="bi bi-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar evento…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-brand-blue/20 text-sm font-medium text-brand-dark"
              />
            </div>

            {/* Filtros categoría */}
            <div className="flex gap-2 flex-wrap justify-center flex-1">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaActiva(cat)}
                  className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${categoriaActiva === cat
                    ? 'bg-brand-dark text-brand-gold shadow-lg'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Capas del mapa */}
            <div className="flex gap-2 flex-shrink-0">
              {CAPAS.map((capa) => (
                <button
                  key={capa.id}
                  onClick={() => setCapaActiva(capa.id)}
                  title={capa.label}
                  className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${capaActiva === capa.id
                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                >
                  {capa.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL: Mapa + Panel ── */}
      <div className="flex-1 px-4 pb-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 h-[620px]">

          {/* ── Panel lateral de eventos ── */}
          <div className="lg:w-80 flex-shrink-0 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-black text-brand-dark uppercase tracking-widest text-[10px]">
                Lista de Eventos
              </h3>
              <p className="text-slate-400 text-xs font-medium mt-1">
                {eventosFiltrados.length} resultado{eventosFiltrados.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <svg className="animate-spin w-8 h-8 text-brand-blue" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </div>
              ) : eventosFiltrados.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-3">🗺️</div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sin resultados</p>
                </div>
              ) : (
                eventosFiltrados.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => handleEventoClick(ev)}
                    className={`w-full text-left px-6 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-4 items-start ${eventoSeleccionado?.id === ev.id ? 'bg-brand-blue/5 border-l-4 border-l-brand-blue' : ''
                      }`}
                  >
                    {ev.imagen_url && (
                      <img
                        src={ev.imagen_url}
                        alt={ev.titulo}
                        className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <span
                        className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg inline-block mb-1"
                        style={{ backgroundColor: `${COLORS[ev.categoria] ?? COLORS.default}20`, color: COLORS[ev.categoria] ?? COLORS.default }}
                      >
                        {ev.categoria}
                      </span>
                      <h4 className="text-xs font-black text-brand-dark uppercase italic tracking-tight leading-tight line-clamp-2">
                        {ev.titulo}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                        <i className="bi bi-geo-alt-fill" />
                        {ev.ubicacion}
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

              {eventosFiltrados.map((ev) => (
                <Marker
                  key={ev.id}
                  position={[ev.latitud, ev.longitud]}
                  icon={crearIcono(ev.categoria)}
                  eventHandlers={{ click: () => handleEventoClick(ev) }}
                >
                  <Popup>
                    <div className="p-3 text-center min-w-[180px]">
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
                        <p className="text-[9px] font-bold text-slate-400 mb-3">
                          📅 {new Date(ev.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
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
            </MapContainer>

            {/* Badge flotante */}
            <div className="absolute bottom-6 left-6 z-[1000] bg-brand-dark text-white px-6 py-4 rounded-[1.5rem] shadow-2xl border border-white/10">
              <p className="text-[8px] font-black text-brand-gold uppercase tracking-[0.2em] mb-0.5">Radar Activo</p>
              <p className="text-lg font-[900] italic uppercase tracking-tighter">
                {eventosFiltrados.length} <span className="text-brand-blue">Eventos</span>
              </p>
            </div>

            {/* Leyenda de colores */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md rounded-[1.5rem] p-4 shadow-xl border border-slate-100">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-3">Categorías</p>
              <div className="space-y-2">
                {Object.entries(COLORS).filter(([k]) => k !== 'default').map(([cat, color]) => (
                  <div key={cat} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[9px] font-black text-brand-dark uppercase tracking-widest">{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Panel Detalle Evento (slide-in) ── */}
      {panelAbierto && eventoSeleccionado && (
        <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center md:justify-end pointer-events-none">
          <div className="pointer-events-auto w-full md:w-[420px] md:h-full md:max-h-screen md:overflow-y-auto bg-white md:rounded-none rounded-t-[2.5rem] shadow-2xl border-t md:border-l border-slate-100 p-8 animate-in slide-in-from-bottom duration-300 md:slide-in-from-right">
            {/* Cerrar */}
            <button
              onClick={() => { setPanelAbierto(false); setEventoSeleccionado(null); }}
              className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center hover:bg-brand-red hover:text-white transition-all"
            >
              <i className="bi bi-x-lg text-sm font-black" />
            </button>

            {eventoSeleccionado.imagen_url && (
              <img
                src={eventoSeleccionado.imagen_url}
                alt={eventoSeleccionado.titulo}
                className="w-full h-52 object-cover rounded-[1.5rem] mb-6"
              />
            )}

            <span
              className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl inline-block mb-4"
              style={{
                backgroundColor: `${COLORS[eventoSeleccionado.categoria] ?? COLORS.default}20`,
                color: COLORS[eventoSeleccionado.categoria] ?? COLORS.default,
              }}
            >
              {eventoSeleccionado.categoria}
            </span>

            <h2 className="text-2xl font-black text-brand-dark uppercase italic tracking-tighter mb-4 leading-tight">
              {eventoSeleccionado.titulo}
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-brand-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="bi bi-geo-alt-fill text-brand-blue text-sm" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ubicación</p>
                  <p className="text-sm font-bold text-brand-dark">{eventoSeleccionado.ubicacion}</p>
                </div>
              </div>
              {eventoSeleccionado.fecha && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-brand-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="bi bi-calendar-event-fill text-brand-gold text-sm" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha</p>
                    <p className="text-sm font-bold text-brand-dark">
                      {new Date(eventoSeleccionado.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}
              {eventoSeleccionado.precio !== null && eventoSeleccionado.precio !== undefined && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="bi bi-tag-fill text-emerald-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Precio</p>
                    <p className="text-sm font-bold text-brand-dark">
                      {eventoSeleccionado.precio === 0 ? 'Entrada gratuita' : `${eventoSeleccionado.precio} €`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {eventoSeleccionado.descripcion && (
              <p className="text-slate-500 text-sm leading-relaxed font-medium mb-8 line-clamp-4">
                {eventoSeleccionado.descripcion}
              </p>
            )}

            <Link
              to={`/eventos/${eventoSeleccionado.id}`}
              className="block w-full bg-brand-dark text-brand-gold py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-center hover:bg-brand-blue hover:text-white transition-all shadow-lg"
            >
              Ver página del evento →
            </Link>
          </div>
        </div>
      )}

      {/* Backdrop panel */}
      {panelAbierto && (
        <div
          className="fixed inset-0 z-[1999] bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => { setPanelAbierto(false); setEventoSeleccionado(null); }}
        />
      )}

      <div className="mt-16">

      </div>

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
      `}</style>
    </div>
  );
};

export default MapaEventos;