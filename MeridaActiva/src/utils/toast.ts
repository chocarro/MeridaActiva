// src/utils/toast.ts
// ─────────────────────────────────────────────────────────────────
// Wrapper centralizado sobre react-hot-toast.
// ─────────────────────────────────────────────────────────────────
import toast from "react-hot-toast";

const BRAND = {
  dark: "#032B43",
  gold: "#FFBA08",
  blue: "#3F88C5",
  green: "#136F63",
  red: "#D00000",
  white: "#FFFFFF",
  bg: "#F0F2F5",
} as const;

const BASE_STYLE = {
  fontFamily: "inherit",
  fontSize: "0.7rem",
  fontWeight: "900",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  borderRadius: "1rem",
  padding: "0.85rem 1.25rem",
  boxShadow: "0 8px 32px rgba(3,43,67,0.18), 0 2px 8px rgba(3,43,67,0.08)",
  maxWidth: "380px",
  border: "1.5px solid rgba(255,255,255,0.15)",
};

interface ToastOpts {
  id?: string;
  duracion?: number;
}

export function toastExito(mensaje: string, opts: ToastOpts = {}) {
  return toast.success(mensaje, {
    id: opts.id,
    duration: opts.duracion ?? 3500,
    style: {
      ...BASE_STYLE,
      background: BRAND.green,
      color: BRAND.white,
      borderColor: "rgba(255,255,255,0.12)",
    },
    iconTheme: { primary: BRAND.gold, secondary: BRAND.green },
  });
}

/** ❌ Error */
export function toastError(mensaje: string, opts: ToastOpts = {}) {
  return toast.error(mensaje, {
    id: opts.id,
    duration: opts.duracion ?? 4500,
    style: {
      ...BASE_STYLE,
      background: BRAND.red,
      color: BRAND.white,
      borderColor: "rgba(255,255,255,0.12)",
    },
    iconTheme: { primary: BRAND.white, secondary: BRAND.red },
  });
}

/** ℹ️ Info */
export function toastInfo(mensaje: string, opts: ToastOpts = {}) {
  return toast(mensaje, {
    id: opts.id,
    duration: opts.duracion ?? 3500,
    icon: "→",
    style: {
      ...BASE_STYLE,
      background: BRAND.blue,
      color: BRAND.white,
      borderColor: "rgba(255,255,255,0.12)",
    },
  });
}

/** ⚠️ Aviso */
export function toastAviso(mensaje: string, opts: ToastOpts = {}) {
  return toast(mensaje, {
    id: opts.id,
    duration: opts.duracion ?? 4000,
    icon: "!",
    style: {
      ...BASE_STYLE,
      background: BRAND.gold,
      color: BRAND.dark,
      borderColor: "rgba(3,43,67,0.1)",
    },
  });
}

/** ⏳ Cargando */
export function toastCargando(mensaje: string, id = "cargando"): string {
  toast.loading(mensaje, {
    id,
    style: {
      ...BASE_STYLE,
      background: BRAND.dark,
      color: BRAND.gold,
      borderColor: "rgba(255,186,8,0.2)",
    },
  });
  return id;
}

/** Cierra un toast manualmente */
export function toastCerrar(id?: string) {
  toast.dismiss(id);
}
