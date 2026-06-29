// src/components/molecules/EventCard/EventCard.tsx
import { Link } from 'react-router-dom';
import {
  Card,
  Image,
  Text,
  Group,
  Badge,
  Stack,
  Button,
  Avatar,
} from '@mantine/core';
import { IconCalendar, IconMapPin, IconUsers } from '@tabler/icons-react';
import { formatDate } from '@/utils/dateFormatter';
import { getAvatarUrl } from '@/utils/fileHelpers';
import { ROUTES } from '@/constants/routes';
import { UserTrustBadge } from '../UserTrustBadge/UserTrustBadge';
import { CapacityBar } from '../CapacityBar/CapacityBar';
import { CategoryChip } from '../CategoryChip/CategoryChip';
import type { Event } from '@/types';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const {
    slug,
    title,
    location,
    startTime,
    endTime,
    host,
    maxCapacity,
    currentRsvpCount,
    status,
    categories,
    media,
    myRsvpStatus,
    isHost,
  } = event;

  const coverImage = media?.find((m) => m.mediaType === 'IMAGE' && m.displayOrder === 0)?.mediumUrl
    || media?.find((m) => m.mediaType === 'IMAGE')?.mediumUrl
    || null;

  const isFull = currentRsvpCount >= maxCapacity;
  const isCancelled = status === 'CANCELLED';
  const isCompleted = status === 'COMPLETED';

  let rsvpLabel = 'Register';
  if (isCancelled) rsvpLabel = 'Cancelled';
  else if (isCompleted) rsvpLabel = 'Completed';
  else if (myRsvpStatus === 'GOING') rsvpLabel = '✅ Going';
  else if (myRsvpStatus === 'WAITLISTED') rsvpLabel = '⏳ Waitlisted';
  else if (isFull) rsvpLabel = 'Join Waitlist';

  // Avatar src type fix
  const avatarSrc = host.profileImageUrl || getAvatarUrl(host.id) || undefined;

  return (
    <Card
      component={Link}
      to={ROUTES.EVENT_DETAIL(slug)}
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <Card.Section>
        <Image
          src={coverImage || '/placeholder-event.jpg'}
          height={160}
          alt={title}
          fallbackSrc="/placeholder-event.jpg"
        />
      </Card.Section>

      <Stack gap="xs" mt="md">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={700} size="lg" lineClamp={1}>
            {title}
          </Text>
          {isCancelled && <Badge color="red">Cancelled</Badge>}
          {isCompleted && <Badge color="gray">Completed</Badge>}
          {status === 'PUBLISHED' && !isFull && <Badge color="green">Open</Badge>}
          {status === 'PUBLISHED' && isFull && <Badge color="orange">Full</Badge>}
        </Group>

        {categories.length > 0 && (
          <Group gap={4}>
            {categories.slice(0, 3).map((cat) => (
              <CategoryChip key={cat.id} name={cat.name} color={cat.color} />
            ))}
            {categories.length > 3 && <Text size="xs" c="dimmed">+{categories.length - 3}</Text>}
          </Group>
        )}

        <Group gap="xs">
          <IconCalendar size={16} />
          <Text size="sm">{formatDate(startTime)}</Text>
          {endTime && (
            <>
              <Text size="sm">–</Text>
              <Text size="sm">{formatDate(endTime)}</Text>
            </>
          )}
        </Group>

        <Group gap="xs">
          <IconMapPin size={16} />
          <Text size="sm" lineClamp={1}>{location}</Text>
        </Group>

        <Group gap="xs" align="center">
          <Avatar
            src={avatarSrc != null ? String(avatarSrc) : undefined}
            size={24}
            radius="xl"
            alt={host.displayName}
          />
          <Text size="sm" fw={500}>{host.displayName}</Text>
          <UserTrustBadge trustLevel={host.trustLevel} />
          {host.averageHostRating > 0 && (
            <Text size="xs" c="dimmed">⭐ {host.averageHostRating.toFixed(1)}</Text>
          )}
        </Group>

        <CapacityBar current={currentRsvpCount} max={maxCapacity} />

        <Group justify="space-between" mt="xs">
          <Group gap={4}>
            <IconUsers size={16} />
            <Text size="sm">{currentRsvpCount} / {maxCapacity}</Text>
          </Group>
          <Button
            size="xs"
            variant={myRsvpStatus === 'GOING' ? 'filled' : 'light'}
            color={myRsvpStatus === 'GOING' ? 'green' : 'blue'}
            disabled={isCancelled || isCompleted}
            onClick={(e) => {
              e.preventDefault();
              // RSVP action will be handled by parent or later
            }}
          >
            {rsvpLabel}
          </Button>
        </Group>

        {isHost && <Badge color="blue" variant="light" size="xs">Your event</Badge>}
      </Stack>
    </Card>
  );
}