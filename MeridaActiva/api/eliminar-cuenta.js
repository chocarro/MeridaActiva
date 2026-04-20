/**
 * /api/eliminar-cuenta.js
 *
 * Endpoint seguro para eliminar una cuenta de Supabase Auth.
 * Requiere:
 *   - SUPABASE_SERVICE_ROLE_KEY → para usar la Admin API de Supabase
 *   - El token Bearer del usuario en la cabecera Authorization
 *     (para verificar que la solicitud es legítima y proviene del propio usuario)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método no permitido. Usa DELETE.' });
  }

  const authHeader = req.headers?.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticación requerido.' });
  }

  if (!SERVICE_ROLE_KEY) {
    console.error('[eliminar-cuenta] SUPABASE_SERVICE_ROLE_KEY no configurada.');
    return res.status(503).json({ error: 'El servidor no está correctamente configurado.' });
  }

  // Cliente normal para verificar el token del usuario
  const supabaseUser = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY ?? '');
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Token inválido o sesión expirada.' });
  }

  // Cliente admin con Service Role Key para eliminar de auth.users
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // 1. Borrar datos de tablas propias
    await supabaseAdmin.from('favoritos').delete().eq('usuario_id', user.id);
    await supabaseAdmin.from('comentarios').delete().eq('usuario_id', user.id);
    await supabaseAdmin.from('usuarios').delete().eq('id', user.id);

    // 2. Eliminar la cuenta de auth.users (esto es lo que faltaba en el cliente)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[eliminar-cuenta] Error:', err);
    return res.status(500).json({ error: 'No se pudo eliminar la cuenta. Inténtalo de nuevo.' });
  }
}
