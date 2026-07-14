import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'max-w-3xl', // 768px - forms, auth
  md: 'max-w-4xl', // 896px - profiles
  lg: 'max-w-6xl', // 1152px - events list
  xl: 'max-w-7xl', // 1280px - admin, home
};

export function PageContainer({ children, size = 'xl', className }: PageContainerProps) {
  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 ${sizeMap[size]} ${className || ''}`}
    >
      {children}
    </div>
  );
}