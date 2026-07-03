import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Autocomplete, Loader, Group, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useSearch } from '@/hooks/useSearch';
import { ROUTES } from '@/constants/routes';

interface SearchBarProps {
  placeholder?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function SearchBar({ placeholder = 'Search events, users, categories...', size = 'md' }: SearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { suggestions, loading } = useSearch(query);

  // Deduplicate suggestions by value to prevent Mantine Autocomplete crashes
  const uniqueSuggestions = Array.from(
    new Map(suggestions.map((item) => [item.value, item])).values()
  );

  // ✅ CRITICAL: Do NOT use 'group' – it causes Mantine v7 to crash.
  const data = uniqueSuggestions.map((item) => ({
    value: String(item.value || ''),
    label: String(item.value || ''),
    itemType: item.type || 'OTHER', // renamed from 'group'
    id: item.id,
    subtitle: item.subtitle || '',
    type: item.type || 'OTHER',
  }));

  const handleSelect = (selectedValue: string) => {
    const selected = uniqueSuggestions.find((s) => s.value === selectedValue);
    if (!selected) return;

    switch (selected.type) {
      case 'EVENT':
        navigate(ROUTES.EVENT_DETAIL(selected.id));
        break;
      case 'USER':
        navigate(ROUTES.USER_PROFILE(selected.id));
        break;
      case 'CATEGORY':
        navigate(`${ROUTES.EVENTS}?categoryId=${selected.id}`);
        break;
      case 'LOCATION':
        navigate(`${ROUTES.EVENTS}?location=${encodeURIComponent(selected.value)}`);
        break;
      default:
        break;
    }
    setQuery('');
  };

  // Pressing Enter triggers a raw text search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim().length > 0) {
      navigate(`${ROUTES.EVENTS}?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      e.currentTarget.blur();
    }
  };

  return (
    <Autocomplete
      placeholder={placeholder}
      value={query}
      onChange={setQuery}
      data={data}
      onOptionSubmit={handleSelect}
      onKeyDown={handleKeyDown}
      leftSection={<IconSearch size={16} aria-hidden="true" />}
      rightSection={loading ? <Loader size="xs" aria-label="Loading search results" /> : null}
      size={size}
      radius="xl"
      aria-label="Search"
      renderOption={({ option }) => {
        const suggestion = uniqueSuggestions.find((s) => s.value === option.value);
        if (!suggestion) return null;
        return (
          <Group wrap="nowrap" gap="xs">
            <div style={{ flex: 1 }}>
              <Text size="sm" fw={500}>{suggestion.value}</Text>
              <Text size="xs" c="dimmed">{suggestion.subtitle}</Text>
            </div>
            <Text size="xs" c="dimmed" tt="capitalize">
              {suggestion.type?.toLowerCase() || 'other'}
            </Text>
          </Group>
        );
      }}
    />
  );
}