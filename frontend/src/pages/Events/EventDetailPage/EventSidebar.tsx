// src/pages/Events/EventDetailPage/EventSidebar.tsx
import { useState } from 'react';
import { Stack, Paper, Group, ThemeIcon, Text, Divider, Alert, Badge, Avatar, Tooltip } from '@mantine/core';
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
  IconTrash,
  IconRestore,
  IconTrashX,
  IconQrcode,
  IconLock,
  IconCheck,
  IconShield,
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
  isAdmin: boolean;
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
  // Host actions
  onManageCheckIns?: () => void;
  onUploadMedia?: () => void;
  onEditEvent?: () => void;
  onCancelEvent?: () => void;
  onDeleteEvent?: () => void;
  onPublishEvent?: () => void;
  isPublishing?: boolean;
  // Trash actions
  onRestoreEvent?: () => void;
  onPermanentDeleteEvent?: () => void;
  // Attendee actions
  onAttendeeCheckIn?: () => void;
  // Admin actions
  onApproveEvent?: () => void;
  onRejectEvent?: () => void;
  onFlagEvent?: () => void;
  onAdminPermanentDelete?: () => void;
}

export function EventSidebar({
  event,
  myRsvp,
  isHost,
  isAdmin,
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
  onManageCheckIns,
  onUploadMedia,
  onEditEvent,
  onCancelEvent,
  onDeleteEvent,
  onPublishEvent,
  isPublishing,
  onRestoreEvent,
  onPermanentDeleteEvent,
  onAttendeeCheckIn,
  onApproveEvent,
  onRejectEvent,
  onFlagEvent,
  onAdminPermanentDelete,
}: EventSidebarProps) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const { id, title, location, startTime, endTime, maxCapacity, currentRsvpCount, myRsvpStatus, host, status } = event;

  const actualStatus = myRsvp?.status || myRsvpStatus;
  const isShareable = !event.deleted && event.status !== 'DRAFT' && event.status !== 'UNDER_REVIEW';
  
  const hasStarted = new Date(startTime).getTime() <= Date.now();
  const isEnded = new Date(endTime).getTime() <= Date.now();
  const isLive = hasStarted && !isEnded && event.status === 'PUBLISHED';

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
                {event.deleted ? (
                  // Trash view
                  <>
                    <Alert
                      icon={<IconTrash size={16} />}
                      color="red"
                      radius="lg"
                      variant="light"
                      title="Event in Trash"
                    >
                      This event is currently in your trash bin. Attendees cannot see it.
                    </Alert>

                    <Button
                      fullWidth
                      variant="primary"
                      onClick={onRestoreEvent}
                      leftSection={<IconRestore size={18} />}
                      className="min-h-[46px]"
                    >
                      Restore Event
                    </Button>

                    <Button
                      fullWidth
                      variant="ghost"
                      color="red"
                      onClick={onPermanentDeleteEvent}
                      leftSection={<IconTrashX size={18} />}
                      className="min-h-[46px]"
                    >
                      Delete Forever
                    </Button>
                  </>
                ) : (
                  // Live host controls
                  <>
                    <Alert
                      icon={<IconCrown size={16} />}
                      color="brand"
                      radius="lg"
                      variant="light"
                      title="Host Dashboard"
                    >
                      You are the host of this event.
                    </Alert>
                    
                    {/* Publish Button for DRAFTS */}
                    {status === 'DRAFT' && (
                      <Button
                        fullWidth
                        variant="primary"
                        onClick={onPublishEvent}
                        isLoading={isPublishing}
                        leftSection={<IconCheck size={18} />}
                        className="min-h-[46px] bg-green-600 hover:bg-green-700 text-white border-none shadow-md mb-2"
                      >
                        Publish Event
                      </Button>
                    )}

                    {!isCancelled && (status === 'PUBLISHED' || status === 'COMPLETED') && (
                      <Button
                        fullWidth
                        variant="primary"
                        onClick={onManageCheckIns}
                        leftSection={<IconQrcode size={18} />}
                        className="min-h-[46px] shadow-md hover:shadow-lg transition-all"
                      >
                        {status === 'COMPLETED' ? 'View Attendees' : 'Manage Check-ins (QR)'}
                      </Button>
                    )}

                    <Button
                      fullWidth
                      variant="secondary"
                      onClick={onUploadMedia}
                      leftSection={<IconPhotoPlus size={18} />}
                      className="min-h-[46px]"
                    >
                      Manage Photos & Videos
                    </Button>

                    {status === 'UNDER_REVIEW' ? (
                      <Tooltip label="You cannot edit an event while it is under administrative review.">
                        <div>
                          <Button fullWidth variant="secondary" disabled leftSection={<IconLock size={18} />} className="min-h-[46px]">
                            Editing Locked
                          </Button>
                        </div>
                      </Tooltip>
                    ) : !hasStarted ? (
                      <Button fullWidth variant="secondary" onClick={onEditEvent} leftSection={<IconEdit size={18} />} className="min-h-[46px]">
                        Edit Event Details
                      </Button>
                    ) : (
                      <Tooltip label="You cannot edit details of an event that has already started.">
                        <div>
                          <Button fullWidth variant="secondary" disabled leftSection={<IconLock size={18} />} className="min-h-[46px]">
                            Editing Locked
                          </Button>
                        </div>
                      </Tooltip>
                    )}

                    {!isCancelled && !isCompleted && (
                      <Group grow gap="xs">
                        {status === 'PUBLISHED' && !hasStarted && (
                          <Button
                            variant="danger"
                            className="bg-red-50 text-red-600 hover:bg-red-100 border-none"
                            onClick={onCancelEvent}
                          >
                            Cancel Event
                          </Button>
                        )}
                        {!isLive && (
                          <Button variant="ghost" color="red" onClick={onDeleteEvent}>
                            Move to Trash
                          </Button>
                        )}
                      </Group>
                    )}
                  </>
                )}
              </Stack>
            ) : null}

            {/* ─── ADMIN CONTROLS ─── */}
            {isAdmin && !isHost && (
              <Stack gap="sm">
                <Alert
                  icon={<IconShield size={16} />}
                  color="blue"
                  radius="lg"
                  variant="light"
                  title="Admin View"
                >
                  You are viewing this event as an administrator.
                </Alert>

                {event.deleted ? (
                  <Button
                    fullWidth
                    variant="danger"
                    onClick={onAdminPermanentDelete}
                    leftSection={<IconTrashX size={18} />}
                  >
                    Permanently Delete
                  </Button>
                ) : (
                  <>
                    {status === 'UNDER_REVIEW' && (
                      <Group grow>
                        <Button variant="primary" onClick={onApproveEvent}>
                          Approve
                        </Button>
                        <Button variant="danger" onClick={onRejectEvent}>
                          Reject
                        </Button>
                      </Group>
                    )}

                    {(status === 'PUBLISHED' || status === 'COMPLETED') && (
                      <Button
                        variant="secondary"
                        color="orange"
                        onClick={onFlagEvent}
                        leftSection={<IconFlag size={18} />}
                      >
                        Flag Event (Move to Review)
                      </Button>
                    )}

                    {status !== 'DRAFT' && status !== 'UNDER_REVIEW' && (
                      <Button
                        variant="danger"
                        onClick={onAdminPermanentDelete}
                        leftSection={<IconTrashX size={18} />}
                      >
                        Permanently Delete
                      </Button>
                    )}
                  </>
                )}
              </Stack>
            )}

            {/* ─── ATTENDEE UI ─── */}
            {!isHost && !isAdmin && !isCancelled && !isCompleted && isAuthenticated && (
              <>
                {actualStatus === 'ATTENDED' ? (
                  <Alert
                    icon={<IconCheck size={20} />}
                    color="green"
                    radius="lg"
                    variant="light"
                    style={{
                      background: 'rgba(34, 197, 94, 0.12)',
                      borderColor: 'rgba(34, 197, 94, 0.3)',
                      borderWidth: 1,
                    }}
                  >
                    <Text fw={700} className="text-green-800 dark:text-green-300">
                      Checked In!
                    </Text>
                    <Text size="sm" className="text-green-700 dark:text-green-400 mt-0.5">
                      You have successfully checked in to this event.
                    </Text>
                  </Alert>
                ) : actualStatus === 'GOING' ? (
                  <Stack gap="sm">
                    {isLive && onAttendeeCheckIn ? (
                      <Button
                        fullWidth
                        variant="primary"
                        onClick={onAttendeeCheckIn}
                        leftSection={<IconQrcode size={18} />}
                        className="min-h-[46px] bg-green-600 hover:bg-green-700 text-white border-none shadow-md"
                      >
                        Check In Now
                      </Button>
                    ) : null}
                    {hasStarted ? (
                      <Tooltip label="You cannot cancel your registration after the event has started.">
                        <div>
                          <Button
                            fullWidth
                            variant="secondary"
                            disabled
                            className="min-h-[46px]"
                            leftSection={<IconLock size={16} />}
                          >
                            Registration Locked
                          </Button>
                        </div>
                      </Tooltip>
                    ) : (
                      <Button
                        fullWidth
                        variant="danger"
                        onClick={onCancelRsvp}
                        isLoading={isCancelling}
                        className="min-h-[46px]"
                      >
                        Cancel registration
                      </Button>
                    )}
                  </Stack>
                ) : actualStatus === 'WAITLISTED' ? (
                  <Stack gap="sm">
                    <Button 
                      fullWidth 
                      variant="secondary" 
                      disabled 
                      className="min-h-[46px]"
                      style={{ opacity: 1, color: 'var(--app-text)', backgroundColor: 'var(--app-bg)' }}
                    >
                      You're on the waitlist
                    </Button>
                    {myRsvp && <WaitlistBanner eventId={id} rsvpId={myRsvp.id} />}

                    {!hasStarted && (
                      <Button
                        fullWidth
                        variant="danger"
                        onClick={onCancelRsvp}
                        isLoading={isCancelling}
                        className="min-h-[46px]"
                      >
                        Leave waitlist
                      </Button>
                    )}
                  </Stack>
                ) : (
                  // ─── NOT REGISTERED ───
                  (() => {
                    if (status === 'UNDER_REVIEW') {
                      return (
                        <Alert color="orange" radius="md" title="Event Suspended">
                          Registration is temporarily paused while this event is under administrative review.
                        </Alert>
                      );
                    }
                    if (isLive && !isFull) {
                      return (
                        <Button fullWidth variant="primary" onClick={onRsvp} isLoading={isCreating} className="min-h-[46px]">
                          Join Now
                        </Button>
                      );
                    }
                    if (isLive && isFull) {
                      return (
                        <Button fullWidth variant="secondary" disabled className="min-h-[46px]" style={{ opacity: 0.7 }}>
                          Event Full
                        </Button>
                      );
                    }
                    if (!hasStarted && status === 'PUBLISHED') {
                      return (
                        <Button fullWidth variant="primary" onClick={onRsvp} isLoading={isCreating} className="min-h-[46px]">
                          {isFull ? 'Join Waitlist' : 'Register now'}
                        </Button>
                      );
                    }
                    return null;
                  })()
                )}
              </>
            )}

            {!isHost && !isAdmin && !isAuthenticated && !isCancelled && !isCompleted && !hasStarted && (
              <Button
                fullWidth
                component={Link}
                to={ROUTES.LOGIN}
                variant="secondary"
                className="min-h-[46px]"
              >
                Log in to register
              </Button>
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

            {/* ─── SHARE & REPORT ─── */}
            {isShareable && (
              <Group grow gap="xs">
                <Button
                  variant="ghost"
                  leftSection={<IconShare size={16} />}
                  onClick={onShare}
                  className="min-h-[44px]"
                >
                  Share
                </Button>

                {!isHost && !isAdmin && isAuthenticated && (
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
            )}
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