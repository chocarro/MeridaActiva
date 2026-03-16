// src/componentes/OfflineBanner.tsx
// ─────────────────────────────────────────────────────────────────
// Banner deslizante que avisa al usuario cuando pierde la conexión.
// Se muestra sobre la Navbar con animación CSS.
// ─────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

const OfflineBanner: React.FC = () => {
    const { isOffline } = useOfflineStatus();
    const [visible, setVisible] = useState(false);
    const [backOnline, setBackOnline] = useState(false);

    useEffect(() => {
        if (isOffline) {
            setBackOnline(false);
            setVisible(true);
        } else if (visible) {
            // Breve mensaje "de nuevo en línea" antes de ocultar
            setBackOnline(true);
            const timer = setTimeout(() => setVisible(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isOffline]);

    if (!visible) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className={`fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-3 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${backOnline
                    ? 'bg-green-500 text-white'
                    : 'bg-amber-500 text-brand-dark'
                }`}
            style={{ animation: 'slideDown 0.35s ease' }}
        >
            {backOnline ? (
                <>
                    <i className="bi bi-wifi text-sm" />
                    Conexión restaurada — Todo sincronizado
                    <i className="bi bi-check2-circle" />
                </>
            ) : (
                <>
                    <i className="bi bi-wifi-off text-sm" />
                    Sin conexión · Modo offline activo — Tu agenda y favoritos siguen disponibles
                    <i className="bi bi-shield-check" />
                </>
            )}
        </div>
    );
};

export default OfflineBanner;
