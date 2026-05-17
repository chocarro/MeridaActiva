/**
 * /api/favoritos.js
 *
 * Endpoint seguro para guardar y eliminar favoritos.
 * Usa la service_role key para bypasear RLS de Supabase.
 *
 * POST   → insertar favorito   { elementoId, tipoElemento }
 * DELETE → eliminar favorito   { elementoId, tipoElemento }
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = process.env.VITE_SUPABASE_URL          ?? process.env.SUPABASE_URL       ?? '';
const ANON_KEY          = process.env.VITE_SUPABASE_ANON_KEY     ?? process.env.SUPABASE_ANON_KEY  ?? '';
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY  ?? '';

export default async function handler(req, res) {
  if (!['POST', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  if (!SERVICE_ROLE_KEY) {
    console.error('[favoritos] SUPABASE_SERVICE_ROLE_KEY no configurada.');
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

  const { elementoId, tipoElemento } = req.body ?? {};
  if (!elementoId || !tipoElemento) {
    return res.status(400).json({ error: 'Faltan parámetros: elementoId, tipoElemento.' });
  }
  if (!['evento', 'lugar'].includes(tipoElemento)) {
    return res.status(400).json({ error: 'tipoElemento debe ser "evento" o "lugar".' });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (req.method === 'POST') {
    // INSERT — ignorar duplicados
    const { error } = await supabaseAdmin
      .from('favoritos')
      .upsert(
        { usuario_id: user.id, elemento_id: elementoId, tipo_elemento: tipoElemento },
        { onConflict: 'usuario_id,elemento_id,tipo_elemento', ignoreDuplicates: true }
      );

    if (error) {
      console.error('[favoritos] insert error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin
      .from('favoritos')
      .delete()
      .eq('usuario_id', user.id)
      .eq('elemento_id', elementoId)
      .eq('tipo_elemento', tipoElemento);

    if (error) {
      console.error('[favoritos] delete error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ ok: true });
  }
}
