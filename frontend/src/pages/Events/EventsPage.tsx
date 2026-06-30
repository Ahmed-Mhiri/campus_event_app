import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Stack,
  Group,
  Select,
  TextInput,
  Button,
  Paper,
  Grid,
  Badge,
  Collapse,
  Chip,
  Text,
} from '@mantine/core';
import {
  IconMapPin,
  IconSearch,
  IconFilter,
  IconX,
  IconClock,
  IconCalendar,
  IconWallet,
} from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { useCategories } from '@/hooks/useCategories';
import type { EventsFilters } from '@/hooks/useEvents';
import { PageHeader } from '@/components/layout/PageHeader';
import { EventFeed } from '@/components/organisms/EventFeed';
import { PageSkeleton } from '@/components/ui/Skeleton';

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
    } else if (quickFilter === 'weekend') {
      // implement logic if needed
    } else if (quickFilter === 'free') {
      // implement logic if needed
    } else {
      if (!quickFilter) {
        setDateRange([null, null]);
      }
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
    const newFilters: EventsFilters = {
      categoryId: selectedCategoryId || undefined,
      dateFrom: dateRange[0] || undefined,
      dateTo: dateRange[1] || undefined,
      location: locationFilter || undefined,
      q: searchQuery || undefined,
      sort: filters.sort || 'startTime',
    };
    setFilters(newFilters);
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
    { value: 'viewCount', label: 'Most Popular' },
  ];

  const activeFilters = [];
  if (filters.q) activeFilters.push({ key: 'q', label: `Search: ${filters.q}` });
  if (filters.categoryId && categories) {
    const cat = categories.find(c => c.id === filters.categoryId);
    if (cat) activeFilters.push({ key: 'categoryId', label: cat.name });
  }
  if (filters.location) activeFilters.push({ key: 'location', label: `Location: ${filters.location}` });
  if (filters.dateFrom) activeFilters.push({ key: 'dateFrom', label: `From: ${filters.dateFrom}` });
  if (filters.dateTo) activeFilters.push({ key: 'dateTo', label: `To: ${filters.dateTo}` });

  if (categoriesLoading) {
    return <PageSkeleton count={6} />;
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <PageHeader title="All Events" subtitle="Discover and join campus events" />

        <Paper
          withBorder
          p="lg"
          radius="lg"
          className="sticky top-20 z-10 bg-white dark:bg-slate-800"
        >
          <Stack gap="md">
            <Group gap="xs">
              <Chip
                checked={quickFilter === 'today'}
                onChange={() => setQuickFilter(quickFilter === 'today' ? null : 'today')}
                variant="filled"
                color="brand"
              >
                <IconClock size={14} className="inline mr-1" aria-hidden="true" />
                Today
              </Chip>
              <Chip
                checked={quickFilter === 'weekend'}
                onChange={() => setQuickFilter(quickFilter === 'weekend' ? null : 'weekend')}
                variant="filled"
                color="brand"
              >
                <IconCalendar size={14} className="inline mr-1" aria-hidden="true" />
                This Weekend
              </Chip>
              <Chip
                checked={quickFilter === 'free'}
                onChange={() => setQuickFilter(quickFilter === 'free' ? null : 'free')}
                variant="filled"
                color="brand"
              >
                <IconWallet size={14} className="inline mr-1" aria-hidden="true" />
                Free
              </Chip>
            </Group>

            <Grid align="end" gap="md">
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <TextInput
                  label="Search"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  leftSection={<IconSearch size={16} aria-hidden="true" />}
                  radius="md"
                  aria-label="Search events"
                />
              </Grid.Col>

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
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Group gap="sm">
                  <Button
                    leftSection={<IconFilter size={16} aria-hidden="true" />}
                    onClick={applyFilters}
                    radius="md"
                    aria-label="Apply filters"
                  >
                    Apply
                  </Button>
                  <Button
                    variant="subtle"
                    leftSection={<IconX size={16} aria-hidden="true" />}
                    onClick={clearFilters}
                    radius="md"
                    aria-label="Clear all filters"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="subtle"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    radius="md"
                    aria-label={showAdvanced ? 'Hide advanced filters' : 'Show advanced filters'}
                  >
                    {showAdvanced ? 'Hide Advanced' : 'Advanced'}
                  </Button>
                </Group>
              </Grid.Col>
            </Grid>

            <Collapse expanded={showAdvanced}>
              <Grid align="end" gap="md" mt="sm">
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <TextInput
                    label="Location"
                    placeholder="City or venue"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.currentTarget.value)}
                    leftSection={<IconMapPin size={16} aria-hidden="true" />}
                    radius="md"
                    aria-label="Filter by location"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <DatePickerInput
                    label="Date Range"
                    type="range"
                    placeholder="Pick dates"
                    value={dateRange}
                    onChange={(val) => setDateRange(val as [string | null, string | null])}
                    valueFormat="YYYY-MM-DD"
                    clearable
                    radius="md"
                    aria-label="Filter by date range"
                  />
                </Grid.Col>
              </Grid>
            </Collapse>

            {activeFilters.length > 0 && (
              <Group gap="xs" mt="xs">
                <Text size="sm" c="dimmed">Active:</Text>
                {activeFilters.map(({ key, label }) => (
                  <Badge
                    key={key}
                    variant="light"
                    radius="md"
                    rightSection={
                      <IconX
                        size={12}
                        className="cursor-pointer hover:opacity-70"
                        onClick={() => removeFilter(key as keyof EventsFilters)}
                        aria-label={`Remove ${label} filter`}
                      />
                    }
                  >
                    {label}
                  </Badge>
                ))}
              </Group>
            )}
          </Stack>
        </Paper>

        <EventFeed filters={filters} />
      </Stack>
    </Container>
  );
}