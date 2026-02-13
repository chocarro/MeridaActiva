import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const GestionEventos: React.FC = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  
  // NUEVO: Estado para el archivo local
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    ubicacion: '',
    precio: '',
    imagen_url: '',
    enlace_externo: '',
    categoria: 'Cultural'
  });

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    const { data } = await supabase
      .from('eventos')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setEventos(data);
  };

  // NUEVO: Función para subir la imagen al Storage de Supabase
  const manejarSubidaImagen = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`; // Genera nombre único
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('imagenes-eventos') // Tu bucket
      .upload(filePath, file);

    if (error) throw error;

    // Obtener la URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('imagenes-eventos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const prepararEdicion = (ev: any) => {
    setFormData({
      titulo: ev.titulo || '',
      descripcion: ev.descripcion || '',
      fecha: ev.fecha || '',
      ubicacion: ev.ubicacion || '',
      precio: ev.precio || '',
      imagen_url: ev.imagen_url || '',
      enlace_externo: ev.enlace_externo || '',
      categoria: ev.categoria || 'Cultural'
    });
    setEditandoId(ev.id);
    setMostrarForm(true);
  };

  const guardarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubiendo(true);
    
    try {
      let urlFinal = formData.imagen_url;

      // Si hay un archivo local seleccionado, lo subimos primero
      if (archivo) {
        urlFinal = await manejarSubidaImagen(archivo);
      }

      const datosAGuardar = { ...formData, imagen_url: urlFinal };

      if (editandoId) {
        await supabase.from('eventos').update(datosAGuardar).eq('id', editandoId);
        alert("Evento modificado correctamente");
      } else {
        await supabase.from('eventos').insert([datosAGuardar]);
        alert("Evento creado y publicado");
      }

      limpiarFormulario();
      fetchEventos();
    } catch (error: any) {
      alert("Error al guardar: " + error.message);
    } finally {
      setSubiendo(false);
    }
  };

  const eliminarEvento = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este evento?")) {
      const { error } = await supabase.from('eventos').delete().eq('id', id);
      if (!error) fetchEventos();
    }
  };

  const limpiarFormulario = () => {
    setMostrarForm(false);
    setEditandoId(null);
    setArchivo(null); // Limpiamos el archivo
    setFormData({ 
      titulo: '', descripcion: '', fecha: '', ubicacion: '', 
      precio: '', imagen_url: '', enlace_externo: '', categoria: 'Cultural' 
    });
  };

  return (
    <div className="container py-5 mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          <i className="bi bi-calendar-plus text-primary me-2"></i>
          {editandoId ? 'Editando Evento' : 'Gestión de Contenidos'}
        </h2>
        <button 
          onClick={() => { editandoId ? limpiarFormulario() : setMostrarForm(!mostrarForm) }} 
          className={`btn rounded-pill px-4 ${mostrarForm ? 'btn-outline-danger' : 'btn-primary'}`}
        >
          {mostrarForm ? 'Cancelar' : '+ Publicar Evento'}
        </button>
      </div>

      {mostrarForm && (
        <div className="card border-0 shadow-sm p-4 mb-5 rounded-4 bg-light text-dark text-start">
          <form onSubmit={guardarEvento} className="row g-3">
            <div className="col-md-8">
              <label className="form-label fw-bold">Título del Evento</label>
              <input type="text" className="form-control" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} required />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">Categoría</label>
              <select className="form-select" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                <option value="Cultural">Cultural</option>
                <option value="Música">Música</option>
                <option value="Gastronomía">Gastronomía</option>
                <option value="Deportes">Deportes</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">Fecha</label>
              <input type="date" className="form-control" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} required />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">Precio</label>
              <input type="text" className="form-control" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} placeholder="Ej: Gratis / 25€" />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">Ubicación</label>
              <input type="text" className="form-control" value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} placeholder="Mérida" />
            </div>
            <div className="col-12 text-start">
              <label className="form-label fw-bold">Descripción Completa</label>
              <textarea className="form-control" rows={3} value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})}></textarea>
            </div>

            {/* SECCIÓN DE IMAGEN MEJORADA */}
            <div className="col-md-6 text-start">
              <label className="form-label fw-bold">Subir Foto Local</label>
              <input 
                type="file" 
                className="form-control" 
                accept="image/*" 
                onChange={e => setArchivo(e.target.files ? e.target.files[0] : null)} 
              />
              <small className="text-muted">Selecciona una imagen de tu ordenador.</small>
            </div>
            <div className="col-md-6 text-start">
              <label className="form-label fw-bold">O URL de Imagen</label>
              <input type="text" className="form-control" value={formData.imagen_url} onChange={e => setFormData({...formData, imagen_url: e.target.value})} placeholder="https://..." />
            </div>

            <div className="col-12 text-end mt-4">
              <button type="submit" className="btn btn-dark px-5 rounded-pill fw-bold shadow-sm" disabled={subiendo}>
                {subiendo ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Subiendo...
                  </>
                ) : (
                  editandoId ? 'Guardar Cambios' : 'Publicar en la Web'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de gestión */}
      <div className="bg-white rounded-4 shadow-sm p-3 border">
        <div className="table-responsive">
          <table className="table align-middle text-start">
            <thead className="table-light">
              <tr>
                <th>Evento</th>
                <th>Categoría</th>
                <th>Ubicación</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map(ev => (
                <tr key={ev.id}>
                  <td>
                    <strong>{ev.titulo}</strong><br/>
                    <small className="text-muted"><i className="bi bi-calendar-event me-1"></i>{ev.fecha}</small>
                  </td>
                  <td><span className="badge bg-light text-dark border">{ev.categoria}</span></td>
                  <td className="small text-muted">{ev.ubicacion}</td>
                  <td className="text-end">
                    <button onClick={() => prepararEdicion(ev)} className="btn btn-sm btn-outline-primary border-0 me-2">
                      <i className="bi bi-pencil-square"></i> Editar
                    </button>
                    <button onClick={() => eliminarEvento(ev.id)} className="btn btn-sm btn-outline-danger border-0">
                      <i className="bi bi-trash"></i> Borrar
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

export default GestionEventos;