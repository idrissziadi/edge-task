import React, { useEffect, useState } from 'react';

interface StaggeredContainerProps {
  children: React.ReactElement[];
  delay?: number;
  staggerDelay?: number;
  className?: string;
}

export const StaggeredContainer: React.FC<StaggeredContainerProps> = ({
  children,
  delay = 100,
  staggerDelay = 150,
  className = ''
}) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      children.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems(prev => new Set([...prev, index]));
        }, index * staggerDelay);
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [children.length, delay, staggerDelay]);

  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`transition-all duration-600 ${
            visibleItems.has(index)
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          {child}
        </div>
      ))}
    </div>
  );
};