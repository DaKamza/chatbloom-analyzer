
import React from 'react';
import { cn } from '@/lib/utils';

interface AnalysisCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ 
  title, 
  children, 
  className,
  gradient = false
}) => {
  return (
    <div 
      className={cn(
        "p-6 rounded-xl transition-all duration-300 transform hover:scale-[1.01] animate-scale-in glass-effect",
        gradient && "bg-gradient-to-br from-white/80 to-white/60",
        className
      )}
    >
      <h3 className="text-lg font-medium mb-4 text-apple-black">{title}</h3>
      <div>{children}</div>
    </div>
  );
};

export default AnalysisCard;
