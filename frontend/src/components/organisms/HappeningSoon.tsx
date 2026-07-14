import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Text, Group, Badge } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconClock, IconMapPin, IconUsers, IconBolt } from '@tabler/icons-react';
import { ROUTES } from '@/constants/routes';
import { CapacityBar } from '@/components/molecules/CapacityBar';
import type { Event } from '@/types';

interface HappeningSoonProps {
  events: Event[];
}

function getTimeLabel(startTime: string): { label: string; urgent: boolean } {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const diffMs = start - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 0) return { label: 'Happening now', urgent: true };
  if (diffHours < 1) return { label: `In ${Math.max(1, Math.round(diffHours * 60))} min`, urgent: true };
  if (diffHours < 24) return { label: `In ${Math.round(diffHours)}h`, urgent: diffHours < 4 };
  if (diffHours < 48) return { label: 'Tomorrow', urgent: false };
  return { label: `In ${Math.round(diffHours / 24)} days`, urgent: false };
}

export function HappeningSoon({ events }: HappeningSoonProps) {
  const sorted = useMemo(
    () =>
      [...events]
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 8),
    [events]
  );

  if (sorted.length === 0) return null;

  return (
    <div className="relative overflow-hidden bg-slate-950 py-12 md:py-16">
      <style>{`.happening-soon-scroll::-webkit-scrollbar { display: none; }`}</style>
      {/* Ambient glow, ties visually to the auth showcase panel elsewhere in the app */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(circle at 10% 20%, rgba(139,92,246,0.25), transparent 45%), radial-gradient(circle at 90% 60%, rgba(99,102,241,0.18), transparent 50%)',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <Text size="xs" fw={700} c="white" className="uppercase tracking-widest">
            Live on campus
          </Text>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-6">
          Happening soon
        </h2>

        {/* Horizontal scroll strip — deliberately not a grid, reinforces "feed" feel */}
        <div
          className="happening-soon-scroll flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sorted.map((event, i) => {
            const { label, urgent } = getTimeLabel(event.startTime);
            const coverImage =
              event.media?.find((m) => m.mediaType === 'IMAGE' && m.displayOrder === 0)?.mediumUrl ||
              event.media?.find((m) => m.mediaType === 'IMAGE')?.mediumUrl ||
              null;
            const isFull = event.currentRsvpCount >= event.maxCapacity;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="snap-start shrink-0"
              >
                <Link
                  to={ROUTES.EVENT_DETAIL(event.slug)}
                  className="group block w-[260px] rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-sm overflow-hidden transition-colors no-underline"
                >
                  <div className="relative h-32 bg-slate-800">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconBolt size={28} className="text-slate-600" />
                      </div>
                    )}
                    <Badge
                      size="sm"
                      radius="md"
                      variant="filled"
                      color={urgent ? 'red' : 'dark'}
                      leftSection={<IconClock size={11} />}
                      className="absolute top-2 left-2"
                    >
                      {label}
                    </Badge>
                  </div>

                  <div className="p-3.5">
                    <Text size="sm" fw={700} c="white" lineClamp={1} className="mb-1">
                      {event.title}
                    </Text>
                    <Group gap={4} className="text-slate-400 mb-2.5" wrap="nowrap">
                      <IconMapPin size={11} className="shrink-0" />
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {event.location}
                      </Text>
                    </Group>

                    <CapacityBar
                      current={event.currentRsvpCount}
                      max={event.maxCapacity}
                      showLabels={false}
                    />
                    <Group justify="space-between" mt={6}>
                      <Group gap={4}>
                        <IconUsers size={11} className="text-slate-500" />
                        <Text size="xs" c="dimmed">
                          {event.currentRsvpCount}/{event.maxCapacity}
                        </Text>
                      </Group>
                      {isFull && (
                        <Text size="xs" fw={600} c="orange.4">
                          Waitlist only
                        </Text>
                      )}
                    </Group>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}