import React, { ButtonHTMLAttributes } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { cn } from '../../lib/utils';

interface DynamicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost';
}

export default function DynamicButton({ 
  children, 
  className, 
  variant = 'solid', 
  style,
  type = 'button',
  ...props 
}: DynamicButtonProps) {
  const { currentTenant } = useTenant();
  const primaryColor = currentTenant?.primaryColor || '#3b82f6'; // Default blue fallback

  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  let variantStyles: React.CSSProperties = {};
  
  if (variant === 'solid') {
    variantStyles = {
      backgroundColor: primaryColor,
      color: '#ffffff',
      boxShadow: `0 4px 14px 0 ${primaryColor}40`,
    };
  } else if (variant === 'outline') {
    variantStyles = {
      backgroundColor: 'transparent',
      color: primaryColor,
      border: `2px solid ${primaryColor}`,
    };
  } else if (variant === 'ghost') {
    variantStyles = {
      backgroundColor: 'transparent',
      color: primaryColor,
    };
  }

  return (
    <button
      type={type}
      className={cn(baseStyles, "px-4 py-2.5 text-sm hover:opacity-90 active:scale-95", className)}
      style={{ ...variantStyles, ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
