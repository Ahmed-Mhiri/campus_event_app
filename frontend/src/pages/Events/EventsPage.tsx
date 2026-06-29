import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Stack, Group, Select, TextInput, Button, Paper, Grid, Badge } from '@mantine/core';
import { IconMapPin, IconSearch, IconFilter, IconX } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { useCategories } from '@/hooks/useCategories';
import type { EventsFilters } from '@/hooks/useEvents';
import { PageHeader } from '@/components/molecules/PageHeader';
import { EventFeed } from '@/components/organisms/EventFeed';
import { Text } from '@mantine/core';

export function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories } = useCategories();

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
    setFilters({});
  };

  const sortOptions = [
    { value: 'startTime', label: 'Date (soonest)' },
    { value: 'startTime,desc', label: 'Date (latest)' },
    { value: 'viewCount', label: 'Most Popular' },
  ];

  const handleDateRangeChange = (value: [string | null, string | null]) => {
    setDateRange(value);
  };

  const hasActiveFilters = Boolean(
    selectedCategoryId || dateRange[0] || dateRange[1] || locationFilter || searchQuery
  );

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <PageHeader title="All Events" subtitle="Discover and join campus events" />

        {/* Filter Bar */}
        <Paper
          withBorder
          p="lg"
          radius="lg"
          style={{
            background: 'var(--app-surface)',
            position: 'sticky',
            top: 80,
            zIndex: 10,
          }}
        >
          <Grid align="end" gap="md">
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                label="Search"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                leftSection={<IconSearch size={16} />}
                radius="md"
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
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <DatePickerInput
                label="Date Range"
                type="range"
                placeholder="Pick dates"
                value={dateRange}
                onChange={handleDateRangeChange}
                valueFormat="YYYY-MM-DD"
                clearable
                radius="md"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                label="Location"
                placeholder="City or venue"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.currentTarget.value)}
                leftSection={<IconMapPin size={16} />}
                radius="md"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="Sort by"
                data={sortOptions}
                value={filters.sort || 'startTime'}
                onChange={(val) => setFilters((prev) => ({ ...prev, sort: val || 'startTime' }))}
                radius="md"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Group gap="sm">
                <Button
                  leftSection={<IconFilter size={16} />}
                  onClick={applyFilters}
                  radius="md"
                >
                  Apply Filters
                </Button>
                <Button
                  variant="subtle"
                  leftSection={<IconX size={16} />}
                  onClick={clearFilters}
                  radius="md"
                >
                  Clear
                </Button>
              </Group>
            </Grid.Col>
          </Grid>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <Group gap="xs" mt="md">
              <Text size="sm" c="dimmed">Active:</Text>
              {searchQuery && (
                <Badge variant="light" radius="md">
                  Search: {searchQuery}
                </Badge>
              )}
              {selectedCategoryId && categories?.find(c => c.id === selectedCategoryId) && (
                <Badge variant="light" radius="md">
                  {categories.find(c => c.id === selectedCategoryId)!.name}
                </Badge>
              )}
              {locationFilter && (
                <Badge variant="light" radius="md">
                  Location: {locationFilter}
                </Badge>
              )}
              {dateRange[0] && (
                <Badge variant="light" radius="md">
                  From: {dateRange[0]}
                </Badge>
              )}
              {dateRange[1] && (
                <Badge variant="light" radius="md">
                  To: {dateRange[1]}
                </Badge>
              )}
            </Group>
          )}
        </Paper>

        {/* Feed */}
        <EventFeed filters={filters} />
      </Stack>
    </Container>
  );
}