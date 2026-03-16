import React, { useEffect, useRef, useState, type ReactNode } from 'react';

interface AnimatedListProps {
    children: ReactNode[];
    className?: string;
    delay?: number;
}

/**
 * AnimatedList — ReactBits style
 * Items slide in from the bottom staggered, triggered once when the container enters the viewport.
 */
const AnimatedList: React.FC<AnimatedListProps> = ({
    children,
    className = '',
    delay = 80,
}) => {
    const [visibleCount, setVisibleCount] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const el = listRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const total = React.Children.count(children);
                    let count = 0;
                    const timer = setInterval(() => {
                        count++;
                        setVisibleCount(count);
                        if (count >= total) clearInterval(timer);
                    }, delay);
                }
            },
            { threshold: 0.05 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [children, delay]);

    return (
        <div ref={listRef} className={className}>
            {React.Children.map(children, (child, index) => (
                <div
                    key={index}
                    style={{
                        transition: `opacity 450ms ease, transform 450ms cubic-bezier(0.22,1,0.36,1)`,
                        transitionDelay: `${index * 40}ms`,
                        opacity: index < visibleCount ? 1 : 0,
                        transform: index < visibleCount ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)',
                    }}
                >
                    {child}
                </div>
            ))}
        </div>
    );
};

export default AnimatedList;
