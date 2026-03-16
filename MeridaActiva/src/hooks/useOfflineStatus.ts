// src/hooks/useOfflineStatus.ts
// ─────────────────────────────────────────────────────────────────
// Detecta si el usuario está offline y expone una función para
// pre-cachear URLs concretas (eventos/lugares favoritos)
// a través del Service Worker.
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';

export function useOfflineStatus() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const goOffline = () => setIsOffline(true);
        const goOnline = () => setIsOffline(false);

        window.addEventListener('offline', goOffline);
        window.addEventListener('online', goOnline);
        return () => {
            window.removeEventListener('offline', goOffline);
            window.removeEventListener('online', goOnline);
        };
    }, []);

    /**
     * Pide al Service Worker que pre-cachee una lista de URLs
     * para disponibilidad offline (llama cuando el usuario guarda un favorito).
     */
    const precacheUrls = (urls: string[]) => {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'PRECACHE_URLS',
                urls,
            });
        }
    };

    return { isOffline, precacheUrls };
}
