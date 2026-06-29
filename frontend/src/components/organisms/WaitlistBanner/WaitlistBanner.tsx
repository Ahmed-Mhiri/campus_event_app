// src/components/molecules/WaitlistBanner/WaitlistBanner.tsx
import { Paper, Group, Text, Badge, Loader } from '@mantine/core';
import { IconUserPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { rsvpApi } from '@/api/rsvpApi';

interface WaitlistBannerProps {
  eventId: string;
  rsvpId?: string | null;
}

export function WaitlistBanner({ eventId, rsvpId }: WaitlistBannerProps) {
  const { data: position, isLoading } = useQuery({
    queryKey: ['waitlist-position', eventId, rsvpId],
    queryFn: () => {
      if (!rsvpId) return null;
      return rsvpApi.getRsvpPosition(rsvpId).then((res) => res.data.data);
    },
    enabled: !!rsvpId,
    staleTime: 1000 * 30,
  });

  if (isLoading) return <Loader size="sm" />;
  if (!rsvpId || position === null || position === undefined) return null;

  return (
    <Paper withBorder p="md" radius="md" bg="yellow.0">
      <Group gap="md">
        <IconUserPlus size={24} color="var(--mantine-color-yellow-6)" />
        <div style={{ flex: 1 }}>
          <Text fw={600}>You're on the waitlist</Text>
          <Text size="sm">
            Your position: <Badge color="yellow" size="lg">{position + 1}</Badge>
          </Text>
          <Text size="xs" c="dimmed">
            We'll notify you if a spot opens up.
          </Text>
        </div>
      </Group>
    </Paper>
  );
}