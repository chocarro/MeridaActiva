import React, { type ReactNode, useEffect, useRef } from 'react';

export interface ScrollStackItemProps {
    children: ReactNode;
    className?: string;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, className = '' }) => (
    <div className={`scroll-stack-card w-full ${className}`}>
        {children}
    </div>
);

interface ScrollStackProps {
    children: ReactNode;
    className?: string;
    itemDistance?: number;
    itemScale?: number;
    itemStackDistance?: number;
    stackTopPercent?: number;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
    children,
    className = '',
    itemDistance = 200,
    itemScale = 0.04,
    itemStackDistance = 12,
    stackTopPercent = 12,
}) => {
    // To fix the glitch, instead of using `transform: translateY` on the element we're querying `getBoundingClientRect().top` from,
    // we query a steady wrapper and apply the transform to an inner wrapper.
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const cards = Array.from(containerRef.current.querySelectorAll('.scroll-stack-wrapper')) as HTMLElement[];
        if (!cards.length) return;

        cards.forEach((card) => {
            card.style.marginBottom = `${itemDistance}px`;
        });

        const update = () => {
            const winH = window.innerHeight;
            const stackTop = (stackTopPercent / 100) * winH;
            
            // Marker to detect when the entire stack has been scrolled past
            const endEl = containerRef.current?.querySelector('.scroll-stack-end');
            const endPast = endEl ? stackTop - endEl.getBoundingClientRect().top : 0;

            cards.forEach((cardWrapper, i) => {
                const rect = cardWrapper.getBoundingClientRect();
                let past = stackTop - rect.top;
                let opacity = 1;

                const inner = cardWrapper.firstElementChild as HTMLElement;
                if (!inner) return;

                // If the end marker has passed the sticky top point, we start scrolling up and fading out
                if (endPast > 0) {
                    opacity = Math.max(0, 1 - (endPast / 400));
                    // Freezing the 'past' value makes the wrapper stop translating Y, so it scrolls naturally with the page
                    if (past > 0) past -= endPast;
                }

                if (past > 0) {
                    const translateY = past + i * itemStackDistance;
                    const depth = Math.max(0, cards.length - 1 - i);
                    const scale = 1 - depth * itemScale;
                    inner.style.transform = `translateY(${translateY}px) scale(${scale})`;
                } else {
                    inner.style.transform = `translateY(0px) scale(1)`;
                }
                
                inner.style.opacity = String(opacity);
                cardWrapper.style.zIndex = String(i + 1);
            });
        };

        const onScroll = () => requestAnimationFrame(update);
        window.addEventListener('scroll', onScroll, { passive: true });
        update();

        return () => window.removeEventListener('scroll', onScroll);
    }, [itemDistance, itemScale, itemStackDistance, stackTopPercent]);

    const childArray = React.Children.toArray(children);

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            {childArray.map((child, i) => (
                // Steady wrapper that doesn't transform, so its getBoundingClientRect() is stable
                <div key={i} className="scroll-stack-wrapper relative w-full origin-top will-change-transform">
                    {/* Inner element that applies the visual transform */}
                    <div className="w-full rounded-[2.5rem] shadow-lg origin-top" style={{ backfaceVisibility: 'hidden', willChange: 'transform' }}>
                        {React.isValidElement(child) ? (child as any).props.children : child}
                    </div>
                </div>
            ))}
            <div className="scroll-stack-end h-px w-full" />
        </div>
    );
};

export default ScrollStack;
