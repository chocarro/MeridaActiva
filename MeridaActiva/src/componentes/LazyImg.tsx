// src/componentes/LazyImg.tsx
// ─────────────────────────────────────────────────────────────────
// Mejora 2 — WebP con <picture>:
//   - Usa <picture> de HTML5 para priorizar WebP y dejar JPG/PNG como fallback
//   - Para URLs de Unsplash: añade ?fm=webp para la fuente WebP
//   - Para imágenes locales (/Imagenes/...): busca la variante .webp en la misma ruta
//   - Mantiene el shimmer placeholder y el fallback de error
//   - Mantiene srcSet/sizes para responsive images
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

// ── Genera la URL WebP y el srcSet WebP a partir de la URL original ──
function getWebpSrc(src: string, width?: number): { webpSrc: string; webpSrcSet?: string } | null {
    // Unsplash: añade ?fm=webp&w=... para solicitar formato WebP directamente
    if (src.includes('unsplash.com') || src.includes('images.unsplash')) {
        const base = src.split('?')[0];
        const webpSrc = width
            ? `${base}?fm=webp&w=${width}&q=80`
            : `${base}?fm=webp&q=80`;
        const webpSrcSet = width
            ? `${base}?fm=webp&w=${width}&q=80 1x, ${base}?fm=webp&w=${width * 2}&q=75 2x`
            : undefined;
        return { webpSrc, webpSrcSet };
    }

    // Imágenes locales (e.g. /Imagenes/teatro.jpg → /Imagenes/teatro.webp)
    if (src.startsWith('/') && !src.startsWith('//')) {
        const withoutExt = src.replace(/\.(jpg|jpeg|png)$/i, '');
        const webpSrc = `${withoutExt}.webp`;
        return { webpSrc };
    }

    // URLs externas sin soporte especial: no ofrecemos variante WebP
    return null;
}

// ── srcSet para el fallback JPG/PNG (Unsplash) ──
function getFallbackSrcSet(src: string, width?: number): string | undefined {
    if (!width) return undefined;
    if (src.includes('unsplash.com') || src.includes('images.unsplash')) {
        const base = src.split('?')[0];
        return `${base}?w=${width}&q=80 1x, ${base}?w=${width * 2}&q=75 2x`;
    }
    return undefined;
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

    const webp = getWebpSrc(src, width);
    const fallbackSrcSet = getFallbackSrcSet(src, width);
    const loading = priority ? 'eager' : 'lazy';
    const imgClassName = `w-full h-full object-cover ${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`;
    return (
        <div className={`relative w-full h-full overflow-hidden ${wrapperClassName}`}>            {/* Placeholder shimmer mientras carga */}
            {!loaded && !error && (
                <div
                    className="absolute inset-0 animate-pulse"
                    style={{ backgroundColor: '#e2e8f0' }}
                    aria-hidden="true"
                />
            )}

            {!error ? (
                <picture>
                    {/* Fuente WebP — el navegador la carga si la soporta */}
                    {webp && (
                        <source
                            type="image/webp"
                            srcSet={webp.webpSrcSet ?? webp.webpSrc}
                            sizes={sizes}
                        />
                    )}
                    {/* Fuente JPEG/PNG como fallback */}
                    {fallbackSrcSet && (
                        <source
                            srcSet={fallbackSrcSet}
                            sizes={sizes}
                        />
                    )}
                    {/* <img> siempre obligatorio dentro de <picture> */}
                    <img
                        src={src}
                        alt={alt}
                        loading={loading}
                        decoding="async"
                        {...(priority ? { fetchPriority: 'high' } : {})}
                        {...(width ? { width } : {})}
                        {...(height ? { height } : {})}
                        onLoad={() => setLoaded(true)}
                        onError={() => setError(true)}
                        className={imgClassName}
                        {...rest}
                    />
                </picture>
            ) : (
                /* Fallback si la imagen falla por completo */
                <div
                    className={`${className} flex items-center justify-center bg-slate-100`}
                    role="img"
                    aria-label={alt}
                    {...(width ? { style: { width, height } } : {})}
                >
                    <i className="bi bi-image text-slate-300 text-4xl" aria-hidden="true" />
                </div>
            )}
        </div>
    );
};

export default LazyImg;
