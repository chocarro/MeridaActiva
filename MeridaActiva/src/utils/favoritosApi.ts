import { supabase } from '../supabaseClient';

async function getToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('No hay sesión activa.');
  return token;
}

export async function toggleFavoritoApi(
  elementoId: string,
  tipoElemento: 'evento' | 'lugar',
  quitar: boolean
): Promise<void> {
  const token = await getToken();
  const res = await fetch('/api/favoritos', {
    method: quitar ? 'DELETE' : 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ elementoId, tipoElemento }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? 'Error al actualizar favoritos.');
  }
}
