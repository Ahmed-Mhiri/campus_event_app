import { Box, Image, SimpleGrid } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import type { EventMedia } from '@/types';

interface EventMediaProps {
  media: EventMedia[];
  title: string;
}

export function EventMedia({ media, title }: EventMediaProps) {
  const coverImage = media?.find((m) => m.displayOrder === 0)?.url || media?.[0]?.url;
  const images = media?.filter((m) => m.mediaType === 'IMAGE') || [];
  const videos = media?.filter((m) => m.mediaType === 'VIDEO') || [];

  if (!media || media.length === 0) return null;

  return (
    <Box>
      {coverImage && (
        <Image src={coverImage} alt={title} radius="lg" style={{ maxHeight: 400, objectFit: 'cover' }} />
      )}
      {images.length > 0 && (
        <Carousel
          withIndicators
          height={300}
          slideSize="33.333%"
          slideGap="md"
          mt="sm"
          emblaOptions={{ loop: true, slidesToScroll: 1, align: 'start' }}
        >
          {images.map((img) => (
            <Carousel.Slide key={img.id}>
              <Image src={img.url} alt={title} height={300} fit="cover" radius="sm" />
            </Carousel.Slide>
          ))}
        </Carousel>
      )}
      {videos.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2 }} mt="md">
          {videos.map((video) => (
            <video key={video.id} src={video.url} controls style={{ width: '100%', borderRadius: 8 }} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}