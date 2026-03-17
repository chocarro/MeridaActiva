// api-server.js
// ─────────────────────────────────────────────────────────────────
// CAMBIOS (Mejora 10 — Reemplazar parser .env casero):
//   - Eliminada la función loadEnv() artesanal y su llamada
//   - Sustituida por `import 'dotenv/config'` (paquete dotenv estándar)
//   - Añadir "dotenv" a dependencies con: npm install dotenv
// ─────────────────────────────────────────────────────────────────
// Servidor Express para desarrollo local.
// Sirve las funciones de /api/ sin necesitar Vercel CLI.
// El proxy de Vite (vite.config.ts) redirige /api/* a este servidor.
//
// Uso: node api-server.js  (o se lanza automáticamente con npm run dev:full)
// ─────────────────────────────────────────────────────────────────

// Carga las variables del .env automáticamente (npm install dotenv)
import 'dotenv/config';

import { createServer } from 'http';

const PORT = 3000;

// ── Parsear body JSON de la petición ─────────────────────────────
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

// ── Adaptador: convierte req/res de Node.js a la forma que esperan
// las serverless functions de Vercel (que usan res.status().json(), etc.)
function createVercelAdapter(req, res, body) {
  const vercelReq = {
    method: req.method,
    headers: req.headers,
    body,
    url: req.url,
  };

  let statusCode = 200;
  const headers = {};

  const vercelRes = {
    status(code) { statusCode = code; return vercelRes; },
    json(data) {
      if (!res.headersSent) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json', ...headers });
        res.end(JSON.stringify(data));
      }
      return vercelRes;
    },
    setHeader(key, value) {
      headers[key] = value;
      if (!res.headersSent) res.setHeader(key, value);
      return vercelRes;
    },
    getHeader(key) { return headers[key]; },
    end(data) {
      if (!res.headersSent) {
        res.writeHead(statusCode, headers);
      }
      res.end(data);
      return vercelRes;
    },
    write(data) { res.write(data); return vercelRes; },
    headersSent: false,
  };

  // Sincronizar headersSent
  Object.defineProperty(vercelRes, 'headersSent', {
    get() { return res.headersSent; },
  });

  return { vercelReq, vercelRes };
}

// ── Mapa de rutas a handlers ──────────────────────────────────────
const routes = {
  '/api/chat': () => import('./api/chat.js'),
  '/api/generar-ruta': () => import('./api/generar-ruta.js'),
};

// ── Servidor HTTP ─────────────────────────────────────────────────
const server = createServer(async (req, res) => {
  const url = req.url.split('?')[0];

  // CORS para desarrollo local
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const routeLoader = routes[url];
  if (!routeLoader) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `Ruta no encontrada: ${url}` }));
    return;
  }

  try {
    const body = await parseBody(req);
    const { default: handler } = await routeLoader();
    const { vercelReq, vercelRes } = createVercelAdapter(req, res, body);
    await handler(vercelReq, vercelRes);
  } catch (err) {
    console.error(`[api-server] Error en ${url}:`, err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error interno del servidor.' }));
    }
  }
});

server.listen(PORT, () => {
  console.log(`[api-server] ✅ Servidor API corriendo en http://localhost:${PORT}`);
  console.log(`[api-server] Rutas disponibles:`);
  Object.keys(routes).forEach(r => console.log(`  POST ${r}`));
  console.log(`[api-server] API_KEY_IA: ${process.env.API_KEY_IA ? '✅ configurada' : '❌ NO configurada'}`);
});
