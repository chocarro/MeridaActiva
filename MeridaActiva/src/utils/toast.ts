// src/utils/toast.ts
// ─────────────────────────────────────────────────────────────────
// Wrapper centralizado sobre react-hot-toast.
// NUNCA uses alert() ni toast() directamente en la app.
//
// Guía rápida de sustitución:
//   alert("¡Reseña publicada!")            → toastExito("¡Reseña publicada!")
//   alert("Error al iniciar sesión")       → toastError("Error al iniciar sesión")
//   alert("Inicia sesión para continuar")  → toastInfo("Inicia sesión para continuar")
//
// Patrón para operaciones async (ej: guardar favorito):
//   const id = toastCargando("Guardando favorito...");
//   // ... await supabase ...
//   toastExito("¡Favorito guardado!", { id });   // reemplaza el spinner
//   // o en catch:
//   toastError("No se pudo guardar.", { id });
// ─────────────────────────────────────────────────────────────────

import toast from "react-hot-toast";

const BRAND = {
  dark:  "#032B43",
  gold:  "#FFBA08",
  blue:  "#3F88C5",
  green: "#136F63",
  red:   "#D00000",
  white: "#FFFFFF",
} as const;

const BASE_STYLE = {
  fontFamily: "'Georgia', 'Times New Roman', serif",
  fontSize: "0.875rem",
  borderRadius: "0.75rem",
  padding: "0.75rem 1.1rem",
  boxShadow: "0 4px 24px rgba(3,43,67,0.18)",
  maxWidth: "360px",
};

interface ToastOpts {
  /** ID de un toastCargando() previo para reemplazarlo visualmente */
  id?: string;
  duracion?: number;
}

/** ✅ Éxito — verde oscuro, icono dorado */
export function toastExito(mensaje: string, opts: ToastOpts = {}) {
  return toast.success(mensaje, {
    id: opts.id,
    duration: opts.duracion ?? 3500,
    style: { ...BASE_STYLE, background: BRAND.green, color: BRAND.white },
    iconTheme: { primary: BRAND.gold, secondary: BRAND.green },
  });
}

/** ❌ Error — rojo de marca */
export function toastError(mensaje: string, opts: ToastOpts = {}) {
  return toast.error(mensaje, {
    id: opts.id,
    duration: opts.duracion ?? 4500,
    style: { ...BASE_STYLE, background: BRAND.red, color: BRAND.white },
    iconTheme: { primary: BRAND.white, secondary: BRAND.red },
  });
}

/** ℹ️ Info — azul de marca (ej: "Inicia sesión para guardar favoritos") */
export function toastInfo(mensaje: string, opts: ToastOpts = {}) {
  return toast(mensaje, {
    id: opts.id,
    duration: opts.duracion ?? 3500,
    icon: "ℹ️",
    style: { ...BASE_STYLE, background: BRAND.blue, color: BRAND.white },
  });
}

/** ⚠️ Aviso — dorado de marca (ej: "Ya valoraste este evento") */
export function toastAviso(mensaje: string, opts: ToastOpts = {}) {
  return toast(mensaje, {
    id: opts.id,
    duration: opts.duracion ?? 4000,
    icon: "⚠️",
    style: { ...BASE_STYLE, background: BRAND.gold, color: BRAND.dark },
  });
}

/**
 * ⏳ Cargando — spinner animado hasta que se resuelva la operación.
 * @returns el id para pasárselo a toastExito/toastError en el then/catch
 */
export function toastCargando(mensaje: string, id = "cargando"): string {
  toast.loading(mensaje, {
    id,
    style: { ...BASE_STYLE, background: BRAND.dark, color: BRAND.gold },
  });
  return id;
}

/** Cierra un toast manualmente (útil si cancelas una operación) */
export function toastCerrar(id?: string) {
  toast.dismiss(id);
}
