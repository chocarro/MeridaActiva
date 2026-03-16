import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
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

  const elementoId = eventoId ?? lugarId ?? '';

  useEffect(() => {
    if (session?.user?.id && elementoId) checkStatus();
  }, [session, elementoId]);

  const checkStatus = async () => {
    try {
      const { data } = await supabase
        .from('favoritos')
        .select('id')
        .eq('usuario_id', session?.user.id)
        .eq('elemento_id', elementoId)
        .eq('tipo_elemento', tipo)
        .maybeSingle();
      setIsFav(!!data);
    } catch (error) {
      console.error('Error al comprobar favorito:', error);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error('¡Inicia sesión para guardar tus favoritos!');
      return;
    }

    setLoading(true);
    setPulse(true);
    setTimeout(() => setPulse(false), 600);

    try {
      if (isFav) {
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('usuario_id', session.user.id)
          .eq('elemento_id', elementoId)
          .eq('tipo_elemento', tipo);
        if (!error) {
          setIsFav(false);
          toast.success('Eliminado de favoritos');
        }
      } else {
        const { error } = await supabase
          .from('favoritos')
          .insert({ usuario_id: session.user.id, elemento_id: elementoId, tipo_elemento: tipo });
        if (!error) {
          setIsFav(true);
          toast.success('¡Añadido a favoritos! ❤️');
        }
      }
    } catch (error) {
      console.error('Error en favorito:', error);
      toast.error('Error al actualizar favorito');
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