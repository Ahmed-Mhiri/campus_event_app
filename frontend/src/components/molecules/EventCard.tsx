import { Link } from 'react-router-dom';
import { Image, Text, Group, Badge, Button, Avatar } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconCalendar, IconMapPin, IconCrown } from '@tabler/icons-react';
import { formatDate } from '@/utils/dateFormatter';
import { getAvatarUrl } from '@/utils/fileHelpers';
import { ROUTES } from '@/constants/routes';
import { cardHover } from '@/design-system/animations';
import type { Event } from '@/types';
import { CategoryChip } from './CategoryChip';
import { UserTrustBadge } from './UserTrustBadge';
import { CapacityBar } from './CapacityBar';
import { Card as UICard } from '@/components/ui/Card';

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
      <UICard
        component={Link}
        to={ROUTES.EVENT_DETAIL(slug)}
        hover
        className="flex flex-col h-full overflow-hidden text-inherit no-underline"
      >
        {/* Image Section with overlay badges */}
        <div className="relative">
          <Image
            src={coverImage || '/placeholder-event.jpg'}
            height={200}
            alt={title}
            fallbackSrc="/placeholder-event.jpg"
            className="transition-transform duration-300 group-hover:scale-105"
            radius="md"
          />
          <div className="absolute top-3 right-3 flex gap-1 flex-wrap justify-end">
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
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 gap-2 mt-3">
          <Text
            fw={600}
            size="xl"
            lineClamp={2}
            lh={1.3}
            className="tracking-tight"
          >
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

          <Group gap="xs" wrap="nowrap" c="dimmed" className="text-sm">
            <Group gap={4} wrap="nowrap">
              <IconCalendar size={14} className="flex-shrink-0" />
              <Text size="sm" lineClamp={1}>{formatDate(startTime)}</Text>
            </Group>
            <Text size="sm" c="dimmed">·</Text>
            <Group gap={4} wrap="nowrap" className="min-w-0">
              <IconMapPin size={14} className="flex-shrink-0" />
              <Text size="sm" lineClamp={1}>{location}</Text>
            </Group>
          </Group>

          <CapacityBar current={currentRsvpCount} max={maxCapacity} />

          <Group gap="xs" align="center" className="mt-auto pt-3">
            <Avatar src={avatarSrc} size={24} radius="xl" alt={host.displayName} />
            <Text
              component={Link}
              to={ROUTES.USER_PROFILE(host.id)}
              size="xs"
              fw={500}
              c="dimmed"
              className="no-underline hover:text-brand-600"
              onClick={(e) => e.stopPropagation()}
            >
              {host.displayName}
            </Text>
            <UserTrustBadge trustLevel={host.trustLevel} size="xs" showLabel={false} />
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
    // RSVP action
  }}
  className="mt-2 min-h-[44px]"
  aria-label={rsvpLabel}
>
  {rsvpLabel}
</Button>
        </div>
      </UICard>
    </motion.div>
  );
}