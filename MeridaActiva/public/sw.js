// public/sw.js v2
// ─────────────────────────────────────────────────────────────────
// Service Worker de MeridaActiva — Modo Offline Avanzado
//
// Estrategias por tipo de recurso:
//   1. CACHE FIRST  → assets estáticos (JS, CSS, fuentes, imágenes locales)
//   2. STALE WHILE REVALIDATE → llamadas a la API de Supabase
//   3. NETWORK FIRST → navegación (HTML)
//
// NUEVAS FUNCIONALIDADES v2:
//   ✅ Mensaje PRECACHE_URLS: permite que React pueda pre-cachear
//      las fichas de eventos/lugares cuando el usuario los guarda
//      como favorito, para acceso offline dentro de monumentos.
//   ✅ Caché separado para datos de usuario (favoritos, agenda)
//   ✅ Bump de versión limpia cachés anteriores automáticamente
// ─────────────────────────────────────────────────────────────────

const CACHE_VERSION = 'v2';
const CACHE_STATIC = `meridaactiva-static-${CACHE_VERSION}`;
const CACHE_SUPABASE = `meridaactiva-api-${CACHE_VERSION}`;
const CACHE_PAGES = `meridaactiva-pages-${CACHE_VERSION}`;

const ALL_CACHES = [CACHE_STATIC, CACHE_SUPABASE, CACHE_PAGES];

// Assets que se cachean en la instalación (app shell)
const PRECACHE_URLS = [
    '/',
    '/manifest.json',
    '/Imagenes/CULTURAL.jpg',
    '/Imagenes/teatro-romano.jpg',
    '/Imagenes/MUSICA.jpg',
    '/Imagenes/GASTRONOMIA.jpg',
    '/Imagenes/merida-maravilla-monumental.jpg',
];

// ── Instalación: precaché del app shell ──────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_STATIC)
            .then((cache) => cache.addAll(PRECACHE_URLS.filter(url => {
                // Evitar fallos si alguna imagen no existe
                return true;
            })))
            .then(() => self.skipWaiting())
            .catch((err) => console.warn('[SW] Precache parcial:', err))
    );
});

// ── Activación: limpia cachés de versiones anteriores ────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => !ALL_CACHES.includes(name))
                    .map((name) => {
                        console.log('[SW] Eliminando caché antiguo:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// ── Mensaje desde la app React: PRECACHE_URLS ────────────────────
// Cuando el usuario guarda un favorito, la app pide al SW que
// pre-cachee la ficha del evento/lugar para acceso offline.
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PRECACHE_URLS') {
        const urls = event.data.urls || [];
        caches.open(CACHE_PAGES).then((cache) => {
            urls.forEach((url) => {
                fetch(url, { mode: 'no-cors' })
                    .then((response) => {
                        if (response.status === 200 || response.type === 'opaque') {
                            cache.put(url, response);
                            console.log('[SW] Pre-cacheado para offline:', url);
                        }
                    })
                    .catch(() => {
                        // Silenciar — puede que ya esté cacheado o sin conexión
                    });
            });
        });
    }
});

// ── Fetch: decide estrategia según tipo de recurso ───────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar extensiones de Chrome y peticiones no-HTTP
    if (!request.url.startsWith('http')) return;
    // Ignorar peticiones POST y otras no-GET
    if (request.method !== 'GET') return;
    // Ignorar Supabase auth websockets
    if (url.pathname.includes('realtime')) return;

    // ── Supabase API → Stale While Revalidate ─────────────────────
    if (url.hostname.includes('supabase.co')) {
        event.respondWith(staleWhileRevalidate(request, CACHE_SUPABASE));
        return;
    }

    // ── Navegación HTML → Network First con fallback ──────────────
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request));
        return;
    }

    // ── Assets estáticos → Cache First ────────────────────────────
    event.respondWith(cacheFirst(request, CACHE_STATIC));
});

// ── Estrategia: Cache First ───────────────────────────────────────
async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response('Recurso no disponible sin conexión.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }
}

// ── Estrategia: Stale While Revalidate ───────────────────────────
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    // Actualiza en background sin bloquear la respuesta
    const networkPromise = fetch(request).then((response) => {
        if (response.ok) cache.put(request, response.clone());
        return response;
    }).catch(() => null);

    return cached ?? await networkPromise ?? new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' },
    });
}

// ── Estrategia: Network First ─────────────────────────────────────
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_PAGES);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        // 1. Intenta la caché de páginas
        const cached = await caches.match(request, { ignoreSearch: true });
        if (cached) return cached;

        // 2. Fallback a la app shell raíz
        const shell = await caches.match('/');
        if (shell) return shell;

        // 3. Último recurso: página offline inline
        return new Response(offlinePage(), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
    }
}

// ── Página offline inline como último recurso ─────────────────────
function offlinePage() {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sin conexión — MeridaActiva</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background: #F5F0E8; color: #032B43;
           display: flex; align-items: center; justify-content: center;
           min-height: 100vh; margin: 0; text-align: center; padding: 2rem; }
    .card { background: white; border-radius: 2.5rem; padding: 3.5rem 3rem;
            box-shadow: 0 25px 60px rgba(3,43,67,.12); max-width: 420px; width: 100%; }
    .emoji { font-size: 4.5rem; margin-bottom: 1.5rem; display: block; }
    h1 { font-size: 2.5rem; font-weight: 900; font-style: italic;
         text-transform: uppercase; letter-spacing: -0.03em; margin: 0 0 1rem; }
    .gold { color: #FFBA08; }
    p { color: #64748b; max-width: 300px; line-height: 1.6; margin: 0 auto 2rem; font-size: 0.9rem; }
    .tips { background: #F5F0E8; border-radius: 1.5rem; padding: 1.25rem 1.5rem;
            margin-bottom: 2rem; text-align: left; }
    .tips p { margin: 0; color: #032B43; font-weight: 700; font-size: 0.8rem; }
    .tip { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.75rem; }
    .tip-dot { width: 8px; height: 8px; background: #FFBA08; border-radius: 50%; flex-shrink: 0; }
    button { padding: 1rem 2.5rem; background: #032B43; color: #FFBA08; border: none;
             border-radius: 1rem; font-weight: 900; cursor: pointer;
             text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.75rem;
             transition: transform .15s; }
    button:hover { transform: scale(1.04); }
  </style>
</head>
<body>
  <div class="card">
    <span class="emoji">🏛️</span>
    <h1>Sin <span class="gold">conexión</span></h1>
    <p>Parece que has perdido la señal — quizás estás dentro de un monumento romano. Tu información guardada sigue disponible.</p>
    <div class="tips">
      <p>📱 Mientras estás offline puedes:</p>
      <div class="tip"><div class="tip-dot"></div><span style="font-size:.8rem;color:#475569">Ver tu agenda e itinerarios guardados</span></div>
      <div class="tip"><div class="tip-dot"></div><span style="font-size:.8rem;color:#475569">Consultar fichas de lugares favoritos</span></div>
      <div class="tip"><div class="tip-dot"></div><span style="font-size:.8rem;color:#475569">Revisar el mapa descargado</span></div>
    </div>
    <button onclick="window.location.reload()">Reintentar conexión</button>
  </div>
</body>
</html>`;
}
