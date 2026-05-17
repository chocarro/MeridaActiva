/**
 * /api/comentarios.js
 *
 * Endpoint seguro para publicar reseñas/comentarios.
 * Usa la service_role key para bypasear RLS de Supabase.
 *
 * POST → insertar comentario { eventoId, texto, puntuacion, nombreUsuario }
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = process.env.VITE_SUPABASE_URL          ?? process.env.SUPABASE_URL       ?? '';
const ANON_KEY          = process.env.VITE_SUPABASE_ANON_KEY     ?? process.env.SUPABASE_ANON_KEY  ?? '';
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY  ?? '';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  if (!SERVICE_ROLE_KEY) {
    console.error('[comentarios] SUPABASE_SERVICE_ROLE_KEY no configurada.');
    return res.status(503).json({ error: 'Servidor no configurado correctamente.' });
  }

  // Verificar token del usuario
  const authHeader = req.headers?.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Token de autenticación requerido.' });
  }

  const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY);
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }

  const { eventoId, texto, puntuacion, nombreUsuario } = req.body ?? {};

  if (!eventoId || !texto?.trim()) {
    return res.status(400).json({ error: 'eventoId y texto son obligatorios.' });
  }

  const puntuacionFinal = Math.max(1, Math.min(5, parseInt(puntuacion) || 5));

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabaseAdmin
    .from('comentarios')
    .insert([{
      evento_id:      eventoId,
      usuario_id:     user.id,
      texto:          texto.trim(),
      puntuacion:     puntuacionFinal,
      nombre_usuario: nombreUsuario || 'Explorador',
    }]);

  if (error) {
    console.error('[comentarios] insert error:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
