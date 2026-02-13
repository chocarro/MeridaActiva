import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const GestionUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    // Obtenemos usuarios uniendo la tabla de roles para ver el nombre del rol
    const { data, error } = await supabase
      .from('usuarios')
      .select('*, roles(nombre)')
      .order('nombre', { ascending: true });
    
    if (data) setUsuarios(data);
    setCargando(false);
  };

  const cambiarRol = async (id: string, nuevoRolId: number) => {
    const { error } = await supabase
      .from('usuarios')
      .update({ rol_id: nuevoRolId })
      .eq('id', id);
    
    if (!error) fetchUsuarios(); // Recargamos para ver los cambios
  };

  const eliminarUsuario = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${nombre}? Esta acción es irreversible.`)) {
      const { error } = await supabase.from('usuarios').delete().eq('id', id);
      if (!error) fetchUsuarios();
    }
  };

  // Filtro de búsqueda en tiempo real
  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
    u.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container py-5 mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold"><i className="bi bi-people-fill text-warning me-2"></i>Control de Usuarios</h2>
        <span className="badge bg-dark rounded-pill px-3 py-2">{usuarios.length} Registrados</span>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="row mb-4 g-3">
        <div className="col-md-8">
          <div className="input-group shadow-sm rounded-4 overflow-hidden">
            <span className="input-group-text bg-white border-0"><i className="bi bi-search"></i></span>
            <input 
              type="text" 
              className="form-control border-0" 
              placeholder="Buscar por nombre o correo..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4 text-end">
          <button className="btn btn-outline-dark rounded-pill shadow-sm" onClick={fetchUsuarios}>
            <i className="bi bi-arrow-clockwise me-2"></i>Actualizar
          </button>
        </div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Usuario</th>
                <th>Rol Actual</th>
                <th>Cambiar Rango</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={4} className="text-center py-5">Cargando base de datos...</td></tr>
              ) : usuariosFiltrados.map((user) => (
                <tr key={user.id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-secondary-subtle rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{width: '40px', height: '40px'}}>
                        {user.nombre?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="mb-0 fw-bold">{user.nombre}</p>
                        <small className="text-muted">{user.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge rounded-pill ${
                      user.roles?.nombre === 'Administrador' ? 'bg-danger' : 
                      user.roles?.nombre === 'Gestor (Editor)' ? 'bg-primary' : 'bg-secondary'
                    }`}>
                      {user.roles?.nombre}
                    </span>
                  </td>
                  <td>
                    {/* Select dinámico para cambiar roles */}
                    <select 
                      className="form-select form-select-sm rounded-pill w-auto"
                      value={user.rol_id}
                      onChange={(e) => cambiarRol(user.id, parseInt(e.target.value))}
                    >
                      <option value={1}>Administrador</option>
                      <option value={2}>Usuario Registrado</option>
                      <option value={3}>Invitado / Gestor</option>
                      <option value={5}>Administrador (Alt)</option>
                      <option value={6}>Usuario Registrado (Alt)</option>
                    </select>
                  </td>
                  <td className="text-center">
                    <button 
                      onClick={() => eliminarUsuario(user.id, user.nombre)}
                      className="btn btn-sm btn-outline-danger border-0 rounded-circle"
                      title="Eliminar usuario"
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GestionUsuarios;