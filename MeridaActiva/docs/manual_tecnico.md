# 🛠️ Manual Técnico — MéridaActiva

**Versión:** 1.0 | **Fecha:** Mayo 2026  
**Stack:** React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · Supabase · Vercel

---

## Índice

1. [Arquitectura general](#1-arquitectura-general)
2. [Estructura de directorios](#2-estructura-de-directorios)
3. [Tecnologías y dependencias](#3-tecnologías-y-dependencias)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Base de datos — Supabase](#5-base-de-datos--supabase)
6. [Sistema de autenticación](#6-sistema-de-autenticación)
7. [Rutas y navegación](#7-rutas-y-navegación)
8. [Módulo de IA — Rutas y Chat](#8-módulo-de-ia--rutas-y-chat)
9. [API Serverless](#9-api-serverless)
10. [Componentes principales](#10-componentes-principales)
11. [Hooks personalizados](#11-hooks-personalizados)
12. [PWA y Service Worker](#12-pwa-y-service-worker)
13. [Sistema de tipos TypeScript](#13-sistema-de-tipos-typescript)
14. [SEO y metadatos](#14-seo-y-metadatos)
15. [Consideraciones de rendimiento](#15-consideraciones-de-rendimiento)

---

## 1. Arquitectura general

MéridaActiva es una **SPA (Single Page Application)** con arquitectura cliente-servidor desacoplada:

```
┌─────────────────────────────────────┐
│           CLIENTE (Browser)         │
│  React 19 + TypeScript + Vite       │
│  Tailwind CSS 4 · GSAP · Leaflet    │
│  PWA (Workbox Service Worker)       │
└──────────────┬──────────────────────┘
               │ HTTPS
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────────────┐
│  Supabase   │  │  Vercel Serverless  │
│  (Backend)  │  │  Functions (/api/)  │
│             │  │                     │
│  Auth       │  │  /api/chat          │
│  PostgreSQL │  │  /api/generar-ruta  │
│  Storage    │  │  /api/contacto      │
│  RLS        │  │  /api/eliminar-     │
└─────────────┘  │       cuenta        │
                 └──────┬──────────────┘
                        │
                 ┌──────▼──────┐
                 │  OpenRouter │
                 │  (IA proxy) │
                 │  Gemini 2.5 │
                 │  GPT-4o-mini│
                 └─────────────┘
```

**Flujo de datos:**
- El frontend se comunica con **Supabase** directamente para CRUD de datos (eventos, usuarios, comentarios, favoritos, agenda).
- Para las funciones de IA (chat y rutas), el frontend llama a las **API Serverless** de Vercel, que actúan como proxy hacia **OpenRouter** (para no exponer la API key en cliente).
- La autenticación es gestionada íntegramente por **Supabase Auth** con JWT.

---

## 2. Estructura de directorios

```
MeridaActiva/
├── api/                        # Serverless Functions (Vercel)
│   ├── chat.js                 # Endpoint del Chat IA (streaming SSE)
│   ├── generar-ruta.js         # Endpoint generador de rutas con IA
│   ├── contacto.js             # Endpoint formulario de contacto
│   └── eliminar-cuenta.js      # Endpoint eliminación de cuenta
├── docs/                       # Documentación del proyecto
│   ├── manual_usuario.md
│   ├── manual_tecnico.md
│   └── manual_despliegue.md
├── public/                     # Assets estáticos (servidos tal cual)
│   ├── Imagenes/               # Imágenes de la plataforma
│   ├── pwa-192x192.png         # Iconos PWA
│   ├── pwa-512x512.png
│   ├── og-default.png          # Imagen Open Graph por defecto
│   └── robots.txt
├── src/
│   ├── App.tsx                 # Componente raíz (providers)
│   ├── Routes.tsx              # Definición de rutas React Router
│   ├── index.tsx               # Entry point
│   ├── supabaseClient.ts       # Inicialización del cliente Supabase
│   ├── types.ts                # Interfaces TypeScript centralizadas
│   ├── componentes/            # Componentes reutilizables
│   │   ├── animaciones/        # Componentes de animación (GSAP, motion)
│   │   ├── MapaEventos.tsx     # Mapa Leaflet principal
│   │   ├── Navbar.tsx          # Barra de navegación
│   │   ├── Footer.tsx          # Pie de página
│   │   ├── Loader.tsx          # Spinner de carga
│   │   ├── Skeletons.tsx       # Skeletons de carga
│   │   ├── LazyImg.tsx         # Imágenes con lazy load y blur
│   │   ├── BotonFavorito.tsx   # Botón de favorito reutilizable
│   │   ├── FormularioReseña.tsx
│   │   ├── SelectCustom.tsx
│   │   ├── CookieBanner.tsx
│   │   └── OfflineBanner.tsx
│   ├── context/
│   │   └── AuthContext.tsx     # Contexto global de autenticación
│   ├── hooks/
│   │   ├── useFavoritos.ts     # Hook de favoritos
│   │   ├── useOfflineStatus.ts # Hook de estado de conexión
│   │   └── useSeoMeta.ts       # Hook de metadatos SEO
│   ├── paginas/
│   │   ├── publicas/           # Accesibles sin login
│   │   │   ├── Home.tsx
│   │   │   ├── Eventos.tsx
│   │   │   ├── DetalleEvento.tsx
│   │   │   ├── Lugares.tsx
│   │   │   ├── LugaresDetalle.tsx
│   │   │   ├── Chat.tsx
│   │   │   ├── Contacto.tsx
│   │   │   └── RutaCompartida.tsx
│   │   ├── privadas/           # Requieren login
│   │   │   ├── MiPerfil.tsx
│   │   │   ├── Calendario.tsx
│   │   │   ├── Favoritos.tsx
│   │   │   └── RutaInteligente.tsx
│   │   ├── admin/              # Requieren rol Admin/Gestor
│   │   │   ├── Dashboard.tsx
│   │   │   ├── GestionEventos.tsx
│   │   │   ├── GestionUsuarios.tsx
│   │   │   └── ModeracionResenas.tsx
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Registro.tsx
│   │   │   ├── ResetPassword.tsx
│   │   │   └── RecuperarSesion.tsx
│   │   └── NotFound.tsx
│   ├── legales/                # Páginas legales estáticas
│   ├── styles/                 # CSS global
│   └── utils/
│       ├── geminiService.ts    # Cliente IA (fetch a /api/)
│       ├── perfilUsuario.ts    # Helpers de perfil/roles
│       └── toast.ts            # Notificaciones toast
├── .env                        # Variables de entorno (NO comitear)
├── api-server.js               # Servidor Express local (dev)
├── vite.config.ts              # Configuración de Vite + PWA
├── tailwind.config.js
├── tsconfig.app.json
└── vercel.json                 # Configuración de despliegue Vercel
```

---

## 3. Tecnologías y dependencias

### Dependencias de producción

| Paquete | Versión | Uso |
|---|---|---|
| `react` | ^19.2.0 | Framework UI |
| `react-dom` | ^19.2.0 | Renderizado DOM |
| `react-router-dom` | ^6.30.3 | Enrutamiento SPA |
| `@supabase/supabase-js` | ^2.93.1 | Cliente Supabase (Auth + DB) |
| `gsap` | ^3.14.2 | Animaciones avanzadas |
| `motion` | ^12.35.0 | Animaciones declarativas |
| `leaflet` + `react-leaflet` | ^1.9.4 / ^5.0.0 | Mapas interactivos |
| `jspdf` | ^4.2.0 | Generación de PDF |
| `react-quill` | ^2.0.0 | Editor de texto enriquecido |
| `react-markdown` | ^10.1.0 | Renderizado Markdown (Chat) |
| `react-hot-toast` | ^2.6.0 | Notificaciones toast |
| `react-helmet-async` | ^3.0.0 | Gestión de `<head>` |
| `vite-plugin-pwa` | ^1.2.0 | Service Worker / PWA |
| `@upstash/ratelimit` | ^2.0.8 | Rate limiting serverless |
| `@upstash/redis` | ^1.37.0 | Redis para rate limit |
| `@vercel/analytics` | ^2.0.1 | Analytics de Vercel |

### Dependencias de desarrollo

| Paquete | Uso |
|---|---|
| `vite` ^7.3.1 | Bundler y dev server |
| `@vitejs/plugin-react-swc` | Compilación React con SWC |
| `typescript` ~5.9.3 | Tipado estático |
| `tailwindcss` ^4.2.0 | CSS utilitario |
| `@tailwindcss/vite` | Integración Tailwind + Vite |
| `eslint` + plugins | Linting |
| `concurrently` | Lanzar frontend + API en paralelo |
| `dotenv` | Carga de `.env` en desarrollo |

---

## 4. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# ── Supabase ─────────────────────────────────────────────────────
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key-de-supabase>

# ── IA (OpenRouter) ──────────────────────────────────────────────
API_KEY_IA=<tu-api-key-de-openrouter>
OPENROUTER_MODEL=google/gemini-2.5-flash   # opcional, hay fallbacks

# ── Rate Limiting (Upstash Redis) — opcional ────────────────────
UPSTASH_REDIS_REST_URL=https://<tu-db>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<tu-token-upstash>

# ── Seguridad CORS ───────────────────────────────────────────────
ALLOWED_ORIGIN=https://meridaactiva.vercel.app

# ── URL base de la API (frontend) ───────────────────────────────
# En desarrollo: vacío (usa el proxy de Vite)
# En producción: vacío también (rutas relativas /api/)
VITE_API_BASE_URL=
```

> ⚠️ Las variables que empiezan por `VITE_` son accesibles en el frontend mediante `import.meta.env.VITE_*`. Las demás solo están disponibles en el servidor (Serverless Functions).

---

## 5. Base de datos — Supabase

### Tablas principales

#### `usuarios`
```sql
id          uuid PRIMARY KEY  -- mismo que auth.users
nombre      text NOT NULL
email       text NOT NULL
avatar_url  text
bio         text
created_at  timestamptz DEFAULT now()
rol_id      int REFERENCES roles(id)
```

#### `roles`
```sql
id     serial PRIMARY KEY
nombre text NOT NULL  -- 'Usuario', 'Gestor (Editor)', 'Administrador'
```

#### `eventos`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
titulo              text NOT NULL
descripcion         text
fecha               date NOT NULL
hora                time
lugar               text
latitud             float8
longitud            float8
imagen_url          text
categoria           text
precio              text
animales_permitidos boolean
enlace_externo      text
created_at          timestamptz DEFAULT now()
```

#### `comentarios`
```sql
id             uuid PRIMARY KEY DEFAULT gen_random_uuid()
evento_id      uuid REFERENCES eventos(id) ON DELETE CASCADE
usuario_id     uuid REFERENCES usuarios(id) ON DELETE CASCADE
texto          text NOT NULL
puntuacion     int CHECK (puntuacion BETWEEN 1 AND 5)
nombre_usuario text
created_at     timestamptz DEFAULT now()
```

#### `favoritos`
```sql
id             uuid PRIMARY KEY DEFAULT gen_random_uuid()
usuario_id     uuid REFERENCES usuarios(id) ON DELETE CASCADE
elemento_id    uuid NOT NULL
tipo_elemento  text NOT NULL  -- 'evento' | 'lugar'
created_at     timestamptz DEFAULT now()
```

#### `agenda_personal`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
usuario_id  uuid REFERENCES usuarios(id) ON DELETE CASCADE
titulo      text NOT NULL
fecha       date NOT NULL
hora        time
nota        text
color       text DEFAULT '#3F88C5'
```

### Row Level Security (RLS)

Todas las tablas tienen RLS activado. Las políticas clave son:

- **`usuarios`**: lectura pública; escritura solo del propio usuario (`auth.uid() = id`).
- **`comentarios`**: lectura pública; inserción solo autenticado; borrado solo admin o autor.
- **`favoritos`**: solo el propietario puede ver, insertar y borrar (`auth.uid() = usuario_id`).
- **`agenda_personal`**: solo el propietario tiene acceso completo.
- **`eventos`**: lectura pública; escritura solo para rol Administrador o Gestor.

---

## 6. Sistema de autenticación

La autenticación está centralizada en `src/context/AuthContext.tsx` mediante el patrón **Context + Provider**.

### Estado global expuesto

```typescript
interface AuthContextType {
  session: Session | null;      // Sesión JWT de Supabase
  profile: Perfil | null;       // Datos del usuario de la tabla usuarios
  loading: boolean;             // true mientras se verifica la sesión
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  forceNuclearLogout: () => Promise<void>;
}
```

### Ciclo de vida de la sesión

1. **Inicialización**: `supabase.auth.getSession()` → si hay sesión, valida con `getUser()` (anti-JWT-corrupto) → carga perfil de la tabla `usuarios`.
2. **Listener**: `onAuthStateChange` escucha eventos `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`. Se ejecuta de forma asíncrona para evitar deadlocks con el SDK.
3. **Revalidación al volver a la pestaña**: listener en `visibilitychange` y `focus` que llama a `getUser()` con debounce de 1.2s.
4. **Safety timer**: si la carga supera 10s, fuerza `loading=false` para desbloquear la UI.
5. **Nuclear Logout**: limpia todas las claves `sb-*` de `localStorage` y `sessionStorage`, revoca el token en Supabase y redirige a `/`.

### Protección de rutas

`ProtectedRoute` en `Routes.tsx` verifica `session` y opcionalmente `allowedRoles`:

```tsx
<ProtectedRoute allowedRoles={['Administrador', 'Gestor (Editor)']}>
  <GestionEventos />
</ProtectedRoute>
```

Si no hay sesión → redirige a `/login`.  
Si el rol no está permitido → redirige a `/`.

---

## 7. Rutas y navegación

Definidas en `src/Routes.tsx` usando **React Router v6**.

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | `Home` | Público |
| `/eventos` | `Eventos` | Público |
| `/eventos/:id` | `DetalleEvento` | Público |
| `/lugares` | `Lugares` | Público |
| `/lugares/:id` | `LugaresDetalle` | Público |
| `/mapa` | `MapaEventos` | Público |
| `/contacto` | `Contacto` | Público |
| `/ruta/:id` | `RutaCompartida` | Público |
| `/login` | `Login` | Público |
| `/registro` | `Registro` | Público |
| `/reset-password` | `ResetPassword` | Público |
| `/recuperar-sesion` | `RecuperarSesion` | Público |
| `/faq` | `Chat` | **Login** |
| `/perfil` | `MiPerfil` | **Login** |
| `/favoritos` | `Favoritos` | **Login** |
| `/calendario` | `Calendario` | **Login** |
| `/rutas` | `RutaInteligente` | **Login** |
| `/dashboard` | `Dashboard` | **Admin/Gestor** |
| `/admin/eventos` | `GestionEventos` | **Admin/Gestor** |
| `/admin/usuarios` | `GestionUsuarios` | **Admin** |
| `/admin/resenas` | `ModeracionResenas` | **Admin/Gestor** |

Las páginas pesadas se cargan con **lazy loading** (`React.lazy`) para reducir el bundle inicial.

---

## 8. Módulo de IA — Rutas y Chat

### Flujo de generación de rutas (`/rutas`)

```
Usuario completa wizard (3 pasos)
  └─> RutaInteligente.tsx
        └─> geminiService.generarRuta(params)
              └─> POST /api/generar-ruta
                    └─> OpenRouter API (Gemini 2.5 Flash / GPT-4o-mini)
                          └─> JSON array de paradas
                    ← paradas[]
              ← ParadaRuta[]
        └─> OSRM API (cálculo ruta a pie)
        └─> Leaflet (renderizado en mapa)
```

**Modelo usado:** `google/gemini-2.5-flash` (primario), con fallbacks a `openai/gpt-4o-mini` y `meta-llama/llama-3.1-8b-instruct:free`.

**Rate limiting:** Upstash Redis — 10 peticiones por IP por hora (sliding window). Si Upstash no está configurado, el rate limit se omite.

**Fallback de red:** Si OpenRouter no es alcanzable (ENOTFOUND), se devuelve una ruta estática predefinida con los monumentos principales de Mérida.

**Reintento automático (cliente):** `geminiService.ts` reintenta hasta 2 veces con backoff exponencial (1s, 2s) si recibe error 502, 503 o mensajes de saturación.

### Flujo del Chat (`/faq`)

```
Usuario escribe mensaje
  └─> Chat.tsx
        └─> geminiService.enviarMensajeStream(mensaje, historial, onChunk)
              └─> POST /api/chat  { mensaje, historial, stream: true }
                    └─> OpenRouter (SSE streaming)
                    ← chunks de texto (Server-Sent Events)
              ← texto acumulado en tiempo real
        └─> ReactMarkdown (renderiza la respuesta)
```

**Streaming:** El servidor (`api/chat.js`) envía la respuesta en chunks SSE (`data: {...}\n\n`). El cliente consume el `ReadableStream` y actualiza el estado en tiempo real. En navegadores sin soporte de streaming (algunos móviles) usa fallback JSON completo.

---

## 9. API Serverless

Los endpoints residen en `/api/` y se despliegan automáticamente como **Vercel Serverless Functions**.

### `/api/chat` (POST)

**Body:**
```json
{
  "mensaje": "¿Cuáles son los horarios del Teatro Romano?",
  "historial": [{ "rol": "usuario", "texto": "...", "ts": 1234 }],
  "stream": true
}
```

**Respuesta (streaming):** SSE chunks `data: { "text": "..." }\n\n`  
**Respuesta (no-streaming):** `{ "text": "respuesta completa" }`

**Rate limit:** 20 mensajes/IP/hora (Upstash).

---

### `/api/generar-ruta` (POST)

**Body:**
```json
{
  "duracion": "1 día completo",
  "compania": "En pareja",
  "ritmo": "Relax"
}
```

**Respuesta exitosa:**
```json
{
  "paradas": [
    {
      "nombre": "Teatro Romano de Mérida",
      "hora": "09:30",
      "duracion_min": 75,
      "descripcion": "...",
      "categoria": "Monumento",
      "lat": 38.9177,
      "lng": -6.3418
    }
  ]
}
```

**Respuesta degradada** (sin red a OpenRouter):
```json
{ "paradas": [...ruta_estatica...], "degraded": true }
```

---

### `/api/contacto` (POST)

Envía un email con los datos del formulario de contacto. Requiere configuración del servicio de email en las variables de entorno.

---

### `/api/eliminar-cuenta` (POST/DELETE)

Elimina la cuenta del usuario autenticado. Requiere el token JWT en el header `Authorization`.

---

### Servidor local de desarrollo (`api-server.js`)

Para desarrollo sin Vercel CLI, existe un servidor Node.js que emula las Serverless Functions:

```bash
node api-server.js   # puerto 3000
# o usar:
npm run dev:full     # lanza Vite + api-server concurrentemente
```

El proxy en `vite.config.ts` redirige `/api/*` → `http://localhost:3000`.

---

## 10. Componentes principales

### `Navbar.tsx`
- Barra de navegación responsive con menú hamburguesa en móvil.
- Cambia de estilo al hacer scroll (`isScrolled`).
- Muestra opciones diferentes según estado de sesión y rol del usuario.
- Gestiona el menú de usuario (perfil, favoritos, agenda, cerrar sesión).

### `MapaEventos.tsx`
- Mapa Leaflet con marcadores de eventos y lugares.
- Clustering de marcadores en zoom bajo.
- Panel lateral con detalle al clicar un marcador.
- Filtros por categoría y tipo.

### `LazyImg.tsx`
- Imagen con carga diferida (`loading="lazy"`).
- Efecto blur-up (placeholder borroso hasta carga completa).
- Fallback en caso de error de carga (`onError`).

### `Skeletons.tsx`
- Componentes de skeleton (placeholders animados) para el estado de carga de tarjetas de eventos, lugares y reseñas.

### `BotonFavorito.tsx`
- Botón de corazón reutilizable.
- Usa el hook `useFavoritos` para gestionar estado.
- Optimistic UI: actualiza visualmente antes de confirmar con Supabase.

### `FormularioReseña.tsx`
- Formulario de valoración con selector de estrellas (1-5).
- Validación antes de enviar.
- Callback `onReseñaPublicada` para recargar la lista.

### Componentes de animación (`animaciones/`)
- `GradientText`: texto con gradiente animado.
- `RotatingText`: texto con rotación de palabras.
- `ScrollFloat`: texto que flota al hacer scroll.
- `ScrollStack`: tarjetas apiladas que se despliegan con scroll (efecto stack).
- `FluidGlass`: forma fluida interactiva con glassmorphism.

---

## 11. Hooks personalizados

### `useAuth()` — `AuthContext.tsx`
Accede al estado global de autenticación:
```typescript
const { session, profile, loading, signOut, refreshProfile } = useAuth();
```

### `useFavoritos(elementoId, tipoElemento)` — `useFavoritos.ts`
Gestiona el estado de favorito de un elemento:
```typescript
const { esFavorito, toggleFavorito, cargando } = useFavoritos(id, 'evento');
```

### `useOfflineStatus()` — `useOfflineStatus.ts`
Detecta si el usuario está sin conexión:
```typescript
const isOffline = useOfflineStatus(); // true si sin red
```

### `useSeoMeta(options)` — `useSeoMeta.ts`
Actualiza el `<title>`, meta description y Open Graph de la página actual:
```typescript
useSeoMeta({
  title: 'Eventos en Mérida',
  description: 'Descubre la agenda cultural...',
  image: '/og-eventos.png',
});
```

---

## 12. PWA y Service Worker

Configurado con `vite-plugin-pwa` (Workbox) en `vite.config.ts`.

### Estrategias de caché

| Recurso | Estrategia | TTL |
|---|---|---|
| Assets estáticos (JS, CSS, HTML) | `CacheFirst` (precache) | Siempre fresco en build |
| Imágenes (PNG, JPG, WebP) | `CacheFirst` | 30 días |
| Rutas SPA | `NetworkFirst` | 1 día |
| Supabase REST (`/rest/*`) | `StaleWhileRevalidate` | 24 horas |
| Tiles de mapa (CartoCDN) | `CacheFirst` | 1 día |
| Rutas OSRM | `NetworkFirst` | 1 hora |
| Leaflet (unpkg.com) | `CacheFirst` | 30 días |

### Manifiesto PWA

```json
{
  "name": "Mérida Activa - Rutas con IA",
  "short_name": "Mérida Activa",
  "display": "standalone",
  "theme_color": "#032B43",
  "start_url": "/"
}
```

Los iconos PWA están en `public/pwa-192x192.png` y `public/pwa-512x512.png`.

---

## 13. Sistema de tipos TypeScript

Todas las interfaces están centralizadas en `src/types.ts`:

```typescript
Evento            // Corresponde a la tabla eventos de Supabase
CategoriaEvento   // Union type de categorías válidas
Comentario        // Reseñas de usuarios
Perfil            // Perfil de usuario (tabla usuarios)
Favorito          // Elemento favorito del usuario
AgendaPersonal    // Evento personal del calendario
EventoCalendario  // Tipo unificado para el componente Calendario
SupabaseRespuesta<T>  // Wrapper genérico de respuestas Supabase
AuthState         // Estado del contexto de autenticación
BotonFavoritoProps
TarjetaEventoProps
FormularioReseñaProps
```

En `src/utils/geminiService.ts`:
```typescript
MensajeChat   // Mensaje del historial del chat
ParadaRuta    // Parada de un itinerario generado por IA
```

---

## 14. SEO y metadatos

- El hook `useSeoMeta` se llama en cada página para establecer título, descripción, Open Graph y Twitter Card.
- La imagen Open Graph por defecto es `/public/og-default.png`.
- El fichero `public/robots.txt` controla el acceso de los crawlers.
- La app es un SPA con prerenderizado parcial. Para SEO avanzado se recomienda considerar SSR en el futuro.

---

## 15. Consideraciones de rendimiento

### Code splitting
- Páginas pesadas (`MapaEventos`, `Chat`, `RutaInteligente`, secciones admin) se importan con `React.lazy()`.
- Los vendors se separan en chunks independientes: `vendor-react`, `vendor-leaflet`, `vendor-supabase`.

### Optimización de imágenes
- Las imágenes usan el componente `LazyImg` con `loading="lazy"` y `blur-up`.
- Se recomienda convertir las imágenes de `/public/Imagenes/` a WebP para reducir peso.

### Bundle analysis
```bash
npm run build -- --report
```

### Límites del Service Worker
El SW está configurado con un límite de 7 MiB por archivo para incluir la imagen `og-default.png` en precaché.

---

*Manual Técnico — MéridaActiva v1.0 — Mayo 2026*
