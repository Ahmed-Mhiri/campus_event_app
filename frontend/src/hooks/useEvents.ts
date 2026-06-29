// src/hooks/useEvents.ts
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/api/eventsApi';
import { queryKeys } from '@/constants/queryKeys';

// Export this interface
export interface EventsFilters {
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  q?: string;
  sort?: string;
}

const PAGE_SIZE = 20;

export function useEvents(filters: EventsFilters = {}) {
  return useInfiniteQuery({
    queryKey: [queryKeys.events, filters],
    queryFn: ({ pageParam = 0 }) =>
      eventsApi
        .getEvents({
          page: pageParam,
          size: PAGE_SIZE,
          ...filters,
        })
        .then((res) => res.data.data),
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.last) return undefined;
      return lastPage.page + 1;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useFeaturedEvents() {
  return useQuery({
    queryKey: ['featured-events'],
    queryFn: () => eventsApi.getFeaturedEvents().then((res) => res.data.data),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useEvent(slugOrId: string, isSlug = true) {
  return useQuery({
    queryKey: ['event', slugOrId],
    queryFn: () => {
      if (isSlug) {
        return eventsApi.getEventBySlug(slugOrId).then((res) => res.data.data);
      }
      return eventsApi.getEventById(slugOrId).then((res) => res.data.data);
    },
    staleTime: 1000 * 30,
  });
}