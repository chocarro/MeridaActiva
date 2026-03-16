// src/paginas/publicas/FAQ.tsx
// ─────────────────────────────────────────────────────────────────
// Página completa de Preguntas Frecuentes + Chat con IA integrado
// ─────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useSeoMeta } from '../../hooks/useSeoMeta';
import { getGeminiService } from '../../utils/geminiService';
import type { MensajeChat } from '../../utils/geminiService';
import { useAuth } from '../../context/AuthContext';

// ── Categorías de FAQs ──────────────────────────────────────────
const FAQ_CATEGORIAS = [
    {
        icono: 'bi-calendar-event',
        titulo: 'Eventos y Agenda',
        color: 'bg-brand-blue/10 text-brand-blue',
        preguntas: [
            {
                q: '¿Cómo puedo publicar un evento en MeridaActiva?',
                a: 'Para publicar un evento necesitas una cuenta de gestor o administrador. Una vez verificado, accede al Panel Admin y crea nuevos eventos con título, descripción, fecha, categoría e imagen. Los eventos se publican inmediatamente.',
            },
            {
                q: '¿Cómo guardo un evento en mi agenda personal?',
                a: 'Regístrate o inicia sesión, y en cualquier evento verás el botón "❤ Favorito". Al pulsarlo, el evento se registra en tu sección Mi Agenda, donde también puedes consultarlo en la vista de calendario.',
            },
            {
                q: '¿Puedo añadir mis propios eventos personales?',
                a: 'Sí. En la sección "Mi Agenda" (menú superior cuando estás logueado) tienes el botón "+ Añadir evento". Puedes crear recordatorios personales con título, fecha, nota y color. Solo tú los ves.',
            },
            {
                q: '¿Con qué frecuencia se actualizan los eventos?',
                a: 'Los eventos de la plataforma se actualizan continuamente por gestores y administradores. Recomendamos visitar la sección "Eventos" regularmente o suscribirte al newsletter del footer.',
            },
        ],
    },
    {
        icono: 'bi-geo-alt',
        titulo: 'Lugares y Patrimonio',
        color: 'bg-brand-gold/10 text-brand-dark',
        preguntas: [
            {
                q: '¿Qué lugares recoge MeridaActiva?',
                a: 'Cubrimos monumentos y yacimientos romanos, museos, espacios gastronómicos, parques y zonas verdes, y todos los puntos de interés turístico de Mérida. A diferencia de guías estáticas, integramos valoraciones reales de visitantes.',
            },
            {
                q: '¿Puedo dejar una reseña de un lugar?',
                a: 'Sí, si estás registrado puedes puntuar y dejar una opinión en la página de detalle de cada lugar. Las reseñas ayudan a otros usuarios y a los organizadores a mejorar la experiencia.',
            },
            {
                q: '¿Los horarios y precios son fiables?',
                a: 'Trabajamos para mantenerlos actualizados, pero te recomendamos confirmar siempre con el lugar directamente antes de visitar, especialmente en festivos o fuera de temporada.',
            },
        ],
    },
    {
        icono: 'bi-cup-hot',
        titulo: 'Gastronomía',
        color: 'bg-green-500/10 text-green-700',
        preguntas: [
            {
                q: '¿Qué sección de gastronomía tiene MeridaActiva?',
                a: 'En la sección "Lugares" filtrando por "Gastronomía" encontrarás restaurantes, tabernas, bares de tapas y mercados de Mérida con descripción, valoraciones de usuarios, horarios y acceso al mapa interactivo.',
            },
            {
                q: '¿Puedo recomendar un restaurante que no aparece?',
                a: 'Usa el formulario de contacto seleccionando el asunto "Sugerencia". Nuestro equipo lo revisará y, si cumple los requisitos, lo añadirá a la plataforma.',
            },
        ],
    },
    {
        icono: 'bi-person-circle',
        titulo: 'Cuenta y Perfil',
        color: 'bg-purple-500/10 text-purple-700',
        preguntas: [
            {
                q: '¿Es gratuita la plataforma?',
                a: 'Sí, MeridaActiva es completamente gratuita para ciudadanos y turistas. Los organizadores que quieran publicar eventos deben registrarse y pueden solicitar permisos de gestor sin coste.',
            },
            {
                q: '¿Cómo cambio mi contraseña?',
                a: 'En Mi Perfil tienes la opción de actualizar tu contraseña. Si la has olvidado, usa el enlace "¿Olvidaste tu contraseña?" en la pantalla de login y recibirás un email de recuperación.',
            },
            {
                q: '¿Puedo eliminar mi cuenta?',
                a: 'Sí. Contacta con nosotros desde la página de Contacto indicando que deseas eliminar tu cuenta y en un plazo de 48 horas procederemos a borrar todos tus datos de acuerdo con el RGPD.',
            },
        ],
    },
    {
        icono: 'bi-shield-check',
        titulo: 'Privacidad y Datos',
        color: 'bg-red-500/10 text-red-700',
        preguntas: [
            {
                q: '¿Cómo trata MeridaActiva mis datos personales?',
                a: 'Tu email y perfil se almacenan de forma segura en Supabase (infraestructura europea). No compartimos datos con terceros ni los usamos para publicidad. Consulta nuestra Política de privacidad para todos los detalles.',
            },
            {
                q: '¿Usáis cookies de seguimiento?',
                a: 'Solo usamos cookies técnicas esenciales para la sesión. No usamos cookies de seguimiento de terceros ni publicidad comportamental. Puedes ver nuestra política de cookies en el footer.',
            },
        ],
    },
];

