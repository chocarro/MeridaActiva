# MeridaActiva

> Plataforma de turismo y eventos culturales para Mérida (Extremadura, España), impulsada por IA.

---

## ¿Qué es MeridaActiva?

MeridaActiva es una Progressive Web App (PWA) que centraliza la agenda cultural de Mérida, permite explorar su patrimonio romano y genera itinerarios personalizados con Inteligencia Artificial (Google Gemini vía OpenRouter).

Los usuarios pueden:
- Consultar eventos culturales, música, teatro, gastronomía y turnismo
- Explorar los monumentos y lugares de interés en un mapa Leaflet interactivo
- Crear rutas personalizadas en 3 preguntas con un asistente IA
- Guardar favoritos y gestionar su agenda personal en un calendario
- Chatear con un asistente IA para resolver dudas sobre Mérida

---

## Arquitectura

```
╔══════════════════════════════════════════════╗
║              NAVEGADOR / PWA                ║
║  React 19 · TypeScript · Vite 7            ║
║  Tailwind v4 · GSAP · Leaflet              ║
╚═════════════════════════╦════════════════════╝
                          │ /api/*
              ╔═══════════▼═══════════╗
              ║  VERCEL SERVERLESS    ║
              ║  /api/chat.js         ║
              ║  /api/generar-ruta.js ║
              ╚═══════╦═══════╦═══════╝
                      │       │
          ╔═══════════▼╗   ╔══▼══════════════╗
          ║ OpenRouter ║   ║    Supabase      ║
          ║ (Gemini    ║   ║  PostgreSQL +    ║
          ║  2.5 Flash)║   ║  Auth + Storage  ║
          ╚════════════╝   ╚═════════════════╝
```

**Flujo de desarrollo local:**
```
npm run dev:full
    ├─ node api-server.js  → puerto 3000  (Express que sirve las funciones de /api/)
    └─ vite               → puerto 5173  (proxy /api/* → localhost:3000)
```

---

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js     | 18.x o superior |
| npm         | 9.x o superior  |
| Cuenta Supabase | Gratuita (supabase.com) |
| Cuenta OpenRouter | Gratuita + $5 crédito (openrouter.ai) |
| Cuenta Vercel | Gratuita (vercel.com) — solo para deploy |

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes claves:

```env
# ── Supabase ──────────────────────────────────────────────────
VITE_SUPABASE_URL=https://XXXXXXXXXXXXXXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ── OpenRouter (para las Serverless Functions de Vercel) ──────
# Obtén tu clave en https://openrouter.ai/keys
API_KEY_IA=sk-or-v1-...

# ── Upstash Redis (opcional — rate limiting) ──────────────────
# Obtén las credenciales en https://console.upstash.com
# Si no las configuras, el rate limiting queda desactivado
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

> **Nota:** Las variables `VITE_*` son accesibles desde el frontend. Las variables sin prefijo `VITE_` solo están disponibles en las Serverless Functions (backend) y en `api-server.js` en local.

Copia el archivo de ejemplo antes de empezar:
```bash
cp .env.example .env
```

---

## Primeros pasos

### 1. Instala las dependencias

```bash
npm install
```

### 2. Configura las variables de entorno

Crea el archivo `.env` como se indica en la sección anterior.

### 3. Lanza el entorno de desarrollo completo

```bash
npm run dev:full
```

Esto arranca simultáneamente:
- `node api-server.js` en `http://localhost:3000` (sirve `/api/chat` y `/api/generar-ruta`)
- `vite` en `http://localhost:5173` (con proxy transparente hacia el servidor API)

---

## Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Arranca solo Vite (frontend). Las llamadas a `/api/*` fallarán sin el servidor API. |
| `npm run api` | Arranca solo el servidor API local (`api-server.js`). |
| `npm run dev:full` | **Recomendado.** Arranca ambos en paralelo con `concurrently`. |
| `npm run build` | Compila TypeScript y genera el bundle de producción en `/dist`. |
| `npm run preview` | Sirve el bundle de producción en local (`http://localhost:4173`). |
| `npm run lint` | Ejecuta ESLint sobre todo el proyecto. |

---

## Estructura de carpetas

