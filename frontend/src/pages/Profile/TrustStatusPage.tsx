// src/pages/Profile/TrustStatusPage.tsx

import { Container, Paper, Title, Stack, Text, Progress, Group, Badge, Loader } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';

export function TrustStatusPage() {
  const { trustStatus, trustStatusLoading } = useAuth();

  if (trustStatusLoading) return <Loader />;
  if (!trustStatus) return <Text>No trust data available.</Text>;

  const {
    completedEventsWithReviews,
    minimumEventsRequired,
    averageRating,
    minimumRatingRequired,
    meetsEventCount,
    meetsRatingThreshold,
    qualifies,
  } = trustStatus;

  return (
    <Container size="sm" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Stack align="center" gap="md">
          <Title order={2}>Trust Level Qualification</Title>
          <Badge
            size="xl"
            color={qualifies ? 'green' : 'yellow'}
            variant="filled"
          >
            {qualifies ? '✅ Qualified for TRUSTED_HOST' : '⏳ In Progress'}
          </Badge>

          <Text size="sm" c="dimmed" ta="center">
            Host at least {minimumEventsRequired} events with an average rating of{' '}
            {minimumRatingRequired} or higher.
          </Text>

          <Stack w="100%" gap="xl" mt="md">
            {/* Events hosted */}
            <div>
              <Group justify="space-between">
                <Text size="sm" fw={500}>
                  Events hosted with reviews
                </Text>
                <Text size="sm" fw={500}>
                  {completedEventsWithReviews} / {minimumEventsRequired}
                </Text>
              </Group>
              <Progress
                value={(completedEventsWithReviews / minimumEventsRequired) * 100}
                color={meetsEventCount ? 'green' : 'blue'}
                size="lg"
                radius="xl"
              />
              {meetsEventCount ? (
                <Text size="xs" c="green" mt="xs">
                  <IconCheck size={14} /> Requirement met
                </Text>
              ) : (
                <Text size="xs" c="dimmed" mt="xs">
                  Need {minimumEventsRequired - completedEventsWithReviews} more event(s)
                </Text>
              )}
            </div>

            {/* Average Rating */}
            <div>
              <Group justify="space-between">
                <Text size="sm" fw={500}>
                  Average Host Rating
                </Text>
                <Text size="sm" fw={500}>
                  {averageRating.toFixed(1)} / {minimumRatingRequired}
                </Text>
              </Group>
              <Progress
                value={(averageRating / minimumRatingRequired) * 100}
                color={meetsRatingThreshold ? 'green' : 'blue'}
                size="lg"
                radius="xl"
              />
              {meetsRatingThreshold ? (
                <Text size="xs" c="green" mt="xs">
                  <IconCheck size={14} /> Requirement met
                </Text>
              ) : (
                <Text size="xs" c="dimmed" mt="xs">
                  Need to improve average rating
                </Text>
              )}
            </div>
          </Stack>

          <Text size="xs" c="dimmed" mt="xl" ta="center">
            Once both requirements are met, you'll be automatically promoted to TRUSTED_HOST.
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
}