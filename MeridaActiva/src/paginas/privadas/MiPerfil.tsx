import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const MiPerfil: React.FC = () => {
  const { profile, session, loading } = useAuth();
  const [seccion, setSeccion] = useState<'perfil' | 'seguridad' | 'favoritos' | 'reseñas'>('perfil');

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

  // --- Estado contenido ---
  const [favoritos, setFavoritos] = useState<any[]>([]);
  const [reseñas, setReseñas] = useState<any[]>([]);

  // Sync perfil cuando carga
  useEffect(() => {
    if (profile) {
      setNombre(profile.nombre || '');
      setAvatarUrl(profile.avatar_url || '');
    }
    if (session?.user?.email) setNuevoEmail(session.user.email);
  }, [profile, session]);

  const fetchContenido = useCallback(async () => {
    if (!session?.user?.id) return;
    // Fetch all favorites (both events and places)
    const { data: favsData } = await supabase
      .from('favoritos')
      .select('id, elemento_id, tipo_elemento')
      .eq('usuario_id', session.user.id);

    if (favsData && favsData.length > 0) {
      // Resolve each favorite's detail from the correct table
      const detallesPromesas = favsData.map(async (fav: any) => {
        const tabla = fav.tipo_elemento === 'evento' ? 'eventos' : 'lugares';
        const campos = fav.tipo_elemento === 'evento' ? 'id, titulo, imagen_url' : 'id, nombre, nombre_es, imagen_url';
        const { data: detalle } = await supabase
          .from(tabla)
          .select(campos)
          .eq('id', fav.elemento_id)
          .maybeSingle();
        return { ...fav, detalle };
      });
      const resultados = await Promise.all(detallesPromesas);
      setFavoritos(resultados.filter((f: any) => f.detalle));
    } else {
      setFavoritos([]);
    }

    const { data: comms } = await supabase
      .from('comentarios')
      .select('id, texto, puntuacion, created_at, nombre_usuario, eventos(titulo, imagen_url)')
      .eq('usuario_id', session.user.id)
      .order('created_at', { ascending: false });
    if (comms) setReseñas(comms);
  }, [session?.user?.id]);

  useEffect(() => { fetchContenido(); }, [fetchContenido]);

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
    } catch (err: any) {
      setPerfilMsg({ tipo: 'err', texto: 'Error al subir imagen: ' + err.message });
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
      const { error } = await supabase
        .from('usuarios')
        .update({ nombre, avatar_url: avatarUrl })
        .eq('id', session.user.id);
      if (error) throw error;
      setPerfilMsg({ tipo: 'ok', texto: '¡Perfil actualizado correctamente!' });
    } catch (err: any) {
      setPerfilMsg({ tipo: 'err', texto: err.message });
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
    } catch (err: any) {
      setSegMsg({ tipo: 'err', texto: err.message });
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
    } catch (err: any) {
      setSegMsg({ tipo: 'err', texto: err.message });
    } finally {
      setSavingSeg(false);
    }
  };

  // --- Eliminar cuenta ---
  const handleDeleteAccount = async () => {
    if (!window.confirm('¿Estás segura? Esta acción es irreversible y eliminará todos tus datos.')) return;
    setDeletingAccount(true);
    try {
      if (session?.user?.id) {
        await supabase.from('favoritos').delete().eq('usuario_id', session.user.id);
        await supabase.from('comentarios').delete().eq('usuario_id', session.user.id);
        await supabase.from('usuarios').delete().eq('id', session.user.id);
      }
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err: any) {
      setSegMsg({ tipo: 'err', texto: 'Error al eliminar: ' + err.message });
      setDeletingAccount(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const menuItems = [
    { id: 'perfil', label: 'Mi Perfil', icon: 'bi-person-circle', color: 'bg-brand-dark' },
    { id: 'seguridad', label: 'Seguridad', icon: 'bi-shield-lock', color: 'bg-brand-red' },
    { id: 'favoritos', label: 'Favoritos', icon: 'bi-heart-fill', color: 'bg-brand-blue' },
    { id: 'reseñas', label: 'Mis Reseñas', icon: 'bi-chat-left-quote', color: 'bg-brand-green' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* ── SIDEBAR ── */}
        <aside className="lg:col-span-4 space-y-4">
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
              {profile?.roles?.nombre || 'Explorador'}
            </span>
          </div>

          {/* Nav */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
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

        {/* ── CONTENIDO ── */}
        <div className="lg:col-span-8">

          {/* ── PERFIL ── */}
          {seccion === 'perfil' && (
            <div className="bg-white rounded-[3rem] p-10 md:p-12 shadow-xl border border-slate-100">
              <h3 className="text-4xl font-black text-brand-dark italic uppercase tracking-tighter mb-10">
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
                  className="bg-brand-dark hover:bg-brand-blue text-white font-black uppercase tracking-widest text-[11px] py-5 px-12 rounded-2xl transition-all shadow-lg disabled:opacity-50"
                >
                  {savingPerfil ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            </div>
          )}

          {/* ── SEGURIDAD ── */}
          {seccion === 'seguridad' && (
            <div className="space-y-8">
              {/* Cambiar email */}
              <div className="bg-white rounded-[3rem] p-10 md:p-12 shadow-xl border border-slate-100">
                <h3 className="text-3xl font-black text-brand-dark italic uppercase tracking-tighter mb-8">
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

              {/* Cambiar contraseña */}
              <div className="bg-white rounded-[3rem] p-10 md:p-12 shadow-xl border border-slate-100">
                <h3 className="text-3xl font-black text-brand-dark italic uppercase tracking-tighter mb-8">
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

              {/* Mensajes */}
              {segMsg && (
                <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border ${segMsg.tipo === 'ok'
                  ? 'bg-brand-green/10 text-brand-green border-brand-green/20'
                  : 'bg-brand-red/10 text-brand-red border-brand-red/20'
                  }`}>
                  {segMsg.texto}
                </div>
              )}

              {/* Zona de peligro */}
              <div className="bg-brand-red/5 border-2 border-brand-red/20 rounded-[3rem] p-10 md:p-12">
                <h3 className="text-2xl font-black text-brand-red italic uppercase tracking-tighter mb-4">
                  Zona de Peligro
                </h3>
                <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                  Eliminar tu cuenta borrará permanentemente todos tus datos, favoritos y reseñas. Esta acción no se puede deshacer.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="bg-brand-red text-white font-black uppercase tracking-widest text-[11px] py-4 px-10 rounded-2xl hover:bg-red-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {deletingAccount ? 'Eliminando...' : 'Eliminar mi cuenta'}
                </button>
              </div>
            </div>
          )}

          {/* ── FAVORITOS ── */}
          {seccion === 'favoritos' && (
            <div className="bg-white rounded-[3rem] p-10 md:p-12 shadow-xl border border-slate-100">
              <h3 className="text-4xl font-black text-brand-dark italic uppercase tracking-tighter mb-10">
                Mis <span className="text-brand-blue">Favoritos</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favoritos.length > 0 ? favoritos.map((fav: any) => {
                  const titulo = fav.detalle?.titulo || fav.detalle?.nombre || fav.detalle?.nombre_es || 'Sin título';
                  const imagenUrl = fav.detalle?.imagen_url;
                  const ruta = fav.tipo_elemento === 'evento' ? `/eventos/${fav.elemento_id}` : `/lugares/${fav.elemento_id}`;
                  return (
                    <Link
                      key={fav.id}
                      to={ruta}
                      className="group bg-brand-bg rounded-[2rem] overflow-hidden border border-slate-100 hover:shadow-xl hover:border-brand-blue/20 transition-all"
                    >
                      <div className="relative h-40 overflow-hidden">
                        {imagenUrl && <img src={imagenUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/50 to-transparent"></div>
                        <span className="absolute bottom-3 left-3 bg-brand-dark/80 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">
                          {fav.tipo_elemento}
                        </span>
                      </div>
                      <div className="p-6">
                        <h4 className="font-black text-brand-dark uppercase italic text-sm group-hover:text-brand-blue transition-colors">{titulo}</h4>
                      </div>
                    </Link>
                  );
                }) : (
                  <div className="col-span-full py-20 text-center bg-brand-bg rounded-[2rem] border-2 border-dashed border-slate-200">
                    <i className="bi bi-heart text-4xl text-slate-200 block mb-4"></i>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No tienes favoritos guardados</p>
                    <Link to="/eventos" className="text-brand-blue font-black uppercase text-[10px] tracking-widest mt-4 inline-block">Explorar Eventos →</Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── RESEÑAS ── */}
          {seccion === 'reseñas' && (
            <div className="bg-white rounded-[3rem] p-10 md:p-12 shadow-xl border border-slate-100">
              <h3 className="text-4xl font-black text-brand-dark italic uppercase tracking-tighter mb-10">
                Mis <span className="text-brand-green">Reseñas</span>
              </h3>
              <div className="space-y-6">
                {reseñas.length > 0 ? reseñas.map(res => (
                  <div key={res.id} className="flex gap-6 p-6 bg-brand-bg rounded-[2rem] border border-slate-100">
                    {res.eventos?.imagen_url && (
                      <img src={res.eventos.imagen_url} className="w-20 h-20 rounded-2xl object-cover shadow shrink-0" alt="" />
                    )}
                    <div className="flex-1">
                      <p className="font-black text-brand-dark uppercase italic text-sm mb-1">{res.eventos?.titulo}</p>
                      <div className="flex gap-0.5 mb-3">
                        {[1, 2, 3, 4, 5].map(n => (
                          <i key={n} className={`bi bi-heart${n <= res.puntuacion ? '-fill text-brand-red' : ' text-slate-200'} text-xs`}></i>
                        ))}
                      </div>
                      <p className="text-slate-500 text-sm font-medium italic">"{res.texto}"</p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">{new Date(res.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        {res.nombre_usuario && <p className="text-[9px] text-brand-blue font-bold uppercase tracking-widest">por {res.nombre_usuario}</p>}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center bg-brand-bg rounded-[2rem] border-2 border-dashed border-slate-200">
                    <i className="bi bi-chat-left-quote text-4xl text-slate-200 block mb-4"></i>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Aún no has escrito ninguna reseña</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MiPerfil;