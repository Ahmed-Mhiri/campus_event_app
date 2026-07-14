// src/pages/Admin/AdminCategoriesPage.tsx
import { useState, useEffect } from 'react';
import {
  Stack,
  Table,
  Group,
  Button,
  TextInput,
  Modal,
  ColorInput,
  Loader,
  Center,
  Text,
  ActionIcon,
  NumberInput,
  Badge,
  Divider,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconRefresh,
  IconTag,
  IconPalette,
  IconSortAscendingNumbers,
  IconCheck,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAdmin } from '@/hooks/useAdmin';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button as UIButton } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/atoms/EmptyState';
import { slideUp, staggerContainer } from '@/design-system/animations';
import type { Category } from '@/types';

export function AdminCategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#8b5cf6');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string; usageCount: number } | null>(null);

  const { useCategories, createCategory, updateCategory, deleteCategory } = useAdmin();
  const { data: categories, isLoading, refetch } = useCategories();

  // NEW: function to fetch usage count for a category (hypothetical API)
  // For now, we'll simulate by counting categories in events (not implemented).
  // In practice, you'd call an API like `/api/categories/{id}/usage`.
  const fetchUsageCount = async (id: number): Promise<number> => {
    // Placeholder: return a random number or 0.
    // Replace with actual API call when available.
    return 0; // TODO: implement
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Category name is required.',
        color: 'red',
      });
      return;
    }

    const data = {
      name: name.trim(),
      icon: icon || undefined,
      color,
      sortOrder,
    };

    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, data });
        notifications.show({
          title: 'Success',
          message: `Category "${name.trim()}" updated.`,
          color: 'green',
        });
      } else {
        await createCategory(data);
        notifications.show({
          title: 'Success',
          message: `Category "${name.trim()}" created.`,
          color: 'green',
        });
      }
      resetForm();
      await refetch();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Something went wrong. Please try again.',
        color: 'red',
      });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    // Fetch usage count before showing confirmation
    try {
      const usageCount = await fetchUsageCount(id);
      setDeleteConfirm({ id, name, usageCount });
    } catch (err) {
      // Fallback: show generic message without count
      setDeleteConfirm({ id, name, usageCount: 0 });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteCategory(deleteConfirm.id);
      notifications.show({
        title: 'Deleted',
        message: `Category "${deleteConfirm.name}" removed.`,
        color: 'green',
      });
      setDeleteConfirm(null);
      await refetch();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete category.',
        color: 'red',
      });
    }
  };

  const resetForm = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setName('');
    setIcon('');
    setColor('#8b5cf6');
    setSortOrder(0);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setIcon(category.icon || '');
    setColor(category.color || '#8b5cf6');
    setSortOrder(category.sortOrder || 0);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
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
          title="Categories"
          subtitle="Manage event categories, colors, and display order"
          actions={
            <Group gap="xs">
              <UIButton
                variant="secondary"
                leftSection={<IconRefresh size={16} />}
                onClick={() => refetch()}
                radius="xl"
                size="sm"
              >
                Refresh
              </UIButton>
              <UIButton
                variant="primary"
                leftSection={<IconPlus size={16} />}
                onClick={openCreateModal}
                radius="xl"
                size="sm"
              >
                Add Category
              </UIButton>
            </Group>
          }
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {categories?.length === 0 ? (
            <motion.div variants={slideUp}>
              <Card
                variant="default"
                className="border-slate-200/80 dark:border-slate-700/60"
              >
                <EmptyState
                  icon={<IconTag size={32} />}
                  title="No categories yet"
                  description="Create your first category to help users discover events by topic."
                  action={{ label: 'Add category', onClick: openCreateModal }}
                />
              </Card>
            </motion.div>
          ) : (
            <motion.div variants={slideUp}>
              <Card
                variant="default"
                className="border-slate-200/80 dark:border-slate-700/60 overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <Table>
                    <Table.Thead>
                      <Table.Tr
                        style={{
                          background: 'var(--app-border-light)',
                        }}
                      >
                        <Table.Th
                          style={{
                            color: 'var(--app-text-secondary)',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontWeight: 600,
                          }}
                        >
                          #
                        </Table.Th>
                        <Table.Th
                          style={{
                            color: 'var(--app-text-secondary)',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontWeight: 600,
                          }}
                        >
                          Category
                        </Table.Th>
                        <Table.Th
                          style={{
                            color: 'var(--app-text-secondary)',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontWeight: 600,
                          }}
                        >
                          Icon
                        </Table.Th>
                        <Table.Th
                          style={{
                            color: 'var(--app-text-secondary)',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontWeight: 600,
                          }}
                        >
                          Color
                        </Table.Th>
                        <Table.Th
                          style={{
                            color: 'var(--app-text-secondary)',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontWeight: 600,
                          }}
                        >
                          Sort
                        </Table.Th>
                        <Table.Th
                          style={{
                            color: 'var(--app-text-secondary)',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontWeight: 600,
                          }}
                        >
                          Actions
                        </Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {categories?.map((category: Category, index: number) => (
                        <Table.Tr
                          key={category.id}
                          className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                        >
                          <Table.Td>
                            <Text
                              size="sm"
                              fw={500}
                              style={{ color: 'var(--app-text-muted)' }}
                            >
                              {index + 1}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={category.color || 'gray'}
                              size="lg"
                              radius="md"
                              variant="light"
                              leftSection={
                                category.icon ? (
                                  <span className="text-xs">{category.icon}</span>
                                ) : undefined
                              }
                            >
                              {category.name}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text
                              size="sm"
                              style={{ color: 'var(--app-text-secondary)' }}
                            >
                              {category.icon || (
                                <span style={{ color: 'var(--app-text-muted)' }}>
                                  —
                                </span>
                              )}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="sm">
                              <div
                                className="w-8 h-8 rounded-lg border"
                                style={{
                                  backgroundColor: category.color || '#ccc',
                                  borderColor: 'var(--app-border)',
                                }}
                              />
                              <Text
                                size="xs"
                                className="font-mono"
                                style={{ color: 'var(--app-text-muted)' }}
                              >
                                {category.color || '—'}
                              </Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text
                              size="sm"
                              fw={500}
                              style={{ color: 'var(--app-text)' }}
                            >
                              {category.sortOrder || 0}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap={4}>
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                color="blue"
                                onClick={() => openEditModal(category)}
                                aria-label={`Edit ${category.name}`}
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                color="red"
                                onClick={() => handleDelete(category.id, category.name)}
                                aria-label={`Delete ${category.name}`}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </Stack>

      {/* Create/Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={resetForm}
        title={
          <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>
            {editingCategory ? 'Edit Category' : 'Create Category'}
          </Text>
        }
        centered
        radius="xl"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="e.g., Music, Tech, Sports"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
            radius="md"
            size="md"
            leftSection={<IconTag size={16} />}
            styles={{ label: { color: 'var(--app-text)', fontWeight: 500 } }}
          />
          <TextInput
            label="Icon (optional)"
            placeholder="e.g., music, tech, sports"
            value={icon}
            onChange={(e) => setIcon(e.currentTarget.value)}
            radius="md"
            size="md"
            leftSection={<IconCheck size={16} />}
            styles={{ label: { color: 'var(--app-text)', fontWeight: 500 } }}
          />
          <ColorInput
            label="Color"
            value={color}
            onChange={(val) => setColor(val)}
            format="hex"
            radius="md"
            size="md"
            leftSection={<IconPalette size={16} />}
            styles={{ label: { color: 'var(--app-text)', fontWeight: 500 } }}
          />
          <NumberInput
            label="Sort Order"
            value={sortOrder}
            onChange={(val) => setSortOrder(typeof val === 'number' ? val : 0)}
            min={0}
            radius="md"
            size="md"
            leftSection={<IconSortAscendingNumbers size={16} />}
            styles={{ label: { color: 'var(--app-text)', fontWeight: 500 } }}
          />

          <Divider style={{ borderColor: 'var(--app-border)' }} className="my-2" />

          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={resetForm} radius="md" size="md">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              color="brand"
              leftSection={<IconCheck size={16} />}
            >
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete confirmation with usage warning */}
      <ConfirmModal
        opened={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={
          deleteConfirm
            ? `Are you sure you want to delete the category "${deleteConfirm.name}"? ${
                deleteConfirm.usageCount > 0
                  ? `It is currently used by ${deleteConfirm.usageCount} event(s). Deleting it will remove the category from those events.`
                  : 'It is not currently used by any events.'
              }`
            : ''
        }
        confirmLabel="Delete"
        confirmColor="red"
      />
    </PageContainer>
  );
}