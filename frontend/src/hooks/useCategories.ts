// src/hooks/useCategories.ts
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/api/eventsApi';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => eventsApi.getCategories().then((res) => res.data.data),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}