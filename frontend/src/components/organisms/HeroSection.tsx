import { Badge, Button } from '@mantine/core';
import { IconSparkles, IconPlus, IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { SearchBar } from '../molecules/SearchBar';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-slate-900" aria-label="Hero banner">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-900/30 via-transparent to-transparent" />

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/5 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-3xl" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="flex flex-col items-center text-center space-y-8">
          <Badge
            size="lg"
            radius="xl"
            variant="light"
            color="brand"
            leftSection={<IconSparkles size={14} aria-hidden="true" />}
            className="bg-brand-500/10 text-brand-300 border border-brand-500/20"
          >
            Campus Event Platform
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-3xl">
            Discover Amazing Events at{' '}
            <span className="text-brand-400">Your University</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl">
            Find events, connect with students, and make the most of your campus life.
          </p>

          <div className="w-full max-w-xl">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-2">
              <SearchBar size="lg" placeholder="Search events, users, categories..." />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              radius="xl"
              className="bg-white text-slate-900 hover:bg-slate-100 font-semibold"
              leftSection={<IconPlus size={18} aria-hidden="true" />}
              onClick={() => navigate(ROUTES.CREATE_EVENT)}
              aria-label="Create a new event"
            >
              Create Event
            </Button>
            <Button
              size="lg"
              radius="xl"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              rightSection={<IconArrowRight size={18} aria-hidden="true" />}
              onClick={() => navigate(ROUTES.EVENTS)}
              aria-label="Browse all events"
            >
              Browse Events
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}