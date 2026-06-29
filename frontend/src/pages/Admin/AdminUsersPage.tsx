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
  TextInput,
  Modal,
  Menu,
} from '@mantine/core';
import {
  IconSearch,
  IconFlag,
  IconUserCheck,
  IconUserX,
  IconDots,
  IconShield,
} from '@tabler/icons-react';
import { useAdmin } from '@/hooks/useAdmin';
import { formatDate } from '@/utils/dateFormatter';
import { PageHeader } from '@/components/molecules/PageHeader';
import type { User } from '@/types';

export function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [trustFilter, setTrustFilter] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [trustModalOpen, setTrustModalOpen] = useState(false);
  const [newTrustLevel, setNewTrustLevel] = useState('');

  const {
    useUsers,
    updateTrustLevel,
    flagUser,
    promoteUser,
    deleteUser,
  } = useAdmin();

  const { data, isLoading, refetch } = useUsers(
    search || undefined,
    trustFilter || undefined,
    page,
    20
  );

  const users = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const trustColors: Record<string, string> = {
    NEW: 'gray',
    TRUSTED_HOST: 'green',
    FLAGGED: 'red',
  };

  const handlePromote = async (userId: string) => {
    try {
      await promoteUser({ userId, force: false });
      await refetch();
    } catch (error) {
      // Handle error silently (already shown in hook)
    }
  };

  const handleFlag = async (userId: string) => {
    if (confirm('Are you sure you want to flag this user? They will be locked out.')) {
      try {
        await flagUser(userId);
        await refetch();
      } catch (error) {
        // Handle error silently
      }
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        await refetch();
      } catch (error) {
        // Handle error silently
      }
    }
  };

  const openTrustModal = (user: User) => {
    setSelectedUser(user);
    setNewTrustLevel(user.trustLevel);
    setTrustModalOpen(true);
  };

  const confirmTrustUpdate = async () => {
    if (!selectedUser) return;
    try {
      await updateTrustLevel({ userId: selectedUser.id, trustLevel: newTrustLevel });
      setTrustModalOpen(false);
      await refetch();
    } catch (error) {
      // Handle error silently
    }
  };

  const trustOptions = [
    { value: 'NEW', label: 'New' },
    { value: 'TRUSTED_HOST', label: 'Trusted Host' },
    { value: 'FLAGGED', label: 'Flagged' },
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
        <PageHeader title="User Management" />

        <Paper withBorder p="md" radius="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Group>
                <TextInput
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  leftSection={<IconSearch size={16} />}
                  w={250}
                  radius="md"
                />
                <Select
                  placeholder="Trust level"
                  data={trustOptions}
                  value={trustFilter || ''}
                  onChange={(val) => setTrustFilter(val || null)}
                  clearable
                  w={150}
                  radius="md"
                />
              </Group>
              <Text size="sm" c="dimmed">
                Total: {data?.totalElements || 0} users
              </Text>
            </Group>

            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Trust Level</Table.Th>
                  <Table.Th>Joined</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.map((user: User) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>
                      <Group gap="xs">
                        <Text fw={500}>{user.displayName}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{user.universityEmail}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={user.role === 'ADMIN' ? 'blue' : 'gray'} radius="md">
                        {user.role}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={trustColors[user.trustLevel] || 'gray'} radius="md">
                        {user.trustLevel}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{formatDate(user.createdAt)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Menu position="bottom-end" withinPortal>
                        <Menu.Target>
                          <ActionIcon variant="subtle">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconShield size={14} />}
                            onClick={() => openTrustModal(user)}
                          >
                            Change Trust Level
                          </Menu.Item>
                          {user.trustLevel !== 'TRUSTED_HOST' && (
                            <Menu.Item
                              leftSection={<IconUserCheck size={14} />}
                              onClick={() => handlePromote(user.id)}
                            >
                              Promote to Trusted Host
                            </Menu.Item>
                          )}
                          {user.trustLevel !== 'FLAGGED' && (
                            <Menu.Item
                              leftSection={<IconFlag size={14} />}
                              color="orange"
                              onClick={() => handleFlag(user.id)}
                            >
                              Flag User
                            </Menu.Item>
                          )}
                          <Menu.Divider />
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

      {/* Trust Level Modal */}
      <Modal
        opened={trustModalOpen}
        onClose={() => setTrustModalOpen(false)}
        title="Change Trust Level"
        radius="xl"
      >
        <Stack>
          <Text size="sm">
            Update trust level for <strong>{selectedUser?.displayName}</strong>
          </Text>
          <Select
            label="Trust Level"
            data={trustOptions}
            value={newTrustLevel}
            onChange={(val) => setNewTrustLevel(val || 'NEW')}
            radius="md"
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setTrustModalOpen(false)} radius="md">
              Cancel
            </Button>
            <Button onClick={confirmTrustUpdate} radius="md">Update</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}