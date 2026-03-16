import React, { useState } from 'react';
import { useSeoMeta } from '../../hooks/useSeoMeta';

// ─── Tipos ──────────────────────────────────────────────────────────────────
type FormState = 'idle' | 'sending' | 'success' | 'error';

interface FormData {
    nombre: string;
    email: string;
    asunto: string;
    mensaje: string;
}

// ─── Datos de contacto ───────────────────────────────────────────────────────
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

const FAQS = [
    {
        pregunta: '¿Cómo puedo publicar un evento en MéridaActiva?',
        respuesta: 'Para publicar un evento necesitas tener una cuenta de gestor o administrador. Una vez verificado, podrás acceder al panel de administración y crear nuevos eventos con toda la información necesaria.',
    },
    {
        pregunta: '¿Es gratuita la plataforma?',
        respuesta: 'Sí, MéridaActiva es completamente gratuita para los ciudadanos. Los organizadores de eventos deben registrarse y pueden solicitar permisos de gestor para publicar sus actividades.',
    },
    {
        pregunta: '¿Cómo puedo guardar un evento en mi agenda?',
        respuesta: 'Registrándote en la plataforma podrás añadir eventos a tu agenda personal y recibir notificaciones sobre los mismos.',
    },
    {
        pregunta: '¿Puedo sugerir mejoras o reportar errores?',
        respuesta: 'Absolutamente. Usa el formulario de contacto señalando el asunto "Sugerencia" o "Reporte de error" y nuestro equipo lo revisará en el menor tiempo posible.',
    },
];

// ════════════════════════════════════════════════════════════════════════════
const Contacto: React.FC = () => {
    const [form, setForm] = useState<FormData>({ nombre: '', email: '', asunto: '', mensaje: '' });
    const [estado, setEstado] = useState<FormState>('idle');
    const [faqAbierta, setFaqAbierta] = useState<number | null>(null);

    // ── SEO ─────────────────────────────────────────────────────────
    useSeoMeta({
        title: 'Contacto — Ponte en contacto con MeridaActiva',
        description: 'Envíanos un mensaje para publicar un evento, sugerir mejoras o resolver cualquier duda sobre MeridaActiva.',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
            setEstado('error');
            return;
        }
        setEstado('sending');
        // Simulación de envío (aquí conectarías a un backend o servicio de email)
        await new Promise(r => setTimeout(r, 1500));
        setEstado('success');
        setForm({ nombre: '', email: '', asunto: '', mensaje: '' });
        setTimeout(() => setEstado('idle'), 5000);
    };

    return (
        <div className="min-h-screen bg-brand-bg">

            {/* ── HERO ── */}
            <header className="relative h-[40vh] min-h-[280px] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/Imagenes/CULTURAL.jpg"
                        alt="Contacto"
                        className="w-full h-full object-cover scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/60 to-brand-bg" />
                </div>
                <div className="relative z-10 text-center px-4">
                    <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-xs mb-4 block">
                        Estamos aquí para ayudarte
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase text-white leading-none">
                        Contáctanos
                    </h1>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 pb-24">

                {/* ── TARJETAS DE INFO ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-10 mb-20 relative z-10">
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

                {/* ── FORMULARIO + MAPA ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">

                    {/* Formulario */}
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
                                        rows={5}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark text-sm resize-none"
                                    />
                                </div>

                                {estado === 'error' && (
                                    <p className="text-brand-red text-[10px] font-black uppercase tracking-widest">
                                        ⚠ Por favor, completa todos los campos obligatorios.
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

                    {/* Mapa embed */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 flex-1 min-h-[400px]">
                            <iframe
                                title="Ubicación MéridaActiva"
                                src="https://www.openstreetmap.org/export/embed.html?bbox=-6.360%2C38.906%2C-6.325%2C38.928&layer=mapnik&marker=38.9161%2C-6.3437"
                                className="w-full h-full min-h-[400px] border-0"
                                loading="lazy"
                            />
                        </div>
                        <div className="bg-brand-dark rounded-[2rem] p-8 text-white">
                            <h3 className="font-black uppercase italic tracking-tighter text-xl mb-2">
                                ¿Quieres colaborar?
                            </h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                                Si eres una organización, asociación o empresa cultural de Mérida, contáctanos para explorar vías de colaboración y publicitar tus eventos.
                            </p>
                            <div className="flex gap-3">
                                {['facebook', 'instagram', 'twitter-x'].map((s) => (
                                    <a
                                        key={s}
                                        href="#"
                                        className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-dark transition-all text-white text-xl"
                                    >
                                        <i className={`bi bi-${s}`} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── FAQ ── */}
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-xs mb-4 block">
                            Preguntas frecuentes
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-brand-dark uppercase italic tracking-tighter">
                            ¿Tienes <span className="text-brand-blue">dudas</span>?
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {FAQS.map((faq, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
                            >
                                <button
                                    onClick={() => setFaqAbierta(faqAbierta === idx ? null : idx)}
                                    className="w-full flex items-center justify-between px-8 py-6 text-left gap-4 hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-black text-brand-dark text-sm uppercase tracking-wide">
                                        {faq.pregunta}
                                    </span>
                                    <i
                                        className={`bi bi-chevron-down text-brand-blue text-lg transition-transform duration-300 flex-shrink-0 ${faqAbierta === idx ? 'rotate-180' : ''}`}
                                    />
                                </button>
                                {faqAbierta === idx && (
                                    <div className="px-8 pb-6 text-slate-500 font-medium text-sm leading-relaxed border-t border-slate-50 pt-4 animate-fade-in-up">
                                        {faq.respuesta}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* CTA: ir a página FAQ completa + AI chat */}
                    <div className="text-center mt-12">
                        <p className="text-slate-400 font-bold text-sm mb-6">
                            ¿Necesitas más ayuda? Nuestro asistente con inteligencia artificial responde al instante.
                        </p>
                        <a
                            href="/faq"
                            className="inline-flex items-center gap-3 bg-brand-dark text-brand-gold px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-blue hover:text-white transition-all shadow-xl shadow-brand-dark/10"
                        >
                            <i className="bi bi-robot text-base" />
                            Todas las FAQs — Chat con IA
                            <i className="bi bi-arrow-right" />
                        </a>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Contacto;
