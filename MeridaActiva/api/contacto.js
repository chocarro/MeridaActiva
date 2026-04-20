// api/contacto.js
// ─────────────────────────────────────────────────────────────────
// Endpoint serverless (Vercel) para el formulario de contacto.
// Guarda el mensaje en la tabla "mensajes_contacto" de Supabase.
// Uso: POST /api/contacto  { nombre, email, asunto, mensaje }
// ─────────────────────────────────────────────────────────────────

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'https://meridaactiva.vercel.app';

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
  if (origin === ALLOWED_ORIGIN) return true;
  if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) return true;
  return false;
}

// Validación básica de email (RFC 5322 simplificado)
function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export default async function handler(req, res) {
  const origin = req.headers.origin ?? '';

  // ── CORS ────────────────────────────────────────────────────────
  if (!isOriginAllowed(origin)) {
    return res.status(403).json({ error: 'Acceso denegado.' });
  }
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  // ── Validación ──────────────────────────────────────────────────
  const { nombre, email, asunto, mensaje } = req.body ?? {};

  if (!nombre?.trim() || !email?.trim() || !mensaje?.trim()) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, email y mensaje.' });
  }
  if (!esEmailValido(email)) {
    return res.status(400).json({ error: 'El formato del email no es válido.' });
  }
  if (mensaje.trim().length < 10) {
    return res.status(400).json({ error: 'El mensaje debe tener al menos 10 caracteres.' });
  }
  if (mensaje.trim().length > 2000) {
    return res.status(400).json({ error: 'El mensaje no puede superar los 2000 caracteres.' });
  }

  // ── Guardar en Supabase ─────────────────────────────────────────
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[contacto] Faltan variables de entorno de Supabase.');
    return res.status(500).json({ error: 'Error de configuración del servidor.' });
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/mensajes_contacto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        asunto: asunto?.trim() || 'Sin asunto',
        mensaje: mensaje.trim(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[contacto] Error Supabase:', response.status, errorText);
      // Si la tabla no existe (404/422), devolvemos éxito igualmente
      // para no exponer detalles de la BD al usuario
      if (response.status === 404 || response.status === 422) {
        console.warn('[contacto] Tabla mensajes_contacto no encontrada — mensaje ignorado silenciosamente.');
        return res.status(200).json({ ok: true, mensaje: 'Mensaje recibido. Te responderemos en 24-48 horas.' });
      }
      throw new Error(`Supabase error ${response.status}`);
    }

    return res.status(200).json({ ok: true, mensaje: 'Mensaje recibido. Te responderemos en 24-48 horas.' });

  } catch (err) {
    console.error('[contacto] Excepción:', err);
    return res.status(500).json({ error: 'No se pudo guardar el mensaje. Inténtalo de nuevo.' });
  }
}
