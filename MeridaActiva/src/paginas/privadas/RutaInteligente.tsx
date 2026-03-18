import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { toastExito, toastError } from '../../utils/toast';
import { useSeoMeta } from '../../hooks/useSeoMeta';
import { getGeminiService } from '../../utils/geminiService';
import type { ParadaRuta } from '../../utils/geminiService';

// ── Fix Leaflet default icon ──────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Icono numerado ────────────────────────────────────────────────
function crearIconoNumero(numero: number) {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
      <ellipse cx="20" cy="47" rx="8" ry="3" fill="rgba(0,0,0,0.18)"/>
      <path d="M20 0C10.059 0 2 8.059 2 18c0 11.75 16.15 28.9 17.01 29.79a1.35 1.35 0 001.98 0C21.85 46.9 38 29.75 38 18 38 8.059 29.941 0 20 0z" fill="#032B43"/>
      <circle cx="20" cy="18" r="11" fill="#FFBA08"/>
      <text x="20" y="23" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="12" fill="#032B43">${numero}</text>
    </svg>`;
    return L.divIcon({ html: svg, className: '', iconSize: [40, 50], iconAnchor: [20, 50], popupAnchor: [0, -52] });
}

// ── Ajustar bounds del mapa ───────────────────────────────────────
function AjustarBounds({ puntos }: { puntos: [number, number][] }) {
    const map = useMap();
    const ajustado = useRef(false);
    useEffect(() => {
        if (puntos.length > 0 && !ajustado.current) {
            map.fitBounds(L.latLngBounds(puntos), { padding: [40, 40], maxZoom: 17 });
            ajustado.current = true;
        }
    }, [puntos, map]);
    return null;
}

// ── Tipos del wizard ──────────────────────────────────────────────
type Duracion = 'media' | 'dia' | 'finde';
type Compania = 'pareja' | 'familia' | 'solo' | 'amigos';
type Ritmo = 'relax' | 'nonstop';

interface OpcionStep<T> { valor: T; label: string; desc: string; icon: string; }

const OPCIONES_DURACION: OpcionStep<Duracion>[] = [
    { valor: 'media', label: 'Media jornada', desc: '3–4 horas', icon: 'bi-clock' },
    { valor: 'dia', label: '1 día completo', desc: 'Salida 9h – Vuelta 18h', icon: 'bi-sun' },
    { valor: 'finde', label: 'Fin de semana', desc: '2 días para verlo todo', icon: 'bi-calendar2-week' },
];
const OPCIONES_COMPANIA: OpcionStep<Compania>[] = [
    { valor: 'pareja', label: 'En pareja', desc: 'Escapada romántica', icon: 'bi-heart' },
    { valor: 'familia', label: 'Con familia', desc: 'Niños incluidos', icon: 'bi-people-fill' },
    { valor: 'solo', label: 'Solo', desc: 'A tu ritmo', icon: 'bi-person' },
    { valor: 'amigos', label: 'Con amigos', desc: 'Plan de grupo', icon: 'bi-people' },
];
const OPCIONES_RITMO: OpcionStep<Ritmo>[] = [
    { valor: 'relax', label: 'Relax', desc: 'Sin prisas, disfruta cada rincón', icon: 'bi-feather' },
    { valor: 'nonstop', label: 'Non‑stop', desc: 'Máximo en el menor tiempo', icon: 'bi-lightning-charge-fill' },
];

const LABEL: Record<string, Record<string, string>> = {
    duracion: { media: 'Media jornada', dia: '1 día completo', finde: 'Fin de semana' },
    compania: { pareja: 'En pareja', familia: 'Con familia', solo: 'Solo', amigos: 'Con amigos' },
    ritmo: { relax: 'Relax', nonstop: 'Non-stop' },
};

// ── Mapa de la ruta generada ──────────────────────────────────────
// Mejora 6: Mapa accesible
//   - role="complementary" + tabIndex={0} + aria-label en el wrapper
//   - Lista de paradas sr-only (solo visible para lectores de pantalla)
function MapaRuta({ paradas }: { paradas: ParadaRuta[] }) {
    const [rutaOSRM, setRutaOSRM] = useState<[number, number][]>([]);
    const conCoords = paradas.filter(p => p.lat && p.lng);
    const puntos: [number, number][] = conCoords.map(p => [p.lat!, p.lng!]);

    useEffect(() => {
        if (puntos.length < 2) return;
        (async () => {
            try {
                const coords = puntos.map(([lat, lng]) => `${lng},${lat}`).join(';');
                const res = await fetch(`https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`);
                const data = await res.json();
                if (data.routes?.[0]?.geometry?.coordinates) {
                    setRutaOSRM(data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]));
                }
            } catch {
                setRutaOSRM(puntos);
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paradas]);

    if (conCoords.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-[2rem] border border-slate-100">
                <i className="bi bi-geo-alt text-brand-gold text-4xl mb-3" aria-hidden="true" />
                <p className="font-black text-brand-dark text-sm">Sin coordenadas disponibles</p>
            </div>
        );
    }

    return (
        <div
            role="complementary"
            tabIndex={0}
            aria-label="Mapa de la ruta por Mérida"
            className="focus:outline-none focus:ring-2 focus:ring-brand-blue/40 rounded-[2rem]"
        >
            {/* Lista de paradas visible solo para lectores de pantalla */}
            <ol className="sr-only">
                {conCoords.map((parada, idx) => (
                    <li key={idx}>
                        Parada {idx + 1}: {parada.nombre}
                        {parada.hora ? ` a las ${parada.hora}` : ''}
                        {parada.lat && parada.lng
                            ? ` — coordenadas: latitud ${parada.lat.toFixed(4)}, longitud ${parada.lng.toFixed(4)}`
                            : ''}
                    </li>
                ))}
            </ol>

            <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white" style={{ height: 460 }}>
                <MapContainer
                    center={puntos[0]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                    aria-label="Mapa de la ruta por Mérida"
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    <AjustarBounds puntos={puntos} />
                    {rutaOSRM.length > 1 && (
                        <Polyline positions={rutaOSRM} pathOptions={{ color: '#3F88C5', weight: 5, opacity: 0.85, lineCap: 'round' }} />
                    )}
                    {conCoords.map((parada, idx) => (
                        <Marker key={idx} position={[parada.lat!, parada.lng!]} icon={crearIconoNumero(idx + 1)}>
                            <Popup closeButton={false}>
                                <div className="min-w-[180px] p-1">
                                    <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest bg-brand-blue/10 px-2 py-1 rounded-full inline-block mb-2">
                                        Parada {idx + 1}
                                    </span>
                                    <h3 className="text-sm font-black text-brand-dark uppercase italic leading-tight mb-1">{parada.nombre}</h3>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 font-bold mb-1">
                                        <i className="bi bi-clock text-brand-gold" />{parada.hora} · {parada.duracion_min} min
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-relaxed">{parada.descripcion.slice(0, 80)}…</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
                <style>{`.leaflet-popup-content-wrapper{border-radius:1.25rem!important;padding:6px!important;box-shadow:0 20px 60px rgba(0,0,0,.12)!important;}.leaflet-popup-tip{display:none}`}</style>
            </div>
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────────
const RutaInteligente: React.FC = () => {
    useSeoMeta({
        title: 'Crea tu Ruta Inteligente — MeridaActiva',
        description: 'Genera un itinerario personalizado por Mérida según tu tiempo, compañía y ritmo.',
    });

    const { session } = useAuth();

    // Wizard
    const [paso, setPaso] = useState(0);
    const [duracion, setDuracion] = useState<Duracion | null>(null);
    const [compania, setCompania] = useState<Compania | null>(null);
    const [ritmo, setRitmo] = useState<Ritmo | null>(null);

    // Estado para la IA
    const [paradas, setParadas] = useState<ParadaRuta[]>([]);
    const [generando, setGenerando] = useState(false);
    const [mensajeEstado, setMensajeEstado] = useState(''); // Mejora 9: reintento IA
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);
    const [guardado, setGuardado] = useState(false);
    const [vistaResultado, setVistaResultado] = useState<'lista' | 'mapa'>('lista');

    // ── Generación con IA ──────────────────────────────────────────
    const generarRuta = async () => {
        if (!duracion || !compania || !ritmo) return;
        setGenerando(true);
        setErrorMsg(null);
        setMensajeEstado('');

        const servicio = getGeminiService();
        if (!servicio) {
            toastError('Configura VITE_GEMINI_API_KEY en .env para generar rutas con IA');
            setGenerando(false);
            return;
        }

        try {
            // Mejora 9: onRetry callback para mostrar estado de reintento
            const resultado = await servicio.generarRuta(
                {
                    duracion: LABEL.duracion[duracion],
                    compania: LABEL.compania[compania],
                    ritmo: LABEL.ritmo[ritmo],
                },
                (intento) => setMensajeEstado(`Reintentando... (${intento}/2)`)
            );
            setParadas(resultado);
            setVistaResultado('lista');
            setPaso(4);
        } catch (err) {
            console.error('Error generando ruta:', err);
            const msg = err instanceof Error ? err.message : '';
            const esSaturacion = msg.includes('502') || msg.includes('503') || msg.includes('saturad') || msg.includes('occupied') || msg.includes('overload');
            setErrorMsg(
                esSaturacion
                    ? 'La IA está recibiendo muchas peticiones ahora mismo. Espera unos segundos y pulsa de nuevo "Generar Ruta".'
                    : 'No se pudo generar la ruta. Comprueba tu conexión e inténtalo de nuevo.'
            );
            toastError('Error al generar la ruta. Inténtalo de nuevo.');
        } finally {
            setGenerando(false);
            setMensajeEstado('');
        }
    };

    // ── Guardar en agenda ──────────────────────────────────────────
    const guardarEnAgenda = async () => {
        if (!session?.user?.id || paradas.length === 0) return;
        setGuardando(true);
        try {
            const hoy = new Date().toISOString().slice(0, 10);
            const rows = paradas.map(p => ({
                usuario_id: session.user.id,
                titulo: `${p.hora} — ${p.nombre}`,
                fecha: hoy,
                nota: p.descripcion.slice(0, 200),
                color: '#3F88C5',
            }));
            const { error } = await supabase.from('agenda_personal').insert(rows);
            if (error) throw error;
            toastExito(`¡Ruta guardada! ${paradas.length} paradas añadidas a tu agenda`);
            setGuardado(true);
        } catch {
            toastError('No se pudo guardar la ruta en tu agenda.');
        } finally {
            setGuardando(false);
        }
    };

    // ── Estado para botones de copiar/descargar ────────────────────
    const [copiado, setCopiado] = useState(false);
    const [descargandoPDF, setDescargandoPDF] = useState(false);

    // ── Copiar ruta al portapapeles ────────────────────────────────
    const copiarRuta = async () => {
        const textoRuta = paradas
            .map((p, idx) => {
                const [h, m] = p.hora.split(':').map(Number);
                const totalMin = h * 60 + m + p.duracion_min;
                const hFin = `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
                return `${idx + 1}. ${p.nombre} (${p.categoria})\n   Hora: ${p.hora} - ${hFin} (${p.duracion_min} min)\n   ${p.descripcion}\n`;
            })
            .join('\n');

        const rutaCompleta = `RUTA INTELIGENTE MERIDA ACTIVA\n${LABEL.duracion[duracion!]} • ${LABEL.compania[compania!]} • ${LABEL.ritmo[ritmo!]}\n\n${textoRuta}`;

        try {
            await navigator.clipboard.writeText(rutaCompleta);
            setCopiado(true);
            toastExito('¡Ruta copiada al portapapeles!');
            setTimeout(() => setCopiado(false), 2000);
        } catch {
            toastError('No se pudo copiar la ruta.');
        }
    };

    // ── Descargar ruta como PDF ────────────────────────────────────
    // Usa jsPDF directamente (sin html2canvas) para evitar el error
    // "unsupported color function oklab" de Tailwind v4 con html2pdf.js
    const descargarPDF = async () => {
        if (paradas.length === 0) return;
        setDescargandoPDF(true);
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();
            const fecha = new Date().toLocaleDateString('es-ES');
            const durLabel = LABEL.duracion[duracion!];
            const companiaLabel = LABEL.compania[compania!];
            const ritmoLabel = LABEL.ritmo[ritmo!];

            // ── Cabecera ──────────────────────────────────────────────
            doc.setFillColor(3, 43, 67);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 186, 8);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('MERIDA ACTIVA', 14, 18);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(255, 255, 255);
            doc.text('Ruta Inteligente generada por IA', 14, 27);
            doc.text(`${durLabel} · ${companiaLabel} · ${ritmoLabel}`, 14, 34);
            doc.setTextColor(180, 180, 180);
            doc.text(fecha, 196, 34, { align: 'right' });

            // ── Paradas ───────────────────────────────────────────────
            let y = 52;
            paradas.forEach((parada, idx) => {
                if (y > 255) {
                    doc.addPage();
                    y = 20;
                }

                // Número + nombre
                doc.setFillColor(63, 136, 197);
                doc.roundedRect(14, y, 8, 8, 2, 2, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(7);
                doc.setFont('helvetica', 'bold');
                doc.text(String(idx + 1), 18, y + 5.5, { align: 'center' });

                doc.setTextColor(3, 43, 67);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(parada.nombre.toUpperCase(), 26, y + 6);
                y += 12;

                // Hora y duración
                const [h, m] = parada.hora.split(':').map(Number);
                const totalMin = h * 60 + m + parada.duracion_min;
                const hFin = `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                doc.text(`${parada.hora} – ${hFin}  ·  ${parada.duracion_min} min  ·  ${parada.categoria}`, 26, y);
                y += 7;

                // Descripción con word wrap
                doc.setFontSize(9);
                doc.setTextColor(80, 80, 80);
                const lineas = doc.splitTextToSize(parada.descripcion, 165);
                doc.text(lineas, 26, y);
                y += lineas.length * 5 + 8;

                // Línea separadora
                doc.setDrawColor(230, 230, 230);
                doc.line(14, y - 4, 196, y - 4);
            });

            // ── Pie ───────────────────────────────────────────────────
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Generado por MeridaActiva · meridaactiva.vercel.app', 105, 290, { align: 'center' });

            doc.save(`ruta-merida-${new Date().toISOString().split('T')[0]}.pdf`);
            toastExito('¡PDF descargado correctamente!');
        } catch (err) {
            console.error('Error generando PDF:', err);
            toastError('No se pudo generar el PDF.');
        } finally {
            setDescargandoPDF(false);
        }
    };

    // ── Sin sesión ────────────────────────────────────────────────
    if (!session) {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center px-6 pt-20">
                <div className="max-w-md w-full bg-white rounded-[3rem] p-14 text-center border border-slate-100 shadow-2xl">
                    <div className="w-20 h-20 bg-brand-gold/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <i className="bi bi-map text-brand-gold text-4xl" />
                    </div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-brand-dark mb-4">
                        Rutas <span className="text-brand-gold">Inteligentes</span>
                    </h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-10 max-w-xs mx-auto leading-relaxed">
                        Inicia sesión para crear tu itinerario personalizado por Mérida
                    </p>
                    <Link to="/login" className="inline-block bg-brand-dark text-brand-gold px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
                        Iniciar sesión
                    </Link>
                </div>
            </div>
        );
    }

    // ── PASO 4: RESULTADO ─────────────────────────────────────────
    if (paso === 4 && paradas.length > 0) {
        const durLabel = LABEL.duracion[duracion!];
        return (
            <div className="min-h-screen bg-brand-bg pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
                        <div>
                            <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-xs mb-3 block">
                                <i className="bi bi-stars mr-2" />Generado por IA · Gemini
                            </span>
                            <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-brand-dark leading-none">
                                Tu Ruta <span className="text-brand-blue">Perfecta</span>
                            </h1>
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mt-3">
                                {durLabel} · {LABEL.compania[compania!]} · {LABEL.ritmo[ritmo!]} · {paradas.length} paradas
                            </p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            {!guardado ? (
                                <button
                                    onClick={guardarEnAgenda}
                                    disabled={guardando}
                                    className="flex items-center gap-2 bg-brand-gold text-brand-dark px-7 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-lg disabled:opacity-60"
                                >
                                    {guardando
                                        ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>Guardando…</>
                                        : <><i className="bi bi-bookmark-fill" />Guardar en Mi Agenda</>
                                    }
                                </button>
                            ) : (
                                <Link to="/calendario" className="flex items-center gap-2 bg-brand-green text-white px-7 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
                                    <i className="bi bi-check2-circle" />Ver en Mi Agenda
                                </Link>
                            )}
                            <button
                                onClick={copiarRuta}
                                className={`flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${
                                    copiado
                                        ? 'bg-brand-green text-white'
                                        : 'bg-white text-brand-dark border border-slate-200 hover:border-brand-dark'
                                }`}
                            >
                                <i className={`bi ${copiado ? 'bi-check2' : 'bi-clipboard'}`} />{copiado ? '¡Copiado!' : 'Copiar Ruta'}
                            </button>
                            <button
                                onClick={descargarPDF}
                                disabled={descargandoPDF}
                                className="flex items-center gap-2 bg-blue-100 text-blue-700 px-7 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-200 transition-all shadow-lg disabled:opacity-60"
                            >
                                {descargandoPDF
                                    ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>Generando…</>
                                    : <><i className="bi bi-file-earmark-pdf" />PDF</>
                                }
                            </button>
                            <button
                                onClick={() => { setPaso(0); setParadas([]); setDuracion(null); setCompania(null); setRitmo(null); setGuardado(false); }}
                                className="flex items-center gap-2 bg-white text-brand-dark border border-slate-200 px-7 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-brand-dark transition-all"
                            >
                                <i className="bi bi-arrow-clockwise" />Nueva Ruta
                            </button>
                        </div>
                    </div>

                    {/* Toggle Lista / Mapa */}
                    <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm w-fit">
                        {([['lista', 'bi-list-ul', 'Itinerario'], ['mapa', 'bi-map', 'Ver en Mapa']] as const).map(([val, icon, label]) => (
                            <button
                                key={val}
                                onClick={() => setVistaResultado(val)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${vistaResultado === val ? 'bg-brand-dark text-brand-gold shadow-md' : 'text-slate-400 hover:text-brand-dark'}`}
                            >
                                <i className={`bi ${icon}`} />{label}
                            </button>
                        ))}
                    </div>

                    {/* Contenedor itinerario */}
                    <div className="bg-white p-8 rounded-[2rem]">
                        {/* ── VISTA MAPA ── */}
                        {vistaResultado === 'mapa' && <MapaRuta paradas={paradas} />}

                        {/* ── VISTA LISTA ── */}
                        {vistaResultado === 'lista' && (
                            <div className="relative">
                                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-blue via-brand-gold to-brand-blue/10" />
                                <div className="space-y-6">
                                    {paradas.map((parada, idx) => {
                                        const [h, m] = parada.hora.split(':').map(Number);
                                        const totalMin = h * 60 + m + parada.duracion_min;
                                        const hFin = `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
                                        return (
                                            <div key={idx} className="flex gap-8 items-start">
                                                <div className="relative z-10 flex-shrink-0 w-16 flex justify-center">
                                                    <div className="w-8 h-8 rounded-full bg-brand-dark border-4 border-brand-gold flex items-center justify-center mt-4">
                                                        <span className="text-brand-gold text-[10px] font-black">{idx + 1}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 pb-2">
                                                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                                        <div className="bg-gradient-to-r from-brand-dark to-brand-dark/90 px-6 py-4 flex items-center justify-between">
                                                            <div>
                                                                <span className="text-[9px] font-black text-brand-gold uppercase tracking-widest opacity-70 block mb-0.5">
                                                                    {parada.categoria}
                                                                </span>
                                                                <h3 className="text-base font-black text-white uppercase italic tracking-tight leading-tight">
                                                                    {parada.nombre}
                                                                </h3>
                                                            </div>
                                                            <div className="text-right flex-shrink-0 ml-4">
                                                                <p className="text-2xl font-black text-brand-gold tracking-tighter">{parada.hora}</p>
                                                                <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">hasta {hFin}</p>
                                                            </div>
                                                        </div>
                                                        <div className="px-6 py-4">
                                                            <p className="text-slate-500 text-sm leading-relaxed font-medium mb-3">
                                                                {parada.descripcion}
                                                            </p>
                                                            <div className="flex items-center gap-3">
                                                                <span className="flex items-center gap-1 text-[9px] font-black text-brand-dark/60 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                                                    <i className="bi bi-clock text-brand-gold" />{parada.duracion_min} min
                                                                </span>
                                                                {parada.lat && parada.lng && (
                                                                    <span className="flex items-center gap-1 text-[9px] font-black text-brand-blue uppercase tracking-widest">
                                                                        <i className="bi bi-geo-alt-fill" />En el mapa
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="flex gap-8 items-center">
                                        <div className="relative z-10 flex-shrink-0 w-16 flex justify-center">
                                            <div className="w-6 h-6 rounded-full bg-brand-gold flex items-center justify-center">
                                                <i className="bi bi-check2 text-brand-dark text-xs" />
                                            </div>
                                        </div>
                                        <div className="bg-brand-dark rounded-[2rem] py-5 px-8 flex-1">
                                            <p className="text-white font-black uppercase italic tracking-tighter text-lg">
                                                ¡Fin de la ruta! Espera que hayas disfrutado de <span className="text-brand-gold">Mérida</span> <i className="bi bi-building-fill text-brand-gold" />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ── WIZARD pasos 0–3 ──────────────────────────────────────────
    const PASOS = [
        { label: 'Tiempo disponible', icon: 'bi-clock', opciones: OPCIONES_DURACION, valor: duracion, setter: (v: Duracion) => { setDuracion(v); setPaso(2); } },
        { label: '¿Con quién vienes?', icon: 'bi-people', opciones: OPCIONES_COMPANIA, valor: compania, setter: (v: Compania) => { setCompania(v); setPaso(3); } },
        { label: 'Tu ritmo de viaje', icon: 'bi-lightning', opciones: OPCIONES_RITMO, valor: ritmo, setter: (v: Ritmo) => { setRitmo(v); } },
    ];
    const pasoActual = PASOS[paso - 1];

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col">
            {/* Hero */}
            <div className="relative h-[38vh] min-h-[240px] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0">
                    <img src="/Imagenes/merida-maravilla-monumental.jpg" alt="Rutas por Mérida" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/70 via-brand-dark/50 to-brand-bg" />
                </div>
                <div className="relative z-10 text-center px-4">
                    <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-xs mb-4 block">
                        <i className="bi bi-stars mr-2" />Powered by Gemini AI
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
                        Crea tu <span className="text-brand-gold">Ruta Ideal</span>
                    </h1>
                </div>
            </div>

            {/* Wizard */}
            <div className="flex-1 flex items-center justify-center px-6 pb-20 -mt-6">
                <div className="w-full max-w-2xl">

                    {/* Pantalla intro */}
                    {paso === 0 && (
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 text-center">
                            <div className="w-20 h-20 bg-brand-gold/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                <i className="bi bi-map text-brand-gold text-4xl" />
                            </div>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-brand-dark mb-4">
                                Tu itinerario,<br />en <span className="text-brand-gold">3 preguntas</span>
                            </h2>
                            <p className="text-slate-400 font-bold text-sm leading-relaxed mb-8 max-w-md mx-auto">
                                La IA creará un itinerario personalizado con monumentos y restaurantes reales de Mérida, horarios y descripciones de por qué encajan contigo.
                            </p>
                            <div className="grid grid-cols-3 gap-4 mb-10">
                                {[
                                    { icon: 'bi-clock', label: '¿Cuánto tiempo?' },
                                    { icon: 'bi-people', label: '¿Con quién?' },
                                    { icon: 'bi-lightning-charge', label: '¿Qué ritmo?' },
                                ].map(({ icon, label }) => (
                                    <div key={label} className="bg-brand-bg rounded-2xl p-4 text-center">
                                        <i className={`bi ${icon} text-3xl text-brand-gold mb-2 block`} />
                                        <p className="text-[10px] font-black text-brand-dark uppercase tracking-widest">{label}</p>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setPaso(1)}
                                className="inline-flex items-center gap-3 bg-brand-dark text-brand-gold px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-xl"
                            >
                                <i className="bi bi-stars" />Empezar
                            </button>
                        </div>
                    )}

                    {/* Pasos 1–3 */}
                    {paso >= 1 && paso <= 3 && pasoActual && (
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 relative">
                            <div className="flex gap-2 mb-10">
                                {[1, 2, 3].map(n => (
                                    <div key={n} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${n <= paso ? 'bg-brand-gold' : 'bg-slate-100'}`} />
                                ))}
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-brand-dark flex items-center justify-center">
                                    <i className={`bi ${pasoActual.icon} text-brand-gold text-2xl`} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pregunta {paso} de 3</p>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-brand-dark">{pasoActual.label}</h2>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(pasoActual.opciones as OpcionStep<Duracion | Compania | Ritmo>[]).map(op => (
                                    <button
                                        key={op.valor}
                                        onClick={() => (pasoActual.setter as (v: any) => void)(op.valor)}
                                        disabled={generando}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:border-brand-gold hover:bg-brand-gold/5 hover:-translate-y-0.5 ${pasoActual.valor === op.valor ? 'border-brand-gold bg-brand-gold/10' : 'border-slate-100 bg-brand-bg'}`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-brand-dark/5 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-gold/20 transition-colors">
                                            <i className={`bi ${op.icon} text-brand-dark text-xl group-hover:text-brand-dark`} />
                                        </div>
                                        <div>
                                            <p className="font-black text-brand-dark uppercase tracking-wide text-sm">{op.label}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{op.desc}</p>
                                        </div>
                                        {pasoActual.valor === op.valor && <i className="bi bi-check-circle-fill text-brand-gold ml-auto text-lg" />}
                                    </button>
                                ))}
                            </div>

                            {paso > 1 && (
                                <button
                                    onClick={() => setPaso(paso - 1)}
                                    className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-dark transition-colors flex items-center gap-2"
                                >
                                    <i className="bi bi-arrow-left" />Pregunta anterior
                                </button>
                            )}

                            {paso === 3 && ritmo && (
                                <div className="mt-8 flex flex-col items-center gap-4">
                                    {errorMsg && (
                                        <div className="w-full bg-red-50 border border-red-100 rounded-2xl px-5 py-3 flex items-center gap-3">
                                            <i className="bi bi-exclamation-triangle text-red-500 flex-shrink-0" />
                                            <p className="text-xs font-bold text-red-600">{errorMsg}</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={generarRuta}
                                        disabled={generando}
                                        className="inline-flex items-center gap-3 bg-brand-gold text-brand-dark px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-xl hover:-translate-y-1 transform disabled:opacity-50"
                                    >
                                        {generando ? (
                                            <>
                                                <svg className="animate-spin w-5 h-5 text-current" viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                                                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                                </svg>
                                                Consultando a la IA…
                                            </>
                                        ) : (
                                            <><i className="bi bi-stars" />Generar Ruta Perfecta</>
                                        )}
                                    </button>
                                    {generando && (
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                                            Gemini está diseñando tu itinerario...
                                        </p>
                                    )}
                                </div>
                            )}

                            {generando && (
                                <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm rounded-[2.5rem] flex flex-col items-center justify-center gap-6">
                                    <div className="relative">
                                        <svg className="animate-spin w-16 h-16 text-brand-gold" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.15" />
                                            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <i className="bi bi-stars text-brand-gold text-2xl" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-black text-brand-dark uppercase tracking-widest mb-1">
                                            Gemini está creando tu ruta
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 animate-pulse">
                                            {LABEL.duracion[duracion!]} · {LABEL.compania[compania!]} · {LABEL.ritmo[ritmo!]}
                                        </p>
                                        {/* Mejora 9: mensaje de reintento en el overlay */}
                                        {mensajeEstado && (
                                            <p className="mt-2 text-[9px] font-black text-brand-blue uppercase tracking-widest animate-pulse">
                                                <i className="bi bi-arrow-repeat mr-1" />{mensajeEstado}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RutaInteligente;