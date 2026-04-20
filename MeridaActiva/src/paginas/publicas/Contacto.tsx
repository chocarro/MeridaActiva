import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSeoMeta } from '../../hooks/useSeoMeta';

// ─── Utilidad ─────────────────────────────────────────────────────
const esEmailValido = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

// ─── Tipos ───────────────────────────────────────────────────────
type FormState = 'idle' | 'sending' | 'success' | 'error';

interface FormData {
    nombre: string;
    email: string;
    asunto: string;
    mensaje: string;
}

// ─── Datos de contacto ───────────────────────────────────────────
const INFO_ITEMS = [
    {
        icon: 'bi-geo-alt-fill',
        titulo: 'Dirección',
        lineas: ['Plaza de España, s/n', '06800 Mérida, Badajoz'],
        color: 'text-brand-gold',
        bg: 'bg-brand-gold/10',
    },
    {
        icon: 'bi-telephone-fill',
        titulo: 'Teléfono',
        lineas: ['+34 924 38 11 00', 'Lun–Vie, 9:00–18:00'],
        color: 'text-brand-blue',
        bg: 'bg-brand-blue/10',
    },
    {
        icon: 'bi-envelope-fill',
        titulo: 'Email',
        lineas: ['info@meridaactiva.es', 'Respuesta en 24-48 h'],
        color: 'text-brand-red',
        bg: 'bg-brand-red/10',
    },
    {
        icon: 'bi-clock-fill',
        titulo: 'Horario de Atención',
        lineas: ['Lunes–Viernes: 9:00–18:00', 'Sábados: 10:00–14:00'],
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
    },
];

