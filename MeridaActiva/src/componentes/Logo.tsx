import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  isScrolled?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', isScrolled = false }) => {
  // ── Colores según estado del navbar ─────────────────────────────
  const textPrimary    = isScrolled ? '#FAFAFA'  : '#032B43';
  const textAccent     = isScrolled ? '#FFBA08'  : '#3F88C5';
  const subColor       = isScrolled ? 'rgba(255,255,255,0.45)' : 'rgba(3,43,67,0.45)';
  const colBlue        = isScrolled ? '#3F88C5'  : '#3F88C5';
  const colCenter      = isScrolled ? '#FFBA08'  : '#032B43';
  const arcColor       = isScrolled ? '#FFBA08'  : '#032B43';

  return (
    <Link
      to="/"
      className={`group flex items-center gap-2 transition-all duration-300 hover:opacity-90 ${className}`}
    >
      {/* ── Icono: Teatro Romano ── */}
      <div className="relative flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-0.5">
        <svg
          width="44"
          height="36"
          viewBox="0 0 110 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Columna izquierda exterior — más baja */}
          <rect x="6"  y="58" width="10" height="30" rx="2" fill={colBlue} className="transition-colors duration-300" />
          {/* Columna izquierda interior */}
          <rect x="26" y="48" width="10" height="40" rx="2" fill={colBlue} className="transition-colors duration-300" />
          {/* Columna central — la más alta, acento */}
          <rect x="48" y="40" width="14" height="48" rx="2" fill={colCenter} className="transition-colors duration-300" />
          {/* Columna derecha interior */}
          <rect x="74" y="48" width="10" height="40" rx="2" fill={colBlue} className="transition-colors duration-300" />
          {/* Columna derecha exterior — más baja */}
          <rect x="94" y="58" width="10" height="30" rx="2" fill={colBlue} className="transition-colors duration-300" />
          {/* Arco superior — curva del teatro */}
          <path
            d="M5 60 Q55 8 105 60"
            stroke={arcColor}
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
            className="transition-colors duration-300"
          />
          {/* Base horizontal */}
          <rect x="4" y="86" width="102" height="4" rx="2" fill={colBlue} className="transition-colors duration-300" />
        </svg>
      </div>

      {/* ── Tipografía ── */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline tracking-tight">
          <span
            className="text-lg md:text-xl font-black uppercase transition-colors duration-300"
            style={{ color: textPrimary }}
          >
            Mérida
          </span>
          <span
            className="text-lg md:text-xl font-black uppercase italic transition-colors duration-300"
            style={{ color: textAccent }}
          >
            Activa
          </span>
        </div>
        <span
          className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.28em] pl-0.5 mt-0.5 block transition-colors duration-300"
          style={{ color: subColor }}
        >
          Turismo Inteligente
        </span>
      </div>
    </Link>
  );
};

export default Logo;