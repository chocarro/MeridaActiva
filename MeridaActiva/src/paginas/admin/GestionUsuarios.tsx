import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const GestionUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => { fetchUsuarios(); }, []);

  const fetchUsuarios = async () => {
    const { data } = await supabase.from('usuarios').select('*, roles(nombre)').order('nombre', { ascending: true });
    if (data) setUsuarios(data);
    setCargando(false);
  };

  const cambiarRol = async (id: string, nuevoRolId: number) => {
    await supabase.from('usuarios').update({ rol_id: nuevoRolId }).eq('id', id);
    fetchUsuarios();
  };

  const eliminarUsuario = async (id: string, nombre: string) => {
    if (window.confirm(`¿Eliminar al usuario ${nombre}?`)) {
      await supabase.from('usuarios').delete().eq('id', id);
      fetchUsuarios();
    }
  };

  const filtrados = usuarios.filter(u => u.nombre?.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase text-center md:text-left">Comunidad</h2>
            <p className="text-slate-500 font-medium text-center md:text-left">Administración de perfiles y permisos</p>
          </div>
          <div className="relative w-full md:w-96">
            <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 shadow-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          {cargando ? (
            <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Cargando base de datos...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-6">Usuario</th>
                  <th className="px-8 py-6">Rango Actual</th>
                  <th className="px-8 py-6">Cambiar Rol</th>
                  <th className="px-8 py-6 text-center">Borrar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400">
                          {user.nombre?.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900">{user.nombre}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border ${
                        user.roles?.nombre === 'Administrador' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {user.roles?.nombre}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                        value={user.rol_id}
                        onChange={(e) => cambiarRol(user.id, parseInt(e.target.value))}
                      >
                        <option value={1}>Administrador</option>
                        <option value={2}>Usuario</option>
                        <option value={3}>Gestor</option>
                      </select>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button onClick={() => eliminarUsuario(user.id, user.nombre)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                        <i className="bi bi-trash3-fill"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionUsuarios;