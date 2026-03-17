// src/componentes/LazyImg.tsx
// ─────────────────────────────────────────────────────────────────
// CAMBIOS (Mejora 2 — Optimización de imágenes):
//   - Añadidas props `width`, `height` explícitas → evita CLS
//   - Añadida prop `sizes` para responsive srcset
//   - Generación automática de `srcSet` a 1× y 2× cuando se
//     proporcione `width` (solo para imágenes locales/CDN que
//     acepten parámetros de query `?w=...`)
//   - `loading="lazy"` sigue siendo el default
//   - `loading="eager"` + `fetchpriority="high"` con priority={true}
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';

interface LazyImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    /** Si true: loading="eager" + fetchpriority="high" — usar en LCP (hero images) */
    priority?: boolean;
    /** Clases extra para el wrapper */
    wrapperClassName?: string;
    /**
     * Ancho intrínseco en px — se pasa al atributo `width` del <img>
     * para que el navegador reserve el espacio y evite CLS.
     */
    width?: number;
    /**
     * Alto intrínseco en px — se pasa al atributo `height` del <img>
     * para que el navegador reserve el espacio y evite CLS.
     */
    height?: number;
    /**
     * Valor del atributo `sizes` para responsive images.
     * Ejemplo: "(max-width: 640px) 100vw, 50vw"
     * Por defecto se usa "100vw".
     */
    sizes?: string;
}

/**
 * Genera un srcSet sencillo a 1× y 2× a partir de una URL.
 * Solo funciona con URLs que soporten el parámetro ?w= (Unsplash, imagekit, etc.)
 * o con imágenes que el build de viteImagemin ya transformó a WebP.
 */
function generarSrcSet(src: string, width: number): string {
    // Si la URL ya contiene parámetros de query, no modificamos
    // (puede ser una URL ya optimizada o externa sin soporte de resize)
    if (src.startsWith('/') && !src.includes('?')) {
        // Imagen local — no añadimos srcset automático
        // (vite-plugin-imagemin ya genera las versiones WebP en build)
        return '';
    }
    if (src.includes('unsplash.com') || src.includes('images.unsplash')) {
        const base = src.split('?')[0];
        return `${base}?w=${width}&q=75 1x, ${base}?w=${width * 2}&q=75 2x`;
    }
    return '';
}

const LazyImg: React.FC<LazyImgProps> = ({
    src,
    alt,
    priority = false,
    className = '',
    wrapperClassName = '',
    width,
    height,
    sizes = '100vw',
    ...rest
}) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    // Genera srcSet solo si se pasa un width
    const srcSet = width ? generarSrcSet(src, width) : undefined;

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
                    {...(width  ? { width }  : {})}
                    {...(height ? { height } : {})}
                    {...(srcSet ? { srcSet, sizes } : {})}
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
                    {...(width  ? { style: { width, height } } : {})}
                >
                    <i className="bi bi-image text-slate-300 text-4xl" aria-hidden="true" />
                </div>
            )}
        </div>
    );
};

export default LazyImg;
