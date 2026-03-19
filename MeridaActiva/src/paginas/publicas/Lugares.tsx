import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import BotonFavorito from '../../componentes/BotonFavorito';
import { toastError } from '../../utils/toast';
import { useSeoMeta } from '../../hooks/useSeoMeta';
import SelectCustom from '../../componentes/SelectCustom';

interface Lugar {
  id: string;
  nombre_es: string;
  descripcion_es: string;
  ubicacion: string;
  imagen_url: string;
  categoria: string;
  google_maps_url: string | null;
}

function SkeletonTarjeta() {
  return (
    <div className="rounded-[2.5rem] overflow-hidden bg-white shadow-sm border border-slate-100 animate-pulse">
      <div className="h-72 bg-slate-200 w-full" />
      <div className="p-8 space-y-3">
        <div className="h-4 bg-slate-200 rounded-full w-20" />
        <div className="h-6 bg-slate-200 rounded-full w-4/5" />
        <div className="h-4 bg-slate-200 rounded-full w-1/2" />
      </div>
    </div>
  );
}

const CATEGORIAS = ['Todos', 'Sobre la ciudad', 'Gastronomía', 'Actividades'];
const PAGE_SIZE = 9;

const Lugares: React.FC = () => {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(true);

  useSeoMeta({
    title: 'Lugares de Mérida — Patrimonio, Gastronomía y Actividades',
    description: 'Explora los monumentos, restaurantes y actividades de Mérida. Teatro Romano, Anfiteatro, Templo de Diana, rutas de naturaleza y mucho más.',
  });

  useEffect(() => { cargarLugares(1, true); }, []);

  const cargarLugares = async (nuevaPagina: number, reiniciar = false) => {
    if (nuevaPagina === 1) setLoading(true);
    else setCargandoMas(true);
    try {
      const desde = (nuevaPagina - 1) * PAGE_SIZE;
      const hasta = desde + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from('lugares')
        .select('id, nombre_es, descripcion_es, ubicacion, imagen_url, categoria, google_maps_url')
        .order('nombre_es', { ascending: true })
        .range(desde, hasta);
      if (error) throw error;
      const nuevos = (data as Lugar[]) ?? [];
      setHayMas(nuevos.length === PAGE_SIZE);
      setLugares(prev => reiniciar ? nuevos : [...prev, ...nuevos]);
      setPagina(nuevaPagina);
    } catch {
      toastError('No se pudo cargar el patrimonio. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
      setCargandoMas(false);
    }
  };

  const lugaresProcesados = lugares
    .filter(l => {
      if (categoriaActiva !== 'Todos' && l.categoria !== categoriaActiva) return false;
      if (busqueda.trim()) {
        const t = busqueda.toLowerCase();
        if (!l.nombre_es?.toLowerCase().includes(t) && !l.descripcion_es?.toLowerCase().includes(t)) return false;
      }
      return true;
    })
    .sort((a, b) => orden === 'asc' ? a.nombre_es.localeCompare(b.nombre_es) : b.nombre_es.localeCompare(a.nombre_es));

  return (
    <div className="min-h-screen bg-brand-bg overflow-x-hidden relative">
      {/* Decorative thread — full page background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img src="/Imagenes/hilo-decorativo-rosa.jpg" alt="" className="w-full h-full object-cover opacity-[0.04] select-none" aria-hidden="true" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      </div>

      {/* HERO */}
      <header className="relative z-10 h-72 md:h-96 flex items-end justify-start overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/Imagenes/Museo Romano.webp"
            alt="Patrimonio de Mérida"
            className="w-full h-full object-cover animate-slow-zoom"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://turismomerida.org/wp-content/uploads/2017/03/teatro-romano01.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12 w-full">
          <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-3 block">
            <i className="bi bi-award mr-2" />
            Patrimonio UNESCO · Fundada 25 a.C.
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
            Patrimonio <span className="text-brand-gold">Eterno</span>
          </h1>
          <p className="text-white/60 font-medium max-w-lg">
            Monumentos romanos, gastronomía extremeña y actividades únicas en la ciudad más antigua de España.
          </p>
        </div>
      </header>

      {/* BANNER RUTAS IA */}
      <div className="bg-brand-dark border-b border-white/5 relative z-10 overflow-hidden">
        {/* Decorative thread */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <img  alt="" className="w-full h-full object-cover opacity-[0.09] select-none" aria-hidden="true" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="bi bi-map text-brand-gold text-sm" />
            </div>
            <p className="text-white/70 text-sm font-medium">
              <span className="text-brand-gold font-black">Visita inteligente</span> — Genera una ruta por los mejores monumentos
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link to="/rutas" className="inline-flex items-center gap-2 bg-brand-gold text-brand-dark px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all">
              <i className="bi bi-stars text-xs" />
              Ruta por Monumentos
            </Link>
            <Link to="/faq" className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all">
              <i className="bi bi-robot text-xs" />
              Preguntar a la IA
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-10 pb-20 relative z-10">

        {/* Buscador */}
        <div className="mb-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <div className="relative w-full md:w-1/2">
              <i className="bi bi-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar monumentos, restaurantes, actividades..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar lugares"
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark"
              />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="filter-toolbar">
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIAS.map(cat => (
              <button key={cat} onClick={() => setCategoriaActiva(cat)} className={categoriaActiva === cat ? 'filter-btn-active' : 'filter-btn'}>
                {cat}
              </button>
            ))}
          </div>
          <SelectCustom
            value={orden}
            onChange={(v) => setOrden(v as typeof orden)}
            icon="bi-sort-alpha-down"
            options={[
              { value: 'asc', label: 'A — Z' },
              { value: 'desc', label: 'Z — A' },
            ]}
          />
        </div>

        {/* Contador */}
        {!loading && (
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 text-right">
            {lugaresProcesados.length} lugar{lugaresProcesados.length !== 1 ? 'es' : ''} encontrado{lugaresProcesados.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonTarjeta key={i} />)}
          </div>
        ) : lugaresProcesados.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 mt-4">
            <div className="w-20 h-20 bg-brand-gold/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-4xl">🏛️</div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-brand-dark mb-3">Sin resultados</h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-8 max-w-xs mx-auto">
              {busqueda ? `No hay lugares que coincidan con "${busqueda}"` : 'No hay lugares en esta categoría'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => { setBusqueda(''); setCategoriaActiva('Todos'); }}
                className="bg-brand-dark text-brand-gold px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
              >
                Ver todos los lugares
              </button>
              <Link to="/faq" className="inline-flex items-center justify-center gap-2 bg-brand-blue text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                <i className="bi bi-robot" />
                Preguntar a la IA
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lugaresProcesados.map((lugar, idx) => (
                <div key={lugar.id} className="card-overlay group">
                  <img src={lugar.imagen_url} className="card-overlay-img" alt={lugar.nombre_es} loading={idx < 3 ? 'eager' : 'lazy'} />
                  <div className="card-overlay-gradient" />
                  <div className="absolute top-6 right-6 z-20">
                    <BotonFavorito lugarId={lugar.id} tipo="lugar" />
                  </div>
                  <Link to={`/lugares/${lugar.id}`} className="absolute inset-0 p-10 flex flex-col justify-end z-10">
                    <div className="mb-4">
                      <span className="tag-badge">{lugar.categoria}</span>
                    </div>
                    <h4 className="text-3xl font-black text-white mb-3 uppercase italic tracking-tighter leading-none group-hover:text-brand-gold transition-colors">
                      {lugar.nombre_es}
                    </h4>
                    <p className="text-slate-300 text-sm line-clamp-2 mb-6 font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {lugar.descripcion_es}
                    </p>
                    <div className="flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-widest border-t border-white/10 pt-6">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-brand-gold group-hover:text-brand-dark transition-all">
                        <i className="bi bi-geo-alt-fill text-lg text-brand-gold group-hover:text-brand-dark" />
                      </div>
                      <span>{lugar.ubicacion}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {hayMas && (
              <div className="mt-16 text-center">
                <button
                  onClick={() => cargarLugares(pagina + 1)}
                  disabled={cargandoMas}
                  className="inline-flex items-center gap-3 bg-white border-2 border-brand-dark text-brand-dark px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-dark hover:text-brand-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-lg"
                >
                  {cargandoMas ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                      Cargando…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle text-base" />
                      Cargar más lugares
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Lugares;