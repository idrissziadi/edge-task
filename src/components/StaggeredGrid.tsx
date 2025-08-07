import React, { useEffect, useRef, useState } from 'react';

interface StaggeredGridProps {
  children: React.ReactElement[];
  className?: string;
  itemClassName?: string;
  animation?: 'fadeInUp' | 'slideInLeft' | 'slideInRight' | 'scaleUp' | 'bounceIn' | 'rotateIn';
  staggerDelay?: number;
  duration?: number;
  threshold?: number;
  cols?: number;
}

export const StaggeredGrid: React.FC<StaggeredGridProps> = ({
  children,
  className = '',
  itemClassName = '',
  animation = 'fadeInUp',
  staggerDelay = 150,
  duration = 600,
  threshold = 0.1,
  cols = 3
}) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((_, index) => {
            setTimeout(() => {
              setVisibleItems(prev => new Set([...prev, index]));
            }, index * staggerDelay);
          });
        }
      },
      { threshold, rootMargin: '0px 0px -100px 0px' }
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => observer.disconnect();
  }, [children.length, staggerDelay, threshold]);

  const getAnimationClass = (index: number) => {
    const baseClass = `transition-all duration-${duration} ease-out`;
    const isVisible = visibleItems.has(index);
    
    if (!isVisible) {
      switch (animation) {
        case 'fadeInUp': return `${baseClass} opacity-0 translate-y-12`;
        case 'slideInLeft': return `${baseClass} opacity-0 -translate-x-12`;
        case 'slideInRight': return `${baseClass} opacity-0 translate-x-12`;
        case 'scaleUp': return `${baseClass} opacity-0 scale-90`;
        case 'bounceIn': return `${baseClass} opacity-0 scale-75`;
        case 'rotateIn': return `${baseClass} opacity-0 rotate-12 scale-90`;
        default: return `${baseClass} opacity-0 translate-y-12`;
      }
    }
    
    return `${baseClass} opacity-100 translate-x-0 translate-y-0 scale-100 rotate-0`;
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  return (
    <div ref={gridRef} className={`grid ${gridCols[cols as keyof typeof gridCols] || gridCols[3]} gap-6 ${className}`}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`${getAnimationClass(index)} ${itemClassName}`}
          style={{
            transitionDelay: `${index * staggerDelay}ms`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};