import { Paper, Group, Text, Badge, Loader, ThemeIcon } from '@mantine/core';
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
    <Paper
      withBorder
      p="md"
      radius="md"
      style={{
        background: 'var(--app-bg)',
        color: 'var(--app-text)',
        borderColor: 'var(--app-border)',
      }}
    >
      <Group gap="md">
        <ThemeIcon color="yellow" variant="light" size="lg" radius="xl">
          <IconUserPlus size={20} />
        </ThemeIcon>
        <div style={{ flex: 1 }}>
          <Text fw={600} style={{ color: 'var(--app-text)' }}>
            You're on the waitlist
          </Text>
          <Group gap="xs" mt={2}>
            <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
              Your position:
            </Text>
            <Badge color="yellow" variant="light" size="lg">
              {position + 1}
            </Badge>
          </Group>
          <Text size="xs" c="dimmed" mt={2}>
            We'll notify you if a spot opens up.
          </Text>
        </div>
      </Group>
    </Paper>
  );
}