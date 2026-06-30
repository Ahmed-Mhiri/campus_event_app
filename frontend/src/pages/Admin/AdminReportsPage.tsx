import { useState } from 'react';
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
  Button,
  Modal,
} from '@mantine/core';
import { IconCheck, IconX, IconEye } from '@tabler/icons-react';
import { useAdmin } from '@/hooks/useAdmin';
import { formatDate } from '@/utils/dateFormatter';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { Report } from '@/types';

export function AdminReportsPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [reasonFilter, setReasonFilter] = useState<string | null>(null);
  const [resolveModal, setResolveModal] = useState<{ report: Report; flag: boolean } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ reportId: string } | null>(null);

  const { useAdminReports, resolveReport, deleteReport } = useAdmin();
  const { data, isLoading, refetch } = useAdminReports({
    status: statusFilter || undefined,
    reason: reasonFilter || undefined,
    page,
    size: 20,
  });

  const reports = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'OPEN', label: 'Open' },
    { value: 'RESOLVED', label: 'Resolved' },
  ];
  const reasonOptions = [
    { value: '', label: 'All' },
    { value: 'SPAM', label: 'Spam' },
    { value: 'INAPPROPRIATE', label: 'Inappropriate' },
    { value: 'FAKE_EVENT', label: 'Fake Event' },
    { value: 'OTHER', label: 'Other' },
  ];

  const handleResolve = async (reportId: string, flagEvent: boolean) => {
    await resolveReport({ reportId, flagEvent });
    await refetch();
    setResolveModal(null);
  };

  const handleDelete = (reportId: string) => {
    setDeleteConfirm({ reportId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await deleteReport(deleteConfirm.reportId);
    setDeleteConfirm(null);
    await refetch();
  };

  if (isLoading) return <Center h="50vh"><Loader size="xl" /></Center>;

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <PageHeader title="Report Moderation" />

        <Paper withBorder p="md" radius="lg">
          <Stack gap="md">
            <Group>
              <Select
                placeholder="Status"
                data={statusOptions}
                value={statusFilter || ''}
                onChange={(val) => setStatusFilter(val || null)}
                clearable
                w={150}
                radius="md"
              />
              <Select
                placeholder="Reason"
                data={reasonOptions}
                value={reasonFilter || ''}
                onChange={(val) => setReasonFilter(val || null)}
                clearable
                w={150}
                radius="md"
              />
              <Text size="sm" c="dimmed">
                Total: {data?.totalElements || 0}
              </Text>
            </Group>

            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Event</Table.Th>
                  <Table.Th>Reason</Table.Th>
                  <Table.Th>Reporter</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {reports.map((report: Report) => (
                  <Table.Tr key={report.id}>
                    <Table.Td>
                      <Text fw={500} lineClamp={1}>
                        {report.eventTitle}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="red" radius="md">{report.reason}</Badge>
                    </Table.Td>
                    <Table.Td>{report.reporter.displayName}</Table.Td>
                    <Table.Td>
                      <Badge color={report.status === 'OPEN' ? 'yellow' : 'green'} radius="md">
                        {report.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{formatDate(report.createdAt)}</Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        {report.status === 'OPEN' && (
                          <ActionIcon
                            color="green"
                            variant="subtle"
                            onClick={() => setResolveModal({ report, flag: false })}
                            title="Resolve without flagging"
                          >
                            <IconCheck size={16} />
                          </ActionIcon>
                        )}
                        {report.status === 'OPEN' && (
                          <ActionIcon
                            color="orange"
                            variant="subtle"
                            onClick={() => setResolveModal({ report, flag: true })}
                            title="Resolve and flag event"
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        )}
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => handleDelete(report.id)}
                        >
                          <IconX size={16} />
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

      {/* Resolve Modal */}
      <Modal
        opened={!!resolveModal}
        onClose={() => setResolveModal(null)}
        title="Resolve Report"
        radius="xl"
      >
        <Stack>
          <Text>
            {resolveModal?.flag
              ? 'This will resolve the report and flag the event (move to UNDER_REVIEW).'
              : 'This will resolve the report without flagging the event.'}
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setResolveModal(null)} radius="md">
              Cancel
            </Button>
            <Button
              color={resolveModal?.flag ? 'orange' : 'green'}
              onClick={() =>
                resolveModal &&
                handleResolve(resolveModal.report.id, resolveModal.flag)
              }
              radius="md"
            >
              Confirm
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmModal
        opened={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        confirmLabel="Delete"
        confirmColor="red"
      />
    </Container>
  );
}