import { Button as MantineButton, ButtonProps as MantineButtonProps } from '@mantine/core';
import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isLoading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  fullWidth?: boolean;
  [key: string]: any; // Allow any other props for MantineButton
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  isLoading,
  type = 'button',
  onClick,
  disabled,
  fullWidth,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white border-transparent',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 border-transparent',
    outline: 'bg-transparent border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <MantineButton
      className={cn(
        'font-medium rounded-lg transition-colors duration-200',
        variants[variant],
        sizes[size],
        className
      )}
      loading={isLoading}
      type={type}
      onClick={onClick}
      disabled={disabled}
      fullWidth={fullWidth}
      {...props}
    >
      {children}
    </MantineButton>
  );
}