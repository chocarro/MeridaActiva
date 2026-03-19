// src/paginas/publicas/RutaCompartida.tsx
// ─────────────────────────────────────────────────────────────────
// Mejora 3 — Lector de Ruta Compartida
//
// Ruta: /ruta/:id
// Lee el ID de la URL → carga el JSON de shared_routes en Supabase
// → muestra el itinerario al usuario que recibe el link de WhatsApp
// ─────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useSeoMeta } from '../../hooks/useSeoMeta';

interface Parada {
  nombre: string;
  descripcion?: string;
  duracion?: string;
  tipo?: string;
}

interface SharedRoute {
  id: string;
  ruta_json: {
    titulo?: string;
    descripcion?: string;
    paradas?: Parada[];
    duracion_total?: string;
    [key: string]: unknown;
  };
  created_at: string;
}

const RutaCompartida: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ruta, setRuta] = useState<SharedRoute | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useSeoMeta({
    title: ruta?.ruta_json?.titulo ? `${ruta.ruta_json.titulo} — MeridaActiva` : 'Ruta compartida — MeridaActiva',
    description: ruta?.ruta_json?.descripcion ?? 'Un itinerario turístico generado con IA para descubrir Mérida.',
  });

  useEffect(() => {
    if (!id) { setError(true); setCargando(false); return; }
    (async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('shared_routes')
          .select('id, ruta_json, created_at')
          .eq('id', id)
          .single();
        if (dbError || !data) throw dbError;
        setRuta(data as SharedRoute);
      } catch {
        setError(true);
      } finally {
        setCargando(false);
      }
    })();
  }, [id]);

  if (cargando) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-brand-dark font-black uppercase tracking-widest text-xs">Cargando ruta…</p>
      </div>
    </div>
  );

  if (error || !ruta) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-brand-red/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
          <i className="bi bi-map text-4xl text-brand-red/40" />
        </div>
        <h2 className="text-3xl font-black uppercase italic text-brand-dark mb-4">Ruta no encontrada</h2>
        <p className="text-slate-400 font-medium mb-8">Este link puede haber expirado o ser incorrecto.</p>
        <Link to="/rutas" className="bg-brand-gold text-brand-dark px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all inline-block">
          Crear mi propia ruta
        </Link>
      </div>
    </div>
  );

  const json = ruta.ruta_json;
  const paradas: Parada[] = Array.isArray(json.paradas) ? json.paradas : [];
  const fecha = new Date(ruta.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Hero */}
      <header className="bg-brand-dark pt-28 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <img src="/Imagenes/teatro-romano-merida_98.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4">
            <i className="bi bi-stars" /> Ruta generada con IA
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
            {json.titulo ?? 'Itinerario por Mérida'}
          </h1>
          {json.descripcion && (
            <p className="text-white/60 font-medium max-w-lg mx-auto">{json.descripcion}</p>
          )}
          <div className="flex items-center justify-center gap-6 mt-6 text-white/40 text-xs font-bold uppercase tracking-widest">
            {json.duracion_total && (
              <span><i className="bi bi-clock mr-1" />{json.duracion_total}</span>
            )}
            <span><i className="bi bi-calendar3 mr-1" />Compartida el {fecha}</span>
            <span><i className="bi bi-geo-alt mr-1" />{paradas.length} paradas</span>
          </div>
        </div>
      </header>

      {/* Paradas del itinerario */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        {paradas.length > 0 ? (
          <div className="space-y-6">
            {paradas.map((parada, i) => (
              <div key={i} className="flex gap-6 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                {/* Número de parada */}
                <div className="w-12 h-12 rounded-2xl bg-brand-gold flex items-center justify-center text-brand-dark font-black text-lg flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-black text-brand-dark uppercase italic tracking-tighter text-xl leading-tight">
                      {parada.nombre}
                    </h3>
                    {parada.duracion && (
                      <span className="text-[9px] font-black bg-brand-bg text-slate-400 px-3 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap flex-shrink-0">
                        <i className="bi bi-clock mr-1" />{parada.duracion}
                      </span>
                    )}
                  </div>
                  {parada.tipo && (
                    <span className="inline-block text-[9px] font-black bg-brand-green/10 text-brand-green px-3 py-1 rounded-full uppercase tracking-widest mb-3">
                      {parada.tipo}
                    </span>
                  )}
                  {parada.descripcion && (
                    <p className="text-slate-500 font-medium leading-relaxed">{parada.descripcion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Si el JSON no tiene estructura de paradas, muestra el JSON raw
          <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm">
            <pre className="text-sm text-slate-600 font-mono whitespace-pre-wrap overflow-auto">
              {JSON.stringify(json, null, 2)}
            </pre>
          </div>
        )}

        {/* CTA para crear tu propia ruta */}
        <div className="mt-16 bg-brand-dark rounded-[2.5rem] p-10 text-center">
          <i className="bi bi-stars text-brand-gold text-4xl mb-4 block" />
          <h3 className="text-white font-black text-2xl italic uppercase tracking-tighter mb-3">
            ¿Quieres tu propia ruta?
          </h3>
          <p className="text-white/50 text-sm font-medium mb-8">
            La IA de MeridaActiva genera itinerarios personalizados en segundos.
          </p>
          <Link
            to="/rutas"
            className="inline-flex items-center gap-2 bg-brand-gold text-brand-dark px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
          >
            <i className="bi bi-stars" />
            Crear mi ruta gratis
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RutaCompartida;
