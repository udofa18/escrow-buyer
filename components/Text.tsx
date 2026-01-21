import React from 'react';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  size?: 'large' | 'medium' | 'small';
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
  className?: string;
}

export default function Text({
  size = 'medium',
  as: Component = 'p',
  className = '',
  children,
  ...props
}: TextProps) {
  const sizeStyles = {
    large: 'text-[20px]',
    medium: 'text-[16px]',
    small: 'text-[14px]',
  };

  return (
    <Component
      className={`${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}