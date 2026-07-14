// src/components/organisms/EventForm.tsx
import { useState, useEffect, useRef } from 'react';
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
  LoadingOverlay,
  Text,
  Image,
  SimpleGrid,
  ActionIcon,
  Box,
  Badge,
  Overlay,
  Modal,
  rem,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  IconUpload,
  IconPhoto,
  IconX,
  IconVideo,
  IconPlayerPlay,
  IconFilePlus,
  IconTrash,
  IconCloudUpload,
  IconMaximize,
} from '@tabler/icons-react';
import { eventsApi } from '@/api/eventsApi';
import { useCategories } from '@/hooks/useCategories';
import { ROUTES } from '@/constants/routes';
import type { Event } from '@/types';

interface MediaFile {
  id: string;
  file: File;
  previewUrl: string;
  type: 'IMAGE' | 'VIDEO';
  name: string;
  size: number;
}

interface EventFormProps {
  initialValues?: Event | null;
  eventId?: string | null;
  isDraft?: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];

export function EventForm({ initialValues, eventId, isDraft = false }: EventFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal state
  const [previewMedia, setPreviewMedia] = useState<MediaFile | null>(null);

  useEffect(() => {
    return () => mediaFiles.forEach((m) => URL.revokeObjectURL(m.previewUrl));
  }, [mediaFiles]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: MediaFile[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        notifications.show({
          title: 'File too large',
          message: `${file.name} exceeds 50MB limit.`,
          color: 'red',
        });
        continue;
      }

      if (!ACCEPTED_TYPES.includes(file.type)) {
        notifications.show({
          title: 'Unsupported file type',
          message: `${file.name} is not a supported image or video format.`,
          color: 'red',
        });
        continue;
      }

      const isVideo = file.type.startsWith('video/');
      const previewUrl = URL.createObjectURL(file);

      newFiles.push({
        id: crypto.randomUUID(),
        file,
        previewUrl,
        type: isVideo ? 'VIDEO' : 'IMAGE',
        name: file.name,
        size: file.size,
      });
    }

    setMediaFiles((prev) => [...prev, ...newFiles]);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (id: string) => {
    setMediaFiles((prev) => {
      const file = prev.find((m) => m.id === id);
      if (file) URL.revokeObjectURL(file.previewUrl);
      return prev.filter((m) => m.id !== id);
    });
  };

  const handleClearAll = () => {
    mediaFiles.forEach((m) => URL.revokeObjectURL(m.previewUrl));
    setMediaFiles([]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
    const validation = form.validate();
    if (validation.hasErrors) {
      const errorFields = Object.keys(validation.errors).join(', ');
      notifications.show({
        title: 'Missing Information',
        message: `Please fix the errors in these fields: ${errorFields}`,
        color: 'red',
      });
      return;
    }

    setLoading(true);

    try {
      const startDate = new Date(form.values.startTime!);
      const endDate = new Date(form.values.endTime!);

      const payload: any = {
        title: form.values.title.trim(),
        location: form.values.location.trim(),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        maxCapacity: form.values.maxCapacity,
      };

      if (form.values.description?.trim()) payload.description = form.values.description.trim();
      if (form.values.categoryIds && form.values.categoryIds.length > 0) {
        payload.categoryIds = form.values.categoryIds.map(Number);
      }
      if (form.values.slug?.trim()) payload.slug = form.values.slug.trim();

      let response;
      if (eventId) {
        response = await eventsApi.updateEvent(eventId, payload);
      } else if (!publish && isDraft) {
        response = await eventsApi.createDraft(payload);
      } else {
        response = await eventsApi.createEvent(payload);
      }

      const event = response.data.data;

      if (!eventId && mediaFiles.length > 0 && event?.id) {
        try {
          const images = mediaFiles.filter((m) => m.type === 'IMAGE').map((m) => m.file);
          const videos = mediaFiles.filter((m) => m.type === 'VIDEO').map((m) => m.file);

          if (images.length > 0) {
            const formData = new FormData();
            images.forEach((file) => formData.append('images', file));
            await eventsApi.uploadMedia(event.id, formData);
          }

          if (videos.length > 0) {
            const formData = new FormData();
            videos.forEach((file) => formData.append('videos', file));
            await eventsApi.uploadMedia(event.id, formData);
          }
        } catch (mediaError) {
          console.error('Media upload failed:', mediaError);
          notifications.show({
            title: 'Event created, but media upload failed',
            message: 'Your event is live. You can add photos and videos later from the Edit page.',
            color: 'orange',
          });
        }
      }

      // ✅ Invalidate React Query caches to show fresh data
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      if (event?.slug) {
        queryClient.invalidateQueries({ queryKey: ['event', event.slug] });
      }

      notifications.show({
        title: 'Success!',
        message: event?.status === 'UNDER_REVIEW'
          ? 'Event submitted for admin approval.'
          : eventId
          ? 'Event updated successfully!'
          : 'Event created successfully!',
        color: 'green',
      });

      if (event?.status === 'PUBLISHED' && event?.slug) {
        navigate(ROUTES.EVENT_DETAIL(event.slug));
      } else {
        navigate(ROUTES.MY_EVENTS);
      }
    } catch (error: any) {
      let msg = 'Something went wrong.';
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        msg = `Validation failed: ${
          Array.isArray(validationErrors)
            ? validationErrors[0]?.defaultMessage
            : Object.values(validationErrors)[0]
        }`;
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

          {!eventId && (
            <>
              <Divider my="sm" />

              <Box>
                <Group justify="space-between" align="center" mb="sm">
                  <Group gap="xs">
                    <IconPhoto size={20} style={{ color: 'var(--app-text-secondary)' }} />
                    <Text fw={600}>Photos & Videos</Text>
                    {mediaFiles.length > 0 && (
                      <Badge color="brand" radius="sm" size="sm">
                        {mediaFiles.length} selected
                      </Badge>
                    )}
                  </Group>
                  {mediaFiles.length > 0 && (
                    <Button
                      variant="subtle"
                      color="red"
                      size="xs"
                      leftSection={<IconTrash size={14} />}
                      onClick={handleClearAll}
                    >
                      Clear all
                    </Button>
                  )}
                </Group>

                <Text size="sm" c="dimmed" mb="md">
                  Add photos and videos to make your event shine. Max 50MB per file.
                </Text>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect(e.target.files)}
                />

                <Button
                  variant="light"
                  size="lg"
                  leftSection={<IconFilePlus size={20} />}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto"
                  styles={(theme) => ({
                    root: {
                      border: '2px dashed var(--app-border)',
                      backgroundColor: 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'var(--app-bg)',
                        borderColor: 'var(--app-text)',
                      },
                    },
                  })}
                >
                  Click to add photos & videos
                </Button>

                {mediaFiles.length > 0 && (
                  <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} mt="md">
                    {mediaFiles.map((media) => (
                      <MediaPreviewCard
                        key={media.id}
                        media={media}
                        onRemove={() => handleRemoveFile(media.id)}
                        formatFileSize={formatFileSize}
                        onPreview={() => setPreviewMedia(media)}
                      />
                    ))}
                  </SimpleGrid>
                )}

                {mediaFiles.length === 0 && (
                  <Box
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg"
                    style={{
                      borderColor: 'var(--app-border)',
                      backgroundColor: 'var(--app-bg)',
                    }}
                  >
                    <IconCloudUpload size={40} className="text-slate-400 dark:text-slate-500" />
                    <Text size="sm" c="dimmed" mt="xs">
                      No media selected yet.
                    </Text>
                    <Button
                      variant="subtle"
                      size="xs"
                      mt="xs"
                      leftSection={<IconPhoto size={14} />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Add your first photo or video
                    </Button>
                  </Box>
                )}
              </Box>
            </>
          )}

          <Divider my="sm" />

          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => navigate(-1)}>
              Cancel
            </Button>

            {!eventId && (
              <Button variant="light" onClick={() => handleSubmit(false)} disabled={loading}>
                Save as Draft
              </Button>
            )}

            <Button type="submit" onClick={() => handleSubmit(true)} loading={loading}>
              {eventId ? 'Update Event' : 'Publish Event'}
            </Button>
          </Group>
        </Stack>
      </form>

      <Modal
        opened={!!previewMedia}
        onClose={() => setPreviewMedia(null)}
        size="xl"
        centered
        padding={0}
        withCloseButton={false}
        styles={{
          content: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
          body: {
            padding: 0,
          },
        }}
      >
        {previewMedia && (
          <Box className="relative flex items-center justify-center min-h-[50vh]">
            {previewMedia.type === 'VIDEO' ? (
              <video
                src={previewMedia.previewUrl}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
                style={{ maxHeight: '80vh' }}
              />
            ) : (
              <Image
                src={previewMedia.previewUrl}
                alt={previewMedia.name}
                fit="contain"
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
              />
            )}
            <ActionIcon
              variant="filled"
              color="dark"
              size="lg"
              radius="xl"
              className="absolute top-4 right-4"
              onClick={() => setPreviewMedia(null)}
              style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <IconX size={24} stroke={2} />
            </ActionIcon>
          </Box>
        )}
      </Modal>
    </Paper>
  );
}

