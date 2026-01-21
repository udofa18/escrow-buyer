import React from 'react';
import Text from './Text';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
  error,
  label,
  helperText,
  className = '',
  id,
  name,
  value,
  onChange,
  ...props
}: InputProps) {
  const baseStyles = 'w-full h-[56px] px-4 py-2 bg-gray-100 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#5D0C97] transition-all duration-200';
  
  const errorStyles = error 
    ? 'border border-red-500 focus:ring-red-500' 
    : 'border border-gray-300';

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <Text size='medium' as='p' className="block font-medium mb-2">
          {label}
        </Text>
      )}
      <input
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        className={`${baseStyles} ${errorStyles} ${className}`}
        {...props}
      />
      {error && (
        <Text size='small' className="text-red-500 text-sm mt-1">{error}</Text>
      )}
      {helperText && !error && (
        <Text size='small' className="text-gray-500 text-sm mt-1">{helperText}</Text>
      )}
    </div>
  );
}