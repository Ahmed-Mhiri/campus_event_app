import { useParams } from 'react-router-dom';
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
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { IconCalendar, IconStar, IconMessage } from '@tabler/icons-react';
import { api } from '@/api/client';
import { getAvatarUrl } from '@/utils/fileHelpers';
import { UserTrustBadge } from '@/components/molecules/UserTrustBadge';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { slideUp, staggerContainer } from '@/design-system/animations';
import type { ApiResponse, PublicProfile } from '@/types';

export function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-profile', userId],
    queryFn: () =>
      api
        .get<ApiResponse<PublicProfile>>(`/api/public/users/${userId}`)
        .then((res) => res.data.data),
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

  const avatarSrc = data.profileImageUrl || getAvatarUrl(data.id) || undefined;
  const memberSince = new Date(data.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });

  return (
    <PageContainer size="lg">
      <Stack gap="xl">
        <PageHeader title={data.displayName} subtitle="Public host profile" />

        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
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
                      {/* ✅ FIXED: CSS var */}
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
                  { icon: IconCalendar, label: 'Events Hosted', value: String(data.completedEventsWithReviews || 0) },
                  { icon: IconStar, label: 'Avg. Rating', value: data.averageHostRating > 0 ? data.averageHostRating.toFixed(1) : '—' },
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

          {/* Hosted Events placeholder */}
          <motion.div variants={slideUp} className="mt-6">
            <Card variant="default" className="border-slate-200/80 dark:border-slate-700/60">
              <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }} mb="xs">
                Hosted Events
              </Text>
              <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                A list of events hosted by this user will appear here.
              </Text>
            </Card>
          </motion.div>
        </motion.div>
      </Stack>
    </PageContainer>
  );
}