// ── Mejorada Base de Conocimiento IA (Fallback en Local) ─────────────────
const RESPUESTAS_IA: Record<string, string> = {
    // Historia de Mérida
    historia: 'Mérida (Augusta Emerita) fue fundada en el año 25 a.C. por orden del emperador Augusto para asentar a los soldados eméritos de las legiones V Alaudae y X Gemina. Llegó a ser la capital de la provincia romana de Lusitania y es Patrimonio de la Humanidad desde 1993.',
    fundacion: 'Augusta Emerita se fundó en el año 25 a.C., por orden de Augusto, para dar tierras a los veteranos licenciados que habían luchado en las Guerras Cántabras.',
    capital: 'Mérida fue la flamante capital de la Lusitania, una de las tres provincias en las que Roma dividió la Península Ibérica, lo que explica su inmensa riqueza monumental.',
    
    // Monumentos principales
    teatro: 'El **Teatro Romano de Mérida** es nuestra joya. Se inauguró hacia el año 16-15 a.C., patrocinado por el cónsul Marco Agripa. Con capacidad para unos 6.000 espectadores, hoy en día sigue vivo cada verano gracias al Festival de Teatro Clásico.',
    anfiteatro: 'El **Anfiteatro Romano**, inaugurado en el 8 a.C., está situado junto al teatro. Tenía capacidad para unas 15.000 personas y era el escenario de luchas de gladiadores (munera) y combates con fieras (venationes).',
    circo: 'El **Circo Romano** era el mayor recinto de espectáculos de la ciudad (unos 30.000 espectadores). Mide unos 400 metros de largo y se usaba para las emocionantes carreras de cuadrigas (carros tirados por cuatro caballos).',
    acueducto: 'Mérida tiene restos de varios acueductos majestuosos, siendo el más famoso el de **Los Milagros**, que traía agua del embalse de Proserpina.',
    diana: 'El **Templo de Diana** (en realidad dedicado al culto imperial) es el único templo religioso romano que se conserva en su sitio original en Mérida. Destaca por sus enormes columnas corintias.',
    museo: 'El **Museo Nacional de Arte Romano** (MNAR) de Moneo es imprescindible. Alberga una de las mejores colecciones de esculturas, mosaicos y objetos cotidianos del Imperio Romano. En MeridaActiva también encontrarás info del Museo Abierto y otros.',
    romano: 'Mérida es la ciudad de España con más monumentos romanos bien conservados. Desde el Teatro, Anfiteatro y Circo, hasta el Acueducto de Los Milagros, el Puente Romano, el Foro y varias villas y casas romanas.',

    // Gastronomía
    comer: '¡La gastronomía extremeña no tiene rival! Te recomiendo probar las migas, la caldereta de cordero, el jamón ibérico de la dehesa o unos buenos quesos (como la Torta del Casar o Queso de la Serena). En la sección **Lugares > Gastronomía** de la web verás los mejores sitios.',
    cenar: 'Para cenar en Mérida, el centro (alrededor de la Plaza de España y la calle John Lennon) está lleno de bares de tapas con terraza. Tienes varias recomendaciones gastronómicas geniales en nuestra sección "Lugares".',
    gastronomia: 'Filtra por "Gastronomía" en nuestra sección de lugares. ¡Encontrarás desde taperías modernas hasta restaurantes tradicionales donde probar las famosas migas extremeñas o carnes ibéricas!',
    restaurante: 'En la sección **Lugares** (y filtrando por Gastronomía) verás una lista de los mejores restaurantes y bares de tapas de Mérida, siempre acompañados de opiniones de la comunidad.',

    // Dudas App/Eventos
    evento: 'Para ver conciertos, teatros, fiestas o exposiciones, ve a la sección **Eventos**. Y si estás registrado, puedes presionar el botón de corazón ❤ en cada evento para guardarlo automáticamente en tu agenda personal.',
    agenda: '¿Quieres planificarte? Tienes **Mi Agenda** (en el menú superior). Ahí aterrizan tus favoritos, pero además, puedes crear tus propios eventos, citas o recordatorios diarios. ¡Todo está en vista calendario!',
    favorito: 'Es muy sencillo: cuando veas un evento o monumento que te guste, simplemente dale al botón de corazón (❤). Y ¡puf! Lo tendrás listo en la sección "Mi Agenda".',
    precio: 'El Conjunto Monumental tiene una entrada conjunta muy recomendable que te da acceso al teatro, anfiteatro, circo y más. El primer domingo de cada mes es gratis para ciudadanos de la UE.',
    gratis: 'Nuestra plataforma, **MeridaActiva**, es y siempre será 100% gratuita. Solo tienes que registrarte para exprimirla al máximo (favoritos, itinerarios y agenda).',
    registro: 'Puedes registrarte arriba a la derecha. Introduces tu email, una contraseña, confirmas en tu correo ¡y listo! Empezarás a disfrutar de tu planificador.',
    rutas: '¡Tenemos un Generador de Rutas Inteligentes exclusivo! Entra en "Mi Agenda", verás una tarjeta para crearla. La IA armará el recorrido perfecto de monumentos y paradas para comer usando nuestros algoritmos según cómo vayas.',
    contacto: 'Si necesitas algo más específico, escríbenos a través del formulario de **Contacto** del menú principal. Un humano (¡de verdad!) te responderá rapidísimo.',
    creador: 'MeridaActiva ha sido diseñada para revitalizar el turismo interactivo de la ciudad, ofreciendo a los visitantes herramientas modernas para disfrutar de su increíble historia sin perderse.',
};

