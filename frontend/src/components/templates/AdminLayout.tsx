import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AppShell, Burger, Group, NavLink, Stack, Text, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDashboard,
  IconCalendarEvent,
  IconUsers,
  IconCategory,
  IconAlertTriangle,
  IconLogout,
  IconShield
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export function AdminLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { pathname } = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: IconDashboard, to: ROUTES.ADMIN_DASHBOARD },
    { label: 'Events', icon: IconCalendarEvent, to: ROUTES.ADMIN_EVENTS },
    { label: 'Users', icon: IconUsers, to: ROUTES.ADMIN_USERS },
    { label: 'Categories', icon: IconCategory, to: ROUTES.ADMIN_CATEGORIES },
    { label: 'Reports', icon: IconAlertTriangle, to: ROUTES.ADMIN_REPORTS },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      {/* Global Header */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap="xs">
              <IconShield size={24} className="text-violet-600 dark:text-violet-400" />
              <Text fw={700} size="lg">MyStudyApp Admin</Text>
            </Group>
          </Group>
          <Text size="sm" c="dimmed" visibleFrom="sm">
            {user?.universityEmail}
          </Text>
        </Group>
      </AppShell.Header>

      {/* Persistent Sidebar */}
      <AppShell.Navbar p="md">
        <Stack justify="space-between" h="100%">
          {/* Navigation Links */}
          <Stack gap="xs">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                component={Link}
                to={item.to}
                label={item.label}
                leftSection={<item.icon size={20} stroke={1.5} />}
                active={pathname === item.to || pathname.startsWith(`${item.to}/`)}
                onClick={() => toggle()} // auto-close on mobile
                variant="filled"
                className="rounded-md"
              />
            ))}
          </Stack>

          {/* Logout Section at Bottom */}
          <Stack gap="sm">
            <Divider />
            <NavLink
              label="Logout"
              leftSection={<IconLogout size={20} stroke={1.5} />}
              onClick={() => {
                toggle();
                logout(); // clears tokens and redirects
              }}
              className="rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            />
          </Stack>
        </Stack>
      </AppShell.Navbar>

      {/* Page Content */}
      <AppShell.Main className="bg-slate-50 dark:bg-slate-900 min-h-screen">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}