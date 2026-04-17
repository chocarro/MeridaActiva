import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Logo from '../../componentes/Logo';
import { forceNuclearLogout } from '../../context/AuthContext';
type Mode = 'login' | 'recovery';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('login');
  const navigate = useNavigate();
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) {
      // Provide helpful Spanish error messages
      if (error.message.includes('Email not confirmed')) {
        setErrorMsg('Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.');
      } else if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
        setErrorMsg('Email o contraseña incorrectos. Comprueba tus datos o recupera tu contraseña.');
      } else {
        setErrorMsg('Error al iniciar sesión. Inténtalo de nuevo.');
      }
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setErrorMsg('No se pudo enviar el email de recuperación. Verifica que el email sea correcto.');
    } else {
      setSuccessMsg('¡Email enviado! Revisa tu bandeja de entrada y sigue el enlace para crear una nueva contraseña.');
    }
    setLoading(false);
  };

  const handleResetSesionBloqueada = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    await forceNuclearLogout();
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F0F2F5' }}>
      {/* LEFT — Visual panel (hidden on mobile) */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative overflow-hidden"
        style={{ backgroundColor: '#032B43' }}
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/Imagenes/teatro-romano.jpg"
            alt="Mérida"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #032B43cc, #032B43)' }} />
        </div>

        <div className="relative z-10">
          <Logo isScrolled={true} />
        </div>

        <div className="relative z-10">
          <blockquote className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-6" style={{ color: '#FAFAFA' }}>
            2.000 años<br />
            <span style={{ color: '#FFBA08' }}>de historia</span><br />
            te esperan.
          </blockquote>
          <p className="font-bold text-sm" style={{ color: 'rgba(250,250,250,0.5)' }}>
            Mérida, Patrimonio de la Humanidad — UNESCO 1993
          </p>
        </div>

        {/* Decorative arch */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full border-[40px] opacity-10"
          style={{ borderColor: '#FFBA08' }}
        />
      </div>

      {/* RIGHT — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10 flex justify-center">
            <Logo />
          </div>

          {/* Card */}
          <div className="rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-slate-200/60" style={{ backgroundColor: '#FAFAFA' }}>

            {mode === 'login' ? (
              <>
                <div className="mb-10">
                  <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2" style={{ color: '#032B43' }}>
                    ¡Hola de <span style={{ color: '#FFBA08' }}>nuevo!</span>
                  </h1>
                  <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: '#94a3b8' }}>
                    Accede a tu cuenta MéridaActiva
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-6 px-5 py-4 rounded-2xl text-xs font-bold border flex items-start gap-3"
                    style={{ backgroundColor: '#fef2f2', color: '#D00000', borderColor: '#fecaca' }}>
                    <i className="bi bi-exclamation-triangle-fill mt-0.5 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none transition-all focus:ring-2"
                      style={{ backgroundColor: '#F0F2F5', color: '#032B43', border: '2px solid transparent' }}
                      onFocus={e => (e.target.style.borderColor = '#3F88C5')}
                      onBlur={e => (e.target.style.borderColor = 'transparent')}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#64748b' }}>
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode('recovery')}
                        className="text-[10px] font-black uppercase tracking-widest transition-colors hover:opacity-70"
                        style={{ color: '#3F88C5' }}
                      >
                        ¿Olvidaste la contraseña?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full px-5 py-4 pr-14 rounded-2xl text-sm font-bold outline-none transition-all focus:ring-2"
                        style={{ backgroundColor: '#F0F2F5', color: '#032B43', border: '2px solid transparent' }}
                        onFocus={e => (e.target.style.borderColor = '#3F88C5')}
                        onBlur={e => (e.target.style.borderColor = 'transparent')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 transition-opacity hover:opacity-60"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''} text-lg`} style={{ color: '#94a3b8' }} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: '#032B43',
                      color: '#FFBA08',
                      boxShadow: '0 8px 32px rgba(3,43,67,0.2)',
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <i className="bi bi-arrow-repeat animate-spin" />
                        Validando...
                      </span>
                    ) : 'Entrar ahora →'}
                  </button>
                </form>

                <div className="mt-8 pt-8 text-center" style={{ borderTop: '1px solid #e2e8f0' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                    ¿No tienes cuenta?{' '}
                    <Link to="/registro" className="transition-colors hover:opacity-70" style={{ color: '#3F88C5' }}>
                      Regístrate gratis
                    </Link>
                  </p>
                  <button
                    type="button"
                    onClick={handleResetSesionBloqueada}
                    className="mt-4 text-[10px] font-black uppercase tracking-widest transition-colors hover:opacity-70"
                    style={{ color: '#D00000' }}
                  >
                    Reiniciar sesión bloqueada
                  </button>
                </div>
              </>
            ) : (
              /* ── PASSWORD RECOVERY MODE ── */
              <>
                <button
                  onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-8 transition-opacity hover:opacity-60"
                  style={{ color: '#64748b' }}
                >
                  <i className="bi bi-arrow-left" />
                  Volver al inicio de sesión
                </button>

                <div className="mb-10">
                  <div className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center mb-6"
                    style={{ backgroundColor: '#FFBA08' }}>
                    <i className="bi bi-lock-fill text-2xl" style={{ color: '#032B43' }} />
                  </div>
                  <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2" style={{ color: '#032B43' }}>
                    Recuperar <span style={{ color: '#3F88C5' }}>acceso</span>
                  </h1>
                  <p className="text-xs font-medium" style={{ color: '#94a3b8' }}>
                    Introduce tu email y te enviaremos un enlace para crear una nueva contraseña.
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-6 px-5 py-4 rounded-2xl text-xs font-bold border flex items-start gap-3"
                    style={{ backgroundColor: '#fef2f2', color: '#D00000', borderColor: '#fecaca' }}>
                    <i className="bi bi-exclamation-triangle-fill mt-0.5 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="mb-6 px-5 py-4 rounded-2xl text-xs font-bold border flex items-start gap-3"
                    style={{ backgroundColor: '#f0fdf4', color: '#136F63', borderColor: '#bbf7d0' }}>
                    <i className="bi bi-check-circle-fill mt-0.5 flex-shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {!successMsg && (
                  <form onSubmit={handleRecovery} className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
                        Tu email
                      </label>
                      <input
                        type="email"
                        autoComplete="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none transition-all focus:ring-2"
                        style={{ backgroundColor: '#F0F2F5', color: '#032B43', border: '2px solid transparent' }}
                        onFocus={e => (e.target.style.borderColor = '#3F88C5')}
                        onBlur={e => (e.target.style.borderColor = 'transparent')}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 hover:scale-[1.02]"
                      style={{ backgroundColor: '#3F88C5', color: '#FAFAFA', boxShadow: '0 8px 32px rgba(63,136,197,0.3)' }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <i className="bi bi-arrow-repeat animate-spin" />
                          Enviando...
                        </span>
                      ) : 'Enviar enlace de recuperación →'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;