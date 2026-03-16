import React, { useEffect, useState } from 'react';

interface RotatingTextProps {
    texts: string[];
    className?: string;
    rotationInterval?: number;
}

const RotatingText: React.FC<RotatingTextProps> = ({
    texts,
    className = '',
    rotationInterval = 2200,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out
            setVisible(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % texts.length);
                setVisible(true);
            }, 350);
        }, rotationInterval);

        return () => clearInterval(interval);
    }, [texts.length, rotationInterval]);

    return (
        <span
            className={`inline-block transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
        >
            {texts[currentIndex]}
        </span>
    );
};

export default RotatingText;
