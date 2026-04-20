import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSeoMeta } from '../../hooks/useSeoMeta';
import { useFavoritos } from '../../hooks/useFavoritos';

const Favoritos: React.FC = () => {
  const { session } = useAuth();
  // El hook centralizado gestiona carga, caché y tipado
  const { favoritos, loading } = useFavoritos(session?.user?.id);

  // ── SEO ────────────────────────────────────────────────────────
  useSeoMeta({
    title: 'Mis Favoritos | Mérida Activa',
    description: 'Tus eventos y monumentos favoritos de Mérida guardados en un solo lugar. Organiza tu visita a la capital extremeña.',
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ESTADO VACÍO (Si no hay favoritos)
  if (favoritos.length === 0) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center pt-20 px-6">
        <div className="max-w-xl w-full bg-white rounded-[4rem] p-16 text-center border border-slate-100 shadow-2xl relative overflow-hidden animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-brand-red/10 text-brand-red rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-4xl shadow-inner animate-pulse">
            <i className="bi bi-heart-fill"></i>
          </div>
          <h2 className="text-5xl font-[900] text-brand-dark mb-6 italic uppercase tracking-tighter leading-none">
            Tu rincón <span className="text-brand-blue">Favorito</span>
          </h2>
          <p className="text-slate-400 font-bold text-sm leading-relaxed mb-12 uppercase tracking-widest max-w-sm mx-auto">
            Aún no has guardado nada. Explora la ciudad y marca monumentos o eventos con el corazón.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/eventos" className="bg-brand-red text-white py-5 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all">
              Ver Eventos
            </Link>
            <Link to="/lugares" className="bg-brand-blue text-white py-5 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all">
              Ver Monumentos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // LISTADO DE FAVORITOS (Cuando sí hay datos)
  return (
    <div className="min-h-screen bg-brand-bg pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <h1 className="text-6xl font-[900] text-brand-dark italic uppercase tracking-tighter">
            Mis <span className="text-brand-red">Favoritos</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">
            {favoritos.length} elementos guardados en tu rincón
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {favoritos.map((fav) => {
            const titulo = fav.detalle?.titulo || fav.detalle?.nombre_es || fav.detalle?.nombre || 'Sin título';
            const imagenUrl = fav.detalle?.imagen_url ?? '';
            const ruta = fav.tipo_elemento === 'evento' ? `/eventos/${fav.elemento_id}` : `/lugares/${fav.elemento_id}`;
            return (
            <Link
              key={fav.id}
              to={ruta}
              className="group bg-white rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all border border-slate-100 block relative"
            >
              <div className="relative h-72 overflow-hidden">
                {imagenUrl && (
                  <img
                    src={imagenUrl}
                    alt={titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                )}
                {/* Icono de Corazón Fijo */}
                <div className="absolute top-6 right-6 bg-white shadow-lg w-12 h-12 rounded-2xl flex items-center justify-center text-brand-red text-xl">
                  <i className="bi bi-heart-fill"></i>
                </div>
                <div className="absolute bottom-6 left-6">
                  <span className="bg-brand-dark/90 backdrop-blur-md text-white text-[8px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em]">
                    {fav.tipo_elemento}
                  </span>
                </div>
              </div>

              <div className="p-10">
                <h3 className="text-3xl font-[900] text-brand-dark uppercase italic leading-none mb-4 group-hover:text-brand-blue transition-colors">
                  {titulo}
                </h3>
                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                  <span>Explorar detalles</span>
                  <i className="bi bi-arrow-right"></i>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Favoritos;