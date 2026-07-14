// src/components/molecules/EventCard.tsx
import { Link, useNavigate } from 'react-router-dom';
import { Image, Text, Group, Badge, Button, Avatar } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconCalendar, IconMapPin, IconCrown, IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import { formatDate } from '@/utils/dateFormatter';
import { getAvatarUrl } from '@/utils/fileHelpers';
import { ROUTES } from '@/constants/routes';
import { cardHover } from '@/design-system/animations';
import type { Event } from '@/types';
import { CategoryChip } from './CategoryChip';
import { UserTrustBadge } from './UserTrustBadge';
import { CapacityBar } from './CapacityBar';
import { Card as UICard } from '@/components/ui/Card';
import { useRsvp } from '@/hooks/useRsvp';
import { useAuthStore } from '@/stores/authStore';

interface EventCardProps {
  event: Event;
}

const getFullImageUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8081').replace('8080', '8081');
  return `${baseUrl}${url}`;
};

export function EventCard({ event }: EventCardProps) {
  const {
    id,
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
    myRsvpStatus, // fallback if RSVP query hasn't resolved yet
    isHost,
  } = event;

  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // Fetch the actual RSVP (now the source of truth)
  const { createRsvp, cancelRsvp, isCreating, isCancelling, useMyRsvpForEvent } = useRsvp(id);
  const { data: myRsvp, isLoading: isRsvpLoading } = useMyRsvpForEvent(id);

  // Use the fetched RSVP status if available, otherwise fall back to event.myRsvpStatus
  const actualStatus = myRsvp?.status ?? myRsvpStatus;

  const isActuallyHost = isHost || (user?.id === host.id);

  const now = Date.now();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const isLive = status === 'PUBLISHED' && start <= now && now < end;
  const hasStarted = start <= now;

  const rawCoverImage =
    media?.find((m) => m.mediaType === 'IMAGE' && m.displayOrder === 0)?.url ||
    media?.find((m) => m.mediaType === 'IMAGE')?.url ||
    null;
  const coverImage = getFullImageUrl(rawCoverImage);

  const isFull = currentRsvpCount >= maxCapacity;
  const isCancelled = status === 'CANCELLED';
  const isCompleted = status === 'COMPLETED';

  // ─── Button logic ──────────────────────────────────────────────────────────
  let buttonLabel = 'Register';
  let buttonVariant: 'default' | 'filled' | 'light' = 'light';
  let buttonColor: string = 'brand';
  let buttonDisabled = false;
  let buttonLoading = false;
  let handleClick: (e: React.MouseEvent) => void;

  // If RSVP is still loading, show a neutral disabled button to avoid flicker
  if (isRsvpLoading && isAuthenticated) {
    buttonLabel = 'Loading…';
    buttonVariant = 'light';
    buttonColor = 'gray';
    buttonDisabled = true;
    handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
  } else if (isActuallyHost) {
    buttonLabel = 'Manage Event';
    buttonVariant = 'default';
    buttonColor = 'gray';
    handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigate(`/events/edit/${id}`);
    };
  } else if (isCancelled || isCompleted) {
    buttonLabel = isCancelled ? 'Cancelled' : 'Completed';
    buttonVariant = 'light';
    buttonColor = 'gray';
    buttonDisabled = true;
    handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
  } else if (!isAuthenticated) {
    buttonLabel = 'Log in to register';
    buttonVariant = 'light';
    buttonColor = 'brand';
    handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigate(ROUTES.LOGIN);
    };
  } else if (actualStatus === 'ATTENDED') {
    buttonLabel = 'Checked In';
    buttonVariant = 'filled';
    buttonColor = 'green';
    handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigate(ROUTES.EVENT_DETAIL(slug));
    };
  } else if (actualStatus === 'GOING') {
    // ── GOING ──────────────────────────────────────────────────────
    if (isLive) {
      buttonLabel = 'Check In';
      buttonVariant = 'filled';
      buttonColor = 'brand';
      handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/check-in/attendee/${id}`);
      };
    } else if (!hasStarted && myRsvp) {
      buttonLabel = 'Cancel registration';
      buttonVariant = 'filled';
      buttonColor = 'red';
      buttonLoading = isCancelling;
      handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        cancelRsvp({ rsvpId: myRsvp.id });
      };
    } else {
      buttonLabel = 'Going';
      buttonVariant = 'light';
      buttonColor = 'brand';
      handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(ROUTES.EVENT_DETAIL(slug));
      };
    }
  } else if (actualStatus === 'WAITLISTED') {
    // ── WAITLISTED ────────────────────────────────────────────────
    if (!hasStarted && myRsvp) {
      buttonLabel = 'Leave waitlist';
      buttonVariant = 'filled';
      buttonColor = 'red';
      buttonLoading = isCancelling;
      handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        cancelRsvp({ rsvpId: myRsvp.id });
      };
    } else {
      buttonLabel = 'Waitlisted';
      buttonVariant = 'light';
      buttonColor = 'brand';
      handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(ROUTES.EVENT_DETAIL(slug));
      };
    }
  } else {
    // ── NOT REGISTERED ──────────────────────────────────────────
    if (isLive && !isFull) {
      buttonLabel = 'Join Now';
      buttonVariant = 'filled';
      buttonColor = 'brand';
      buttonLoading = isCreating;
      handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        createRsvp();
      };
    } else if (isLive && isFull) {
      buttonLabel = 'Event Full';
      buttonVariant = 'light';
      buttonColor = 'gray';
      buttonDisabled = true;
      handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };
    } else {
      // Future event
      buttonLabel = isFull ? 'Join Waitlist' : 'Register';
      buttonVariant = 'light';
      buttonColor = 'brand';
      buttonLoading = isCreating;
      handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        createRsvp();
      };
    }
  }

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
            {actualStatus === 'ATTENDED' && (
              <Badge color="green" variant="filled" radius="md" leftSection={<IconCheck size={12} />}>
                Checked In
              </Badge>
            )}
            {isLive && !(actualStatus === 'ATTENDED') && (
              <Badge
                color="red"
                variant="filled"
                radius="md"
                className="animate-pulse flex items-center gap-1"
                style={{ boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)', fontWeight: 600 }}
                leftSection={<span className="w-2 h-2 bg-white rounded-full" />}
              >
                Live
              </Badge>
            )}
            {isCancelled && <Badge color="red" variant="filled" radius="md">Cancelled</Badge>}
            {isCompleted && <Badge color="gray" variant="filled" radius="md">Completed</Badge>}
            {!isLive && actualStatus !== 'ATTENDED' && status === 'PUBLISHED' && !isFull && (
              <Badge color="green" variant="filled" radius="md">Open</Badge>
            )}
            {!isLive && actualStatus !== 'ATTENDED' && status === 'PUBLISHED' && isFull && (
              <Badge color="orange" variant="filled" radius="md">Full</Badge>
            )}
            {isActuallyHost && (
              <Badge color="blue" variant="light" leftSection={<IconCrown size={12} />}>
                Your Event
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-2 mt-3">
          <Text fw={600} size="xl" lineClamp={2} lh={1.3} className="tracking-tight">
            {title}
          </Text>
          {categories.length > 0 && (
            <Group gap={6}>
              {categories.slice(0, 3).map((cat) => (
                <CategoryChip key={cat.id} name={cat.name} color={cat.color} size="xs" />
              ))}
              {categories.length > 3 && (
                <Text size="xs" c="dimmed">+{categories.length - 3}</Text>
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
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(ROUTES.USER_PROFILE(host.id));
              }}
              className="rounded-full cursor-pointer transition-transform hover:scale-105"
            >
              <Avatar src={avatarSrc} size={24} radius="xl" alt={host.displayName} />
            </div>
            <Text
              size="xs"
              fw={500}
              c="dimmed"
              className="cursor-pointer hover:text-brand-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(ROUTES.USER_PROFILE(host.id));
              }}
            >
              {host.displayName}
            </Text>
            <UserTrustBadge trustLevel={host.trustLevel} size="xs" showLabel={false} />
          </Group>

          <Button
            size="sm"
            radius="md"
            variant={buttonVariant}
            color={buttonColor}
            fullWidth
            disabled={buttonDisabled}
            loading={buttonLoading}
            onClick={handleClick}
            className="mt-2 min-h-[44px]"
            aria-label={buttonLabel}
          >
            {buttonLabel}
          </Button>
        </div>
      </UICard>
    </motion.div>
  );
}