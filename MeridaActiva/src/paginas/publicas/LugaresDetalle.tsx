import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

const LugaresDetalle: React.FC = () => {
  const { id } = useParams();
  const { session } = useAuth();
  const [lugar, setLugar] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [esFavorito, setEsFavorito] = useState(false);

  useEffect(() => {
    fetchLugarData();
    if (session?.user) verificarFavorito();
  }, [id, session]);

  const fetchLugarData = async () => {
    const { data } = await supabase.from('lugares').select('*').eq('id', id).single();
    if (data) setLugar(data);
    setCargando(false);
  };

  const verificarFavorito = async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from('favoritos')
      .select('id')
      .eq('usuario_id', session.user.id)
      .eq('elemento_id', id)
      .maybeSingle();
    if (data) setEsFavorito(true);
  };

  const toggleFavorito = async () => {
    if (!session?.user) {
      alert("Inicia sesión para guardar este lugar");
      return;
    }

    try {
      if (esFavorito) {
        const { error } = await supabase
          .from('favoritos_lugares')
          .delete()
          .eq('user_id', session.user.id)
          .eq('lugar_id', id);
        if (error) throw error;
        setEsFavorito(false);
      } else {
        const { error } = await supabase
          .from('favoritos_lugares')
          .insert([{ user_id: session.user.id, lugar_id: id }]);
        if (error) throw error;
        setEsFavorito(true);
      }
    } catch (err: any) {
      console.error("Error:", err.message);
    }
  };

  if (cargando) return <div className="loading-state">Descifrando historia...</div>;
  if (!lugar) return <div className="loading-state text-brand-red">Lugar no encontrado</div>;

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* HERO SECTION */}
      <div className="relative h-[60vh] md:h-[75vh] w-full overflow-hidden">
        <img src={lugar.imagen_url} className="w-full h-full object-cover" alt={lugar.nombre_es} />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent"></div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <span className="tag-badge mb-6 block w-fit shadow-lg">
                {lugar.categoria}
              </span>
              <h1 className="text-5xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-[0.8]">
                {lugar.nombre_es}
              </h1>
            </div>

            <button
              onClick={toggleFavorito}
              className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-2xl transition-all duration-500 shadow-2xl ${esFavorito
                  ? 'bg-brand-red text-white scale-110'
                  : 'bg-white/10 backdrop-blur-xl text-white border border-white/20 hover:bg-white hover:text-brand-dark'
                }`}
            >
              <i className={`bi bi-heart${esFavorito ? '-fill' : ''}`}></i>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* DETALLES */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-sm">
              <h3 className="text-brand-blue font-black uppercase tracking-[0.2em] text-[10px] mb-8 flex items-center gap-3">
                <span className="w-12 h-[2px] bg-brand-gold"></span> Crónica Histórica
              </h3>
              <p className="text-brand-dark text-xl font-medium leading-relaxed opacity-80 whitespace-pre-line">
                {lugar.descripcion_es}
              </p>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-wrap gap-12">
              <div className="flex items-center gap-4">
                <div className="info-chip text-brand-blue">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ubicación</p>
                  <p className="font-bold text-brand-dark">{lugar.ubicacion}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="info-chip text-brand-green">
                  <i className="bi bi-clock-history"></i>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Época Principal</p>
                  <p className="font-bold text-brand-dark">Romana / Siglo I a.C.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR ACCIÓN */}
          <div className="lg:col-span-1">
            <div className="ticket-sidebar">
              <div className="relative z-10">
                <h4 className="text-brand-gold font-black uppercase italic tracking-widest text-lg mb-8">Planifica</h4>

                <div className="space-y-6 mb-12">
                  <div className="flex items-center gap-4">
                    <i className="bi bi-ticket-perforated text-brand-gold text-2xl"></i>
                    <div>
                      <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Entrada</p>
                      <p className="font-bold text-sm italic">Acceso Libre / Gratuito</p>
                    </div>
                  </div>
                </div>

                <a
                  href={lugar.enlace_google_maps}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full bg-brand-blue text-white py-6 rounded-[1.5rem] font-black text-center shadow-lg hover:bg-brand-gold hover:text-brand-dark transition-all uppercase tracking-[0.2em] text-[10px]"
                >
                  <i className="bi bi-google mr-2"></i> Cómo Llegar
                </a>
              </div>

              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-blue/10 rounded-full blur-3xl"></div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-red/5 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LugaresDetalle;