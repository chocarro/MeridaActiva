import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

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

const COLORES = ['#FFBA08', '#3F88C5', '#136F63', '#D00000', '#032B43'];

const Calendario: React.FC = () => {
  const { session } = useAuth();
  const [vista, setVista] = useState<'mes' | 'lista'>('mes');
  const [mesActual, setMesActual] = useState(new Date());
  const [eventosPlataforma, setEventosPlataforma] = useState<Evento[]>([]);
  const [agendaPersonal, setAgendaPersonal] = useState<AgendaPersonal[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal nuevo evento personal
  const [showModal, setShowModal] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState('');
  const [newEvTitulo, setNewEvTitulo] = useState('');
  const [newEvNota, setNewEvNota] = useState('');
  const [newEvColor, setNewEvColor] = useState(COLORES[0]);
  const [savingEv, setSavingEv] = useState(false);

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      // Favoritos con datos de evento
      const { data: favs } = await supabase
        .from('favoritos')
        .select('eventos(id, titulo, fecha, imagen_url, categoria, ubicacion, precio)')
        .eq('usuario_id', session.user.id)
        .eq('tipo_elemento', 'evento');

      if (favs) {
        const evs = favs.map((f: any) => f.eventos).filter(Boolean);
        setEventosPlataforma(evs);
      }

      // Agenda personal
      const { data: ag } = await supabase
        .from('agenda_personal')
        .select('*')
        .eq('usuario_id', session.user.id)
        .order('fecha', { ascending: true });
      if (ag) setAgendaPersonal(ag);

    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [session?.user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Guardar evento personal ──
  const handleSaveEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !newEvTitulo || !diaSeleccionado) return;
    setSavingEv(true);
    try {
      const { error } = await supabase.from('agenda_personal').insert([{
        usuario_id: session.user.id,
        titulo: newEvTitulo,
        fecha: diaSeleccionado,
        nota: newEvNota,
        color: newEvColor,
      }]);
      if (error) throw error;
      setShowModal(false);
      setNewEvTitulo(''); setNewEvNota(''); setNewEvColor(COLORES[0]);
      fetchData();
    } catch (err: any) { alert('Error: ' + err.message); }
    finally { setSavingEv(false); }
  };

  const eliminarEvPersonal = async (id: string) => {
    if (!window.confirm('¿Eliminar este evento de tu agenda?')) return;
    await supabase.from('agenda_personal').delete().eq('id', id);
    fetchData();
  };

  // ── Datos de calendario ──
  const año = mesActual.getFullYear();
  const mes = mesActual.getMonth(); // 0-based
  const primerDia = new Date(año, mes, 1).getDay(); // 0=dom
  const diasEnMes = new Date(año, mes + 1, 0).getDate();
  const offset = primerDia === 0 ? 6 : primerDia - 1; // lunes primero

  const todosLosEventos = [
    ...eventosPlataforma.map(ev => ({ id: ev.id, titulo: ev.titulo, fecha: ev.fecha, color: '#3F88C5', tipo: 'plataforma' as const })),
    ...agendaPersonal.map(ag => ({ id: ag.id, titulo: ag.titulo, fecha: ag.fecha, color: ag.color, tipo: 'personal' as const })),
  ];

  const eventosDelDia = (dia: number) => {
    const fechaStr = `${año}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return todosLosEventos.filter(ev => ev.fecha?.startsWith(fechaStr));
  };

  const mesNombre = mesActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Estadísticas reales
  const estesMes = todosLosEventos.filter(ev => {
    const d = new Date(ev.fecha);
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
  }).length;

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
            {/* Añadir evento */}
            <button
              onClick={() => { setDiaSeleccionado(new Date().toISOString().slice(0, 10)); setShowModal(true); }}
              className="flex items-center gap-2 bg-brand-gold text-brand-dark px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-lg"
            >
              <i className="bi bi-plus-lg"></i> Añadir evento
            </button>
            {/* Toggle vista */}
            <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
              {(['mes', 'lista'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setVista(v)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${vista === v ? 'bg-brand-dark text-white shadow-lg' : 'text-slate-400 hover:text-brand-dark'
                    }`}
                >
                  <i className={`bi ${v === 'mes' ? 'bi-grid-3x3' : 'bi-list-ul'}`}></i>
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
                <div>
                  <p className="text-3xl font-black italic leading-none mb-1">{eventosPlataforma.length}</p>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Favoritos</p>
                </div>
                <div>
                  <p className="text-3xl font-black italic leading-none mb-1 text-brand-gold">{agendaPersonal.length}</p>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Personales</p>
                </div>
                <div>
                  <p className="text-3xl font-black italic leading-none mb-1 text-brand-green">{estesMes}</p>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Este mes</p>
                </div>
                <div>
                  <p className="text-3xl font-black italic leading-none mb-1 text-brand-blue">{todosLosEventos.length}</p>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Total</p>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-blue/10 rounded-full blur-3xl"></div>
            </div>

            {/* Leyenda */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-dark mb-4">Leyenda</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-brand-blue"></span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Eventos favoritos</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-brand-gold"></span>
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
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <h3 className="font-black text-brand-dark uppercase italic tracking-tighter text-xl capitalize">{mesNombre}</h3>
                <button
                  onClick={() => setMesActual(new Date(año, mes + 1))}
                  className="w-10 h-10 rounded-xl bg-brand-bg hover:bg-brand-dark hover:text-white transition-all text-brand-dark flex items-center justify-center"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>

              {loading ? (
                <div className="py-24 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
                  Cargando agenda...
                </div>
              ) : vista === 'mes' ? (
                /* ── VISTA CUADRÍCULA ── */
                <div className="p-4">
                  {/* Cabeceras días */}
                  <div className="grid grid-cols-7 mb-2">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                      <div key={d} className="text-center text-[9px] font-black uppercase tracking-widest text-slate-300 py-2">{d}</div>
                    ))}
                  </div>
                  {/* Celdas */}
                  <div className="grid grid-cols-7 gap-1">
                    {Array(offset).fill(null).map((_, i) => <div key={`off-${i}`} className="h-20 md:h-24"></div>)}
                    {Array.from({ length: diasEnMes }, (_, i) => i + 1).map(dia => {
                      const evsDia = eventosDelDia(dia);
                      const hoy = new Date();
                      const esHoy = hoy.getDate() === dia && hoy.getMonth() === mes && hoy.getFullYear() === año;
                      return (
                        <div
                          key={dia}
                          onClick={() => { setDiaSeleccionado(`${año}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`); setShowModal(true); }}
                          className={`h-20 md:h-24 rounded-2xl p-2 cursor-pointer hover:bg-brand-bg transition-colors group relative flex flex-col ${esHoy ? 'bg-brand-dark' : 'bg-white border border-slate-50'}`}
                        >
                          <span className={`text-xs font-black ${esHoy ? 'text-brand-gold' : 'text-brand-dark'}`}>{dia}</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {evsDia.slice(0, 3).map(ev => (
                              <span key={ev.id} className="w-2 h-2 rounded-full" style={{ backgroundColor: ev.color }}></span>
                            ))}
                            {evsDia.length > 3 && <span className="text-[8px] font-black text-slate-400">+{evsDia.length - 3}</span>}
                          </div>
                          {evsDia.length > 0 && (
                            <div className="absolute left-0 bottom-full mb-2 bg-brand-dark text-white text-[9px] font-black px-3 py-2 rounded-xl shadow-xl z-10 hidden group-hover:block w-40 whitespace-normal">
                              {evsDia.map(ev => <div key={ev.id}>{ev.titulo}</div>)}
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
                      <i className="bi bi-calendar-x text-4xl text-slate-200 block mb-4"></i>
                      <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">No tienes eventos en la agenda</p>
                      <Link to="/eventos" className="text-brand-blue font-black uppercase text-[10px] tracking-widest mt-4 inline-block">
                        Explorar Eventos →
                      </Link>
                    </div>
                  ) : (
                    todosLosEventos
                      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                      .map(ev => (
                        <div key={ev.id} className="flex items-center gap-5 p-5 rounded-2xl bg-brand-bg border border-slate-100 hover:border-brand-blue/20 hover:bg-white transition-all group">
                          <div className="w-2 h-12 rounded-full shrink-0" style={{ backgroundColor: ev.color }}></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-brand-dark uppercase italic text-sm truncate group-hover:text-brand-blue transition-colors">{ev.titulo}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                              {new Date(ev.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${ev.tipo === 'plataforma' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-brand-gold/10 text-brand-dark'
                              }`}>
                              {ev.tipo === 'plataforma' ? 'Favorito' : 'Personal'}
                            </span>
                            {ev.tipo === 'plataforma' ? (
                              <Link to={`/eventos/${ev.id}`} className="w-8 h-8 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all text-sm">
                                <i className="bi bi-arrow-right"></i>
                              </Link>
                            ) : (
                              <button onClick={() => eliminarEvPersonal(ev.id)} className="w-8 h-8 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center hover:bg-brand-red hover:text-white transition-all text-sm">
                                <i className="bi bi-trash3"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL AÑADIR EVENTO ── */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-brand-bg hover:bg-brand-red hover:text-white transition-all flex items-center justify-center text-slate-400">
              <i className="bi bi-x-lg"></i>
            </button>
            <h3 className="text-2xl font-black text-brand-dark italic uppercase tracking-tighter mb-8">
              Añadir a <span className="text-brand-gold">Agenda</span>
            </h3>
            <form onSubmit={handleSaveEvento} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Título</label>
                <input type="text" value={newEvTitulo} onChange={e => setNewEvTitulo(e.target.value)} className="input-field" placeholder="¿Qué vas a hacer?" required />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Fecha</label>
                <input type="date" value={diaSeleccionado} onChange={e => setDiaSeleccionado(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nota (opcional)</label>
                <textarea value={newEvNota} onChange={e => setNewEvNota(e.target.value)} rows={2} className="input-field resize-none" placeholder="Añade una nota..."></textarea>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Color</label>
                <div className="flex gap-2">
                  {COLORES.map(c => (
                    <button type="button" key={c} onClick={() => setNewEvColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${newEvColor === c ? 'ring-2 ring-offset-2 ring-brand-dark scale-110' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <button type="submit" disabled={savingEv} className="w-full bg-brand-dark text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl hover:bg-brand-blue transition-all shadow-lg disabled:opacity-50">
                {savingEv ? 'Guardando...' : 'Guardar en mi Agenda'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendario;