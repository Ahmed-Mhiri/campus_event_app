// src/components/organisms/Navbar/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import {
  AppShell,
  Group,
  Text,
  Button,
  Menu,
  Avatar,
  ActionIcon,
  useMantineColorScheme,
} from '@mantine/core';
import { IconSun, IconMoon, IconUser, IconLogout, IconSettings, IconCalendar } from '@tabler/icons-react';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';
import { NotificationDropdown } from '@/components/organisms/NotificationDropdown/NotificationDropdown';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { getAvatarUrl } from '@/utils/fileHelpers';

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between">
        {/* Logo */}
        <Group>
          <Text
            component={Link}
            to={ROUTES.HOME}
            size="xl"
            fw={700}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            MyStudyApp
          </Text>
        </Group>

        {/* Search Bar - only on larger screens */}
        <div style={{ flex: 1, maxWidth: 400, margin: '0 20px' }}>
          <SearchBar placeholder="Search events..." size="sm" />
        </div>

        {/* Right side */}
        <Group gap="xs">
          <ActionIcon onClick={toggleColorScheme} variant="subtle" size="lg">
            {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
          </ActionIcon>

          <NotificationDropdown />

          {user ? (
            <Menu position="bottom-end" withArrow>
              <Menu.Target>
                <Avatar
                  src={user.profileImageUrl || getAvatarUrl(user.id)}
                  radius="xl"
                  size="sm"
                  style={{ cursor: 'pointer' }}
                  alt={user.displayName}
                />
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>
                  <Text size="sm" fw={500}>{user.displayName}</Text>
                  <Text size="xs" c="dimmed">{user.universityEmail}</Text>
                </Menu.Label>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconUser size={14} />}
                  onClick={() => navigate(ROUTES.PROFILE)}
                >
                  My Profile
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconCalendar size={14} />}
                  onClick={() => navigate(ROUTES.MY_EVENTS)}
                >
                  My Events
                </Menu.Item>
                {user.role === 'ADMIN' && (
                  <Menu.Item
                    leftSection={<IconSettings size={14} />}
                    onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
                  >
                    Admin Dashboard
                  </Menu.Item>
                )}
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={14} />}
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Group gap="xs">
              <Button component={Link} to={ROUTES.LOGIN} variant="subtle" size="sm">
                Login
              </Button>
              <Button component={Link} to={ROUTES.REGISTER} size="sm">
                Register
              </Button>
            </Group>
          )}
        </Group>
      </Group>
    </AppShell.Header>
  );
}