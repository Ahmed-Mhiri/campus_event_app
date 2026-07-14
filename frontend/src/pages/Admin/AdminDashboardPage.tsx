// src/pages/Admin/AdminDashboardPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Stack,
  SimpleGrid,
  Text,
  Group,
  Badge,
  Loader,
  Center,
  Table,
  ActionIcon,
  ThemeIcon,
  Divider,
  Modal,
  Textarea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconUsers,
  IconCalendar,
  IconAlertCircle,
  IconClock,
  IconEye,
  IconCheck,
  IconX,
  IconArrowRight,
  IconShield,
  IconTrashX,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAdmin } from '@/hooks/useAdmin';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/dateFormatter';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button as UIButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/atoms/EmptyState';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { slideUp, staggerContainer } from '@/design-system/animations';

export function AdminDashboardPage() {
  const { useDashboard, approveEvent, rejectEvent, deleteEvent } = useAdmin();
  const { data: stats, isLoading, error, refetch } = useDashboard();

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    try {
      await approveEvent(id);
      notifications.show({ title: 'Approved', message: 'Event has been published.', color: 'green' });
      await refetch();
    } catch (err) {
      notifications.show({ title: 'Error', message: 'Failed to approve event.', color: 'red' });
    }
  };

  const handleReject = (id: string) => {
    setPendingRejectId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!pendingRejectId) return;
    try {
      await rejectEvent({ id: pendingRejectId });
      notifications.show({ title: 'Rejected', message: 'Event has been rejected.', color: 'orange' });
      setRejectModalOpen(false);
      setRejectReason('');
      setPendingRejectId(null);
      await refetch();
    } catch (err) {
      notifications.show({ title: 'Error', message: 'Failed to reject event.', color: 'red' });
    }
  };

  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteEvent(pendingDeleteId);
      notifications.show({ title: 'Deleted', message: 'Event permanently removed.', color: 'red' });
      setDeleteConfirmOpen(false);
      setPendingDeleteId(null);
      await refetch();
    } catch (err) {
      notifications.show({ title: 'Error', message: 'Failed to delete event.', color: 'red' });
    }
  };

  if (isLoading) {
    return (
      <PageContainer size="xl">
        <Center h="60vh">
          <Loader size="xl" color="brand" />
        </Center>
      </PageContainer>
    );
  }

  if (error || !stats) {
    return (
      <PageContainer size="xl">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card
            variant="default"
            className="border-red-200/80 dark:border-red-900/40"
            style={{ background: 'rgba(239, 68, 68, 0.03)' }}
          >
            <Group gap="md" align="center">
              <ThemeIcon size={48} radius="xl" variant="light" color="red">
                <IconAlertCircle size={24} />
              </ThemeIcon>
              <div>
                <Text fw={600} className="text-red-700 dark:text-red-400">
                  Failed to load dashboard
                </Text>
                <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                  Could not retrieve admin statistics. Please try refreshing.
                </Text>
              </div>
            </Group>
          </Card>
        </motion.div>
      </PageContainer>
    );
  }

  const statCards = [
    {
      title: 'Pending Events',
      value: stats.pendingEventsCount,
      color: 'yellow' as const,
      icon: IconClock,
      link: ROUTES.ADMIN_EVENTS,
      gradient: 'from-yellow-500/10 to-amber-500/10',
    },
    {
      title: 'Open Reports',
      value: stats.openReportsCount,
      color: 'red' as const,
      icon: IconAlertCircle,
      link: ROUTES.ADMIN_REPORTS,
      gradient: 'from-red-500/10 to-rose-500/10',
    },
    {
      title: 'Total Users',
      value: stats.totalUsersCount,
      color: 'blue' as const,
      icon: IconUsers,
      link: ROUTES.ADMIN_USERS,
      gradient: 'from-blue-500/10 to-indigo-500/10',
    },
    {
      title: 'Events This Week',
      value: stats.eventsThisWeek,
      color: 'green' as const,
      icon: IconCalendar,
      link: ROUTES.ADMIN_EVENTS,
      gradient: 'from-green-500/10 to-emerald-500/10',
    },
  ];

  return (
    <PageContainer size="xl">
      <Stack gap="xl">
        <PageHeader
          title="Admin Dashboard"
          subtitle="Overview of platform activity and moderation queue"
          actions={
            <Badge
              color="brand"
              variant="light"
              radius="md"
              size="lg"
              leftSection={<IconShield size={14} />}
            >
              Admin
            </Badge>
          }
        />

        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div variants={slideUp}>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
              {statCards.map((card) => (
                <Card
                  key={card.title}
                  variant="elevated"
                  hover
                  component={Link}
                  to={card.link}
                  className="no-underline group relative overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                  />
                  <div className="relative">
                    <Group justify="space-between" align="flex-start">
                      <div>
                        <Text
                          size="sm"
                          fw={500}
                          className="uppercase tracking-wider"
                          style={{ color: 'var(--app-text-secondary)' }}
                        >
                          {card.title}
                        </Text>
                        <Text
                          fw={800}
                          size="2.5rem"
                          className="tracking-tight mt-1"
                          style={{ color: 'var(--app-text)' }}
                        >
                          {card.value}
                        </Text>
                      </div>
                      <ThemeIcon
                        size={48}
                        radius="xl"
                        variant="light"
                        color={card.color}
                        className="shrink-0"
                      >
                        <card.icon size={24} />
                      </ThemeIcon>
                    </Group>
                    <Group gap={4} className="mt-4" align="center">
                      <Text size="xs" style={{ color: 'var(--app-text-muted)' }}>
                        View details
                      </Text>
                      <IconArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                        style={{ color: 'var(--app-text-muted)' }}
                      />
                    </Group>
                  </div>
                </Card>
              ))}
            </SimpleGrid>
          </motion.div>

          {/* Recent Pending Events */}
          <motion.div variants={slideUp} className="mt-8">
            <Card
              variant="default"
              className="border-slate-200/80 dark:border-slate-700/60 overflow-hidden"
            >
              <Group justify="space-between" align="center" mb="md">
                <div>
                  <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>
                    Recent Pending Events
                  </Text>
                  <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                    Events awaiting approval
                  </Text>
                </div>
                <UIButton
                  component={Link}
                  to={ROUTES.ADMIN_EVENTS}
                  variant="ghost"
                  size="sm"
                  radius="xl"
                  rightSection={<IconArrowRight size={14} />}
                >
                  View all
                </UIButton>
              </Group>

              <Divider style={{ borderColor: 'var(--app-border)' }} className="mb-4" />

              {stats.recentPendingEvents.length === 0 ? (
                <EmptyState
                  icon={<IconCalendar size={32} />}
                  title="No pending events"
                  description="All caught up! No events awaiting approval."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <Table.Thead>
                      <Table.Tr
                        style={{
                          background: 'var(--app-border-light)',
                        }}
                      >
                        {['Event', 'Host', 'Created', 'Actions'].map((h) => (
                          <Table.Th
                            key={h}
                            style={{
                              color: 'var(--app-text-secondary)',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: 600,
                            }}
                          >
                            {h}
                          </Table.Th>
                        ))}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {stats.recentPendingEvents.map((event) => (
                        <Table.Tr
                          key={event.id}
                          className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                        >
                          <Table.Td>
                            <Text
                              size="sm"
                              fw={500}
                              lineClamp={1}
                              style={{ color: 'var(--app-text)' }}
                            >
                              {event.title}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                              {event.host.displayName}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" style={{ color: 'var(--app-text-muted)' }}>
                              {formatDate(event.createdAt)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap={4}>
                              <ActionIcon
                                size="sm"
                                color="green"
                                variant="subtle"
                                onClick={() => handleApprove(event.id)}
                                aria-label="Approve event"
                              >
                                <IconCheck size={16} />
                              </ActionIcon>
                              <ActionIcon
                                size="sm"
                                color="red"
                                variant="subtle"
                                onClick={() => handleReject(event.id)}
                                aria-label="Reject event"
                              >
                                <IconX size={16} />
                              </ActionIcon>
                              <ActionIcon
                                size="sm"
                                color="red"
                                variant="subtle"
                                onClick={() => handleDelete(event.id)}
                                aria-label="Permanently delete event"
                                title="Delete Forever"
                              >
                                <IconTrashX size={16} />
                              </ActionIcon>
                              <ActionIcon
                                size="sm"
                                color="blue"
                                variant="subtle"
                                component={Link}
                                to={ROUTES.ADMIN_EVENT_DETAIL(event.slug || event.id)}
                                aria-label="View event in admin mode"
                              >
                                <IconEye size={16} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Recent Reports */}
          <motion.div variants={slideUp} className="mt-8">
            <Card
              variant="default"
              className="border-slate-200/80 dark:border-slate-700/60 overflow-hidden"
            >
              <Group justify="space-between" align="center" mb="md">
                <div>
                  <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>
                    Recent Reports
                  </Text>
                  <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                    User-submitted event reports
                  </Text>
                </div>
                <UIButton
                  component={Link}
                  to={ROUTES.ADMIN_REPORTS}
                  variant="ghost"
                  size="sm"
                  radius="xl"
                  rightSection={<IconArrowRight size={14} />}
                >
                  View all
                </UIButton>
              </Group>

              <Divider style={{ borderColor: 'var(--app-border)' }} className="mb-4" />

              {stats.recentReports.length === 0 ? (
                <EmptyState
                  icon={<IconAlertCircle size={32} />}
                  title="No open reports"
                  description="No reports to review. The community is behaving!"
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <Table.Thead>
                      <Table.Tr
                        style={{
                          background: 'var(--app-border-light)',
                        }}
                      >
                        {['Event', 'Reason', 'Reporter', 'Status'].map((h) => (
                          <Table.Th
                            key={h}
                            style={{
                              color: 'var(--app-text-secondary)',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: 600,
                            }}
                          >
                            {h}
                          </Table.Th>
                        ))}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {stats.recentReports.map((report) => (
                        <Table.Tr
                          key={report.id}
                          className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                        >
                          <Table.Td>
                            <Text
                              size="sm"
                              fw={500}
                              lineClamp={1}
                              style={{ color: 'var(--app-text)' }}
                            >
                              {report.eventTitle}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color="red"
                              size="xs"
                              radius="md"
                              variant="light"
                            >
                              {report.reason}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                              {report.reporter.displayName}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color="yellow"
                              size="xs"
                              radius="md"
                              variant="light"
                              leftSection={<IconClock size={10} />}
                            >
                              Open
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </Stack>

      {/* Reject Modal */}
      <Modal
        opened={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectReason('');
          setPendingRejectId(null);
        }}
        title={
          <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>
            Reject Event
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
            Please provide a reason for rejecting this event. The host will be notified.
          </Text>
          <Textarea
            label="Reason"
            placeholder="Why is this event being rejected?"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.currentTarget.value)}
            maxLength={500}
            minRows={3}
            required
            radius="md"
            styles={{
              label: { color: 'var(--app-text)' },
              input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
            }}
          />
          <Group justify="flex-end">
            <UIButton variant="ghost" onClick={() => setRejectModalOpen(false)} radius="md">
              Cancel
            </UIButton>
            <UIButton variant="danger" onClick={confirmReject} radius="md">
              Reject Event
            </UIButton>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Event Permanently"
        message="Are you sure you want to permanently delete this event? This action cannot be undone. All associated data (RSVPs, reviews, media) will be removed."
        confirmLabel="Delete Forever"
        confirmColor="red"
      />
    </PageContainer>
  );
}