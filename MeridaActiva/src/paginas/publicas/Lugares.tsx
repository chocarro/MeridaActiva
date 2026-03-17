// src/pages/Lugares.tsx
// ─────────────────────────────────────────────────────────────────
// MEJORAS APLICADAS:
//  ✅ Tipos TypeScript (adiós any[])
//  ✅ Skeleton Loaders en lugar de texto plano
//  ✅ Toast en lugar de console.error silencioso
//  ✅ Estado vacío con diseño y CTA
//  ✅ Paginación con "Cargar más" + límite inicial de 9
//  ✅ Lazy loading en imágenes
//  ✅ Buscador por nombre/descripción (igual que Eventos)
//  ✅ Contador de resultados
//  ✅ Categoría Actividades añadida
// ─────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import BotonFavorito from '../../componentes/BotonFavorito';
import { toastError } from '../../utils/toast';
import { useSeoMeta } from '../../hooks/useSeoMeta';
import SelectCustom from '../../componentes/SelectCustom';

// ── Tipo local (mueve esto a src/types.ts cuando puedas) ─────────
interface Lugar {
  id: string;
  nombre_es: string;
  descripcion_es: string;
  ubicacion: string;
  imagen_url: string;
  categoria: string;
  google_maps_url: string | null;
}

// ── Skeleton de tarjeta ──────────────────────────────────────────
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

// ── Constantes ───────────────────────────────────────────────────
const CATEGORIAS = ['Todos', 'Sobre la ciudad', 'Gastronomía', 'Actividades'];
const PAGE_SIZE = 9;

// ════════════════════════════════════════════════════════════════
const Lugares: React.FC = () => {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(true);

  // ── SEO ─────────────────────────────────────────────────────────
  useSeoMeta({
    title: 'Lugares de Mérida — Patrimonio, Gastronomía y Actividades',
    description: 'Explora los monumentos, restaurantes y actividades de Mérida. Teatro Romano, Anfiteatro, Templo de Diana, rutas de naturaleza y mucho más — Patrimonio de la Humanidad UNESCO.',
  });

  // ── Carga inicial ──────────────────────────────────────────────
  useEffect(() => {
    cargarLugares(1, true);
  }, []);

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
    } catch (err) {
      toastError('No se pudo cargar el patrimonio. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
      setCargandoMas(false);
    }
  };

  // ── Filtrado y ordenación ──────────────────────────────────────
  const lugaresProcesados = lugares
    .filter(l => {
      if (categoriaActiva !== 'Todos' && l.categoria !== categoriaActiva) return false;

      if (busqueda.trim()) {
        const t = busqueda.toLowerCase();
        if (
          !l.nombre_es?.toLowerCase().includes(t) &&
          !l.descripcion_es?.toLowerCase().includes(t)
        ) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (orden === 'asc') return a.nombre_es.localeCompare(b.nombre_es);
      return b.nombre_es.localeCompare(a.nombre_es);
    });


  return (
    <div className="min-h-screen bg-brand-bg pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Cabecera */}
        <div className="text-center mb-16">
          <h2 className="section-title">
            Patrimonio <span className="text-brand-gold">Eterno</span>
          </h2>
          <p className="section-subtitle">Descubre la historia en cada rincón</p>
        </div>

        {/* Buscador */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <div className="relative w-full md:w-1/2">
              <i className="bi bi-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar monumentos, plazas, museos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar lugares"
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark"
              />
            </div>
          </div>
        </div>

        {/* Filtros de categoría + orden */}
        <div className="filter-toolbar">
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIAS.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className={categoriaActiva === cat ? 'filter-btn-active' : 'filter-btn'}
              >
                {cat}
              </button>
            ))}
          </div>

          <SelectCustom
            value={orden}
            onChange={(v) => setOrden(v as typeof orden)}
            icon="bi-sort-alpha-down"
            options={[
              { value: 'asc',  label: 'A — Z' },
              { value: 'desc', label: 'Z — A' },
            ]}
          />
        </div>

        {/* Contador de resultados */}
        {!loading && (
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 text-right">
            {lugaresProcesados.length} lugar{lugaresProcesados.length !== 1 ? 'es' : ''} encontrado{lugaresProcesados.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          // ── Skeleton grid ──────────────────────────────────────
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <SkeletonTarjeta key={i} />
            ))}
          </div>
        ) : lugaresProcesados.length === 0 ? (
          // ── Estado vacío ───────────────────────────────────────
          <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 mt-4">
            <div className="w-20 h-20 bg-brand-gold/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-4xl">
              🏛️
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-brand-dark mb-3">
              Sin resultados
            </h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-8 max-w-xs mx-auto">
              {busqueda
                ? `No hay lugares que coincidan con "${busqueda}"`
                : 'No hay lugares en esta categoría'}
            </p>
            <button
              onClick={() => {
                setBusqueda('');
                setCategoriaActiva('Todos');
              }}
              className="bg-brand-dark text-brand-gold px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
            >
              Ver todos los lugares
            </button>
          </div>
        ) : (
          // ── Grid de lugares ────────────────────────────────────
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lugaresProcesados.map((lugar, idx) => (
                <div key={lugar.id} className="card-overlay group">
                  <img
                    src={lugar.imagen_url}
                    className="card-overlay-img"
                    alt={lugar.nombre_es}
                    loading={idx < 3 ? 'eager' : 'lazy'}
                  />
                  <div className="card-overlay-gradient" />

                  <div className="absolute top-6 right-6 z-20">
                    <BotonFavorito lugarId={lugar.id} tipo="lugar" />
                  </div>

                  <Link
                    to={`/lugares/${lugar.id}`}
                    className="absolute inset-0 p-10 flex flex-col justify-end z-10"
                  >
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

            {/* Cargar más */}
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