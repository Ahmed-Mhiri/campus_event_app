import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
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
  Button,
  Modal,
  Textarea,
} from '@mantine/core';
import {
  IconCheck,
  IconX,
  IconFlag,
  IconEye,
} from '@tabler/icons-react';
import { useAdmin } from '@/hooks/useAdmin';
import { formatDate } from '@/utils/dateFormatter';
import { PageHeader } from '@/components/molecules/PageHeader';
import type { Event } from '@/types';

export function AdminEventsPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const {
    useAdminEvents,
    approveEvent,
    rejectEvent,
    flagEvent,
    bulkApprove,
    bulkReject,
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
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedEvents(newSet);
  };

  const handleApprove = async (id: string) => {
    await approveEvent(id);
    await refetch();
  };

  const handleReject = async (id: string) => {
    setRejectModalOpen(true);
    (window as any)._pendingRejectId = id;
  };

  const confirmReject = async () => {
    const id = (window as any)._pendingRejectId;
    if (!id) return;
    await rejectEvent(id);
    setRejectModalOpen(false);
    setRejectReason('');
    await refetch();
  };

  const handleFlag = async (id: string) => {
    await flagEvent(id);
    await refetch();
  };

  const handleBulkApprove = async () => {
    if (selectedEvents.size === 0) return;
    setActionLoading(true);
    await bulkApprove({ eventIds: Array.from(selectedEvents) });
    setSelectedEvents(new Set());
    setActionLoading(false);
    await refetch();
  };

  const handleBulkReject = async () => {
    if (selectedEvents.size === 0) return;
    setActionLoading(true);
    await bulkReject({ eventIds: Array.from(selectedEvents) });
    setSelectedEvents(new Set());
    setActionLoading(false);
    await refetch();
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
      <Center h="50vh">
        <Loader size="xl" />
      </Center>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <PageHeader title="Event Moderation" />

        <Paper withBorder p="md" radius="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Select
                placeholder="Filter by status"
                data={statusOptions}
                value={statusFilter || ''}
                onChange={(val) => setStatusFilter(val || null)}
                clearable
                w={200}
                radius="md"
              />
              <Text size="sm" c="dimmed">
                {selectedEvents.size} selected
              </Text>
            </Group>

            {selectedEvents.size > 0 && (
              <Group gap="sm">
                <Button
                  color="green"
                  size="xs"
                  onClick={handleBulkApprove}
                  loading={actionLoading}
                  radius="md"
                >
                  Approve Selected ({selectedEvents.size})
                </Button>
                <Button
                  color="red"
                  size="xs"
                  onClick={handleBulkReject}
                  loading={actionLoading}
                  radius="md"
                >
                  Reject Selected ({selectedEvents.size})
                </Button>
              </Group>
            )}

            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <Checkbox
                      checked={selectedEvents.size === events.length && events.length > 0}
                      onChange={(e) => handleSelectAll(e.currentTarget.checked)}
                      indeterminate={selectedEvents.size > 0 && selectedEvents.size < events.length}
                    />
                  </Table.Th>
                  <Table.Th>Event</Table.Th>
                  <Table.Th>Host</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {events.map((event: Event) => (
                  <Table.Tr key={event.id}>
                    <Table.Td>
                      <Checkbox
                        checked={selectedEvents.has(event.id)}
                        onChange={() => handleSelect(event.id)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500} lineClamp={1}>
                        {event.title}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{event.host.displayName}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={statusColors[event.status] || 'gray'} radius="md">
                        {event.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{formatDate(event.createdAt)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} wrap="nowrap">
                        <ActionIcon
                          size="sm"
                          color="green"
                          variant="subtle"
                          onClick={() => handleApprove(event.id)}
                          disabled={event.status === 'PUBLISHED'}
                        >
                          <IconCheck size={16} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          color="red"
                          variant="subtle"
                          onClick={() => handleReject(event.id)}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          color="yellow"
                          variant="subtle"
                          onClick={() => handleFlag(event.id)}
                        >
                          <IconFlag size={16} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          color="blue"
                          variant="subtle"
                          component={Link}
                          to={`/events/detail/${event.id}`}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {totalPages > 1 && (
              <Group justify="center">
                <Pagination
                  total={totalPages}
                  value={page + 1}
                  onChange={(p) => setPage(p - 1)}
                />
              </Group>
            )}
          </Stack>
        </Paper>
      </Stack>

      {/* Reject Modal */}
      <Modal
        opened={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectReason('');
        }}
        title="Reject Event"
        radius="xl"
      >
        <Stack>
          <Text size="sm">
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
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setRejectModalOpen(false)} radius="md">
              Cancel
            </Button>
            <Button color="red" onClick={confirmReject} radius="md">
              Reject Event
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}