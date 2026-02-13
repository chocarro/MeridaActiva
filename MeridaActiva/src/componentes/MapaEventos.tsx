import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
      if (data) setEventos(data.filter(ev => ev.latitud && ev.longitud));
    };
    fetchEventos();
  }, []);

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ height: '500px' }}>
      <MapContainer 
        center={[38.9161, -6.3433]} // Centro de Mérida
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {eventos.map(ev => (
          <Marker key={ev.id} position={[ev.latitud, ev.longitud]}>
            <Popup>
              <div className="text-center">
                <img src={ev.imagen_url} alt={ev.titulo} style={{ width: '100px', borderRadius: '5px' }} />
                <h6 className="fw-bold mt-2 mb-0">{ev.titulo}</h6>
                <p className="small text-muted">{ev.categoria}</p>
                <a href={`/eventos/${ev.id}`} className="btn btn-sm btn-primary text-white">Ver Detalles</a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapaEventos;