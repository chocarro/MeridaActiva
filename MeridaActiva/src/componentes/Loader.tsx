// src/components/Loader.tsx
// ─────────────────────────────────────────────────────────────────
// Spinner global con colores de marca. Reemplaza todos los textos
// planos de "Cargando...", "Verificando acceso...", etc.
//
// Variantes:
//   "pagina"  → pantalla completa centrada (para rutas protegidas, AuthContext)
//   "inline"  → ocupa su contenedor (para secciones de página)
//   "mini"    → solo el icono SVG (para dentro de botones)
//
// Uso:
//   if (loading) return <Loader />;
//   if (loading) return <Loader variante="inline" mensaje="Cargando eventos..." />;
//   <button disabled={enviando}>{enviando ? <Loader variante="mini" /> : "Guardar"}</button>
// ─────────────────────────────────────────────────────────────────

interface LoaderProps {
  variante?: "pagina" | "inline" | "mini";
  mensaje?: string;
}

// SVG del spinner reutilizable
function SpinnerSVG({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="#FFBA08"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M4 12a8 8 0 018-8"
        stroke="#FFBA08"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Loader({
  variante = "pagina",
  mensaje,
}: LoaderProps) {

  // ── Mini: solo el SVG (para botones) ────────────────────────────
  if (variante === "mini") {
    return <SpinnerSVG size={20} />;
  }

  // ── Inline: dentro de una sección ───────────────────────────────
  if (variante === "inline") {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 py-16"
        role="status"
        aria-label={mensaje ?? "Cargando"}
      >
        <SpinnerSVG size={36} />
        {mensaje && (
          <p
            className="text-sm font-medium tracking-wide"
            style={{
              color: "#032B43",
              fontFamily: "'Georgia', 'Times New Roman', serif",
            }}
          >
            {mensaje}
          </p>
        )}
      </div>
    );
  }

  // ── Página completa (default) ────────────────────────────────────
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-4 z-50"
      style={{ backgroundColor: "#F8F9FA" }}
      role="status"
      aria-label={mensaje ?? "Cargando página"}
    >
      {/* Logo / icono de la app */}
      <div
        className="flex items-center justify-center w-16 h-16 rounded-2xl mb-2"
        style={{ backgroundColor: "#032B43" }}
      >
        <svg
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFBA08"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="20" width="18" height="2" rx="1" />
          <rect x="5" y="9" width="2" height="11" />
          <rect x="11" y="9" width="2" height="11" />
          <rect x="17" y="9" width="2" height="11" />
          <polygon points="12,2 2,9 22,9" />
        </svg>
      </div>

      <SpinnerSVG size={44} />

      <p
        className="text-sm font-semibold tracking-widest uppercase"
        style={{
          color: "#032B43",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          letterSpacing: "0.15em",
        }}
      >
        {mensaje ?? "Mérida Activa"}
      </p>
    </div>
  );
}
