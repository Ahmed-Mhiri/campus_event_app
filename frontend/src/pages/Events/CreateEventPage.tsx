// src/pages/Events/CreateEventPage.tsx
import { Stack, ThemeIcon } from '@mantine/core';
import { IconCalendarPlus } from '@tabler/icons-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EventForm } from '@/components/organisms/EventForm';
import { ROUTES } from '@/constants/routes';

export function CreateEventPage() {
  return (
    <PageContainer size="md">
      <Stack gap="xl">
        <PageHeader
          title="Create a new event"
          subtitle="Fill in the details below — you can always edit or save it as a draft first."
          breadcrumbs={[
            { label: 'Events', href: ROUTES.EVENTS },
            { label: 'Create event' },
          ]}
        />

        {/* Info box - Maximum Visibility Version */}
        <div className="flex items-start gap-3 rounded-2xl border border-violet-200 border-l-4 border-l-violet-500 bg-white px-5 py-4 shadow-sm dark:border-violet-900/50 dark:bg-violet-950/30">
          <ThemeIcon size={32} radius="lg" color="brand" variant="light" className="shrink-0 mt-0.5">
            <IconCalendarPlus size={16} />
          </ThemeIcon>
          <p className="m-0 text-base font-bold leading-relaxed tracking-wide !text-black !opacity-100 dark:!text-white">
            Great events have a clear title, a specific location, and a realistic capacity.
            You can add photos and videos after creating the event.
          </p>
        </div>

        <EventForm isDraft />
      </Stack>
    </PageContainer>
  );
}