import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  isScrolled?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', isScrolled = false }) => {
  const primaryColor = isScrolled ? '#FFBA08' : '#032B43';
  const secondaryColor = isScrolled ? '#FAFAFA' : '#3F88C5';

  return (
    <Link
      to="/"
      className={`group flex items-center gap-1.5 md:gap-2 transition-all duration-300 hover:opacity-90 ${className}`}
    >
      {/* Dynamic Icon: Roman Arches 'M' + Sun */}
      <div className="relative flex items-center justify-center w-6 h-6 md:w-8 md:h-8 transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-0.5">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          {/* Left Arch */}
          <path
            d="M 18 85 V 50 C 18 20, 50 25, 50 60"
            stroke={primaryColor}
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          />
          {/* Right Arch */}
          <path
            d="M 82 85 V 50 C 82 20, 50 25, 50 60"
            stroke={primaryColor}
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          />
          {/* Sun / Spark */}
          <circle
            cx="50"
            cy="18"
            r="11"
            fill={secondaryColor}
            className="transition-colors duration-300"
          />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline tracking-tighter">
          <span
            className="text-lg md:text-xl font-black uppercase transition-colors duration-300"
            style={{ color: primaryColor }}
          >
            Mérida
          </span>
          <span
            className="text-lg md:text-xl font-black uppercase italic transition-colors duration-300"
            style={{ color: secondaryColor }}
          >
            Activa
          </span>
        </div>
        <span 
          className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em] pl-0.5 opacity-80 mt-0.5 transition-colors duration-300 block"
          style={{ color: primaryColor }}
        >
          Turismo Inteligente
        </span>
      </div>
    </Link>
  );
};

export default Logo;
