// src/pages/Home/HomePage.tsx
import { Container, Title, SimpleGrid, Loader, Center, Stack, Text, Box } from '@mantine/core';
import { EventCard } from '@/components/molecules/EventCard/EventCard';
import { useFeaturedEvents } from '@/hooks/useEvents';
import { CategoryChip } from '@/components/molecules/CategoryChip/CategoryChip';
import { useCategories } from '@/hooks/useCategories';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';

export function HomePage() {
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedEvents();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const featuredEvents = featuredData?.content ?? [];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Hero section with SearchBar */}
        <Box>
          <Title order={1} ta="center" mb="xs">
            Discover Campus Events
          </Title>
          <Text ta="center" c="dimmed" size="lg" mb="lg">
            Find events, connect with students, and make the most of your university life.
          </Text>
          <Box maw={600} mx="auto">
            <SearchBar size="md" placeholder="Search events, users, categories..." />
          </Box>
        </Box>

        {/* Categories */}
        <div>
          <Title order={3} mb="md">Categories</Title>
          {categoriesLoading ? (
            <Loader size="sm" />
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {categories?.map((cat) => (
                <CategoryChip key={cat.id} name={cat.name} color={cat.color} />
              ))}
            </div>
          )}
        </div>

        {/* Featured Events */}
        <div>
          <Title order={3} mb="md">Featured Events</Title>
          {featuredLoading ? (
            <Center>
              <Loader size="md" />
            </Center>
          ) : featuredEvents.length === 0 ? (
            <Text c="dimmed">No featured events at the moment.</Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </SimpleGrid>
          )}
        </div>
      </Stack>
    </Container>
  );
}