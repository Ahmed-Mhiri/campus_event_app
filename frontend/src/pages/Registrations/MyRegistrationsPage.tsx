// src/pages/Registrations/MyRegistrationsPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Title,
  Stack,
  Tabs,
  SimpleGrid,
  Card,
  Text,
  Badge,
  Group,
  Loader,
  Center,
  Paper,
  Modal,
  Textarea,
  Button,
} from '@mantine/core';
import { IconCalendar, IconMapPin } from '@tabler/icons-react';
import { useRsvp } from '@/hooks/useRsvp';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/dateFormatter';
import type { Rsvp } from '@/types';

type TabKey = 'going' | 'waitlisted' | 'attended' | 'cancelled';

const tabStatusMap: Record<TabKey, string> = {
  going: 'GOING',
  waitlisted: 'WAITLISTED',
  attended: 'ATTENDED',
  cancelled: 'CANCELLED',
};

const tabLabels: Record<TabKey, string> = {
  going: 'Upcoming',
  waitlisted: 'Waitlisted',
  attended: 'Past',
  cancelled: 'Cancelled',
};

export function MyRegistrationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('going');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRsvp, setSelectedRsvp] = useState<Rsvp | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const { useMyRsvps, cancelRsvp } = useRsvp();

  const { data, isLoading } = useMyRsvps(
    tabStatusMap[activeTab],
    0,
    50
  );

  const rsvps = data?.content || [];

  const handleCancel = (rsvp: Rsvp) => {
    setSelectedRsvp(rsvp);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedRsvp) return;
    await cancelRsvp({ rsvpId: selectedRsvp.id, reason: cancelReason || undefined });
    setCancelModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      GOING: 'green',
      WAITLISTED: 'yellow',
      ATTENDED: 'blue',
      CANCELLED: 'gray',
    };
    return <Badge color={colors[status] || 'gray'}>{status}</Badge>;
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Title order={2}>My Registrations</Title>

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
                <Center>
                  <Loader size="md" />
                </Center>
              ) : rsvps.length === 0 ? (
                <Paper withBorder p="xl" ta="center">
                  <Text c="dimmed" size="lg">
                    No {tabLabels[key as TabKey].toLowerCase()} registrations
                  </Text>
                  {key === 'going' && (
                    <Button
                      component={Link}
                      to={ROUTES.EVENTS}
                      variant="light"
                      mt="md"
                    >
                      Browse events
                    </Button>
                  )}
                </Paper>
              ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                  {rsvps.map((rsvp: Rsvp) => (
                    <Card key={rsvp.id} withBorder shadow="sm" radius="md" p="md">
                      <Card.Section withBorder inheritPadding py="xs">
                        <Group justify="space-between">
                          <Text fw={600} size="lg">{rsvp.eventTitle}</Text>
                          {getStatusBadge(rsvp.status)}
                        </Group>
                      </Card.Section>

                      <Stack gap="xs" mt="sm">
                        <Group gap="xs">
                          <IconCalendar size={16} />
                          <Text size="sm">{formatDate(rsvp.createdAt)}</Text>
                        </Group>
                        <Group gap="xs">
                          <IconMapPin size={16} />
                          <Text size="sm" c="dimmed">Event ID: {rsvp.eventId.slice(0, 8)}</Text>
                        </Group>
                      </Stack>

                      <Group justify="space-between" mt="md">
                        <Button
                          component={Link}
                          to={`/events/detail/${rsvp.eventId}`}
                          variant="light"
                          size="xs"
                        >
                          View Event
                        </Button>

                        {rsvp.status === 'GOING' && (
                          <Button
                            color="red"
                            variant="subtle"
                            size="xs"
                            onClick={() => handleCancel(rsvp)}
                          >
                            Cancel
                          </Button>
                        )}
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </Tabs.Panel>
          ))}
        </Tabs>
      </Stack>

      {/* Cancel Modal */}
      <Modal
        opened={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Registration"
      >
        <Stack>
          <Text size="sm">
            Are you sure you want to cancel your registration for "{selectedRsvp?.eventTitle}"?
          </Text>
          <Textarea
            label="Reason (optional)"
            placeholder="Why are you cancelling?"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.currentTarget.value)}
            maxLength={500}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCancelModalOpen(false)}>
              Keep it
            </Button>
            <Button color="red" onClick={confirmCancel}>
              Yes, cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}