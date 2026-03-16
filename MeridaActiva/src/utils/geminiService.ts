
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

class IAService {
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
            } catch {
                // Si la respuesta no es JSON, conservamos el mensaje genérico
            }
            throw new Error(errorMsg);
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
                const lines = chunk.split('\n');

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('data: ')) {
                        const dataStr = trimmedLine.slice(6);

                        if (dataStr === '[DONE]') {
                            return;
                        }

                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.text) {
                                onChunk(parsed.text);
                            } else if (parsed.error) {
                                throw new Error(parsed.error);
                            }
                        } catch {
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

const _instancia = new IAService();

export function getGeminiService(): IAService {
    return _instancia;
}