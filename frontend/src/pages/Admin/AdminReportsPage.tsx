// src/pages/Admin/AdminReportsPage.tsx
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
  Button,
  Modal,
  Anchor,
  Textarea,
  Divider,
} from '@mantine/core';
import { IconCheck, IconX, IconEye, IconFlag, IconExternalLink } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAdmin } from '@/hooks/useAdmin';
import { formatDate } from '@/utils/dateFormatter';
import { ROUTES } from '@/constants/routes';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/atoms/EmptyState';
import { slideUp, staggerContainer } from '@/design-system/animations';
import type { Report } from '@/types';

export function AdminReportsPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [reasonFilter, setReasonFilter] = useState<string | null>(null);

  // Modals state
  const [viewedReport, setViewedReport] = useState<Report | null>(null);
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
    setViewedReport(null);
  };

  const handleDelete = (reportId: string) => {
    setDeleteConfirm({ reportId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await deleteReport(deleteConfirm.reportId);
    setDeleteConfirm(null);
    setViewedReport(null);
    await refetch();
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

  return (
    <PageContainer size="xl">
      <Stack gap="xl">
        <PageHeader
          title="Report Moderation"
          subtitle="Review and resolve user-submitted event reports"
        />

        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div variants={slideUp}>
            <Paper
              withBorder
              p="lg"
              radius="xl"
              className="border-slate-200/80 dark:border-slate-700/60"
              style={{ background: 'var(--app-surface)' }}
            >
              <Stack gap="md">
                <Group gap="sm" wrap="wrap">
                  <Select
                    placeholder="Status"
                    data={statusOptions}
                    value={statusFilter || ''}
                    onChange={(val) => setStatusFilter(val || null)}
                    clearable
                    w={150}
                    radius="md"
                    styles={{
                      input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
                      dropdown: { background: 'var(--app-surface)', borderColor: 'var(--app-border)' },
                    }}
                  />
                  <Select
                    placeholder="Reason"
                    data={reasonOptions}
                    value={reasonFilter || ''}
                    onChange={(val) => setReasonFilter(val || null)}
                    clearable
                    w={150}
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

                {reports.length === 0 ? (
                  <EmptyState
                    icon={<IconFlag size={32} />}
                    title="No reports found"
                    description="No reports match your current filters."
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
                          {['Event', 'Reason', 'Reporter', 'Status', 'Created', 'Actions'].map((h) => (
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
                        {reports.map((report: Report) => (
                          <Table.Tr
                            key={report.id}
                            className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                          >
                            <Table.Td>
                              <Anchor
                                component={Link}
                                to={ROUTES.ADMIN_EVENT_DETAIL(report.eventId)}
                                target="_blank"
                                fw={500}
                                size="sm"
                                lineClamp={1}
                                style={{ color: 'var(--app-primary)' }}
                                className="hover:underline flex items-center gap-1"
                              >
                                {report.eventTitle} <IconExternalLink size={12} />
                              </Anchor>
                            </Table.Td>
                            <Table.Td>
                              <Badge color="red" radius="md" variant="light">
                                {report.reason}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Anchor
                                component={Link}
                                to={ROUTES.USER_PROFILE(report.reporter.id)}
                                target="_blank"
                                size="sm"
                                style={{ color: 'var(--app-text)' }}
                                className="hover:text-brand-500 flex items-center gap-1"
                              >
                                {report.reporter.displayName} <IconExternalLink size={12} />
                              </Anchor>
                            </Table.Td>
                            <Table.Td>
                              <Badge
                                color={report.status === 'OPEN' ? 'yellow' : 'green'}
                                radius="md"
                                variant="light"
                              >
                                {report.status}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm" style={{ color: 'var(--app-text-muted)' }}>
                                {formatDate(report.createdAt)}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Group gap={4}>
                                <ActionIcon
                                  color="blue"
                                  variant="subtle"
                                  size="sm"
                                  onClick={() => setViewedReport(report)}
                                  title="View Report Details"
                                  aria-label="View Report Details"
                                >
                                  <IconEye size={16} />
                                </ActionIcon>
                                <ActionIcon
                                  color="red"
                                  variant="subtle"
                                  size="sm"
                                  onClick={() => handleDelete(report.id)}
                                  aria-label="Delete report"
                                >
                                  <IconX size={16} />
                                </ActionIcon>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        ))}
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

      {/* View Details Modal */}
      <Modal
        opened={!!viewedReport}
        onClose={() => setViewedReport(null)}
        title={
          <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>
            Report Details
          </Text>
        }
        size="lg"
        radius="xl"
        styles={{
          content: { background: 'var(--app-surface)' },
          header: { background: 'var(--app-surface)', borderBottom: '1px solid var(--app-border)' },
        }}
      >
        {viewedReport && (
          <Stack gap="md" mt="sm">
            <Group grow align="flex-start">
              <div>
                <Text size="xs" fw={700} className="uppercase" style={{ color: 'var(--app-text-muted)' }}>
                  Reported Event
                </Text>
                <Anchor
                  component={Link}
                  to={ROUTES.ADMIN_EVENT_DETAIL(viewedReport.eventId)}
                  target="_blank"
                  fw={500}
                  className="flex items-center gap-1"
                >
                  {viewedReport.eventTitle} <IconExternalLink size={14} />
                </Anchor>
              </div>
              <div>
                <Text size="xs" fw={700} className="uppercase" style={{ color: 'var(--app-text-muted)' }}>
                  Reported By
                </Text>
                <Anchor
                  component={Link}
                  to={ROUTES.USER_PROFILE(viewedReport.reporter.id)}
                  target="_blank"
                  fw={500}
                  className="flex items-center gap-1 text-slate-700 dark:text-slate-300"
                >
                  {viewedReport.reporter.displayName} <IconExternalLink size={14} />
                </Anchor>
              </div>
            </Group>

            <div>
              <Text size="xs" fw={700} className="uppercase mb-1" style={{ color: 'var(--app-text-muted)' }}>
                Reason
              </Text>
              <Badge color="red">{viewedReport.reason}</Badge>
            </div>

            <div>
              <Text size="xs" fw={700} className="uppercase mb-1" style={{ color: 'var(--app-text-muted)' }}>
                Message / Details
              </Text>
              <Textarea
                readOnly
                value={viewedReport.details || 'No additional details were provided.'}
                minRows={4}
                maxRows={8}
                autosize
                styles={{
                  input: {
                    background: 'var(--app-bg)',
                    color: 'var(--app-text)',
                    borderColor: 'var(--app-border)',
                    cursor: 'default',
                  },
                }}
              />
            </div>

            <Divider my="sm" style={{ borderColor: 'var(--app-border)' }} />

            {/* Admin Actions */}
            {viewedReport.status === 'OPEN' ? (
              <Group justify="flex-end">
                <Button
                  variant="default"
                  color="gray"
                  onClick={() => handleResolve(viewedReport.id, false)}
                  leftSection={<IconCheck size={16} />}
                >
                  Dismiss (Resolve without action)
                </Button>
                <Button
                  color="orange"
                  onClick={() => handleResolve(viewedReport.id, true)}
                  leftSection={<IconFlag size={16} />}
                >
                  Resolve & Flag Event
                </Button>
              </Group>
            ) : (
              <Badge color="green" radius="md" size="lg">
                This report has already been resolved.
              </Badge>
            )}
          </Stack>
        )}
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
    </PageContainer>
  );
}