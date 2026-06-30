import { Group, Stack, Title, Badge, Text, Paper, Avatar } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconEye } from '@tabler/icons-react';
import { ROUTES } from '@/constants/routes';
import { UserTrustBadge } from '@/components/molecules/UserTrustBadge';
import { getAvatarUrl } from '@/utils/fileHelpers';
import type { Event } from '@/types';

interface EventHeaderProps {
  event: Event;
}

export function EventHeader({ event }: EventHeaderProps) {
  const { title, status, categories, viewCount, host } = event;
  const isCancelled = status === 'CANCELLED';
  const isCompleted = status === 'COMPLETED';
  const avatarSrc = host.profileImageUrl || getAvatarUrl(host.id) || undefined;

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Stack gap={4}>
          <Group gap="xs">
            <Title order={1}>{title}</Title>
            {isCancelled && <Badge color="red">Cancelled</Badge>}
            {isCompleted && <Badge color="gray">Completed</Badge>}
            {status === 'UNDER_REVIEW' && <Badge color="yellow">Under Review</Badge>}
            {status === 'DRAFT' && <Badge color="gray">Draft</Badge>}
          </Group>
          <Group gap="xs">
            {categories.map((cat) => (
              <Badge key={cat.id} color={cat.color || 'gray'} variant="light" radius="md">
                {cat.name}
              </Badge>
            ))}
          </Group>
        </Stack>
        <Group gap={4}>
          <IconEye size={16} />
          <Text size="sm" c="dimmed">{viewCount}</Text>
        </Group>
      </Group>

      <Paper withBorder p="md" radius="lg">
        <Group gap="md">
          <Avatar src={avatarSrc} size={56} radius="xl" alt={host.displayName} />
          <div style={{ flex: 1 }}>
            <Group gap="xs">
              <Text component={Link} to={ROUTES.USER_PROFILE(host.id)} fw={600} size="lg" style={{ textDecoration: 'none', color: 'inherit' }}>
                {host.displayName}
              </Text>
              <UserTrustBadge trustLevel={host.trustLevel} />
            </Group>
            <Group gap="sm">
              <Text size="sm" c="dimmed">
                {host.averageHostRating > 0 ? host.averageHostRating.toFixed(1) : 'No reviews yet'}
              </Text>
              <Text size="sm" c="dimmed">• {host.completedEventsWithReviews} events hosted</Text>
            </Group>
          </div>
        </Group>
      </Paper>
    </Stack>
  );
}