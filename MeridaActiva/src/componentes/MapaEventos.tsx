import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';
import L from 'leaflet';

// ... (Icon setup queda igual)

const MapaEventos: React.FC = () => {
  const [eventos, setEventos] = useState<any[]>([]);

  useEffect(() => {
    const fetchEventos = async () => {
      const { data } = await supabase.from('eventos').select('*');
      if (data) setEventos(data.filter(ev => ev.latitud && ev.longitud));
    };
    fetchEventos();
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-[900] text-brand-dark mb-4 italic uppercase tracking-tighter">
            Mérida en el <span className="text-brand-blue">Mapa</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Explora la ciudad en tiempo real</p>
        </div>

        <div className="relative h-[600px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
          <MapContainer center={[38.9161, -6.3437]} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            
            {eventos.map((ev) => (
              <Marker key={ev.id} position={[ev.latitud, ev.longitud]}>
                <Popup>
                  <div className="p-3 font-sauce text-center">
                    <h3 className="text-sm font-[900] text-brand-dark uppercase italic mb-2 leading-tight">
                      {ev.titulo}
                    </h3>
                    <p className="text-[9px] font-black text-brand-blue uppercase tracking-widest mb-3">
                      <i className="bi bi-geo-alt-fill"></i> {ev.ubicacion}
                    </p>
                    <Link 
                      to={`/eventos/${ev.id}`} 
                      className="block bg-brand-dark text-white text-[9px] font-black py-2 rounded-xl hover:bg-brand-gold hover:text-brand-dark transition-all no-underline tracking-widest uppercase"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Badge flotante Premium */}
          <div className="absolute bottom-10 left-10 z-[1000] bg-brand-dark text-white px-8 py-5 rounded-[2rem] shadow-2xl border border-white/10 hidden md:block">
            <p className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] mb-1">Radar Activo</p>
            <p className="text-xl font-[900] italic uppercase tracking-tighter">{eventos.length} Eventos <span className="text-brand-blue">Hoy</span></p>
          </div>
        </div>
      </div>

      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 2rem !important;
          padding: 10px !important;
          border: 1px solid #f1f5f9;
        }
        .leaflet-container { font-family: inherit; }
      `}</style>
    </div>
  );
};

export default MapaEventos;