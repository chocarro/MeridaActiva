import { supabase } from '../supabaseClient';

async function getToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('No hay sesión activa.');
  return token;
}

async function callComentariosApi(method: string, body: Record<string, unknown>): Promise<void> {
  const token = await getToken();
  const res = await fetch('/api/comentarios', {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? 'Error en el servidor.');
  }
}

export async function actualizarResenaPropia(
  comentarioId: string,
  usuarioId: string,
  texto: string,
  puntuacion: number
): Promise<void> {
  const { error } = await supabase
    .from('comentarios')
    .update({ texto: texto.trim(), puntuacion })
    .eq('id', comentarioId)
    .eq('usuario_id', usuarioId);

  if (error) {
    await callComentariosApi('PATCH', { comentarioId, texto: texto.trim(), puntuacion });
  }
}

export async function eliminarResenaPropia(comentarioId: string, usuarioId: string): Promise<void> {
  const { error } = await supabase
    .from('comentarios')
    .delete()
    .eq('id', comentarioId)
    .eq('usuario_id', usuarioId);

  if (error) {
    await callComentariosApi('DELETE', { comentarioId });
  }
}

export async function eliminarResenaAdmin(comentarioId: string): Promise<void> {
  const token = await getToken();
  const res = await fetch('/api/admin-comentarios', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ comentarioId }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? 'No se pudo eliminar la reseña.');
  }
}
