import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { normalizarPerfilDbRow } from '../utils/perfilUsuario';
import type { Perfil } from '../types';

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

const AUTH_STORAGE_KEY_PREFIX = 'sb-';
const SUPABASE_REF_KEY = 'meridaactiva_supabase_ref';

/**
 * Plan B: elimina cualquier clave de Supabase Auth en el navegador.
 * Incluye `sb-<ref>-auth-token` y otras que el cliente pueda crear.
 */
export const limpiarAlmacenamientoSupabase = (): void => {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(AUTH_STORAGE_KEY_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn('[Auth] No se pudo limpiar localStorage (sb-):', e);
  }
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(AUTH_STORAGE_KEY_PREFIX))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch (e) {
    console.warn('[Auth] No se pudo limpiar sessionStorage (sb-):', e);
  }
};

/** @deprecated usar limpiarAlmacenamientoSupabase */
const limpiarAuthStorage = limpiarAlmacenamientoSupabase;

/**
 * Intenta cerrar sesión en Supabase (revoca refresh token en servidor si es posible)
 * y siempre deja el cliente sin sesión en memoria.
 *
 * stopAutoRefresh evita que un tick de renovación vuelva a escribir `sb-*-auth-token`
 * justo después de borrarlo (condición de carrera frecuente al cerrar sesión).
 */
export const cerrarSesionEnServidor = async (): Promise<void> => {
  await supabase.auth.stopAutoRefresh().catch(() => {});
  const { error: errGlobal } = await supabase.auth.signOut({ scope: 'global' });
  if (errGlobal) {
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
  }
  await supabase.auth.startAutoRefresh().catch(() => {});
};

const obtenerSupabaseRefActual = (): string => {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!url) return 'unknown';
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

const tokenCaducado = (session: Session | null): boolean => {
  if (!session?.expires_at) return false;
  return session.expires_at * 1000 <= Date.now();
};

const PROFILE_FETCH_MS = 10_000;
const LOADING_SAFETY_MS = 18_000;
const REVALIDATE_DEBOUNCE_MS = 1_200;

