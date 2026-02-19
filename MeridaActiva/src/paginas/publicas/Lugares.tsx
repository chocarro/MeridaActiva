import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const Lugares: React.FC = () => {
  const [lugares, setLugares] = useState<any[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');

  useEffect(() => {
    const fetchLugares = async () => {
      const { data } = await supabase.from('lugares').select('*').order('created_at', { ascending: false });
      if (data) setLugares(data);
    };
    fetchLugares();
  }, []);

  const lugaresFiltrados = categoriaActiva === 'Todos' 
    ? lugares 
    : lugares.filter(l => l.categoria === categoriaActiva);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Patrimonio y Sabores</h1>
        <p className="text-slate-500 max-w-xl mx-auto font-medium">La guía esencial para no perderte nada en la capital extremeña.</p>
        
        <div className="flex justify-center gap-3 mt-10 flex-wrap">
          {['Todos', 'Monumento', 'Museo', 'Gastronomía'].map(cat => (
            <button 
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`px-8 py-2.5 rounded-full font-bold transition-all border-2
                ${categoriaActiva === cat ? 'bg-amber-500 border-amber-500 text-slate-900 shadow-xl shadow-amber-500/20' : 'bg-white border-slate-100 text-slate-500 hover:border-amber-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {lugaresFiltrados.map(lugar => (
          <a key={lugar.id} href={lugar.google_maps_url} target="_blank" rel="noopener noreferrer" className="group">
            <div className="relative h-[450px] rounded-[2.5rem] overflow-hidden shadow-lg group-hover:shadow-2xl transition-all">
              <img src={lugar.imagen_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={lugar.nombre_es} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <span className="inline-block px-3 py-1 bg-amber-500 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-lg mb-4">
                  {lugar.categoria}
                </span>
                <h4 className="text-2xl font-bold text-white mb-2">{lugar.nombre_es}</h4>
                <p className="text-slate-300 text-sm line-clamp-2 mb-6 font-medium leading-relaxed">
                  {lugar.descripcion_es}
                </p>
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-tighter">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">📍</div>
                  Ver en Google Maps
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Lugares;