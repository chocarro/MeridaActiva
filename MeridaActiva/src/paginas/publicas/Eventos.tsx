import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

const Eventos: React.FC = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [categoriaSel, setCategoriaSel] = useState('Todos');
  const { profile } = useAuth();

  useEffect(() => {
    fetchEventos();
  }, [categoriaSel]);

  const fetchEventos = async () => {
    let query = supabase.from('eventos').select('*');
    if (categoriaSel !== 'Todos') {
      query = query.eq('categoria', categoriaSel);
    }
    const { data } = await query;
    if (data) setEventos(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Encabezado */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Agenda Cultural</h1>
          <p className="text-slate-500">Descubre qué está pasando en Mérida hoy mismo.</p>
        </div>

        {/* Filtros Horizontales */}
        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
          {['Todos', 'Cultural', 'Música', 'Gastronomía', 'Deportes', 'Familiar'].map(cat => (
            <button 
              key={cat}
              onClick={() => setCategoriaSel(cat)}
              className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border
                ${categoriaSel === cat 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-amber-500'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Rejilla de Eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventos.map((evento) => (
            <div key={evento.id} className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={evento.imagen_url || "/img/placeholder.jpg"} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt={evento.titulo} 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900">
                  {evento.categoria}
                </div>
                {profile && (
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-lg">
                    <i className="bi bi-heart-fill"></i>
                  </button>
                )}
              </div>

              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-1">
                  {evento.titulo}
                </h3>
                <div className="flex flex-col gap-2 mb-6">
                  <span className="text-slate-400 text-sm flex items-center gap-2 font-medium">
                     {new Date(evento.fecha).toLocaleDateString()}
                  </span>
                  <span className="text-slate-400 text-sm flex items-center gap-2 font-medium">
                     {evento.ubicacion}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <span className="text-2xl font-black text-slate-900">
                    {evento.precio ? `${evento.precio}€` : 'Gratis'}
                  </span>
                  <Link 
                    to={`/eventos/${evento.id}`} 
                    className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-amber-500 hover:text-slate-900 transition-all"
                  >
                    Detalles
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Eventos;