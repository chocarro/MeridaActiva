import React, { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollFloatProps {
    children: ReactNode;
    containerClassName?: string;
    textClassName?: string;
    animationDuration?: number;
    ease?: string;
    scrollStart?: string;
    scrollEnd?: string;
    stagger?: number;
}

const ScrollFloat: React.FC<ScrollFloatProps> = ({
    children,
    containerClassName = '',
    textClassName = '',
    animationDuration = 0.6,
    ease = 'power2.out',
    scrollStart = 'top 85%',
    scrollEnd = 'top 40%',
    stagger = 0.02,
}) => {
    const containerRef = useRef<HTMLHeadingElement>(null);

    const splitText = useMemo(() => {
        const text = typeof children === 'string' ? children : '';
        return text.split('').map((char, index) => (
            <span
                className="inline-block split-char"
                key={index}
            >
                {char === ' ' ? '\u00A0' : char}
            </span>
        ));
    }, [children]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const charElements = el.querySelectorAll('.split-char');

        const anim = gsap.fromTo(
            charElements,
            {
                opacity: 0,
                y: 30,
            },
            {
                duration: animationDuration,
                ease,
                opacity: 1,
                y: 0,
                stagger,
                scrollTrigger: {
                    trigger: el,
                    start: scrollStart,
                    end: scrollEnd,
                    toggleActions: 'play none none none',
                },
            }
        );

        return () => {
            anim.scrollTrigger?.kill();
            anim.kill();
        };
    }, [animationDuration, ease, scrollStart, scrollEnd, stagger]);

    return (
        <h2 ref={containerRef} className={`overflow-visible pb-2 ${containerClassName}`}>
            <span className={`inline-block ${textClassName}`}>{splitText}</span>
        </h2>
    );
};

export default ScrollFloat;
