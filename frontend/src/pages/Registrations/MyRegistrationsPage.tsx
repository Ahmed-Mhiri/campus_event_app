// src/pages/Registrations/MyRegistrationsPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Stack,
  SimpleGrid,
  Text,
  Badge,
  Group,
  Loader,
  Center,
  Modal,
  Textarea,
  Button,
  ThemeIcon,
  Divider,
} from '@mantine/core';
import {
  IconCalendar,
  IconClock,
  IconCheck,
  IconX,
  IconHourglass,
  IconArrowRight,
  IconTicket,
  IconSearch,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useRsvp } from '@/hooks/useRsvp';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/dateFormatter';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button as UIButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/atoms/EmptyState';
import { slideUp, staggerContainer } from '@/design-system/animations';
import type { Rsvp } from '@/types';

type TabKey = 'going' | 'waitlisted' | 'attended' | 'cancelled';

const tabConfig: Record<
  TabKey,
  {
    label: string;
    status: string;
    icon: typeof IconCalendar;
    color: string;
    emptyTitle: string;
    emptyDesc: string;
  }
> = {
  going: {
    label: 'Upcoming',
    status: 'GOING',
    icon: IconCalendar,
    color: 'green',
    emptyTitle: 'No upcoming events',
    emptyDesc:
      'You have no confirmed registrations. Browse events and find something exciting!',
  },
  waitlisted: {
    label: 'Waitlisted',
    status: 'WAITLISTED',
    icon: IconHourglass,
    color: 'yellow',
    emptyTitle: 'Not on any waitlists',
    emptyDesc:
      'When popular events fill up, you can join the waitlist and get notified if a spot opens.',
  },
  attended: {
    label: 'Attended',
    status: 'ATTENDED',
    icon: IconCheck,
    color: 'blue',
    emptyTitle: 'No past events',
    emptyDesc:
      'Events you check into will appear here. Time to make some memories!',
  },
  cancelled: {
    label: 'Cancelled',
    status: 'CANCELLED',
    icon: IconX,
    color: 'gray',
    emptyTitle: 'No cancelled registrations',
    emptyDesc:
      'You have no cancelled registrations. Your commitment is admirable!',
  },
};

const statusConfig: Record<
  string,
  { color: string; label: string; icon: typeof IconCalendar }
> = {
  GOING: { color: 'green', label: 'Confirmed', icon: IconCheck },
  WAITLISTED: { color: 'yellow', label: 'Waitlisted', icon: IconHourglass },
  ATTENDED: { color: 'blue', label: 'Attended', icon: IconCheck },
  CANCELLED: { color: 'gray', label: 'Cancelled', icon: IconX },
};

