export interface MensajeChat {
    rol: 'usuario' | 'ia';
    texto: string;
    ts: number;
}

export interface ParadaRuta {
    nombre: string;
    hora: string;
    duracion_min: number;
    descripcion: string;
    categoria: string;
    lat?: number;
    lng?: number;
}

// ── Utilidades privadas ───────────────────────────────────────────

/** Pausa asíncrona en milisegundos */
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/** Detecta si el error merece reintento (saturación del modelo) */
function esErrorReintentar(mensaje: string): boolean {
    const msg = mensaje.toLowerCase();
    return (
        msg.includes('502') ||
        msg.includes('503') ||
        msg.includes('saturad') ||
        msg.includes('occupied') ||
        msg.includes('overload') ||
        msg.includes('too many requests') ||
        msg.includes('rate limit')
    );
}

/** Backoff en ms según el intento (1 → 1000, 2 → 2000) */
const BACKOFF_MS = [1000, 2000];

/** Detecta si el browser soporta ReadableStream desde fetch */
function soportaStreaming(): boolean {
    try {
        return (
            typeof ReadableStream !== 'undefined' &&
            typeof Response !== 'undefined' &&
            'body' in Response.prototype
        );
    } catch {
        return false;
    }
}

// ── Servicio de IA ────────────────────────────────────────────────
class IAService {
    /**
     * Chat: envía el mensaje y recibe la respuesta.
     * En browsers que soportan ReadableStream usa SSE streaming.
     * En móviles/browsers que no lo soporten usa modo JSON normal (fallback).
     * Reintenta automáticamente hasta 2 veces si la IA está saturada.
     */
    async enviarMensajeStream(
        mensajeActual: string,
        historial: MensajeChat[],
        onChunk: (texto: string) => void,
        onRetry?: (intento: number) => void
    ): Promise<void> {
        let ultimoError: Error = new Error('Error desconocido');

        for (let intento = 0; intento <= 2; intento++) {
            if (intento > 0) {
                onRetry?.(intento);
                await sleep(BACKOFF_MS[intento - 1]);
            }

            try {
                const usarStream = soportaStreaming();

                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mensaje: mensajeActual,
                        historial,
                        stream: usarStream,
                    }),
                });

                if (!response.ok) {
                    let errorMsg = `Error ${response.status} al contactar con el servidor.`;
                    try {
                        const data = await response.json();
                        if (data.error) errorMsg = data.error;
                    } catch { /* respuesta no es JSON */ }
                    const err = new Error(errorMsg);
                    if (esErrorReintentar(errorMsg) && intento < 2) {
                        ultimoError = err;
                        continue;
                    }
                    throw err;
                }

                // ── Modo NO-streaming (fallback móvil) ─────────────────
                if (!usarStream || !response.body) {
                    const data = await response.json();
                    if (data.error) throw new Error(data.error);
                    if (data.text) onChunk(data.text);
                    return;
                }

                // ── Modo streaming (desktop / browsers modernos) ────────
                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let done = false;

                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;

                    if (value) {
                        const chunk = decoder.decode(value, { stream: true });
                        for (const line of chunk.split('\n')) {
                            const trimmed = line.trim();
                            if (!trimmed.startsWith('data: ')) continue;
                            const dataStr = trimmed.slice(6);
                            if (dataStr === '[DONE]') return;
                            try {
                                const parsed = JSON.parse(dataStr);
                                if (parsed.text)  onChunk(parsed.text);
                                else if (parsed.error) throw new Error(parsed.error);
                            } catch { /* chunk dividido por la red, se ignora */ }
                        }
                    }
                }
                return;
            } catch (err) {
                ultimoError = err instanceof Error ? err : new Error(String(err));
                if (!esErrorReintentar(ultimoError.message) || intento >= 2) {
                    throw ultimoError;
                }
            }
        }

        throw ultimoError;
    }

    /**
     * Rutas: envía los parámetros a /api/generar-ruta y devuelve el array de paradas.
     * Reintenta automáticamente hasta 2 veces si la IA está saturada.
     *
     * @param params   Parámetros del itinerario
     * @param onRetry  Callback opcional invocado antes de cada reintento
     */
    async generarRuta(
        params: { duracion: string; compania: string; ritmo: string },
        onRetry?: (intento: number) => void
    ): Promise<ParadaRuta[]> {
        let ultimoError: Error = new Error('Error desconocido');

        for (let intento = 0; intento <= 2; intento++) {
            if (intento > 0) {
                onRetry?.(intento);
                await sleep(BACKOFF_MS[intento - 1]);
            }

            try {
                const response = await fetch('/api/generar-ruta', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(params),
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    const errorMsg = (data as { error?: string }).error
                        ?? `Error ${response.status} al contactar con el servidor.`;
                    const err = new Error(errorMsg);
                    if (esErrorReintentar(errorMsg) && intento < 2) {
                        ultimoError = err;
                        continue;
                    }
                    throw err;
                }

                if (!Array.isArray((data as { paradas?: ParadaRuta[] }).paradas) ||
                    (data as { paradas: ParadaRuta[] }).paradas.length === 0) {
                    throw new Error('El servidor devolvió un itinerario vacío.');
                }

                return (data as { paradas: ParadaRuta[] }).paradas;
            } catch (err) {
                ultimoError = err instanceof Error ? err : new Error(String(err));
                if (!esErrorReintentar(ultimoError.message) || intento >= 2) {
                    throw ultimoError;
                }
            }
        }

        throw ultimoError;
    }
}

const _instancia = new IAService();

export function getGeminiService(): IAService {
    return _instancia;
}