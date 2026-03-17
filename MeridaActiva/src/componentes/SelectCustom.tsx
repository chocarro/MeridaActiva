// src/componentes/SelectCustom.tsx
// ─────────────────────────────────────────────────────────────────
// CAMBIOS (Mejora 5 — Navegación por teclado):
//   - Estado `focusedIdx` para rastrear la opción enfocada
//   - ArrowDown/ArrowUp mueven entre opciones con wrap circular
//   - Enter selecciona la opción enfocada
//   - Tab cierra el dropdown sin seleccionar
//   - aria-activedescendant actualizado dinámicamente
//   - ID único por opción: `option-{value}`
//   - Las opciones enfocadas muestran ring visual distinto al seleccionado
//   - tabIndex={-1} en cada opción para no interferir con el Tab del SO
// ─────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect, useCallback } from 'react';

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
  /** ID base para accesibilidad (por defecto se genera uno) */
  id?: string;
}

let _idCounter = 0;

const SelectCustom: React.FC<SelectCustomProps> = ({
  value,
  onChange,
  options,
  className = '',
  icon = 'bi-funnel',
  id,
}) => {
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Stable unique ID for aria associations
  const uid = useRef(id ?? `select-${++_idCounter}`).current;
  const listboxId = `${uid}-listbox`;

  const selected = options.find(o => o.value === value);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setFocusedIdx(-1);
  }, []);

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [closeDropdown]);

  // Gestión de teclado en el trigger
  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setFocusedIdx(0);
        } else {
          setFocusedIdx(i => (i + 1) % options.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setFocusedIdx(options.length - 1);
        } else {
          setFocusedIdx(i => (i - 1 + options.length) % options.length);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (open && focusedIdx >= 0) {
          onChange(options[focusedIdx].value);
          closeDropdown();
        } else {
          setOpen(o => !o);
          if (!open) setFocusedIdx(0);
        }
        break;
      case 'Escape':
        closeDropdown();
        break;
      case 'Tab':
        // Tab cierra el dropdown (comportamiento esperado)
        closeDropdown();
        break;
      default:
        break;
    }
  };

  const activedescendant =
    open && focusedIdx >= 0 ? `${uid}-option-${options[focusedIdx].value}` : undefined;

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        ref={buttonRef}
        id={uid}
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) setFocusedIdx(0);
          else setFocusedIdx(-1);
        }}
        onKeyDown={handleTriggerKeyDown}
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
        aria-controls={listboxId}
        aria-activedescendant={activedescendant}
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
          id={listboxId}
          className="
            absolute right-0 top-[calc(100%+8px)] z-50
            min-w-[200px] w-max
            bg-white border border-slate-100
            rounded-[1.5rem] shadow-2xl shadow-brand-dark/10
            overflow-hidden
            animate-fade-in-up
          "
          role="listbox"
          aria-labelledby={uid}
          tabIndex={-1}
        >
          {/* Cabecera del panel */}
          <div className="px-5 py-3 border-b border-slate-50">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
              Ordenar por
            </p>
          </div>

          {/* Opciones */}
          <div className="p-2">
            {options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isFocused  = idx === focusedIdx;
              return (
                <button
                  key={opt.value}
                  id={`${uid}-option-${opt.value}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onClick={() => { onChange(opt.value); closeDropdown(); buttonRef.current?.focus(); }}
                  onMouseEnter={() => setFocusedIdx(idx)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    font-black text-[10px] uppercase tracking-widest text-left
                    transition-all duration-150
                    ${isSelected
                      ? 'bg-brand-dark text-brand-gold'
                      : isFocused
                        ? 'bg-brand-bg text-brand-dark ring-2 ring-brand-blue/30'
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
