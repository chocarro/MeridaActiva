import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  profile: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, profile: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        // Si el refresh token es inválido (sesión caducada), limpiar y continuar como no autenticado
        if (error && (error.message?.includes('Refresh Token') || error.message?.includes('refresh_token'))) {
          console.warn('Sesión expirada o inválida — cerrando sesión automáticamente.');
          await supabase.auth.signOut();
          setSession(null);
          setLoading(false);
          return;
        }
        setSession(session);
        if (session) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false); 
        }
      } catch (error) {
        console.error("Error inicializando sesión:", error);
        await supabase.auth.signOut().catch(() => {});
        setSession(null);
        setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

const fetchProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`*, roles (nombre)`) 
      .eq('id', userId)
      .maybeSingle(); 

    if (error) {
      console.warn("Error leyendo perfil:", error.message);
    }
    
    setProfile(data || null); 
    // console.error("Error crítico en perfil:", err); // <-- BORRA ESTA LÍNEA (causa el error)
  } catch (error) {
    console.error("Error en fetchProfile:", error);
  } finally {
    setLoading(false); 
  }
};

  return (
    <AuthContext.Provider value={{ session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);