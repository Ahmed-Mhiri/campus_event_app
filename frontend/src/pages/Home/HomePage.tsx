import { SimpleGrid, Stack, Text, Group, Paper, ThemeIcon, Skeleton } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconSearch, IconCalendarPlus, IconUsers } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '@/components/molecules/EventCard';
import { SkeletonCard } from '@/components/atoms/SkeletonCard';
import { Section } from '@/components/atoms/Section';
import { HeroSection } from '@/components/organisms/HeroSection';
import { useFeaturedEvents } from '@/hooks/useEvents';
import { CategoryChip } from '@/components/molecules/CategoryChip';
import { useCategories } from '@/hooks/useCategories';
import { ROUTES } from '@/constants/routes';
import { EmptyState } from '@/components/atoms/EmptyState';

export function HomePage() {
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedEvents();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const navigate = useNavigate();

  const featuredEvents = featuredData?.content ?? [];

  return (
    <Stack gap={0}>
      {/* HERO SECTION */}
      <HeroSection />

      {/* CATEGORIES SECTION */}
      <Section title="Browse by Category" subtitle="Find events that match your interests">
        {categoriesLoading ? (
          <Group gap="sm">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={36} width={100} radius="xl" />
            ))}
          </Group>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {categories?.map((cat) => (
              <motion.div
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CategoryChip
                  name={cat.name}
                  color={cat.color}
                  categoryId={cat.id}
                  size="md"
                />
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      {/* FEATURED EVENTS SECTION */}
      <Section
        title="Featured Events"
        subtitle="Hand-picked events you don't want to miss"
        withBackground
      >
        {featuredLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
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

      {/* HOW IT WORKS SECTION */}
      <Section title="How It Works">
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
          {[
            { icon: IconSearch, title: 'Discover', desc: 'Browse events by category, date, or location' },
            { icon: IconCalendarPlus, title: 'Register', desc: 'RSVP with one click and get reminders' },
            { icon: IconUsers, title: 'Connect', desc: 'Meet new people and build your network' },
          ].map((item, i) => (
            <Paper key={i} p="xl" radius="lg" withBorder ta="center">
              <ThemeIcon size={56} radius="xl" color="brand" variant="light" mb="md">
                <item.icon size={28} />
              </ThemeIcon>
              <Text fw={600} size="lg" mb="xs">{item.title}</Text>
              <Text c="dimmed" size="sm">{item.desc}</Text>
            </Paper>
          ))}
        </SimpleGrid>
      </Section>
    </Stack>
  );
}