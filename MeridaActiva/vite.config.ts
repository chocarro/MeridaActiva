import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
// Mejora 2: Optimización automática de imágenes en build
// › npm install -D vite-plugin-imagemin
// › Convierte JPG/PNG a WebP y aplica compresión mozjpeg+pngquant


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Mérida Activa - Rutas con IA',
        short_name: 'Mérida Activa',
        description: 'Descubre Mérida con rutas personalizadas generadas por Inteligencia Artificial.',
        theme_color: '#032B43',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        screenshots: [
          {
            src: '/pwa-screenshot.png',
            sizes: '540x720',
            type: 'image/png',
            form_factor: 'narrow',
          },
        ],
        categories: ['travel', 'lifestyle'],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 7 * 1024 * 1024, // 7 MiB — permite og-default.png (6.26 MB)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf,eot}'],
        runtimeCaching: [
          // ── Mejora 3: NetworkFirst para rutas SPA ─────────────────────
          // El SW sirve la app shell desde caché si hay red disponible
          // usará la versión fresca; si no, la cacheada (offline real).
          {
            urlPattern: /^https?:\/\/[^/]+\/(eventos|lugares|rutas|mapa|faq|contacto|perfil|calendario|dashboard|admin|aviso-legal|privacidad|cookies|terminos|login|registro|reset-password)(\/.*)?$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'spa-routes-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24, // 1 día
              },
              networkTimeoutSeconds: 5,
            },
          },

          // ── Imágenes estáticas de /public (CacheFirst 30 días) ───────
          // Las imágenes propias (teatro, museo, etc.) se almacenan en
          // caché la primera vez que se cargan y después se sirven
          // instantáneamente, incluso sin conexión.
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp|svg|gif|avif)(\?.*)?$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-images-cache',
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
            },
          },

          // ── Supabase REST GET (StaleWhileRevalidate) ──────────────────
          // Solo cachea datos REST (eventos, lugares, etc.).
          // EXCLUYE /auth/v1/ para evitar cachear tokens de autenticación
          // caducados, lo que causaría sesiones zombi offline.
          {
            urlPattern: ({ url }: { url: URL }) =>
              url.hostname.match(/[a-z0-9]+\.supabase\.co/) !== null &&
              url.pathname.startsWith('/rest/') &&
              !url.pathname.startsWith('/auth/'),
            handler: 'StaleWhileRevalidate' as const,
            options: {
              cacheName: 'supabase-rest-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 horas de datos offline
              },
            },
          },

          // ── CacheFirst para Leaflet (ya existente) ────────────────────
          {
            urlPattern: /^https:\/\/unpkg\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'leaflet-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
            },
          },
          {
            urlPattern: /^https:\/\/basemaps\.cartocdn\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 1 día
              },
            },
          },
          {
            urlPattern: /^https:\/\/router\.project-osrm\.org\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'route-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hora
              },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],

  // ── Proxy para desarrollo local ────────────────────────────────
  // Redirige /api/* al servidor de Vercel CLI (vercel dev, puerto 3000).
  // En producción (Vercel), /api/* va directamente a las Serverless Functions.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Code-splitting: cada vendor en su propio chunk
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})