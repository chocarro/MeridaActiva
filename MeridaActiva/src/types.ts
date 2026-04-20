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
  id: string;                         // uuid
  titulo: string;
  descripcion: string;
  fecha: string;                      // ISO 8601: "2025-06-15T20:00:00"
  /** Campo canonical en BD (se usa también el alias "ubicacion" en algunas queries) */
  lugar?: string;
  /** Alias de "lugar" — usado en selects que piden la columna "ubicacion" */
  ubicacion?: string;
  imagen_url: string;
  categoria: string;                  // Permite strings libres además de CategoriaEvento
  precio: number | string | null;     // null = gratuito; puede ser texto "10€" o número
  hora?: string | null;               // hora del evento (HH:MM)
  latitud?: number | null;            // para el mapa Leaflet
  longitud?: number | null;
  animales_permitidos?: boolean | null;
  /** URL externa del evento (tickets, web oficial, etc.) */
  enlace_externo?: string | null;
  created_at?: string;
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
  nombre_usuario?: string;       // desnormalizado para mostrar sin JOIN
  // join con profiles (opcional, para mostrar el nombre del autor)
  perfil?: Pick<Perfil, "nombre" | "avatar_url">;
}

// ── Perfil de usuario ────────────────────────────────────────────
// Corresponde a la tabla "usuarios" de Supabase
export interface Perfil {
  id: string;                    // mismo uuid que auth.users
  nombre: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  // join con la tabla roles (opcional)
  roles?: { nombre: string } | null;
}

// ── Favorito ─────────────────────────────────────────────────────
// Corresponde a la tabla "favoritos" de Supabase
export interface Favorito {
  id: string;
  usuario_id: string;
  /** ID del evento o lugar guardado */
  elemento_id: string;
  /** "evento" | "lugar" */
  tipo_elemento: string;
  created_at: string;
  // join opcional con la tabla correspondiente
  evento?: Evento;
  /** Detalle del item favorito (evento o lugar) — tipado por FavoritoConDetalle en el hook */
  detalle?: {
    id: string;
    titulo?: string;
    nombre?: string;
    nombre_es?: string;
    imagen_url?: string;
  } | null;
}

// ── Agenda Personal ───────────────────────────────────────────────
// Corresponde a la tabla "agenda_personal" de Supabase
export interface AgendaPersonal {
  id: string;
  usuario_id?: string;
  titulo: string;
  fecha: string;
  nota?: string;
  color: string;
  hora?: string;
}

// ── Evento de Calendario ─────────────────────────────────────────
// Tipo unificado para el componente Calendario (plataforma + personal)
export interface EventoCalendario {
  id: string;
  titulo: string;
  fecha: string;
  color: string;
  tipo: 'plataforma' | 'personal';
  hora?: string;
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
