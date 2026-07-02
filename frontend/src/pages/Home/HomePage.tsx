import { SimpleGrid, Stack, Text, Group, Skeleton, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '@/components/molecules/EventCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Section } from '@/components/atoms/Section';
import { HeroSection } from '@/components/organisms/HeroSection';
import { useFeaturedEvents, useEvents } from '@/hooks/useEvents';
import { useCategories } from '@/hooks/useCategories';
import { ROUTES } from '@/constants/routes';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Button } from '@/components/ui/Button';
import { StatsStrip } from '@/components/organisms/StatsStrip';
import { HappeningSoon } from '@/components/organisms/HappeningSoon';
import { CategoryTile } from '@/components/molecules/CategoryTile';

export function HomePage() {
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedEvents();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: upcomingData } = useEvents({ sort: 'startTime' });
  const navigate = useNavigate();

  const featuredEvents = featuredData?.content ?? [];
  const upcomingEvents = upcomingData?.pages?.[0]?.content ?? [];

  const stats = [
    { value: `${upcomingEvents.length}`, label: 'Events this month' },
    { value: '2.4k', label: 'Active students' },
    { value: `${categories?.length ?? 0}`, label: 'Categories to explore' },
    { value: '4.8', label: 'Average host rating' },
  ];

  return (
    <Stack gap={0}>
      <HeroSection />

      <StatsStrip stats={stats} />

      <HappeningSoon events={upcomingEvents} />

      {/* Categories */}
      <Section
        title="Browse by category"
        subtitle="Find events that match your interests"
        py="3.5rem"
      >
        {categoriesLoading ? (
          <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="sm">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={84} radius="lg" />
            ))}
          </SimpleGrid>
        ) : (
          <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="sm">
            {categories?.map((cat, i) => (
              <CategoryTile key={cat.id} category={cat} index={i} />
            ))}
          </SimpleGrid>
        )}
      </Section>

      {/* Curated picks */}
      <Section withBackground py="4rem">
        <Group justify="space-between" align="flex-end" mb="lg" wrap="wrap">
          <div>
            {/* ✅ FIXED: Use size="h3" + explicit color via style, not Tailwind dark: */}
            <Title order={2} size="h3" fw={800} style={{ color: 'var(--app-text)' }}>
              Curated for you
            </Title>
            <Text size="lg" mt={4} style={{ color: 'var(--app-text-secondary)' }}>
              Hand-picked events worth planning ahead for
            </Text>
          </div>
          {featuredEvents.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => navigate(ROUTES.EVENTS)}
              rightSection={<IconArrowRight size={16} />}
              aria-label="See all events"
            >
              See all events
            </Button>
          )}
        </Group>

        {featuredLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </SimpleGrid>
        ) : featuredEvents.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="No featured events yet"
            description="Check back soon for exciting events!"
            action={{ label: 'Browse all events', onClick: () => navigate(ROUTES.EVENTS) }}
          />
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </SimpleGrid>
        )}
      </Section>
    </Stack>
  );
}