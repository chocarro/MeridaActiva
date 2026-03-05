import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import BotonFavorito from '../../componentes/BotonFavorito';


const Lugares: React.FC = () => {
  const [lugares, setLugares] = useState<any[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLugares();
  }, []);

  const fetchLugares = async () => {
    try {
      const { data } = await supabase.from('lugares').select('*').order('nombre_es', { ascending: true });
      if (data) setLugares(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categorias = ['Todos', 'Monumento', 'Parque', 'Plaza', 'Museo'];

  const lugaresProcesados = lugares
    .filter(l => categoriaActiva === 'Todos' ? true : l.categoria === categoriaActiva)
    .sort((a, b) => {
      if (orden === 'asc') return a.nombre_es.localeCompare(b.nombre_es);
      if (orden === 'desc') return b.nombre_es.localeCompare(a.nombre_es);
      return 0;
    });

  if (loading) return (
    <div className="loading-state">
      Explorando Patrimonio...
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title">
            Patrimonio <span className="text-brand-gold">Eterno</span>
          </h2>
          <p className="section-subtitle">Descubre la historia en cada rincón</p>
        </div>

        <div className="filter-toolbar">
          <div className="flex flex-wrap justify-center gap-2">
            {categorias.map(cat => (
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
            onChange={(e: any) => setOrden(e.target.value)}
            className="select-field"
          >
            <option value="asc">Orden Alfabético (A-Z)</option>
            <option value="desc">Orden Alfabético (Z-A)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lugaresProcesados.map((lugar) => (
            <div key={lugar.id} className="card-overlay group">
              <img src={lugar.imagen_url} className="card-overlay-img" alt={lugar.nombre_es} />
              <div className="card-overlay-gradient"></div>

              <div className="absolute top-6 right-6 z-20">
                <BotonFavorito lugarId={lugar.id} tipo="lugar" />
              </div>

              <Link to={`/lugares/${lugar.id}`} className="absolute inset-0 p-10 flex flex-col justify-end z-10">
                <div className="mb-4">
                  <span className="tag-badge">{lugar.categoria}</span>
                </div>
                <h4 className="text-3xl font-black text-white mb-3 uppercase italic tracking-tighter group-hover:text-brand-gold transition-colors leading-none">
                  {lugar.nombre_es}
                </h4>
                <p className="text-slate-300 text-sm line-clamp-2 mb-6 font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {lugar.descripcion_es}
                </p>
                <div className="flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-widest border-t border-white/10 pt-6">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-brand-gold group-hover:text-brand-dark transition-all">
                    <i className="bi bi-geo-alt-fill text-lg text-brand-gold group-hover:text-brand-dark"></i>
                  </div>
                  <span>{lugar.ubicacion}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {lugaresProcesados.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 mt-10">
            <p className="font-black text-slate-400 uppercase tracking-widest">No hay monumentos en esta categoría</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lugares;