// src/paginas/publicas/FAQ.tsx
// ─────────────────────────────────────────────────────────────────
// Página de Asistente IA — sin acordeón de FAQs
// Todo el foco en el chat con IA
// ─────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useSeoMeta } from '../../hooks/useSeoMeta';
import { getGeminiService } from '../../utils/geminiService';
import type { MensajeChat } from '../../utils/geminiService';
import { useAuth } from '../../context/AuthContext';

const CHAT_STORAGE_KEY = 'meridaactiva_chat_historial';

type MsgChat = MensajeChat;

// ── Sugerencias rápidas ──────────────────────────────────────────
const SUGERENCIAS = [
    '¿Qué eventos hay esta semana?',
    '¿Cuándo es Emerita Lvdica?',
    '¿Mejores restaurantes?',
    'Historia del Teatro Romano',
    '¿Cómo genero una ruta?',
    '¿Es gratis la app?',
    '¿Cómo añado favoritos?',
    'Semana Santa Mérida 2026',
];

// ════════════════════════════════════════════════════════════════
const ChatPage: React.FC = () => {
    useSeoMeta({
        title: 'Asistente IA — MeridaActiva',
        description: 'Chatea con el asistente inteligente de MeridaActiva. Pregunta sobre eventos, monumentos, gastronomía, rutas y todo lo que necesitas saber sobre Mérida.',
    });

    const { session } = useAuth();
    const [inputChat, setInputChat] = useState('');

    // Restaurar historial desde sessionStorage al montar
    const [mensajes, setMensajes] = useState<MsgChat[]>(() => {
        try {
            const guardado = sessionStorage.getItem(CHAT_STORAGE_KEY);
            if (guardado) return JSON.parse(guardado) as MsgChat[];
        } catch { /* sessionStorage bloqueado o datos corruptos */ }
        return [
            {
                rol: 'ia',
                texto: '¡Hola! Soy el asistente de MeridaActiva\n\nPuedo ayudarte con:\n- **Eventos** y agenda cultural de Mérida\n- **Monumentos** romanos y patrimonio\n- **Gastronomía** y restaurantes\n- **Rutas** personalizadas por la ciudad\n- Cualquier duda sobre la plataforma\n\n¿Qué quieres saber?',
                ts: Date.now(),
            },
        ];
    });
    const [pensando, setPensando] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Persistir historial en sessionStorage cuando cambie
    useEffect(() => {
        try {
            // Solo guardar si hay más de 1 mensaje (el inicial no aporta)
            if (mensajes.length > 1) {
                sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(mensajes));
            }
        } catch { /* sessionStorage lleno o bloqueado */ }
    }, [mensajes]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [mensajes, pensando]);

    const enviarMensaje = async (e: React.FormEvent) => {
        e.preventDefault();
        const texto = inputChat.trim();
        if (!texto || pensando) return;
        await procesarMensaje(texto);
    };

    const procesarMensaje = async (texto: string) => {
        if (pensando) return;

        if (!session) {
            setMensajes(prev => [...prev, { rol: 'usuario', texto, ts: Date.now() }]);
            setTimeout(() => {
                setMensajes(prev => [
                    ...prev,
                    {
                        rol: 'ia',
                        texto: 'Para usar el asistente IA necesitas estar registrado. **[Inicia sesión o regístrate](/login) completamente gratis** para empezar a chatear sobre Mérida.',
                        ts: Date.now(),
                    },
                ]);
            }, 500);
            return;
        }

        const msgUsuario: MsgChat = { rol: 'usuario', texto, ts: Date.now() };
        const historialPrevio = mensajes;
        setMensajes(prev => [...prev, msgUsuario]);
        setInputChat('');
        setPensando(true);

        const servicio = getGeminiService();

        try {
            const idMensajeIA = Date.now();
            setMensajes(prev => [...prev, { rol: 'ia', texto: '', ts: idMensajeIA }]);
            await servicio.enviarMensajeStream(texto, historialPrevio, (nuevoChunk) => {
                setMensajes(prev => prev.map(m =>
                    m.ts === idMensajeIA ? { ...m, texto: m.texto + nuevoChunk } : m
                ));
            });
        } catch (error) {
            const msg = error instanceof Error ? error.message : '';
            const esSaturacion = msg.includes('502') || msg.includes('503') || msg.includes('overload');
            setMensajes(prev => [
                ...prev,
                {
                    rol: 'ia',
                    texto: esSaturacion
                        ? ' La IA está recibiendo muchas peticiones ahora mismo. Espera unos segundos y vuelve a intentarlo.'
                        : 'Hubo un problema al conectar con el asistente. Comprueba tu conexión e inténtalo de nuevo.',
                    ts: Date.now(),
                },
            ]);
        } finally {
            setPensando(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col">

            {/* ── HERO compacto ── */}
            <header className="relative h-[28vh] min-h-[160px] max-h-[210px] flex items-center justify-center overflow-hidden pt-16 flex-shrink-0">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/Imagenes/acueducto-de-los-milagros-merida.jpg"
                        alt="Asistente IA MeridaActiva"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/60 to-brand-bg" />
                </div>
                <div className="relative z-10 text-center px-4">
                    <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-xs mb-2 block">
                        Asistente inteligente
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase text-white leading-none">
                        Tu guía <span className="text-brand-gold">IA</span>
                    </h1>
                    <p className="text-white/60 mt-2 text-xs font-medium max-w-md mx-auto hidden sm:block">
                        Pregunta lo que quieras sobre Mérida, sus eventos y su patrimonio
                    </p>
                </div>
            </header>

            {/* ── Área del chat: ocupa el resto del viewport ── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div
                    className="max-w-4xl w-full mx-auto px-3 sm:px-4 flex flex-col flex-1 overflow-hidden py-3"
                    style={{ minHeight: 0 }}
                >
                    {/* ── CHAT PRINCIPAL ── */}
                    <div
                        className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col flex-1"
                        style={{ minHeight: 0 }}
                    >
                        {/* Header chat */}
                        <div className="bg-brand-dark px-5 py-3.5 flex items-center gap-3 flex-shrink-0">
                            <div className="w-9 h-9 rounded-xl bg-brand-gold/20 flex items-center justify-center">
                                <i className="bi bi-robot text-brand-gold text-base" />
                            </div>
                            <div>
                                <p className="font-black text-white text-xs uppercase tracking-wide">Asistente MeridaActiva</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">En línea · IA disponible</span>
                                </div>
                            </div>
                            {/* Botón limpiar historial */}
                            {mensajes.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        try { sessionStorage.removeItem(CHAT_STORAGE_KEY); } catch { /* ok */ }
                                        setMensajes([{
                                            rol: 'ia',
                                            texto: '¡Historial limpiado! ¿En qué puedo ayudarte?',
                                            ts: Date.now(),
                                        }]);
                                    }}
                                    title="Limpiar conversación"
                                    className="ml-auto text-[9px] font-black uppercase tracking-widest bg-white/10 text-white/50 px-2.5 py-1.5 rounded-xl hover:bg-white/20 hover:text-white transition-all flex items-center gap-1"
                                >
                                    <i className="bi bi-trash3 text-xs" />
                                    Limpiar
                                </button>
                            )}
                            {!session && (
                                <Link
                                    to="/login"
                                    className="ml-auto text-[9px] font-black uppercase tracking-widest bg-brand-gold text-brand-dark px-3 py-1.5 rounded-xl hover:scale-105 transition-all"
                                >
                                    Iniciar sesión
                                </Link>
                            )}
                        </div>

                        {/* Mensajes */}
                        <div
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50"
                            style={{ minHeight: 0 }}
                        >
                            {mensajes.map((msg, i) => (
                                <div key={i} className={`flex ${msg.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.rol === 'ia' && (
                                        <div className="w-7 h-7 rounded-xl bg-brand-dark flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                            <i className="bi bi-robot text-brand-gold text-xs" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] px-4 py-3 rounded-[1.25rem] text-sm font-medium leading-relaxed ${
                                            msg.rol === 'usuario'
                                                ? 'bg-brand-dark text-white rounded-br-sm'
                                                : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-sm'
                                        }`}
                                    >
                                        {msg.rol === 'ia' ? (
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ children }) => <p className="text-sm leading-relaxed mb-1 last:mb-0">{children}</p>,
                                                    strong: ({ children }) => <strong className="font-black text-brand-dark">{children}</strong>,
                                                    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-1 text-sm">{children}</ul>,
                                                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-1 text-sm">{children}</ol>,
                                                    li: ({ children }) => <li className="text-slate-600">{children}</li>,
                                                    code: ({ children }) => <code className="bg-slate-100 text-brand-blue px-1 rounded text-xs font-mono">{children}</code>,
                                                    h3: ({ children }) => <h3 className="font-black text-brand-dark text-sm mt-2 mb-1">{children}</h3>,
                                                }}
                                            >
                                                {msg.texto}
                                            </ReactMarkdown>
                                        ) : msg.texto}
                                    </div>
                                </div>
                            ))}

                            {pensando && (
                                <div className="flex justify-start">
                                    <div className="w-7 h-7 rounded-xl bg-brand-dark flex items-center justify-center mr-2 flex-shrink-0">
                                        <i className="bi bi-robot text-brand-gold text-xs" />
                                    </div>
                                    <div className="bg-white border border-slate-100 rounded-[1.25rem] rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                                        {[0, 150, 300].map(delay => (
                                            <span
                                                key={delay}
                                                className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                                                style={{ animationDelay: `${delay}ms` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sugerencias rápidas */}
                        <div className="px-3 pt-2.5 pb-1.5 flex flex-wrap gap-1.5 border-t border-slate-100 flex-shrink-0">
                            {SUGERENCIAS.map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    disabled={pensando}
                                    onClick={() => procesarMensaje(s)}
                                    className="text-[9px] font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 hover:bg-brand-gold/10 hover:text-brand-dark transition-colors uppercase tracking-wide disabled:opacity-40"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <form onSubmit={enviarMensaje} className="p-3 flex gap-2 flex-shrink-0 border-t border-slate-100">
                            <input
                                type="text"
                                value={inputChat}
                                onChange={e => setInputChat(e.target.value)}
                                placeholder={session ? 'Escribe tu pregunta sobre Mérida…' : 'Inicia sesión para chatear con la IA…'}
                                maxLength={1000}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all text-brand-dark placeholder:text-slate-400"
                                aria-label="Escribe una pregunta al asistente"
                                disabled={pensando}
                            />
                            <button
                                type="submit"
                                disabled={pensando || !inputChat.trim()}
                                className="w-10 h-10 rounded-2xl bg-brand-dark text-brand-gold flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all disabled:opacity-40 shadow-lg flex-shrink-0"
                                aria-label="Enviar pregunta"
                            >
                                <i className="bi bi-send-fill text-sm" />
                            </button>
                        </form>
                    </div>{/* end CHAT PRINCIPAL */}
                </div>{/* end max-w-4xl */}
            </div>{/* end flex-1 */}

            {/* ── CAPACIDADES + CTA — visibles al hacer scroll ── */}
            <div className="max-w-4xl w-full mx-auto px-4 pb-16">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    {[
                        { icon: 'bi-calendar-event', label: 'Eventos', desc: 'Agenda cultural actualizada' },
                        { icon: 'bi-building-fill', label: 'Patrimonio', desc: 'Monumentos y museos' },
                        { icon: 'bi-cup-hot-fill', label: 'Gastronomía', desc: 'Restaurantes y tapas' },
                        { icon: 'bi-map-fill', label: 'Rutas', desc: 'Itinerarios personalizados' },
                    ].map(item => (
                        <div key={item.label} className="bg-white rounded-[2rem] p-6 text-center border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                            <i className={`bi ${item.icon} text-2xl text-brand-gold mb-3 block`} />
                            <p className="font-black text-brand-dark text-xs uppercase tracking-widest mb-1">{item.label}</p>
                            <p className="text-slate-400 text-[10px] font-medium">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* CTA Contacto */}
                <div className="mt-8 bg-brand-dark rounded-[2rem] p-8 text-center">
                    <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                        ¿Necesitas hablar con una persona?
                    </p>
                    <h3 className="text-white font-black text-xl uppercase italic tracking-tighter mb-4">
                        Escríbenos <span className="text-brand-gold">directamente</span>
                    </h3>
                    <Link
                        to="/contacto"
                        className="inline-flex items-center gap-2 bg-brand-gold text-brand-dark px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                    >
                        <i className="bi bi-envelope-fill" />
                        Ir a Contacto
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;