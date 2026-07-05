import { SimpleGrid, Stack, Text, Group, Skeleton, Title, ThemeIcon, Button as MantineButton } from '@mantine/core';
import { IconArrowRight, IconQrcode, IconScan, IconAntennaBars5, IconStar } from '@tabler/icons-react';
import { useNavigate, Link } from 'react-router-dom';
import { EventCard } from '@/components/molecules/EventCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Section } from '@/components/atoms/Section';
import { HeroSection } from '@/components/organisms/HeroSection';
import { useFeaturedEvents, useEvents, useEvent } from '@/hooks/useEvents'; // ✅ Added useEvent
import { useCategories } from '@/hooks/useCategories';
import { useRsvp } from '@/hooks/useRsvp';
import { useReviews } from '@/hooks/useReviews';
import { ROUTES } from '@/constants/routes';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Button } from '@/components/ui/Button';
import { StatsStrip } from '@/components/organisms/StatsStrip';
import { HappeningSoon } from '@/components/organisms/HappeningSoon';
import { CategoryTile } from '@/components/molecules/CategoryTile';
import { useAuthStore } from '@/stores/authStore';
import type { Event } from '@/types';

export function HomePage() {
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedEvents();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: upcomingData } = useEvents({ sort: 'startTime' });
  const { useMyRsvps } = useRsvp(); // ✅ Use existing hook with status filter
  const { data: attendedData } = useMyRsvps('ATTENDED'); // ✅ Get attended events
  const navigate = useNavigate();

  const featuredEvents = featuredData?.content ?? [];
  const upcomingEvents = upcomingData?.pages?.[0]?.content ?? [];
  const attendedEvents = attendedData?.content ?? [];

  const stats = [
    { value: `${upcomingEvents.length}`, label: 'Events this month' },
    { value: '2.4k', label: 'Active students' },
    { value: `${categories?.length ?? 0}`, label: 'Categories to explore' },
    { value: '4.8', label: 'Average host rating' },
  ];

  return (
    <Stack gap={0}>
      <HeroSection />

      {/* Review Reminder Banner */}
      <ReviewBanner attendedEvents={attendedEvents} />

      <LiveActionBanner events={upcomingEvents} />

      <StatsStrip stats={stats} />

      <HappeningSoon events={upcomingEvents} />

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

      <Section withBackground py="4rem">
        <Group justify="space-between" align="flex-end" mb="lg" wrap="wrap">
          <div>
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

// ─── Review Reminder Banner ────────────────────────────────────────────────────

function ReviewBanner({ attendedEvents }: { attendedEvents: any[] }) {
  const { isAuthenticated, user } = useAuthStore();
  const { useEventReviews } = useReviews();

  // Get the most recent RSVP
  const sorted = [...(attendedEvents || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const latest = sorted[0];

  // ✅ FETCH FULL EVENT DETAILS: needed to check exact endTime
  const { data: eventDetails } = useEvent(latest?.eventId || '', false);
  const { data: reviewsData } = useEventReviews(latest?.eventId || '');

  const hasReviewed = reviewsData?.content?.some((r: any) => r.reviewer.id === user?.id);

  if (!isAuthenticated || !latest) return null;

  // ✅ STRICT TIME CHECK: Has the event actually finished?
  const isEnded = eventDetails ? new Date(eventDetails.endTime).getTime() <= Date.now() : false;

  // Hide banner if event is still loading, hasn't ended yet, or is already reviewed
  if (!eventDetails || !isEnded || hasReviewed) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/30 border-y border-yellow-200 dark:border-yellow-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Group justify="space-between" align="center" wrap="wrap">
          <Group gap="md">
            <ThemeIcon size={48} radius="md" color="yellow" variant="light">
              <IconStar size={24} />
            </ThemeIcon>
            <div>
              <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>
                You attended "{latest.eventTitle}" – share your experience!
              </Text>
              <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                Your review helps other students discover great events.
              </Text>
            </div>
          </Group>
          <MantineButton
            component={Link}
            to={`${ROUTES.EVENT_DETAIL(latest.eventId)}#reviews`}
            size="md"
            radius="xl"
            leftSection={<IconStar size={20} />}
            className="border-none shadow-lg hover:scale-105 transition-transform !bg-yellow-400 !text-yellow-950 hover:!bg-yellow-500"
          >
            Review Now
          </MantineButton>
        </Group>
      </div>
    </div>
  );
}

// ─── Live Action Banner ────────────────────────────────────────────────────────

function LiveActionBanner({ events }: { events: Event[] }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !events || events.length === 0) return null;

  const now = Date.now();

  const liveEvents = events.filter(
    (e) =>
      e.status === 'PUBLISHED' &&
      new Date(e.startTime).getTime() <= now &&
      new Date(e.endTime).getTime() > now
  );

  if (liveEvents.length === 0) return null;

  const liveHostedEvent = liveEvents.find((e) => e.isHost);
  const liveAttendingEvent = liveEvents.find(
    (e) => !e.isHost && e.myRsvpStatus === 'GOING'
  );

  if (liveHostedEvent) {
    return (
      <div className="bg-violet-600 dark:bg-violet-900 border-y border-violet-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="md">
              <ThemeIcon
                size={48}
                radius="md"
                color="white"
                variant="light"
                className="animate-pulse"
              >
                <IconAntennaBars5 size={24} />
              </ThemeIcon>
              <div>
                <Text c="white" fw={800} size="lg">
                  You are hosting "{liveHostedEvent.title}" right now!
                </Text>
                <Text c="violet.1" size="sm">
                  Attendees are waiting. Open your dashboard to manage entry.
                </Text>
              </div>
            </Group>
            <MantineButton
              component={Link}
              to={ROUTES.HOST_CHECKIN(liveHostedEvent.id)}
              variant="white"
              color="violet"
              size="md"
              radius="xl"
              leftSection={<IconQrcode size={20} />}
              className="shadow-lg hover:scale-105 transition-transform text-slate-900 dark:text-white"
            >
              Show QR Code
            </MantineButton>
          </Group>
        </div>
      </div>
    );
  }

  if (liveAttendingEvent) {
    return (
      <div className="bg-emerald-600 dark:bg-emerald-900 border-y border-emerald-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="md">
              <ThemeIcon size={48} radius="md" color="white" variant="light">
                <IconScan size={24} />
              </ThemeIcon>
              <div>
                <Text c="white" fw={800} size="lg">
                  "{liveAttendingEvent.title}" is happening now!
                </Text>
                <Text c="emerald.1" size="sm">
                  Have your scanner ready at the entrance.
                </Text>
              </div>
            </Group>
            <MantineButton
              component={Link}
              to={ROUTES.ATTENDEE_CHECKIN(liveAttendingEvent.id)}
              variant="white"
              color="emerald"
              size="md"
              radius="xl"
              leftSection={<IconScan size={20} />}
              className="shadow-lg hover:scale-105 transition-transform text-slate-900 dark:text-white"
            >
              Scan to Check-in
            </MantineButton>
          </Group>
        </div>
      </div>
    );
  }

  return null;
}