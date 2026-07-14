import { Stack, Text, Progress, Group, Badge, ThemeIcon, Button } from '@mantine/core';
import {
  IconCheck,
  IconTrophy,
  IconCalendarEvent,
  IconStar,
  IconArrowLeft,
  IconShieldCheck,
  IconSparkles,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button as UIButton } from '@/components/ui/Button';
import { slideUp, staggerContainer } from '@/design-system/animations';

export function TrustStatusPage() {
  const { trustStatus, trustStatusLoading } = useAuth();

  if (trustStatusLoading) {
    return (
      <PageContainer size="md">
        <Stack gap="xl">
          <PageHeader title="Trust Status" subtitle="Loading your qualification data..." />
          <Card variant="default" className="border-slate-200/80 dark:border-slate-700/60">
            <div className="animate-pulse space-y-4">
              <div className="h-24 rounded-xl" style={{ background: 'var(--app-border)' }} />
              <div className="h-32 rounded-xl" style={{ background: 'var(--app-border)' }} />
              <div className="h-32 rounded-xl" style={{ background: 'var(--app-border)' }} />
            </div>
          </Card>
        </Stack>
      </PageContainer>
    );
  }

  // ─── EMPTY STATE ───
  if (!trustStatus) {
    return (
      <PageContainer size="md">
        <Stack gap="xl">
          <PageHeader
            title="Trust Status"
            subtitle="Track your progress toward becoming a Trusted Host"
            breadcrumbs={[
              { label: 'Profile', href: ROUTES.PROFILE },
              { label: 'Trust Status' },
            ]}
          />

          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={slideUp}>
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{
                  border: '1px solid var(--app-border)',
                  background: 'var(--app-surface)',
                }}
              >
                {/* Ambient glow */}
                <div
                  className="absolute inset-0 opacity-80 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at 20% 30%, rgba(139,92,246,0.08), transparent 50%), radial-gradient(circle at 80% 70%, rgba(99,102,241,0.06), transparent 50%)',
                  }}
                />

                <div className="relative px-6 py-16 sm:px-10 sm:py-20 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <div
                      className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
                      style={{
                        background: 'var(--app-primary-light)',
                        border: '1px solid var(--app-border)',
                      }}
                    >
                      <IconShieldCheck size={36} style={{ color: 'var(--app-primary)' }} />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <Text
                      fw={700}
                      className="text-2xl sm:text-3xl tracking-tight mb-3"
                      style={{ color: 'var(--app-text)' }}
                    >
                      Trust data not available yet
                    </Text>
                  </motion.div>

                  <motion.div
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <Text size="lg" className="max-w-md mx-auto leading-relaxed mb-2" style={{ color: 'var(--app-text-secondary)' }}>
                      You haven't hosted any completed events with reviews yet.
                    </Text>
                    <Text size="sm" className="max-w-sm mx-auto" style={{ color: 'var(--app-text-muted)' }}>
                      Host your first event, gather reviews, and watch your trust level grow.
                    </Text>
                  </motion.div>

                  <motion.div
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
                  >
                    <UIButton
                      component={Link}
                      to={ROUTES.CREATE_EVENT}
                      variant="primary"
                      leftSection={<IconSparkles size={18} />}
                      radius="xl"
                      size="lg"
                    >
                      Create your first event
                    </UIButton>
                    <UIButton
                      component={Link}
                      to={ROUTES.PROFILE}
                      variant="ghost"
                      leftSection={<IconArrowLeft size={18} />}
                      radius="xl"
                      size="lg"
                    >
                      Back to Profile
                    </UIButton>
                  </motion.div>

                  {/* Preview teaser */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mt-12 max-w-sm mx-auto"
                  >
                    <div
                      className="rounded-xl border border-dashed p-4"
                      style={{
                        borderColor: 'var(--app-border)',
                        background: 'var(--app-border-light)',
                      }}
                    >
                      <div className="flex items-center gap-3 opacity-50">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: 'var(--app-primary-light)' }}
                        >
                          <IconTrophy size={20} style={{ color: 'var(--app-primary)' }} />
                        </div>
                        <div className="text-left flex-1">
                          <div className="h-3 w-24 rounded mb-1.5" style={{ background: 'var(--app-border)' }} />
                          <div className="h-2 w-16 rounded" style={{ background: 'var(--app-border)' }} />
                        </div>
                        <IconCheck size={16} style={{ color: 'var(--app-primary)' }} />
                      </div>
                      <Text size="xs" className="mt-3 text-center" style={{ color: 'var(--app-text-muted)' }}>
                        Trusted Host badge will appear here once you qualify
                      </Text>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Stack>
      </PageContainer>
    );
  }

  const {
    completedEventsWithReviews,
    minimumEventsRequired,
    averageRating,
    minimumRatingRequired,
    meetsEventCount,
    meetsRatingThreshold,
    qualifies,
  } = trustStatus;

  return (
    <PageContainer size="md">
      <Stack gap="xl">
        <PageHeader
          title="Trust Status"
          subtitle="Track your progress toward becoming a Trusted Host"
          breadcrumbs={[
            { label: 'Profile', href: ROUTES.PROFILE },
            { label: 'Trust Status' },
          ]}
        />

        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          {/* Status Banner */}
          <motion.div variants={slideUp}>
            <Card
              variant={qualifies ? 'elevated' : 'outlined'}
              className={
                qualifies
                  ? 'border-green-200/80 dark:border-green-900/40'
                  : 'border-amber-200/80 dark:border-amber-900/40'
              }
              style={{
                background: qualifies
                  ? 'rgba(34, 197, 94, 0.05)'
                  : 'rgba(245, 158, 11, 0.05)',
              }}
            >
              <Group gap="md" align="center">
                <ThemeIcon
                  size={48}
                  radius="xl"
                  variant="light"
                  color={qualifies ? 'green' : 'yellow'}
                  className="shrink-0"
                >
                  {qualifies ? <IconTrophy size={24} /> : <IconCheck size={24} />}
                </ThemeIcon>
                <div className="flex-1">
                  <Text
                    fw={700}
                    className={qualifies ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}
                  >
                    {qualifies ? 'You are a Trusted Host' : 'Qualification in Progress'}
                  </Text>
                  <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                    {qualifies
                      ? 'Both requirements are met. Your events now auto-publish.'
                      : `Host at least ${minimumEventsRequired} events with an average rating of ${minimumRatingRequired} or higher.`}
                  </Text>
                </div>
                <Badge
                  color={qualifies ? 'green' : 'yellow'}
                  variant="filled"
                  radius="xl"
                  size="lg"
                  className="shrink-0"
                >
                  {qualifies ? 'TRUSTED_HOST' : 'NEW'}
                </Badge>
              </Group>
            </Card>
          </motion.div>

          {/* Requirements */}
          <motion.div variants={slideUp} className="mt-6">
            <Stack gap="md">
              {/* Events Hosted */}
              <Card variant="default" className="border-slate-200/80 dark:border-slate-700/60">
                <Group justify="space-between" mb="sm">
                  <Group gap="sm">
                    <ThemeIcon
                      size={36}
                      radius="lg"
                      variant="light"
                      color={meetsEventCount ? 'green' : 'blue'}
                    >
                      <IconCalendarEvent size={18} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600} style={{ color: 'var(--app-text)' }}>
                        Events Hosted
                      </Text>
                      <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                        Events with at least one review
                      </Text>
                    </div>
                  </Group>
                  <Text fw={700} style={{ color: 'var(--app-text)' }}>
                    {completedEventsWithReviews} / {minimumEventsRequired}
                  </Text>
                </Group>
                <Progress
                  value={Math.min((completedEventsWithReviews / minimumEventsRequired) * 100, 100)}
                  color={meetsEventCount ? 'green' : 'blue'}
                  size="lg"
                  radius="xl"
                />
                <Text size="xs" c={meetsEventCount ? 'green' : 'dimmed'} mt="xs">
                  {meetsEventCount
                    ? '✓ Requirement met'
                    : `Need ${minimumEventsRequired - completedEventsWithReviews} more event(s)`}
                </Text>
              </Card>

              {/* Average Rating */}
              <Card variant="default" className="border-slate-200/80 dark:border-slate-700/60">
                <Group justify="space-between" mb="sm">
                  <Group gap="sm">
                    <ThemeIcon
                      size={36}
                      radius="lg"
                      variant="light"
                      color={meetsRatingThreshold ? 'green' : 'violet'}
                    >
                      <IconStar size={18} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600} style={{ color: 'var(--app-text)' }}>
                        Average Rating
                      </Text>
                      <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                        Minimum {minimumRatingRequired} stars required
                      </Text>
                    </div>
                  </Group>
                  <Text fw={700} style={{ color: 'var(--app-text)' }}>
                    {averageRating.toFixed(1)} / {minimumRatingRequired}
                  </Text>
                </Group>
                <Progress
                  value={Math.min((averageRating / minimumRatingRequired) * 100, 100)}
                  color={meetsRatingThreshold ? 'green' : 'violet'}
                  size="lg"
                  radius="xl"
                />
                <Text size="xs" c={meetsRatingThreshold ? 'green' : 'dimmed'} mt="xs">
                  {meetsRatingThreshold
                    ? '✓ Requirement met'
                    : 'Keep hosting great events to improve your rating'}
                </Text>
              </Card>
            </Stack>
          </motion.div>

          {/* Back */}
          <motion.div variants={slideUp} className="mt-6">
            <Button
              variant="ghost"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => window.history.back()}
              style={{ color: 'var(--app-text-secondary)' }}
            >
              Back to Profile
            </Button>
          </motion.div>
        </motion.div>
      </Stack>
    </PageContainer>
  );
}