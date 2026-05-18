/**
 * /api/admin-comentarios.js
 *
 * DELETE → eliminar cualquier reseña (solo administradores)
 * Body: { comentarioId: string }
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL     = process.env.VITE_SUPABASE_URL      ?? process.env.SUPABASE_URL      ?? '';
const ANON_KEY         = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const ROL_ADMINISTRADOR = 'Administrador';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método no permitido. Usa DELETE.' });
  }

  if (!SERVICE_ROLE_KEY) {
    return res.status(503).json({ error: 'Servidor no configurado correctamente.' });
  }

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

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: perfil, error: perfilError } = await supabaseAdmin
    .from('usuarios')
    .select('roles(nombre)')
    .eq('id', user.id)
    .single();

  if (perfilError || !perfil) {
    return res.status(403).json({ error: 'No se pudo verificar tu perfil.' });
  }

  const rolSolicitante = perfil?.roles?.nombre ?? perfil?.roles?.[0]?.nombre ?? '';
  if (rolSolicitante !== ROL_ADMINISTRADOR) {
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
  }

  const { comentarioId } = req.body ?? {};
  if (!comentarioId) {
    return res.status(400).json({ error: 'comentarioId es obligatorio.' });
  }

  const { error } = await supabaseAdmin.from('comentarios').delete().eq('id', comentarioId);
  if (error) {
    console.error('[admin-comentarios] delete error:', error);
    return res.status(500).json({ error: 'No se pudo eliminar la reseña.' });
  }

  return res.status(200).json({ ok: true });
}
