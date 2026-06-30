import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Stack,
  Title,
  Tabs,
  SimpleGrid,
  Button,
  Group,
  Text,
  Loader,
  Center,
  Paper,
  Menu,
  Modal,
  Textarea,
  Box,
} from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/api/eventsApi';
import { EventCard } from '@/components/molecules/EventCard';
import { ROUTES } from '@/constants/routes';
import {
  IconPlus,
  IconDots,
  IconCheck,
  IconX,
  IconRestore,
  IconTrash,
  IconEdit,
} from '@tabler/icons-react';
import type { Event } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

type TabKey = 'active' | 'pending' | 'drafts' | 'trash';

const tabLabels: Record<TabKey, string> = {
  active: 'Active',
  pending: 'Under Review',
  drafts: 'Drafts',
  trash: 'Trash Bin',
};

export function MyEventsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDeleteId, setEventToDeleteId] = useState<string | null>(null);
  const [moveToTrashModalOpen, setMoveToTrashModalOpen] = useState(false);
  const [eventToTrashId, setEventToTrashId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['my-events', activeTab],
    queryFn: () => {
      const includeDeleted = activeTab === 'trash';
      return eventsApi
        .getMyEvents({ includeDeleted, page: 0, size: 50 })
        .then((res) => res.data.data);
    },
  });

  const events = eventsData?.content ?? [];

  const filteredEvents = events.filter((event) => {
    if (activeTab === 'active') return event.status === 'PUBLISHED' || event.status === 'COMPLETED';
    if (activeTab === 'pending') return event.status === 'UNDER_REVIEW';
    if (activeTab === 'drafts') return event.status === 'DRAFT';
    if (activeTab === 'trash') return true;
    return true;
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => eventsApi.publishEvent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-events'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      eventsApi.cancelEvent(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      setCancelModalOpen(false);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => eventsApi.restoreEvent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-events'] }),
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.permanentDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      setDeleteModalOpen(false);
      setEventToDeleteId(null);
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.softDeleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      setMoveToTrashModalOpen(false);
      setEventToTrashId(null);
    },
  });

  const handlePublish = (id: string) => publishMutation.mutate(id);
  const handleCancel = (event: Event) => {
    setSelectedEvent(event);
    setCancelReason('');
    setCancelModalOpen(true);
  };
  const confirmCancel = () => {
    if (!selectedEvent) return;
    cancelMutation.mutate({ id: selectedEvent.id, reason: cancelReason || undefined });
  };

  const handleRestore = (id: string) => restoreMutation.mutate(id);

  const handleMoveToTrash = (id: string) => {
    setEventToTrashId(id);
    setMoveToTrashModalOpen(true);
  };
  const confirmMoveToTrash = () => {
    if (!eventToTrashId) return;
    softDeleteMutation.mutate(eventToTrashId);
  };

  const handlePermanentDelete = (id: string) => {
    setEventToDeleteId(id);
    setDeleteModalOpen(true);
  };
  const confirmPermanentDelete = () => {
    if (!eventToDeleteId) return;
    permanentDeleteMutation.mutate(eventToDeleteId);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <PageHeader
          title="My Events"
          actions={
            <Button component={Link} to={ROUTES.CREATE_EVENT} leftSection={<IconPlus size={18} />}>
              Create Event
            </Button>
          }
        />

        <Tabs value={activeTab} onChange={(val) => setActiveTab(val as TabKey)}>
          <Tabs.List>
            {Object.entries(tabLabels).map(([key, label]) => (
              <Tabs.Tab key={key} value={key}>
                {label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {Object.keys(tabLabels).map((key) => (
            <Tabs.Panel key={key} value={key} pt="md">
              {isLoading ? (
                <Center py="xl">
                  <Loader size="md" />
                </Center>
              ) : filteredEvents.length === 0 ? (
                <Paper withBorder p="xl" ta="center" radius="lg">
                  <Text c="dimmed" size="lg">
                    No events in {tabLabels[key as TabKey].toLowerCase()}
                  </Text>
                  {key === 'active' && (
                    <Button component={Link} to={ROUTES.CREATE_EVENT} variant="light" mt="md">
                      Create your first event
                    </Button>
                  )}
                </Paper>
              ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                  {filteredEvents.map((event) => (
                    <Box key={event.id} pos="relative">
                      <EventCard event={event} />
                      <Menu position="bottom-end" withinPortal>
                        <Menu.Target>
                          <Button
                            variant="subtle"
                            size="compact-sm"
                            style={{ position: 'absolute', top: 8, right: 8 }}
                          >
                            <IconDots size={18} />
                          </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                          {activeTab === 'drafts' && (
                            <Menu.Item
                              leftSection={<IconCheck size={14} />}
                              onClick={() => handlePublish(event.id)}
                            >
                              Publish
                            </Menu.Item>
                          )}
                          {activeTab !== 'trash' && (
                            <>
                              <Menu.Item
                                component={Link}
                                to={`/events/edit/${event.id}`}
                                leftSection={<IconEdit size={14} />}
                              >
                                Edit
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconX size={14} />}
                                color="orange"
                                onClick={() => handleCancel(event)}
                              >
                                Cancel Event
                              </Menu.Item>
                            </>
                          )}
                          {activeTab === 'trash' && (
                            <>
                              <Menu.Item
                                leftSection={<IconRestore size={14} />}
                                onClick={() => handleRestore(event.id)}
                              >
                                Restore
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => handlePermanentDelete(event.id)}
                              >
                                Delete Forever
                              </Menu.Item>
                            </>
                          )}
                          {activeTab !== 'trash' && (
                            <Menu.Divider />
                          )}
                          {activeTab !== 'trash' && (
                            <Menu.Item
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={() => handleMoveToTrash(event.id)}
                            >
                              Move to Trash
                            </Menu.Item>
                          )}
                        </Menu.Dropdown>
                      </Menu>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </Tabs.Panel>
          ))}
        </Tabs>
      </Stack>

      {/* Cancel Event Modal */}
      <Modal opened={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Cancel Event" centered radius="xl">
        <Stack>
          <Text size="sm">Are you sure you want to cancel this event? All attendees will be notified.</Text>
          <Textarea
            label="Reason (optional)"
            placeholder="Why are you cancelling?"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.currentTarget.value)}
            maxLength={500}
            minRows={2}
            radius="md"
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCancelModalOpen(false)} radius="md">
              No, keep it
            </Button>
            <Button color="red" onClick={confirmCancel} loading={cancelMutation.isPending} radius="md">
              Yes, cancel event
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Move to Trash Confirmation */}
      <ConfirmModal
        opened={moveToTrashModalOpen}
        onClose={() => setMoveToTrashModalOpen(false)}
        onConfirm={confirmMoveToTrash}
        title="Move to Trash"
        message="This will move the event to your trash. You can restore it later from the Trash Bin."
        confirmLabel="Move to Trash"
        confirmColor="orange"
        loading={softDeleteMutation.isPending}
      />

      {/* Delete Forever Confirmation */}
      <ConfirmModal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmPermanentDelete}
        title="Delete Forever"
        message="Are you sure? This action cannot be undone. The event will be permanently removed."
        confirmLabel="Delete Forever"
        loading={permanentDeleteMutation.isPending}
      />
    </Container>
  );
}