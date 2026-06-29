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
import { motion } from 'framer-motion';
import { IconCalendar, IconMapPin, IconUsers, IconCrown } from '@tabler/icons-react';
import { formatDate } from '@/utils/dateFormatter';
import { getAvatarUrl } from '@/utils/fileHelpers';
import { ROUTES } from '@/constants/routes';

import { cardHover } from '@/design-system/animations';
import type { Event } from '@/types';
import { CategoryChip } from './CategoryChip';
import { UserTrustBadge } from './UserTrustBadge';
import { CapacityBar } from './CapacityBar';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const {
    slug,
    title,
    location,
    startTime,
    host,
    maxCapacity,
    currentRsvpCount,
    status,
    categories,
    media,
    myRsvpStatus,
    isHost,
  } = event;

  const coverImage =
    media?.find((m) => m.mediaType === 'IMAGE' && m.displayOrder === 0)
      ?.mediumUrl ||
    media?.find((m) => m.mediaType === 'IMAGE')?.mediumUrl ||
    null;

  const isFull = currentRsvpCount >= maxCapacity;
  const isCancelled = status === 'CANCELLED';
  const isCompleted = status === 'COMPLETED';

  let rsvpLabel = 'Register';
  if (isCancelled) rsvpLabel = 'Cancelled';
  else if (isCompleted) rsvpLabel = 'Completed';
  else if (myRsvpStatus === 'GOING') rsvpLabel = 'Going';
  else if (myRsvpStatus === 'WAITLISTED') rsvpLabel = 'Waitlisted';
  else if (isFull) rsvpLabel = 'Join Waitlist';

  const avatarSrc = host.profileImageUrl || getAvatarUrl(host.id) || undefined;

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardHover}
      style={{ height: '100%' }}
    >
      <Card
        component={Link}
        to={ROUTES.EVENT_DETAIL(slug)}
        shadow="sm"
        padding="lg"
        radius="lg"
        withBorder
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Card.Section style={{ position: 'relative' }}>
          <Image
            src={coverImage || '/placeholder-event.jpg'}
            height={200}
            alt={title}
            fallbackSrc="/placeholder-event.jpg"
            style={{ transition: 'transform 300ms ease' }}
          />
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}
          >
            {isCancelled && <Badge color="red" variant="filled" radius="md">Cancelled</Badge>}
            {isCompleted && <Badge color="gray" variant="filled" radius="md">Completed</Badge>}
            {status === 'PUBLISHED' && !isFull && <Badge color="green" variant="filled" radius="md">Open</Badge>}
            {status === 'PUBLISHED' && isFull && <Badge color="orange" variant="filled" radius="md">Full</Badge>}
            {isHost && (
              <Badge color="blue" variant="light" leftSection={<IconCrown size={12} />}>
                Your Event
              </Badge>
            )}
          </div>
        </Card.Section>

        <Stack gap="xs" mt="md" style={{ flex: 1 }}>
          <Text fw={700} size="lg" lineClamp={2} lh={1.3}>
            {title}
          </Text>

          {categories.length > 0 && (
            <Group gap={6}>
              {categories.slice(0, 3).map((cat) => (
                <CategoryChip key={cat.id} name={cat.name} color={cat.color} size="xs" />
              ))}
              {categories.length > 3 && (
                <Text size="xs" c="dimmed">
                  +{categories.length - 3}
                </Text>
              )}
            </Group>
          )}

          <Group gap="xs" c="dimmed">
            <IconCalendar size={14} />
            <Text size="sm">{formatDate(startTime)}</Text>
          </Group>

          <Group gap="xs" c="dimmed">
            <IconMapPin size={14} />
            <Text size="sm" lineClamp={1}>
              {location}
            </Text>
          </Group>

          <Group gap="xs" align="center" mt="auto" pt="sm">
            <Avatar src={avatarSrc} size={28} radius="xl" alt={host.displayName} />
            <Text
              component={Link}
              to={ROUTES.USER_PROFILE(host.id)}
              size="sm"
              fw={500}
              style={{ textDecoration: 'none', color: 'inherit' }}
              onClick={(e) => e.stopPropagation()}
            >
              {host.displayName}
            </Text>
            <UserTrustBadge trustLevel={host.trustLevel} size="xs" showLabel={false} />
          </Group>

          {/* FIXED: Removed the unsupported size="sm" prop */}
          <CapacityBar current={currentRsvpCount} max={maxCapacity} />

          <Group justify="space-between" mt="xs">
            <Group gap={4}>
              <IconUsers size={16} />
              <Text size="sm">
                {currentRsvpCount} / {maxCapacity}
              </Text>
            </Group>
          </Group>

          <Button
            size="sm"
            radius="md"
            variant={myRsvpStatus === 'GOING' ? 'filled' : 'light'}
            color={myRsvpStatus === 'GOING' ? 'green' : 'brand'}
            fullWidth
            disabled={isCancelled || isCompleted}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // RSVP action will be handled by parent or later
            }}
            style={{ marginTop: 'auto' }}
          >
            {rsvpLabel}
          </Button>
        </Stack>
      </Card>
    </motion.div>
  );
}