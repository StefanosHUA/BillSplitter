import React from 'react';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Card = ({ children, onClick, className = "" }: CardProps) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-3xl border border-gray-100 shadow-sm transition-all ${onClick ? 'cursor-pointer hover:shadow-xl hover:border-parea-primary/40' : ''} ${className}`}
  >
    {children}
  </div>
);