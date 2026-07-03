import { useState } from 'react';
import { Stack, Paper, Group, ThemeIcon, Text, Divider, Alert, Badge, Avatar } from '@mantine/core';
import {
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconShare,
  IconCrown,
  IconInfoCircle,
  IconFlag,
  IconPhotoPlus,
  IconEdit,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { formatDate } from '@/utils/dateFormatter';
import { CapacityBar } from '@/components/molecules/CapacityBar';
import { WaitlistBanner } from '@/components/organisms/WaitlistBanner';
import { ROUTES } from '@/constants/routes';
import { getAvatarUrl } from '@/utils/fileHelpers';
import { UserTrustBadge } from '@/components/molecules/UserTrustBadge';
import { Button } from '@/components/ui/Button';
import { ReportEventModal } from '@/components/molecules/ReportEventModal';
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
  // New host-specific handlers
  onUploadMedia?: () => void;
  onEditEvent?: () => void;
  onCancelEvent?: () => void;
  onDeleteEvent?: () => void;
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
  onUploadMedia,
  onEditEvent,
  onCancelEvent,
  onDeleteEvent,
}: EventSidebarProps) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const { id, title, location, startTime, endTime, maxCapacity, currentRsvpCount, myRsvpStatus, host } = event;

  const actualStatus = myRsvp?.status || myRsvpStatus;

  return (
    <div className="lg:sticky lg:top-24">
      <Stack gap="md">
        <Paper
          withBorder
          p="xl"
          radius="xl"
          className="border-slate-200/80 dark:border-slate-700/60 relative overflow-hidden"
          style={{ background: 'var(--app-surface)' }}
        >
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
                {isFull && <Badge color="orange" size="xs" radius="md">Full</Badge>}
              </Group>
            </div>

            <Divider style={{ borderColor: 'var(--app-border)' }} />

            {/* ─── HOST DASHBOARD ─── */}
            {isHost ? (
              <Stack gap="sm">
                <Alert icon={<IconCrown size={16} />} color="brand" radius="lg" variant="light" title="Host Dashboard">
                  You are the host of this event.
                </Alert>

                <Button
                  fullWidth
                  variant="primary"
                  onClick={onUploadMedia}
                  leftSection={<IconPhotoPlus size={18} />}
                  className="min-h-[46px]"
                >
                  Manage Photos & Videos
                </Button>

                <Button
                  fullWidth
                  variant="secondary"
                  onClick={onEditEvent}
                  leftSection={<IconEdit size={18} />}
                  className="min-h-[46px]"
                >
                  Edit Event Details
                </Button>

                {!isCancelled && !isCompleted && (
                  <Group grow gap="xs">
                    <Button
                      variant="danger"
                      className="bg-red-50 text-red-600 hover:bg-red-100 border-none"
                      onClick={onCancelEvent}
                    >
                      Cancel Event
                    </Button>
                    <Button variant="ghost" color="red" onClick={onDeleteEvent}>
                      Delete
                    </Button>
                  </Group>
                )}
              </Stack>
            ) : !isCancelled && !isCompleted && isAuthenticated ? (
              <>
                {actualStatus === 'GOING' ? (
                  <Button
                    fullWidth
                    variant="danger"
                    onClick={onCancelRsvp}
                    isLoading={isCancelling}
                    className="min-h-[46px]"
                  >
                    Cancel registration
                  </Button>
                ) : actualStatus === 'WAITLISTED' ? (
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
              >
                Log in to register
              </Button>
            ) : null}

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

            <Group grow gap="xs">
              <Button
                variant="ghost"
                leftSection={<IconShare size={16} />}
                onClick={onShare}
                className="min-h-[44px]"
              >
                Share
              </Button>

              {!isHost && isAuthenticated && (
                <Button
                  variant="ghost"
                  color="gray"
                  leftSection={<IconFlag size={16} />}
                  onClick={() => setReportModalOpen(true)}
                  className="min-h-[44px]"
                >
                  Report
                </Button>
              )}
            </Group>
          </Stack>
        </Paper>

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
            <Link to={ROUTES.USER_PROFILE(host.id)} className="shrink-0 rounded-full">
              <Avatar
                src={host.profileImageUrl || getAvatarUrl(host.id) || undefined}
                size={52}
                radius="xl"
                className="transition-transform hover:scale-105"
              />
            </Link>
            <div className="min-w-0">
              <Text
                component={Link}
                to={ROUTES.USER_PROFILE(host.id)}
                fw={700}
                size="sm"
                className="truncate no-underline hover:text-brand-600 transition-colors"
                style={{ color: 'var(--app-text)' }}
              >
                {host.displayName}
              </Text>
              <UserTrustBadge trustLevel={host.trustLevel} size="xs" />
            </div>
          </Group>
        </Paper>
      </Stack>

      <ReportEventModal
        opened={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        eventId={id}
        eventTitle={title}
      />
    </div>
  );
}