function responderIA(pregunta: string): string {
    // Normalizamos quitando acentos y a minúsculas para un match perfecto
    const p = pregunta.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Buscar todas las coincidencias
    const hallazgos: string[] = [];
    for (const clave in RESPUESTAS_IA) {
        if (p.includes(clave)) {
            hallazgos.push(RESPUESTAS_IA[clave]);
        }
    }

    // Saludos básicos (solo si no hay matches precisos)
    if (hallazgos.length === 0 && (p.match(/\b(hola|buenas|saludos|que tal|hey|hello)\b/))) {
        return '¡Muy buenas! 🏛️ Soy la IA de MeridaActiva. Pregúntame sobre la historia romana de la ciudad, el teatro, los mejores sitios para comer tapas, o cómo usar la plataforma para organizar tu viaje. ¡Soy todo oídos!';
    }

    if (hallazgos.length > 0) {
        // Devolvemos el primero o podríamos combinarlos si quisiéramos
        // Para simplificar, si pregunta por teatro e historia damos la del teatro (la primera q macheó) o las combinamos.
        if (hallazgos.length > 1) {
            return hallazgos.join('\n\n*Y además, sobre tu pregunta:*\n');
        }
        return hallazgos[0];
    }

    return '¡Vaya! 😅 Esa pregunta es muy específica y mi memoria de gladiador no da para tanto en este momento. Pregúntame sobre el **teatro, anfiteatro, la historia de la ciudad, gastronomía o las funciones de la web**. ¡Si es urgente ve a la sección de Contacto!';
}

// ── Tipo local del mensaje de chat (alias del servicio) ───────────
// MensajeChat usa 'rol' igual que nuestra interfaz MsgChat anterior
type MsgChat = MensajeChat;

