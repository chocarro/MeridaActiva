import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieBanner: React.FC = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) setVisible(true);
    }, []);

    const accept = () => {
        localStorage.setItem('cookie-consent', 'all');
        setVisible(false);
    };

    const necessary = () => {
        localStorage.setItem('cookie-consent', 'necessary');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 md:p-6">
            <div className="max-w-5xl mx-auto bg-brand-dark/95 backdrop-blur-xl text-white rounded-[2.5rem] px-8 py-6 md:px-10 shadow-2xl border border-white/10 flex flex-col md:flex-row items-center gap-6">

                {/* Icon + Text */}
                <div className="flex items-start gap-5 flex-1">
                    <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold text-xl shrink-0 mt-1">
                        <i className="bi bi-shield-check"></i>
                    </div>
                    <div>
                        <p className="font-black text-[10px] uppercase tracking-[0.2em] text-brand-gold mb-1">Cookies &amp; Privacidad</p>
                        <p className="text-white/60 text-xs font-medium leading-relaxed">
                            Usamos cookies para mejorar tu experiencia en MeridaActiva.{' '}
                            <Link to="/cookies" className="text-brand-blue hover:text-brand-gold transition-colors underline underline-offset-2">
                                Política de cookies
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={necessary}
                        className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white border border-white/10 hover:border-white/30 transition-all"
                    >
                        Solo necesarias
                    </button>
                    <button
                        onClick={accept}
                        className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-brand-gold text-brand-dark hover:bg-white transition-all shadow-lg shadow-brand-gold/20"
                    >
                        Aceptar todas
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
