import { Link, useLocation } from 'react-router-dom';
import { IconHome, IconCalendar, IconUser, IconPlus } from '@tabler/icons-react';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

const navItems = [
  { icon: IconHome, label: 'Home', to: ROUTES.HOME },
  { icon: IconCalendar, label: 'Events', to: ROUTES.EVENTS },
  { icon: IconPlus, label: 'Create', to: ROUTES.CREATE_EVENT },
  { icon: IconUser, label: 'Profile', to: ROUTES.PROFILE },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-50 md:hidden pb-[env(safe-area-inset-bottom)]"
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-4 h-full">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px]',
                isActive
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-slate-400 dark:text-slate-500'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}