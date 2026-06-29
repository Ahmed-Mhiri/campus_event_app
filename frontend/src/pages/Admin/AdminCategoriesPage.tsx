import { useState } from 'react';
import {
  Container,
  Stack,
  Paper,
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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconRefresh } from '@tabler/icons-react';
import { useAdmin } from '@/hooks/useAdmin';
import { PageHeader } from '@/components/molecules/PageHeader';
import type { Category } from '@/types';

export function AdminCategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#228BE6');
  const [sortOrder, setSortOrder] = useState<number>(0);

  const { useCategories, createCategory, updateCategory, deleteCategory } = useAdmin();
  const { data: categories, isLoading, refetch } = useCategories();

  const handleSubmit = async () => {
    if (!name.trim()) {
      notifications.show({ title: 'Error', message: 'Category name is required.', color: 'red' });
      return;
    }

    const data = { name: name.trim(), icon: icon || undefined, color, sortOrder };
    if (editingCategory) {
      await updateCategory({ id: editingCategory.id, data });
    } else {
      await createCategory(data);
    }
    resetForm();
    await refetch();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(id);
      await refetch();
    }
  };

  const resetForm = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setName('');
    setIcon('');
    setColor('#228BE6');
    setSortOrder(0);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setIcon(category.icon || '');
    setColor(category.color || '#228BE6');
    setSortOrder(category.sortOrder || 0);
    setModalOpen(true);
  };

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
        <PageHeader title="Category Management" />

        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={() => refetch()}
            leftSection={<IconRefresh size={16} />}
            radius="md"
          >
            Refresh
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            radius="md"
          >
            Add Category
          </Button>
        </Group>

        <Paper withBorder p="md" radius="lg">
          {categories?.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No categories found. Create your first category!
            </Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Icon</Table.Th>
                  <Table.Th>Color</Table.Th>
                  <Table.Th>Sort Order</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {categories?.map((category: Category, index: number) => (
                  <Table.Tr key={category.id}>
                    <Table.Td>
                      <Text size="sm">{index + 1}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Badge color={category.color || 'gray'} size="lg" radius="md">
                          {category.name}
                        </Badge>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{category.icon || '-'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          backgroundColor: category.color || '#ccc',
                          border: '1px solid #ddd',
                        }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{category.sortOrder || 0}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <ActionIcon
                          size="sm"
                          color="blue"
                          variant="subtle"
                          onClick={() => openEditModal(category)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          color="red"
                          variant="subtle"
                          onClick={() => handleDelete(category.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
      </Stack>

      {/* Create/Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={resetForm}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        radius="xl"
      >
        <Stack>
          <TextInput
            label="Name"
            placeholder="e.g., Music, Tech, Sports"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
            radius="md"
          />
          <TextInput
            label="Icon (optional)"
            placeholder="e.g., music, tech, sports"
            value={icon}
            onChange={(e) => setIcon(e.currentTarget.value)}
            radius="md"
          />
          <ColorInput
            label="Color"
            value={color}
            onChange={(val) => setColor(val)}
            format="hex"
            radius="md"
          />
          <NumberInput
            label="Sort Order"
            value={sortOrder}
            onChange={(val) => setSortOrder(typeof val === 'number' ? val : 0)}
            min={0}
            radius="md"
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={resetForm} radius="md">
              Cancel
            </Button>
            <Button onClick={handleSubmit} radius="md">
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}