async function withTimeout<T>(promiseLike: PromiseLike<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('__fetch_timeout__')), ms);
  });
  try {
    return await Promise.race([Promise.resolve(promiseLike), timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

// ─────────────────────────────────────────────
// Tipos y contexto
// ─────────────────────────────────────────────
interface AuthContextType {
  session: Session | null;
  profile: Perfil | null;
  loading: boolean;
  /** Cierre de sesión normal: servidor + localStorage/sessionStorage + estado React */
  signOut: () => Promise<void>;
  /** Vuelve a cargar `usuarios` + rol del usuario actual (útil tras login). */
  refreshProfile: () => Promise<void>;
  forceNuclearLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  forceNuclearLogout: async () => {},
});

// ─────────────────────────────────────────────
// Nuclear Logout — limpia TODO el estado de auth
// pase lo que pase con la sesión de Supabase
// ─────────────────────────────────────────────
export const forceNuclearLogout = async (): Promise<void> => {
  try {
    await cerrarSesionEnServidor();
  } catch (e) {
    console.warn('[NuclearLogout] signOut falló (esperado si token corrupto):', e);
  } finally {
    limpiarAlmacenamientoSupabase();
    window.location.href = '/';
  }
};

// ─────────────────────────────────────────────
// Limpieza forzosa de sesión → /login
// Más agresiva que Nuclear: borra TODO el storage
// ─────────────────────────────────────────────
const limpiezaForzosa = async (): Promise<void> => {
  try {
    await cerrarSesionEnServidor();
  } catch (e) {
    console.warn('[AuthContext] limpiezaForzosa: signOut falló:', e);
  } finally {
    limpiarAlmacenamientoSupabase();
    sessionStorage.clear();
    window.location.href = '/login';
  }
};

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession]   = useState<Session | null>(null);
  const [profile, setProfile]   = useState<Perfil | null>(null);
  const [loading, setLoading]   = useState(true);
  const sessionRef = useRef<Session | null>(null);
  sessionRef.current = session;

  /**
   * handleLogout de producción: revoca tokens en Supabase cuando puede,
   * y siempre borra `sb-*` del almacenamiento (plan B si el SDK falla).
   */
  const signOut = useCallback(async () => {
    try {
      await cerrarSesionEnServidor();
    } catch (e) {
      console.warn('[AuthContext] signOut: error en servidor, aplicando limpieza local:', e);
    } finally {
      limpiarAlmacenamientoSupabase();
      setSession(null);
      setProfile(null);
      setLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(
    async (
      userId: string,
      isMounted: boolean = true,
      safetyTimer?: ReturnType<typeof setTimeout>
    ) => {
      try {
        const { data, error } = await withTimeout(
          supabase
            .from('usuarios')
            .select('*, roles (nombre)')
            .eq('id', userId)
            .maybeSingle(),
          PROFILE_FETCH_MS
        );

        if (error) {
          console.warn('[AuthContext] Error leyendo perfil:', error.message);
        }

        if (isMounted) {
          setProfile((normalizarPerfilDbRow((data ?? null) as Record<string, unknown> | null) as Perfil | null));
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message === '__fetch_timeout__') {
          console.warn('[AuthContext] Timeout leyendo perfil — continuando sin perfil.');
        } else if (isLockOrStorageError(err)) {
          console.warn('[AuthContext] Error de storage/lock en fetchProfile (silenciado):', err);
        } else {
          console.error('[AuthContext] Error inesperado en fetchProfile:', err);
        }
        if (isMounted) setProfile(null);
      } finally {
        if (isMounted) {
          if (safetyTimer) clearTimeout(safetyTimer);
          setLoading(false);
        }
      }
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    const {
      data: { session: s },
    } = await supabase.auth.getSession();
    if (!s?.user?.id) return;
    setSession(s);
    setLoading(true);
    await fetchProfile(s.user.id, true, undefined);
  }, [fetchProfile]);

  useEffect(() => {
    let isMounted = true;
    const supabaseRefActual = obtenerSupabaseRefActual();

    const supabaseRefGuardada = localStorage.getItem(SUPABASE_REF_KEY);
    if (supabaseRefGuardada && supabaseRefGuardada !== supabaseRefActual) {
      // Si se cambió de proyecto/URL de Supabase, purgamos sesiones antiguas para evitar estados zombi.
      limpiarAuthStorage();
    }
    localStorage.setItem(SUPABASE_REF_KEY, supabaseRefActual);

    // ── VÁLVULA DE ESCAPE: timeout de 5 segundos ──────────────────────────
    // Si algo falla silenciosamente y loading sigue en true, forzamos
    // setLoading(false) para que la app nunca quede bloqueada en pantalla de carga.
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        console.warn(
          '[AuthContext] Timeout de seguridad alcanzado. ' +
          'Forzando loading=false para desbloquear la aplicación.'
        );
        setLoading(false);
      }
    }, LOADING_SAFETY_MS);

    // ── INICIALIZACIÓN DE SESIÓN ──────────────────────────────────────────
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        // Caso 1: error de token inválido / sesión expirada → Nuclear Logout
        if (error && isInvalidTokenError(error.message)) {
          console.warn('[AuthContext] Token inválido detectado — ejecutando Nuclear Logout.');
          // Limpiar claves sb- del localStorage directamente (no esperamos a signOut)
          limpiarAuthStorage();
          await supabase.auth.signOut().catch(() => {});
          if (isMounted) {
            setSession(null);
            setProfile(null);
            clearTimeout(safetyTimer);
            setLoading(false);
          }
          return;
        }

        // Caso 2: otro tipo de error en getSession → limpiezaForzosa
        if (error) {
          console.error('[AuthContext] Error en getSession — ejecutando limpiezaForzosa:', error.message);
          await limpiezaForzosa();
          return;
        }

        // Sesión presente pero caducada localmente (evita estado "logueado" zombi)
        if (tokenCaducado(session)) {
          console.warn('[AuthContext] Sesión expirada detectada localmente — limpiando estado auth.');
          limpiarAuthStorage();
          await supabase.auth.signOut().catch(() => {});
          if (isMounted) {
            setSession(null);
            setProfile(null);
            clearTimeout(safetyTimer);
            setLoading(false);
          }
          return;
        }

        // Caso 3: sesión obtenida — comprobar con el servidor (evita JWT corrupto en caché)
        if (session) {
          const { data: { user: srvUser }, error: userErr } = await supabase.auth.getUser();
          if (!isMounted) return;
          if (userErr || !srvUser || srvUser.id !== session.user.id) {
            console.warn('[AuthContext] getUser inválida al iniciar — limpiando almacenamiento auth.');
            limpiarAuthStorage();
            await supabase.auth.signOut().catch(() => {});
            setSession(null);
            setProfile(null);
            clearTimeout(safetyTimer);
            setLoading(false);
            return;
          }
        }

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
    const aplicarSesionInvalida = async (motivo: string) => {
      console.warn(`[AuthContext] Sesión inválida (${motivo}) — limpiando almacenamiento.`);
      limpiarAlmacenamientoSupabase();
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      if (!isMounted) return;
      setSession(null);
      setProfile(null);
      clearTimeout(safetyTimer);
      setLoading(false);
    };

    const onAuthStateChangeAsync = async (event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;

      // Token caducado o corrupto tras refresco / otra pestaña cerró sesión
      if (session && tokenCaducado(session)) {
        await aplicarSesionInvalida(`event=${event}, tokenCaducado`);
        return;
      }

      if (session && session.user) {
        const { data: { user: srvUser }, error: userErr } = await supabase.auth.getUser();
        if (!isMounted) return;
        if (userErr || !srvUser || srvUser.id !== session.user.id) {
          await aplicarSesionInvalida(`event=${event}, getUser falló`);
          return;
        }
      }

      setSession(session);

      if (session && session.user) {
        await fetchProfile(session.user.id, isMounted, safetyTimer);
      } else {
        // Cierre de sesión, refresh fallido, etc.: nunca dejar claves sb-* huérfanas
        if (event === 'SIGNED_OUT' || !session) {
          limpiarAlmacenamientoSupabase();
          try {
            sessionStorage.clear();
          } catch {
            /* ignore */
          }
        }
        setProfile(null);
        clearTimeout(safetyTimer);
        setLoading(false);
      }
    };

    // Callback síncrono: NO usar async aquí — el SDK toma un lock; await getUser() dentro del callback provoca deadlock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setTimeout(() => {
        void onAuthStateChangeAsync(event, session);
      }, 0);
    });

    // ── CLEANUP ───────────────────────────────────────────────────────────
    return () => {
      isMounted = false;
      clearTimeout(safetyTimer); // evitar fugas de memoria
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Revalidar sesión al volver a la pestaña (caso típico: token caducado tras dormir el PC)
  useEffect(() => {
    let debounce: ReturnType<typeof setTimeout>;

    const revalidar = async () => {
      if (document.visibilityState !== 'visible') return;
      const s = sessionRef.current;
      if (!s?.user?.id) return;

      const { data: { user: srvUser }, error } = await supabase.auth.getUser();
      if (error || !srvUser || srvUser.id !== s.user.id) {
        console.warn('[AuthContext] Revalidación al volver a la pestaña falló — cerrando sesión local.');
        limpiarAuthStorage();
        await supabase.auth.signOut().catch(() => {});
        setSession(null);
        setProfile(null);
        setLoading(false);
      }
    };

    const schedule = () => {
      clearTimeout(debounce);
      debounce = setTimeout(revalidar, REVALIDATE_DEBOUNCE_MS);
    };

    window.addEventListener('focus', schedule);
    document.addEventListener('visibilitychange', schedule);
    return () => {
      window.removeEventListener('focus', schedule);
      document.removeEventListener('visibilitychange', schedule);
      clearTimeout(debounce);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, signOut, refreshProfile, forceNuclearLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);