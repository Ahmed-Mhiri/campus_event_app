import { Box, Image, SimpleGrid } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import type { EventMedia as EventMediaType } from '@/types';

// Critical Fix: Define the backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

const getFullImageUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

interface EventMediaProps {
  media: EventMediaType[];
  title: string;
}

export function EventMedia({ media, title }: EventMediaProps) {
  const rawCoverImage = media?.find((m) => m.displayOrder === 0)?.url || media?.[0]?.url;
  
  // CRITICAL FIX: Apply the URL helper so the browser finds the file on port 8081
  const coverImage = getFullImageUrl(rawCoverImage);
  const images = media?.filter((m) => m.mediaType === 'IMAGE') || [];
  const videos = media?.filter((m) => m.mediaType === 'VIDEO') || [];

  if (!media || media.length === 0) return null;

  return (
    <Box>
      {coverImage && (
        <Image
          src={coverImage}
          alt={title}
          radius="xl"
          className="max-h-[420px] object-cover shadow-sm"
        />
      )}
      {images.length > 1 && (
        <Carousel
          withIndicators
          height={280}
          slideSize="33.333%"
          slideGap="md"
          mt="sm"
          emblaOptions={{ loop: true, slidesToScroll: 1, align: 'start' }}
          styles={{
            indicator: { background: 'var(--app-primary)' },
          }}
        >
          {images.map((img) => (
            <Carousel.Slide key={img.id}>
              {/* CRITICAL FIX: Applied helper to carousel images */}
              <Image src={getFullImageUrl(img.url)} alt={title} height={280} fit="cover" radius="lg" />
            </Carousel.Slide>
          ))}
        </Carousel>
      )}
      {videos.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2 }} mt="md">
          {videos.map((video) => (
            <video
              key={video.id}
              // CRITICAL FIX: Applied helper to videos
              src={getFullImageUrl(video.url)}
              controls
              className="w-full rounded-xl bg-black"
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}