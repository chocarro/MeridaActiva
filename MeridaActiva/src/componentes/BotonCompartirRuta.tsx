// src/componentes/BotonCompartirRuta.tsx
// ─────────────────────────────────────────────────────────────────
// Mejora 3 — Compartir Ruta Generada
//
// Uso:
//   <BotonCompartirRuta rutaJson={rutaJson} tituloRuta="Mi ruta por Mérida" />
//
// Flujo:
//   1. Guarda el JSON de la ruta en la tabla `shared_routes` de Supabase
//   2. Genera la URL corta: https://merida-activa.vercel.app/ruta/{id}
//   3. Abre wa.me con un mensaje predefinido + el link
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { toastError, toastExito } from '../utils/toast';

interface Props {
  rutaJson: object;
  tituloRuta?: string;
}

const BotonCompartirRuta: React.FC<Props> = ({ rutaJson, tituloRuta = 'Mi ruta por Mérida' }) => {
  const [compartiendo, setCompartiendo] = useState(false);

  const handleCompartir = async () => {
    setCompartiendo(true);
    try {
      // 1. Guardar la ruta en Supabase
      const { data, error } = await supabase
        .from('shared_routes')
        .insert([{ ruta_json: rutaJson }])
        .select('id')
        .single();

      if (error) throw error;

      // 2. Generar la URL pública de la ruta
      const urlBase = window.location.origin; // usa el dominio actual
      const urlRuta = `${urlBase}/ruta/${data.id}`;

      // 3. Copiar al portapapeles
      await navigator.clipboard.writeText(urlRuta).catch(() => {});

      // 4. Abrir WhatsApp con el link
      const mensaje = encodeURIComponent(
        `¡Mira la ruta "${tituloRuta}" que me ha generado la IA en MeridaActiva! 🗺️\n${urlRuta}`
      );
      window.open(`https://wa.me/?text=${mensaje}`, '_blank', 'noopener,noreferrer');

      toastExito('¡Ruta compartida! El link está listo en WhatsApp y copiado.');
    } catch (err) {
      console.error('[CompartirRuta]', err);
      toastError('No se pudo generar el link. Inténtalo de nuevo.');
    } finally {
      setCompartiendo(false);
    }
  };

  return (
    <button
      onClick={handleCompartir}
      disabled={compartiendo}
      className="inline-flex items-center gap-2 bg-[#25D366] text-white font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-2xl hover:bg-[#1ebe5e] transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
      aria-label="Compartir ruta por WhatsApp"
    >
      {compartiendo ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
          Generando link…
        </>
      ) : (
        <>
          <i className="bi bi-whatsapp text-base" />
          Compartir ruta
        </>
      )}
    </button>
  );
};

export default BotonCompartirRuta;
