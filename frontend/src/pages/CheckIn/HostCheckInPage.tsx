// src/pages/CheckIn/HostCheckInPage.tsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Stack,
  Loader,
  Center,
  Alert,
  Group,
  Badge,
  ThemeIcon,
  Text
} from '@mantine/core';
import {
  IconArrowLeft,
  IconQrcode,
  IconUsers,
  IconCrown,
  IconAlertCircle,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { CheckInCodeDisplay } from '@/components/molecules/CheckInCodeDisplay';
import { RsvpList } from '@/components/organisms/RsvpList';
import { useEvent } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { slideUp, staggerContainer } from '@/design-system/animations';
import { Button } from '@/components/ui/Button';

type TabKey = 'code' | 'attendees';

export function HostCheckInPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const { data: event, isLoading } = useEvent(eventId!, false);
  const [activeTab, setActiveTab] = useState<TabKey>('code');

  if (isLoading) {
    return (
      <PageContainer size="lg">
        <Center h="60vh">
          <Loader size="xl" color="brand" />
        </Center>
      </PageContainer>
    );
  }

  if (!event) {
    return (
      <PageContainer size="lg">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Alert
            icon={<IconAlertCircle size={18} />}
            color="red"
            radius="lg"
            variant="light"
            title="Event not found"
          >
            This event doesn't exist or has been removed.
          </Alert>
        </motion.div>
      </PageContainer>
    );
  }

  if (!event.isHost && user?.role !== 'ADMIN') {
    return (
      <PageContainer size="lg">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card
            variant="default"
            className="border-red-200/80 dark:border-red-900/40"
            style={{ background: 'rgba(239, 68, 68, 0.03)' }}
          >
            <Group gap="md" align="center">
              <ThemeIcon size={48} radius="xl" variant="light" color="red">
                <IconCrown size={24} />
              </ThemeIcon>
              <div>
                <Text fw={600} className="text-red-700 dark:text-red-400">
                  Access Denied
                </Text>
                <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                  You are not the host of this event. Only the event host or an admin can manage check-ins.
                </Text>
              </div>
            </Group>
          </Card>
        </motion.div>
      </PageContainer>
    );
  }

  const tabs: { key: TabKey; label: string; icon: typeof IconQrcode }[] = [
    { key: 'code', label: 'Check-in Code', icon: IconQrcode },
    { key: 'attendees', label: 'Attendees', icon: IconUsers },
  ];

  return (
    <PageContainer size="lg">
      <Stack gap="xl">
        <PageHeader
          title="Host Check-in"
          subtitle={event.title}
          breadcrumbs={[
            { label: 'Events', href: ROUTES.EVENTS },
            {
              label: event.title,
              href: ROUTES.EVENT_DETAIL(eventId!),
            },
            { label: 'Check-in' },
          ]}
          actions={
            <Badge
              color="brand"
              variant="light"
              radius="md"
              size="lg"
              leftSection={<IconCrown size={14} />}
            >
              Host
            </Badge>
          }
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Custom tab pills */}
          <motion.div variants={slideUp}>
            <Group
              gap="xs"
              className="border-b mb-6"
              style={{ borderColor: 'var(--app-border)' }}
            >
              {tabs.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
                      active
                        ? 'text-violet-600 dark:text-violet-400'
                        : 'hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    style={active ? {} : { color: 'var(--app-text-secondary)' }}
                    aria-pressed={active}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                    {active && (
                      <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </Group>
          </motion.div>

          {/* Content */}
          <motion.div variants={slideUp}>
            {activeTab === 'code' && (
              <Card
                variant="default"
                className="border-slate-200/80 dark:border-slate-700/60"
              >
                <CheckInCodeDisplay eventId={eventId!} />
              </Card>
            )}

            {activeTab === 'attendees' && (
              <Card
                variant="default"
                className="border-slate-200/80 dark:border-slate-700/60"
              >
                <RsvpList eventId={eventId!} isHost={true} />
              </Card>
            )}
          </motion.div>

          {/* Back Link */}
          <motion.div variants={slideUp} className="mt-6">
            <Button
              component={Link}
              to={ROUTES.EVENT_DETAIL(eventId!)}
              variant="ghost"
              leftSection={<IconArrowLeft size={16} />}
              style={{ color: 'var(--app-text-secondary)' }}
            >
              Back to event
            </Button>
          </motion.div>
        </motion.div>
      </Stack>
    </PageContainer>
  );
}