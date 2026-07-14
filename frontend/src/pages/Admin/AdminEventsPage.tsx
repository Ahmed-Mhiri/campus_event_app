import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Stack,
  Paper,
  Table,
  Badge,
  Group,
  Select,
  Pagination,
  Loader,
  Center,
  Text,
  ActionIcon,
  Checkbox,
  Modal,
  Textarea,
} from '@mantine/core';
import {
  IconCheck,
  IconX,
  IconFlag,
  IconEye,
  IconCalendarOff,
  IconTrashX, // ✅ NEW
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAdmin } from '@/hooks/useAdmin';
import { formatDate } from '@/utils/dateFormatter';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/atoms/EmptyState';
import { slideUp, staggerContainer } from '@/design-system/animations';
import type { Event } from '@/types';
import { ROUTES } from '@/constants/routes';

export function AdminEventsPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [bulkConfirmModal, setBulkConfirmModal] = useState<{ type: 'approve' | 'reject'; count: number } | null>(null);
  const [bulkRejectReason, setBulkRejectReason] = useState('');

  // ✅ NEW: Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const {
    useAdminEvents,
    approveEvent,
    rejectEvent,
    flagEvent,
    bulkApprove,
    bulkReject,
    deleteEvent, // ✅ added
  } = useAdmin();

  const { data, isLoading, refetch } = useAdminEvents(
    statusFilter || undefined,
    page,
    20
  );

  const events = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const statusColors: Record<string, string> = {
    DRAFT: 'gray',
    PUBLISHED: 'green',
    UNDER_REVIEW: 'yellow',
    CANCELLED: 'red',
    COMPLETED: 'blue',
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEvents(new Set(events.map((e: Event) => e.id)));
    } else {
      setSelectedEvents(new Set());
    }
  };

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedEvents);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedEvents(newSet);
  };

  const handleApprove = async (id: string) => {
    try {
      await approveEvent(id);
      await refetch();
    } catch (err) {
      // handled by hook
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
      setRejectModalOpen(false);
      setRejectReason('');
      setPendingRejectId(null);
      await refetch();
    } catch (err) {
      // handled by hook
    }
  };

  const handleFlag = async (id: string) => {
    try {
      await flagEvent(id);
      await refetch();
    } catch (err) {
      // handled by hook
    }
  };

  // ✅ NEW: Delete handler
  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteEvent(pendingDeleteId);
      setDeleteConfirmOpen(false);
      setPendingDeleteId(null);
      await refetch();
    } catch (err) {
      // handled by hook
    }
  };

  const handleBulkApprove = () => {
    if (selectedEvents.size === 0) return;
    setBulkConfirmModal({ type: 'approve', count: selectedEvents.size });
    setBulkRejectReason('');
  };

  const handleBulkReject = () => {
    if (selectedEvents.size === 0) return;
    setBulkConfirmModal({ type: 'reject', count: selectedEvents.size });
    setBulkRejectReason('');
  };

  const confirmBulkAction = async () => {
    if (!bulkConfirmModal) return;
    setActionLoading(true);
    try {
      if (bulkConfirmModal.type === 'approve') {
        await bulkApprove({ eventIds: Array.from(selectedEvents) });
      } else {
        await bulkReject({ eventIds: Array.from(selectedEvents), reason: bulkRejectReason || undefined });
      }
      setSelectedEvents(new Set());
      setBulkConfirmModal(null);
      setBulkRejectReason('');
      await refetch();
    } catch (err) {
      // handled by hook
    } finally {
      setActionLoading(false);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  if (isLoading) {
    return (
      <PageContainer size="xl">
        <Center h="60vh">
          <Loader size="xl" color="brand" />
        </Center>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="xl">
      <Stack gap="xl">
        <PageHeader
          title="Event Moderation"
          subtitle="Review, approve, and manage all platform events"
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={slideUp}>
            <Paper
              withBorder
              p="lg"
              radius="xl"
              className="border-slate-200/80 dark:border-slate-700/60"
              style={{ background: 'var(--app-surface)' }}
            >
              <Stack gap="md">
                <Group justify="space-between" wrap="wrap" gap="sm">
                  <Select
                    placeholder="Filter by status"
                    data={statusOptions}
                    value={statusFilter || ''}
                    onChange={(val) => setStatusFilter(val || null)}
                    clearable
                    w={200}
                    radius="md"
                    styles={{
                      input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
                      dropdown: { background: 'var(--app-surface)', borderColor: 'var(--app-border)' },
                    }}
                  />
                  <Text size="sm" style={{ color: 'var(--app-text-muted)' }}>
                    {selectedEvents.size} selected
                  </Text>
                </Group>

                {selectedEvents.size > 0 && (
                  <Group gap="sm">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleBulkApprove}
                      isLoading={actionLoading}
                      radius="md"
                    >
                      Approve Selected ({selectedEvents.size})
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleBulkReject}
                      isLoading={actionLoading}
                      radius="md"
                    >
                      Reject Selected ({selectedEvents.size})
                    </Button>
                  </Group>
                )}

                {events.length === 0 ? (
                  <EmptyState
                    icon={<IconCalendarOff size={32} />}
                    title="No events found"
                    description="Try adjusting your filters or check back later."
                  />
                ) : (
                  <Table.ScrollContainer minWidth={700} type="native">
                    <Table
                      striped
                      highlightOnHover
                      styles={{
                        table: { background: 'var(--app-surface)' },
                      }}
                    >
                      <Table.Thead>
                        <Table.Tr style={{ background: 'var(--app-border-light)' }}>
                          <Table.Th>
                            <Checkbox
                              checked={selectedEvents.size === events.length && events.length > 0}
                              onChange={(e) => handleSelectAll(e.currentTarget.checked)}
                              indeterminate={selectedEvents.size > 0 && selectedEvents.size < events.length}
                              aria-label="Select all events"
                            />
                          </Table.Th>
                          {['Event', 'Host', 'Status', 'Created', 'Actions'].map((h) => (
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
                        {events.map((event: Event) => {
                          const isUnderReview = event.status === 'UNDER_REVIEW';
                          return (
                            <Table.Tr
                              key={event.id}
                              className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                            >
                              <Table.Td>
                                <Checkbox
                                  checked={selectedEvents.has(event.id)}
                                  onChange={() => handleSelect(event.id)}
                                  aria-label={`Select ${event.title}`}
                                />
                              </Table.Td>
                              <Table.Td>
                                <Group gap="xs">
                                  <Text size="sm" fw={500} lineClamp={1} style={{ color: 'var(--app-text)' }}>
                                    {event.title}
                                  </Text>
                                  {isUnderReview && (
                                    <Badge color="yellow" size="xs" radius="md" variant="filled">
                                      Under Review
                                    </Badge>
                                  )}
                                </Group>
                              </Table.Td>
                              <Table.Td>
                                <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                                  {event.host.displayName}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Badge color={statusColors[event.status] || 'gray'} radius="md">
                                  {event.status}
                                </Badge>
                              </Table.Td>
                              <Table.Td>
                                <Text size="sm" style={{ color: 'var(--app-text-muted)' }}>
                                  {formatDate(event.createdAt)}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Group gap={4} wrap="nowrap">
                                  <ActionIcon
                                    size="sm"
                                    color="green"
                                    variant="subtle"
                                    onClick={() => handleApprove(event.id)}
                                    disabled={!isUnderReview}
                                    aria-label="Approve event"
                                  >
                                    <IconCheck size={16} />
                                  </ActionIcon>
                                  <ActionIcon
                                    size="sm"
                                    color="red"
                                    variant="subtle"
                                    onClick={() => handleReject(event.id)}
                                    disabled={!isUnderReview}
                                    aria-label="Reject event"
                                  >
                                    <IconX size={16} />
                                  </ActionIcon>
                                  <ActionIcon
                                    size="sm"
                                    color="yellow"
                                    variant="subtle"
                                    onClick={() => handleFlag(event.id)}
                                    disabled={event.status !== 'PUBLISHED' && event.status !== 'COMPLETED'}
                                    aria-label="Flag event"
                                  >
                                    <IconFlag size={16} />
                                  </ActionIcon>
                                  {/* ✅ NEW: Delete Permanently */}
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
                                  {/* ✅ UPDATED: Admin view link */}
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
                          );
                        })}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                )}

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
            </Paper>
          </motion.div>
        </motion.div>
      </Stack>

      {/* Single reject modal */}
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
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)} radius="md">
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmReject} radius="md">
              Reject Event
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Bulk action modal */}
      <Modal
        opened={!!bulkConfirmModal}
        onClose={() => {
          setBulkConfirmModal(null);
          setBulkRejectReason('');
        }}
        title={
          <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>
            Bulk {bulkConfirmModal?.type === 'approve' ? 'Approve' : 'Reject'}
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
            Are you sure you want to {bulkConfirmModal?.type === 'approve' ? 'approve' : 'reject'} {bulkConfirmModal?.count} event(s)?
          </Text>
          {bulkConfirmModal?.type === 'reject' && (
            <Textarea
              label="Rejection Reason (optional but recommended)"
              placeholder="Provide a reason for rejecting these events (will be sent to hosts)"
              value={bulkRejectReason}
              onChange={(e) => setBulkRejectReason(e.currentTarget.value)}
              maxLength={500}
              minRows={2}
              radius="md"
              styles={{
                label: { color: 'var(--app-text)' },
                input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
              }}
            />
          )}
          <Group justify="flex-end">
            <Button variant="ghost" onClick={() => setBulkConfirmModal(null)} radius="md">
              Cancel
            </Button>
            <Button
              color={bulkConfirmModal?.type === 'approve' ? 'green' : 'red'}
              onClick={confirmBulkAction}
              loading={actionLoading}
              radius="md"
            >
              {bulkConfirmModal?.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ✅ NEW: Delete Confirmation Modal */}
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