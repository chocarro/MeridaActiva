import React, { useEffect, useRef, useState } from 'react';

interface FluidGlassProps {
    /** Content to render inside the glass effect */
    children?: React.ReactNode;
    className?: string;
    /** Blur amount in px (default 18) */
    blur?: number;
    /** Glass tint opacity 0–1 (default 0.12) */
    tintOpacity?: number;
    /** Enable subtle ripple/liquid border animation (default true) */
    animated?: boolean;
    /** Border color (default rgba(255,255,255,0.35)) */
    borderColor?: string;
}

/**
 * FluidGlass — A CSS-based fluid glass morphism effect.
 * Inspired by the ReactBits FluidGlass component.
 * Creates a glossy, liquid-border glass panel that reacts to cursor position.
 */
const FluidGlass: React.FC<FluidGlassProps> = ({
    children,
    className = '',
    blur = 18,
    tintOpacity = 0.12,
    animated = true,
    borderColor = 'rgba(255,255,255,0.35)',
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || !animated) return;

        const handleMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            setMouse({
                x: (e.clientX - rect.left) / rect.width,
                y: (e.clientY - rect.top) / rect.height,
            });
        };

        el.addEventListener('mousemove', handleMove);
        el.addEventListener('mouseenter', () => setHovered(true));
        el.addEventListener('mouseleave', () => { setHovered(false); setMouse({ x: 0.5, y: 0.5 }); });

        return () => {
            el.removeEventListener('mousemove', handleMove);
        };
    }, [animated]);

    // Compute dynamic highlight position based on cursor
    const highlightX = mouse.x * 100;
    const highlightY = mouse.y * 100;

    return (
        <div
            ref={ref}
            className={`relative overflow-hidden rounded-[2.5rem] ${className}`}
            style={{
                backdropFilter: `blur(${blur}px) saturate(180%)`,
                WebkitBackdropFilter: `blur(${blur}px) saturate(180%)`,
                background: `rgba(255, 255, 255, ${tintOpacity})`,
                border: `1.5px solid ${borderColor}`,
                boxShadow: hovered
                    ? '0 8px 40px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.5)'
                    : '0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)',
                transition: 'box-shadow 0.4s ease',
            }}
        >
            {/* Liquid highlight that follows cursor */}
            {animated && (
                <div
                    className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                    style={{
                        opacity: hovered ? 1 : 0,
                        background: `radial-gradient(circle at ${highlightX}% ${highlightY}%, rgba(255,255,255,0.28) 0%, transparent 60%)`,
                        transition: 'opacity 0.3s ease',
                    }}
                />
            )}

            {/* Static top sheen */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-t-[2.5rem]"
                style={{
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)',
                }}
            />

            {/* Animated SVG liquid border glow */}
            {animated && (
                <svg
                    className="pointer-events-none absolute inset-0 w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ opacity: 0.6 }}
                >
                    <defs>
                        <filter id="fluid-blur">
                            <feTurbulence
                                type="fractalNoise"
                                baseFrequency="0.015"
                                numOctaves="3"
                                seed="2"
                                result="noise"
                            >
                                {animated && (
                                    <animate
                                        attributeName="baseFrequency"
                                        values="0.012;0.018;0.012"
                                        dur="6s"
                                        repeatCount="indefinite"
                                    />
                                )}
                            </feTurbulence>
                            <feDisplacementMap
                                in="SourceGraphic"
                                in2="noise"
                                scale="6"
                                xChannelSelector="R"
                                yChannelSelector="G"
                            />
                        </filter>
                    </defs>
                    <rect
                        x="1"
                        y="1"
                        width="calc(100% - 2px)"
                        height="calc(100% - 2px)"
                        rx="38"
                        fill="none"
                        stroke="rgba(255,255,255,0.45)"
                        strokeWidth="1.5"
                        filter="url(#fluid-blur)"
                    />
                </svg>
            )}

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
};

export default FluidGlass;
