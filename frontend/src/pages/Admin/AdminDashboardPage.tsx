import { Link } from 'react-router-dom';
import {
  Container,
  Stack,
  SimpleGrid,
  Paper,
  Text,
  Group,
  Badge,
  Button,
  Loader,
  Center,
  Table,
  ActionIcon,
} from '@mantine/core';
import {
  IconUsers,
  IconCalendar,
  IconAlertCircle,
  IconClock,
  IconEye,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { useAdmin } from '@/hooks/useAdmin';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/dateFormatter';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

export function AdminDashboardPage() {
  const { useDashboard } = useAdmin();
  const { data: stats, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <Center h="50vh">
        <Loader size="xl" />
      </Center>
    );
  }

  if (error || !stats) {
    return (
      <Container py="xl">
        <Paper withBorder p="xl" radius="lg" ta="center">
          <Text c="red">Failed to load dashboard data.</Text>
        </Paper>
      </Container>
    );
  }

  const statCards = [
    {
      title: 'Pending Events',
      value: stats.pendingEventsCount,
      color: 'yellow',
      icon: <IconClock size={24} />,
      link: ROUTES.ADMIN_EVENTS,
    },
    {
      title: 'Open Reports',
      value: stats.openReportsCount,
      color: 'red',
      icon: <IconAlertCircle size={24} />,
      link: ROUTES.ADMIN_REPORTS,
    },
    {
      title: 'Total Users',
      value: stats.totalUsersCount,
      color: 'blue',
      icon: <IconUsers size={24} />,
      link: ROUTES.ADMIN_USERS,
    },
    {
      title: 'Events This Week',
      value: stats.eventsThisWeek,
      color: 'green',
      icon: <IconCalendar size={24} />,
      link: ROUTES.ADMIN_EVENTS,
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <PageHeader title="Admin Dashboard" />

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          {statCards.map((card) => (
            <Card
              key={card.title}
              variant="elevated"
              hover
              component={Link}
              to={card.link}
              className="no-underline"
            >
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">{card.title}</Text>
                  <Text fw={700} size="xl">{card.value}</Text>
                </div>
                <Badge color={card.color} size="xl" circle>
                  {card.icon}
                </Badge>
              </Group>
            </Card>
          ))}
        </SimpleGrid>

        {/* Recent Pending Events */}
        <Card variant="default">
          <Group justify="space-between" mb="md">
            <Text fw={600} size="lg">Recent Pending Events</Text>
            <Button component={Link} to={ROUTES.ADMIN_EVENTS} variant="subtle" size="xs" radius="md">
              View all
            </Button>
          </Group>

          {stats.recentPendingEvents.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">No pending events.</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Event</Table.Th>
                  <Table.Th>Host</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {stats.recentPendingEvents.map((event) => (
                  <Table.Tr key={event.id}>
                    <Table.Td>
                      <Text size="sm" fw={500}>{event.title}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{event.host.displayName}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{formatDate(event.createdAt)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <ActionIcon
                          size="sm"
                          color="green"
                          variant="subtle"
                          component={Link}
                          to={`/admin/events?approve=${event.id}`}
                        >
                          <IconCheck size={16} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          color="red"
                          variant="subtle"
                          component={Link}
                          to={`/admin/events?reject=${event.id}`}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          color="blue"
                          variant="subtle"
                          component={Link}
                          to={`/events/detail/${event.id}`}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Card>

        {/* Recent Reports */}
        <Card variant="default">
          <Group justify="space-between" mb="md">
            <Text fw={600} size="lg">Recent Reports</Text>
            <Button component={Link} to={ROUTES.ADMIN_REPORTS} variant="subtle" size="xs" radius="md">
              View all
            </Button>
          </Group>

          {stats.recentReports.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">No open reports.</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Event</Table.Th>
                  <Table.Th>Reason</Table.Th>
                  <Table.Th>Reporter</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {stats.recentReports.map((report) => (
                  <Table.Tr key={report.id}>
                    <Table.Td>
                      <Text size="sm">{report.eventTitle}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="red" size="xs" radius="md">{report.reason}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{report.reporter.displayName}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="yellow" size="xs" radius="md">Open</Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Card>
      </Stack>
    </Container>
  );
}