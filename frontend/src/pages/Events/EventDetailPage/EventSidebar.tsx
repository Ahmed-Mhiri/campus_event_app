import { Stack, Paper, Group, ThemeIcon, Text, Divider, Button, Alert, Badge, Avatar } from '@mantine/core';
import { IconCalendar, IconMapPin, IconUsers, IconShare } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { formatDate } from '@/utils/dateFormatter';
import { CapacityBar } from '@/components/molecules/CapacityBar';
import { WaitlistBanner } from '@/components/organisms/WaitlistBanner';
import { ROUTES } from '@/constants/routes';
import { getAvatarUrl } from '@/utils/fileHelpers';
import { UserTrustBadge } from '@/components/molecules/UserTrustBadge';
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
    <div style={{ position: 'sticky', top: 80 }}>
      <Stack gap="md">
        <Paper withBorder p="xl" radius="lg" style={{ background: 'linear-gradient(135deg, var(--app-surface) 0%, var(--app-border-light) 100%)' }}>
          <Stack gap="lg">
            <Group gap="md" align="flex-start">
              <ThemeIcon size={40} radius="md" color="brand" variant="light">
                <IconCalendar size={20} />
              </ThemeIcon>
              <div>
                <Text fw={600}>{formatDate(startTime)}</Text>
                <Text size="sm" c="dimmed">{formatDate(endTime)}</Text>
              </div>
            </Group>

            <Group gap="md" align="flex-start">
              <ThemeIcon size={40} radius="md" color="brand" variant="light">
                <IconMapPin size={20} />
              </ThemeIcon>
              <div>
                <Text fw={600}>{location}</Text>
                <Text size="sm" c="dimmed">Event Location</Text>
              </div>
            </Group>

            <Divider />

            <CapacityBar current={currentRsvpCount} max={maxCapacity} showLabels />

            <Group justify="space-between">
              <Group gap={4}>
                <IconUsers size={16} />
                <Text size="sm">{currentRsvpCount} / {maxCapacity} spots</Text>
              </Group>
              {isFull && <Badge color="orange">Full</Badge>}
            </Group>

            <Divider />

            {!isHost && !isCancelled && !isCompleted && isAuthenticated ? (
              <>
                {myRsvpStatus === 'GOING' ? (
                  <Button fullWidth color="red" variant="light" onClick={onCancelRsvp} loading={isCancelling} radius="md">
                    Cancel Registration
                  </Button>
                ) : myRsvpStatus === 'WAITLISTED' ? (
                  <>
                    <Button fullWidth color="yellow" variant="light" disabled radius="md">
                      Waitlisted
                    </Button>
                    {myRsvp && <WaitlistBanner eventId={id} rsvpId={myRsvp.id} />}
                  </>
                ) : (
                  <Button fullWidth color={isFull ? 'yellow' : 'brand'} onClick={onRsvp} loading={isCreating} radius="md">
                    {isFull ? 'Join Waitlist' : 'Register'}
                  </Button>
                )}
              </>
            ) : !isAuthenticated ? (
              <Button fullWidth component={Link} to={ROUTES.LOGIN} variant="light" radius="md">
                Login to register
              </Button>
            ) : null}

            {isHost && (
              <Alert color="blue" title="You are the host">
                You can manage this event from the actions menu.
              </Alert>
            )}

            {isCancelled && cancellationReason && (
              <Alert color="red" title="Event Cancelled">
                {cancellationReason}
              </Alert>
            )}

            {isCompleted && (
              <Alert color="gray" title="Event Completed">
                This event has ended. You can now leave a review.
              </Alert>
            )}

            <Button variant="light" color="gray" leftSection={<IconShare size={16} />} onClick={onShare} radius="md">
              Share Event
            </Button>
          </Stack>
        </Paper>

        <Paper withBorder p="lg" radius="lg">
          <Text fw={600} size="sm" c="dimmed" mb="md" tt="uppercase">Hosted by</Text>
          <Group gap="md">
            <Avatar src={host.profileImageUrl || getAvatarUrl(host.id) || undefined} size={56} radius="xl" />
            <div>
              <Text fw={600}>{host.displayName}</Text>
              <UserTrustBadge trustLevel={host.trustLevel} />
            </div>
          </Group>
        </Paper>
      </Stack>
    </div>
  );
}