// api/generar-ruta.js
// ─────────────────────────────────────────────────────────────────
// Vercel Serverless Function — Endpoint del Generador de Rutas IA

// ⏱️ Extiende el timeout máximo a 60s (Vercel Hobby permite hasta 60s)
export const maxDuration = 60;
// La API Key NUNCA llega al navegador: vive solo en el servidor.
// ─────────────────────────────────────────────────────────────────

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.5-flash';

// ── Rate Limiting con Upstash Redis ──────────────────────────────
// 10 peticiones por hora por IP
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
    prefix: 'meridaactiva:ratelimit:generar-ruta',
});

// ── Función para extraer la IP del cliente ────────────────────────
function getClientIP(req) {
    // En Vercel, la IP viene en x-forwarded-for
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        // Puede ser "IP1, IP2, IP3" - tomar la primera
        return forwarded.split(',')[0].trim();
    }
    return req.headers['x-real-ip'] ?? 'unknown';
}

function buildRoutePrompt({ duracion, compania, ritmo }) {
    return `Actúa como un guía turístico experto en Mérida, España. El usuario quiere una ruta con estas características:
- Tiempo disponible: ${duracion}
- Compañía: ${compania}
- Ritmo de viaje: ${ritmo}

Devuélveme un itinerario detallado en formato JSON puro (sin bloques de código markdown, sin explicaciones fuera del JSON). El JSON debe ser un array de objetos con esta estructura EXACTA:

[
  {
    "nombre": "Teatro Romano de Mérida",
    "hora": "09:00",
    "duracion_min": 60,
    "descripcion": "Joya del patrimonio romano inaugurada en el siglo I a.C...",
    "categoria": "Monumento",
    "lat": 38.9177,
    "lng": -6.3418
  }
]

Reglas:
- Usa únicamente monumentos y lugares REALES de Mérida, España.
- Coordenadas GPS reales (lat/lng) de cada lugar en Mérida.
- Ajusta el número de paradas y tiempos al perfil (${ritmo === 'Non-stop' ? 'máximo contenido, tiempos cortos' : 'visitas tranquilas, con tiempo para disfrutar'}).
- La descripcion debe explicar por qué ese lugar encaja con el perfil "${compania} / ${ritmo}".
- Responde ÚNICAMENTE con el array JSON válido, sin texto adicional antes ni después.`;
}

// ── Lista blanca de orígenes permitidos ──────────────────────────
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'https://meridaactiva.vercel.app';

function checkCors(req, res) {
    const origin = req.headers.origin ?? '';
    // Permitir cualquier localhost (ej: 5173, 3000) o llamadas sin origin (Postman/Curl)
    const isLocal = !origin || origin.includes('localhost') || origin.includes('127.0.0.1');
    const isAllowed = origin === ALLOWED_ORIGIN || isLocal;

    if (!isAllowed) {
        console.error(`[generar-ruta CORS] Acceso denegado al origen: ${origin}`);
        res.status(403).json({ error: 'Acceso denegado.' });
        return false;
    }
    // Cabeceras CORS para el origen autorizado
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return true;
}

