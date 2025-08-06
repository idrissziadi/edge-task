import React, { useEffect, useState } from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  animationType?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeInScale' | 'slideInTop' | 'bounceIn';
  delay?: number;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ 
  children, 
  className = '', 
  animationType = 'fadeInUp',
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

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