// src/pages/Admin/AdminUsersPage.tsx
import { useState } from 'react';
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
  TextInput,
  Modal,
  Menu,
  Divider,
} from '@mantine/core';
import {
  IconSearch,
  IconFlag,
  IconUserCheck,
  IconUserX,
  IconDots,
  IconShield,
  IconUsers,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAdmin } from '@/hooks/useAdmin';
import { formatDate } from '@/utils/dateFormatter';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/atoms/EmptyState';
import { slideUp, staggerContainer } from '@/design-system/animations';
import type { User } from '@/types';

export function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [trustFilter, setTrustFilter] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [trustModalOpen, setTrustModalOpen] = useState(false);
  const [newTrustLevel, setNewTrustLevel] = useState('');

  // confirmation states
  const [flagConfirm, setFlagConfirm] = useState<{ userId: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ userId: string } | null>(null);
  const [promoteConfirm, setPromoteConfirm] = useState<{ userId: string } | null>(null);

  const { useUsers, updateTrustLevel, flagUser, promoteUser, deleteUser } = useAdmin();

  const { data, isLoading, refetch } = useUsers(search || undefined, trustFilter || undefined, page, 20);
  const users = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const trustColors: Record<string, string> = {
    NEW: 'gray',
    TRUSTED_HOST: 'green',
    FLAGGED: 'red',
  };

  const handlePromote = async (userId: string) => {
    setPromoteConfirm({ userId });
  };

  const confirmPromote = async () => {
    if (!promoteConfirm) return;
    await promoteUser({ userId: promoteConfirm.userId, force: false });
    setPromoteConfirm(null);
    await refetch();
  };

  const handleFlag = async (userId: string) => {
    setFlagConfirm({ userId });
  };

  const confirmFlag = async () => {
    if (!flagConfirm) return;
    await flagUser(flagConfirm.userId);
    setFlagConfirm(null);
    await refetch();
  };

  const handleDelete = async (userId: string) => {
    setDeleteConfirm({ userId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await deleteUser(deleteConfirm.userId);
    setDeleteConfirm(null);
    await refetch();
  };

  const openTrustModal = (user: User) => {
    setSelectedUser(user);
    setNewTrustLevel(user.trustLevel);
    setTrustModalOpen(true);
  };

  const confirmTrustUpdate = async () => {
    if (!selectedUser) return;
    await updateTrustLevel({ userId: selectedUser.id, trustLevel: newTrustLevel });
    setTrustModalOpen(false);
    await refetch();
  };

  const trustOptions = [
    { value: 'NEW', label: 'New' },
    { value: 'TRUSTED_HOST', label: 'Trusted Host' },
    { value: 'FLAGGED', label: 'Flagged' },
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
          title="User Management"
          subtitle="Manage users, trust levels, and account status"
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
                  <Group gap="sm">
                    <TextInput
                      placeholder="Search users..."
                      value={search}
                      onChange={(e) => setSearch(e.currentTarget.value)}
                      leftSection={<IconSearch size={16} style={{ color: 'var(--app-text-muted)' }} />}
                      w={250}
                      radius="md"
                      styles={{
                        input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
                      }}
                    />
                    <Select
                      placeholder="Trust level"
                      data={trustOptions}
                      value={trustFilter || ''}
                      onChange={(val) => setTrustFilter(val || null)}
                      clearable
                      w={150}
                      radius="md"
                      styles={{
                        input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
                        dropdown: { background: 'var(--app-surface)', borderColor: 'var(--app-border)' },
                      }}
                    />
                  </Group>
                  <Text size="sm" style={{ color: 'var(--app-text-muted)' }}>
                    Total: {data?.totalElements || 0} users
                  </Text>
                </Group>

                {users.length === 0 ? (
                  <EmptyState
                    icon={<IconUsers size={32} />}
                    title="No users found"
                    description="Try adjusting your search or filter criteria."
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
                          {['User', 'Email', 'Role', 'Trust Level', 'Joined', 'Actions'].map((h) => (
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
                        {users.map((user: User) => (
                          <Table.Tr
                            key={user.id}
                            className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                          >
                            <Table.Td>
                              <Group gap="xs">
                                <Text fw={500} size="sm" style={{ color: 'var(--app-text)' }}>
                                  {user.displayName}
                                </Text>
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                                {user.universityEmail}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Badge
                                color={user.role === 'ADMIN' ? 'blue' : 'gray'}
                                radius="md"
                                variant="light"
                              >
                                {user.role}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Badge
                                color={trustColors[user.trustLevel] || 'gray'}
                                radius="md"
                                variant="light"
                              >
                                {user.trustLevel}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm" style={{ color: 'var(--app-text-muted)' }}>
                                {formatDate(user.createdAt)}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Menu position="bottom-end" withinPortal>
                                <Menu.Target>
                                  <ActionIcon
                                    variant="subtle"
                                    size="sm"
                                    style={{ color: 'var(--app-text-muted)' }}
                                  >
                                    <IconDots size={16} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown
                                  style={{
                                    background: 'var(--app-surface)',
                                    borderColor: 'var(--app-border)',
                                  }}
                                >
                                  <Menu.Item
                                    leftSection={<IconShield size={14} style={{ color: 'var(--app-text-secondary)' }} />}
                                    onClick={() => openTrustModal(user)}
                                    style={{ color: 'var(--app-text)' }}
                                  >
                                    Change Trust Level
                                  </Menu.Item>
                                  {user.trustLevel !== 'TRUSTED_HOST' && (
                                    <Menu.Item
                                      leftSection={<IconUserCheck size={14} style={{ color: 'var(--app-text-secondary)' }} />}
                                      onClick={() => handlePromote(user.id)}
                                      style={{ color: 'var(--app-text)' }}
                                    >
                                      Promote to Trusted Host
                                    </Menu.Item>
                                  )}
                                  {user.trustLevel !== 'FLAGGED' && (
                                    <Menu.Item
                                      leftSection={<IconFlag size={14} style={{ color: 'var(--app-text-secondary)' }} />}
                                      color="orange"
                                      onClick={() => handleFlag(user.id)}
                                    >
                                      Flag User
                                    </Menu.Item>
                                  )}
                                  <Menu.Divider style={{ borderColor: 'var(--app-border)' }} />
                                  <Menu.Item
                                    leftSection={<IconUserX size={14} />}
                                    color="red"
                                    onClick={() => handleDelete(user.id)}
                                  >
                                    Delete User
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
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

      {/* Trust Level Modal */}
      <Modal
        opened={trustModalOpen}
        onClose={() => setTrustModalOpen(false)}
        title={
          <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>
            Change Trust Level
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
            Update trust level for <strong style={{ color: 'var(--app-text)' }}>{selectedUser?.displayName}</strong>
          </Text>
          <Select
            label="Trust Level"
            data={trustOptions}
            value={newTrustLevel}
            onChange={(val) => setNewTrustLevel(val || 'NEW')}
            radius="md"
            styles={{
              label: { color: 'var(--app-text)' },
              input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
              dropdown: { background: 'var(--app-surface)', borderColor: 'var(--app-border)' },
            }}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setTrustModalOpen(false)} radius="md">
              Cancel
            </Button>
            <Button onClick={confirmTrustUpdate} radius="md" color="brand">
              Update
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Confirm Promotion */}
      <ConfirmModal
        opened={!!promoteConfirm}
        onClose={() => setPromoteConfirm(null)}
        onConfirm={confirmPromote}
        title="Promote to Trusted Host"
        message="Are you sure you want to promote this user to Trusted Host? They will be able to auto-publish events."
        confirmLabel="Promote"
        confirmColor="green"
      />

      {/* Confirm Flag */}
      <ConfirmModal
        opened={!!flagConfirm}
        onClose={() => setFlagConfirm(null)}
        onConfirm={confirmFlag}
        title="Flag User"
        message="Are you sure you want to flag this user? They will be locked out and their events will be under review."
        confirmLabel="Flag"
        confirmColor="orange"
      />

      {/* Confirm Delete */}
      <ConfirmModal
        opened={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure? This action cannot be undone. All user data will be permanently removed."
        confirmLabel="Delete"
        confirmColor="red"
      />
    </PageContainer>
  );
}