```
MeridaActiva/
├── api/                        # Serverless Functions de Vercel
│   ├── chat.js                 # Endpoint POST /api/chat (streaming SSE)
│   └── generar-ruta.js         # Endpoint POST /api/generar-ruta
├── api-server.js               # Servidor Express para desarrollo local
├── public/                     # Assets estáticos (iconos PWA, imágenes)
│   └── Imagenes/               # Imágenes del proyecto
├── src/
│   ├── App.tsx                 # Componente raíz (Navbar, Toaster, Routes)
│   ├── Routes.tsx              # Definición de todas las rutas de la SPA
│   ├── supabaseClient.ts       # Cliente de Supabase (singleton)
│   ├── types.ts                # Interfaces TypeScript centralizadas
│   ├── componentes/            # Componentes reutilizables
│   │   ├── animaciones/        # Componentes de animación (GSAP, CSS)
│   │   ├── LazyImg.tsx         # Imagen con lazy loading y prevención de CLS
│   │   ├── SelectCustom.tsx    # Dropdown accesible con navegación por teclado
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.tsx     # Contexto de autenticación (useAuth hook)
│   ├── hooks/                  # Hooks personalizados (useSeoMeta, etc.)
│   ├── paginas/
│   │   ├── publicas/           # Home, Eventos, Lugares, FAQ, Contacto
│   │   ├── privadas/           # RutaInteligente, Calendario, Favoritos, MiPerfil
│   │   ├── admin/              # Dashboard, GestionEventos, GestionUsuarios
│   │   ├── auth/               # Login, Registro, ResetPassword
│   │   └── NotFound.tsx        # Página 404 personalizada
│   ├── styles/                 # Estilos globales
│   └── utils/
│       ├── geminiService.ts    # Servicio de IA (streaming + reintentos)
│       └── toast.ts            # Wrapper sobre react-hot-toast
├── .env                        # Variables de entorno (NO subir a git)
├── .env.example                # Plantilla de variables de entorno
├── vite.config.ts              # Config de Vite (PWA, imagemin, proxy)
├── tailwind.config.js          # Config de Tailwind v4
└── vercel.json                 # Config de Vercel (rewrites SPA)
```

---

## Cómo añadir una nueva Serverless Function

1. Crea un archivo en `/api/mi-funcion.js`:

```js
// api/mi-funcion.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { dato } = req.body;
    // ... tu lógica aquí
    res.status(200).json({ resultado: 'ok' });
  } catch (err) {
    console.error('[mi-funcion]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
```

2. Registra la ruta en `api-server.js` para desarrollo local:

```js
const routes = {
  '/api/chat':          () => import('./api/chat.js'),
  '/api/generar-ruta':  () => import('./api/generar-ruta.js'),
  '/api/mi-funcion':    () => import('./api/mi-funcion.js'), // ← añadir aquí
};
```

3. Llama al endpoint desde el frontend con `fetch('/api/mi-funcion', { method: 'POST', ... })`.

En producción (Vercel), las funciones en `/api/` se despliegan automáticamente como Serverless Functions.

---

## Rate Limiting con Upstash Redis (opcional)

Las funciones `/api/chat.js` y `/api/generar-ruta.js` ya incluyen código de rate limiting utilizando `@upstash/ratelimit` y `@upstash/redis`.

Para activarlo, necesitas:
1. Crear una base de datos en [console.upstash.com](https://console.upstash.com)
2. Copiar las credenciales `REST_URL` y `REST_TOKEN` a tu `.env` (y a las variables de entorno de Vercel)

Si las credenciales no están configuradas, el rate limiting se desactiva automáticamente y las funciones operan sin restricciones.

---

## Despliegue en Vercel

1. Conecta el repositorio en [vercel.com/new](https://vercel.com/new)
2. Vercel detecta el proyecto Vite automáticamente
3. Añade las variables de entorno en *Settings → Environment Variables*:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `API_KEY_IA`
   - (Opcional) `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
4. Haz clic en *Deploy*

El archivo `vercel.json` ya está configurado para redirigir todas las rutas al `index.html` (necesario para la SPA).

---

## Row Level Security en Supabase

Las políticas RLS están definidas en el archivo `rls_policies.sql` (en la carpeta raíz).

Para aplicarlas:
1. Ve a **Supabase Dashboard → SQL Editor → New Query**
2. Copia el contenido del archivo y ejecútalo
3. Verifica en **Authentication → Policies** que aparecen las políticas

---

## Licencia

Proyecto académico — Grado en Desarrollo de Aplicaciones Web.