// ════════════════════════════════════════════════════════════════
const Contacto: React.FC = () => {
    const { session } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState<FormData>({ nombre: '', email: '', asunto: '', mensaje: '' });
    const [estado, setEstado] = useState<FormState>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useSeoMeta({
        title: 'Contacto — Ponte en contacto con MeridaActiva',
        description: 'Envíanos un mensaje para publicar un evento, sugerir mejoras o resolver cualquier duda sobre MeridaActiva.',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones en el cliente
        if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
            setEstado('error');
            setErrorMsg('Por favor, completa todos los campos obligatorios.');
            return;
        }
        if (!esEmailValido(form.email)) {
            setEstado('error');
            setErrorMsg('El formato del email no es válido. Ejemplo: usuario@dominio.com');
            return;
        }
        if (form.mensaje.trim().length < 10) {
            setEstado('error');
            setErrorMsg('El mensaje debe tener al menos 10 caracteres.');
            return;
        }

        setEstado('sending');
        setErrorMsg(null);

        try {
            const res = await fetch('/api/contacto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setEstado('error');
                setErrorMsg(data?.error ?? 'No se pudo enviar el mensaje. Inténtalo de nuevo.');
                return;
            }

            setEstado('success');
            setForm({ nombre: '', email: '', asunto: '', mensaje: '' });
            setTimeout(() => setEstado('idle'), 6000);
        } catch {
            setEstado('error');
            setErrorMsg('Error de conexión. Comprueba tu internet e inténtalo de nuevo.');
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg overflow-x-hidden relative">

            {/* Decorative thread — full page background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <img src="/Imagenes/hilo-decorativo-verde.jpg" alt="" className="w-full h-full object-cover opacity-[0.04] select-none" aria-hidden="true" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>

            {/* ── HERO ── */}
            <header className="relative z-10 h-72 md:h-96 flex items-end justify-start overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/Imagenes/CULTURAL.jpg"
                        alt="Contacto"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12 w-full">
                    <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-3 block">
                        <i className="bi bi-envelope-fill mr-2" />
                        Estamos aquí para ayudarte
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
                        Contáct<span className="text-brand-gold">anos</span>
                    </h1>
                    <p className="text-white/60 font-medium max-w-lg">
                        Publica un evento, sugiere mejoras o resuelve cualquier duda sobre MeridaActiva.
                    </p>
                </div>
            </header>

            {/* ── BANNER IA ── */}
            <div className="bg-brand-dark border-b border-white/5 relative z-10 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none z-0">
                    <img src="/Imagenes/acueducto-de-los-milagros-merida.jpg" alt="" className="w-full h-full object-cover opacity-[0.08] select-none" aria-hidden="true" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-brand-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <i className="bi bi-robot text-brand-gold text-sm" />
                        </div>
                        <p className="text-white/70 text-sm font-medium">
                            <span className="text-brand-gold font-black">¿Prefieres respuesta inmediata?</span> — Nuestro asistente IA responde al instante
                        </p>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                        <button
                            onClick={() => navigate(session ? '/faq' : '/login')}
                            className="inline-flex items-center gap-2 bg-brand-gold text-brand-dark px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all"
                        >
                            <i className="bi bi-robot text-xs" />
                            Chat IA
                        </button>
                        <button
                            onClick={() => navigate(session ? '/rutas' : '/login')}
                            className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all"
                        >
                            <i className="bi bi-stars text-xs" />
                            Crear Ruta
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-24 relative z-10">

                {/* ── TARJETAS DE INFO ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 mb-20 relative z-10">
                    {INFO_ITEMS.map((item) => (
                        <div
                            key={item.titulo}
                            className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-5`}>
                                <i className={`bi ${item.icon} text-2xl ${item.color}`} />
                            </div>
                            <h3 className="font-black text-brand-dark uppercase tracking-widest text-[10px] mb-3">
                                {item.titulo}
                            </h3>
                            {item.lineas.map((l, i) => (
                                <p key={i} className={`font-bold text-sm ${i === 0 ? 'text-brand-dark' : 'text-slate-400'}`}>{l}</p>
                            ))}
                        </div>
                    ))}
                </div>

                {/* ── FORMULARIO ── */}
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
                        <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-xs mb-3 block">
                            Formulario de contacto
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-brand-dark uppercase italic tracking-tighter mb-8">
                            Envíanos un <span className="text-brand-blue">mensaje</span>
                        </h2>

                        {estado === 'success' ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center gap-6 animate-fade-in-up">
                                <div className="w-20 h-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center text-4xl">
                                    ✅
                                </div>
                                <h3 className="text-2xl font-black uppercase italic text-brand-dark tracking-tighter">¡Mensaje enviado!</h3>
                                <p className="text-slate-400 font-bold text-sm">Te responderemos en un plazo de 24–48 horas.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={form.nombre}
                                            onChange={handleChange}
                                            placeholder="Tu nombre"
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="tu@email.com"
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                        Asunto
                                    </label>
                                    <select
                                        name="asunto"
                                        value={form.asunto}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark text-sm appearance-none"
                                    >
                                        <option value="">Selecciona un asunto</option>
                                        <option value="Información general">Información general</option>
                                        <option value="Publicar evento">Publicar un evento</option>
                                        <option value="Sugerencia">Sugerencia de mejora</option>
                                        <option value="Reporte de error">Reporte de error</option>
                                        <option value="Colaboración">Colaboración</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                        Mensaje *
                                    </label>
                                    <textarea
                                        name="mensaje"
                                        value={form.mensaje}
                                        onChange={handleChange}
                                        placeholder="Cuéntanos en qué podemos ayudarte..."
                                        rows={6}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark text-sm resize-none"
                                    />
                                </div>

                                {estado === 'error' && (
                                    <p className="text-brand-red text-[10px] font-black uppercase tracking-widest">
                                        ⚠ {errorMsg}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={estado === 'sending'}
                                    className="w-full bg-brand-dark text-brand-gold py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-blue hover:text-white transition-all disabled:opacity-60 flex items-center justify-center gap-3 shadow-lg"
                                >
                                    {estado === 'sending' ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                                                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                            </svg>
                                            Enviando…
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-send-fill text-base" />
                                            Enviar Mensaje
                                        </>
                                    )}
                                </button>

                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">
                                    * Campos obligatorios. Tus datos son tratados conforme a nuestra{' '}
                                    <a href="/privacidad" className="text-brand-blue hover:underline">política de privacidad</a>.
                                </p>
                            </form>
                        )}
                    </div>

                    {/* ── CTA Chat IA ── */}
                    <div className="text-center mt-12">
                        <p className="text-slate-400 font-bold text-sm mb-6">
                            ¿Necesitas más ayuda? Nuestro asistente con inteligencia artificial responde al instante.
                        </p>
                        <button
                            onClick={() => navigate(session ? '/faq' : '/login')}
                            className="inline-flex items-center gap-3 bg-brand-dark text-brand-gold px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-blue hover:text-white transition-all shadow-xl shadow-brand-dark/10"
                        >
                            <i className="bi bi-robot text-base" />
                            Chat con IA
                            <i className="bi bi-arrow-right" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Contacto;