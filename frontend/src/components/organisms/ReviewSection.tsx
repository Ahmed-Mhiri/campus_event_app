// src/components/organisms/ReviewSection/ReviewSection.tsx
import { useState } from 'react';
import {
  Stack,
  Paper,
  Text,
  Group,
  Avatar,
  Rating,
  Button,
  Textarea,
  Loader,
  Center,
  Alert,
  ActionIcon,
  Menu,
  Modal,
  Badge,
  Select,
  Pagination,
  Title,
  Table,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconThumbUp,
  IconThumbUpFilled,
  IconFlag,
  IconDots,
  IconTrash,
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { useReviews } from '@/hooks/useReviews';
import { getAvatarUrl } from '@/utils/fileHelpers';
import { formatDate } from '@/utils/dateFormatter';
import type { Review } from '@/types';

interface ReviewSectionProps {
  eventId: string;
  hostId?: string;
  canReview?: boolean;
  onReviewSubmitted?: () => void;
}

export function ReviewSection({
  eventId,
  canReview = false,
  onReviewSubmitted,
}: ReviewSectionProps) {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState('helpfulCount,desc');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Review | null>(null);

  const { useEventReviews, createReview, deleteReview, toggleHelpful, reportReview } = useReviews();
  const { data, isLoading, refetch } = useEventReviews(eventId, page, 20, sort);
  const reviews = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const handleSubmitReview = async () => {
    if (rating === 0) {
      notifications.show({
        title: 'Error',
        message: 'Please select a rating.',
        color: 'red',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await createReview({ eventId, rating, comment: comment || undefined });
      setRating(0);
      setComment('');
      if (onReviewSubmitted) onReviewSubmitted();
      await refetch();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleHelpful = async (reviewId: string) => {
    await toggleHelpful(reviewId);
    await refetch();
  };

  const handleReport = async () => {
    if (!selectedReview) return;
    if (!reportReason.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Please provide a reason for the report.',
        color: 'red',
      });
      return;
    }
    await reportReview({
      reviewId: selectedReview.id,
      data: { reason: reportReason },
    });
    setReportModalOpen(false);
    setSelectedReview(null);
    setReportReason('');
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteReview(deleteConfirm.id);
    setDeleteConfirm(null);
    await refetch();
  };

  const sortOptions = [
    { value: 'helpfulCount,desc', label: 'Most Helpful' },
    { value: 'createdAt,desc', label: 'Newest' },
    { value: 'rating,desc', label: 'Highest Rating' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Title order={3} size="h4" style={{ color: 'var(--app-text)' }}>
          Reviews
        </Title>
        <Select
          data={sortOptions}
          value={sort}
          onChange={(val) => setSort(val || 'helpfulCount,desc')}
          size="xs"
          w={150}
          radius="md"
          styles={{
            input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
            dropdown: { background: 'var(--app-surface)', borderColor: 'var(--app-border)' },
          }}
        />
      </Group>

      {/* Review Form */}
      {canReview && user && (
        <Paper
          withBorder
          p="md"
          radius="xl"
          style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
        >
          <Text fw={500} mb="sm" style={{ color: 'var(--app-text)' }}>
            Write a Review
          </Text>
          <Stack gap="sm">
            <Rating value={rating} onChange={setRating} size="lg" fractions={2} />
            <Textarea
              placeholder="Share your experience (max 1000 characters)"
              value={comment}
              onChange={(e) => setComment(e.currentTarget.value)}
              maxLength={1000}
              minRows={2}
              autosize
              radius="md"
              styles={{
                input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
              }}
            />
            <Group justify="flex-end">
              <Button
                onClick={handleSubmitReview}
                loading={isSubmitting}
                disabled={rating === 0}
                radius="md"
                color="brand"
              >
                Submit Review
              </Button>
            </Group>
          </Stack>
        </Paper>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <Center py="xl">
          <Loader size="md" />
        </Center>
      ) : reviews.length === 0 ? (
        <Paper
          withBorder
          p="xl"
          ta="center"
          radius="xl"
          style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
        >
          <Text style={{ color: 'var(--app-text-secondary)' }}>
            No reviews yet. Be the first to leave a review!
          </Text>
        </Paper>
      ) : (
        <Stack gap="md">
          {reviews.map((review: Review) => {
            const isHelpful = review.isHelpfulByCurrentUser || false;
            const isReviewer = user?.id === review.reviewer.id;
            const isAdmin = user?.role === 'ADMIN';

            const avatarSrc = review.reviewer.profileImageUrl || getAvatarUrl(review.reviewer.id) || undefined;

            return (
              <Paper
                key={review.id}
                withBorder
                p="md"
                radius="xl"
                style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
              >
                <Group align="flex-start" wrap="nowrap">
                  <Avatar
                    src={avatarSrc != null ? String(avatarSrc) : undefined}
                    radius="xl"
                    size={40}
                    alt={review.reviewer.displayName}
                  >
                    {getInitials(review.reviewer.displayName)}
                  </Avatar>

                  <div style={{ flex: 1 }}>
                    <Group justify="space-between" wrap="wrap" gap="xs">
                      <Group gap="xs">
                        <Text fw={500} size="sm" style={{ color: 'var(--app-text)' }}>
                          {review.reviewer.displayName}
                        </Text>
                        <Badge size="xs" color="gray" variant="light" radius="md">
                          {review.reviewer.trustLevel}
                        </Badge>
                      </Group>
                      <Group gap="xs">
                        <Text size="xs" style={{ color: 'var(--app-text-muted)' }}>
                          {formatDate(review.createdAt)}
                        </Text>
                        {(isReviewer || isAdmin) && (
                          <Menu position="bottom-end" withinPortal>
                            <Menu.Target>
                              <ActionIcon size="sm" variant="subtle" style={{ color: 'var(--app-text-muted)' }}>
                                <IconDots size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown
                              style={{
                                background: 'var(--app-surface)',
                                borderColor: 'var(--app-border)',
                              }}
                            >
                              {(isReviewer || isAdmin) && (
                                <Menu.Item
                                  color="red"
                                  leftSection={<IconTrash size={14} />}
                                  onClick={() => setDeleteConfirm(review)}
                                >
                                  Delete Review
                                </Menu.Item>
                              )}
                            </Menu.Dropdown>
                          </Menu>
                        )}
                      </Group>
                    </Group>

                    <Rating value={review.rating} readOnly size="sm" mb="xs" />

                    {review.comment && (
                      <Text size="sm" mb="xs" style={{ color: 'var(--app-text-secondary)' }}>
                        {review.comment}
                      </Text>
                    )}

                    <Group gap="sm">
                      <Button
                        variant={isHelpful ? 'filled' : 'light'}
                        color={isHelpful ? 'blue' : 'gray'}
                        size="compact-xs"
                        radius="md"
                        leftSection={
                          isHelpful ? <IconThumbUpFilled size={14} /> : <IconThumbUp size={14} />
                        }
                        onClick={() => handleToggleHelpful(review.id)}
                      >
                        {review.helpfulCount} Helpful
                      </Button>

                      {!isReviewer && (
                        <Button
                          variant="subtle"
                          color="gray"
                          size="compact-xs"
                          radius="md"
                          leftSection={<IconFlag size={14} />}
                          onClick={() => {
                            setSelectedReview(review);
                            setReportModalOpen(true);
                          }}
                        >
                          Report
                        </Button>
                      )}
                    </Group>
                  </div>
                </Group>
              </Paper>
            );
          })}

          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination
                total={totalPages}
                value={page + 1}
                onChange={(p) => setPage(p - 1)}
                color="brand"
                styles={{
                  control: { color: 'var(--app-text)', borderColor: 'var(--app-border)' },
                }}
              />
            </Group>
          )}
        </Stack>
      )}

      {/* Report Modal */}
      <Modal
        opened={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setSelectedReview(null);
          setReportReason('');
        }}
        title={
          <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>
            Report Review
          </Text>
        }
        radius="xl"
        styles={{
          content: { background: 'var(--app-surface)' },
          header: { background: 'var(--app-surface)', borderBottom: '1px solid var(--app-border)' },
        }}
      >
        <Stack>
          <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
            Why are you reporting this review? This will be sent to moderators for review.
          </Text>
          <Textarea
            label="Reason"
            placeholder="Please describe why this review is inappropriate..."
            value={reportReason}
            onChange={(e) => setReportReason(e.currentTarget.value)}
            required
            minRows={3}
            maxLength={500}
            radius="md"
            styles={{
              label: { color: 'var(--app-text)' },
              input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
            }}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setReportModalOpen(false)} radius="md">
              Cancel
            </Button>
            <Button color="red" onClick={handleReport} radius="md">
              Submit Report
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title={
          <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>
            Delete Review
          </Text>
        }
        radius="xl"
        styles={{
          content: { background: 'var(--app-surface)' },
          header: { background: 'var(--app-surface)', borderBottom: '1px solid var(--app-border)' },
        }}
      >
        <Stack>
          <Alert color="red" title="Are you sure?" radius="md">
            This action cannot be undone. The review will be permanently deleted.
          </Alert>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteConfirm(null)} radius="md">
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} radius="md">
              Delete Review
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}