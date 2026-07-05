// src/pages/Events/EventDetailPage/index.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Grid,
  Stack,
  Loader,
  Center,
  Alert,
  Paper,
  Text,
  Modal,
  Textarea,
  Group,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconAlertCircle,
  IconClock,
  IconEdit,
  IconTrash,
  IconAntennaBars5,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/api/eventsApi';
import { ROUTES } from '@/constants/routes';
import { useRsvp } from '@/hooks/useRsvp';
import { useAuthStore } from '@/stores/authStore';
import { useEventSse } from '@/hooks/useEventSse';
import { ReviewSection } from '@/components/organisms/ReviewSection';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { useAdmin } from '@/hooks/useAdmin';
import { EventHeader } from './EventHeader';
import { EventMedia } from './EventMedia';
import { EventSidebar } from './EventSidebar';

export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const { approveEvent, rejectEvent, flagEvent, deleteEvent } = useAdmin();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug || '');

  const { data: event, isLoading, error, refetch } = useQuery({
    queryKey: ['event', slug, isAuthenticated],
    queryFn: async () => {
      if (isUuid) {
        if (isAuthenticated) {
          const res = await eventsApi.getEventById(slug!);
          return res.data.data;
        } else {
          const res = await eventsApi.getPublicEventById(slug!);
          return res.data.data;
        }
      } else {
        if (isAuthenticated) {
          const res = await eventsApi.getEventBySlug(slug!);
          return res.data.data;
        } else {
          const res = await eventsApi.getPublicEventBySlug(slug!);
          return res.data.data;
        }
      }
    },
    enabled: !!slug,
  });

  useEventSse(event?.id);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [permanentDeleteModalOpen, setPermanentDeleteModalOpen] = useState(false);
  const [cancelRsvpModalOpen, setCancelRsvpModalOpen] = useState(false);
  const [cancelRsvpReason, setCancelRsvpReason] = useState('');

  const { createRsvp, cancelRsvp, isCreating, isCancelling, useMyRsvpForEvent } = useRsvp(event?.id);
  const { data: myRsvp } = useMyRsvpForEvent(event?.id || '');

  const isActuallyHost = event?.isHost || (user?.id && event?.host?.id === user.id) || false;

  const hash = location.hash;
  useEffect(() => {
    if (hash === '#reviews' && !isLoading && event) {
      setTimeout(() => {
        document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [hash, isLoading, event]);

  // --- Existing mutations ---
  
  // ✅ NEW: Added publish mutation for Draft events
  const publishMutation = useMutation({
    mutationFn: (id: string) => eventsApi.publishEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['event', slug] });
      await queryClient.invalidateQueries({ queryKey: ['my-events'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      notifications.show({
        title: 'Event published!',
        message: 'Your event is now live.',
        color: 'green',
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      eventsApi.cancelEvent(id, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['event', slug] });
      await queryClient.invalidateQueries({ queryKey: ['my-events'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      setCancelModalOpen(false);
      setCancelReason('');
      notifications.show({
        title: 'Event cancelled',
        message: 'Attendees have been notified.',
        color: 'orange',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.softDeleteEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-events'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      await queryClient.invalidateQueries({ queryKey: ['event', slug] });
      notifications.show({
        title: 'Moved to trash',
        message: 'You can restore it later from My Events.',
        color: 'gray',
      });
      navigate(ROUTES.MY_EVENTS);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => eventsApi.restoreEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-events'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      await queryClient.invalidateQueries({ queryKey: ['event', slug] });
      notifications.show({
        title: 'Event restored',
        message: 'Your event is back in action.',
        color: 'green',
      });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.permanentDelete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-events'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      await queryClient.invalidateQueries({ queryKey: ['event', slug] });
      notifications.show({
        title: 'Event deleted forever',
        message: 'The event has been permanently removed.',
        color: 'gray',
      });
      navigate(ROUTES.MY_EVENTS);
    },
  });

  // --- Admin mutations ---
  const adminApproveMutation = useMutation({
    mutationFn: (id: string) => approveEvent(id),
    onSuccess: async () => {
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      notifications.show({ title: 'Approved', message: 'Event published.', color: 'green' });
    },
  });

  const adminRejectMutation = useMutation({
    mutationFn: (id: string) => rejectEvent({ id }),
    onSuccess: async () => {
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      notifications.show({ title: 'Rejected', message: 'Event rejected.', color: 'orange' });
    },
  });

  const adminFlagMutation = useMutation({
    mutationFn: (id: string) => flagEvent(id),
    onSuccess: async () => {
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      notifications.show({ title: 'Flagged', message: 'Event moved to under review.', color: 'yellow' });
    },
  });

  const adminPermanentDeleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: async () => {
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      notifications.show({ title: 'Deleted', message: 'Event permanently removed.', color: 'red' });
      navigate(ROUTES.ADMIN_EVENTS);
    },
  });

  const handleShare = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        notifications.show({
          title: 'Link copied!',
          message: 'Event link copied to your clipboard.',
          color: 'green',
        });
      })
      .catch(() => {
        notifications.show({
          title: 'Error',
          message: 'Failed to copy link.',
          color: 'red',
        });
      });
  };

  if (isLoading) {
    return (
      <Center h="60vh">
        <Loader size="xl" color="brand" />
      </Center>
    );
  }

  if (error || !event) {
    return (
      <PageContainer size="md">
        <Alert
          icon={<IconAlertCircle size={18} />}
          color="red"
          radius="lg"
          title="Event not found"
          style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
        >
          <Text style={{ color: 'var(--app-text-secondary)' }}>
            The event you're looking for doesn't exist or has been removed.
          </Text>
        </Alert>
      </PageContainer>
    );
  }

  const { id, title, description, host, maxCapacity, currentRsvpCount, status, media, startTime, endTime } = event;

  const isCancelled = status === 'CANCELLED';
  const isFull = currentRsvpCount >= maxCapacity;

  const hasStarted = new Date(startTime).getTime() <= Date.now();
  const isEnded = new Date(endTime).getTime() <= Date.now();
  const isLive = hasStarted && !isEnded && status === 'PUBLISHED';

  const canReview = isEnded && myRsvp?.status === 'ATTENDED' && !isActuallyHost;

  const handleRsvp = () => createRsvp();
  const handleCancelRsvp = () => {
    if (!myRsvp) return;
    cancelRsvp({ rsvpId: myRsvp.id, reason: cancelRsvpReason || undefined });
    setCancelRsvpModalOpen(false);
    setCancelRsvpReason('');
  };

  // ─── Back button logic ──────────────────────────────────────────────
  let backRoute: string = ROUTES.EVENTS;
  let backLabel = 'Back to events';
  if (isActuallyHost) {
    backRoute = ROUTES.MY_EVENTS;
    backLabel = 'Back to my events';
  } else if (isAdmin) {
    backRoute = ROUTES.ADMIN_EVENTS;
    backLabel = 'Back to event list';
  }

  return (
    <PageContainer size="lg">
      <Link
        to={backRoute}
        className="inline-flex items-center gap-1 px-0 mb-4 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 no-underline transition-colors"
      >
        <IconArrowLeft size={16} className="mr-1.5" />
        {backLabel}
      </Link>

      {isLive && (
        <Alert
          icon={<IconAntennaBars5 size={20} className="animate-pulse" />}
          color="blue"
          radius="md"
          mb="xl"
          title={<Text fw={700} className="text-blue-700 dark:text-blue-300">Live Now</Text>}
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            borderWidth: 1,
          }}
        >
          <Text size="sm" className="text-blue-800 dark:text-blue-200">
            This event is currently taking place. Check-ins are open!
          </Text>
        </Alert>
      )}

      {isActuallyHost && event.deleted && (
        <Alert
          icon={<IconTrash size={18} />}
          color="red"
          radius="md"
          mb="xl"
          title="Event is in the Trash Bin"
          style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
        >
          This event is hidden from the public. You can restore it or permanently delete it using
          your Host Dashboard.
        </Alert>
      )}

      {isActuallyHost && !event.deleted && status === 'UNDER_REVIEW' && (
        <Alert
          icon={<IconClock size={18} />}
          color="yellow"
          radius="md"
          mb="xl"
          title="Pending Admin Approval"
          style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
        >
          This event is currently under review by the university administration. It will
          automatically go live once approved.
        </Alert>
      )}

      {isActuallyHost && !event.deleted && status === 'DRAFT' && (
        <Alert
          icon={<IconEdit size={18} />}
          color="gray"
          radius="md"
          mb="xl"
          title="Draft Event"
          style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
        >
          This event is not published yet. You can continue editing and publish it from your Host
          Dashboard when ready.
        </Alert>
      )}

      <Grid gap="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="xl">
            <EventHeader event={event} />
            <EventMedia media={media || []} title={title} />

            {description && (
              <Paper
                withBorder
                p="xl"
                radius="xl"
                className="border-slate-200/80 dark:border-slate-700/60"
                style={{ background: 'var(--app-surface)' }}
              >
                <Text
                  fw={700}
                  size="sm"
                  mb="sm"
                  className="uppercase tracking-wider"
                  style={{ color: 'var(--app-text-muted)' }}
                >
                  About this event
                </Text>
                <Text
                  className="leading-relaxed whitespace-pre-wrap"
                  style={{ color: 'var(--app-text-secondary)' }}
                >
                  {description}
                </Text>
              </Paper>
            )}

            <div id="reviews" className="scroll-mt-24">
              <Title order={2} size="h3" mb="md" style={{ color: 'var(--app-text)' }}>
                Reviews
              </Title>
              <ReviewSection
                eventId={id}
                hostId={host.id}
                canReview={canReview}
                onReviewSubmitted={() => {
                  queryClient.invalidateQueries({ queryKey: ['event', slug] });
                }}
              />
            </div>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <EventSidebar
            event={event}
            myRsvp={myRsvp}
            isHost={isActuallyHost}
            isAdmin={isAdmin}
            isAuthenticated={isAuthenticated}
            isFull={isFull}
            isCancelled={isCancelled}
            isCompleted={isEnded && !isCancelled}
            cancellationReason={event.cancellationReason || undefined}
            onRsvp={handleRsvp}
            onCancelRsvp={() => setCancelRsvpModalOpen(true)}
            onShare={handleShare}
            isCreating={isCreating}
            isCancelling={isCancelling}
            onManageCheckIns={() => navigate(ROUTES.HOST_CHECKIN(id))}
            onUploadMedia={() => navigate(ROUTES.EDIT_EVENT(id))}
            onEditEvent={() => navigate(ROUTES.EDIT_EVENT(id))}
            onCancelEvent={() => setCancelModalOpen(true)}
            onDeleteEvent={() => setDeleteModalOpen(true)}
            onRestoreEvent={() => restoreMutation.mutate(id)}
            onPermanentDeleteEvent={() => setPermanentDeleteModalOpen(true)}
            // ✅ NEW: Added the publish props
            onPublishEvent={() => publishMutation.mutate(id)}
            isPublishing={publishMutation.isPending}
            onAttendeeCheckIn={() => navigate(ROUTES.ATTENDEE_CHECKIN(id))}
            onApproveEvent={() => adminApproveMutation.mutate(id)}
            onRejectEvent={() => adminRejectMutation.mutate(id)}
            onFlagEvent={() => adminFlagMutation.mutate(id)}
            onAdminPermanentDelete={() => adminPermanentDeleteMutation.mutate(id)}
          />
        </Grid.Col>
      </Grid>

      {/* ─── MODALS ─── */}

      <Modal
        opened={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title={<Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>Cancel event</Text>}
        centered
        radius="xl"
        styles={{
          content: { background: 'var(--app-surface)' },
          header: { background: 'var(--app-surface)', borderBottom: '1px solid var(--app-border)' },
        }}
      >
        <Stack>
          <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
            Are you sure you want to cancel this event? All attendees will be notified.
          </Text>
          <Textarea
            label="Reason (optional)"
            placeholder="Why are you cancelling?"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.currentTarget.value)}
            maxLength={500}
            autosize
            minRows={2}
            radius="md"
            styles={{
              label: { color: 'var(--app-text)' },
              input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
            }}
          />
          <Group justify="flex-end">
            <Button variant="ghost" onClick={() => setCancelModalOpen(false)} radius="md">
              No, keep it
            </Button>
            <Button
              variant="danger"
              isLoading={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate({ id, reason: cancelReason })}
              radius="md"
            >
              Yes, cancel event
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={<Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>Move to trash</Text>}
        centered
        radius="xl"
        styles={{
          content: { background: 'var(--app-surface)' },
          header: { background: 'var(--app-surface)', borderBottom: '1px solid var(--app-border)' },
        }}
      >
        <Stack>
          <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
            This will move the event to your trash. You can restore it later from My Events.
          </Text>
          <Group justify="flex-end">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} radius="md">
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(id)}
              radius="md"
            >
              Move to trash
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={permanentDeleteModalOpen}
        onClose={() => setPermanentDeleteModalOpen(false)}
        title={<Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>Delete forever</Text>}
        centered
        radius="xl"
        styles={{
          content: { background: 'var(--app-surface)' },
          header: { background: 'var(--app-surface)', borderBottom: '1px solid var(--app-border)' },
        }}
      >
        <Stack>
          <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
            Are you sure? This action cannot be undone. All photos, RSVPs, and reviews will be
            permanently wiped.
          </Text>
          <Group justify="flex-end">
            <Button variant="ghost" onClick={() => setPermanentDeleteModalOpen(false)} radius="md">
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={permanentDeleteMutation.isPending}
              onClick={() => permanentDeleteMutation.mutate(id)}
              radius="md"
            >
              Delete forever
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={cancelRsvpModalOpen}
        onClose={() => {
          setCancelRsvpModalOpen(false);
          setCancelRsvpReason('');
        }}
        title={<Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>Cancel registration</Text>}
        centered
        radius="xl"
        styles={{
          content: { background: 'var(--app-surface)' },
          header: { background: 'var(--app-surface)', borderBottom: '1px solid var(--app-border)' },
        }}
      >
        <Stack>
          <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
            Are you sure you want to cancel your registration for this event?
          </Text>
          <Textarea
            label="Reason (optional)"
            placeholder="Why are you cancelling?"
            value={cancelRsvpReason}
            onChange={(e) => setCancelRsvpReason(e.currentTarget.value)}
            maxLength={500}
            autosize
            minRows={2}
            radius="md"
            styles={{
              label: { color: 'var(--app-text)' },
              input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
            }}
          />
          <Group justify="flex-end">
            <Button variant="ghost" onClick={() => setCancelRsvpModalOpen(false)} radius="md">
              No, keep my spot
            </Button>
            <Button
              variant="danger"
              isLoading={isCancelling}
              onClick={handleCancelRsvp}
              radius="md"
            >
              Yes, cancel registration
            </Button>
          </Group>
        </Stack>
      </Modal>
    </PageContainer>
  );
}