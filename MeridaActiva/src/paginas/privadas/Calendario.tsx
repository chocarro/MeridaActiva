// src/pages/Calendario.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { toastExito, toastError, toastAviso } from '../../utils/toast';
import AnimatedList from '../../componentes/animaciones/AnimatedList';

interface Evento {
  id: string;
  titulo: string;
  fecha: string;
  imagen_url: string;
  categoria: string;
  ubicacion?: string;
  precio?: string;
}

interface AgendaPersonal {
  id: string;
  titulo: string;
  fecha: string;
  nota?: string;
  color: string;
}

interface EventoCalendario {
  id: string;
  titulo: string;
  fecha: string;
  color: string;
  tipo: 'plataforma' | 'personal';
}

// ── Constantes ───────────────────────────────────────────────────
const COLORES = ['#FFBA08', '#3F88C5', '#136F63', '#D00000', '#032B43'];
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// ── Skeleton del calendario ──────────────────────────────────────
function SkeletonCalendario() {
  return (
    <div className="p-4 animate-pulse">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="h-6 bg-slate-100 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-20 md:h-24 bg-slate-100 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ── Skeleton lista ───────────────────────────────────────────────
function SkeletonLista() {
  return (
    <div className="p-6 space-y-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="w-2 h-12 rounded-full bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded-full w-3/5" />
            <div className="h-3 bg-slate-200 rounded-full w-2/5" />
          </div>
          <div className="h-6 w-16 bg-slate-200 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
const Calendario: React.FC = () => {
  const { session } = useAuth();
  const [vista, setVista] = useState<'mes' | 'lista'>('mes');
  const [mesActual, setMesActual] = useState(new Date());
  const [eventosPlataforma, setEventosPlataforma] = useState<Evento[]>([]);
  const [agendaPersonal, setAgendaPersonal] = useState<AgendaPersonal[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState('');
  const [newEvTitulo, setNewEvTitulo] = useState('');
  const [newEvNota, setNewEvNota] = useState('');
  const [newEvColor, setNewEvColor] = useState(COLORES[0]);
  const [savingEv, setSavingEv] = useState(false);

  // Confirmación inline de borrado
  const [pendienteEliminar, setPendienteEliminar] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────
  // BUG FIX: La tabla 'favoritos' usa 'elemento_id' (genérico para eventos
  // y lugares), NO 'evento_id'. No existe foreign key directa a 'eventos',
  // por eso el join .select('eventos(...)') devolvía 400.
  // Solución: consulta en dos pasos — primero los IDs, luego los eventos.
  const fetchData = useCallback(async () => {
    if (!session?.user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      // Paso 1: obtener los elemento_id de favoritos de tipo 'evento'
      const { data: favs, error: favErr } = await supabase
        .from('favoritos')
        .select('elemento_id')
        .eq('usuario_id', session.user.id)
        .eq('tipo_elemento', 'evento');

      if (favErr) throw favErr;

      // Paso 2: si hay favoritos, cargar los eventos correspondientes
      if (favs && favs.length > 0) {
        const ids = favs.map((f: { elemento_id: string }) => f.elemento_id).filter(Boolean);
        if (ids.length > 0) {
          const { data: evs, error: evsErr } = await supabase
            .from('eventos')
            .select('id, titulo, fecha, imagen_url, categoria, ubicacion, precio')
            .in('id', ids);

          if (evsErr) throw evsErr;
          if (evs) setEventosPlataforma(evs as Evento[]);
        }
      } else {
        setEventosPlataforma([]);
      }

      // Agenda personal (sin cambios)
      const { data: ag, error: agErr } = await supabase
        .from('agenda_personal')
        .select('*')
        .eq('usuario_id', session.user.id)
        .order('fecha', { ascending: true });

      if (agErr) throw agErr;
      if (ag) setAgendaPersonal(ag as AgendaPersonal[]);

    } catch (err) {
      console.error('[Calendario] Error cargando agenda:', err);
      toastError('No se pudo cargar tu agenda. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Guardar evento personal ────────────────────────────────────
  const handleSaveEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !newEvTitulo || !diaSeleccionado) return;
    setSavingEv(true);
    try {
      const { error } = await supabase.from('agenda_personal').insert([{
        usuario_id: session.user.id,
        titulo: newEvTitulo.trim(),
        fecha: diaSeleccionado,
        nota: newEvNota.trim() || null,
        color: newEvColor,
      }]);
      if (error) throw error;
      toastExito('¡Evento añadido a tu agenda!');
      setShowModal(false);
      setNewEvTitulo(''); setNewEvNota(''); setNewEvColor(COLORES[0]);
      fetchData();
    } catch {
      toastError('No se pudo guardar el evento. Inténtalo de nuevo.');
    } finally {
      setSavingEv(false);
    }
  };

  // ── Eliminar evento personal (con confirmación inline) ─────────
  const confirmarEliminar = (id: string) => setPendienteEliminar(id);

  const eliminarEvPersonal = async (id: string) => {
    try {
      const { error } = await supabase.from('agenda_personal').delete().eq('id', id);
      if (error) throw error;
      toastAviso('Evento eliminado de tu agenda.');
      setPendienteEliminar(null);
      fetchData();
    } catch {
      toastError('No se pudo eliminar el evento.');
      setPendienteEliminar(null);
    }
  };

  // ── Datos de calendario ────────────────────────────────────────
  const año = mesActual.getFullYear();
  const mes = mesActual.getMonth();
  const primerDia = new Date(año, mes, 1).getDay();
  const diasEnMes = new Date(año, mes + 1, 0).getDate();
  const offset = primerDia === 0 ? 6 : primerDia - 1;

  const todosLosEventos: EventoCalendario[] = [
    ...eventosPlataforma.map(ev => ({
      id: ev.id, titulo: ev.titulo, fecha: ev.fecha,
      color: '#3F88C5', tipo: 'plataforma' as const,
    })),
    ...agendaPersonal.map(ag => ({
      id: ag.id, titulo: ag.titulo, fecha: ag.fecha,
      color: ag.color, tipo: 'personal' as const,
    })),
  ];

  const eventosDelDia = (dia: number): EventoCalendario[] => {
    const fechaStr = `${año}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return todosLosEventos.filter(ev => ev.fecha?.startsWith(fechaStr));
  };

  const mesNombre = mesActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const esHoyMes =
    new Date().getMonth() === mes && new Date().getFullYear() === año;

  const estesMes = todosLosEventos.filter(ev => {
    const d = new Date(ev.fecha);
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
  }).length;

  // ── Sin sesión ─────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-6 pt-20">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-14 text-center border border-slate-100 shadow-2xl">
          <div className="w-20 h-20 bg-brand-gold/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <i className="bi bi-calendar3 text-4xl text-brand-dark/30" />
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-brand-dark mb-4">
            Tu <span className="text-brand-gold">Agenda</span>
          </h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-10 max-w-xs mx-auto leading-relaxed">
            Inicia sesión para gestionar tu agenda personal y guardar eventos favoritos
          </p>
          <Link
            to="/login"
            className="inline-block bg-brand-dark text-brand-gold px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  // ── Render principal ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-bg pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-6xl font-black text-brand-dark italic uppercase tracking-tighter leading-none">
              Mi <span className="text-brand-gold">Agenda</span>
            </h2>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] mt-3 ml-1">
              Gestiona tus planes en Augusta Emerita
            </p>
          </div>
          <div className="flex gap-3 flex-wrap items-center">
            <Link
              to="/rutas"
              className="flex items-center gap-2 bg-brand-dark text-brand-gold px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-lg"
            >
              <i className="bi bi-stars" /> Crea mi ruta ideal
            </Link>
            <button
              onClick={() => { setDiaSeleccionado(new Date().toISOString().slice(0, 10)); setShowModal(true); }}
              className="flex items-center gap-2 bg-brand-gold text-brand-dark px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-lg"
            >
              <i className="bi bi-plus-lg" /> Añadir evento
            </button>
            <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
              {(['mes', 'lista'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setVista(v)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${vista === v ? 'bg-brand-dark text-white shadow-lg' : 'text-slate-400 hover:text-brand-dark'}`}
                >
                  <i className={`bi ${v === 'mes' ? 'bi-grid-3x3' : 'bi-list-ul'}`} />
                  {v === 'mes' ? 'Cuadrícula' : 'Lista'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Sidebar stats */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-brand-dark rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <h3 className="text-brand-gold text-[10px] font-black uppercase tracking-[0.2em] mb-6">Resumen</h3>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { valor: eventosPlataforma.length, label: 'Favoritos', color: 'text-white' },
                  { valor: agendaPersonal.length, label: 'Personales', color: 'text-brand-gold' },
                  { valor: estesMes, label: 'Este mes', color: 'text-brand-green' },
                  { valor: todosLosEventos.length, label: 'Total', color: 'text-brand-blue' },
                ].map(({ valor, label, color }) => (
                  <div key={label}>
                    <p className={`text-3xl font-black italic leading-none mb-1 ${color}`}>{valor}</p>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</p>
                  </div>
                ))}
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-blue/10 rounded-full blur-3xl" />
            </div>

            {/* Próximos favoritos */}
            {eventosPlataforma.length > 0 && (
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-dark mb-4">Tus favoritos</h4>
                <div className="space-y-3">
                  {eventosPlataforma.slice(0, 4).map(ev => (
                    <div key={ev.id} className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                        <img src={ev.imagen_url} alt={ev.titulo} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-brand-dark truncate">{ev.titulo}</p>
                        <p className="text-[9px] text-slate-400 font-bold">
                          {ev.fecha ? new Date(ev.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Sin fecha'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {eventosPlataforma.length > 4 && (
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center pt-1">
                      +{eventosPlataforma.length - 4} más
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-dark mb-4">Leyenda</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-brand-blue" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Eventos favoritos</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-brand-gold" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mis eventos</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Contenido principal */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">

              {/* Navegación de mes */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-slate-50">
                <button
                  onClick={() => setMesActual(new Date(año, mes - 1))}
                  className="w-10 h-10 rounded-xl bg-brand-bg hover:bg-brand-dark hover:text-white transition-all text-brand-dark flex items-center justify-center"
                  aria-label="Mes anterior"
                >
                  <i className="bi bi-chevron-left" />
                </button>

                <div className="flex items-center gap-3">
                  <h3 className="font-black text-brand-dark uppercase italic tracking-tighter text-xl capitalize">
                    {mesNombre}
                  </h3>
                  {!esHoyMes && (
                    <button
                      onClick={() => setMesActual(new Date())}
                      className="text-[9px] font-black uppercase tracking-widest bg-brand-gold/10 text-brand-dark px-3 py-1.5 rounded-lg hover:bg-brand-gold transition-all"
                    >
                      Hoy
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setMesActual(new Date(año, mes + 1))}
                  className="w-10 h-10 rounded-xl bg-brand-bg hover:bg-brand-dark hover:text-white transition-all text-brand-dark flex items-center justify-center"
                  aria-label="Mes siguiente"
                >
                  <i className="bi bi-chevron-right" />
                </button>
              </div>

              {loading ? (
                vista === 'mes' ? <SkeletonCalendario /> : <SkeletonLista />
              ) : vista === 'mes' ? (

                /* ── VISTA CUADRÍCULA ── */
                <div className="p-4">
                  <div className="grid grid-cols-7 mb-2">
                    {DIAS_SEMANA.map(d => (
                      <div key={d} className="text-center text-[9px] font-black uppercase tracking-widest text-slate-300 py-2">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array(offset).fill(null).map((_, i) => <div key={`off-${i}`} className="h-20 md:h-24" />)}
                    {Array.from({ length: diasEnMes }, (_, i) => i + 1).map(dia => {
                      const evsDia = eventosDelDia(dia);
                      const hoy = new Date();
                      const esHoy = hoy.getDate() === dia && hoy.getMonth() === mes && hoy.getFullYear() === año;
                      return (
                        <div
                          key={dia}
                          onClick={() => {
                            setDiaSeleccionado(`${año}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`);
                            setShowModal(true);
                          }}
                          className={`h-20 md:h-24 rounded-2xl p-2 cursor-pointer transition-colors group relative flex flex-col ${esHoy ? 'bg-brand-dark' : 'bg-white border border-slate-50 hover:bg-brand-bg'}`}
                        >
                          <span className={`text-xs font-black ${esHoy ? 'text-brand-gold' : 'text-brand-dark'}`}>{dia}</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {evsDia.slice(0, 3).map(ev => (
                              <span
                                key={ev.id}
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: ev.color }}
                                title={ev.titulo}
                              />
                            ))}
                            {evsDia.length > 3 && (
                              <span className="text-[8px] font-black text-slate-400">+{evsDia.length - 3}</span>
                            )}
                          </div>
                          {evsDia.length > 0 && (
                            <div className="absolute left-0 bottom-full mb-2 bg-brand-dark text-white text-[9px] font-black px-3 py-2 rounded-xl shadow-xl z-10 hidden group-hover:block w-44 whitespace-normal pointer-events-none">
                              {evsDia.map(ev => (
                                <div key={ev.id} className="flex items-center gap-1.5 py-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                                  {ev.titulo}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              ) : (

                /* ── VISTA LISTA ── */
                <div className="p-6 space-y-4">
                  {todosLosEventos.length === 0 ? (
                    <div className="py-24 text-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                        <i className="bi bi-calendar3 text-2xl text-brand-dark/30" />
                      </div>
                      <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] mb-6">
                        No tienes eventos en la agenda
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Link
                          to="/eventos"
                          className="bg-brand-blue text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                        >
                          Ver eventos
                        </Link>
                        <button
                          onClick={() => { setDiaSeleccionado(new Date().toISOString().slice(0, 10)); setShowModal(true); }}
                          className="bg-brand-gold text-brand-dark px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                        >
                          Añadir uno
                        </button>
                      </div>
                    </div>
                  ) : (
                    <AnimatedList className="space-y-4">
                      {todosLosEventos
                        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                        .map(ev => (
                          <div key={ev.id} className="flex items-center gap-5 p-5 rounded-2xl bg-brand-bg border border-slate-100 hover:border-brand-blue/20 hover:bg-white transition-all group">
                            <div className="w-2 h-12 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-brand-dark uppercase italic text-sm truncate group-hover:text-brand-blue transition-colors">
                                {ev.titulo}
                              </p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                {new Date(ev.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${ev.tipo === 'plataforma' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-brand-gold/10 text-brand-dark'}`}>
                                {ev.tipo === 'plataforma' ? 'Favorito' : 'Personal'}
                              </span>

                              {ev.tipo === 'plataforma' ? (
                                <Link
                                  to={`/eventos/${ev.id}`}
                                  className="w-8 h-8 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all text-sm"
                                  title="Ver evento"
                                >
                                  <i className="bi bi-arrow-right" />
                                </Link>
                              ) : pendienteEliminar === ev.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => eliminarEvPersonal(ev.id)}
                                    className="px-3 py-1.5 rounded-xl bg-brand-red text-white text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                  >
                                    Sí, borrar
                                  </button>
                                  <button
                                    onClick={() => setPendienteEliminar(null)}
                                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => confirmarEliminar(ev.id)}
                                  className="w-8 h-8 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center hover:bg-brand-red hover:text-white transition-all text-sm"
                                  title="Eliminar"
                                >
                                  <i className="bi bi-trash3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                    </AnimatedList>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL AÑADIR EVENTO ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-brand-bg hover:bg-brand-red hover:text-white transition-all flex items-center justify-center text-slate-400"
              aria-label="Cerrar"
            >
              <i className="bi bi-x-lg" />
            </button>
            <h3 className="text-2xl font-black text-brand-dark italic uppercase tracking-tighter mb-8">
              Añadir a <span className="text-brand-gold">Agenda</span>
            </h3>
            <form onSubmit={handleSaveEvento} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Título *</label>
                <input
                  type="text"
                  value={newEvTitulo}
                  onChange={e => setNewEvTitulo(e.target.value)}
                  className="input-field"
                  placeholder="¿Qué vas a hacer?"
                  maxLength={80}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Fecha *</label>
                <input
                  type="date"
                  value={diaSeleccionado}
                  onChange={e => setDiaSeleccionado(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nota (opcional)</label>
                <textarea
                  value={newEvNota}
                  onChange={e => setNewEvNota(e.target.value)}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Añade una nota..."
                  maxLength={200}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Color</label>
                <div className="flex gap-2">
                  {COLORES.map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewEvColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${newEvColor === c ? 'ring-2 ring-offset-2 ring-brand-dark scale-110' : ''}`}
                      style={{ backgroundColor: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={savingEv}
                className="w-full bg-brand-dark text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl hover:bg-brand-blue transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingEv ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    Guardando…
                  </>
                ) : 'Guardar en mi Agenda'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendario;