import { useParams } from 'react-router-dom';
import { Stack, Loader, Center, Alert, Paper, Text, ThemeIcon } from '@mantine/core';
import { IconAlertCircle, IconPhoto } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { EventForm } from '@/components/organisms/EventForm';
import { MediaUploader } from '@/components/molecules/MediaUploader';
import { useEvent } from '@/hooks/useEvents';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';

export function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: event, isLoading, error } = useEvent(id!, false);
  const { user } = useAuthStore();

  if (isLoading) {
    return (
      <Center h="60vh">
        <Loader size="xl" color="brand" />
      </Center>
    );
  }

  if (error || !event) {
    return (
      <PageContainer size="md">
        <Alert icon={<IconAlertCircle size={18} />} title="Error" color="red" radius="lg">
          Failed to load event. It may have been deleted or you don't have permission to edit it.
        </Alert>
      </PageContainer>
    );
  }

  // ✅ Bulletproof host check – uses the authenticated user's ID
  const isActuallyHost = event.isHost || (user?.id && event.host?.id === user.id);

  if (!isActuallyHost) {
    return (
      <PageContainer size="md">
        <Alert icon={<IconAlertCircle size={18} />} title="Access denied" color="red" radius="lg">
          You are not the host of this event.
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="md">
      <Stack gap="xl">
        <PageHeader
          title="Edit event"
          subtitle={event.title}
          breadcrumbs={[
            { label: 'Events', href: ROUTES.EVENTS },
            { label: 'My events', href: ROUTES.MY_EVENTS },
            { label: 'Edit' },
          ]}
        />

        <EventForm initialValues={event} eventId={id} />

        <Paper withBorder p="xl" radius="xl" className="border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center gap-3 mb-5">
            <ThemeIcon size={36} radius="lg" color="brand" variant="light">
              <IconPhoto size={18} />
            </ThemeIcon>
            <div>
              <Text fw={700} className="text-slate-900 dark:text-white">
                Event media
              </Text>
              <Text size="sm" c="dimmed">
                Add photos and videos to help attendees know what to expect.
              </Text>
            </div>
          </div>
          <MediaUploader
            eventId={event.id}
            media={event.media || []}
            onMediaChange={() => queryClient.invalidateQueries({ queryKey: ['event', id] })}
          />
        </Paper>
      </Stack>
    </PageContainer>
  );
}