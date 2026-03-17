// src/utils/geminiService.ts
// ─────────────────────────────────────────────────────────────────
// CAMBIOS (Mejora 9 — Reintentos con backoff exponencial):
//   - Helper privado `sleep(ms)` para esperas no bloqueantes
//   - Helper privado `esErrorReintentar(msg)` detecta 502/503/overload
//   - `enviarMensajeStream` acepta callback opcional `onRetry`
//     y reintenta hasta 2 veces con delays de 1s y 2s
//   - `generarRuta` acepta callback opcional `onRetry` ídem
// ─────────────────────────────────────────────────────────────────

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

// ── Servicio de IA ────────────────────────────────────────────────
class IAService {
    /**
     * Chat Streaming: envía el mensaje y recibe la respuesta letra a letra (SSE).
     * Reintenta automáticamente hasta 2 veces si la IA está saturada.
     *
     * @param mensajeActual  El texto del usuario
     * @param historial      Array con el historial previo
     * @param onChunk        Callback que se ejecuta cada vez que llega un fragmento
     * @param onRetry        Callback opcional que se invoca antes de cada reintento
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
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mensaje: mensajeActual, historial }),
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
                        continue; // reintenta
                    }
                    throw err;
                }

                if (!response.body) {
                    throw new Error('El servidor no devolvió un stream de datos (response.body es null).');
                }

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
                return; // éxito — salimos del bucle de reintentos
            } catch (err) {
                ultimoError = err instanceof Error ? err : new Error(String(err));
                if (!esErrorReintentar(ultimoError.message) || intento >= 2) {
                    throw ultimoError;
                }
                // continúa en el siguiente intento
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