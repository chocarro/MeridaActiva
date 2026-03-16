// src/componentes/LazyImg.tsx
// ─────────────────────────────────────────────────────────────────
// Componente de imagen con carga diferida y optimizaciones de rendimiento.
//
// Características:
//   - loading="lazy" por defecto (above-the-fold: usar priority={true})
//   - decoding="async" siempre → no bloquea el hilo principal
//   - Placeholder en color neutro hasta que carga la imagen
//   - Transición suave fade-in al mostrar la imagen final
//   - fetchpriority="high" para el hero (LCP element)
//
// Uso normal (off-screen):
//   <LazyImg src={imagen_url} alt="Descripción" className="w-full h-64 object-cover" />
//
// Para el hero (LCP — elemento más grande above-the-fold):
//   <LazyImg src={imagen_url} alt="Descripción" priority className="w-full h-[80vh] object-cover" />
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';

interface LazyImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    /** Si true: loading="eager" + fetchpriority="high" — usar en LCP (hero images) */
    priority?: boolean;
    /** Clases extra para el wrapper */
    wrapperClassName?: string;
}

const LazyImg: React.FC<LazyImgProps> = ({
    src,
    alt,
    priority = false,
    className = '',
    wrapperClassName = '',
    ...rest
}) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className={`relative overflow-hidden ${wrapperClassName}`}>
            {/* Placeholder shimmer mientras carga */}
            {!loaded && !error && (
                <div
                    className="absolute inset-0 animate-pulse"
                    style={{ backgroundColor: '#e2e8f0' }}
                    aria-hidden="true"
                />
            )}

            {/* Imagen real */}
            {!error ? (
                <img
                    src={src}
                    alt={alt}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    {...(priority ? { fetchPriority: 'high' } : {})}
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                    className={`
            ${className}
            transition-opacity duration-500
            ${loaded ? 'opacity-100' : 'opacity-0'}
          `}
                    {...rest}
                />
            ) : (
                /* Fallback si la imagen falla */
                <div
                    className={`${className} flex items-center justify-center bg-slate-100`}
                    role="img"
                    aria-label={alt}
                >
                    <i className="bi bi-image text-slate-300 text-4xl" aria-hidden="true" />
                </div>
            )}
        </div>
    );
};

export default LazyImg;
