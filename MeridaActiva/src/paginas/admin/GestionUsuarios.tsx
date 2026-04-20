import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { getNombreRolUsuario } from '../../utils/perfilUsuario';

type EstadoUsuario = 'Activo' | 'Suspendido';

interface Usuario {
  id: string;
  nombre: string;
  email?: string;
  rol_id: number;
  estado?: EstadoUsuario;
  roles?: { nombre: string };
}

interface Rol {
  id: number;
  nombre: string;
}

const POR_PAGINA = 10;

const GestionUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [paginaActual, setPaginaActual] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cambiando, setCambiando] = useState<string | null>(null);

  const totalPaginas = Math.ceil(totalUsuarios / POR_PAGINA);

  // ── Fetch paginado con búsqueda ─────────────────────────────
  const fetchUsuarios = async (pagina = paginaActual, q = busqueda) => {
    setLoading(true);
    setErrorMsg(null);
    const from = pagina * POR_PAGINA;
    const to = from + POR_PAGINA - 1;

    let query = supabase
      .from('usuarios')
      .select('*, roles(nombre)', { count: 'exact' })
      .order('nombre', { ascending: true })
      .range(from, to);

    if (q.trim()) {
      const safe = q.trim();
      query = query.or(`nombre.ilike.%${safe}%,email.ilike.%${safe}%`);
    }

    const { data, count, error } = await query;
    if (error) {
      setErrorMsg('No se pudieron cargar los usuarios.');
      setLoading(false);
      return;
    }

    if (data) setUsuarios(data as Usuario[]);
    if (count !== null) setTotalUsuarios(count);
    setLoading(false);
  };

  const fetchRoles = async () => {
    const { data } = await supabase.from('roles').select('id,nombre').order('id', { ascending: true });
    if (data) setRoles(data as Rol[]);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsuarios(paginaActual, busqueda);
  }, [paginaActual, busqueda]);

  const cambiarPagina = (nueva: number) => {
    if (nueva < 0 || nueva >= totalPaginas) return;
    setPaginaActual(nueva);
  };

  // ── Cambiar rol ─────────────────────────────────────────────
  const cambiarRol = async (id: string, nuevoRolId: number) => {
    setCambiando(id);
    const { error } = await supabase.from('usuarios').update({ rol_id: nuevoRolId }).eq('id', id);
    if (error) setErrorMsg('No se pudo actualizar el rol.');
    setCambiando(null);
    fetchUsuarios(paginaActual);
  };

  // ── SOFT DELETE: Suspender / Reactivar ──────────────────────
  const toggleEstado = async (user: Usuario) => {
    const nuevoEstado: EstadoUsuario = user.estado === 'Suspendido' ? 'Activo' : 'Suspendido';
    const accion = nuevoEstado === 'Suspendido' ? 'suspender' : 'reactivar';

    if (!window.confirm(`¿Quieres ${accion} la cuenta de ${user.nombre}?`)) return;

    setCambiando(user.id);
    try {
      await supabase
        .from('usuarios')
        .update({ estado: nuevoEstado })
        .eq('id', user.id);
      fetchUsuarios(paginaActual, busqueda);
    } catch {
      alert('No se pudo cambiar el estado del usuario.');
    } finally {
      setCambiando(null);
    }
  };

  // ── Filtro local por búsqueda ───────────────────────────────
  return (
    <div className="min-h-screen bg-brand-dark pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-10">
          <div>
            <h2 className="text-6xl font-[900] text-white italic uppercase tracking-tighter leading-none">
              Control de <span className="text-brand-gold">Seguridad</span>
            </h2>
            <p className="text-white/30 font-black uppercase text-[10px] tracking-[0.3em] mt-4 ml-1">
              {totalUsuarios} usuario{totalUsuarios !== 1 ? 's' : ''} · Página {paginaActual + 1} de {totalPaginas || 1}
            </p>
          </div>

          <div className="relative w-full md:w-96 group">
            <i className="bi bi-search absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-gold transition-colors" />
            <input
              type="text"
              placeholder="BUSCAR POR NOMBRE O EMAIL..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-brand-gold/50 transition-all"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </header>

        {/* ── TABLA USUARIOS ── */}
        <div className="bg-white/5 rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                <th className="px-12 py-10">Identidad Digital</th>
                <th className="px-8 py-10">Estado</th>
                <th className="px-8 py-10">Nivel de Acceso</th>
                <th className="px-8 py-10">Asignar Rol</th>
                <th className="px-12 py-10 text-center">Suspender</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {usuarios.map(user => {
                const suspendido = user.estado === 'Suspendido';
                return (
                  <tr key={user.id} className={`group transition-colors ${suspendido ? 'opacity-50' : 'hover:bg-white/[0.02]'}`}>
                    {/* Identidad */}
                    <td className="px-12 py-8">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-[900] italic text-xl shadow-inner ${suspendido ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-gold/10 text-brand-gold'}`}>
                          {user.nombre?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-[900] text-white uppercase italic text-lg leading-none mb-1">{user.nombre}</p>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter italic">
                            {user.email || `${user.id.substring(0, 20)}…`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Estado (Activo / Suspendido) */}
                    <td className="px-8 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        suspendido
                          ? 'bg-brand-red/10 text-brand-red border-brand-red/30'
                          : 'bg-brand-green/10 text-brand-green border-brand-green/30'
                      }`}>
                        {suspendido ? 'Suspendido' : 'Activo'}
                      </span>
                    </td>

                    {/* Nivel de acceso */}
                    <td className="px-8 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        getNombreRolUsuario(user) === 'Administrador'
                          ? 'bg-brand-gold text-brand-dark border-brand-gold'
                          : 'bg-white/5 text-white/60 border-white/10'
                      }`}>
                        {getNombreRolUsuario(user) || 'Usuario'}
                      </span>
                    </td>

                    {/* Asignar rol */}
                    <td className="px-8 py-8">
                      <select
                        className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black text-white uppercase tracking-widest outline-none focus:border-brand-gold transition-all disabled:opacity-40"
                        value={user.rol_id}
                        disabled={suspendido || cambiando === user.id}
                        onChange={e => cambiarRol(user.id, parseInt(e.target.value))}
                      >
                        {roles.length > 0 ? (
                          roles.map((rol) => (
                            <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                          ))
                        ) : (
                          <>
                            <option value={1}>Administrador</option>
                            <option value={2}>Usuario Estándar</option>
                          </>
                        )}
                      </select>
                    </td>

                    {/* Acción suspender / reactivar */}
                    <td className="px-12 py-8 text-center">
                      <button
                        onClick={() => toggleEstado(user)}
                        disabled={cambiando === user.id}
                        title={suspendido ? 'Reactivar cuenta' : 'Suspender cuenta'}
                        className={`w-12 h-12 rounded-2xl transition-all shadow-lg active:scale-90 disabled:opacity-40 ${
                          suspendido
                            ? 'bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white'
                            : 'bg-white/5 text-white/30 hover:bg-brand-red hover:text-white'
                        }`}
                      >
                        {cambiando === user.id ? (
                          <svg className="animate-spin w-4 h-4 mx-auto" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <i className={`bi ${suspendido ? 'bi-person-check-fill' : 'bi-person-slash'}`} />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {loading && (
            <div className="py-16 text-center">
              <p className="text-white/30 font-black uppercase tracking-widest text-xs">Cargando usuarios…</p>
            </div>
          )}

          {!loading && errorMsg && (
            <div className="py-12 text-center">
              <p className="text-brand-red font-black uppercase tracking-widest text-xs">{errorMsg}</p>
            </div>
          )}

          {!loading && !errorMsg && usuarios.length === 0 && (
            <div className="py-20 text-center">
              <i className="bi bi-person-exclamation text-5xl text-white/10 mb-4 block" />
              <p className="text-white/20 font-black uppercase tracking-widest text-xs">No se han encontrado perfiles</p>
            </div>
          )}

          {/* ── PAGINACIÓN ── */}
          {totalPaginas > 1 && !loading && (
            <div className="flex items-center justify-between px-12 py-6 border-t border-white/5">
              <button
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <i className="bi bi-chevron-left" /> Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPaginas }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => cambiarPagina(i)}
                    className={`w-8 h-8 rounded-lg font-black text-[10px] transition-all ${i === paginaActual ? 'bg-brand-gold text-brand-dark' : 'text-white/30 hover:bg-white/10'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual >= totalPaginas - 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Siguiente <i className="bi bi-chevron-right" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GestionUsuarios;