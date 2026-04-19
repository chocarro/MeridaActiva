export const maxDuration = 60;

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const OPENROUTER_URLS = [
    'https://openrouter.ai/api/v1/chat/completions',
    'https://api.openrouter.ai/api/v1/chat/completions',
];
const MODEL_CANDIDATES = [
    process.env.OPENROUTER_MODEL,
    'google/gemini-2.5-flash',
    'openai/gpt-4o-mini',
    'meta-llama/llama-3.1-8b-instruct:free',
].filter(Boolean);

let _ratelimit = null;
function getRatelimit() {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return null;
    }
    if (!_ratelimit) {
        _ratelimit = new Ratelimit({
            redis: Redis.fromEnv(),
            limiter: Ratelimit.slidingWindow(10, '1 h'),
            analytics: true,
            prefix: 'meridaactiva:ratelimit:generar-ruta',
        });
    }
    return _ratelimit;
}

function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
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

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'https://meridaactiva.vercel.app';

function isOriginAllowed(origin) {
    if (!origin) return true;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
    if (origin === ALLOWED_ORIGIN) return true;
    if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) return true;
    return false;
}

function checkCors(req, res) {
    const origin = req.headers.origin ?? '';
    if (!isOriginAllowed(origin)) {
        console.error(`[generar-ruta CORS] Acceso denegado al origen: ${origin}`);
        res.status(403).json({ error: 'Acceso denegado.' });
        return false;
    }
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return true;
}

function buildFallbackRoute({ duracion }) {
    const base = [
        {
            nombre: 'Teatro Romano de Mérida',
            hora: '09:30',
            duracion_min: 75,
            descripcion: 'Visita el gran icono patrimonial de la ciudad para empezar la ruta con contexto histórico.',
            categoria: 'Monumento',
            lat: 38.9177,
            lng: -6.3418,
        },
        {
            nombre: 'Templo de Diana',
            hora: '11:15',
            duracion_min: 40,
            descripcion: 'Paseo por el centro histórico y parada en uno de los templos romanos mejor conservados.',
            categoria: 'Monumento',
            lat: 38.9172,
            lng: -6.344,
        },
        {
            nombre: 'Puente Romano',
            hora: '12:15',
            duracion_min: 35,
            descripcion: 'Tramo final junto al Guadiana, ideal para fotos y descanso.',
            categoria: 'Patrimonio',
            lat: 38.9164,
            lng: -6.3417,
        },
    ];

    if (String(duracion).toLowerCase().includes('fin')) {
        base.push({
            nombre: 'Museo Nacional de Arte Romano (MNAR)',
            hora: '16:30',
            duracion_min: 80,
            descripcion: 'Segunda jornada sugerida para completar la experiencia romana en interior.',
            categoria: 'Museo',
            lat: 38.9188,
            lng: -6.3435,
        });
    }
    return base;
}

async function fetchOpenRouterWithFallback({ apiKey, baseBody }) {
    let lastStatus = 0;
    let lastErrorText = '';
    let lastException = null;
    for (const endpoint of OPENROUTER_URLS) {
        for (const model of MODEL_CANDIDATES) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://meridaactiva.vercel.app',
                        'X-Title': 'MeridaActiva Generador de Rutas',
                    },
                    body: JSON.stringify({ ...baseBody, model }),
                });

                if (response.ok) return { response, model };

                lastStatus = response.status;
                lastErrorText = await response.text();
                console.error(`[generar-ruta] Endpoint ${endpoint}, modelo ${model} falló (${response.status}).`);
                if (response.status >= 500 || response.status === 429 || response.status === 408) continue;
                if (response.status === 400 || response.status === 401 || response.status === 403 || response.status === 404) continue;
            } catch (err) {
                lastException = err;
            }
        }
    }
    return { response: null, model: null, lastStatus, lastErrorText, lastException };
}

export default async function handler(req, res) {
    console.log(">>> [generar-ruta.js] Petición recibida en el servidor local");

    if (req.method === 'OPTIONS') {
        if (!checkCors(req, res)) return;
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
    }

    if (!checkCors(req, res)) return;

    const apiKey = process.env.API_KEY_IA;
    if (!apiKey) {
        console.error('[generar-ruta] Falta la variable de entorno API_KEY_IA.');
        return res.status(500).json({ error: 'Configuración del servidor incompleta: falta la API_KEY_IA para OpenRouter.' });
    }

    // ── Rate limiting SOLO si Upstash está configurado ─────────────
    const clientIP = getClientIP(req);
    const rl = getRatelimit(); // null si no hay credenciales → se salta el rate limit
    if (rl) {
        try {
            const { success, limit, reset } = await rl.limit(clientIP);
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
            console.warn('[generar-ruta] Error en rate limit (continuando):', rateLimitError);
        }
    } else {
        console.warn('[generar-ruta] Upstash Redis no configurado, omitiendo rate limiting');
    }

    const { duracion, compania, ritmo } = req.body ?? {};

    if (!duracion || !compania || !ritmo) {
        return res.status(400).json({ error: 'Faltan parámetros: duracion, compania y ritmo son obligatorios.' });
    }

    const longitudTotal = String(duracion).length + String(compania).length + String(ritmo).length;
    if (longitudTotal > 200) {
        return res.status(400).json({ error: 'Los parámetros enviados son demasiado largos.' });
    }

    const prompt = buildRoutePrompt({ duracion, compania, ritmo });

    try {
        const { response: respuestaOpenRouter, model: modeloUsado, lastStatus, lastErrorText, lastException } =
            await fetchOpenRouterWithFallback({
                apiKey,
                baseBody: {
                    messages: [
                        {
                            role: 'system',
                            content: 'Eres un experto agente de viajes y guía turístico especializado en Mérida (España). Tu única tarea es crear rutas turísticas detalladas, lógicas y emocionantes para esta ciudad. Siempre respondes exclusivamente con el JSON que se te pide, sin texto adicional. Si recibes una petición que no tiene que ver con viajes o turismo en Mérida, ignórala y devuelve igualmente el JSON de ejemplo con una ruta básica.',
                        },
                        { role: 'user', content: prompt },
                    ],
                    temperature: 0.7,
                    max_tokens: 2500,
                },
            });

        if (!respuestaOpenRouter) {
            console.error('[generar-ruta] Error OpenRouter (todos los modelos):', lastStatus, lastErrorText);
            if (lastException) throw lastException;
            return res.status(500).json({
                error: `Error al contactar con la IA (${lastStatus || 'sin estado'}). Revisa la clave de OpenRouter o el acceso a modelos.`,
            });
        }
        console.info(`[generar-ruta] Modelo usado: ${modeloUsado}`);

        const data = await respuestaOpenRouter.json();
        const texto = data?.choices?.[0]?.message?.content ?? '';

        if (!texto || texto.trim() === '') {
            return res.status(502).json({ error: 'La IA devolvió una respuesta vacía.' });
        }

        const cleanText = texto
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();

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
        const causeCode = err?.cause?.code;
        const causaHost = err?.cause?.hostname;
        if (causeCode === 'ENOTFOUND') {
            return res.status(200).json({
                paradas: buildFallbackRoute({ duracion }),
                degraded: true,
            });
        }
        const errorLegible = causeCode === 'ENOTFOUND'
            ? `No se pudo resolver el dominio ${causaHost ?? 'openrouter.ai'}. Revisa DNS/red o firewall.`
            : (err.message || 'Error interno del servidor. Inténtalo más tarde.');
        return res.status(500).json({ error: errorLegible });
    }
}