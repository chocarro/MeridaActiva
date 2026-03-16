// src/utils/geminiService.ts
// ─────────────────────────────────────────────────────────────────
// Cliente del frontend que llama a NUESTRAS Serverless Functions.
// La API key de OpenRouter NUNCA llega al navegador — vive en /api/.
// ─────────────────────────────────────────────────────────────────

// ── Tipo del mensaje de chat ──────────────────────────────────────
export interface MensajeChat {
    rol: 'usuario' | 'ia';
    texto: string;
    ts: number;
}

// ── Tipo de parada de ruta ────────────────────────────────────────
export interface ParadaRuta {
    nombre: string;
    hora: string;
    duracion_min: number;
    descripcion: string;
    categoria: string;
    lat?: number;
    lng?: number;
}

// ── Clase del servicio ────────────────────────────────────────────
class IAService {
    /**
     * Chat: envía el mensaje y el historial a nuestra serverless function /api/chat.
     * El backend es el que llama a OpenRouter con la API key protegida.
     */
    async enviarMensaje(mensajeActual: string, historial: MensajeChat[]): Promise<string> {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: mensajeActual, historial }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error ?? `Error ${response.status} al contactar con el servidor.`);
        }

        if (!data.respuesta) {
            throw new Error('El servidor devolvió una respuesta vacía.');
        }

        return data.respuesta as string;
    }

    /**
     * Chat Streaming: envía el mensaje y recibe la respuesta letra a letra (SSE).
     * @param mensajeActual El texto del usuario
     * @param historial Array con el historial previo
     * @param onChunk Callback que se ejecuta cada vez que llega un fragmento nuevo
     * @returns La promesa se resuelve cuando el stream termina por completo
     */
    async enviarMensajeStream(
        mensajeActual: string,
        historial: MensajeChat[],
        onChunk: (texto: string) => void
    ): Promise<void> {
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
            } catch (e) {
                // Si la respuesta no es JSON, conservamos el mensaje genérico
            }
            throw new Error(errorMsg);
        }

        if (!response.body) {
            throw new Error('El servidor no devolvió un stream de datos (response.body es null).');
        }

        // 1. Obtenemos el lector del stream
        const reader = response.body.getReader();
        // 2. Usamos un decodificador de texto integrado en el navegador para parsear chunks binarios UInt8Array a string
        const decoder = new TextDecoder('utf-8');
        let done = false;

        // 3. Leemos el stream en un bucle continuo hasta que el servidor cierre la conexión
        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;

            if (value) {
                // Decodificamos el bloque a texto
                const chunk = decoder.decode(value, { stream: true });
                // El servidor envía datos en formato SSE: "data: {...}\n\n"
                const lines = chunk.split('\n');

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('data: ')) {
                        const dataStr = trimmedLine.slice(6); // quitamos "data: "

                        if (dataStr === '[DONE]') {
                            // Hemos llegado al final del stream de OpenRouter
                            return;
                        }

                        try {
                            // Parseamos el JSON que mandó el servidor con el fragmento de texto
                            const parsed = JSON.parse(dataStr);
                            if (parsed.text) {
                                // Ejecutamos el callback pasándole la nueva palabra o letra a la UI
                                onChunk(parsed.text);
                            } else if (parsed.error) {
                                throw new Error(parsed.error);
                            }
                        } catch (e) {
                            // Ignoramos silenciosamente errores de parseo de chunks divididos por la red
                        }
                    }
                }
            }
        }
    }

    /**
     * Rutas: envía los parámetros a nuestra serverless function /api/generar-ruta.
     * El backend genera el itinerario con OpenRouter y lo devuelve como array.
     */
    async generarRuta(params: {
        duracion: string;
        compania: string;
        ritmo: string;
    }): Promise<ParadaRuta[]> {
        const response = await fetch('/api/generar-ruta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });

        // Parsear de forma segura: si el body no es JSON válido, no explotar
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error((data as any).error ?? `Error ${response.status} al contactar con el servidor.`);
        }

        if (!Array.isArray((data as any).paradas) || (data as any).paradas.length === 0) {
            throw new Error('El servidor devolvió un itinerario vacío.');
        }

        return (data as any).paradas as ParadaRuta[];
    }
}

// ── Singleton ────────────────────────────────────────────────────
const _instancia = new IAService();

/**
 * Devuelve la instancia del servicio de IA.
 * Compatible con el código existente de FAQ.tsx y RutaInteligente.tsx
 * que ya llaman a getGeminiService().
 */
export function getGeminiService(): IAService {
    return _instancia;
}