export function MyRegistrationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('going');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRsvp, setSelectedRsvp] = useState<Rsvp | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { useMyRsvps, cancelRsvp, isCancelling } = useRsvp();
  const { data, isLoading } = useMyRsvps(tabConfig[activeTab].status, 0, 50);

  const rsvps = data?.content || [];

  const handleCancel = (rsvp: Rsvp) => {
    setSelectedRsvp(rsvp);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedRsvp) return;
    await cancelRsvp({
      rsvpId: selectedRsvp.id,
      reason: cancelReason || undefined,
    });
    setCancelModalOpen(false);
    setSelectedRsvp(null);
    setCancelReason('');
  };

  const currentTab = tabConfig[activeTab];

  return (
    <PageContainer size="lg">
      <Stack gap="xl">
        <PageHeader
          title="My Registrations"
          subtitle="Track your event registrations, waitlists, and attendance history"
          breadcrumbs={[
            { label: 'Profile', href: ROUTES.PROFILE },
            { label: 'Registrations' },
          ]}
          actions={
            <UIButton
              component={Link}
              to={ROUTES.EVENTS}
              variant="primary"
              radius="xl"
              leftSection={<IconSearch size={16} />}
            >
              Browse Events
            </UIButton>
          }
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Custom tab pills */}
          <motion.div variants={slideUp}>
            <Group
              gap="xs"
              className="border-b mb-6"
              style={{ borderColor: 'var(--app-border)' }}
            >
              {(Object.keys(tabConfig) as TabKey[]).map((key) => {
                const active = activeTab === key;
                const config = tabConfig[key];
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`relative px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
                      active
                        ? 'text-violet-600 dark:text-violet-400'
                        : 'hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    style={active ? {} : { color: 'var(--app-text-secondary)' }}
                    aria-pressed={active}
                  >
                    <config.icon size={16} />
                    {config.label}
                    {active && (
                      <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </Group>
          </motion.div>

          {/* Content */}
          <motion.div variants={slideUp}>
            {isLoading ? (
              <Center py="xl">
                <Loader size="md" color="brand" />
              </Center>
            ) : rsvps.length === 0 ? (
              <Card
                variant="default"
                className="border-slate-200/80 dark:border-slate-700/60"
              >
                <EmptyState
                  icon={<currentTab.icon size={32} />}
                  title={currentTab.emptyTitle}
                  description={currentTab.emptyDesc}
                />
                {activeTab === 'going' && (
                  <div className="text-center pb-8">
                    <UIButton
                      component={Link}
                      to={ROUTES.EVENTS}
                      variant="primary"
                      radius="xl"
                      leftSection={<IconSearch size={16} />}
                    >
                      Find events
                    </UIButton>
                  </div>
                )}
              </Card>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {rsvps.map((rsvp, index) => (
                  <RegistrationCard
                    key={rsvp.id}
                    rsvp={rsvp}
                    index={index}
                    onCancel={handleCancel}
                  />
                ))}
              </SimpleGrid>
            )}
          </motion.div>
        </motion.div>
      </Stack>

      {/* Cancel Modal */}
      <Modal
        opened={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedRsvp(null);
          setCancelReason('');
        }}
        title={
          <Text fw={600} style={{ color: 'var(--app-text)' }}>
            Cancel Registration
          </Text>
        }
        centered
        radius="xl"
      >
        <Stack gap="md">
          <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
            Are you sure you want to cancel your registration for{' '}
            <Text span fw={600} style={{ color: 'var(--app-text)' }}>
              {selectedRsvp?.eventTitle}
            </Text>
            ?
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
            styles={{ label: { color: 'var(--app-text)' } }}
          />
          <Group justify="flex-end" gap="sm">
            <Button
              variant="default"
              onClick={() => setCancelModalOpen(false)}
              radius="md"
            >
              Keep Registration
            </Button>
            <Button
              color="red"
              onClick={confirmCancel}
              loading={isCancelling}
              radius="md"
            >
              Yes, Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
    </PageContainer>
  );
}

// ─── Sub-component: Registration Card ───

interface RegistrationCardProps {
  rsvp: Rsvp;
  index: number;
  onCancel: (rsvp: Rsvp) => void;
}

function RegistrationCard({ rsvp, index, onCancel }: RegistrationCardProps) {
  const config = statusConfig[rsvp.status] || statusConfig.GOING;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        variant="default"
        className="border-slate-200/80 dark:border-slate-700/60 overflow-hidden h-full flex flex-col"
      >
        {/* Header with icon — no event image since we don't have it */}
        <div
          className="relative h-24 flex items-center justify-center"
          style={{ background: 'var(--app-border-light)' }}
        >
          <ThemeIcon size={48} radius="xl" variant="light" color="gray">
            <IconTicket size={24} />
          </ThemeIcon>
          {/* Status badge overlay */}
          <div className="absolute top-3 right-3">
            <Badge
              color={config.color}
              variant="filled"
              radius="md"
              size="sm"
              leftSection={<StatusIcon size={12} />}
            >
              {config.label}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <Text
            fw={600}
            size="md"
            lineClamp={2}
            className="mb-3 leading-snug"
            style={{ color: 'var(--app-text)' }}
          >
            {rsvp.eventTitle}
          </Text>

          <Stack gap="xs" className="mb-4">
            <Group gap="xs" wrap="nowrap">
              <IconClock
                size={14}
                style={{ color: 'var(--app-text-muted)' }}
              />
              <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                Registered {formatDate(rsvp.createdAt)}
              </Text>
            </Group>
            <Group gap="xs" wrap="nowrap">
              <IconCalendar
                size={14}
                style={{ color: 'var(--app-text-muted)' }}
              />
              <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                Status: {rsvp.status}
              </Text>
            </Group>
          </Stack>

          <Divider
            style={{ borderColor: 'var(--app-border)' }}
            className="my-auto"
          />

          <Group justify="space-between" mt="md" className="pt-2">
            <Button
              component={Link}
              to={ROUTES.EVENT_DETAIL(rsvp.eventId)}
              variant="light"
              color="brand"
              size="sm"
              radius="md"
              rightSection={<IconArrowRight size={14} />}
            >
              View Event
            </Button>

            {rsvp.status === 'GOING' && (
              <Button
                color="red"
                variant="subtle"
                size="sm"
                radius="md"
                onClick={() => onCancel(rsvp)}
              >
                Cancel
              </Button>
            )}
          </Group>
        </div>
      </Card>
    </motion.div>
  );
}