import { Paper, PaperProps } from '@mantine/core';
import { ReactNode, ElementType, ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';

// 1. Change interface to a generic type that captures the component type (C)
export type CardProps<C extends ElementType = 'div'> = PaperProps & {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  className?: string;
  hover?: boolean;
  component?: C;
} & Omit<ComponentPropsWithoutRef<C>, keyof PaperProps | 'component'>;
// ^ 2. This Omit merges the props of the custom component (like 'to' for Link) 

// 3. Make the function generic
export function Card<C extends ElementType = 'div'>({
  children,
  variant = 'default',
  className,
  hover = false,
  component,
  ...props
}: CardProps<C>) {
  const variants = {
    default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
    elevated: 'bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700/50',
    outlined: 'bg-transparent border border-slate-200 dark:border-slate-700',
    ghost: 'bg-slate-50/50 dark:bg-slate-800/30',
  };

  return (
    <Paper
      component={component as any} // Cast to any internally to satisfy Mantine's base types
      radius="lg"
      p="lg"
      className={cn(
        variants[variant],
        hover && 'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </Paper>
  );
}