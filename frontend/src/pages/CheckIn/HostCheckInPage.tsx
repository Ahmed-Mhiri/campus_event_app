// src/pages/CheckIn/HostCheckInPage.tsx
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Title,
  Stack,
  Tabs,
  Loader,
  Center,
  Alert,
  Button,
  Group,
} from '@mantine/core';
import { IconArrowLeft, IconQrcode } from '@tabler/icons-react';
import { CheckInCodeDisplay } from '@/components/molecules/CheckInCodeDisplay';
import { RsvpList } from '@/components/organisms/RsvpList';
import { useEvent } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';

export function HostCheckInPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const { data: event, isLoading } = useEvent(eventId!, false);

  if (isLoading) {
    return (
      <Center h="50vh">
        <Loader size="xl" />
      </Center>
    );
  }

  if (!event) {
    return (
      <Container py="xl">
        <Alert color="red" title="Event not found">
          This event doesn't exist or has been removed.
        </Alert>
      </Container>
    );
  }

  if (!event.isHost && user?.role !== 'ADMIN') {
    return (
      <Container py="xl">
        <Alert color="red" title="Access Denied">
          You are not the host of this event.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group>
          <Button
            component={Link}
            to={`/events/detail/${eventId}`}
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            Back to Event
          </Button>
          <Title order={2}>{event.title}</Title>
        </Group>

        <Tabs defaultValue="code">
          <Tabs.List>
            <Tabs.Tab value="code" leftSection={<IconQrcode size={16} />}>
              Check-in Code
            </Tabs.Tab>
            <Tabs.Tab value="attendees">Attendees</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="code" pt="md">
            <CheckInCodeDisplay eventId={eventId!} />
          </Tabs.Panel>

          <Tabs.Panel value="attendees" pt="md">
            <RsvpList eventId={eventId!} isHost={true} />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}