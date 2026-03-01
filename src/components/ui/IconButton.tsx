import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

export default function IconButton({
  icon: Icon,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  ariaLabel,
}: IconButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
    success: 'bg-green-100 text-green-600 hover:bg-green-200',
    danger: 'bg-red-100 text-red-600 hover:bg-red-200',
    warning: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
    secondary: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <motion.button
      onClick={onClick}
      className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-lg transition-colors cursor-pointer ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={ariaLabel}
    >
      <Icon className={iconSizeClasses[size]} />
    </motion.button>
  );
}
