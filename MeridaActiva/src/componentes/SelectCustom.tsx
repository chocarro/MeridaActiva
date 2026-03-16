// src/componentes/SelectCustom.tsx
// ─────────────────────────────────────────────────────────────────
// Dropdown personalizado que sustituye al <select> nativo del SO.
// Totalmente estilizado con el design system de la app.
// ─────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectCustomProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  /** Icono Bootstrap opcional delante del label (ej: 'bi-sort-down') */
  icon?: string;
}

const SelectCustom: React.FC<SelectCustomProps> = ({
  value,
  onChange,
  options,
  className = '',
  icon = 'bi-funnel',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cierra al presionar Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`
          flex items-center gap-2 px-5 py-2.5 rounded-2xl
          bg-brand-bg border-2 transition-all duration-200
          font-black text-[10px] uppercase tracking-widest
          hover:border-brand-dark hover:bg-white
          focus:outline-none focus:ring-2 focus:ring-brand-blue/20
          ${open
            ? 'border-brand-dark bg-white shadow-md'
            : 'border-transparent text-slate-500'
          }
        `}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {icon && <i className={`bi ${icon} text-brand-gold`} />}
        <span className="text-brand-dark">{selected?.label ?? 'Seleccionar'}</span>
        <i
          className={`bi bi-chevron-down text-brand-dark/50 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="
            absolute right-0 top-[calc(100%+8px)] z-50
            min-w-[200px] w-max
            bg-white border border-slate-100
            rounded-[1.5rem] shadow-2xl shadow-brand-dark/10
            overflow-hidden
            animate-fade-in-up
          "
          role="listbox"
        >
          {/* Cabecera del panel */}
          <div className="px-5 py-3 border-b border-slate-50">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
              Ordenar por
            </p>
          </div>

          {/* Opciones */}
          <div className="p-2">
            {options.map(opt => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    font-black text-[10px] uppercase tracking-widest text-left
                    transition-all duration-150
                    ${isSelected
                      ? 'bg-brand-dark text-brand-gold'
                      : 'text-slate-600 hover:bg-brand-bg hover:text-brand-dark'
                    }
                  `}
                >
                  {/* Check si está seleccionada */}
                  <span className="w-4 flex-shrink-0">
                    {isSelected && <i className="bi bi-check2 text-brand-gold text-sm" />}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectCustom;
