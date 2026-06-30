import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Grid, Stack, Button, Loader, Center, Alert, Paper, Text, Modal, Textarea, Group } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/api/eventsApi';
import { ROUTES } from '@/constants/routes';
import { useRsvp } from '@/hooks/useRsvp';
import { useAuthStore } from '@/stores/authStore';
import { useEventSse } from '@/hooks/useEventSse';
import { ReviewSection } from '@/components/organisms/ReviewSection';
import { EventHeader } from './EventHeader';
import { EventMedia } from './EventMedia';
import { EventSidebar } from './EventSidebar';

export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => {
      if (isAuthenticated) {
        return eventsApi.getEventBySlug(slug!).then((res) => res.data.data);
      } else {
        return eventsApi.getPublicEventBySlug(slug!).then((res) => res.data.data);
      }
    },
    enabled: !!slug,
  });

  useEventSse(event?.id);

  // Modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cancelRsvpModalOpen, setCancelRsvpModalOpen] = useState(false);
  const [cancelRsvpReason, setCancelRsvpReason] = useState('');

  const { createRsvp, cancelRsvp, isCreating, isCancelling, useMyRsvpForEvent } = useRsvp(event?.id);
  const { data: myRsvp } = useMyRsvpForEvent(event?.id || '');

  // Cancel event mutation
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      eventsApi.cancelEvent(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', slug] });
      setCancelModalOpen(false);
      setCancelReason('');
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.softDeleteEvent(id),
    onSuccess: () => navigate(ROUTES.MY_EVENTS),
  });

  if (isLoading) {
    return (
      <Center h="50vh">
        <Loader size="xl" />
      </Center>
    );
  }

  if (error || !event) {
    return (
      <Container py="xl">
        <Alert color="red" title="Event not found">
          The event you're looking for doesn't exist or has been removed.
        </Alert>
      </Container>
    );
  }

  const {
    id,
    title,
    description,
    host,
    maxCapacity,
    currentRsvpCount,
    status,
    media,
  } = event;

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
  const handleShare = () => navigator.clipboard.writeText(window.location.href);

  return (
    <Container size="lg" py="xl">
      <Button component={Link} to="/events" variant="subtle" leftSection={<IconArrowLeft size={16} />} mb="md" radius="md">
        Back to events
      </Button>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            <EventHeader event={event} />
            <EventMedia media={media || []} title={title} />

            {description && (
              <Paper withBorder p="md" radius="lg">
                <Text>{description}</Text>
              </Paper>
            )}

            <ReviewSection
              eventId={id}
              hostId={host.id}
              canReview={canReview}
              onReviewSubmitted={() => {
                queryClient.invalidateQueries({ queryKey: ['event', slug] });
              }}
            />
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
      <Modal opened={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Cancel Event" centered radius="xl">
        <Stack>
          <Text size="sm">Are you sure you want to cancel this event? All attendees will be notified.</Text>
          <Textarea
            label="Reason (optional)"
            placeholder="Why are you cancelling?"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.currentTarget.value)}
            maxLength={500}
            autosize
            minRows={2}
            radius="md"
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCancelModalOpen(false)} radius="md">No, keep it</Button>
            <Button color="orange" loading={cancelMutation.isPending} onClick={() => cancelMutation.mutate({ id, reason: cancelReason })} radius="md">Yes, cancel event</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Event Modal */}
      <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Move to Trash" centered radius="xl">
        <Stack>
          <Text size="sm">This will move the event to your trash. You can restore it later from My Events.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteModalOpen(false)} radius="md">Cancel</Button>
            <Button color="red" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(id)} radius="md">Move to Trash</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Cancel RSVP Modal */}
      <Modal opened={cancelRsvpModalOpen} onClose={() => { setCancelRsvpModalOpen(false); setCancelRsvpReason(''); }} title="Cancel Registration" centered radius="xl">
        <Stack>
          <Text size="sm">Are you sure you want to cancel your registration for this event?</Text>
          <Textarea
            label="Reason (optional)"
            placeholder="Why are you cancelling?"
            value={cancelRsvpReason}
            onChange={(e) => setCancelRsvpReason(e.currentTarget.value)}
            maxLength={500}
            autosize
            minRows={2}
            radius="md"
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCancelRsvpModalOpen(false)} radius="md">No, keep my spot</Button>
            <Button color="red" loading={isCancelling} onClick={handleCancelRsvp} radius="md">Yes, cancel registration</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}