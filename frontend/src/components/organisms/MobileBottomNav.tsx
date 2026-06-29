import { Link, useLocation } from 'react-router-dom';
import { Text } from '@mantine/core';
import { IconHome, IconCalendar, IconUser, IconPlus } from '@tabler/icons-react';
import { ROUTES } from '@/constants/routes';

export function MobileBottomNav() {
  const location = useLocation();
  
  const items = [
    { icon: IconHome, label: 'Home', to: ROUTES.HOME },
    { icon: IconCalendar, label: 'Events', to: ROUTES.EVENTS },
    { icon: IconPlus, label: 'Create', to: ROUTES.CREATE_EVENT },
    { icon: IconUser, label: 'Profile', to: ROUTES.PROFILE },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: 'var(--app-surface)',
        borderTop: '1px solid var(--app-border)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {items.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            style={{
              textDecoration: 'none',
              color: isActive ? 'var(--app-primary)' : 'var(--app-text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '8px 12px',
            }}
          >
            <item.icon size={24} />
            <Text size="xs">{item.label}</Text>
          </Link>
        );
      })}
    </nav>
  );
}