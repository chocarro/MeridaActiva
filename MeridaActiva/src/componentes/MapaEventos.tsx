import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom'; // Asegúrate de importar Link
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';
import L from 'leaflet';

// Corregir iconos de Leaflet en React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapaEventos: React.FC = () => {
  const [eventos, setEventos] = useState<any[]>([]);

  useEffect(() => {
    const fetchEventos = async () => {
      const { data } = await supabase.from('eventos').select('*');
      // Filtramos solo los que tienen coordenadas
      if (data) setEventos(data.filter(ev => ev.latitud && ev.longitud));
    };
    fetchEventos();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Cabecera del Mapa */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Mapa Interactivo</h1>
          <p className="text-slate-500 font-medium">Encuentra tus eventos favoritos distribuidos por toda la ciudad de Mérida.</p>
        </div>

        {/* Contenedor del Mapa con Estilo Tailwind */}
        <div className="relative w-full h-[650px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
          <MapContainer 
            center={[38.9161, -6.3433]}
            zoom={14} 
            className="w-full h-full z-10"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            
            {eventos.map(ev => (
              <Marker key={ev.id} position={[ev.latitud, ev.longitud]}>
                <Popup className="custom-popup">
                  <div className="w-48 p-1 text-center font-sans">
                    <img 
                      src={ev.imagen_url || "/imagenes/placeholder.jpg"} 
                      alt={ev.titulo} 
                      className="w-full h-24 object-cover rounded-xl mb-3 shadow-sm" 
                    />
                    <h6 className="font-bold text-slate-900 text-sm mb-1 leading-tight">{ev.titulo}</h6>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">
                      📍 {ev.ubicacion}
                    </p>
                    <Link 
                      to={`/eventos/${ev.id}`} 
                      className="inline-block w-full bg-slate-900 text-white text-[10px] font-black py-2 rounded-lg hover:bg-amber-500 hover:text-slate-900 transition-all no-underline"
                    >
                      VER DETALLES
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Badge flotante sobre el mapa */}
          <div className="absolute bottom-8 left-8 z-20 bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-xl border border-slate-100 hidden md:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Eventos</p>
            <p className="text-2xl font-black text-slate-900">{eventos.length} Localizaciones</p>
          </div>
        </div>

      </div>

      {/* Estilos específicos para limpiar el diseño de los Popups de Leaflet */}
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 1.5rem !important;
          padding: 8px !important;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1) !important;
        }
        .leaflet-popup-tip {
          display: none;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

export default MapaEventos;