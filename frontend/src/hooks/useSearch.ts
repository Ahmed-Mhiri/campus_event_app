// src/hooks/useSearch.ts
import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { searchApi } from '@/api/searchApi';
import type { SearchSuggestion } from '@/types';

export function useSearch(query: string, type: 'ALL' | 'EVENT' | 'CATEGORY' | 'USER' | 'LOCATION' = 'ALL') {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    searchApi
      .getSuggestions(debouncedQuery, type)
      .then((res) => {
        setSuggestions(res.data.data || []);
      })
      .catch(() => {
        setSuggestions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [debouncedQuery, type]);

  return { suggestions, loading };
}