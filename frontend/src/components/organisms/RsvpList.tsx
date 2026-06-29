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
      <Paper withBorder p="xl" ta="center">
        <Text c="dimmed">No registrations found.</Text>
      </Paper>
    );
  }

  const rows = rsvps.map((rsvp: Rsvp) => (
    <Table.Tr key={rsvp.id}>
      <Table.Td>
        <Group gap="xs">
          <Text fw={500}>{rsvp.user.displayName}</Text>
          <Text size="xs" c="dimmed">{rsvp.user.universityEmail}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color={statusColors[rsvp.status] || 'gray'}>
          {rsvp.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatDate(rsvp.createdAt)}</Text>
      </Table.Td>
      <Table.Td>
        {isHost && rsvp.status === 'GOING' && (
          <Tooltip label="Mark attended">
            <ActionIcon
              color="green"
              variant="subtle"
              onClick={() => markAttended({ eventId, rsvpId: rsvp.id })}
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
              onClick={() => promoteWaitlist({ eventId, rsvpId: rsvp.id })}
            >
              <IconUserPlus size={18} />
            </ActionIcon>
          </Tooltip>
        )}
        {isHost && rsvp.status === 'CANCELLED' && (
          <Tooltip label="Cancelled">
            <IconUserMinus size={18} color="gray" />
          </Tooltip>
        )}
        {rsvp.status === 'ATTENDED' && (
          <Badge color="blue" size="xs">✓ Checked in</Badge>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Select
          placeholder="Filter by status"
          data={[{ value: '', label: 'All' }, ...statusOptions]}
          value={statusFilter || ''}
          onChange={(val) => setStatusFilter(val || null)}
          clearable
          w={200}
        />
        <Text size="sm" c="dimmed">
          Total: {data?.totalElements || 0}
        </Text>
      </Group>

      <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Attendee</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Registered</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>

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
  );
}