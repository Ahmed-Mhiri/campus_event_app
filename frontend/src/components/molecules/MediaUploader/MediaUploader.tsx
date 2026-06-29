// src/components/molecules/MediaUploader/MediaUploader.tsx
import { useState, useCallback } from 'react';
import {
  Stack,
  SimpleGrid,
  Paper,
  Image,
  Group,
  Text,
  ActionIcon,
  Loader,
  Badge,
  Box,
  rem,
} from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { IconUpload, IconX, IconPhoto, IconArrowsSort } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/api/eventsApi';
import type { EventMedia } from '@/types';

interface MediaUploaderProps {
  eventId: string;
  media: EventMedia[];
  onMediaChange?: () => void;
  maxImages?: number;
  maxVideos?: number;
}

export function MediaUploader({
  eventId,
  media,
  onMediaChange,
  maxImages = 5,
  maxVideos = 2,
}: MediaUploaderProps) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => eventsApi.uploadMedia(eventId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      if (onMediaChange) onMediaChange();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (mediaId: string) => eventsApi.deleteMedia(eventId, mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      if (onMediaChange) onMediaChange();
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (mediaIds: string[]) => eventsApi.reorderMedia(eventId, mediaIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      if (onMediaChange) onMediaChange();
    },
  });

  const handleDrop = useCallback(
    (files: FileWithPath[]) => {
      const images = files.filter((f) => f.type.startsWith('image/'));
      const videos = files.filter((f) => f.type.startsWith('video/'));
      const currentImages = media.filter((m) => m.mediaType === 'IMAGE');
      const currentVideos = media.filter((m) => m.mediaType === 'VIDEO');

      if (images.length + currentImages.length > maxImages) {
        // You can show a notification here
        return;
      }
      if (videos.length + currentVideos.length > maxVideos) {
        return;
      }

      setUploading(true);
      const formData = new FormData();
      images.forEach((f) => formData.append('images[]', f));
      videos.forEach((f) => formData.append('videos[]', f));

      uploadMutation.mutate(formData, {
        onSettled: () => setUploading(false),
      });
    },
    [media, maxImages, maxVideos, uploadMutation, eventId]
  );

  const handleDelete = (mediaId: string) => {
    deleteMutation.mutate(mediaId);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const reordered = [...media];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const ids = reordered.map((m) => m.id);
    reorderMutation.mutate(ids);
  };

  const isImage = (m: EventMedia) => m.mediaType === 'IMAGE';

  return (
    <Stack gap="md">
      <Dropzone
        onDrop={handleDrop}
        loading={uploading}
        accept={[
          'image/png',
          'image/jpeg',
          'image/webp',
          'video/mp4',
          'video/webm',
          'video/quicktime',
        ]}
        maxSize={20 * 1024 * 1024} // 20MB
        multiple
      >
        <Group justify="center" style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <IconUpload size={rem(40)} color="var(--mantine-color-blue-6)" stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={rem(40)} color="var(--mantine-color-red-6)" stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto size={rem(40)} stroke={1.5} />
          </Dropzone.Idle>
          <div>
            <Text size="xl" inline>
              Drag images/videos here or click to select
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Images: up to {maxImages} (max 5MB each). Videos: up to {maxVideos} (max 20MB each).
            </Text>
          </div>
        </Group>
      </Dropzone>

      {uploading && <Loader size="sm" />}

      {media.length > 0 && (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
          {media.map((item, index) => (
            <Paper key={item.id} withBorder p="sm" radius="md" pos="relative">
              {isImage(item) ? (
                <Image
                  src={item.thumbnailUrl || item.url}
                  alt={item.filename}
                  fit="cover"
                  height={120}
                />
              ) : (
                <Box style={{ position: 'relative', height: 120, background: '#000' }}>
                  <video
                    src={item.url}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Badge style={{ position: 'absolute', bottom: 4, right: 4 }}>Video</Badge>
                </Box>
              )}
              <Group justify="space-between" mt="xs">
                <Text size="xs" truncate>
                  {item.filename}
                </Text>
                <ActionIcon size="xs" color="red" onClick={() => handleDelete(item.id)}>
                  <IconX size={14} />
                </ActionIcon>
              </Group>
              {index > 0 && (
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  style={{ position: 'absolute', top: 4, left: 4 }}
                  onClick={() => handleReorder(index, index - 1)}
                >
                  <IconArrowsSort size={14} />
                </ActionIcon>
              )}
            </Paper>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}