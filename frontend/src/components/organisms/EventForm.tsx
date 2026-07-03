// src/components/organisms/EventForm/EventForm.tsx
import { useState } from 'react';
import {
  Paper,
  Stack,
  TextInput,
  Textarea,
  NumberInput,
  MultiSelect,
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
      categoryIds: initialValues?.categories?.map((c) => String(c.id)) || [],
      slug: initialValues?.slug || '',
    },
    validate: {
      title: (value) => (value.length < 3 ? 'Title must be at least 3 characters' : null),
      location: (value) => (value.length < 1 ? 'Location is required' : null),
      startTime: (value) => (!value ? 'Start time is required' : null),
      endTime: (value, values) => {
        if (!value) return 'End time is required';
        if (values.startTime && value <= values.startTime) {
          return 'End time must be after start time';
        }
        return null;
      },
      maxCapacity: (value) => (value < 1 ? 'Capacity must be at least 1' : null),
    },
  });

  const handleSubmit = async (publish: boolean = false) => {
    console.log('1. Submit button clicked!');

    const validation = form.validate();

    if (validation.hasErrors) {
      console.error('2. Frontend validation blocked:', validation.errors);
      const errorFields = Object.keys(validation.errors).join(', ');
      notifications.show({
        title: 'Missing Information',
        message: `Please fix the errors in these fields: ${errorFields}`,
        color: 'red',
      });
      return;
    }

    console.log('2. Validation passed! Prepping payload...');
    setLoading(true);

    try {
      // ✅ Enforce that the values are Date objects (avoids Mantine string bug)
      const startDate = new Date(form.values.startTime!);
      const endDate = new Date(form.values.endTime!);

      // Build clean payload – only include optional fields if they have content
      const payload: any = {
        title: form.values.title.trim(),
        location: form.values.location.trim(),
        // ✅ Spring Boot 'Instant' requires the 'Z' from toISOString()
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        maxCapacity: form.values.maxCapacity,
      };

      if (form.values.description?.trim()) {
        payload.description = form.values.description.trim();
      }
      if (form.values.categoryIds && form.values.categoryIds.length > 0) {
        payload.categoryIds = form.values.categoryIds.map(Number);
      }
      if (form.values.slug?.trim()) {
        payload.slug = form.values.slug.trim();
      }

      console.log('3. Sending clean payload to backend:', payload);

      let response;
      if (eventId) {
        response = await eventsApi.updateEvent(eventId, payload);
      } else if (!publish && isDraft) {
        response = await eventsApi.createDraft(payload);
      } else {
        response = await eventsApi.createEvent(payload);
      }

      console.log('4. Backend success!', response.data);
      const event = response.data.data;

      notifications.show({
        title: 'Success!',
        message: event?.status === 'UNDER_REVIEW'
          ? 'Event submitted for admin approval.'
          : (eventId ? 'Event updated.' : 'Event created and published.'),
        color: 'green',
      });

      if (event?.status === 'PUBLISHED' && event?.slug) {
        navigate(ROUTES.EVENT_DETAIL(event.slug));
      } else {
        navigate(ROUTES.MY_EVENTS);
      }
    } catch (error: any) {
      // Deep inspection logs
      console.error('4. FATAL ERROR DETAILS:', error);

      let msg = 'Something went wrong.';

      if (error.response) {
        console.error('-> Backend status:', error.response.status);
        console.error('-> Backend data:', error.response.data);

        if (error.response.data?.message) {
          msg = error.response.data.message;
        } else if (error.response.data?.errors) {
          const validationErrors = error.response.data.errors;
          const firstError = Array.isArray(validationErrors)
            ? validationErrors[0]?.defaultMessage
            : Object.values(validationErrors)[0];
          msg = `Backend validation failed: ${firstError || 'Invalid data'}`;
        } else {
          msg = `Backend rejected with status ${error.response.status}`;
        }
      } else if (error.request) {
        console.error('-> No response received – CORS or network failure.');
        msg = 'Cannot connect to server. Check your network or CORS policy.';
      } else {
        console.error('-> Request failed before leaving browser:', error.message);
        msg = `Frontend error: ${error.message}`;
      }

      notifications.show({ title: 'Error', message: String(msg), color: 'red' });
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

          <MultiSelect
            label="Categories"
            placeholder="Select categories"
            data={categoryOptions}
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