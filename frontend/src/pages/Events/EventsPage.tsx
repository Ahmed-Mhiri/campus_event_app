// src/pages/Events/EventsPage.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Title, Stack, Group, Select, TextInput, Button, Box, Paper, Grid } from '@mantine/core';
import { IconMapPin, IconSearch } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { EventFeed } from '@/components/organisms/EventFeed/EventFeed';
import { useCategories } from '@/hooks/useCategories';
import { CategoryChip } from '@/components/molecules/CategoryChip/CategoryChip';
import type { EventsFilters } from '@/hooks/useEvents';

export function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories } = useCategories();

  // Initialize filters from URL params
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

  // Local state for filter inputs – date range now stores strings (YYYY-MM-DD)
  const [searchQuery, setSearchQuery] = useState(filters.q || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    filters.categoryId || null
  );
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    filters.dateFrom || null,
    filters.dateTo || null,
  ]);
  const [locationFilter, setLocationFilter] = useState(filters.location || '');

  // Update URL when filters change
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

  // Handler now accepts strings (matches the DatePickerInput with valueFormat)
  const handleDateRangeChange = (value: [string | null, string | null]) => {
    setDateRange(value);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Title order={2}>All Events</Title>

        {/* Filter Bar */}
        <Paper withBorder p="md" radius="md">
          <Grid align="end">
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                label="Search"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                leftSection={<IconSearch size={16} />}
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
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <DatePickerInput
                label="Date Range"
                type="range"
                placeholder="Pick dates"
                value={dateRange}
                onChange={handleDateRangeChange}
                valueFormat="YYYY-MM-DD"   // ensures strings are used, matching the handler
                clearable
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                label="Location"
                placeholder="City or venue"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.currentTarget.value)}
                leftSection={<IconMapPin size={16} />}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="Sort by"
                data={sortOptions}
                value={filters.sort || 'startTime'}
                onChange={(val) => setFilters((prev) => ({ ...prev, sort: val || 'startTime' }))}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Group gap="sm">
                <Button onClick={applyFilters}>Apply</Button>
                <Button variant="default" onClick={clearFilters}>Clear</Button>
              </Group>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Active category chip */}
        {selectedCategoryId && categories?.find(c => c.id === selectedCategoryId) && (
          <Box>
            <CategoryChip
              name={categories.find(c => c.id === selectedCategoryId)!.name}
              color={categories.find(c => c.id === selectedCategoryId)!.color}
            />
          </Box>
        )}

        {/* Feed */}
        <EventFeed filters={filters} />
      </Stack>
    </Container>
  );
}