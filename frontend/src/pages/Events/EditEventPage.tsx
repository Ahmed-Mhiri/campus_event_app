// src/pages/Events/EditEventPage.tsx
import { useParams } from 'react-router-dom';
import {
  Container,
  Title,
  Stack,
  Loader,
  Center,
  Alert,
  Paper,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { EventForm } from '@/components/organisms/EventForm';
import { MediaUploader } from '@/components/molecules/MediaUploader'; // 👈 new
import { useEvent } from '@/hooks/useEvents';

export function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: event, isLoading, error } = useEvent(id!, false);

  if (isLoading) {
    return (
      <Center h="50vh">
        <Loader size="xl" />
      </Center>
    );
  }

  if (error || !event) {
    return (
      <Container py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          Failed to load event. It may have been deleted or you don't have permission to edit it.
        </Alert>
      </Container>
    );
  }

  // Check if user is host or admin (basic protection)
  if (!event.isHost) {
    return (
      <Container py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Access Denied" color="red">
          You are not the host of this event.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={2}>Edit Event</Title>
        <EventForm initialValues={event} eventId={id} />

        {/* 👇 New Media Uploader Section */}
        <Paper withBorder p="md" radius="md" mt="xl">
          <Title order={4}>Event Media</Title>
          <MediaUploader
            eventId={event.id}
            media={event.media || []}
            onMediaChange={() =>
              queryClient.invalidateQueries({ queryKey: ['event', id] })
            }
          />
        </Paper>
      </Stack>
    </Container>
  );
}