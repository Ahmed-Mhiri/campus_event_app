// src/api/searchApi.ts
import { api } from './client';
import { useAuthStore } from '@/stores/authStore';
import type { ApiResponse, SearchSuggestion } from '@/types';

export const searchApi = {
  getSuggestions: (q: string, type: 'ALL' | 'EVENT' | 'CATEGORY' | 'USER' | 'LOCATION' = 'ALL') => {
    const isAuth = useAuthStore.getState().isAuthenticated;
    const endpoint = isAuth ? '/api/search/suggestions' : '/api/public/search/suggestions';
    return api.get<ApiResponse<SearchSuggestion[]>>(endpoint, {
      params: { q, type },
    });
  },
};