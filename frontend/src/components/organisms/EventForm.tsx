// src/components/organisms/EventForm/EventForm.tsx
import { useState } from 'react';
import {
  Paper,
  Stack,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Button,
  Group,
  Divider,
  LoadingOverlay
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '@/api/eventsApi';
import { useCategories } from '@/hooks/useCategories';
import { ROUTES } from '@/constants/routes';
import type { CreateEventRequest, Event } from '@/types';

interface EventFormProps {
  initialValues?: Event | null;
  eventId?: string | null;
  isDraft?: boolean;
}

export function EventForm({ initialValues, eventId, isDraft = false }: EventFormProps) {
  const navigate = useNavigate();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      location: initialValues?.location || '',
      startTime: initialValues?.startTime ? new Date(initialValues.startTime) : null,
      endTime: initialValues?.endTime ? new Date(initialValues.endTime) : null,
      maxCapacity: initialValues?.maxCapacity || 10,
      categoryIds: initialValues?.categories?.map((c) => c.id) || [],
      slug: initialValues?.slug || '',
    },
    validate: {
      title: (value) => (value.length < 3 ? 'Title must be at least 3 characters' : null),
      location: (value) => (value.length < 1 ? 'Location is required' : null),
      startTime: (value) => (value === null ? 'Start time is required' : null),
      endTime: (value, values) => {
        if (value === null) return 'End time is required';
        if (values.startTime && value <= values.startTime) {
          return 'End time must be after start time';
        }
        return null;
      },
      maxCapacity: (value) => (value < 1 ? 'Capacity must be at least 1' : null),
    },
  });

  const handleSubmit = async (publish: boolean = false) => {
    const validation = form.validate();
    if (validation.hasErrors) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fix the highlighted fields.',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const payload: CreateEventRequest = {
        title: form.values.title,
        description: form.values.description || undefined,
        location: form.values.location,
        startTime: form.values.startTime!.toISOString(),
        endTime: form.values.endTime!.toISOString(),
        maxCapacity: form.values.maxCapacity,
        categoryIds: form.values.categoryIds.length > 0 ? form.values.categoryIds : undefined,
        slug: form.values.slug || undefined,
      };

      let response;
      if (eventId) {
        // Update existing event
        response = await eventsApi.updateEvent(eventId, payload);
      } else if (!publish && isDraft) {
        // Create draft
        response = await eventsApi.createDraft(payload);
      } else {
        // Create and publish
        response = await eventsApi.createEvent(payload);
      }

      const event = response.data.data;
      notifications.show({
        title: 'Success!',
        message: eventId ? 'Event updated successfully.' : 'Event created successfully.',
        color: 'green',
      });

      // If we have a slug, navigate to it; otherwise use the event ID
      if (event?.slug) {
        navigate(ROUTES.EVENT_DETAIL(event.slug));
      } else if (event?.id) {
        navigate(`/events/detail/${event.id}`);
      } else {
        navigate(ROUTES.EVENTS);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Something went wrong.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories?.map((c) => ({
    value: String(c.id),
    label: c.name,
  })) ?? [];

  return (
    <Paper pos="relative" p="xl" radius="md" withBorder>
      <LoadingOverlay visible={loading || categoriesLoading} />

      <form onSubmit={(e) => e.preventDefault()}>
        <Stack gap="md">
          <TextInput
            label="Event Title"
            placeholder="Give your event a catchy title"
            required
            {...form.getInputProps('title')}
          />

          <Textarea
            label="Description"
            placeholder="Describe your event (max 2000 characters)"
            maxLength={2000}
            autosize
            minRows={4}
            {...form.getInputProps('description')}
          />

          <TextInput
            label="Location"
            placeholder="Where will this event take place?"
            required
            {...form.getInputProps('location')}
          />

          <Group grow>
            <DateTimePicker
              label="Start Time"
              placeholder="Pick start date and time"
              required
              clearable
              valueFormat="DD.MM.YYYY HH:mm"
              {...form.getInputProps('startTime')}
            />
            <DateTimePicker
              label="End Time"
              placeholder="Pick end date and time"
              required
              clearable
              valueFormat="DD.MM.YYYY HH:mm"
              {...form.getInputProps('endTime')}
            />
          </Group>

          <NumberInput
            label="Max Capacity"
            placeholder="Number of spots"
            min={1}
            required
            {...form.getInputProps('maxCapacity')}
          />

          <Select
            label="Categories"
            placeholder="Select categories"
            data={categoryOptions}
            multiple
            searchable
            clearable
            {...form.getInputProps('categoryIds')}
          />

          <TextInput
            label="Custom Slug (optional)"
            placeholder="custom-event-url"
            description="If left empty, a slug will be auto-generated from the title."
            {...form.getInputProps('slug')}
          />

          <Divider my="sm" />

          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => navigate(-1)}>
              Cancel
            </Button>

            {!eventId && (
              <Button
                variant="light"
                onClick={() => handleSubmit(false)}
                disabled={loading}
              >
                Save as Draft
              </Button>
            )}

            <Button
              type="submit"
              onClick={() => handleSubmit(true)}
              loading={loading}
            >
              {eventId ? 'Update Event' : 'Publish Event'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}