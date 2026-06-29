import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Avatar,
  Title,
  Text,
  Stack,
  Group,
  Badge,
  Loader,
  Center,
  Alert,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { getAvatarUrl } from '@/utils/fileHelpers';
import { UserTrustBadge } from '@/components/molecules/UserTrustBadge';
import type { ApiResponse, PublicProfile } from '@/types';

export function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-profile', userId],
    queryFn: () =>
      api
        .get<ApiResponse<PublicProfile>>(`/api/public/users/${userId}`)
        .then((res) => res.data.data),
    enabled: !!userId,
  });

  if (isLoading)
    return (
      <Center h="50vh">
        <Loader size="xl" />
      </Center>
    );
  if (error || !data) {
    return (
      <Container py="xl">
        <Alert color="red">User not found</Alert>
      </Container>
    );
  }

  const avatarSrc = data.profileImageUrl || getAvatarUrl(data.id) || undefined;
  return (
    <Container size="md" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Stack align="center" gap="md">
          <Avatar
            src={avatarSrc as string | undefined}
            size={120}
            radius="xl"
            alt={data.displayName}
          />
          <Title order={2}>{data.displayName}</Title>
          <Group gap="xs">
            <UserTrustBadge trustLevel={data.trustLevel} />
            <Badge>Joined {new Date(data.createdAt).toLocaleDateString()}</Badge>
          </Group>
          {data.bio && (
            <Text ta="center" maw={400}>
              {data.bio}
            </Text>
          )}
          <Group gap="xl">
            <Stack align="center">
              <Text fw={700}>{data.completedEventsWithReviews}</Text>
              <Text size="sm" c="dimmed">
                Events Hosted
              </Text>
            </Stack>
            <Stack align="center">
              <Text fw={700}>
                {data.averageHostRating > 0 ? data.averageHostRating.toFixed(1) : '—'}
              </Text>
              <Text size="sm" c="dimmed">
                Avg. Rating
              </Text>
            </Stack>
          </Group>
          {/* Optionally list hosted events here */}
        </Stack>
      </Paper>
    </Container>
  );
}