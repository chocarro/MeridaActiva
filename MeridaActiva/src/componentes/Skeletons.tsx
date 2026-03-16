// src/components/Skeletons.tsx
// ─────────────────────────────────────────────────────────────────
// Skeleton loaders con la silueta exacta de tus componentes.
// Se muestran mientras Supabase devuelve los datos.
// Mucho mejor UX que un spinner en pantalla blanca.
//
// Componentes disponibles:
//   <SkeletonTarjeta />          → silueta de una tarjeta de evento
//   <SkeletonTarjetaGrid n={6} /> → grid completo de n tarjetas
//   <SkeletonDetalleEvento />    → silueta de la página de detalle
//   <SkeletonComentario />       → silueta de una reseña
//   <SkeletonPerfil />           → silueta del header de perfil
//
// Uso en Eventos.tsx:
//   if (cargando) return <SkeletonTarjetaGrid n={6} />;
//
// Uso en DetalleEvento.tsx:
//   if (cargando) return <SkeletonDetalleEvento />;
// ─────────────────────────────────────────────────────────────────

// ── Animación base (pulso gris) ──────────────────────────────────
// Tailwind: animate-pulse bg-gray-200 rounded → bloque pulsante
const PULSE = "animate-pulse rounded-lg bg-gray-200";

// ── Bloque genérico ──────────────────────────────────────────────
function Bloque({ className = "" }: { className?: string }) {
  return <div className={`${PULSE} ${className}`} />;
}

// ════════════════════════════════════════════════════════════════
// Tarjeta de evento
// ════════════════════════════════════════════════════════════════
export function SkeletonTarjeta() {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm border"
      style={{ borderColor: "#e2e8f0", backgroundColor: "#ffffff" }}
    >
      {/* Imagen */}
      <Bloque className="h-48 w-full rounded-none" />

      <div className="p-4 space-y-3">
        {/* Categoría pill */}
        <Bloque className="h-5 w-20 rounded-full" />
        {/* Título */}
        <Bloque className="h-5 w-full" />
        <Bloque className="h-5 w-3/4" />
        {/* Fecha y lugar */}
        <div className="flex gap-2 pt-1">
          <Bloque className="h-4 w-24" />
          <Bloque className="h-4 w-32" />
        </div>
        {/* Botón */}
        <Bloque className="h-9 w-full mt-2 rounded-xl" />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Grid de N tarjetas
// ════════════════════════════════════════════════════════════════
export function SkeletonTarjetaGrid({ n = 6 }: { n?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {Array.from({ length: n }).map((_, i) => (
        <SkeletonTarjeta key={i} />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Página de detalle de evento
// ════════════════════════════════════════════════════════════════
export function SkeletonDetalleEvento() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Hero image */}
      <Bloque className="h-72 w-full rounded-2xl" />

      {/* Categoría + título */}
      <div className="space-y-3">
        <Bloque className="h-5 w-24 rounded-full" />
        <Bloque className="h-8 w-4/5" />
        <Bloque className="h-8 w-2/3" />
      </div>

      {/* Meta: fecha / lugar */}
      <div className="flex gap-4">
        <Bloque className="h-5 w-36" />
        <Bloque className="h-5 w-44" />
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Bloque className="h-4 w-full" />
        <Bloque className="h-4 w-full" />
        <Bloque className="h-4 w-5/6" />
        <Bloque className="h-4 w-4/6" />
      </div>

      {/* Botón favorito */}
      <Bloque className="h-12 w-40 rounded-xl" />

      {/* Sección comentarios */}
      <div className="pt-6 space-y-4">
        <Bloque className="h-6 w-48" />
        {[1, 2, 3].map((i) => (
          <SkeletonComentario key={i} />
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Comentario / reseña individual
// ════════════════════════════════════════════════════════════════
export function SkeletonComentario() {
  return (
    <div
      className="flex gap-3 p-4 rounded-2xl border"
      style={{ borderColor: "#e2e8f0", backgroundColor: "#ffffff" }}
    >
      {/* Avatar */}
      <div className={`${PULSE} w-10 h-10 rounded-full flex-shrink-0`} />

      <div className="flex-1 space-y-2">
        {/* Nombre + estrellas */}
        <div className="flex justify-between">
          <Bloque className="h-4 w-28" />
          <Bloque className="h-4 w-20" />
        </div>
        {/* Texto */}
        <Bloque className="h-4 w-full" />
        <Bloque className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Header de perfil de usuario
// ════════════════════════════════════════════════════════════════
export function SkeletonPerfil() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {/* Avatar grande */}
      <div className={`${PULSE} w-24 h-24 rounded-full`} />
      {/* Nombre */}
      <Bloque className="h-6 w-40" />
      {/* Bio */}
      <Bloque className="h-4 w-64" />
      <Bloque className="h-4 w-48" />
      {/* Estadísticas */}
      <div className="flex gap-8 pt-2">
        <div className="flex flex-col items-center gap-1">
          <Bloque className="h-6 w-8" />
          <Bloque className="h-4 w-16" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Bloque className="h-6 w-8" />
          <Bloque className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
