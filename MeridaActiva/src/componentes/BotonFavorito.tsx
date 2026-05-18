import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toggleFavoritoApi } from '../utils/favoritosApi';
import toast from 'react-hot-toast';

interface Props {
  eventoId?: string;
  lugarId?: string;
  tipo?: 'evento' | 'lugar';
}

const BotonFavorito = ({ eventoId, lugarId, tipo = 'evento' }: Props) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [pulse, setPulse] = useState(false);

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
      if (error) console.warn('[BotonFavorito] checkStatus:', error.message);
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
    if (!elementoId) return;

    setLoading(true);
    setPulse(true);
    setTimeout(() => setPulse(false), 600);

    try {
      const aplicarToggle = async (usarApi: boolean) => {
        if (usarApi) {
          await toggleFavoritoApi(elementoId, tipo, isFav);
          return;
        }
        if (isFav) {
          const { error } = await supabase
            .from('favoritos')
            .delete()
            .eq('usuario_id', session.user.id)
            .eq('elemento_id', elementoId)
            .eq('tipo_elemento', tipo);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('favoritos')
            .insert({ usuario_id: session.user.id, elemento_id: elementoId, tipo_elemento: tipo });
          if (error) {
            if (error.code === '23505') return;
            throw error;
          }
        }
      };

      try {
        await aplicarToggle(false);
      } catch {
        await aplicarToggle(true);
      }

      if (isFav) {
        setIsFav(false);
        toast.success('Eliminado de favoritos');
      } else {
        setIsFav(true);
        toast.success('¡Añadido a favoritos! ❤️');
      }
    } catch (err) {
      console.error('[BotonFavorito] excepción:', err);
      toast.error('Error inesperado.');
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
        relative flex-shrink-0 w-10 h-10 aspect-square rounded-full flex items-center justify-center
        transition-all duration-300 shadow-lg
        ${isFav
          ? 'bg-brand-red text-white shadow-brand-red/40'
          : 'bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-brand-red hover:scale-105'
        }
        ${pulse ? 'scale-125' : 'scale-100'}
        disabled:opacity-60
      `}
    >
      <i className={`bi bi-heart${isFav ? '-fill' : ''} text-base transition-all duration-300`} />
    </button>
  );
};

export default BotonFavorito;