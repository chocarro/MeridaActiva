import { useState, useEffect, useRef, type ReactNode } from 'react';

interface GradientTextProps {
    children: ReactNode;
    className?: string;
    colors?: string[];
    animationSpeed?: number;
}

export default function GradientText({
    children,
    className = '',
    colors = ['#FFBA08', '#ffffff', '#3F88C5', '#136F63', '#FFBA08'],
    animationSpeed = 6,
}: GradientTextProps) {
    const [position, setPosition] = useState(0);
    const rafRef = useRef<number>(0);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        const duration = animationSpeed * 1000;

        const animate = (time: number) => {
            if (!startTimeRef.current) startTimeRef.current = time;
            const elapsed = time - startTimeRef.current;
            const p = (elapsed % duration) / duration;
            setPosition(p * 100);
            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [animationSpeed]);

    const gradientColors = [...colors].join(', ');

    const gradientStyle: React.CSSProperties = {
        backgroundImage: `linear-gradient(to right, ${gradientColors})`,
        backgroundSize: '300% 100%',
        backgroundPosition: `${position}% 50%`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    };

    return (
        <span className={`inline-block ${className}`} style={gradientStyle}>
            {children}
        </span>
    );
}
