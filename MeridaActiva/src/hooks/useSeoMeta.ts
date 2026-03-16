// src/hooks/useSeoMeta.ts
// ─────────────────────────────────────────────────────────────────
// Hook para gestionar dinámicamente los metadatos SEO de cada página.
//
// Actualiza:
//   - document.title
//   - <meta name="description">
//   - Open Graph: og:title, og:description, og:image, og:url, og:type
//   - Twitter Card: twitter:card, twitter:title, twitter:description, twitter:image
//
// Uso en una página de detalle:
//   useSeoMeta({
//     title: evento.titulo,
//     description: evento.descripcion,
//     image: evento.imagen_url,
//   });
// ─────────────────────────────────────────────────────────────────

import { useEffect } from 'react';

interface SeoMetaOptions {
    /** Título de la página. Se añade " | MeridaActiva" automáticamente. */
    title: string;
    /** Meta description (máx. 160 caracteres recomendado). */
    description: string;
    /** URL de imagen para Open Graph (og:image). */
    image?: string;
    /** URL canónica de la página. Por defecto: window.location.href */
    url?: string;
    /** Tipo OG. Por defecto: "website" */
    type?: 'website' | 'article';
}

const SITE_NAME = 'MeridaActiva';
const DEFAULT_IMAGE = '/og-default.png'; // Imagen OG por defecto en /public

function setMeta(property: string, content: string, isName = false) {
    const attr = isName ? 'name' : 'property';
    let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, property);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

export function useSeoMeta({
    title,
    description,
    image,
    url,
    type = 'website',
}: SeoMetaOptions) {
    useEffect(() => {
        const fullTitle = `${title} | ${SITE_NAME}`;
        const resolvedUrl = url ?? window.location.href;
        const resolvedImage = image ?? DEFAULT_IMAGE;

        // ── Título ────────────────────────────────────────────────────
        document.title = fullTitle;

        // ── Meta estándar ─────────────────────────────────────────────
        setMeta('description', description, true);

        // ── Open Graph ────────────────────────────────────────────────
        setMeta('og:title', fullTitle);
        setMeta('og:description', description);
        setMeta('og:image', resolvedImage);
        setMeta('og:url', resolvedUrl);
        setMeta('og:type', type);
        setMeta('og:site_name', SITE_NAME);
        setMeta('og:locale', 'es_ES');

        // ── Twitter Card ──────────────────────────────────────────────
        setMeta('twitter:card', 'summary_large_image', true);
        setMeta('twitter:title', fullTitle, true);
        setMeta('twitter:description', description, true);
        setMeta('twitter:image', resolvedImage, true);

        // ── Cleanup: restaura el título al desmontar ───────────────────
        return () => {
            document.title = SITE_NAME;
        };
    }, [title, description, image, url, type]);
}
