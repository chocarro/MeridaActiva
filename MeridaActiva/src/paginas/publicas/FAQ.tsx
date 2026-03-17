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

// ── Base de conocimiento local (fallback sin API key) ─────────────
const RESPUESTAS_IA: Record<string, string> = {
    historia: 'Mérida (Augusta Emerita) fue fundada en el año 25 a.C. por orden del emperador Augusto para asentar a los soldados eméritos de las legiones V Alaudae y X Gemina. Llegó a ser la capital de la provincia romana de Lusitania y es Patrimonio de la Humanidad desde 1993.',
    fundacion: 'Augusta Emerita se fundó en el año 25 a.C., por orden de Augusto, para dar tierras a los veteranos licenciados que habían luchado en las Guerras Cántabras.',
    capital: 'Mérida fue la flamante capital de la Lusitania, una de las tres provincias en las que Roma dividió la Península Ibérica, lo que explica su inmensa riqueza monumental.',
    teatro: 'El **Teatro Romano de Mérida** es nuestra joya. Se inauguró hacia el año 16-15 a.C., patrocinado por el cónsul Marco Agripa. Con capacidad para unos 6.000 espectadores, hoy en día sigue vivo cada verano gracias al Festival de Teatro Clásico.',
    anfiteatro: 'El **Anfiteatro Romano**, inaugurado en el 8 a.C., está situado junto al teatro. Tenía capacidad para unas 15.000 personas y era el escenario de luchas de gladiadores (munera) y combates con fieras (venationes).',
    circo: 'El **Circo Romano** era el mayor recinto de espectáculos de la ciudad (unos 30.000 espectadores). Mide unos 400 metros de largo y se usaba para las emocionantes carreras de cuadrigas.',
    acueducto: 'Mérida tiene restos de varios acueductos majestuosos, siendo el más famoso el de **Los Milagros**, que traía agua del embalse de Proserpina.',
    diana: 'El **Templo de Diana** (en realidad dedicado al culto imperial) es el único templo religioso romano que se conserva en su sitio original en Mérida. Destaca por sus enormes columnas corintias.',
    museo: 'El **Museo Nacional de Arte Romano** (MNAR) de Moneo es imprescindible. Alberga una de las mejores colecciones de esculturas, mosaicos y objetos cotidianos del Imperio Romano.',
    romano: 'Mérida es la ciudad de España con más monumentos romanos bien conservados. Desde el Teatro, Anfiteatro y Circo, hasta el Acueducto de Los Milagros, el Puente Romano, el Foro y varias villas y casas romanas.',
    comer: '¡La gastronomía extremeña no tiene rival! Te recomiendo probar las migas, la caldereta de cordero, el jamón ibérico de la dehesa o unos buenos quesos. En la sección **Lugares > Gastronomía** verás los mejores sitios.',
    cenar: 'Para cenar en Mérida, el centro (alrededor de la Plaza de España y la calle John Lennon) está lleno de bares de tapas con terraza. Tienes varias recomendaciones en nuestra sección "Lugares".',
    gastronomia: 'Filtra por "Gastronomía" en nuestra sección de lugares. ¡Encontrarás desde taperías modernas hasta restaurantes tradicionales con las famosas migas extremeñas o carnes ibéricas!',
    restaurante: 'En la sección **Lugares** (filtrando por Gastronomía) verás los mejores restaurantes y bares de tapas de Mérida.',
    evento: 'Para ver conciertos, teatros, fiestas o exposiciones, ve a la sección **Eventos**. Y si estás registrado, puedes presionar el botón ❤ en cada evento para guardarlo en tu agenda personal.',
    agenda: '¿Quieres planificarte? Tienes **Mi Agenda** en el menú superior. Ahí aterrizan tus favoritos y además puedes crear tus propios eventos y recordatorios. ¡Todo en vista calendario!',
    favorito: 'Cuando veas un evento o monumento que te guste, dale al botón de corazón ❤. Lo tendrás listo en la sección "Mi Agenda".',
    precio: 'El Conjunto Monumental tiene una entrada conjunta muy recomendable. El primer domingo de cada mes es gratis para ciudadanos de la UE.',
    gratis: 'Nuestra plataforma **MeridaActiva** es y siempre será 100% gratuita. Solo tienes que registrarte para exprimirla al máximo.',
    registro: 'Puedes registrarte arriba a la derecha. Introduces tu email, una contraseña, confirmas en tu correo ¡y listo!',
    rutas: '¡Tenemos un Generador de Rutas Inteligentes! Entra en "Mi Agenda" y verás una tarjeta para crearla. La IA armará el recorrido perfecto según tus preferencias.',
    contacto: 'Si necesitas algo más específico, escríbenos a través del formulario de **Contacto** del menú principal.',
};

