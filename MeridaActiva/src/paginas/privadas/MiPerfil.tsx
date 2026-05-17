import React, { useState, useEffect, useRef } from 'react';
import { useAuth, forceNuclearLogout } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { getNombreRolUsuario } from '../../utils/perfilUsuario';


const MiPerfil: React.FC = () => {
  const { profile, session, loading } = useAuth();
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState<'perfil' | 'seguridad'>('perfil');
  const tabsRef = useRef<HTMLDivElement>(null);


  // --- Estado formulario perfil ---
  const [nombre, setNombre] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [perfilMsg, setPerfilMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null);

  // --- Estado seguridad ---
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingSeg, setSavingSeg] = useState(false);
  const [segMsg, setSegMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);


  // Sync perfil cuando carga
  useEffect(() => {
    if (profile) {
      setNombre(profile.nombre || '');
      setAvatarUrl(profile.avatar_url || '');
    }
    if (session?.user?.email) setNuevoEmail(session.user.email);
  }, [profile, session]);


  // Scroll active tab into view on mobile
  useEffect(() => {
    if (tabsRef.current) {
      const activeBtn = tabsRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [seccion]);

  // --- Subir avatar ---
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${session.user.id}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatares').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('avatares').getPublicUrl(path);
      setAvatarUrl(publicUrl);
      // Auto-guardar el avatar_url en el perfil inmediatamente
      const { data: { session: sess } } = await supabase.auth.getSession();
      if (sess?.access_token) {
        await fetch('/api/perfil', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sess.access_token}` },
          body: JSON.stringify({ avatarUrl: publicUrl }),
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setPerfilMsg({ tipo: 'err', texto: 'Error al subir imagen: ' + msg });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // --- Guardar perfil ---
  const handleSavePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setSavingPerfil(true);
    setPerfilMsg(null);
    try {
      const { data: { session: sess } } = await supabase.auth.getSession();
      const token = sess?.access_token;
      if (!token) throw new Error('No hay sesión activa.');

      const res = await fetch('/api/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nombre, avatarUrl }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `Error ${res.status}`);
      }
      setPerfilMsg({ tipo: 'ok', texto: '¡Perfil actualizado correctamente!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      setPerfilMsg({ tipo: 'err', texto: msg });
    } finally {
      setSavingPerfil(false);
    }
  };

  // --- Cambiar email ---
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSeg(true);
    setSegMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ email: nuevoEmail });
      if (error) throw error;
      setSegMsg({ tipo: 'ok', texto: 'Revisa tu nuevo email para confirmar el cambio.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar email';
      setSegMsg({ tipo: 'err', texto: msg });
    } finally {
      setSavingSeg(false);
    }
  };

  // --- Cambiar contraseña ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaPassword !== confirmPassword) {
      setSegMsg({ tipo: 'err', texto: 'Las contraseñas no coinciden.' });
      return;
    }
    if (nuevaPassword.length < 6) {
      setSegMsg({ tipo: 'err', texto: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    setSavingSeg(true);
    setSegMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: nuevaPassword });
      if (error) throw error;
      setSegMsg({ tipo: 'ok', texto: '¡Contraseña actualizada!' });
      setNuevaPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar contraseña';
      setSegMsg({ tipo: 'err', texto: msg });
    } finally {
      setSavingSeg(false);
    }
  };

  // --- Eliminar cuenta ---
  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setDeleteConfirm(false);
    setDeletingAccount(true);
    try {
      // Obtenemos el token de sesión para autenticar el endpoint
      const { data: { session: sess } } = await supabase.auth.getSession();
      const token = sess?.access_token;
      if (!token) throw new Error('No hay sesión activa.');

      const res = await fetch('/api/eliminar-cuenta', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Error ${res.status}`);
      }

      // Limpieza local y cierre de sesión
      await forceNuclearLogout();
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar la cuenta';
      setSegMsg({ tipo: 'err', texto: 'Error al eliminar: ' + msg });
      setDeletingAccount(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const menuItems: Array<{ id: 'perfil' | 'seguridad'; label: string; icon: string; color: string; accent: string }> = [
    { id: 'perfil',     label: 'Mi Perfil',   icon: 'bi-person-circle',    color: 'bg-brand-dark',  accent: 'border-brand-dark'  },
    { id: 'seguridad',  label: 'Seguridad',   icon: 'bi-shield-lock',      color: 'bg-brand-red',   accent: 'border-brand-red'   },
  ];

  return (
    <div className="min-h-screen bg-brand-bg pt-24 pb-20">

      {/* ── MÓVIL: avatar compacto + tabs horizontales ────────── */}
      <div className="lg:hidden px-4 mb-6">
        {/* Avatar card compacta en móvil */}
        <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100 flex items-center gap-4 mb-4">
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover shadow" />
            ) : (
              <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue text-2xl font-black">
                {nombre?.charAt(0) || session?.user?.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-gold rounded-full flex items-center justify-center cursor-pointer shadow">
              {uploadingAvatar
                ? <i className="bi bi-arrow-repeat text-brand-dark text-xs animate-spin"></i>
                : <i className="bi bi-camera-fill text-brand-dark text-xs"></i>
              }
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div className="min-w-0">
            <h2 className="font-black text-brand-dark uppercase italic text-base truncate">{nombre || 'Usuario'}</h2>
            <p className="text-[10px] font-bold text-slate-400 truncate">{session?.user?.email}</p>
            <span className="inline-block mt-1 px-3 py-0.5 bg-brand-bg rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">
              {getNombreRolUsuario(profile) || 'Explorador'}
            </span>
          </div>
        </div>

        {/* ── TABS HORIZONTALES con scroll (estilo Instagram) ── */}
        <div
          ref={tabsRef}
          className="flex overflow-x-auto gap-2 pb-1 hide-scrollbar"
          role="tablist"
          aria-label="Secciones del perfil"
        >
          {menuItems.map((item) => {
            const isActive = seccion === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isActive}
                data-active={isActive}
                onClick={() => setSeccion(item.id as any)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border-2 ${
                  isActive
                    ? `${item.color} text-white border-transparent shadow-lg`
                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                }`}
              >
                <i className={`bi ${item.icon} text-base`}></i>
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── LAYOUT GRID: sidebar en desktop, oculto en móvil ─── */}
      <div className="max-w-6xl mx-auto px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── SIDEBAR DESKTOP (solo visible en lg+) ── */}
        <aside className="hidden lg:block lg:col-span-4 space-y-4">
          {/* Avatar card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 text-center">
            <div className="relative w-28 h-28 mx-auto mb-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-28 h-28 rounded-full object-cover shadow-lg" />
              ) : (
                <div className="w-28 h-28 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue text-4xl font-black">
                  {nombre?.charAt(0) || session?.user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-9 h-9 bg-brand-gold rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                {uploadingAvatar
                  ? <i className="bi bi-arrow-repeat text-brand-dark text-sm animate-spin"></i>
                  : <i className="bi bi-camera-fill text-brand-dark text-sm"></i>
                }
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <h2 className="font-black text-brand-dark uppercase italic text-xl">{nombre || 'Usuario'}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{session?.user?.email}</p>
            <span className="inline-block mt-3 px-4 py-1 bg-brand-bg rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">
              {getNombreRolUsuario(profile) || 'Explorador'}
            </span>
          </div>

          {/* Nav desktop */}
          <nav className="space-y-2" role="tablist">
            {menuItems.map((item) => (
              <button
                key={item.id}
                role="tab"
                aria-selected={seccion === item.id}
                onClick={() => setSeccion(item.id as any)}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${seccion === item.id
                  ? `${item.color} text-white shadow-lg translate-x-1`
                  : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
                  }`}
              >
                <i className={`bi ${item.icon} text-lg`}></i>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── CONTENIDO PRINCIPAL ── */}
        <div className="lg:col-span-8" role="tabpanel">

          {/* ── PERFIL ── */}
          {seccion === 'perfil' && (
            <div className="bg-white rounded-[2rem] lg:rounded-[3rem] p-7 md:p-12 shadow-xl border border-slate-100">
              <h3 className="text-3xl lg:text-4xl font-black text-brand-dark italic uppercase tracking-tighter mb-8">
                Mi <span className="text-brand-blue">Perfil</span>
              </h3>
              <form onSubmit={handleSavePerfil} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Nombre público</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className="input-field"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Email (solo lectura)</label>
                  <input
                    type="text"
                    disabled
                    value={session?.user?.email || ''}
                    className="w-full bg-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-400 cursor-not-allowed border-none outline-none"
                  />
                  <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-2 ml-2">Para cambiar el email ve a la sección Seguridad</p>
                </div>

                {perfilMsg && (
                  <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border ${perfilMsg.tipo === 'ok'
                    ? 'bg-brand-green/10 text-brand-green border-brand-green/20'
                    : 'bg-brand-red/10 text-brand-red border-brand-red/20'
                    }`}>
                    {perfilMsg.texto}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingPerfil}
                  className="bg-brand-dark hover:bg-brand-blue text-white font-black uppercase tracking-widest text-[11px] py-4 px-10 rounded-2xl transition-all shadow-lg disabled:opacity-50"
                >
                  {savingPerfil ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            </div>
          )}

          {/* ── SEGURIDAD ── */}
          {seccion === 'seguridad' && (
            <div className="space-y-6">
              <div className="bg-white rounded-[2rem] lg:rounded-[3rem] p-7 md:p-12 shadow-xl border border-slate-100">
                <h3 className="text-2xl lg:text-3xl font-black text-brand-dark italic uppercase tracking-tighter mb-8">
                  Cambiar <span className="text-brand-blue">Email</span>
                </h3>
                <form onSubmit={handleChangeEmail} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Nuevo email</label>
                    <input type="email" value={nuevoEmail} onChange={e => setNuevoEmail(e.target.value)} className="input-field" required />
                  </div>
                  <button type="submit" disabled={savingSeg} className="btn-blue">
                    {savingSeg ? 'Procesando...' : 'Cambiar Email'}
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-[2rem] lg:rounded-[3rem] p-7 md:p-12 shadow-xl border border-slate-100">
                <h3 className="text-2xl lg:text-3xl font-black text-brand-dark italic uppercase tracking-tighter mb-8">
                  Nueva <span className="text-brand-green">Contraseña</span>
                </h3>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Nueva contraseña</label>
                    <input type="password" value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} className="input-field" placeholder="mínimo 6 caracteres" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Confirmar contraseña</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" placeholder="repite la contraseña" required />
                  </div>
                  <button type="submit" disabled={savingSeg} className="btn-dark">
                    {savingSeg ? 'Procesando...' : 'Actualizar Contraseña'}
                  </button>
                </form>
              </div>

              {segMsg && (
                <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border ${segMsg.tipo === 'ok'
                  ? 'bg-brand-green/10 text-brand-green border-brand-green/20'
                  : 'bg-brand-red/10 text-brand-red border-brand-red/20'
                  }`}>
                  {segMsg.texto}
                </div>
              )}

              <div className="bg-brand-red/5 border-2 border-brand-red/20 rounded-[2rem] lg:rounded-[3rem] p-7 md:p-12">
                <h3 className="text-xl lg:text-2xl font-black text-brand-red italic uppercase tracking-tighter mb-4">
                  Eliminar Cuenta
                </h3>
                <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
                  Eliminar tu cuenta borrará permanentemente todos tus datos, favoritos y reseñas. Esta acción no se puede deshacer.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="bg-brand-red text-white font-black uppercase tracking-widest text-[11px] py-4 px-8 rounded-2xl hover:bg-red-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {deletingAccount ? 'Eliminando...' : 'Eliminar mi cuenta'}
                </button>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default MiPerfil;