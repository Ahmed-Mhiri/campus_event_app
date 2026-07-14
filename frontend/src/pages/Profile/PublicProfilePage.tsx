// src/pages/Profile/PublicProfilePage.tsx
import { useParams, Link } from 'react-router-dom';
import {
  Stack,
  Avatar,
  Title,
  Text,
  Badge,
  Loader,
  Center,
  Alert,
  Divider,
  Rating,
  Skeleton,
  SimpleGrid,
  Group,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { IconCalendar, IconStar, IconMessage, IconAlertCircle } from '@tabler/icons-react';
import { api } from '@/api/client';
import { getAvatarUrl } from '@/utils/fileHelpers';
import { UserTrustBadge } from '@/components/molecules/UserTrustBadge';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { slideUp, staggerContainer } from '@/design-system/animations';
import type { ApiResponse, PublicProfile } from '@/types';
import { useReviews } from '@/hooks/useReviews';
import { EventCard } from '@/components/molecules/EventCard';
import { useAuthStore } from '@/stores/authStore';

// ✅ Get backend base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { isAuthenticated } = useAuthStore();

  // Helper to convert relative backend paths to full URLs
  const getFullImageUrl = (url?: string | null) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  // Profile data
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-profile', userId],
    queryFn: () =>
      api
        .get<ApiResponse<PublicProfile>>(`/api/public/users/${userId}`)
        .then((res) => res.data.data),
    enabled: !!userId,
  });

  // Host reviews
  const { useHostReviews } = useReviews();
  const { data: hostReviews, isLoading: reviewsLoading } = useHostReviews(userId || '', 0, 10);
  const reviews = hostReviews?.content || [];

  // Fetch events and filter by host strictly on the frontend
  const { data: hostedEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', 'host', userId, isAuthenticated],
    queryFn: async () => {
      const endpoint = isAuthenticated ? '/api/events' : '/api/public/events';
      const res = await api.get(endpoint, {
        params: { size: 50, sort: 'startTime,asc' },
      });
      const allEvents = res.data.data.content || [];
      const userEvents = allEvents.filter((event: any) => event.host.id === userId);
      return userEvents.slice(0, 4);
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <Center h="50vh">
        <Loader size="xl" color="brand" />
      </Center>
    );
  }

  if (error || !data) {
    return (
      <PageContainer size="md">
        <Alert color="red" radius="lg" variant="light">
          User not found or failed to load profile.
        </Alert>
      </PageContainer>
    );
  }

  const avatarSrc = getFullImageUrl(data.profileImageUrl) || getAvatarUrl(data.id) || undefined;
  const memberSince = new Date(data.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });

  return (
    <PageContainer size="lg">
      <Stack gap="xl">
        <PageHeader title={data.displayName} subtitle="Public host profile" />

        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          {/* ✅ NEW: Flagged User Warning */}
          {data.trustLevel === 'FLAGGED' && (
            <motion.div variants={slideUp} className="mb-6">
              <Alert
                icon={<IconAlertCircle size={18} />}
                color="red"
                radius="md"
                variant="filled"
                title="Account Suspended"
              >
                This user has been flagged by administrators for violating community
                guidelines. Their upcoming events have been suspended.
              </Alert>
            </motion.div>
          )}

          {/* Hero Card */}
          <motion.div variants={slideUp}>
            <Card variant="elevated" className="overflow-hidden">
              <div className="relative">
                <div
                  className="absolute inset-0 h-32"
                  style={{
                    background: 'linear-gradient(135deg, var(--app-primary-light) 0%, transparent 60%)',
                  }}
                />
                <div className="relative px-6 pt-10 pb-6 sm:px-8 sm:pb-8">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                    <div className="relative -mt-16 sm:mt-0">
                      <Avatar
                        src={avatarSrc}
                        size={120}
                        radius="xl"
                        alt={data.displayName}
                        className="shadow-xl"
                        style={{ border: '4px solid var(--app-surface)' }}
                      />
                    </div>

                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <Title
                        order={1}
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                        style={{ color: 'var(--app-text)' }}
                      >
                        {data.displayName}
                      </Title>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                        <UserTrustBadge trustLevel={data.trustLevel} size="sm" />
                        <Badge variant="light" color="gray" radius="md" size="sm">
                          Joined {memberSince}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {data.bio && (
                    <Text
                      size="sm"
                      className="mt-6 max-w-2xl text-center sm:text-left leading-relaxed"
                      style={{ color: 'var(--app-text-secondary)' }}
                    >
                      {data.bio}
                    </Text>
                  )}
                </div>
              </div>

              <Divider style={{ borderColor: 'var(--app-border)' }} />

              <div
                className="grid grid-cols-3 gap-0"
                style={{ borderTop: '1px solid var(--app-border)' }}
              >
                {[
                  {
                    icon: IconCalendar,
                    label: 'Events Hosted',
                    value: String(data.completedEventsWithReviews || 0),
                  },
                  {
                    icon: IconStar,
                    label: 'Avg. Rating',
                    value: data.averageHostRating > 0 ? data.averageHostRating.toFixed(1) : '—',
                  },
                  { icon: IconMessage, label: 'Member Since', value: memberSince },
                ].map((stat, i, arr) => (
                  <div
                    key={stat.label}
                    className="p-4 sm:p-6 text-center transition-colors"
                    style={{
                      borderRight: i < arr.length - 1 ? '1px solid var(--app-border)' : undefined,
                    }}
                  >
                    <stat.icon
                      size={20}
                      className="mx-auto mb-2"
                      style={{ color: 'var(--app-text-muted)' }}
                    />
                    <Text
                      className="text-xl sm:text-2xl font-extrabold tracking-tight"
                      style={{ color: 'var(--app-text)' }}
                    >
                      {stat.value}
                    </Text>
                    <Text
                      size="xs"
                      className="uppercase tracking-wider font-medium mt-1"
                      style={{ color: 'var(--app-text-secondary)' }}
                    >
                      {stat.label}
                    </Text>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Hosted Events Section */}
          <motion.div variants={slideUp} className="mt-6">
            <div className="mb-4">
              <Group justify="space-between" align="flex-end">
                <div>
                  <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>
                    Upcoming Events
                  </Text>
                  <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                    Join {data.displayName}'s next activities
                  </Text>
                </div>
                {hostedEvents && hostedEvents.length > 0 && (
                  <Badge variant="light" color="blue" radius="md">
                    {hostedEvents.length} Active
                  </Badge>
                )}
              </Group>
            </div>

            {eventsLoading ? (
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Skeleton height={280} radius="xl" />
                <Skeleton height={280} radius="xl" />
              </SimpleGrid>
            ) : hostedEvents?.length === 0 ? (
              <Card variant="default" className="text-center py-8 border-slate-200/80 dark:border-slate-700/60">
                <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                  This host doesn't have any upcoming events right now.
                </Text>
              </Card>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {hostedEvents?.map((event: any) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </SimpleGrid>
            )}
          </motion.div>

          {/* Host Reviews Section */}
          <motion.div variants={slideUp} className="mt-8">
            <Card variant="default" className="border-slate-200/80 dark:border-slate-700/60">
              <div className="mb-6">
                <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>
                  Host Reviews
                </Text>
                <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                  Feedback from {data.displayName}'s past completed events
                </Text>
              </div>

              {reviewsLoading ? (
                <Stack gap="md">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} height={80} radius="xl" />
                  ))}
                </Stack>
              ) : reviews.length === 0 ? (
                <div
                  className="text-center rounded-xl p-8"
                  style={{
                    border: '1px solid var(--app-border)',
                    background: 'var(--app-border-light)',
                  }}
                >
                  <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                    This host doesn't have any reviews yet.
                  </Text>
                </div>
              ) : (
                <Stack gap="md">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl p-4"
                      style={{
                        border: '1px solid var(--app-border)',
                        background: 'var(--app-surface)',
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Link
                          to={`/profile/${review.reviewer?.id}`}
                          className="flex items-center gap-2 hover:opacity-80 transition-opacity no-underline"
                        >
                          <Avatar
                            size={28}
                            radius="xl"
                            src={getFullImageUrl(review.reviewer?.profileImageUrl) || undefined}
                          >
                            {review.reviewer?.displayName?.charAt(0)}
                          </Avatar>
                          <Text
                            size="sm"
                            fw={500}
                            style={{ color: 'var(--app-text)' }}
                            className="hover:underline"
                          >
                            {review.reviewer?.displayName}
                          </Text>
                        </Link>
                        <Text size="xs" style={{ color: 'var(--app-text-muted)' }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                      <Rating value={review.rating} readOnly size="sm" mb="xs" />
                      {review.comment && (
                        <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                          {review.comment}
                        </Text>
                      )}
                    </div>
                  ))}
                </Stack>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </Stack>
    </PageContainer>
  );
}