/**
 * /api/comentarios.js
 *
 * Endpoint seguro para reseñas/comentarios.
 * Usa la service_role key para bypasear RLS de Supabase.
 *
 * POST   → insertar { eventoId, texto, puntuacion, nombreUsuario }
 * PATCH  → editar propia { comentarioId, texto, puntuacion }
 * DELETE → borrar propia { comentarioId }
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = process.env.VITE_SUPABASE_URL          ?? process.env.SUPABASE_URL       ?? '';
const ANON_KEY          = process.env.VITE_SUPABASE_ANON_KEY     ?? process.env.SUPABASE_ANON_KEY  ?? '';
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY  ?? '';

async function getAuthUser(req) {
  const authHeader = req.headers?.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return { error: 'Token de autenticación requerido.', status: 401 };

  const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY);
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
  if (authError || !user) return { error: 'Token inválido o expirado.', status: 401 };

  return { user };
}

export default async function handler(req, res) {
  if (!SERVICE_ROLE_KEY) {
    console.error('[comentarios] SUPABASE_SERVICE_ROLE_KEY no configurada.');
    return res.status(503).json({ error: 'Servidor no configurado correctamente.' });
  }

  const auth = await getAuthUser(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });
  const { user } = auth;

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ── PATCH: editar reseña propia ─────────────────────────────
  if (req.method === 'PATCH') {
    const { comentarioId, texto, puntuacion } = req.body ?? {};
    if (!comentarioId || !texto?.trim()) {
      return res.status(400).json({ error: 'comentarioId y texto son obligatorios.' });
    }

    const puntuacionFinal = Math.max(1, Math.min(5, parseInt(puntuacion) || 5));

    const { data: existente, error: fetchErr } = await supabaseAdmin
      .from('comentarios')
      .select('id, usuario_id')
      .eq('id', comentarioId)
      .single();

    if (fetchErr || !existente) {
      return res.status(404).json({ error: 'Reseña no encontrada.' });
    }
    if (existente.usuario_id !== user.id) {
      return res.status(403).json({ error: 'Solo puedes editar tus propias reseñas.' });
    }

    const { error } = await supabaseAdmin
      .from('comentarios')
      .update({ texto: texto.trim(), puntuacion: puntuacionFinal })
      .eq('id', comentarioId)
      .eq('usuario_id', user.id);

    if (error) {
      console.error('[comentarios] patch error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ ok: true });
  }

  // ── DELETE: borrar reseña propia ────────────────────────────
  if (req.method === 'DELETE') {
    const { comentarioId } = req.body ?? {};
    if (!comentarioId) {
      return res.status(400).json({ error: 'comentarioId es obligatorio.' });
    }

    const { data: existente, error: fetchErr } = await supabaseAdmin
      .from('comentarios')
      .select('id, usuario_id')
      .eq('id', comentarioId)
      .single();

    if (fetchErr || !existente) {
      return res.status(404).json({ error: 'Reseña no encontrada.' });
    }
    if (existente.usuario_id !== user.id) {
      return res.status(403).json({ error: 'Solo puedes eliminar tus propias reseñas.' });
    }

    const { error } = await supabaseAdmin
      .from('comentarios')
      .delete()
      .eq('id', comentarioId)
      .eq('usuario_id', user.id);

    if (error) {
      console.error('[comentarios] delete error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ ok: true });
  }

  // ── POST: publicar reseña ───────────────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST, PATCH o DELETE.' });
  }

  const { eventoId, texto, puntuacion, nombreUsuario } = req.body ?? {};

  if (!eventoId || !texto?.trim()) {
    return res.status(400).json({ error: 'eventoId y texto son obligatorios.' });
  }

  const puntuacionFinal = Math.max(1, Math.min(5, parseInt(puntuacion) || 5));

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
