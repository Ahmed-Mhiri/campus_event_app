// src/components/organisms/RsvpList/RsvpList.tsx
import { useState } from 'react';
import {
  Table,
  Badge,
  Button,
  Group,
  Select,
  Pagination,
  Loader,
  Center,
  Stack,
  Text,
  Paper,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconCheck, IconUserPlus, IconUserMinus } from '@tabler/icons-react';
import { useRsvp } from '@/hooks/useRsvp';
import { formatDate } from '@/utils/dateFormatter';
import type { Rsvp } from '@/types';

interface RsvpListProps {
  eventId: string;
  isHost?: boolean;
}

export function RsvpList({ eventId, isHost = false }: RsvpListProps) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { useEventRsvps, markAttended, promoteWaitlist } = useRsvp(eventId);
  const { data, isLoading } = useEventRsvps(eventId, statusFilter || undefined, page, pageSize);

  const rsvps = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const statusColors: Record<string, string> = {
    GOING: 'green',
    WAITLISTED: 'yellow',
    CANCELLED: 'gray',
    ATTENDED: 'blue',
  };

  const statusOptions = [
    { value: 'GOING', label: 'Going' },
    { value: 'WAITLISTED', label: 'Waitlisted' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'ATTENDED', label: 'Attended' },
  ];

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="md" />
      </Center>
    );
  }

  if (rsvps.length === 0) {
    return (
      <Paper
        withBorder
        p="xl"
        ta="center"
        radius="xl"
        style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
      >
        <Text style={{ color: 'var(--app-text-secondary)' }}>No registrations found.</Text>
      </Paper>
    );
  }

  const rows = rsvps.map((rsvp: Rsvp) => (
    <Table.Tr key={rsvp.id}>
      <Table.Td>
        <Group gap="xs">
          <Text fw={500} size="sm" style={{ color: 'var(--app-text)' }}>
            {rsvp.user.displayName}
          </Text>
          <Text size="xs" style={{ color: 'var(--app-text-muted)' }}>
            {rsvp.user.universityEmail}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color={statusColors[rsvp.status] || 'gray'} variant="light" radius="md">
          {rsvp.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
          {formatDate(rsvp.createdAt)}
        </Text>
      </Table.Td>
      <Table.Td>
        {isHost && rsvp.status === 'GOING' && (
          <Tooltip label="Mark attended">
            <ActionIcon
              color="green"
              variant="subtle"
              size="sm"
              onClick={() => markAttended({ eventId, rsvpId: rsvp.id })}
              aria-label="Mark attended"
            >
              <IconCheck size={18} />
            </ActionIcon>
          </Tooltip>
        )}
        {isHost && rsvp.status === 'WAITLISTED' && (
          <Tooltip label="Promote from waitlist">
            <ActionIcon
              color="blue"
              variant="subtle"
              size="sm"
              onClick={() => promoteWaitlist({ eventId, rsvpId: rsvp.id })}
              aria-label="Promote from waitlist"
            >
              <IconUserPlus size={18} />
            </ActionIcon>
          </Tooltip>
        )}
        {isHost && rsvp.status === 'CANCELLED' && (
          <Tooltip label="Cancelled">
            <IconUserMinus size={18} style={{ color: 'var(--app-text-muted)' }} />
          </Tooltip>
        )}
        {rsvp.status === 'ATTENDED' && (
          <Badge color="blue" size="xs" variant="light" radius="md">✓ Checked in</Badge>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Select
          placeholder="Filter by status"
          data={[{ value: '', label: 'All' }, ...statusOptions]}
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
          Total: {data?.totalElements || 0}
        </Text>
      </Group>

      <Paper
        withBorder
        radius="xl"
        style={{ overflow: 'hidden', background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
      >
        <Table.ScrollContainer minWidth={600} type="native">
          <Table
            striped
            highlightOnHover
            styles={{
              table: { background: 'var(--app-surface)' },
            }}
          >
            <Table.Thead>
              <Table.Tr style={{ background: 'var(--app-border-light)' }}>
                {['Attendee', 'Status', 'Registered', 'Actions'].map((h) => (
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
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {totalPages > 1 && (
        <Group justify="center">
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
  );
}