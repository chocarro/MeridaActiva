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
 *
 * Se usa tanto en /favoritos como en /perfil para evitar duplicar lógica.
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
      const { data: favsData } = await supabase
        .from('favoritos')
        .select('id, elemento_id, tipo_elemento, usuario_id')
        .eq('usuario_id', usuarioId);

      if (!favsData || favsData.length === 0) {
        setFavoritos([]);
        return;
      }

      // Cargamos detalles en paralelo para cada favorito
      const detallesPromesas = favsData.map(async (fav) => {
        const tabla = fav.tipo_elemento === 'evento' ? 'eventos' : 'lugares';
        const campos = fav.tipo_elemento === 'evento'
          ? 'id, titulo, imagen_url'
          : 'id, nombre, nombre_es, imagen_url';

        const { data: detalle } = await supabase
          .from(tabla)
          .select(campos)
          .eq('id', fav.elemento_id)
          .maybeSingle();

        return { ...fav, detalle: detalle as FavoritoConDetalle['detalle'] };
      });

      const resultados = await Promise.all(detallesPromesas);
      setFavoritos(resultados.filter(f => f.detalle !== null));
    } catch {
      setFavoritos([]);
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => { cargar(); }, [cargar]);

  return { favoritos, loading, recargar: cargar };
}
