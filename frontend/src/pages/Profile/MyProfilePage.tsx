import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Stack,
  Avatar,
  Title,
  Text,
  Group,
  Badge,
  Button,
  Divider,
  Rating,
  Skeleton,
  Grid,
} from '@mantine/core';
import {
  IconUserEdit,
  IconLock,
  IconBell,
  IconShield,
  IconTrash,
  IconCalendar,
  IconStar,
  IconMessage,
  IconChevronRight,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useReviews } from '@/hooks/useReviews';
import { ROUTES } from '@/constants/routes';
import { getAvatarUrl } from '@/utils/fileHelpers';
import { DeleteAccountModal } from '@/components/molecules/DeleteAccountModal';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { slideUp, staggerContainer } from '@/design-system/animations';

export function MyProfilePage() {
  const { user } = useAuth();
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);

  const { useHostReviews } = useReviews();
  const { data: hostReviews, isLoading: reviewsLoading } = useHostReviews(user?.id || '', 0, 5);
  const reviews = hostReviews?.content || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  if (!user) {
    return (
      <PageContainer size="md">
        <Text style={{ color: 'var(--app-text)' }}>Please log in to view your profile.</Text>
      </PageContainer>
    );
  }

  const avatarSrc = user.profileImageUrl || getAvatarUrl(user.id) || undefined;

  const trustColor = user.trustLevel === 'TRUSTED_HOST' ? 'green' : user.trustLevel === 'FLAGGED' ? 'red' : 'gray';
  const trustLabel = user.trustLevel === 'TRUSTED_HOST' ? 'Trusted Host' : user.trustLevel === 'FLAGGED' ? 'Flagged' : 'New User';

  const quickActions = [
    { label: 'Edit Profile', desc: 'Name, bio & avatar', icon: IconUserEdit, to: ROUTES.EDIT_PROFILE, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30' },
    { label: 'Security', desc: 'Password & login', icon: IconLock, to: ROUTES.CHANGE_PASSWORD, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Preferences', desc: 'Notifications & display', icon: IconBell, to: ROUTES.PREFERENCES, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30' },
    { label: 'Trust Status', desc: 'Host qualification', icon: IconShield, to: ROUTES.TRUST_STATUS, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' },
  ];

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : '—';

  return (
    <PageContainer size="lg">
      <Stack gap="xl">
        <PageHeader
          title="My Profile"
          subtitle="Manage your account and view your hosting stats"
          actions={
            <Button
              component={Link}
              to={ROUTES.EDIT_PROFILE}
              variant="light"
              color="brand"
              radius="xl"
              leftSection={<IconUserEdit size={18} />}
            >
              Edit Profile
            </Button>
          }
        />

        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          {/* Hero Card */}
          <motion.div variants={slideUp}>
            <Card variant="elevated" className="overflow-hidden">
              <div className="relative">
                {/* ✅ FIXED: Use CSS var for subtle gradient that works in both modes */}
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
                        alt={user.displayName}
                        className="border-4 shadow-xl"
                        style={{ borderColor: 'var(--app-surface)' }}
                      />
                      <div className="absolute -bottom-1 -right-1">
                        <Badge color={trustColor} variant="filled" radius="xl" className="shadow-sm">
                          {trustLabel}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left min-w-0">
                      {/* ✅ FIXED: Use style with CSS var instead of text-slate-900 */}
                      <Title
                        order={1}
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                        style={{ color: 'var(--app-text)' }}
                      >
                        {user.displayName}
                      </Title>
                      <Text size="sm" className="mt-1" style={{ color: 'var(--app-text-secondary)' }}>
                        {user.universityEmail}
                      </Text>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                        <Badge variant="light" color="blue" radius="md" size="sm">
                          {user.role}
                        </Badge>
                        {user.bio && (
                          <Text
                            size="sm"
                            className="hidden sm:block max-w-md truncate"
                            style={{ color: 'var(--app-text-secondary)' }}
                          >
                            {user.bio}
                          </Text>
                        )}
                      </div>
                    </div>
                  </div>

                  {user.bio && (
                    <Text
                      size="sm"
                      className="mt-4 sm:hidden text-center max-w-md mx-auto"
                      style={{ color: 'var(--app-text-secondary)' }}
                    >
                      {user.bio}
                    </Text>
                  )}
                </div>
              </div>

              <Divider style={{ borderColor: 'var(--app-border)' }} />

              {/* Stats strip */}
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-0"
                style={{
                  borderTop: '1px solid var(--app-border)',
                }}
              >
                {[
                  { icon: IconCalendar, label: 'Member Since', value: memberSince },
                  { icon: IconStar, label: 'Avg. Rating', value: averageRating > 0 ? averageRating.toFixed(1) : '—' },
                  { icon: IconMessage, label: 'Reviews', value: String(hostReviews?.totalElements || 0) },
                  { icon: IconShield, label: 'Trust Level', value: trustLabel },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 sm:p-6 text-center transition-colors"
                    style={{
                      borderRight: '1px solid var(--app-border)',
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

          {/* Quick Actions */}
          <motion.div variants={slideUp} className="mt-6">
            <Grid gap="md">
              {quickActions.map((action) => (
                <Grid.Col key={action.label} span={{ base: 12, sm: 6 }}>
                  <Card
                    component={Link}
                    to={action.to}
                    hover
                    className="group no-underline flex items-center gap-4"
                  >
                    <div className={`p-3 rounded-xl shrink-0 ${action.color} group-hover:scale-105 transition-transform`}>
                      <action.icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* ✅ FIXED: CSS var for title */}
                      <Text fw={600} className="group-hover:transition-colors" style={{ color: 'var(--app-text)' }}>
                        {action.label}
                      </Text>
                      <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                        {action.desc}
                      </Text>
                    </div>
                    <IconChevronRight
                      size={18}
                      className="shrink-0 transition-transform group-hover:translate-x-1"
                      style={{ color: 'var(--app-text-muted)' }}
                    />
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </motion.div>

          {/* Recent Reviews */}
          <motion.div variants={slideUp} className="mt-6">
            <Card variant="default" className="border-slate-200/80 dark:border-slate-700/60">
              <Group justify="space-between" mb="md" align="flex-start">
                <div>
                  <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>
                    Recent Reviews
                  </Text>
                  <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                    What attendees are saying about your events
                  </Text>
                </div>
                {reviews.length > 0 && (
                  <Group gap={4}>
                    <Rating value={averageRating} readOnly fractions={2} size="sm" />
                    <Text fw={600} size="sm" style={{ color: 'var(--app-text)' }}>
                      {averageRating.toFixed(1)}
                    </Text>
                    <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                      ({hostReviews?.totalElements || 0})
                    </Text>
                  </Group>
                )}
              </Group>

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
                    No reviews yet. Host your first event to start collecting feedback!
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
                      <Group justify="space-between" mb="xs">
                        <Group gap="xs">
                          <Avatar
                            size={28}
                            radius="xl"
                            src={review.reviewer?.profileImageUrl || undefined}
                          >
                            {review.reviewer?.displayName?.charAt(0)}
                          </Avatar>
                          <Text size="sm" fw={500} style={{ color: 'var(--app-text)' }}>
                            {review.reviewer?.displayName}
                          </Text>
                        </Group>
                        <Text size="xs" style={{ color: 'var(--app-text-muted)' }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Text>
                      </Group>
                      <Rating value={review.rating} readOnly size="sm" mb="xs" />
                      {review.comment && (
                        <Text size="sm" lineClamp={2} style={{ color: 'var(--app-text-secondary)' }}>
                          {review.comment}
                        </Text>
                      )}
                    </div>
                  ))}
                </Stack>
              )}
            </Card>
          </motion.div>

          {/* Danger Zone */}
          <motion.div variants={slideUp} className="mt-6">
            <Card
              variant="outlined"
              className="border-red-200/80 dark:border-red-900/40"
              style={{ background: 'rgba(239, 68, 68, 0.03)' }}
            >
              <Group justify="space-between" align="center" wrap="nowrap">
                <div className="min-w-0">
                  <Text fw={600} className="text-red-700 dark:text-red-400">
                    Delete Account
                  </Text>
                  <Text size="sm" className="max-w-md" style={{ color: 'var(--app-text-secondary)' }}>
                    Permanently remove your account and all associated data. This action cannot be undone.
                  </Text>
                </div>
                <Button
                  color="red"
                  variant="light"
                  leftSection={<IconTrash size={18} />}
                  onClick={() => setDeleteModalOpened(true)}
                  radius="md"
                  className="shrink-0"
                >
                  Delete Account
                </Button>
              </Group>
            </Card>
          </motion.div>
        </motion.div>
      </Stack>

      <DeleteAccountModal opened={deleteModalOpened} onClose={() => setDeleteModalOpened(false)} />
    </PageContainer>
  );
}