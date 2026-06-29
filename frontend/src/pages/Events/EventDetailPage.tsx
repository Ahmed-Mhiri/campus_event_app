// src/pages/Events/EventDetailPage.tsx
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Stack,
  Title,
  Text,
  Badge,
  Group,
  Avatar,
  Box,
  Button,
  Divider,
  Loader,
  Center,
  Alert,
  Image,
  Paper,
  SimpleGrid,
  Menu,
  Modal,
  Textarea,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import {
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconEye,
  IconEdit,
  IconTrash,
  IconArrowLeft,
  IconQrcode,
  IconDots,
  IconX,
  IconFlag, // ✅ added for report
} from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEvent } from '@/hooks/useEvents';
import { useRsvp } from '@/hooks/useRsvp';
import { eventsApi } from '@/api/eventsApi';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/dateFormatter';
import { getAvatarUrl } from '@/utils/fileHelpers';
import { UserTrustBadge } from '@/components/molecules/UserTrustBadge/UserTrustBadge';
import { CapacityBar } from '@/components/molecules/CapacityBar/CapacityBar';
import { ReviewSection } from '@/components/organisms/ReviewSection/ReviewSection';
import { WaitlistBanner } from '@/components/organisms/WaitlistBanner/WaitlistBanner';
import { ReportEventModal } from '@/components/molecules/ReportEventModal/ReportEventModal'; // ✅ import

