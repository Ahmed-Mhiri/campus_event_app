import { useEffect } from 'react';
import { Stack, Switch, Select, Button, Group, Text, ThemeIcon, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconBell, IconGlobe, IconCheck, IconArrowLeft } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { slideUp, staggerContainer } from '@/design-system/animations';
import type { UserPreferences } from '@/types';

export function PreferencesPage() {
  const { preferences, preferencesLoading, updatePreferences, isUpdatingProfile } = useAuth();

  const form = useForm<UserPreferences>({
    initialValues: {
      emailNotifications: true,
      pushNotifications: true,
      notifyOnRsvpChange: true,
      notifyOnReview: true,
      timezone: 'Europe/Berlin',
      language: 'de',
    },
  });

  useEffect(() => {
    if (preferences) {
      form.setValues(preferences);
    }
  }, [preferences]);

  const handleSubmit = async (values: UserPreferences) => {
    await updatePreferences(values);
  };

  if (preferencesLoading) return null;

  return (
    <PageContainer size="md">
      <Stack gap="xl">
        <PageHeader
          title="Preferences"
          subtitle="Customize your notifications and regional settings"
          breadcrumbs={[
            { label: 'Profile', href: ROUTES.PROFILE },
            { label: 'Preferences' },
          ]}
        />

        <motion.form
          onSubmit={form.onSubmit(handleSubmit)}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <Stack gap="md">
            {/* Notifications */}
            <motion.div variants={slideUp}>
              <Card variant="default" className="border-slate-200/80 dark:border-slate-700/60">
                <Group gap="sm" mb="md">
                  <ThemeIcon size={36} radius="lg" variant="light" color="violet">
                    <IconBell size={18} />
                  </ThemeIcon>
                  <div>
                    {/* ✅ FIXED: CSS var */}
                    <Text fw={600} style={{ color: 'var(--app-text)' }}>
                      Notifications
                    </Text>
                    <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                      Choose how you want to be notified
                    </Text>
                  </div>
                </Group>

                <Divider style={{ borderColor: 'var(--app-border)' }} className="mb-4" />

                <Stack gap="sm">
                  <Switch
                    label="Email Notifications"
                    description="Receive notifications via email"
                    {...form.getInputProps('emailNotifications', { type: 'checkbox' })}
                    size="md"
                    styles={{
                      label: { color: 'var(--app-text)' },
                      description: { color: 'var(--app-text-secondary)' },
                    }}
                  />
                  <Switch
                    label="Push Notifications"
                    description="Receive push notifications in-app"
                    {...form.getInputProps('pushNotifications', { type: 'checkbox' })}
                    size="md"
                    styles={{
                      label: { color: 'var(--app-text)' },
                      description: { color: 'var(--app-text-secondary)' },
                    }}
                  />
                  <Switch
                    label="Notify on RSVP changes"
                    description="Get notified when someone RSVPs to your events"
                    {...form.getInputProps('notifyOnRsvpChange', { type: 'checkbox' })}
                    size="md"
                    styles={{
                      label: { color: 'var(--app-text)' },
                      description: { color: 'var(--app-text-secondary)' },
                    }}
                  />
                  <Switch
                    label="Notify on Reviews"
                    description="Get notified when someone reviews your event"
                    {...form.getInputProps('notifyOnReview', { type: 'checkbox' })}
                    size="md"
                    styles={{
                      label: { color: 'var(--app-text)' },
                      description: { color: 'var(--app-text-secondary)' },
                    }}
                  />
                </Stack>
              </Card>
            </motion.div>

            {/* Regional */}
            <motion.div variants={slideUp}>
              <Card variant="default" className="border-slate-200/80 dark:border-slate-700/60">
                <Group gap="sm" mb="md">
                  <ThemeIcon size={36} radius="lg" variant="light" color="blue">
                    <IconGlobe size={18} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600} style={{ color: 'var(--app-text)' }}>
                      Regional Settings
                    </Text>
                    <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                      Language and timezone preferences
                    </Text>
                  </div>
                </Group>

                <Divider style={{ borderColor: 'var(--app-border)' }} className="mb-4" />

                <Stack gap="md">
                  <Select
                    label="Timezone"
                    data={['Europe/Berlin', 'Europe/London', 'America/New_York', 'Asia/Tokyo']}
                    {...form.getInputProps('timezone')}
                    radius="md"
                    size="md"
                    styles={{ label: { color: 'var(--app-text)' } }}
                  />
                  <Select
                    label="Language"
                    data={[
                      { value: 'de', label: 'Deutsch' },
                      { value: 'en', label: 'English' },
                    ]}
                    {...form.getInputProps('language')}
                    radius="md"
                    size="md"
                    styles={{ label: { color: 'var(--app-text)' } }}
                  />
                </Stack>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div variants={slideUp}>
              <Group justify="flex-end" gap="sm">
                <Button
                  variant="default"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => window.history.back()}
                  radius="md"
                  size="md"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isUpdatingProfile}
                  leftSection={<IconCheck size={16} />}
                  radius="md"
                  size="md"
                  color="brand"
                >
                  Save Preferences
                </Button>
              </Group>
            </motion.div>
          </Stack>
        </motion.form>
      </Stack>
    </PageContainer>
  );
}