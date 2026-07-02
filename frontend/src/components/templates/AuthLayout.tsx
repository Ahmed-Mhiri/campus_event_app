// src/components/templates/AuthLayout/AuthLayout.tsx
import { Outlet } from 'react-router-dom';
import { AuthShowcasePanel } from './AuthShowcasePanel';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] bg-slate-50 dark:bg-slate-950">
      {/* Left: form column */}
      <div className="relative flex flex-col min-h-screen">
        {/* Subtle background texture for the form side too, so it never reads as "blank" */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.4] dark:opacity-[0.25]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 0% 0%, rgba(139,92,246,0.08), transparent 40%), radial-gradient(circle at 100% 100%, rgba(99,102,241,0.06), transparent 45%)',
          }}
        />
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[400px]">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Right: branded showcase panel */}
      <AuthShowcasePanel />
    </div>
  );
};