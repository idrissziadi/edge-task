import React, { useEffect, useRef, useState } from 'react';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeInUp' | 'slideInLeft' | 'slideInRight' | 'scaleUp' | 'bounceIn' | 'slideInTop' | 'rotateIn';
  delay?: number;
  duration?: number;
  threshold?: number;
  stagger?: boolean;
  staggerDelay?: number;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  animation = 'fadeInUp',
  delay = 0,
  duration = 600,
  threshold = 0.1,
  stagger = false,
  staggerDelay = 150
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [visibleChildren, setVisibleChildren] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
            
            if (stagger) {
              const childrenArray = React.Children.toArray(children);
              childrenArray.forEach((_, index) => {
                setTimeout(() => {
                  setVisibleChildren(prev => new Set([...prev, index]));
                }, index * staggerDelay);
              });
            }
          }, delay);
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [delay, threshold, stagger, staggerDelay, children]);

  const getAnimationClass = () => {
    const baseClass = `transition-all duration-${duration} ease-out`;
    
    if (!isVisible) {
      switch (animation) {
        case 'fadeInUp': return `${baseClass} opacity-0 translate-y-12`;
        case 'slideInLeft': return `${baseClass} opacity-0 -translate-x-12`;
        case 'slideInRight': return `${baseClass} opacity-0 translate-x-12`;
        case 'slideInTop': return `${baseClass} opacity-0 -translate-y-12`;
        case 'scaleUp': return `${baseClass} opacity-0 scale-90`;
        case 'bounceIn': return `${baseClass} opacity-0 scale-75`;
        case 'rotateIn': return `${baseClass} opacity-0 rotate-12 scale-90`;
        default: return `${baseClass} opacity-0 translate-y-12`;
      }
    }
    
    return `${baseClass} opacity-100 translate-x-0 translate-y-0 scale-100 rotate-0`;
  };

  if (stagger) {
    return (
      <div ref={sectionRef} className={`${className} ${getAnimationClass()}`}>
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className={`transition-all duration-${duration} ease-out ${
              visibleChildren.has(index)
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{
              transitionDelay: `${index * staggerDelay}ms`
            }}
          >
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={sectionRef} className={`${className} ${getAnimationClass()}`}>
      {children}
    </div>
  );
};