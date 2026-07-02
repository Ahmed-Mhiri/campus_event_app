// src/components/templates/AdminLayout/AdminLayout.tsx

import { Outlet, useLocation } from 'react-router-dom';
import { AppShell, Container, NavLink, Title, Text, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import {
  IconDashboard,
  IconCalendarEvent,
  IconUsers,
  IconTags,
  IconFlag,
} from '@tabler/icons-react';
import { ROUTES } from '@/constants/routes';

const navItems = [
  { label: 'Dashboard', to: ROUTES.ADMIN_DASHBOARD, icon: IconDashboard },
  { label: 'Events', to: ROUTES.ADMIN_EVENTS, icon: IconCalendarEvent },
  { label: 'Users', to: ROUTES.ADMIN_USERS, icon: IconUsers },
  { label: 'Categories', to: ROUTES.ADMIN_CATEGORIES, icon: IconTags },
  { label: 'Reports', to: ROUTES.ADMIN_REPORTS, icon: IconFlag },
];

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppShell
      navbar={{
        width: 260,
        breakpoint: 'sm',
      }}
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header
        style={{
          background: 'var(--app-surface)',
          borderBottom: '1px solid var(--app-border)',
        }}
      >
        <div
          style={{
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            gap: 12,
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--app-primary-light)' }}
          >
            <IconDashboard size={18} style={{ color: 'var(--app-primary)' }} />
          </div>
          <Title order={4} style={{ color: 'var(--app-text)', fontWeight: 700 }}>
            Admin Panel
          </Title>
        </div>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{
          background: 'var(--app-surface)',
          borderRight: '1px solid var(--app-border)',
        }}
      >
        <Text
          size="xs"
          fw={700}
          className="uppercase tracking-wider mb-4 px-3"
          style={{ color: 'var(--app-text-muted)' }}
        >
          Management
        </Text>
        <Stack gap="xs">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                label={item.label}
                leftSection={
                  <item.icon
                    size={18}
                    style={{
                      color: isActive ? 'var(--app-primary)' : 'var(--app-text-muted)',
                    }}
                  />
                }
                onClick={() => navigate(item.to)}
                active={isActive}
                styles={{
                  root: {
                    borderRadius: 'var(--mantine-radius-md)',
                    color: isActive ? 'var(--app-primary)' : 'var(--app-text)',
                    backgroundColor: isActive ? 'var(--app-primary-light)' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    '&:hover': {
                      backgroundColor: isActive
                        ? 'var(--app-primary-light)'
                        : 'var(--app-border-light)',
                    },
                  },
                }}
              />
            );
          })}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main style={{ background: 'var(--app-bg)' }}>
        <Container size="xl" py="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};