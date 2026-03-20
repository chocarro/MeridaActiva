import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const GestionUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => { fetchUsuarios(); }, []);

  const fetchUsuarios = async () => {
    // Tabla correcta: 'usuarios'
    const { data } = await supabase.from('usuarios').select('*, roles(nombre)').order('nombre', { ascending: true });
    if (data) setUsuarios(data);
  };

  const cambiarRol = async (id: string, nuevoRolId: number) => {
    await supabase.from('usuarios').update({ rol_id: nuevoRolId }).eq('id', id);
    fetchUsuarios();
  };

  const eliminarUsuario = async (id: string, nombre: string) => {
    if (window.confirm(`¿Eliminar permanentemente el perfil de ${nombre}?`)) {
      await supabase.from('usuarios').delete().eq('id', id);
      fetchUsuarios();
    }
  };

  const filtrados = usuarios.filter(u => u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || u.email?.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div className="min-h-screen bg-brand-dark pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-10">
          <div>
            <h2 className="text-6xl font-[900] text-white italic uppercase tracking-tighter leading-none">
              Control de <span className="text-brand-gold">Seguridad</span>
            </h2>
            <p className="text-white/30 font-black uppercase text-[10px] tracking-[0.3em] mt-4 ml-1">Administración de perfiles y roles críticos</p>
          </div>

          <div className="relative w-full md:w-96 group">
            <i className="bi bi-search absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-gold transition-colors"></i>
            <input
              type="text"
              placeholder="BUSCAR POR NOMBRE O EMAIL..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-brand-gold/50 transition-all"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </header>

        {/* LISTADO USUARIOS ESTILO DARK BENTO */}
        <div className="bg-white/5 rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                <th className="px-12 py-10">Identidad Digital</th>
                <th className="px-8 py-10">Nivel de Acceso</th>
                <th className="px-8 py-10">Asignar Rol</th>
                <th className="px-12 py-10 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtrados.map(user => (
                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold font-[900] italic text-xl shadow-inner">
                        {user.nombre?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-[900] text-white uppercase italic text-lg leading-none mb-1">{user.nombre}</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter italic">{user.id.substring(0, 20)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${user.roles?.nombre === 'Administrador' ? 'bg-brand-gold text-brand-dark border-brand-gold' : 'bg-white/5 text-white/60 border-white/10'
                      }`}>
                      {user.roles?.nombre || 'Usuario'}
                    </span>
                  </td>
                  <td className="px-8 py-8">
                    <select
                      className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black text-white uppercase tracking-widest outline-none focus:border-brand-gold transition-all"
                      value={user.rol_id}
                      onChange={(e) => cambiarRol(user.id, parseInt(e.target.value))}
                    >
                      <option value={1}>Administrador</option>
                      <option value={2}>Usuario Estándar</option>
                    </select>
                  </td>
                  <td className="px-12 py-8 text-center">
                    <button
                      onClick={() => eliminarUsuario(user.id, user.nombre)}
                      className="w-12 h-12 rounded-2xl bg-white/5 text-white/20 hover:bg-brand-red hover:text-white transition-all shadow-lg active:scale-90"
                    >
                      <i className="bi bi-trash3-fill"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtrados.length === 0 && (
            <div className="py-20 text-center">
              <i className="bi bi-person-exclamation text-5xl text-white/10 mb-4 block"></i>
              <p className="text-white/20 font-black uppercase tracking-widest text-xs">No se han encontrado perfiles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionUsuarios;