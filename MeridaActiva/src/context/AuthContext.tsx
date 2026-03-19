import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';

// ─────────────────────────────────────────────
// Helpers para detectar errores de storage/lock
// ─────────────────────────────────────────────
const isLockOrStorageError = (err: unknown): boolean => {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('Lock broken') ||
    msg.includes('AuthApiError') ||
    msg.includes('Failed to acquire lock') ||
    msg.includes('localStorage') ||
    msg.includes('storage')
  );
};

const isInvalidTokenError = (msg?: string): boolean => {
  if (!msg) return false;
  return (
    msg.includes('Refresh Token') ||
    msg.includes('refresh_token') ||
    msg.includes('Invalid Refresh Token') ||
    msg.includes('AuthApiError')
  );
};

// ─────────────────────────────────────────────
// Tipos y contexto
// ─────────────────────────────────────────────
interface AuthContextType {
  session: Session | null;
  profile: any | null;
  loading: boolean;
  forceNuclearLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  loading: true,
  forceNuclearLogout: async () => {},
});

// ─────────────────────────────────────────────
// Nuclear Logout — limpia TODO el estado de auth
// pase lo que pase con la sesión de Supabase
// ─────────────────────────────────────────────
export const forceNuclearLogout = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('[NuclearLogout] signOut falló (esperado si token corrupto):', e);
  } finally {
    // Barrer todas las claves de Supabase del localStorage
    const keysToDelete = Object.keys(localStorage).filter(k => k.startsWith('sb-'));
    keysToDelete.forEach(k => localStorage.removeItem(k));
    // Redirigir con recarga total de la app
    window.location.href = '/';
  }
};

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession]   = useState<Session | null>(null);
  const [profile, setProfile]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let isMounted = true;

    // ── VÁLVULA DE ESCAPE: timeout de 5 segundos ──────────────────────────
    // Si algo falla silenciosamente y loading sigue en true, forzamos
    // setLoading(false) para que la app nunca quede bloqueada en pantalla de carga.
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        console.warn(
          '[AuthContext] Timeout de seguridad alcanzado (5s). ' +
          'Forzando loading=false para desbloquear la aplicación.'
        );
        setLoading(false);
      }
    }, 5000);

    // ── INICIALIZACIÓN DE SESIÓN ──────────────────────────────────────────
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        // Caso 1: error de token inválido / sesión expirada → Nuclear Logout
        if (error && isInvalidTokenError(error.message)) {
          console.warn('[AuthContext] Token inválido detectado — ejecutando Nuclear Logout.');
          // Limpiar claves sb- del localStorage directamente (no esperamos a signOut)
          Object.keys(localStorage).filter(k => k.startsWith('sb-')).forEach(k => localStorage.removeItem(k));
          await supabase.auth.signOut().catch(() => {});
          if (isMounted) {
            setSession(null);
            setProfile(null);
            clearTimeout(safetyTimer);
            setLoading(false);
          }
          return;
        }

        // Caso 2: otro tipo de error en getSession
        if (error) {
          // Silenciamos errores de Lock/Storage para no romper el render
          if (isLockOrStorageError(error)) {
            console.warn('[AuthContext] Error de storage/lock ignorado:', error.message);
          } else {
            console.error('[AuthContext] Error en getSession:', error.message);
          }
          await supabase.auth.signOut().catch(() => {});
          if (isMounted) {
            setSession(null);
            setProfile(null);
            clearTimeout(safetyTimer);
            setLoading(false);
          }
          return;
        }

        // Caso 3: sesión obtenida correctamente
        if (isMounted) {
          setSession(session);
          if (session) {
            await fetchProfile(session.user.id, isMounted, safetyTimer);
          } else {
            clearTimeout(safetyTimer);
            setLoading(false);
          }
        }

      } catch (err: unknown) {
        if (!isMounted) return;

        if (isLockOrStorageError(err)) {
          console.warn('[AuthContext] Error de storage/lock capturado y silenciado:', err);
        } else {
          console.error('[AuthContext] Excepción inesperada en initSession:', err);
        }

        await supabase.auth.signOut().catch(() => {});
        if (isMounted) {
          setSession(null);
          setProfile(null);
          clearTimeout(safetyTimer);
          setLoading(false);
        }
      }
    };

    initSession();

    // ── LISTENER DE CAMBIOS DE AUTENTICACIÓN ─────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        setSession(session);
        if (session) {
          await fetchProfile(session.user.id, isMounted, safetyTimer);
        } else {
          setProfile(null);
          clearTimeout(safetyTimer);
          setLoading(false);
        }
      }
    );

    // ── CLEANUP ───────────────────────────────────────────────────────────
    return () => {
      isMounted = false;
      clearTimeout(safetyTimer); // evitar fugas de memoria
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── FETCH PERFIL ────────────────────────────────────────────────────────
  const fetchProfile = async (
    userId: string,
    isMounted: boolean = true,
    safetyTimer?: ReturnType<typeof setTimeout>
  ) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*, roles (nombre)')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[AuthContext] Error leyendo perfil:', error.message);
      }

      if (isMounted) setProfile(data ?? null);

    } catch (err: unknown) {
      if (isLockOrStorageError(err)) {
        console.warn('[AuthContext] Error de storage/lock en fetchProfile (silenciado):', err);
      } else {
        console.error('[AuthContext] Error inesperado en fetchProfile:', err);
      }
      if (isMounted) setProfile(null);

    } finally {
      if (isMounted) {
        if (safetyTimer) clearTimeout(safetyTimer); // carga exitosa → cancelar timeout
        setLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, forceNuclearLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);