function responderIA(pregunta: string): string {
    const p = pregunta.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const hallazgos: string[] = [];
    for (const clave in RESPUESTAS_IA) {
        if (p.includes(clave)) hallazgos.push(RESPUESTAS_IA[clave]);
    }
    if (hallazgos.length === 0 && p.match(/\b(hola|buenas|saludos|que tal|hey|hello)\b/)) {
        return '¡Muy buenas! 🏛️ Soy la IA de MeridaActiva. Pregúntame sobre la historia romana de la ciudad, el teatro, los mejores sitios para comer tapas, o cómo usar la plataforma. ¡Soy todo oídos!';
    }
    if (hallazgos.length > 1) return hallazgos.join('\n\n*Y además:*\n');
    if (hallazgos.length === 1) return hallazgos[0];
    return '¡Vaya! 😅 Esa pregunta es muy específica. Pregúntame sobre el **teatro, anfiteatro, historia, gastronomía o las funciones de la web**. ¡Si es urgente ve a Contacto!';
}

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
const FAQPage: React.FC = () => {
    useSeoMeta({
        title: 'Asistente IA — MeridaActiva',
        description: 'Chatea con el asistente inteligente de MeridaActiva. Pregunta sobre eventos, monumentos, gastronomía, rutas y todo lo que necesitas saber sobre Mérida.',
    });

    const { session } = useAuth();
    const [inputChat, setInputChat] = useState('');
    const [mensajes, setMensajes] = useState<MsgChat[]>([
        {
            rol: 'ia',
            texto: '¡Hola! Soy el asistente de MeridaActiva 🏛️\n\nPuedo ayudarte con:\n- **Eventos** y agenda cultural de Mérida\n- **Monumentos** romanos y patrimonio\n- **Gastronomía** y restaurantes\n- **Rutas** personalizadas por la ciudad\n- Cualquier duda sobre la plataforma\n\n¿Qué quieres saber?',
            ts: Date.now(),
        },
    ]);
    const [pensando, setPensando] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

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
                        texto: '⚠️ Para usar el asistente IA necesitas estar registrado. **[Inicia sesión o regístrate](/login) completamente gratis** para empezar a chatear sobre Mérida.',
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

        if (!servicio) {
            await new Promise(r => setTimeout(r, 800 + Math.random() * 500));
            const respuesta = responderIA(texto);
            setMensajes(prev => [
                ...prev,
                {
                    rol: 'ia',
                    texto: respuesta + '\n\n*⚠️ Añade `VITE_GEMINI_API_KEY` en `.env` para activar la IA real.*',
                    ts: Date.now(),
                },
            ]);
            setPensando(false);
            return;
        }

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
                        ? '😅 La IA está recibiendo muchas peticiones ahora mismo. Espera unos segundos y vuelve a intentarlo.'
                        : 'Hubo un problema al conectar con el asistente. Comprueba tu conexión e inténtalo de nuevo.',
                    ts: Date.now(),
                },
            ]);
        } finally {
            setPensando(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg">

            {/* ── HERO ── */}
            <header className="relative h-[38vh] min-h-[260px] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/Imagenes/CULTURAL.jpg"
                        alt="Asistente IA MeridaActiva"
                        className="w-full h-full object-cover scale-110 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/60 to-brand-bg" />
                </div>
                <div className="relative z-10 text-center px-4">
                    <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-xs mb-4 block">
                        Asistente inteligente
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase text-white leading-none">
                        Tu guía <span className="text-brand-gold">IA</span>
                    </h1>
                    <p className="text-white/60 mt-4 text-sm font-medium max-w-md mx-auto">
                        Pregunta lo que quieras sobre Mérida, sus eventos y su patrimonio
                    </p>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 pb-32 -mt-6 relative z-10">

                {/* ── CHAT PRINCIPAL ── */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">

                    {/* Header chat */}
                    <div className="bg-brand-dark px-8 py-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-gold/20 flex items-center justify-center">
                            <i className="bi bi-robot text-brand-gold text-xl" />
                        </div>
                        <div>
                            <p className="font-black text-white text-sm uppercase tracking-wide">Asistente MeridaActiva</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">En línea · IA disponible</span>
                            </div>
                        </div>
                        {!session && (
                            <Link
                                to="/login"
                                className="ml-auto text-[9px] font-black uppercase tracking-widest bg-brand-gold text-brand-dark px-4 py-2 rounded-xl hover:scale-105 transition-all"
                            >
                                Iniciar sesión
                            </Link>
                        )}
                    </div>

                    {/* Mensajes */}
                    <div ref={chatContainerRef} className="h-[50vh] min-h-[380px] overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                        {mensajes.map((msg, i) => (
                            <div key={i} className={`flex ${msg.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                                {msg.rol === 'ia' && (
                                    <div className="w-8 h-8 rounded-xl bg-brand-dark flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                        <i className="bi bi-robot text-brand-gold text-sm" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] px-5 py-3.5 rounded-[1.25rem] text-sm font-medium leading-relaxed ${
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
                                <div className="w-8 h-8 rounded-xl bg-brand-dark flex items-center justify-center mr-2 flex-shrink-0">
                                    <i className="bi bi-robot text-brand-gold text-sm" />
                                </div>
                                <div className="bg-white border border-slate-100 rounded-[1.25rem] rounded-bl-sm px-5 py-3.5 shadow-sm flex items-center gap-1.5">
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
                    <div className="px-4 pt-4 pb-2 flex flex-wrap gap-2 border-t border-slate-100">
                        {SUGERENCIAS.map(s => (
                            <button
                                key={s}
                                type="button"
                                disabled={pensando}
                                onClick={() => procesarMensaje(s)}
                                className="text-[9px] font-black px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-brand-gold/10 hover:text-brand-dark transition-colors uppercase tracking-wide disabled:opacity-40"
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <form onSubmit={enviarMensaje} className="p-4 flex gap-3">
                        <input
                            type="text"
                            value={inputChat}
                            onChange={e => setInputChat(e.target.value)}
                            placeholder={session ? 'Escribe tu pregunta sobre Mérida…' : 'Inicia sesión para chatear con la IA…'}
                            maxLength={1000}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all text-brand-dark placeholder:text-slate-400"
                            aria-label="Escribe una pregunta al asistente"
                            disabled={pensando}
                        />
                        <button
                            type="submit"
                            disabled={pensando || !inputChat.trim()}
                            className="w-12 h-12 rounded-2xl bg-brand-dark text-brand-gold flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all disabled:opacity-40 shadow-lg flex-shrink-0"
                            aria-label="Enviar pregunta"
                        >
                            <i className="bi bi-send-fill" />
                        </button>
                    </form>
                </div>

                {/* ── CAPACIDADES DEL ASISTENTE ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
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

                {/* ── CTA CONTACTO ── */}
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

export default FAQPage;