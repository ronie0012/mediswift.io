import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, className = '' }) => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Loader2 className={`animate-spin ${className}`} size={size} />
    </div>
  );
};

export default LoadingSpinner; 