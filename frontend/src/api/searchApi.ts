// src/api/searchApi.ts
import { api } from './client';
import type { ApiResponse, SearchSuggestion } from '@/types';

export const searchApi = {
  getSuggestions: (q: string, type: 'ALL' | 'EVENT' | 'CATEGORY' | 'USER' | 'LOCATION' = 'ALL') =>
    api.get<ApiResponse<SearchSuggestion[]>>('/api/search/suggestions', {
      params: { q, type },
    }),
};