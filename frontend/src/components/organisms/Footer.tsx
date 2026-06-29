import { Container, Group, Text, Stack, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--app-border)', background: 'var(--app-surface)' }}>
      <Container size="xl" py="xl">
        <Stack gap="md" align="center">
          <Text fw={700} size="lg" style={{ letterSpacing: '-0.03em' }}>
            MyStudy<span style={{ color: 'var(--app-primary)' }}>App</span>
          </Text>
          <Text size="sm" c="dimmed">
            © {new Date().getFullYear()} MyStudyApp. All rights reserved.
          </Text>
          <Group gap="xs">
            <Anchor component={Link} to={ROUTES.HOME} size="sm" c="dimmed">Home</Anchor>
            <Anchor component={Link} to={ROUTES.EVENTS} size="sm" c="dimmed">Events</Anchor>
            <Anchor component={Link} to={ROUTES.LOGIN} size="sm" c="dimmed">Login</Anchor>
          </Group>
        </Stack>
      </Container>
    </footer>
  );
}