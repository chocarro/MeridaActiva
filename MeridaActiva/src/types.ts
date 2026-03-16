// src/types.ts
// ─────────────────────────────────────────────────────────────────
// Interfaces TypeScript centralizadas para toda la app.
// Elimina todos los useState<any> y reemplázalos por estos tipos.
//
// Uso:
//   import type { Evento, Comentario, Perfil, Favorito } from "../types";
//   const [eventos, setEventos] = useState<Evento[]>([]);
//   const [perfil, setPerfil]   = useState<Perfil | null>(null);
// ─────────────────────────────────────────────────────────────────

// ── Evento ───────────────────────────────────────────────────────
// Corresponde a la tabla "eventos" de Supabase
export interface Evento {
  id: string;                    // uuid
  titulo: string;
  descripcion: string;
  fecha: string;                 // ISO 8601: "2025-06-15T20:00:00"
  lugar: string;
  imagen_url: string;
  categoria: CategoriaEvento;
  precio: number | null;         // null = gratuito
  latitud: number | null;        // para el mapa Leaflet
  longitud: number | null;
  created_at: string;
}

export type CategoriaEvento =
  | "teatro"
  | "musica"
  | "exposicion"
  | "deporte"
  | "gastronomia"
  | "turismo"
  | "gratis"
  | "otro";

// ── Comentario / Reseña ──────────────────────────────────────────
// Corresponde a la tabla "comentarios" de Supabase
export interface Comentario {
  id: string;
  evento_id: string;
  usuario_id: string;
  texto: string;
  puntuacion: number;            // 1–5
  created_at: string;
  // join con profiles (opcional, para mostrar el nombre del autor)
  perfil?: Pick<Perfil, "nombre" | "avatar_url">;
}

// ── Perfil de usuario ────────────────────────────────────────────
// Corresponde a la tabla "profiles" / "perfiles" de Supabase
export interface Perfil {
  id: string;                    // mismo uuid que auth.users
  nombre: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

// ── Favorito ─────────────────────────────────────────────────────
// Corresponde a la tabla "favoritos" de Supabase
export interface Favorito {
  id: string;
  usuario_id: string;
  evento_id: string;
  created_at: string;
  // join con eventos (opcional, para mostrar la tarjeta directamente)
  evento?: Evento;
}

// ── Respuestas de Supabase ────────────────────────────────────────
// Tipo genérico para manejar errores de forma uniforme
export interface SupabaseRespuesta<T> {
  data: T | null;
  error: { message: string } | null;
}

// ── Estado de autenticación ───────────────────────────────────────
// Para el AuthContext
export interface AuthState {
  usuario: {
    id: string;
    email: string;
    user_metadata?: { nombre?: string };
  } | null;
  perfil: Perfil | null;
  cargando: boolean;
}

// ── Props comunes de componentes ──────────────────────────────────

/** Props para el componente BotonFavorito */
export interface BotonFavoritoProps {
  eventoId: string;
  /** Clase CSS adicional para personalizar el botón por contexto */
  className?: string;
}

/** Props para tarjeta de evento */
export interface TarjetaEventoProps {
  evento: Evento;
}

/** Props para el formulario de reseña */
export interface FormularioReseñaProps {
  eventoId: string;
  onReseñaPublicada: () => void; // callback para recargar comentarios
}
