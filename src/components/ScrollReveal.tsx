import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
}

const shouldRevealImmediately = (): boolean => {
  if (typeof window === 'undefined') return true;

  return !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(shouldRevealImmediately);

  useEffect(() => {
    const element = elementRef.current;

    if (!element || shouldRevealImmediately()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={['scroll-reveal', `scroll-reveal--${direction}`, isVisible ? 'is-visible' : '', className]
        .filter(Boolean)
        .join(' ')}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
