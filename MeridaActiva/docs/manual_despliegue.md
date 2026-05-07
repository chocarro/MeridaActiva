# 🚀 Manual de Despliegue — MéridaActiva

**Versión:** 1.0 | **Fecha:** Mayo 2026  
**Plataforma de producción:** Vercel  
**Base de datos:** Supabase

---

## Índice

1. [Requisitos previos](#1-requisitos-previos)
2. [Configuración de Supabase](#2-configuración-de-supabase)
3. [Configuración de OpenRouter (IA)](#3-configuración-de-openrouter-ia)
4. [Configuración de Upstash Redis (Rate Limiting)](#4-configuración-de-upstash-redis-rate-limiting)
5. [Instalación y desarrollo local](#5-instalación-y-desarrollo-local)
6. [Despliegue en Vercel](#6-despliegue-en-vercel)
7. [Variables de entorno en Vercel](#7-variables-de-entorno-en-vercel)
8. [Verificación post-despliegue](#8-verificación-post-despliegue)
9. [Actualización y re-despliegue](#9-actualización-y-re-despliegue)
10. [Solución de problemas de despliegue](#10-solución-de-problemas-de-despliegue)

---

## 1. Requisitos previos

### Software necesario (desarrollo local)

| Herramienta | Versión mínima | Enlace |
|---|---|---|
| Node.js | 18.x o superior | [nodejs.org](https://nodejs.org) |
| npm | 9.x o superior | (incluido con Node.js) |
| Git | cualquier versión reciente | [git-scm.com](https://git-scm.com) |

Verifica las versiones instaladas:
```bash
node --version   # debe mostrar v18.x.x o superior
npm --version    # debe mostrar 9.x.x o superior
```

### Cuentas necesarias

| Servicio | Cuenta | Coste |
|---|---|---|
| **Vercel** | [vercel.com](https://vercel.com) | Gratuito (plan Hobby) |
| **Supabase** | [supabase.com](https://supabase.com) | Gratuito (plan Free) |
| **OpenRouter** | [openrouter.ai](https://openrouter.ai) | De pago (pay-per-use) |
| **Upstash** | [upstash.com](https://upstash.com) | Gratuito (opcional) |

---

## 2. Configuración de Supabase

### 2.1 Crear el proyecto

1. Accede a [app.supabase.com](https://app.supabase.com) e inicia sesión.
2. Pulsa **"New Project"**.
3. Selecciona la organización, escribe un nombre (ej. `meridaactiva`) y una contraseña segura para la base de datos.
4. Elige región: **West EU (Ireland)** para menor latencia desde España.
5. Pulsa **"Create new project"** y espera ~2 minutos.

### 2.2 Obtener las credenciales

En tu proyecto Supabase, ve a **Settings → API**:

- **Project URL** → es tu `VITE_SUPABASE_URL` (ej. `https://abcdef.supabase.co`)
- **anon public key** → es tu `VITE_SUPABASE_ANON_KEY`

> ⚠️ Nunca uses la `service_role` key en el frontend. Solo la `anon` key.

### 2.3 Crear las tablas

Ve a **SQL Editor** en Supabase y ejecuta el siguiente script:

```sql
-- Tabla de roles
CREATE TABLE roles (
  id     serial PRIMARY KEY,
  nombre text NOT NULL
);
INSERT INTO roles (nombre) VALUES ('Usuario'), ('Gestor (Editor)'), ('Administrador');

-- Tabla de usuarios (perfil público)
CREATE TABLE usuarios (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre     text NOT NULL,
  email      text NOT NULL,
  avatar_url text,
  bio        text,
  created_at timestamptz DEFAULT now(),
  rol_id     int REFERENCES roles(id) DEFAULT 1
);

-- Tabla de eventos
CREATE TABLE eventos (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo              text NOT NULL,
  descripcion         text,
  fecha               date NOT NULL,
  hora                time,
  lugar               text,
  latitud             float8,
  longitud            float8,
  imagen_url          text,
  categoria           text,
  precio              text,
  animales_permitidos boolean DEFAULT false,
  enlace_externo      text,
  created_at          timestamptz DEFAULT now()
);

-- Tabla de comentarios/reseñas
CREATE TABLE comentarios (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id      uuid REFERENCES eventos(id) ON DELETE CASCADE,
  usuario_id     uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  texto          text NOT NULL,
  puntuacion     int CHECK (puntuacion BETWEEN 1 AND 5),
  nombre_usuario text,
  created_at     timestamptz DEFAULT now()
);

-- Tabla de favoritos
CREATE TABLE favoritos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  elemento_id   uuid NOT NULL,
  tipo_elemento text NOT NULL CHECK (tipo_elemento IN ('evento', 'lugar')),
  created_at    timestamptz DEFAULT now(),
  UNIQUE(usuario_id, elemento_id, tipo_elemento)
);

-- Tabla de agenda personal
CREATE TABLE agenda_personal (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo     text NOT NULL,
  fecha      date NOT NULL,
  hora       time,
  nota       text,
  color      text DEFAULT '#3F88C5'
);
```

### 2.4 Activar Row Level Security (RLS)

```sql
-- Activar RLS en todas las tablas
ALTER TABLE usuarios        ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios     ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_personal ENABLE ROW LEVEL SECURITY;

-- ── Políticas para usuarios ──────────────────────────────────────
CREATE POLICY "Lectura pública de perfiles"
  ON usuarios FOR SELECT USING (true);

CREATE POLICY "Usuario actualiza su propio perfil"
  ON usuarios FOR UPDATE USING (auth.uid() = id);

-- ── Políticas para eventos ───────────────────────────────────────
CREATE POLICY "Lectura pública de eventos"
  ON eventos FOR SELECT USING (true);

CREATE POLICY "Admin/Gestor puede insertar eventos"
  ON eventos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre IN ('Administrador', 'Gestor (Editor)')
    )
  );

CREATE POLICY "Admin/Gestor puede modificar eventos"
  ON eventos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre IN ('Administrador', 'Gestor (Editor)')
    )
  );

CREATE POLICY "Admin/Gestor puede eliminar eventos"
  ON eventos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre IN ('Administrador', 'Gestor (Editor)')
    )
  );

-- ── Políticas para comentarios ───────────────────────────────────
CREATE POLICY "Lectura pública de comentarios"
  ON comentarios FOR SELECT USING (true);

CREATE POLICY "Usuario autenticado puede comentar"
  ON comentarios FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Autor o admin puede borrar comentario"
  ON comentarios FOR DELETE
  USING (
    auth.uid() = usuario_id OR
    EXISTS (
      SELECT 1 FROM usuarios u JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre IN ('Administrador', 'Gestor (Editor)')
    )
  );

-- ── Políticas para favoritos ─────────────────────────────────────
CREATE POLICY "Usuario ve sus favoritos"
  ON favoritos FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuario gestiona sus favoritos"
  ON favoritos FOR ALL USING (auth.uid() = usuario_id);

-- ── Políticas para agenda_personal ──────────────────────────────
CREATE POLICY "Usuario gestiona su agenda"
  ON agenda_personal FOR ALL USING (auth.uid() = usuario_id);
```

### 2.5 Trigger: crear perfil al registrarse

Este trigger crea automáticamente un registro en `usuarios` cuando alguien se registra:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, email, rol_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    NEW.email,
    1  -- rol 'Usuario' por defecto
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2.6 Configurar autenticación (Auth settings)

En **Authentication → Settings**:

- **Site URL**: `https://tu-dominio.vercel.app`
- **Redirect URLs** (añadir):
  - `https://tu-dominio.vercel.app/reset-password`
  - `http://localhost:5173/reset-password` (para desarrollo)
- **Email confirmations**: activado ✅
- **Secure email change**: activado ✅

---

## 3. Configuración de OpenRouter (IA)

1. Crea una cuenta en [openrouter.ai](https://openrouter.ai).
2. Ve a **Keys** y crea una nueva API key.
3. Asegúrate de tener créditos disponibles (el modelo `google/gemini-2.5-flash` tiene coste).
4. Copia la API key → será tu variable `API_KEY_IA`.

**Modelos de fallback configurados** (en `api/generar-ruta.js`):
- `google/gemini-2.5-flash` (primario)
- `openai/gpt-4o-mini`
- `meta-llama/llama-3.1-8b-instruct:free` (gratuito, menor calidad)

---

## 4. Configuración de Upstash Redis (Rate Limiting)

> Este paso es **opcional**. Sin Upstash, el rate limiting se desactiva y cualquier usuario puede hacer peticiones ilimitadas a la IA.

1. Crea una cuenta en [upstash.com](https://console.upstash.com).
2. Crea una base de datos **Redis** en la región más cercana (EU West).
3. En los detalles de la DB, copia:
   - **REST URL** → `UPSTASH_REDIS_REST_URL`
   - **REST Token** → `UPSTASH_REDIS_REST_TOKEN`

---

## 5. Instalación y desarrollo local

### 5.1 Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/MeridaActiva.git
cd MeridaActiva
```

### 5.2 Instalar dependencias

```bash
npm install
```

### 5.3 Crear el archivo `.env`

Crea el archivo `.env` en la raíz del proyecto:

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# OpenRouter (IA)
API_KEY_IA=sk-or-v1-...tu-api-key...

# Upstash (opcional)
UPSTASH_REDIS_REST_URL=https://tu-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=tu-token-upstash

# CORS
ALLOWED_ORIGIN=http://localhost:5173

# API base (dejar vacío en dev — usa proxy de Vite)
VITE_API_BASE_URL=
```

### 5.4 Modos de arranque

#### Solo frontend (sin funciones de IA)
```bash
npm run dev
```
> Abre [http://localhost:5173](http://localhost:5173)  
> Las rutas `/api/*` devolverán 404 sin el servidor API.

#### Frontend + API local (modo completo)
```bash
npm run dev:full
```
> Lanza simultáneamente:
> - Vite en puerto **5173**
> - `api-server.js` en puerto **3000** (emula Vercel Serverless)
> - El proxy de Vite redirige `/api/*` → `localhost:3000`

### 5.5 Verificar que todo funciona

- Abre [http://localhost:5173](http://localhost:5173) → debe cargar la página de inicio.
- Intenta registrarte → debe llegar el email de confirmación.
- Ve a `/rutas` y genera una ruta → debe aparecer el itinerario.
- Ve a `/faq` y escribe un mensaje → debe responder el chat IA.

---

## 6. Despliegue en Vercel

### Opción A — Despliegue desde la interfaz web de Vercel (recomendado)

1. Sube el proyecto a GitHub (si aún no está):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/MeridaActiva.git
   git push -u origin main
   ```

2. Ve a [vercel.com](https://vercel.com) → **"Add New Project"**.

3. Conecta tu cuenta de GitHub y selecciona el repositorio `MeridaActiva`.

4. Vercel detectará automáticamente que es un proyecto Vite. Configuración:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (auto-detectado)
   - **Output Directory**: `dist` (auto-detectado)
   - **Install Command**: `npm install` (auto-detectado)

5. **Antes de desplegar**, añade las variables de entorno (ver sección 7).

6. Pulsa **"Deploy"**. El despliegue tarda 1-3 minutos.

### Opción B — Despliegue desde CLI de Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Autenticarse
vercel login

# Desplegar (primera vez — modo interactivo)
vercel

# Desplegar en producción
vercel --prod
```

---

## 7. Variables de entorno en Vercel

En el panel de Vercel → tu proyecto → **Settings → Environment Variables**, añade:

| Variable | Valor | Entornos |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Production, Preview, Development |
| `API_KEY_IA` | `sk-or-v1-...` | Production, Preview |
| `UPSTASH_REDIS_REST_URL` | `https://...upstash.io` | Production, Preview |
| `UPSTASH_REDIS_REST_TOKEN` | `...` | Production, Preview |
| `ALLOWED_ORIGIN` | `https://meridaactiva.vercel.app` | Production |
| `OPENROUTER_MODEL` | `google/gemini-2.5-flash` | Production, Preview |

> ⚠️ Las variables `VITE_*` se incrustan en el bundle durante el build. Las demás (`API_KEY_IA`, etc.) solo están disponibles en el servidor (Serverless Functions) y **nunca se exponen al cliente**.

### Actualizar variables de entorno

Tras modificar variables en Vercel, es necesario **re-desplegar** el proyecto para que los cambios surtan efecto:

```bash
vercel --prod
# o desde la interfaz: Deployments → "Redeploy"
```

---

## 8. Verificación post-despliegue

Tras el despliegue, comprueba que todo funciona en producción:

### Lista de verificación

- [ ] **Home carga correctamente** — `https://tu-app.vercel.app/`
- [ ] **Registro de usuario** — crea una cuenta nueva y verifica que llega el email
- [ ] **Login** — inicia sesión con la cuenta creada
- [ ] **Eventos** — la lista de eventos carga desde Supabase
- [ ] **Lugares** — la lista de lugares carga desde Supabase
- [ ] **Mapa** — el mapa interactivo muestra los marcadores
- [ ] **Rutas IA** — genera una ruta y verifica el itinerario completo
- [ ] **Chat IA** — envía un mensaje y recibe respuesta con streaming
- [ ] **Favoritos** — guarda y elimina un favorito
- [ ] **Calendario** — añade un evento personal
- [ ] **Perfil** — edita los datos del perfil
- [ ] **Contacto** — envía el formulario de contacto
- [ ] **Recuperar contraseña** — solicita un enlace y verifica que llega
- [ ] **PWA** — en Chrome mobile, el banner de instalación aparece
- [ ] **Offline** — desactiva la red y verifica que aparece el banner offline

### Herramientas de diagnóstico

```bash
# Ver logs en tiempo real (Vercel CLI)
vercel logs --follow

# Ver logs de una función específica
vercel logs --filter /api/generar-ruta
```

En el panel de Vercel → **Functions** puedes ver:
- Logs de cada invocación.
- Tiempo de ejecución.
- Errores.

---

## 9. Actualización y re-despliegue

### Flujo de trabajo habitual

```bash
# 1. Hacer cambios en el código
git add .
git commit -m "feat: descripción del cambio"
git push origin main

# Vercel despliega automáticamente al detectar el push a main
```

Vercel crea un **Preview Deployment** para cada rama/PR distinto de `main`. El despliegue de producción se actualiza automáticamente con cada push a `main`.

### Despliegue manual desde CLI

```bash
vercel --prod
```

### Rollback a una versión anterior

Desde el panel de Vercel → **Deployments** → selecciona un despliegue anterior → **"Promote to Production"**.

---

## 10. Solución de problemas de despliegue

### Error: "Build failed"

**Causa más común:** Error de TypeScript o ESLint.

```bash
# Reproduce el error localmente
npm run build

# Verifica los tipos
npx tsc --noEmit

# Verifica ESLint
npm run lint
```

Corrige los errores y vuelve a hacer push.

---

### Error: "Function invocation failed" en `/api/generar-ruta`

**Verificar:**
1. La variable `API_KEY_IA` está definida en las Variables de Entorno de Vercel.
2. La clave de OpenRouter tiene créditos y no está revocada.
3. El dominio está en la lista blanca de CORS (`ALLOWED_ORIGIN`).

**En los logs de Vercel** busca el mensaje:
```
[generar-ruta] Falta la variable de entorno API_KEY_IA
```

---

### Error: "La aplicación se queda en pantalla de carga"

**Causa más común:** Las variables de Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) no están definidas o son incorrectas.

Verifica en la consola del navegador (F12 → Console):
```
Error: Faltan las variables de entorno de Supabase
```

Asegúrate de que las variables estén definidas en Vercel **y** de haber hecho un re-despliegue después de añadirlas.

---

### Error: "Las rutas directas (ej. /eventos) devuelven 404"

**Causa:** El servidor no sabe que debe servir `index.html` para rutas de la SPA.

**Solución:** Verifica que el archivo `vercel.json` existe en la raíz:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

---

### Error: "401 Unauthorized" al acceder a datos de Supabase

**Causas posibles:**
1. La `ANON_KEY` es incorrecta.
2. Las políticas RLS están mal configuradas.
3. El token JWT del usuario ha expirado.

**Diagnóstico:** En Supabase → **Logs → API Logs** → busca la petición fallida y el error detallado.

---

### La IA devuelve respuesta degradada (`degraded: true`)

Se activa cuando OpenRouter no es accesible desde el servidor de Vercel (raramente ocurre). La app sirve una ruta estática predefinida en su lugar.

**Verificar:**
- Estado de OpenRouter en [status.openrouter.ai](https://status.openrouter.ai).
- Que la `API_KEY_IA` tiene crédito disponible.

---

### El rate limiting bloquea peticiones legítimas

Si Upstash está configurado, el límite es **10 rutas/IP/hora** y **20 mensajes de chat/IP/hora**.

Para ajustar los límites, modifica en `api/generar-ruta.js`:
```javascript
limiter: Ratelimit.slidingWindow(10, '1 h'), // cambia 10 por el límite deseado
```

Y en `api/chat.js` la línea equivalente. Luego re-despliega.

---

## Apéndice — Comandos de referencia rápida

```bash
# Desarrollo local (solo frontend)
npm run dev

# Desarrollo local (frontend + API)
npm run dev:full

# Build de producción
npm run build

# Previsualizar build local
npm run preview

# Linting
npm run lint

# Verificar tipos TypeScript
npx tsc --noEmit

# Desplegar en producción (CLI)
vercel --prod

# Ver logs de producción
vercel logs --follow

# Listar despliegues
vercel ls
```

---

*Manual de Despliegue — MéridaActiva v1.0 — Mayo 2026*