// ─── Media Preview Card Component ─────────────────────────────────────────────

interface MediaPreviewCardProps {
  media: MediaFile;
  onRemove: () => void;
  formatFileSize: (bytes: number) => string;
  onPreview: () => void;
}

function MediaPreviewCard({ media, onRemove, formatFileSize, onPreview }: MediaPreviewCardProps) {
  const isVideo = media.type === 'VIDEO';

  return (
    <Box pos="relative" className="group">
      <Box
        className="relative overflow-hidden rounded-lg cursor-pointer"
        style={{
          aspectRatio: '1 / 1',
          backgroundColor: 'var(--app-bg)',
          border: '1px solid var(--app-border)',
        }}
        onClick={onPreview}
      >
        {isVideo ? (
          <>
            <video
              src={media.previewUrl}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
              playsInline
            />
            <Overlay
              color="rgba(0,0,0,0.3)"
              className="flex items-center justify-center"
            >
              <IconPlayerPlay size={36} style={{ color: 'white', opacity: 0.8 }} />
            </Overlay>
            <Badge
              color="blue"
              variant="filled"
              size="xs"
              radius="sm"
              className="absolute top-2 left-2 z-10"
              leftSection={<IconVideo size={10} />}
            >
              VIDEO
            </Badge>
          </>
        ) : (
          <>
            <Image
              src={media.previewUrl}
              alt={media.name}
              fit="cover"
              className="w-full h-full"
            />
            <Badge
              color="green"
              variant="filled"
              size="xs"
              radius="sm"
              className="absolute top-2 left-2 z-10"
              leftSection={<IconPhoto size={10} />}
            >
              IMAGE
            </Badge>
            <Box
              className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                background: 'rgba(0,0,0,0.2)',
              }}
            >
              <IconMaximize size={32} style={{ color: 'white' }} />
            </Box>
          </>
        )}

        <ActionIcon
          variant="filled"
          radius="xl"
          className="absolute z-30"
          style={{
            bottom: '40px',
            right: '-1px',
            backgroundColor: '#dc2626',
            border: '2px solid white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            width: rem(36),
            height: rem(36),
            color: 'white',
            transition: 'transform 0.15s ease',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = 'scale(1.1)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = 'scale(1)')
          }
          aria-label="Remove media"
        >
          <IconX size={20} stroke={3} />
        </ActionIcon>

        <Box
          className="absolute inset-x-0 bottom-0 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
          }}
        >
          <Text size="xs" c="white" truncate className="text-center">
            {formatFileSize(media.size)}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}