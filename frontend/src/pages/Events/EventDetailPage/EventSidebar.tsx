import { Stack, Paper, Group, ThemeIcon, Text, Divider, Alert, Badge, Avatar } from '@mantine/core';
import { IconCalendar, IconMapPin, IconUsers, IconShare, IconCrown, IconInfoCircle } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { formatDate } from '@/utils/dateFormatter';
import { CapacityBar } from '@/components/molecules/CapacityBar';
import { WaitlistBanner } from '@/components/organisms/WaitlistBanner';
import { ROUTES } from '@/constants/routes';
import { getAvatarUrl } from '@/utils/fileHelpers';
import { UserTrustBadge } from '@/components/molecules/UserTrustBadge';
import { Button } from '@/components/ui/Button';
import type { Event, Rsvp } from '@/types';

interface EventSidebarProps {
  event: Event;
  myRsvp?: Rsvp | null;
  isHost: boolean;
  isAuthenticated: boolean;
  isFull: boolean;
  isCancelled: boolean;
  isCompleted: boolean;
  cancellationReason?: string;
  onRsvp: () => void;
  onCancelRsvp: () => void;
  onShare: () => void;
  isCreating: boolean;
  isCancelling: boolean;
}

export function EventSidebar({
  event,
  myRsvp,
  isHost,
  isAuthenticated,
  isFull,
  isCancelled,
  isCompleted,
  cancellationReason,
  onRsvp,
  onCancelRsvp,
  onShare,
  isCreating,
  isCancelling,
}: EventSidebarProps) {
  const { id, location, startTime, endTime, maxCapacity, currentRsvpCount, myRsvpStatus, host } = event;

  return (
    <div className="lg:sticky lg:top-24">
      <Stack gap="md">
        {/* Primary action card */}
        <Paper
          withBorder
          p="xl"
          radius="xl"
          className="border-slate-200/80 dark:border-slate-700/60 relative overflow-hidden"
          style={{ background: 'var(--app-surface)' }}
        >
          {/* Soft brand accent glow, top-right */}
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-[0.08] pointer-events-none"
            style={{ background: 'var(--app-primary)' }}
            aria-hidden="true"
          />

          <Stack gap="lg" className="relative">
            <Group gap="md" align="flex-start" wrap="nowrap">
              <ThemeIcon size={40} radius="lg" color="brand" variant="light" className="shrink-0">
                <IconCalendar size={20} />
              </ThemeIcon>
              <div className="min-w-0">
                <Text fw={600} size="sm" style={{ color: 'var(--app-text)' }}>
                  {formatDate(startTime)}
                </Text>
                <Text size="xs" style={{ color: 'var(--app-text-muted)' }}>
                  until {formatDate(endTime)}
                </Text>
              </div>
            </Group>

            <Group gap="md" align="flex-start" wrap="nowrap">
              <ThemeIcon size={40} radius="lg" color="brand" variant="light" className="shrink-0">
                <IconMapPin size={20} />
              </ThemeIcon>
              <div className="min-w-0">
                <Text fw={600} size="sm" className="truncate" style={{ color: 'var(--app-text)' }}>
                  {location}
                </Text>
                <Text size="xs" style={{ color: 'var(--app-text-muted)' }}>
                  Event location
                </Text>
              </div>
            </Group>

            <Divider style={{ borderColor: 'var(--app-border)' }} />

            <div>
              <CapacityBar current={currentRsvpCount} max={maxCapacity} showLabels={false} />
              <Group justify="space-between" mt={8}>
                <Group gap={4}>
                  <IconUsers size={14} style={{ color: 'var(--app-text-muted)' }} />
                  <Text size="sm" style={{ color: 'var(--app-text-muted)' }}>
                    {currentRsvpCount} / {maxCapacity} spots filled
                  </Text>
                </Group>
                {isFull && (
                  <Badge color="orange" size="xs" radius="md">
                    Full
                  </Badge>
                )}
              </Group>
            </div>

            <Divider style={{ borderColor: 'var(--app-border)' }} />

            {!isHost && !isCancelled && !isCompleted && isAuthenticated ? (
              <>
                {myRsvpStatus === 'GOING' ? (
                  <Button
                    fullWidth
                    variant="danger"
                    onClick={onCancelRsvp}
                    isLoading={isCancelling}
                    className="min-h-[46px]"
                    aria-label="Cancel registration"
                  >
                    Cancel registration
                  </Button>
                ) : myRsvpStatus === 'WAITLISTED' ? (
                  <Stack gap="sm">
                    <Button fullWidth variant="secondary" disabled className="min-h-[46px]">
                      You're on the waitlist
                    </Button>
                    {myRsvp && <WaitlistBanner eventId={id} rsvpId={myRsvp.id} />}
                  </Stack>
                ) : (
                  <Button
                    fullWidth
                    variant="primary"
                    onClick={onRsvp}
                    isLoading={isCreating}
                    className="min-h-[46px]"
                    aria-label={isFull ? 'Join waitlist' : 'Register for event'}
                  >
                    {isFull ? 'Join waitlist' : 'Register now'}
                  </Button>
                )}
              </>
            ) : !isAuthenticated ? (
              <Button
                fullWidth
                component={Link}
                to={ROUTES.LOGIN}
                variant="secondary"
                className="min-h-[46px]"
                aria-label="Log in to register"
              >
                Log in to register
              </Button>
            ) : null}

            {isHost && (
              <Alert
                icon={<IconCrown size={16} />}
                color="brand"
                radius="lg"
                variant="light"
                title="You're hosting this event"
              >
                Manage attendees, media, and settings from the actions menu above.
              </Alert>
            )}

            {isCancelled && cancellationReason && (
              <Alert icon={<IconInfoCircle size={16} />} color="red" radius="lg" title="Event cancelled">
                {cancellationReason}
              </Alert>
            )}

            {isCompleted && (
              <Alert icon={<IconInfoCircle size={16} />} color="gray" radius="lg" title="Event completed">
                This event has ended. You can now leave a review below.
              </Alert>
            )}

            <Button
              variant="ghost"
              leftSection={<IconShare size={16} />}
              onClick={onShare}
              className="min-h-[44px]"
              aria-label="Share event"
            >
              Share event
            </Button>
          </Stack>
        </Paper>

        {/* Host card */}
        <Paper
          withBorder
          p="lg"
          radius="xl"
          className="border-slate-200/80 dark:border-slate-700/60"
          style={{ background: 'var(--app-surface)' }}
        >
          <Text
            fw={700}
            size="xs"
            mb="md"
            className="uppercase tracking-wider"
            style={{ color: 'var(--app-text-muted)' }}
          >
            Hosted by
          </Text>
          <Group gap="md" wrap="nowrap">
            <Avatar src={host.profileImageUrl || getAvatarUrl(host.id) || undefined} size={52} radius="xl" />
            <div className="min-w-0">
              <Text fw={700} size="sm" className="truncate" style={{ color: 'var(--app-text)' }}>
                {host.displayName}
              </Text>
              <UserTrustBadge trustLevel={host.trustLevel} size="xs" />
            </div>
          </Group>
        </Paper>
      </Stack>
    </div>
  );
}