// src/pages/Events/MyEventsPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Stack,
  SimpleGrid,
  Group,
  Text,
  Paper,
  Menu,
  Modal,
  Textarea,
  Box,
  ActionIcon,
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
  IconCalendarOff,
  IconQrcode,
} from '@tabler/icons-react';
import type { Event } from '@/types';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/atoms/EmptyState';
import { SkeletonCard } from '@/components/atoms/SkeletonCard';

type TabKey = 'active' | 'pending' | 'drafts' | 'trash';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Under review' },
  { key: 'drafts', label: 'Drafts' },
  { key: 'trash', label: 'Trash bin' },
];

export function MyEventsPage() {
  const navigate = useNavigate();
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
    if (activeTab === 'trash') return event.deleted === true;
    if (event.deleted === true) return false;
    if (activeTab === 'active') return event.status === 'PUBLISHED' || event.status === 'COMPLETED';
    if (activeTab === 'pending') return event.status === 'UNDER_REVIEW';
    if (activeTab === 'drafts') return event.status === 'DRAFT';
    return false;
  });

  // --- Mutations (same as before) ---
  const publishMutation = useMutation({
    mutationFn: (id: string) => eventsApi.publishEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-events'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      eventsApi.cancelEvent(id, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-events'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      setCancelModalOpen(false);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => eventsApi.restoreEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-events'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.permanentDelete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-events'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      setDeleteModalOpen(false);
      setEventToDeleteId(null);
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.softDeleteEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-events'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
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

  const emptyCopy: Record<TabKey, { title: string; description: string }> = {
    active: { title: 'No active events', description: 'Published events you host will show up here.' },
    pending: { title: 'Nothing under review', description: 'Events awaiting approval will appear here.' },
    drafts: { title: 'No drafts yet', description: 'Start creating an event and save it as a draft anytime.' },
    trash: { title: 'Trash is empty', description: 'Events you remove will be kept here until deleted for good.' },
  };

  return (
    <PageContainer size="lg">
      <Stack gap="xl">
        <PageHeader
          title="My events"
          subtitle="Manage everything you're hosting in one place"
          actions={
            <Button
              component={Link}
              to={ROUTES.CREATE_EVENT}
              variant="primary"
              radius="xl"
              className="whitespace-nowrap"
            >
              <IconPlus size={18} className="mr-1.5" />
              Create event
            </Button>
          }
        />

        <Group gap="xs" className="border-b pb-0" style={{ borderColor: 'var(--app-border)' }}>
          {tabs.map(({ key, label }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="relative px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors"
                style={{
                  color: active ? 'var(--app-primary)' : 'var(--app-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = 'var(--app-text)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = 'var(--app-text-secondary)';
                }}
                aria-pressed={active}
              >
                {label}
                {active && (
                  <span
                    className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full"
                    style={{ background: 'var(--app-primary)' }}
                  />
                )}
              </button>
            );
          })}
        </Group>

        {isLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </SimpleGrid>
        ) : filteredEvents.length === 0 ? (
          <Paper
            withBorder
            radius="xl"
            className="border-slate-200/80 dark:border-slate-700/60"
            style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
          >
            <EmptyState
              icon={<IconCalendarOff size={32} />}
              title={emptyCopy[activeTab].title}
              description={emptyCopy[activeTab].description}
              action={
                activeTab === 'active' || activeTab === 'drafts'
                  ? { label: 'Create your first event', onClick: () => navigate(ROUTES.CREATE_EVENT) }
                  : undefined
              }
            />
          </Paper>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {filteredEvents.map((event) => {
              // TIME-AWARE LOGIC
              const hasStarted = new Date(event.startTime).getTime() <= Date.now();
              const isEnded = new Date(event.endTime).getTime() <= Date.now();
              const isLive = hasStarted && !isEnded && event.status === 'PUBLISHED';

              return (
                <Box key={event.id} pos="relative">
                  <EventCard event={event} />
                  <Menu position="bottom-end" withinPortal shadow="md" radius="md">
                    <Menu.Target>
                      <ActionIcon
                        variant="filled"
                        color="dark"
                        size={32}
                        radius="xl"
                        className="absolute top-3 right-3 z-10 backdrop-blur-sm"
                        style={{ background: 'rgba(15, 23, 42, 0.7)' }}
                        aria-label="Event actions"
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
                      {/* Publish: only for Drafts */}
                      {event.status === 'DRAFT' && !event.deleted && (
                        <Menu.Item
                          leftSection={<IconCheck size={14} />}
                          onClick={() => handlePublish(event.id)}
                          style={{ color: 'var(--app-text)' }}
                        >
                          Publish
                        </Menu.Item>
                      )}

                      {/* Check‑in: for PUBLISHED/COMPLETED */}
                      {!event.deleted && (event.status === 'PUBLISHED' || event.status === 'COMPLETED') && (
                        <Menu.Item
                          component={Link}
                          to={ROUTES.HOST_CHECKIN(event.id)}
                          leftSection={<IconQrcode size={14} />}
                          style={{ color: 'var(--app-text)' }}
                        >
                          {event.status === 'COMPLETED' ? 'View Attendees' : 'Check-ins & QR'}
                        </Menu.Item>
                      )}

                      {/* Edit: only if NOT started, cancelled, completed, or under review */}
                      {!event.deleted && event.status !== 'CANCELLED' && event.status !== 'COMPLETED' && event.status !== 'UNDER_REVIEW' && !hasStarted && (
                        <Menu.Item
                          component={Link}
                          to={ROUTES.EDIT_EVENT(event.id)}
                          leftSection={<IconEdit size={14} />}
                          style={{ color: 'var(--app-text)' }}
                        >
                          Edit
                        </Menu.Item>
                      )}

                      {/* Cancel: only if PUBLISHED and NOT started */}
                      {!event.deleted && event.status === 'PUBLISHED' && !hasStarted && (
                        <Menu.Item
                          leftSection={<IconX size={14} />}
                          color="orange"
                          onClick={() => handleCancel(event)}
                        >
                          Cancel event
                        </Menu.Item>
                      )}

                      {/* Move to trash: never during live */}
                      {!event.deleted && !isLive && (
                        <>
                          <Menu.Divider style={{ borderColor: 'var(--app-border)' }} />
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => handleMoveToTrash(event.id)}
                          >
                            Move to trash
                          </Menu.Item>
                        </>
                      )}

                      {/* Restore / Delete forever: trashed events */}
                      {event.deleted && (
                        <>
                          <Menu.Item
                            leftSection={<IconRestore size={14} />}
                            onClick={() => handleRestore(event.id)}
                            style={{ color: 'var(--app-text)' }}
                          >
                            Restore
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => handlePermanentDelete(event.id)}
                          >
                            Delete forever
                          </Menu.Item>
                        </>
                      )}
                    </Menu.Dropdown>
                  </Menu>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </Stack>

      {/* Modals – unchanged */}
      <Modal
        opened={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title={<Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>Cancel event</Text>}
        centered
        radius="xl"
        styles={{
          content: { background: 'var(--app-surface)' },
          header: { background: 'var(--app-surface)', borderBottom: '1px solid var(--app-border)' },
        }}
      >
        <Stack>
          <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
            Are you sure you want to cancel this event? All attendees will be notified.
          </Text>
          <Textarea
            label="Reason (optional)"
            placeholder="Why are you cancelling?"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.currentTarget.value)}
            maxLength={500}
            minRows={2}
            radius="md"
            styles={{
              label: { color: 'var(--app-text)' },
              input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
            }}
          />
          <Group justify="flex-end">
            <Button variant="ghost" onClick={() => setCancelModalOpen(false)} radius="md">
              No, keep it
            </Button>
            <Button
              variant="danger"
              onClick={confirmCancel}
              isLoading={cancelMutation.isPending}
              radius="md"
            >
              Yes, cancel event
            </Button>
          </Group>
        </Stack>
      </Modal>

      <ConfirmModal
        opened={moveToTrashModalOpen}
        onClose={() => setMoveToTrashModalOpen(false)}
        onConfirm={confirmMoveToTrash}
        title="Move to trash"
        message="This will move the event to your trash. You can restore it later from the trash bin."
        confirmLabel="Move to trash"
        confirmColor="orange"
        loading={softDeleteMutation.isPending}
      />

      <ConfirmModal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmPermanentDelete}
        title="Delete forever"
        message="Are you sure? This action cannot be undone. The event will be permanently removed."
        confirmLabel="Delete forever"
        loading={permanentDeleteMutation.isPending}
      />
    </PageContainer>
  );
}