export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: event, isLoading, error } = useEvent(slug!, true);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false); // ✅ report modal state

  // RSVP state and hooks
  const { createRsvp, cancelRsvp, isCreating, isCancelling, useMyRsvpForEvent } = useRsvp(event?.id);
  const { data: myRsvp } = useMyRsvpForEvent(event?.id || '');
  const [cancelRsvpModalOpen, setCancelRsvpModalOpen] = useState(false);
  const [cancelRsvpReason, setCancelRsvpReason] = useState('');

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
    onSuccess: () => {
      navigate(ROUTES.MY_EVENTS);
    },
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
    location,
    startTime,
    endTime,
    host,
    maxCapacity,
    currentRsvpCount,
    status,
    categories,
    media,
    viewCount,
    isHost,
    myRsvpStatus,
    cancellationReason,
  } = event;

  const isCancelled = status === 'CANCELLED';
  const isCompleted = status === 'COMPLETED';
  const isFull = currentRsvpCount >= maxCapacity;

  // Determine if user can review
  const canReview = isCompleted && myRsvp?.status === 'ATTENDED' && !isHost;

  const coverImage = media?.find((m) => m.displayOrder === 0)?.url || media?.[0]?.url;
  const images = media?.filter((m) => m.mediaType === 'IMAGE') || [];
  const videos = media?.filter((m) => m.mediaType === 'VIDEO') || [];

  // Fix avatar src: ensure it's string | null | undefined
  const hostAvatarSrc = host.profileImageUrl || getAvatarUrl(host.id) || undefined;

  const handleCancelRsvp = () => {
    if (!myRsvp) return;
    cancelRsvp({ rsvpId: myRsvp.id, reason: cancelRsvpReason || undefined });
    setCancelRsvpModalOpen(false);
    setCancelRsvpReason('');
  };

  return (
    <Container size="lg" py="xl">
      <Button
        component={Link}
        to="/events"
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        mb="md"
      >
        Back to events
      </Button>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            {/* Header */}
            <Group justify="space-between">
              <Stack gap={4}>
                <Group gap="xs">
                  <Title order={1}>{title}</Title>
                  {isCancelled && <Badge color="red">Cancelled</Badge>}
                  {isCompleted && <Badge color="gray">Completed</Badge>}
                  {status === 'UNDER_REVIEW' && <Badge color="yellow">Under Review</Badge>}
                  {status === 'DRAFT' && <Badge color="gray">Draft</Badge>}
                </Group>
                <Group gap="xs">
                  {categories.map((cat) => (
                    <Badge key={cat.id} color={cat.color || 'gray'} variant="light">
                      {cat.name}
                    </Badge>
                  ))}
                </Group>
              </Stack>
              <Group gap={4}>
                <IconEye size={16} />
                <Text size="sm" c="dimmed">{viewCount}</Text>
              </Group>
            </Group>

            {/* Host Info */}
            <Paper withBorder p="md" radius="md">
              <Group gap="md">
                <Avatar
                  src={hostAvatarSrc!= null ? String(hostAvatarSrc) : undefined}
                  size={56}
                  radius="xl"
                  alt={host.displayName}
                />
                <div style={{ flex: 1 }}>
                  <Group gap="xs">
                    <Text fw={600} size="lg">{host.displayName}</Text>
                    <UserTrustBadge trustLevel={host.trustLevel} />
                  </Group>
                  <Group gap="sm">
                    <Text size="sm" c="dimmed">
                      ⭐ {host.averageHostRating > 0 ? host.averageHostRating.toFixed(1) : 'No reviews yet'}
                    </Text>
                    <Text size="sm" c="dimmed">
                      • {host.completedEventsWithReviews} events hosted
                    </Text>
                  </Group>
                </div>
                <Group gap="xs">
                  {!isHost && !isCancelled && (
                    <Button
                      variant="subtle"
                      color="red"
                      size="xs"
                      leftSection={<IconFlag size={14} />}
                      onClick={() => setReportModalOpen(true)}
                    >
                      Report
                    </Button>
                  )}
                  {isHost && (
                    <Menu position="bottom-end" withinPortal>
                      <Menu.Target>
                        <Button variant="light" size="xs" leftSection={<IconDots size={14} />}>
                          Actions
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          component={Link}
                          to={`/events/edit/${id}`}
                          leftSection={<IconEdit size={14} />}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          component={Link}
                          to={`/check-in/host/${id}`}
                          leftSection={<IconQrcode size={14} />}
                        >
                          Check-in
                        </Menu.Item>
                        {!isCancelled && !isCompleted && status !== 'UNDER_REVIEW' && status !== 'DRAFT' && (
                          <Menu.Item
                            leftSection={<IconX size={14} />}
                            color="orange"
                            onClick={() => setCancelModalOpen(true)}
                          >
                            Cancel Event
                          </Menu.Item>
                        )}
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          onClick={() => setDeleteModalOpen(true)}
                        >
                          Move to Trash
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  )}
                </Group>
              </Group>
            </Paper>

            {/* Media */}
            {media && media.length > 0 && (
              <Box>
                {coverImage && (
                  <Image
                    src={coverImage}
                    alt={title}
                    radius="md"
                    style={{ maxHeight: 400, objectFit: 'cover' }}
                  />
                )}
                {images.length > 0 && (
                  <Carousel
                    withIndicators
                    height={300}
                    slideSize="33.333%"
                    slideGap="md"
                    mt="sm"
                    emblaOptions={{
                      loop: true,
                      slidesToScroll: 1,
                      align: 'start',
                    }}
                  >
                    {images.map((img) => (
                      <Carousel.Slide key={img.id}>
                        <Image
                          src={img.url}
                          alt={title}
                          height={300}
                          fit="cover"
                          radius="sm"
                        />
                      </Carousel.Slide>
                    ))}
                  </Carousel>
                )}
                {videos.length > 0 && (
                  <SimpleGrid cols={{ base: 1, sm: 2 }} mt="md">
                    {videos.map((video) => (
                      <video
                        key={video.id}
                        src={video.url}
                        controls
                        style={{ width: '100%', borderRadius: 8 }}
                      />
                    ))}
                  </SimpleGrid>
                )}
              </Box>
            )}

            {/* Description */}
            {description && (
              <Paper withBorder p="md" radius="md">
                <Text>{description}</Text>
              </Paper>
            )}

            {/* Reviews */}
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

        {/* Sidebar */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <Paper withBorder p="md" radius="md">
              <Stack gap="md">
                <Group gap="xs">
                  <IconCalendar size={18} />
                  <div>
                    <Text size="sm" fw={500}>{formatDate(startTime)}</Text>
                    <Text size="sm" c="dimmed">{formatDate(endTime)}</Text>
                  </div>
                </Group>

                <Group gap="xs">
                  <IconMapPin size={18} />
                  <Text size="sm">{location}</Text>
                </Group>

                <Divider />

                <CapacityBar current={currentRsvpCount} max={maxCapacity} />

                <Group justify="space-between">
                  <Group gap={4}>
                    <IconUsers size={16} />
                    <Text size="sm">{currentRsvpCount} / {maxCapacity} spots</Text>
                  </Group>
                  {isFull && <Badge color="orange">Full</Badge>}
                </Group>

                <Divider />

                {/* RSVP Button Section */}
                {!isHost && !isCancelled && !isCompleted && (
                  <>
                    {myRsvpStatus === 'GOING' ? (
                      <Button
                        fullWidth
                        color="red"
                        variant="light"
                        onClick={() => setCancelRsvpModalOpen(true)}
                        loading={isCancelling}
                      >
                        Cancel Registration
                      </Button>
                    ) : myRsvpStatus === 'WAITLISTED' ? (
                      <>
                        <Button fullWidth color="yellow" variant="light" disabled>
                          Waitlisted
                        </Button>
                        {myRsvp && (
                          <WaitlistBanner eventId={id} rsvpId={myRsvp.id} />
                        )}
                      </>
                    ) : (
                      <Button
                        fullWidth
                        color={isFull ? 'yellow' : 'blue'}
                        onClick={() => createRsvp()}
                        loading={isCreating}
                      >
                        {isFull ? 'Join Waitlist' : 'Register'}
                      </Button>
                    )}
                  </>
                )}

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
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Cancel Event Modal */}
      <Modal
        opened={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Event"
        centered
      >
        <Stack>
          <Text size="sm">
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
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCancelModalOpen(false)}>
              No, keep it
            </Button>
            <Button
              color="orange"
              loading={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate({ id, reason: cancelReason })}
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
        title="Move to Trash"
        centered
      >
        <Stack>
          <Text size="sm">
            This will move the event to your trash. You can restore it later from My Events.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(id)}
            >
              Move to Trash
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
        title="Cancel Registration"
        centered
      >
        <Stack>
          <Text size="sm">
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
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCancelRsvpModalOpen(false)}>
              No, keep my spot
            </Button>
            <Button
              color="red"
              loading={isCancelling}
              onClick={handleCancelRsvp}
            >
              Yes, cancel registration
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Report Event Modal */}
      <ReportEventModal
        opened={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        eventId={id}
        eventTitle={title}
        onReportSubmitted={() => {
          // Optional: show confirmation or refresh
        }}
      />
    </Container>
  );
}