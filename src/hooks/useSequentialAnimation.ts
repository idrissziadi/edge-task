import { useEffect, useRef, useState } from 'react';

interface AnimationOptions {
  type?: 'fadeInUp' | 'slideInLeft' | 'slideInRight' | 'scaleUp' | 'bounceIn' | 'slideInTop' | 'rotateIn' | 'flipIn';
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

export const useSequentialAnimation = (options: AnimationOptions = {}) => {
  const {
    type = 'fadeInUp',
    delay = 0,
    staggerDelay = 150,
    duration = 600,
    threshold = 0.1,
    triggerOnce = true,
    rootMargin = '0px 0px -50px 0px'
  } = options;

  const [visibleElements, setVisibleElements] = useState<Set<number>>(new Set());
  const elementsRef = useRef<(HTMLElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = elementsRef.current.indexOf(entry.target as HTMLElement);
            if (index !== -1) {
              setTimeout(() => {
                setVisibleElements(prev => new Set([...prev, index]));
              }, delay + (index * staggerDelay));
            }
            
            if (triggerOnce) {
              observerRef.current?.unobserve(entry.target);
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    // Observe all elements
    elementsRef.current.forEach(element => {
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [delay, staggerDelay, threshold, triggerOnce, rootMargin]);

  const registerElement = (index: number) => (element: HTMLElement | null) => {
    elementsRef.current[index] = element;
  };

  const getAnimationProps = (index: number) => ({
    ref: registerElement(index),
    className: `transition-all duration-${duration} ${
      visibleElements.has(index)
        ? `opacity-100 ${getTransformClass(type, true)}`
        : `opacity-0 ${getTransformClass(type, false)}`
    }`,
    style: {
      transitionDuration: `${duration}ms`,
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  });

  return { getAnimationProps, visibleElements };
};

const getTransformClass = (type: string, visible: boolean) => {
  if (visible) return 'translate-x-0 translate-y-0 scale-100 rotate-0';
  
  switch (type) {
    case 'fadeInUp': return 'translate-y-8';
    case 'slideInLeft': return '-translate-x-8';
    case 'slideInRight': return 'translate-x-8';
    case 'slideInTop': return '-translate-y-8';
    case 'scaleUp': return 'scale-95';
    case 'bounceIn': return 'scale-90';
    case 'rotateIn': return 'rotate-12 scale-95';
    case 'flipIn': return 'rotateY-90';
    default: return 'translate-y-8';
  }
};