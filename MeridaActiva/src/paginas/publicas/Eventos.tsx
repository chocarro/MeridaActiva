import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import BotonFavorito from '../../componentes/BotonFavorito';
import { toastError } from '../../utils/toast';
import { useSeoMeta } from '../../hooks/useSeoMeta';

// ── Tipo local (mueve esto a src/types.ts cuando puedas) ─────────
interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  ubicacion: string;
  imagen_url: string;
  categoria: string;
  precio: number | null;
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
const CATEGORIAS = ['Todos', 'Cultural', 'Música', 'Teatro'];
const PAGE_SIZE = 9;

// ════════════════════════════════════════════════════════════════
const Eventos: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [orden, setOrden] = useState<'asc' | 'desc' | 'reciente'>('reciente');
  const [loading, setLoading] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRapido, setFiltroRapido] = useState<'Todos' | 'Hoy' | 'Finde'>('Todos');
  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(true);

  // ── SEO ─────────────────────────────────────────────────────────
  useSeoMeta({
    title: 'Agenda Cultural — Eventos en Mérida',
    description: 'Descubre todos los eventos culturales, conciertos y teatro en Mérida. Filtra por fecha, categoría y busca lo que más te gusta.',
  });

  // ── Carga inicial ──────────────────────────────────────────────
  useEffect(() => {
    cargarEventos(1, true);
  }, []);

  const cargarEventos = async (nuevaPagina: number, reiniciar = false) => {
    if (nuevaPagina === 1) setLoading(true);
    else setCargandoMas(true);

    try {
      const desde = (nuevaPagina - 1) * PAGE_SIZE;
      const hasta = desde + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('eventos')
        .select('id, titulo, descripcion, fecha, ubicacion, imagen_url, categoria, precio')
        .order('fecha', { ascending: true })
        .range(desde, hasta);

      if (error) throw error;

      const nuevos = (data as Evento[]) ?? [];
      setHayMas(nuevos.length === PAGE_SIZE);
      setEventos(prev => reiniciar ? nuevos : [...prev, ...nuevos]);
      setPagina(nuevaPagina);
    } catch (err) {
      toastError('No se pudo cargar la agenda. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
      setCargandoMas(false);
    }
  };

  // ── Filtrado y ordenación (en cliente, sobre los ya descargados) ─
  const eventosProcesados = eventos
    .filter(ev => {
      if (categoriaActiva !== 'Todos' && ev.categoria !== categoriaActiva) return false;

      if (busqueda.trim()) {
        const t = busqueda.toLowerCase();
        if (!ev.titulo?.toLowerCase().includes(t) && !ev.descripcion?.toLowerCase().includes(t))
          return false;
      }

      if (filtroRapido === 'Hoy') {
        const hoy = new Date();
        const fechaEv = new Date(ev.fecha);
        if (hoy.toDateString() !== fechaEv.toDateString()) return false;
      } else if (filtroRapido === 'Finde') {
        const fechaEv = new Date(ev.fecha);
        const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
        const proxSemana = new Date(hoy); proxSemana.setDate(hoy.getDate() + 7);
        if (fechaEv < hoy || fechaEv > proxSemana) return false;
        const day = fechaEv.getDay();
        if (day !== 0 && day !== 5 && day !== 6) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (orden === 'asc') return (a.titulo ?? '').localeCompare(b.titulo ?? '');
      if (orden === 'desc') return (b.titulo ?? '').localeCompare(a.titulo ?? '');
      return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    });

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-bg pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Cabecera */}
        <div className="text-center mb-16">
          <h2 className="section-title">
            Agenda <span className="text-brand-gold">Cultural</span>
          </h2>
          <p className="section-subtitle">No te pierdas nada en la ciudad</p>
        </div>

        {/* Buscador y filtros rápidos */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <div className="relative w-full md:w-1/2">
              <i className="bi bi-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar eventos por título..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar eventos"
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {[
                {
                  id: 'Todos', label: 'Cualquier Fecha', icon: null,
                  base: 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                  activo: 'bg-brand-dark text-white'
                },
                {
                  id: 'Hoy', label: 'Hoy', icon: 'bi-lightning-fill',
                  base: 'bg-brand-red/10 text-brand-red hover:bg-brand-red/20',
                  activo: 'bg-brand-red text-white shadow-lg shadow-brand-red/30'
                },
                {
                  id: 'Finde', label: 'Este Finde', icon: 'bi-calendar-event',
                  base: 'bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20',
                  activo: 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30'
                },
              ].map(({ id, label, icon, base, activo }) => (
                <button
                  key={id}
                  onClick={() => setFiltroRapido(id as typeof filtroRapido)}
                  className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${filtroRapido === id ? activo : base}`}
                >
                  {icon && <i className={`bi ${icon}`} />}
                  {label}
                </button>
              ))}
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

          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as typeof orden)}
            className="select-field"
          >
            <option value="reciente">Próximos eventos</option>
            <option value="asc">A - Z</option>
            <option value="desc">Z - A</option>
          </select>
        </div>

        {/* Contador de resultados */}
        {!loading && (
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 text-right">
            {eventosProcesados.length} evento{eventosProcesados.length !== 1 ? 's' : ''} encontrado{eventosProcesados.length !== 1 ? 's' : ''}
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
        ) : eventosProcesados.length === 0 ? (
          // ── Estado vacío ───────────────────────────────────────
          <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 mt-4">
            <div className="w-20 h-20 bg-brand-gold/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-4xl">
              🎭
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-brand-dark mb-3">
              Sin resultados
            </h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-8 max-w-xs mx-auto">
              {busqueda
                ? `No hay eventos que coincidan con "${busqueda}"`
                : 'No hay eventos en esta categoría o fecha'}
            </p>
            <button
              onClick={() => {
                setBusqueda('');
                setCategoriaActiva('Todos');
                setFiltroRapido('Todos');
              }}
              className="bg-brand-dark text-brand-gold px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
            >
              Ver todos los eventos
            </button>
          </div>
        ) : (
          // ── Grid de eventos ────────────────────────────────────
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventosProcesados.map((evento, idx) => (
                <div key={evento.id} className="card-overlay group">
                  <img
                    src={evento.imagen_url}
                    className="card-overlay-img"
                    alt={evento.titulo}
                    // Las primeras 3 se cargan eager (están en viewport)
                    loading={idx < 3 ? 'eager' : 'lazy'}
                  />
                  <div className="card-overlay-gradient" />

                  <div className="absolute top-6 right-6 z-20">
                    <BotonFavorito eventoId={evento.id} />
                  </div>

                  <Link
                    to={`/eventos/${evento.id}`}
                    className="absolute inset-0 p-10 flex flex-col justify-end z-10"
                  >
                    <div className="mb-4">
                      <span className="tag-badge">{evento.categoria}</span>
                    </div>
                    <h4 className="text-3xl font-black text-white mb-3 uppercase italic tracking-tighter leading-none group-hover:text-brand-gold transition-colors">
                      {evento.titulo}
                    </h4>
                    <div className="flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-widest border-t border-white/10 pt-6">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-brand-gold group-hover:text-brand-dark transition-all">
                        <i className="bi bi-geo-alt-fill text-lg text-brand-gold group-hover:text-brand-dark" />
                      </div>
                      <span>{evento.ubicacion}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Cargar más */}
            {hayMas && (
              <div className="mt-16 text-center">
                <button
                  onClick={() => cargarEventos(pagina + 1)}
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
                      Cargar más eventos
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

export default Eventos;
