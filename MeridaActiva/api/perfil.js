/**
 * /api/perfil.js
 *
 * Endpoint seguro para actualizar el perfil del usuario (nombre, avatar_url).
 * Usa la service_role key para bypasear RLS de la tabla usuarios.
 *
 * PATCH → { nombre?, avatarUrl? }
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = process.env.VITE_SUPABASE_URL          ?? process.env.SUPABASE_URL       ?? '';
const ANON_KEY          = process.env.VITE_SUPABASE_ANON_KEY     ?? process.env.SUPABASE_ANON_KEY  ?? '';
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY  ?? '';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Método no permitido. Usa PATCH.' });
  }

  if (!SERVICE_ROLE_KEY) {
    console.error('[perfil] SUPABASE_SERVICE_ROLE_KEY no configurada.');
    return res.status(503).json({ error: 'Servidor no configurado correctamente.' });
  }

  const authHeader = req.headers?.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Token de autenticación requerido.' });
  }

  // Verificar identidad
  const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY);
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }

  const { nombre, avatarUrl } = req.body ?? {};
  const updates = {};
  if (nombre !== undefined) updates.nombre = nombre;
  if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No hay campos para actualizar.' });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabaseAdmin
    .from('usuarios')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    console.error('[perfil] update error:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
