import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Stack,
  Group,
  Select,
  TextInput,
  Paper,
  Grid,
  Badge,
  Collapse,
  Text,
  Divider,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconMapPin,
  IconSearch,
  IconAdjustments,
  IconX,
  IconClock,
  IconCalendarWeek,
  IconWallet,
} from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { useCategories } from '@/hooks/useCategories';
import type { EventsFilters } from '@/hooks/useEvents';
import { PageHeader } from '@/components/layout/PageHeader';
import { EventFeed } from '@/components/organisms/EventFeed';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';

export function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const [filters, setFilters] = useState<EventsFilters>(() => {
    const categoryId = searchParams.get('categoryId');
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    const location = searchParams.get('location') || undefined;
    const q = searchParams.get('q') || undefined;
    const sort = searchParams.get('sort') || 'startTime';

    return {
      categoryId: categoryId ? Number(categoryId) : undefined,
      dateFrom,
      dateTo,
      location,
      q,
      sort,
    };
  });

  const [searchQuery, setSearchQuery] = useState(filters.q || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    filters.categoryId || null
  );
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    filters.dateFrom || null,
    filters.dateTo || null,
  ]);
  const [locationFilter, setLocationFilter] = useState(filters.location || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [quickFilter, setQuickFilter] = useState<string | null>(null);

  useEffect(() => {
    if (quickFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      setDateRange([today, today]);
    } else if (!quickFilter) {
      setDateRange([null, null]);
    }
  }, [quickFilter]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.set('categoryId', String(filters.categoryId));
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.location) params.set('location', filters.location);
    if (filters.q) params.set('q', filters.q);
    if (filters.sort) params.set('sort', filters.sort);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const applyFilters = () => {
    setFilters({
      categoryId: selectedCategoryId || undefined,
      dateFrom: dateRange[0] || undefined,
      dateTo: dateRange[1] || undefined,
      location: locationFilter || undefined,
      q: searchQuery || undefined,
      sort: filters.sort || 'startTime',
    });
  };

  const clearFilters = () => {
    setSelectedCategoryId(null);
    setDateRange([null, null]);
    setLocationFilter('');
    setSearchQuery('');
    setQuickFilter(null);
    setFilters({});
  };

  const removeFilter = (key: keyof EventsFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    if (key === 'q') setSearchQuery('');
    if (key === 'categoryId') setSelectedCategoryId(null);
    if (key === 'location') setLocationFilter('');
    if (key === 'dateFrom' || key === 'dateTo') setDateRange([null, null]);
  };

  const sortOptions = [
    { value: 'startTime', label: 'Date (soonest)' },
    { value: 'startTime,desc', label: 'Date (latest)' },
    { value: 'viewCount', label: 'Most popular' },
  ];

  const quickFilters = [
    { key: 'today', label: 'Today', icon: IconClock },
    { key: 'weekend', label: 'This weekend', icon: IconCalendarWeek },
    { key: 'free', label: 'Free', icon: IconWallet },
  ];

  const activeFilters: { key: keyof EventsFilters; label: string }[] = [];
  if (filters.q) activeFilters.push({ key: 'q', label: `"${filters.q}"` });
  if (filters.categoryId && categories) {
    const cat = categories.find((c) => c.id === filters.categoryId);
    if (cat) activeFilters.push({ key: 'categoryId', label: cat.name });
  }
  if (filters.location) activeFilters.push({ key: 'location', label: filters.location });
  if (filters.dateFrom) activeFilters.push({ key: 'dateFrom', label: `From ${filters.dateFrom}` });
  if (filters.dateTo) activeFilters.push({ key: 'dateTo', label: `To ${filters.dateTo}` });

  if (categoriesLoading) {
    return (
      <PageContainer size="lg">
        <PageSkeleton count={6} />
      </PageContainer>
    );
  }

  return (
    <PageContainer size="lg">
      <Stack gap="xl">
        <PageHeader title="All events" subtitle="Discover and join campus events" />

        <Paper
          radius="xl"
          p="lg"
          className="sticky top-[72px] z-20 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/60 shadow-sm"
          style={{ background: 'var(--app-surface)' }}
        >
          <Stack gap="md">
            {/* Search row */}
            <Group gap="sm" wrap="nowrap" align="center">
              <TextInput
                placeholder="Search events, hosts, or locations…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                leftSection={<IconSearch size={18} aria-hidden="true" />}
                radius="xl"
                size="md"
                className="flex-1"
                aria-label="Search events"
                styles={{
                  input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
                }}
              />
              <Tooltip label={showAdvanced ? 'Hide filters' : 'More filters'}>
                <ActionIcon
                  variant={showAdvanced ? 'filled' : 'light'}
                  color="brand"
                  size={42}
                  radius="xl"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  aria-label={showAdvanced ? 'Hide advanced filters' : 'Show advanced filters'}
                >
                  <IconAdjustments size={20} />
                </ActionIcon>
              </Tooltip>
              <Button variant="primary" radius="xl" onClick={applyFilters} className="hidden sm:flex" aria-label="Apply filters">
                Search
              </Button>
            </Group>

            {/* Quick filter pills - FIXED: use CSS vars instead of hardcoded Tailwind colors */}
            <Group gap="xs">
              {quickFilters.map(({ key, label, icon: Icon }) => {
                const active = quickFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setQuickFilter(active ? null : key)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors"
                    style={{
                      background: active ? 'var(--app-primary)' : 'transparent',
                      borderColor: active ? 'var(--app-primary)' : 'var(--app-border)',
                      color: active ? '#fff' : 'var(--app-text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.borderColor = 'var(--app-primary)';
                        e.currentTarget.style.color = 'var(--app-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.borderColor = 'var(--app-border)';
                        e.currentTarget.style.color = 'var(--app-text-secondary)';
                      }
                    }}
                    aria-pressed={active}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                );
              })}
            </Group>

            <Collapse expanded={showAdvanced}>
              <Divider mb="md" style={{ borderColor: 'var(--app-border)' }} />
              <Grid gap="md">
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Select
                    label="Category"
                    placeholder="All categories"
                    data={categories?.map((c) => ({ value: String(c.id), label: c.name })) ?? []}
                    value={selectedCategoryId ? String(selectedCategoryId) : null}
                    onChange={(val) => setSelectedCategoryId(val ? Number(val) : null)}
                    clearable
                    radius="md"
                    aria-label="Filter by category"
                    styles={{
                      label: { color: 'var(--app-text)' },
                      input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
                      dropdown: { background: 'var(--app-surface)', borderColor: 'var(--app-border)' },
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <TextInput
                    label="Location"
                    placeholder="City or venue"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.currentTarget.value)}
                    leftSection={<IconMapPin size={16} aria-hidden="true" />}
                    radius="md"
                    aria-label="Filter by location"
                    styles={{
                      label: { color: 'var(--app-text)' },
                      input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <DatePickerInput
                    label="Date range"
                    type="range"
                    placeholder="Pick dates"
                    value={dateRange}
                    onChange={(val) => setDateRange(val as [string | null, string | null])}
                    valueFormat="DD MMM YYYY"
                    clearable
                    radius="md"
                    aria-label="Filter by date range"
                    styles={{
                      label: { color: 'var(--app-text)' },
                      input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Select
                    label="Sort by"
                    data={sortOptions}
                    value={filters.sort || 'startTime'}
                    onChange={(val) => setFilters((prev) => ({ ...prev, sort: val || 'startTime' }))}
                    radius="md"
                    aria-label="Sort events"
                    styles={{
                      label: { color: 'var(--app-text)' },
                      input: { background: 'var(--app-bg)', color: 'var(--app-text)' },
                      dropdown: { background: 'var(--app-surface)', borderColor: 'var(--app-border)' },
                    }}
                  />
                </Grid.Col>
              </Grid>
              <Group justify="flex-end" gap="xs" mt="md">
                <Button variant="ghost" size="sm" onClick={clearFilters} aria-label="Clear all filters">
                  Clear all
                </Button>
                <Button variant="primary" size="sm" onClick={applyFilters} aria-label="Apply filters">
                  Apply filters
                </Button>
              </Group>
            </Collapse>

            {activeFilters.length > 0 && (
              <Group gap={6} pt={activeFilters.length ? 4 : 0}>
                <Text size="xs" fw={600} className="uppercase tracking-wide" style={{ color: 'var(--app-text-muted)' }}>
                  Filters
                </Text>
                {activeFilters.map(({ key, label }) => (
                  <Badge
                    key={key}
                    variant="light"
                    color="brand"
                    radius="xl"
                    rightSection={
                      <IconX
                        size={12}
                        className="cursor-pointer hover:opacity-70"
                        onClick={() => removeFilter(key)}
                        aria-label={`Remove ${label} filter`}
                      />
                    }
                  >
                    {label}
                  </Badge>
                ))}
                <Badge
                  variant="subtle"
                  color="gray"
                  radius="xl"
                  className="cursor-pointer"
                  onClick={clearFilters}
                >
                  Clear all
                </Badge>
              </Group>
            )}
          </Stack>
        </Paper>

        <EventFeed filters={filters} />
      </Stack>
    </PageContainer>
  );
}