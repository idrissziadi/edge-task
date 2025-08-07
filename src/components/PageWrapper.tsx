import React, { useEffect, useState } from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  animationType?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeInScale' | 'slideInTop' | 'bounceIn';
  delay?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ 
  children, 
  className = '', 
  animationType = 'fadeInUp',
  delay = 0,
  staggerChildren = false,
  staggerDelay = 150 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [visibleChildren, setVisibleChildren] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      
      if (staggerChildren && React.isValidElement(children)) {
        const childrenArray = React.Children.toArray(children);
        childrenArray.forEach((_, index) => {
          setTimeout(() => {
            setVisibleChildren(prev => new Set([...prev, index]));
          }, index * staggerDelay);
        });
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, staggerChildren, staggerDelay, children]);

  const getAnimationClass = () => {
    switch (animationType) {
      case 'fadeInUp': return 'animate-fade-in-up';
      case 'fadeInLeft': return 'animate-fade-in-left';
      case 'fadeInRight': return 'animate-fade-in-right';
      case 'fadeInScale': return 'animate-fade-in-scale';
      case 'slideInTop': return 'animate-slide-in-top';
      case 'bounceIn': return 'animate-bounce-in';
      default: return 'animate-fade-in-up';
    }
  };

  return (
    <div 
      className={`${className} transition-all duration-600 ${
        isVisible 
          ? `opacity-100 ${getAnimationClass()}` 
          : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  );
};