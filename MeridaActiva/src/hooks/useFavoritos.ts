import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { Favorito } from '../types';

// ── Tipos enriquecidos (con detalle del item relacionado) ─────────
export interface FavoritoConDetalle extends Favorito {
  detalle: {
    id: string;
    titulo?: string;
    nombre?: string;
    nombre_es?: string;
    imagen_url?: string;
  } | null;
}

/**
 * Hook centralizado para cargar los favoritos de un usuario con el
 * detalle de cada item (evento o lugar).
 */
export function useFavoritos(usuarioId: string | undefined) {
  const [favoritos, setFavoritos] = useState<FavoritoConDetalle[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!usuarioId) {
      setFavoritos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Paso 1: obtener todos los favoritos del usuario
      const { data: favsData, error: favErr } = await supabase
        .from('favoritos')
        .select('*')
        .eq('usuario_id', usuarioId);

      if (favErr) {
        console.error('[useFavoritos] Error cargando favoritos:', favErr.message, favErr.code);
        setFavoritos([]);
        return;
      }

      if (!favsData || favsData.length === 0) {
        setFavoritos([]);
        return;
      }

      // Paso 2: separar por tipo y cargar detalles con queries independientes
      const eventoIds = favsData
        .filter((f: any) => f.tipo_elemento === 'evento')
        .map((f: any) => f.elemento_id)
        .filter(Boolean) as string[];

      const lugarIds = favsData
        .filter((f: any) => f.tipo_elemento === 'lugar')
        .map((f: any) => f.elemento_id)
        .filter(Boolean) as string[];

      const eventoMap: Record<string, { id: string; titulo?: string; imagen_url?: string; fecha?: string }> = {};
      const lugarMap: Record<string, { id: string; nombre?: string; nombre_es?: string; imagen_url?: string }> = {};

      if (eventoIds.length > 0) {
        const { data: evs, error: evErr } = await supabase
          .from('eventos')
          .select('id, titulo, imagen_url, fecha')
          .in('id', eventoIds);
        if (evErr) console.error('[useFavoritos] Error cargando eventos:', evErr.message);
        if (evs) (evs as any[]).forEach(e => { eventoMap[e.id] = e; });
      }

      if (lugarIds.length > 0) {
        const { data: lug, error: lugErr } = await supabase
          .from('lugares')
          .select('id, nombre, nombre_es, imagen_url')
          .in('id', lugarIds);
        if (lugErr) console.error('[useFavoritos] Error cargando lugares:', lugErr.message);
        if (lug) (lug as any[]).forEach(l => { lugarMap[l.id] = l; });
      }

      // Filtrar: quitar eventos borrados y pasados
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const resultados: FavoritoConDetalle[] = (favsData as any[]).map(fav => {
        const detalle =
          fav.tipo_elemento === 'evento'
            ? (eventoMap[fav.elemento_id] ?? null)
            : (lugarMap[fav.elemento_id] ?? null);
        return { ...fav, detalle } as FavoritoConDetalle;
      }).filter(fav => {
        // Los lugares siempre se muestran
        if (fav.tipo_elemento !== 'evento') return true;
        // Si el evento ya no existe en BD, lo quitamos
        if (!fav.detalle) return false;
        // Si el evento tiene fecha y ya pasó, lo excluimos
        const fechaEvento = (fav.detalle as any).fecha;
        if (fechaEvento) {
          const fechaDate = new Date(fechaEvento + 'T00:00:00');
          return fechaDate >= hoy;
        }
        return true;
      });

      setFavoritos(resultados);
    } catch (err) {
      console.error('[useFavoritos] Error inesperado:', err);
      setFavoritos([]);
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => { cargar(); }, [cargar]);

  return { favoritos, loading, recargar: cargar };
}