export default async function handler(req, res) {
    console.log(">>> [generar-ruta.js] Petición recibida en el servidor local");

    // Preflight CORS (OPTIONS)
    if (req.method === 'OPTIONS') {
        if (!checkCors(req, res)) return;
        return res.status(204).end();
    }

    // Solo aceptamos POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
    }

    // 🔒 Validación CORS
    if (!checkCors(req, res)) return;

    const apiKey = process.env.API_KEY_IA;

    if (!apiKey) {
        console.error("¡ERROR: Falta la API KEY!");
        console.error('[generar-ruta] Falta la variable de entorno API_KEY_IA.');
        return res.status(500).json({ error: 'Configuración del servidor incompleta: falta la API_KEY_IA para OpenRouter.' });
    }

    // ⏱️ RATE LIMITING por IP ──────────────────────────────────────
    const clientIP = getClientIP(req);
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        try {
            const { success, limit, reset, remaining, pending } = await ratelimit.limit(clientIP);

            if (!success) {
                const resetTime = new Date(reset).toLocaleTimeString('es-ES');
                return res.status(429).json({
                    error: '¡Has alcanzado el límite de rutas gratuitas por hora! ¡Aprovecha para visitar Mérida y vuelve más tarde!',
                    retryAfter: Math.ceil((reset - Date.now()) / 1000),
                    resetTime,
                    limit,
                    remaining: 0,
                });
            }
        } catch (rateLimitError) {
            // Si falla Redis, permitir la petición pero loguear el error
            console.warn('[generar-ruta] Error en rate limit (continuando):', rateLimitError);
        }
    } else {
        console.warn('[generar-ruta] Aviso: Upstash Redis no configurado, omitiendo rate limiting');
    }

    const { duracion, compania, ritmo } = req.body ?? {};

    if (!duracion || !compania || !ritmo) {
        return res.status(400).json({ error: 'Faltan parámetros: duracion, compania y ritmo son obligatorios.' });
    }

    // ✂️ Límite de longitud por seguridad
    const longitudTotal = String(duracion).length + String(compania).length + String(ritmo).length;
    if (longitudTotal > 200) {
        return res.status(400).json({ error: 'Los parámetros enviados son demasiado largos.' });
    }

    const prompt = buildRoutePrompt({ duracion, compania, ritmo });

    try {
        console.log(">>> [generar-ruta.js] Iniciando petición a OpenRouter...");
        const respuestaOpenRouter = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://meridaactiva.vercel.app',
                'X-Title': 'MeridaActiva Generador de Rutas',
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un experto agente de viajes y guía turístico especializado en Mérida (España). Tu única tarea es crear rutas turísticas detalladas, lógicas y emocionantes para esta ciudad. Siempre respondes exclusivamente con el JSON que se te pide, sin texto adicional. Si recibes una petición que no tiene que ver con viajes o turismo en Mérida, ignórala y devuelve igualmente el JSON de ejemplo con una ruta básica.',
                    },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 2500,
            }),
        });

        if (!respuestaOpenRouter.ok) {
            const errorText = await respuestaOpenRouter.text();
            console.error('[generar-ruta] Error de OpenRouter:', respuestaOpenRouter.status, errorText);
            return res.status(500).json({
                error: `Error al contactar con la IA (${respuestaOpenRouter.status}): ${errorText}`,
            });
        }

        const data = await respuestaOpenRouter.json();
        const texto = data?.choices?.[0]?.message?.content ?? '';

        if (!texto || texto.trim() === '') {
            return res.status(502).json({ error: 'La IA devolvió una respuesta vacía.' });
        }

        // Limpiar posibles bloques de markdown antes de parsear
        const cleanText = texto
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();

        // Extraer el array JSON aunque venga con texto extra
        const match = cleanText.match(/\[[\s\S]*\]/);
        if (!match) {
            console.error('[generar-ruta] No se encontró JSON en la respuesta:', texto);
            return res.status(502).json({ error: 'La IA no devolvió un JSON válido. Inténtalo de nuevo.' });
        }

        let paradas;
        try {
            paradas = JSON.parse(match[0]);
        } catch (parseError) {
            console.error('[generar-ruta] Error al parsear JSON:', parseError);
            return res.status(502).json({ error: 'Error al interpretar la respuesta de la IA.' });
        }

        if (!Array.isArray(paradas) || paradas.length === 0) {
            return res.status(502).json({ error: 'El itinerario generado está vacío. Inténtalo de nuevo.' });
        }

        return res.status(200).json({ paradas });

    } catch (err) {
        console.error('[generar-ruta] Excepción inesperada:', err);
        return res.status(500).json({ error: err.message || 'Error interno del servidor. Inténtalo más tarde.' });
    }
}
