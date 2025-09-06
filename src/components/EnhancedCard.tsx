import React from 'react';
import { motion, MotionProps } from 'framer-motion';

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  clickable?: boolean;
  gradient?: boolean;
  glow?: boolean;
  animation?: 'fade' | 'slide' | 'scale' | 'none';
  delay?: number;
  onClick?: () => void;
}

const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  className = '',
  hover = true,
  clickable = false,
  gradient = false,
  glow = false,
  animation = 'fade',
  delay = 0,
  onClick
}) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700';
  const gradientClasses = gradient ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-700' : '';
  const glowClasses = glow ? 'shadow-yellow-500/25 dark:shadow-yellow-400/25' : '';
  const clickableClasses = clickable ? 'cursor-pointer' : '';

  const getAnimationProps = (): MotionProps => {
    const baseAnimation = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5, delay }
    };

    switch (animation) {
      case 'fade':
        return baseAnimation;
      case 'slide':
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay }
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.5, delay }
        };
      default:
        return baseAnimation;
    }
  };

  const hoverProps = hover ? {
    whileHover: { 
      scale: 1.02,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    whileTap: { scale: 0.98 }
  } : {};

  return (
    <motion.div
      className={`${baseClasses} ${gradientClasses} ${glowClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      {...getAnimationProps()}
      {...hoverProps}
    >
      {children}
    </motion.div>
  );
};

export default EnhancedCard;
