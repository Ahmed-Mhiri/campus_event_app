// src/pages/Events/EventDetailPage/index.tsx
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import { IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/api/eventsApi';
import { ROUTES } from '@/constants/routes';
import { useRsvp } from '@/hooks/useRsvp';
import { useAuthStore } from '@/stores/authStore';
import { useEventSse } from '@/hooks/useEventSse';
import { ReviewSection } from '@/components/organisms/ReviewSection';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { EventHeader } from './EventHeader';
import { EventMedia } from './EventMedia';
import { EventSidebar } from './EventSidebar';

export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  // ✅ Detect if the URL parameter is a UUID (from search bar) or a text slug (from cards)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug || '');

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', slug, isAuthenticated],
    queryFn: async () => {
      if (isUuid) {
        // Fetch by UUID
        if (isAuthenticated) {
          const res = await eventsApi.getEventById(slug!);
          return res.data.data;
        } else {
          const res = await eventsApi.getPublicEventById(slug!);
          return res.data.data;
        }
      } else {
        // Fetch by slug
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
  const [cancelRsvpModalOpen, setCancelRsvpModalOpen] = useState(false);
  const [cancelRsvpReason, setCancelRsvpReason] = useState('');

  const { createRsvp, cancelRsvp, isCreating, isCancelling, useMyRsvpForEvent } = useRsvp(event?.id);
  const { data: myRsvp } = useMyRsvpForEvent(event?.id || '');

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      eventsApi.cancelEvent(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', slug] });
      setCancelModalOpen(false);
      setCancelReason('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.softDeleteEvent(id),
    onSuccess: () => navigate(ROUTES.MY_EVENTS),
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
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

  const { id, title, description, host, maxCapacity, currentRsvpCount, status, media } = event;

  const isCancelled = status === 'CANCELLED';
  const isCompleted = status === 'COMPLETED';
  const isFull = currentRsvpCount >= maxCapacity;
  const canReview = isCompleted && myRsvp?.status === 'ATTENDED' && !event.isHost;

  const handleRsvp = () => createRsvp();
  const handleCancelRsvp = () => {
    if (!myRsvp) return;
    cancelRsvp({ rsvpId: myRsvp.id, reason: cancelRsvpReason || undefined });
    setCancelRsvpModalOpen(false);
    setCancelRsvpReason('');
  };

  return (
    <PageContainer size="lg">
      <Button
        component={Link}
        to={ROUTES.EVENTS}
        variant="ghost"
        size="sm"
        className="px-0 mb-4"
        aria-label="Back to events"
      >
        <IconArrowLeft size={16} className="mr-1.5" />
        Back to events
      </Button>

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
                <Text className="leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--app-text-secondary)' }}>
                  {description}
                </Text>
              </Paper>
            )}

            <div>
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
            isHost={event.isHost}
            isAuthenticated={isAuthenticated}
            isFull={isFull}
            isCancelled={isCancelled}
            isCompleted={isCompleted}
            cancellationReason={event.cancellationReason || undefined}
            onRsvp={handleRsvp}
            onCancelRsvp={() => setCancelRsvpModalOpen(true)}
            onShare={handleShare}
            isCreating={isCreating}
            isCancelling={isCancelling}
          />
        </Grid.Col>
      </Grid>

      {/* Cancel Event Modal */}
      <Modal
        opened={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title={
          <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>
            Cancel event
          </Text>
        }
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

      {/* Delete Event Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={
          <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>
            Move to trash
          </Text>
        }
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

      {/* Cancel RSVP Modal */}
      <Modal
        opened={cancelRsvpModalOpen}
        onClose={() => {
          setCancelRsvpModalOpen(false);
          setCancelRsvpReason('');
        }}
        title={
          <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>
            Cancel registration
          </Text>
        }
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
            <Button variant="danger" isLoading={isCancelling} onClick={handleCancelRsvp} radius="md">
              Yes, cancel registration
            </Button>
          </Group>
        </Stack>
      </Modal>
    </PageContainer>
  );
}