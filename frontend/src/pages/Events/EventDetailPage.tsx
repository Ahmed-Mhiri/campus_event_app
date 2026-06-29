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
  ThemeIcon,
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
  IconFlag,
  IconShare,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/api/eventsApi';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/dateFormatter';
import { getAvatarUrl } from '@/utils/fileHelpers';
import { UserTrustBadge } from '@/components/molecules/UserTrustBadge';
import { CapacityBar } from '@/components/molecules/CapacityBar';
import { ReviewSection } from '@/components/organisms/ReviewSection';
import { WaitlistBanner } from '@/components/organisms/WaitlistBanner';
import { ReportEventModal } from '@/components/molecules/ReportEventModal';
import { useRsvp } from '@/hooks/useRsvp';
import { useAuthStore } from '@/stores/authStore';
import { useEventSse } from '@/hooks/useEventSse';

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

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

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

  const canReview = isCompleted && myRsvp?.status === 'ATTENDED' && !isHost;

  const coverImage = media?.find((m) => m.displayOrder === 0)?.url || media?.[0]?.url;
  const images = media?.filter((m) => m.mediaType === 'IMAGE') || [];
  const videos = media?.filter((m) => m.mediaType === 'VIDEO') || [];

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
        radius="md"
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
                    <Badge key={cat.id} color={cat.color || 'gray'} variant="light" radius="md">
                      {cat.name}
                    </Badge>
                  ))}
                </Group>
              </Stack>
              <Group gap={4}>
                <IconEye size={16} />
                <Text size="sm" c="dimmed">
                  {viewCount}
                </Text>
              </Group>
            </Group>

            {/* Host Info */}
            <Paper withBorder p="md" radius="lg">
              <Group gap="md">
                <Avatar
                  src={hostAvatarSrc != null ? String(hostAvatarSrc) : undefined}
                  size={56}
                  radius="xl"
                  alt={host.displayName}
                />
                <div style={{ flex: 1 }}>
                  <Group gap="xs">
                    <Text
                      component={Link}
                      to={ROUTES.USER_PROFILE(host.id)}
                      fw={600}
                      size="lg"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {host.displayName}
                    </Text>
                    <UserTrustBadge trustLevel={host.trustLevel} />
                  </Group>
                  <Group gap="sm">
                    <Text size="sm" c="dimmed">
                      ★{' '}
                      {host.averageHostRating > 0
                        ? host.averageHostRating.toFixed(1)
                        : 'No reviews yet'}
                    </Text>
                    <Text size="sm" c="dimmed">
                      • {host.completedEventsWithReviews} events hosted
                    </Text>
                  </Group>
                </div>
                <Group gap="xs">
                  {!isHost && !isCancelled && isAuthenticated && (
                    <Button
                      variant="subtle"
                      color="red"
                      size="xs"
                      leftSection={<IconFlag size={14} />}
                      onClick={() => setReportModalOpen(true)}
                      radius="md"
                    >
                      Report
                    </Button>
                  )}
                  {isHost && (
                    <Menu position="bottom-end" withinPortal>
                      <Menu.Target>
                        <Button variant="light" size="xs" leftSection={<IconDots size={14} />} radius="md">
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
                    radius="lg"
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
              <Paper withBorder p="md" radius="lg">
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
          <div style={{ position: 'sticky', top: 80 }}>
            <Stack gap="md">
              {/* Main action card */}
              <Paper
                withBorder
                p="xl"
                radius="lg"
                style={{
                  background: 'linear-gradient(135deg, var(--app-surface) 0%, var(--app-border-light) 100%)',
                }}
              >
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
                      <Text size="sm">
                        {currentRsvpCount} / {maxCapacity} spots
                      </Text>
                    </Group>
                    {isFull && <Badge color="orange">Full</Badge>}
                  </Group>

                  <Divider />

                  {/* RSVP Button Section */}
                  {!isHost && !isCancelled && !isCompleted && isAuthenticated ? (
                    <>
                      {myRsvpStatus === 'GOING' ? (
                        <Button
                          fullWidth
                          color="red"
                          variant="light"
                          onClick={() => setCancelRsvpModalOpen(true)}
                          loading={isCancelling}
                          radius="md"
                        >
                          Cancel Registration
                        </Button>
                      ) : myRsvpStatus === 'WAITLISTED' ? (
                        <>
                          <Button fullWidth color="yellow" variant="light" disabled radius="md">
                            Waitlisted
                          </Button>
                          {myRsvp && (
                            <WaitlistBanner eventId={id} rsvpId={myRsvp.id} />
                          )}
                        </>
                      ) : (
                        <Button
                          fullWidth
                          color={isFull ? 'yellow' : 'brand'}
                          onClick={() => createRsvp()}
                          loading={isCreating}
                          radius="md"
                        >
                          {isFull ? 'Join Waitlist' : 'Register'}
                        </Button>
                      )}
                    </>
                  ) : !isAuthenticated ? (
                    <Button
                      fullWidth
                      component={Link}
                      to={ROUTES.LOGIN}
                      variant="light"
                      radius="md"
                    >
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

                  <Button
                    variant="light"
                    color="gray"
                    leftSection={<IconShare size={16} />}
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    radius="md"
                  >
                    Share Event
                  </Button>
                </Stack>
              </Paper>

              {/* Host card */}
              <Paper withBorder p="lg" radius="lg">
                <Text fw={600} size="sm" c="dimmed" mb="md" tt="uppercase">Hosted by</Text>
                <Group gap="md">
                  <Avatar src={hostAvatarSrc} size={56} radius="xl" />
                  <div>
                    <Text fw={600}>{host.displayName}</Text>
                    <UserTrustBadge trustLevel={host.trustLevel} />
                  </div>
                </Group>
              </Paper>
            </Stack>
          </div>
        </Grid.Col>
      </Grid>

      {/* Cancel Event Modal */}
      <Modal
        opened={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Event"
        centered
        radius="xl"
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
            radius="md"
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCancelModalOpen(false)} radius="md">
              No, keep it
            </Button>
            <Button
              color="orange"
              loading={cancelMutation.isPending}
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
        title="Move to Trash"
        centered
        radius="xl"
      >
        <Stack>
          <Text size="sm">
            This will move the event to your trash. You can restore it later from My Events.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteModalOpen(false)} radius="md">
              Cancel
            </Button>
            <Button
              color="red"
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(id)}
              radius="md"
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
        radius="xl"
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
            radius="md"
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCancelRsvpModalOpen(false)} radius="md">
              No, keep my spot
            </Button>
            <Button color="red" loading={isCancelling} onClick={handleCancelRsvp} radius="md">
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