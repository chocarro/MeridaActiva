import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Logo from '../../componentes/Logo';

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verificando, setVerificando] = useState(true);
    const [tokenValido, setTokenValido] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // El enlace de Supabase llega con el token en el hash: #access_token=...&type=recovery
        // onAuthStateChange dispara PASSWORD_RECOVERY cuando Supabase procesa ese hash.
        // También comprobamos si ya hay una sesión activa (el AuthContext global la procesa primero).
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setTokenValido(true);
                setVerificando(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setTokenValido(true);
                setVerificando(false);
            } else if (event === 'SIGNED_IN' && session) {
                // El enlace de recuperación inicia sesión antes de mostrar el formulario
                setTokenValido(true);
                setVerificando(false);
            }
        });

        // Timeout de seguridad: si en 6s no llega respuesta, el enlace seguramente expiró
        const timeout = setTimeout(() => {
            setVerificando(false);
        }, 6000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            setErrorMsg('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 8) {
            setErrorMsg('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (!/[A-Z]/.test(password)) {
            setErrorMsg('La contraseña necesita al menos una letra mayúscula.');
            return;
        }
        if (!/[0-9]/.test(password)) {
            setErrorMsg('La contraseña necesita al menos un número.');
            return;
        }
        setLoading(true);
        setErrorMsg(null);
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
            setErrorMsg('No se pudo actualizar la contraseña. El enlace puede haber expirado.');
        } else {
            setSuccessMsg('¡Contraseña actualizada correctamente! Redirigiendo al inicio de sesión...');
            setTimeout(() => navigate('/login'), 3000);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ backgroundColor: '#F0F2F5' }}>
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8 flex justify-center">
                    <Logo />
                </div>

                <div className="rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-slate-200/60" style={{ backgroundColor: '#FAFAFA' }}>
                    <div className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center mb-6"
                        style={{ backgroundColor: '#FFBA08' }}>
                        <i className="bi bi-shield-lock-fill text-2xl" style={{ color: '#032B43' }} />
                    </div>

                    <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2" style={{ color: '#032B43' }}>
                        Nueva <span style={{ color: '#3F88C5' }}>contraseña</span>
                    </h1>
                    <p className="text-xs font-medium mb-8" style={{ color: '#94a3b8' }}>
                        Elige una contraseña segura para proteger tu cuenta.
                    </p>

                    {/* Estado: verificando token */}
                    {verificando && (
                        <div className="py-8 flex flex-col items-center gap-4">
                            <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verificando enlace…</p>
                        </div>
                    )}

                    {/* Token inválido / expirado */}
                    {!verificando && !tokenValido && !successMsg && (
                        <div className="space-y-5">
                            <div className="px-5 py-4 rounded-2xl text-xs font-bold border flex items-start gap-3"
                                style={{ backgroundColor: '#fef2f2', color: '#D00000', borderColor: '#fecaca' }}>
                                <i className="bi bi-exclamation-triangle-fill mt-0.5 flex-shrink-0" />
                                <span>
                                    El enlace de recuperación no es válido o ha expirado.
                                    Los enlaces son válidos durante 1 hora.
                                </span>
                            </div>
                            <Link
                                to="/login"
                                className="block w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center transition-all"
                                style={{ backgroundColor: '#3F88C5', color: '#FAFAFA' }}
                            >
                                Solicitar un nuevo enlace
                            </Link>
                        </div>
                    )}

                    {/* Formulario activo */}
                    {!verificando && tokenValido && (
                        <>
                            {errorMsg && (
                                <div className="mb-6 px-5 py-4 rounded-2xl text-xs font-bold border flex items-start gap-3"
                                    style={{ backgroundColor: '#fef2f2', color: '#D00000', borderColor: '#fecaca' }}>
                                    <i className="bi bi-exclamation-triangle-fill mt-0.5 flex-shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {successMsg ? (
                                <div className="px-5 py-6 rounded-2xl text-xs font-bold border flex items-start gap-3"
                                    style={{ backgroundColor: '#f0fdf4', color: '#136F63', borderColor: '#bbf7d0' }}>
                                    <i className="bi bi-check-circle-fill mt-0.5 flex-shrink-0 text-lg" />
                                    <span>{successMsg}</span>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
                                            Nueva contraseña
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPass ? 'text' : 'password'}
                                                placeholder="Mín. 8 caracteres, 1 mayúscula y 1 número"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                required
                                                className="w-full px-5 py-4 pr-14 rounded-2xl text-sm font-bold outline-none transition-all"
                                                style={{ backgroundColor: '#F0F2F5', color: '#032B43', border: '2px solid transparent' }}
                                                onFocus={e => (e.target.style.borderColor = '#3F88C5')}
                                                onBlur={e => (e.target.style.borderColor = 'transparent')}
                                            />
                                            <button type="button" onClick={() => setShowPass(v => !v)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-60 transition-opacity">
                                                <i className={`bi bi-eye${showPass ? '-slash' : ''} text-lg`} style={{ color: '#94a3b8' }} />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
                                            Repetir contraseña
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Repite tu nueva contraseña"
                                            value={confirm}
                                            onChange={e => setConfirm(e.target.value)}
                                            required
                                            className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none transition-all"
                                            style={{
                                                backgroundColor: '#F0F2F5', color: '#032B43',
                                                border: `2px solid ${confirm && confirm === password ? '#136F63' : 'transparent'}`,
                                            }}
                                            onFocus={e => password !== confirm && (e.target.style.borderColor = '#3F88C5')}
                                        />
                                        {confirm && confirm === password && (
                                            <p className="mt-1.5 text-[10px] font-bold flex items-center gap-1" style={{ color: '#136F63' }}>
                                                <i className="bi bi-check-circle-fill" /> Las contraseñas coinciden
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 hover:scale-[1.02]"
                                        style={{ backgroundColor: '#032B43', color: '#FFBA08', boxShadow: '0 8px 32px rgba(3,43,67,0.2)' }}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <i className="bi bi-arrow-repeat animate-spin" />
                                                Guardando...
                                            </span>
                                        ) : 'Guardar nueva contraseña →'}
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
