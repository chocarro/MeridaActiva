/**
 * /api/admin-usuarios.js
 *
 * Endpoint seguro para operaciones de administración de usuarios.
 * Usa la Service Role Key (ignora RLS) y verifica que el solicitante
 * sea Administrador antes de ejecutar cualquier cambio.
 *
 * PATCH /api/admin-usuarios  → cambiar rol_id o estado de un usuario
 * Body: { targetId: string, campo: 'rol_id' | 'estado', valor: number | string }
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL        = process.env.VITE_SUPABASE_URL       ?? process.env.SUPABASE_URL       ?? '';
const ANON_KEY            = process.env.VITE_SUPABASE_ANON_KEY  ?? process.env.SUPABASE_ANON_KEY  ?? '';
const SERVICE_ROLE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const ROL_ADMINISTRADOR   = 'Administrador';

export default async function handler(req, res) {
  // Solo PATCH
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Método no permitido. Usa PATCH.' });
  }

  // Verificar que la service key está configurada
  if (!SERVICE_ROLE_KEY) {
    console.error('[admin-usuarios] SUPABASE_SERVICE_ROLE_KEY no configurada.');
    return res.status(503).json({ error: 'Servidor no configurado correctamente.' });
  }

  // Extraer token del solicitante
  const authHeader = req.headers?.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Token de autenticación requerido.' });
  }

  // Verificar identidad del solicitante con el anon client
  const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY);
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }

  // Cliente admin que bypasea RLS
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verificar que el solicitante es Administrador
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
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden realizar esta acción.' });
  }

  // Parsear body
  const { targetId, campo, valor } = req.body ?? {};
  if (!targetId || !campo || valor === undefined) {
    return res.status(400).json({ error: 'Faltan parámetros: targetId, campo, valor.' });
  }

  // Validar campos permitidos
  const camposPermitidos = ['rol_id', 'estado'];
  if (!camposPermitidos.includes(campo)) {
    return res.status(400).json({ error: `Campo no permitido: ${campo}` });
  }

  // Ejecutar actualización con service role (ignora RLS)
  const { error: updateError } = await supabaseAdmin
    .from('usuarios')
    .update({ [campo]: valor })
    .eq('id', targetId);

  if (updateError) {
    console.error('[admin-usuarios] Error al actualizar:', updateError);
    return res.status(500).json({ error: 'No se pudo actualizar el usuario.' });
  }

  return res.status(200).json({ ok: true });
}
