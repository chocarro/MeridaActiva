import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Props {
  eventoId?: string;
  lugarId?: string;
  tipo?: 'evento' | 'lugar';
}

// ── Helper: llama a la API de favoritos (service_role, bypasea RLS) ──
async function callFavoritosApi(
  method: 'POST' | 'DELETE',
  elementoId: string,
  tipoElemento: 'evento' | 'lugar',
  token: string
): Promise<string | null> {
  const res = await fetch('/api/favoritos', {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ elementoId, tipoElemento }),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    return json.error ?? `Error HTTP ${res.status}`;
  }
  return null; // null = éxito
}

const BotonFavorito = ({ eventoId, lugarId, tipo = 'evento' }: Props) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [pulse, setPulse] = useState(false);

  // Derivar el id del elemento según el tipo
  const elementoId = tipo === 'lugar' ? (lugarId ?? eventoId ?? '') : (eventoId ?? lugarId ?? '');

  useEffect(() => {
    if (session?.user?.id && elementoId) checkStatus();
    else setIsFav(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, elementoId, tipo]);

  const checkStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('id')
        .eq('usuario_id', session!.user.id)
        .eq('elemento_id', elementoId)
        .eq('tipo_elemento', tipo)
        .maybeSingle();

      if (error) {
        console.warn('[BotonFavorito] checkStatus error:', error.message);
        return;
      }
      setIsFav(!!data);
    } catch (err) {
      console.error('[BotonFavorito] checkStatus excepción:', err);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error('¡Inicia sesión para guardar tus favoritos!');
      return;
    }

    if (!elementoId) {
      toast.error('Error: ID del elemento no disponible.');
      return;
    }

    const token = session.access_token;
    setLoading(true);
    setPulse(true);
    setTimeout(() => setPulse(false), 600);

    try {
      if (isFav) {
        // ── ELIMINAR ──────────────────────────────────────────────
        const err = await callFavoritosApi('DELETE', elementoId, tipo, token);
        if (err) {
          console.error('[BotonFavorito] delete error:', err);
          toast.error('No se pudo eliminar de favoritos.');
        } else {
          setIsFav(false);
          toast.success('Eliminado de favoritos');
        }
      } else {
        // ── INSERTAR ──────────────────────────────────────────────
        const err = await callFavoritosApi('POST', elementoId, tipo, token);
        if (err) {
          console.error('[BotonFavorito] insert error:', err);
          toast.error(`No se pudo guardar en favoritos: ${err}`);
        } else {
          setIsFav(true);
          toast.success('¡Añadido a favoritos! ❤️');
        }
      }
    } catch (err) {
      console.error('[BotonFavorito] excepción inesperada:', err);
      toast.error('Error inesperado al actualizar favorito.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      className={`
        relative flex-shrink-0 w-12 h-12 aspect-square rounded-full flex items-center justify-center
        transition-all duration-300 shadow-xl
        ${isFav
          ? 'bg-brand-red text-white shadow-brand-red/40'
          : 'bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-brand-red hover:scale-105'
        }
        ${pulse ? 'scale-125' : 'scale-100'}
        disabled:opacity-60
      `}
    >
      <i
        className={`
          bi bi-heart${isFav ? '-fill' : ''}
          text-xl transition-all duration-300
        `}
      />
    </button>
  );
};

export default BotonFavorito;