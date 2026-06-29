// src/components/organisms/EventFeed/EventFeed.tsx
import { useInView } from 'react-intersection-observer';
import { SimpleGrid, Loader, Center, Text, Paper, Stack } from '@mantine/core';
import { EventCard } from '@/components/molecules/EventCard/EventCard';
import { useEvents } from '@/hooks/useEvents';
import type { EventsFilters } from '@/hooks/useEvents';

interface EventFeedProps {
  filters?: EventsFilters;
}

export function EventFeed({ filters = {} }: EventFeedProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useEvents(filters);

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  // Trigger fetch when the sentinel is visible
  if (inView && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }

  const events = data?.pages.flatMap((page) => page?.content ?? []) ?? [];

  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {Array.from({ length: 6 }).map((_, i) => (
          <Paper key={i} withBorder p="md" style={{ minHeight: 250 }}>
            <Stack>
              <div style={{ height: 160, background: '#f0f0f0' }} />
              <div style={{ height: 20, width: '80%', background: '#e0e0e0' }} />
              <div style={{ height: 16, width: '60%', background: '#e0e0e0' }} />
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>
    );
  }

  if (error) {
    return (
      <Center p="xl">
        <Text c="red">Failed to load events: {(error as Error).message}</Text>
      </Center>
    );
  }

  if (events.length === 0) {
    return (
      <Center p="xl">
        <Text c="dimmed" size="lg">No events found. Try adjusting your filters.</Text>
      </Center>
    );
  }

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </SimpleGrid>

      {/* Sentinel for infinite scroll */}
      <div ref={ref} style={{ height: 20 }} />

      {isFetchingNextPage && (
        <Center>
          <Loader size="sm" />
        </Center>
      )}

      {!hasNextPage && events.length > 0 && (
        <Text size="sm" c="dimmed" ta="center" mt="md">
          You've reached the end of the list.
        </Text>
      )}
    </Stack>
  );
}