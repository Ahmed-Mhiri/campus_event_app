import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/api/eventsApi';
import { queryKeys } from '@/constants/queryKeys';
import { useAuthStore } from '@/stores/authStore';

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
  const { isAuthenticated } = useAuthStore();

  return useInfiniteQuery({
    queryKey: [queryKeys.events, filters, isAuthenticated],
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
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['featured-events', isAuthenticated],
    queryFn: async () => {
      try {
        const res = await eventsApi.getFeaturedEvents();
        const data = res.data.data;

        // Guard against null/undefined and empty content
        if (data && data.content && data.content.length > 0) {
          return data;
        }

        // No featured events – trigger fallback
        throw new Error('No featured events found');
      } catch {
        // Smart fallback: top 3 most viewed events
        const fallbackRes = await eventsApi.getEvents({
          size: 3,
          sort: 'viewCount,desc',
        });
        // Return the page data, or an empty page if null
        return fallbackRes.data.data ?? { content: [], totalElements: 0, totalPages: 0, page: 0, size: 0, last: true };
      }
    },
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