
import { useEffect } from 'react';

interface SeoMetaOptions {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article';
}

const SITE_NAME = 'MeridaActiva';
const DEFAULT_IMAGE = '/og-default.png'; 

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

        document.title = fullTitle;

        setMeta('description', description, true);
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
