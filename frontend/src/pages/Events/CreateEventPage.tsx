// src/pages/Events/CreateEventPage.tsx
import { Container, Title, Stack } from '@mantine/core';
import { EventForm } from '@/components/organisms/EventForm';

export function CreateEventPage() {
  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={2}>Create New Event</Title>
        <EventForm />
      </Stack>
    </Container>
  );
}