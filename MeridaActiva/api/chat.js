
export const maxDuration = 60;

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemma-2-9b-it:free';

// ── BUG FIX: Inicialización LAZY del rate limiter ─────────────────────────
// ANTES: Redis.fromEnv() se ejecutaba al IMPORTAR el módulo. Si las variables
// de entorno de Upstash no están definidas, lanza un error que impide cargar
// el módulo entero → ambos endpoints fallaban con error 500 siempre.
// AHORA: se instancia solo la primera vez que se usa y solo si hay credenciales.
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
            prefix: 'meridaactiva:ratelimit:chat',
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

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'https://meridaactiva.vercel.app';

function checkCors(req, res) {
    const origin = req.headers.origin ?? '';
    const isLocal = !origin || origin.includes('localhost') || origin.includes('127.0.0.1');
    const isAllowed = origin === ALLOWED_ORIGIN || isLocal;

    if (!isAllowed) {
        console.error(`[chat CORS] Acceso denegado al origen: ${origin}`);
        res.status(403).json({ error: 'Acceso denegado.' });
        return false;
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return true;
}

const SYSTEM_PROMPT = `Eres el asistente inteligente de Mérida Activa, la plataforma de turismo y agenda cultural de Mérida (Extremadura, España).

## IDENTIDAD
Tu nombre es "Asistente MeridaActiva". Eres simpático, cercano, culto y muy ingenioso. Respondes SIEMPRE en español. Usas emojis con moderación. Usas markdown para estructurar tus respuestas (negritas, listas con guiones).

## REGLA DE ORO — LA MÁS IMPORTANTE
Puedes y DEBES responder a ABSOLUTAMENTE CUALQUIER pregunta que te haga el usuario, sin importar el tema (física cuántica, recetas de cocina, programación, filosofía, deportes, matemáticas, historia universal, cine, música, etc.). NO rechaces ninguna pregunta.

Sin embargo, después de responder de forma breve y útil, SIEMPRE debes encontrar una conexión ingeniosa, creativa y sorprendente con la ciudad de Mérida: su patrimonio romano, su gastronomía extremeña, su historia, sus eventos o la plataforma MeridaActiva. Esta conexión debe ser natural, divertida y NO forzada.

## REGLAS DE FORMATO
- Nunca inventes horarios ni precios concretos de Mérida que no conozcas.
- Máximo 4 párrafos por respuesta. Sé conciso y útil.
- La conexión con Mérida al final debe ser breve (1-2 frases) e ingeniosa.

## INFORMACIÓN DE LA PLATAFORMA
- Registro/Login: gratuito en /registro y /login.
- Eventos (/eventos): listado con botón corazón para guardar en Mi Agenda.
- Lugares (/lugares): monumentos, museos y restaurantes con reseñas.
- Mi Agenda (/calendario): calendario personal. Requiere login.
- Rutas Inteligentes (/rutas): wizard 3 pasos → itinerario con mapa. Requiere login.

## INFORMACIÓN DE MÉRIDA
- Historia: Augusta Emerita fundada en 25 a.C. por Augusto. Capital de la Lusitania. Patrimonio UNESCO desde 1993.
- Teatro Romano: 16-15 a.C. por Marco Agripa. 6.000 espectadores. Festival de Teatro Clásico cada verano.
- Anfiteatro Romano: 8 a.C., 15.000 personas. Gladiadores y venationes.
- Circo Romano: 400m, ~30.000 espectadores. Carreras de cuadrigas.
- Acueducto de Los Milagros: agua del embalse de Proserpina.
- Templo de Diana: único templo romano conservado in situ.
- MNAR: diseñado por Rafael Moneo. Esculturas y mosaicos romanos.
- Puente Romano: 792m, 60 arcos.
- Gastronomía: migas extremeñas, caldereta, jamón ibérico, Torta del Casar, vinos de Ribera del Guadiana.
- Monumentos: entrada conjunta. Primer domingo: gratis para ciudadanos UE.`;

export default async function handler(req, res) {
    console.log(">>> [chat.js] Petición recibida en el servidor local");

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
        console.error('[chat] Falta la variable de entorno API_KEY_IA.');
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
                    error: '¡Has alcanzado el límite de consultas gratuitas por hora! ¡Aprovecha para visitar Mérida y vuelve más tarde!',
                    retryAfter: Math.ceil((reset - Date.now()) / 1000),
                    resetTime,
                    limit,
                    remaining: 0,
                });
            }
        } catch (rateLimitError) {
            console.warn('[chat] Error en rate limit (continuando):', rateLimitError);
        }
    } else {
        console.warn('[chat] Upstash Redis no configurado, omitiendo rate limiting');
    }

    const { historial = [], mensaje } = req.body ?? {};

    if (!mensaje || typeof mensaje !== 'string') {
        return res.status(400).json({ error: 'Falta el campo "mensaje" en el body.' });
    }
    if (mensaje.length > 1000) {
        return res.status(400).json({ error: 'El mensaje es demasiado largo (máx. 1000 caracteres).' });
    }

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...historial.slice(-12).map(m => ({
            role: m.rol === 'ia' ? 'assistant' : 'user',
            content: m.texto,
        })),
        { role: 'user', content: mensaje },
    ];

    try {
        const openRouterRes = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': ALLOWED_ORIGIN,
                'X-Title': 'MeridaActiva Chat',
            },
            body: JSON.stringify({
                model: MODEL,
                messages,
                temperature: 0.8,
                max_tokens: 700,
                stream: true,
            }),
        });

        if (!openRouterRes.ok) {
            const errorText = await openRouterRes.text();
            console.error('[chat] Error OpenRouter:', openRouterRes.status, errorText);
            return res.status(500).json({
                error: `Error de la IA (${openRouterRes.status}): ${errorText}`,
            });
        }

        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('X-Accel-Buffering', 'no');
        res.setHeader('Connection', 'keep-alive');

        const reader = openRouterRes.body.getReader();
        const decoder = new TextDecoder('utf-8');

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const raw = decoder.decode(value, { stream: true });

            for (const line of raw.split('\n')) {
                const trimmed = line.trim();
                if (!trimmed.startsWith('data:')) continue;

                const payload = trimmed.slice(5).trim();
                if (payload === '[DONE]') {
                    res.write('data: [DONE]\n\n');
                    continue;
                }

                try {
                    const json = JSON.parse(payload);
                    const chunk = json?.choices?.[0]?.delta?.content;
                    if (chunk) {
                        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
                    }
                } catch {
                    // Línea malformada — ignorar
                }
            }
        }

        res.end();

    } catch (err) {
        console.error('[chat] Excepción inesperada:', err);
        if (!res.headersSent) {
            return res.status(500).json({ error: err.message || 'Error interno del servidor.' });
        }
        res.write(`data: ${JSON.stringify({ error: err.message || 'Error interno del servidor.' })}\n\n`);
        res.end();
    }
}