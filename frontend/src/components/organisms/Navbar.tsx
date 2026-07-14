import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Group,
  Text,
  Button,
  Menu,
  Avatar,
  ActionIcon,
  useMantineColorScheme,
  Drawer,
  UnstyledButton,
  ThemeIcon,
  Box,
  Stack,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconSun,
  IconMoon,
  IconUser,
  IconLogout,
  IconSettings,
  IconCalendar,
  IconSchool,
  IconMenu2,
  IconTicket,
} from '@tabler/icons-react';
import { SearchBar } from '@/components/molecules/SearchBar';
import { NotificationDropdown } from '@/components/organisms/NotificationDropdown';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { getAvatarUrl } from '@/utils/fileHelpers';

// ✅ Get the backend base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  // ✅ Convert relative path to full URL
  const getFullImageUrl = (url?: string | null) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  // Compute avatar source with full URL
  const avatarSrc = user
    ? getFullImageUrl(user.profileImageUrl) || getAvatarUrl(user.id) || undefined
    : undefined;

  return (
    <Group h="100%" px={{ base: 16, md: 24 }} justify="space-between" wrap="nowrap">
      {/* Logo */}
      <Group gap="xs" wrap="nowrap">
        <ThemeIcon size={36} radius="md" color="brand" variant="filled">
          <IconSchool size={20} aria-hidden="true" />
        </ThemeIcon>
        <Text
          component={Link}
          to={ROUTES.HOME}
          size="xl"
          fw={800}
          style={{
            textDecoration: 'none',
            color: 'inherit',
            letterSpacing: '-0.03em',
          }}
        >
          MyStudy
          <span style={{ color: 'var(--app-primary)' }}>App</span>
        </Text>
      </Group>

      {/* Desktop Search */}
      {!isMobile && (
        <Box style={{ flex: 1, maxWidth: 480, margin: '0 24px' }}>
          <SearchBar placeholder="Search events..." size="sm" />
        </Box>
      )}

      {/* Right side actions */}
      <Group gap="xs" wrap="nowrap">
        <ActionIcon
          onClick={toggleColorScheme}
          variant="subtle"
          size="lg"
          radius="md"
          aria-label="Toggle color scheme"
        >
          {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
        </ActionIcon>

        <NotificationDropdown />

        {user ? (
          <Menu position="bottom-end" withArrow offset={4}>
            <Menu.Target>
              <UnstyledButton style={{ display: 'flex', alignItems: 'center', gap: 8 }} aria-label="User menu">
                <Avatar
                  src={avatarSrc}
                  radius="xl"
                  size="md"
                  style={{ cursor: 'pointer', border: '2px solid var(--app-border)' }}
                  alt={user.displayName}
                />
                {!isMobile && (
                  <Text size="sm" fw={500} lineClamp={1} style={{ maxWidth: 120 }}>
                    {user.displayName}
                  </Text>
                )}
              </UnstyledButton>
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
              <Menu.Item
                leftSection={<IconTicket size={14} />}
                onClick={() => navigate(ROUTES.MY_REGISTRATIONS)}
              >
                My Registrations
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
            <Button component={Link} to={ROUTES.LOGIN} variant="subtle" radius="md">
              Log In
            </Button>
            <Button component={Link} to={ROUTES.REGISTER} radius="md">
              Get Started
            </Button>
          </Group>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <IconMenu2 size={24} />
          </ActionIcon>
        )}
      </Group>

      {/* Mobile drawer */}
      <Drawer
        opened={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        size="xs"
        padding="md"
        aria-label="Mobile navigation menu"
      >
        <Stack gap="md">
          <SearchBar placeholder="Search..." />
          <Button component={Link} to={ROUTES.HOME} variant="subtle" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Button>
          <Button component={Link} to={ROUTES.EVENTS} variant="subtle" onClick={() => setMobileMenuOpen(false)}>
            Events
          </Button>
          <Button component={Link} to={ROUTES.CREATE_EVENT} variant="subtle" onClick={() => setMobileMenuOpen(false)}>
            Create Event
          </Button>
          <Button component={Link} to={ROUTES.MY_REGISTRATIONS} variant="subtle" onClick={() => setMobileMenuOpen(false)}>
            My Registrations
          </Button>
          <Button component={Link} to={ROUTES.PROFILE} variant="subtle" onClick={() => setMobileMenuOpen(false)}>
            Profile
          </Button>
        </Stack>
      </Drawer>
    </Group>
  );
}