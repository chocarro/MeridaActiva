/**
 * PostgREST puede devolver la relación embebida `roles` como objeto o como array
 * de un solo elemento. Sin normalizar, `profile.roles.nombre` queda undefined y
 * un administrador se trata como usuario sin rol.
 */
export function normalizarPerfilDbRow<T extends Record<string, unknown> | null>(
  raw: T
): T | null {
  if (!raw || typeof raw !== 'object') return null;
  const roles = (raw as Record<string, unknown>).roles;
  if (Array.isArray(roles)) {
    return { ...raw, roles: roles[0] ?? null } as T;
  }
  return raw;
}

export function getNombreRolUsuario(profile: unknown): string | undefined {
  if (!profile || typeof profile !== 'object') return undefined;
  const r = (profile as { roles?: unknown }).roles;
  if (!r || typeof r !== 'object') return undefined;
  if (Array.isArray(r)) {
    const first = r[0] as { nombre?: string } | undefined;
    return typeof first?.nombre === 'string' ? first.nombre : undefined;
  }
  const nombre = (r as { nombre?: string }).nombre;
  return typeof nombre === 'string' ? nombre : undefined;
}
