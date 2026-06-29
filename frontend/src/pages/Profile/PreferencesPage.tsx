// src/pages/Profile/PreferencesPage.tsx

import { useEffect } from 'react';
import { Container, Paper, Title, Stack, Switch, Select, Button, Group, Loader } from '@mantine/core'; // <-- added Group
import { useForm } from '@mantine/form';
import { useAuth } from '@/hooks/useAuth';
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

  if (preferencesLoading) return <Loader />;

  return (
    <Container size="sm" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} mb="lg">
          Preferences
        </Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Switch
              label="Email Notifications"
              description="Receive notifications via email"
              {...form.getInputProps('emailNotifications', { type: 'checkbox' })}
            />
            <Switch
              label="Push Notifications"
              description="Receive push notifications in-app"
              {...form.getInputProps('pushNotifications', { type: 'checkbox' })}
            />
            <Switch
              label="Notify on RSVP changes"
              description="Get notified when someone RSVPs to your events"
              {...form.getInputProps('notifyOnRsvpChange', { type: 'checkbox' })}
            />
            <Switch
              label="Notify on Reviews"
              description="Get notified when someone reviews your event"
              {...form.getInputProps('notifyOnReview', { type: 'checkbox' })}
            />
            <Select
              label="Timezone"
              data={['Europe/Berlin', 'Europe/London', 'America/New_York', 'Asia/Tokyo']}
              {...form.getInputProps('timezone')}
            />
            <Select
              label="Language"
              data={[
                { value: 'de', label: 'Deutsch' },
                { value: 'en', label: 'English' },
              ]}
              {...form.getInputProps('language')}
            />
            <Group justify="flex-end" mt="md">
              <Button type="submit" loading={isUpdatingProfile}>
                Save Preferences
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}