// ════════════════════════════════════════════════════════════════
const FAQPage: React.FC = () => {
    useSeoMeta({
        title: 'Preguntas Frecuentes y Chat IA — MeridaActiva',
        description: 'Todo lo que necesitas saber sobre eventos, lugares, gastronomía y tu cuenta en MeridaActiva. Chatea en tiempo real con nuestro asistente IA.',
    });

    const { session } = useAuth();

    const [categAberta, setCategAberta] = useState<string | null>(null);
    const [faqAberta, setFaqAberta] = useState<string | null>(null);
    const [inputChat, setInputChat] = useState('');
    const [mensajes, setMensajes] = useState<MsgChat[]>([
        {
            rol: 'ia',
            texto: '¡Hola! Soy el asistente de MeridaActiva 🏛️. Puedo responder preguntas sobre eventos, lugares, gastronomía, tu cuenta y la historia de Mérida. ¿En qué puedo ayudarte?',
            ts: Date.now(),
        },
    ]);
    const [pensando, setPensando] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes, pensando]);

    const enviarMensaje = async (e: React.FormEvent) => {
        e.preventDefault();
        const texto = inputChat.trim();
        if (!texto || pensando) return;
        await procesarMensaje(texto);
    };

    // ── Lógica central: envía un texto al asistente ─────────────────
    const procesarMensaje = async (texto: string) => {
        if (pensando) return;

        if (!session) {
            setMensajes(prev => [...prev, { rol: 'usuario', texto, ts: Date.now() }]);
            setTimeout(() => {
                setMensajes(prev => [
                    ...prev,
                    {
                        rol: 'ia',
                        texto: '⚠️ ¡Hola! Para proteger nuestra cuota de IA contra bots y darte la mejor experiencia, necesitas estar registrado. **[Inicia sesión o regístrate](/login) completamente gratis** para empezar a chatear conmigo sobre Mérida.',
                        ts: Date.now(),
                    },
                ]);
            }, 500);
            return;
        }

        const msgUsuario: MsgChat = { rol: 'usuario', texto, ts: Date.now() };
        // Captura el historial ANTES de añadir el mensaje actual
        const historialPrevio = mensajes;

        setMensajes(prev => [...prev, msgUsuario]);
        setInputChat('');
        setPensando(true);

        const servicio = getGeminiService();

        if (!servicio) {
            // Fallback sin API key: usa respuestas estáticas locales
            await new Promise(r => setTimeout(r, 800 + Math.random() * 500));
            const respuesta = responderIA(texto);
            setMensajes(prev => [
                ...prev,
                { 
                    rol: 'ia', 
                    texto: respuesta + '\n\n*\u26a0\ufe0f Añade `VITE_GEMINI_API_KEY` en `.env` para activar la IA real.*', 
                    ts: Date.now() 
                }
            ]);
            setPensando(false);
            return;
        }

        try {
            // El servicio gestiona el historial y el system prompt internamente
            // 1. Creamos el contenedor vacío para la respuesta de la IA
            const idMensajeIA = Date.now();
            setMensajes(prev => [...prev, { rol: 'ia', texto: '', ts: idMensajeIA }]);

            // 2. Llamamos por streaming. El callback onChunk se ejecuta múltiples veces por segundo
            await servicio.enviarMensajeStream(texto, historialPrevio, (nuevoChunk) => {
                setMensajes(prev => prev.map(m => {
                    // Solo actualizamos este mensaje en concreto
                    if (m.ts === idMensajeIA) {
                        return { ...m, texto: m.texto + nuevoChunk };
                    }
                    return m;
                }));
            });
        } catch (error) {
            console.error('Error IA Chat:', error);
            const msg = error instanceof Error ? error.message : '';
            // Detectar si es un error de saturación del modelo gratuito
            const esSaturacion = msg.includes('502') || msg.includes('503') || msg.includes('saturad') || msg.includes('occupied') || msg.includes('overload');
            setMensajes(prev => [
                ...prev,
                {
                    rol: 'ia',
                    texto: esSaturacion
                        ? '😅 Vaya, la IA está recibiendo muchas peticiones ahora mismo. Por favor, espera unos segundos y vuelve a intentarlo.'
                        : 'Hubo un problema al conectar con el asistente. Compúeba tu conexión e inténtalo de nuevo en unos momentos.',
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
            <header className="relative h-[40vh] min-h-[280px] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/Imagenes/CULTURAL.jpg"
                        alt="FAQ MeridaActiva"
                        className="w-full h-full object-cover scale-110 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/60 to-brand-bg" />
                </div>
                <div className="relative z-10 text-center px-4">
                    <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-xs mb-4 block">
                        Centro de ayuda
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase text-white leading-none">
                        Preguntas <span className="text-brand-gold">frecuentes</span>
                    </h1>
                    <p className="text-white/60 mt-4 text-sm font-medium max-w-md mx-auto">
                        Encuentra respuestas al instante o chatea con nuestro asistente IA
                    </p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 pb-32">

                {/* ── CATEGORÍAS ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 -mt-8 mb-20 relative z-10">
                    {FAQ_CATEGORIAS.map(cat => (
                        <button
                            key={cat.titulo}
                            onClick={() => {
                                setCategAberta(categAberta === cat.titulo ? null : cat.titulo);
                                setFaqAberta(null);
                            }}
                            className={`flex flex-col items-center gap-3 p-5 rounded-[2rem] border transition-all hover:-translate-y-1 hover:shadow-lg ${categAberta === cat.titulo
                                    ? 'bg-brand-dark text-white border-brand-dark shadow-xl'
                                    : 'bg-white text-brand-dark border-slate-100'
                                }`}
                        >
                            <i className={`bi ${cat.icono} text-2xl ${categAberta === cat.titulo ? 'text-brand-gold' : ''}`} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">{cat.titulo}</span>
                        </button>
                    ))}
                </div>

                {/* ── ACORDEÓN POR CATEGORÍA ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
                    <div className="space-y-6">
                        {FAQ_CATEGORIAS.map(cat => {
                            const abierta = categAberta === null || categAberta === cat.titulo;
                            if (!abierta) return null;
                            return (
                                <div key={cat.titulo}>
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest mb-4 ${cat.color}`}>
                                        <i className={`bi ${cat.icono}`} />
                                        {cat.titulo}
                                    </div>
                                    <div className="space-y-3">
                                        {cat.preguntas.map((faq, idx) => {
                                            const key = `${cat.titulo}-${idx}`;
                                            return (
                                                <div key={key} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                                                    <button
                                                        onClick={() => setFaqAberta(faqAberta === key ? null : key)}
                                                        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-slate-50 transition-colors"
                                                    >
                                                        <span className="font-black text-brand-dark text-sm">{faq.q}</span>
                                                        <i className={`bi bi-plus-lg text-brand-blue text-lg transition-transform duration-300 flex-shrink-0 ${faqAberta === key ? 'rotate-45' : ''}`} />
                                                    </button>
                                                    {faqAberta === key && (
                                                        <div className="px-6 pb-5 text-slate-500 font-medium text-sm leading-relaxed border-t border-slate-50 pt-4">
                                                            {faq.a}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── CHAT CON IA ── */}
                    <div className="lg:sticky lg:top-28 h-fit">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">

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
                            </div>

                            {/* Mensajes */}
                            <div className="h-96 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                                {mensajes.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.rol === 'ia' && (
                                            <div className="w-8 h-8 rounded-xl bg-brand-dark flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                                <i className="bi bi-robot text-brand-gold text-sm" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[80%] px-5 py-3.5 rounded-[1.25rem] text-sm font-medium leading-relaxed ${msg.rol === 'usuario'
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
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={enviarMensaje} className="p-4 border-t border-slate-100 flex gap-3">
                                <input
                                    type="text"
                                    value={inputChat}
                                     onChange={e => setInputChat(e.target.value)}
                                    placeholder="Escribe tu pregunta…"
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

                            {/* Sugerencias rápidas — envían el mensaje directamente */}
                            <div className="px-4 pb-4 flex flex-wrap gap-2">
                                {[
                                    '¿Qué eventos hay?',
                                    '¿Cómo añado favoritos?',
                                    '¿Mejores restaurantes?',
                                    'Teatro Romano',
                                    '¿Cómo genero una ruta?',
                                    '¿Es gratis la app?',
                                ].map(s => (
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
                        </div>

                        <div className="mt-6 bg-brand-dark/5 rounded-[2rem] p-6 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                ¿No encuentras lo que buscas?
                            </p>
                            <Link
                                to="/contacto"
                                className="inline-flex items-center gap-2 text-brand-blue font-black text-xs hover:text-brand-dark transition-colors"
                            >
                                <i className="bi bi-envelope-fill" />
                                Escríbenos directamente
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
