//frontend\src\components\organisms\EventFeed.tsx
import { useInView } from 'react-intersection-observer';
import { SimpleGrid, Loader, Center, Text, Stack } from '@mantine/core';
import { useEvents } from '@/hooks/useEvents';
import type { EventsFilters } from '@/hooks/useEvents';
import { SkeletonCard } from '../atoms/SkeletonCard';
import { EmptyState } from '../atoms/EmptyState';
import { EventCard } from '../molecules/EventCard';

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

  // Trigger fetch when the sentinel becomes visible
  if (inView && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }

  const events = data?.pages.flatMap((page) => page?.content ?? []) ?? [];

  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </SimpleGrid>
    );
  }

  if (error) {
    return (
      <Center p="xl">
        <Text c="red" role="alert">
          Failed to load events: {(error as Error).message}
        </Text>
      </Center>
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon="search"
        title="No events found"
        description="Try adjusting your filters or search criteria."
      />
    );
  }

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </SimpleGrid>

      {/* Sentinel for infinite scroll */}
      <div ref={ref} style={{ height: 20 }} aria-hidden="true" />

      {isFetchingNextPage && (
        <Center>
          <Loader size="sm" aria-label="Loading more events" />
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