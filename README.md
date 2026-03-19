[README.md](https://github.com/user-attachments/files/26116147/README.md)
<div align="center">

# 🏛️ MeridaActiva

**Plataforma de turismo y eventos culturales para Mérida (Extremadura) impulsada por IA**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

[Ver demo →](#) &nbsp;·&nbsp; [Reportar un bug](https://github.com/chocarro/MeridaActiva/issues) &nbsp;·&nbsp; [Sugerir una mejora](https://github.com/chocarro/MeridaActiva/issues)

</div>

---

## ✨ ¿Qué es MeridaActiva?

MeridaActiva es una **Progressive Web App (PWA)** que centraliza la agenda cultural de Mérida, permite explorar su patrimonio romano en un mapa interactivo y genera **itinerarios personalizados con Inteligencia Artificial** (Google Gemini 2.5 Flash vía OpenRouter).

### Funcionalidades principales

| Funcionalidad | Descripción |
|---|---|
| 📅 **Agenda cultural** | Eventos de música, teatro, gastronomía y turismo |
| 🗺️ **Mapa interactivo** | Monumentos y lugares de interés con Leaflet |
| 🤖 **Rutas con IA** | Itinerarios personalizados en 3 preguntas |
| 💬 **Asistente IA** | Chat para resolver dudas sobre Mérida |
| ⭐ **Favoritos** | Guarda eventos y gestiona tu agenda personal |
| 👤 **Autenticación** | Registro, login y perfil de usuario con Supabase |

---

## 🏗️ Arquitectura

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

---

## 🛠️ Stack tecnológico

- **Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS v4, GSAP, Leaflet
- **Backend:** Vercel Serverless Functions (Node.js)
- **Base de datos:** Supabase (PostgreSQL + Auth + Storage)
- **IA:** Google Gemini 2.5 Flash vía OpenRouter (streaming SSE)
- **Rate limiting:** Upstash Redis (opcional)
- **Deploy:** Vercel

---

## ⚙️ Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 18.x o superior |
| npm | 9.x o superior |
| [Cuenta Supabase](https://supabase.com) | Gratuita |
| [Cuenta OpenRouter](https://openrouter.ai) | Gratuita + $5 crédito |
| [Cuenta Vercel](https://vercel.com) | Gratuita (solo para deploy) |

---

## 🚀 Primeros pasos

### 1. Clona el repositorio

```bash
git clone https://github.com/chocarro/MeridaActiva.git
cd MeridaActiva
```

### 2. Instala las dependencias

```bash
npm install
```

### 3. Configura las variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# ── Supabase ──────────────────────────────────────────────────
VITE_SUPABASE_URL=https://XXXXXXXXXXXXXXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ── OpenRouter (Serverless Functions) ─────────────────────────
API_KEY_IA=sk-or-v1-...

# ── Upstash Redis (opcional — rate limiting) ──────────────────
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

> **Nota:** Las variables `VITE_*` son accesibles desde el frontend. Las variables sin prefijo `VITE_` solo están disponibles en las Serverless Functions.

### 4. Lanza el entorno de desarrollo

```bash
npm run dev:full
```

Esto arranca simultáneamente:
- **API local** → `http://localhost:3000` (Express con las funciones `/api/`)
- **Frontend** → `http://localhost:5173` (Vite con proxy transparente)

---

## 📜 Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev:full` | ⭐ Recomendado. Arranca frontend + API en paralelo |
| `npm run dev` | Solo Vite (las llamadas a `/api/*` fallarán) |
| `npm run api` | Solo el servidor API local |
| `npm run build` | Compila TypeScript y genera el bundle de producción |
| `npm run preview` | Sirve el bundle de producción en `http://localhost:4173` |
| `npm run lint` | Ejecuta ESLint sobre todo el proyecto |

---

## 📁 Estructura del proyecto

```
MeridaActiva/
├── api/                        # Serverless Functions de Vercel
│   ├── chat.js                 # POST /api/chat (streaming SSE)
│   └── generar-ruta.js         # POST /api/generar-ruta
├── api-server.js               # Servidor Express para desarrollo local
├── public/                     # Assets estáticos (iconos PWA, imágenes)
├── src/
│   ├── App.tsx                 # Componente raíz (Navbar, Toaster, Routes)
│   ├── Routes.tsx              # Rutas de la SPA
│   ├── supabaseClient.ts       # Cliente Supabase (singleton)
│   ├── types.ts                # Interfaces TypeScript centralizadas
│   ├── componentes/            # Componentes reutilizables
│   │   ├── animaciones/        # Animaciones con GSAP y CSS
│   │   ├── LazyImg.tsx         # Lazy loading con prevención de CLS
│   │   └── SelectCustom.tsx    # Dropdown accesible
│   ├── context/
│   │   └── AuthContext.tsx     # Contexto de autenticación
│   ├── hooks/                  # Hooks personalizados
│   ├── paginas/
│   │   ├── publicas/           # Home, Eventos, Lugares, FAQ, Contacto
│   │   ├── privadas/           # RutaInteligente, Calendario, Favoritos, Perfil
│   │   ├── admin/              # Dashboard, GestionEventos, GestionUsuarios
│   │   └── auth/               # Login, Registro, ResetPassword
│   └── utils/
│       ├── geminiService.ts    # Servicio de IA (streaming + reintentos)
│       └── toast.ts            # Wrapper sobre react-hot-toast
├── .env.example                # Plantilla de variables de entorno
├── vercel.json                 # Config de Vercel (rewrites SPA)
└── vite.config.ts              # Config de Vite (PWA, imagemin, proxy)
```

---

## ☁️ Despliegue en Vercel

1. Conecta el repositorio en [vercel.com/new](https://vercel.com/new)
2. Vercel detecta el proyecto Vite automáticamente
3. Añade las variables de entorno en **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `API_KEY_IA`
   - *(Opcional)* `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
4. Haz clic en **Deploy** ✅

El archivo `vercel.json` ya está configurado para redirigir todas las rutas al `index.html` (necesario para la SPA).

> Cada `git push` a `main` redespliega la aplicación automáticamente.

---

## 🔐 Row Level Security (Supabase)

Las políticas RLS están definidas en `rls_policies.sql`. Para aplicarlas:

1. Ve a **Supabase Dashboard → SQL Editor → New Query**
2. Pega el contenido del archivo y ejecútalo
3. Verifica en **Authentication → Policies** que aparecen las políticas

---

## 🚦 Rate Limiting con Upstash Redis

Las funciones `/api/chat.js` y `/api/generar-ruta.js` incluyen rate limiting con `@upstash/ratelimit`. Para activarlo:

1. Crea una base de datos en [console.upstash.com](https://console.upstash.com)
2. Copia las credenciales `REST_URL` y `REST_TOKEN` a tu `.env` y a las variables de entorno de Vercel

Si las credenciales no están configuradas, el rate limiting se desactiva automáticamente.

---

## 🧩 Añadir una nueva Serverless Function

1. Crea `/api/mi-funcion.js`:

```js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    const { dato } = req.body;
    res.status(200).json({ resultado: 'ok' });
  } catch (err) {
    console.error('[mi-funcion]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
```

2. Regístrala en `api-server.js` para desarrollo local:

```js
'/api/mi-funcion': () => import('./api/mi-funcion.js'),
```

3. Llámala desde el frontend con `fetch('/api/mi-funcion', { method: 'POST', ... })`.

---

## 📄 Licencia

Proyecto académico — Grado en Desarrollo de Aplicaciones Web.

