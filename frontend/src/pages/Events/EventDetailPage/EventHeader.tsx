import { Group, Stack, Title, Badge, Text, Paper, Avatar } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconEye, IconStar } from '@tabler/icons-react';
import { ROUTES } from '@/constants/routes';
import { UserTrustBadge } from '@/components/molecules/UserTrustBadge';
import { getAvatarUrl } from '@/utils/fileHelpers';
import type { Event } from '@/types';

interface EventHeaderProps {
  event: Event;
}

const statusBadge: Record<string, { color: string; label: string }> = {
  CANCELLED: { color: 'red', label: 'Cancelled' },
  COMPLETED: { color: 'gray', label: 'Completed' },
  UNDER_REVIEW: { color: 'yellow', label: 'Under review' },
  DRAFT: { color: 'gray', label: 'Draft' },
};

export function EventHeader({ event }: EventHeaderProps) {
  const { title, status, categories, viewCount, host } = event;
  const badge = statusBadge[status];
  const avatarSrc = host.profileImageUrl || getAvatarUrl(host.id) || undefined;

  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Title
            order={1}
            className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight"
            style={{ color: 'var(--app-text)' }}
          >
            {title}
          </Title>
          <Group gap={4} className="shrink-0" title="Views">
            <IconEye size={16} style={{ color: 'var(--app-text-muted)' }} />
            <Text size="sm" style={{ color: 'var(--app-text-muted)' }}>
              {viewCount}
            </Text>
          </Group>
        </Group>

        <Group gap={6}>
          {badge && (
            <Badge color={badge.color} variant="filled" radius="md" size="sm">
              {badge.label}
            </Badge>
          )}
          {categories.map((cat) => (
            <Badge key={cat.id} color={cat.color || 'gray'} variant="light" radius="md" size="sm">
              {cat.name}
            </Badge>
          ))}
        </Group>
      </Stack>

      <Paper
        withBorder
        p="md"
        radius="xl"
        className="border-slate-200/80 dark:border-slate-700/60"
        style={{ background: 'var(--app-surface)' }}
      >
        <Group gap="md" wrap="nowrap">
          <Avatar src={avatarSrc} size={52} radius="xl" alt={host.displayName} />
          <div className="flex-1 min-w-0">
            <Group gap="xs" wrap="nowrap">
              <Text
                component={Link}
                to={ROUTES.USER_PROFILE(host.id)}
                fw={700}
                size="md"
                className="no-underline truncate"
                style={{ color: 'var(--app-text)' }}
              >
                {host.displayName}
              </Text>
              <UserTrustBadge trustLevel={host.trustLevel} size="xs" />
            </Group>
            <Group gap={6} style={{ color: 'var(--app-text-secondary)' }}>
              <Group gap={3}>
                <IconStar
                  size={13}
                  color={host.averageHostRating > 0 ? '#f59e0b' : undefined}
                  fill={host.averageHostRating > 0 ? '#f59e0b' : 'none'}
                />
                <Text size="xs" style={{ color: 'var(--app-text-secondary)' }}>
                  {host.averageHostRating > 0 ? host.averageHostRating.toFixed(1) : 'No reviews yet'}
                </Text>
              </Group>
              <Text size="xs" style={{ color: 'var(--app-text-muted)' }}>·</Text>
              <Text size="xs" style={{ color: 'var(--app-text-secondary)' }}>
                {host.completedEventsWithReviews} events hosted
              </Text>
            </Group>
          </div>
        </Group>
      </Paper>
    </Stack>
  );
}