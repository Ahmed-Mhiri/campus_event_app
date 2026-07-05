// src/pages/Events/EventDetailPage/EventMedia.tsx
import { useState, useEffect, useCallback } from 'react';
import { Box, Image, ActionIcon, Modal, Text, Overlay, Loader } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import {
  IconChevronLeft,
  IconChevronRight,
  IconMaximize,
  IconX,
} from '@tabler/icons-react';
import '@mantine/carousel/styles.css';
import type { EventMedia as EventMediaType } from '@/types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8081').replace('8080', '8081');

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
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  if (!media || media.length === 0) return null;

  const sortedMedia = [...media].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const openPreview = (index: number) => setPreviewIndex(index);
  const closePreview = () => setPreviewIndex(null);

  const goToPrevious = useCallback(() => {
    setPreviewIndex((prev) => {
      if (prev === null) return prev;
      return prev === 0 ? sortedMedia.length - 1 : prev - 1;
    });
  }, [sortedMedia.length]);

  const goToNext = useCallback(() => {
    setPreviewIndex((prev) => {
      if (prev === null) return prev;
      return prev === sortedMedia.length - 1 ? 0 : prev + 1;
    });
  }, [sortedMedia.length]);

  // Single item – no carousel needed, but still clickable to preview
  if (sortedMedia.length === 1) {
    const item = sortedMedia[0];
    return (
      <>
        <Box
          className="w-full overflow-hidden rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 bg-slate-900 cursor-pointer relative group"
          onClick={() => openPreview(0)}
          role="button"
          tabIndex={0}
          aria-label={`View ${title} full size`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPreview(0);
            }
          }}
        >
          {item.mediaType === 'VIDEO' ? (
            <video
              src={getFullImageUrl(item.url)}
              controls
              className="w-full max-h-[500px] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Image
              src={getFullImageUrl(item.url)}
              alt={title}
              className="w-full max-h-[500px] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          )}
          <Overlay
            color="rgba(0,0,0,0.3)"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none"
          >
            <ActionIcon
              size="xl"
              radius="xl"
              variant="white"
              className="shadow-lg"
              aria-label="Expand media"
            >
              <IconMaximize size={24} stroke={2} />
            </ActionIcon>
          </Overlay>
        </Box>

        {/* Preview Modal for single item */}
        <PreviewModal
          opened={previewIndex !== null}
          onClose={closePreview}
          media={sortedMedia}
          currentIndex={previewIndex ?? 0}
          onPrev={goToPrevious}
          onNext={goToNext}
          title={title}
        />
      </>
    );
  }

  // Multiple items – Carousel with click-to-preview
  return (
    <>
      <Box className="w-full relative shadow-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <Carousel
          withIndicators
          emblaOptions={{ loop: true }}
          height={450}
          controlSize={44}
          styles={{
            root: { backgroundColor: '#0f172a' },
            viewport: { height: '100%' },
            container: { height: '100%' },
            slide: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
            indicators: {
              position: 'absolute',
              bottom: 12,
              left: 0,
              right: 0,
              zIndex: 10,
            },
            indicator: {
              width: 8,
              height: 8,
              transition: 'width 250ms ease',
              backgroundColor: 'rgba(255,255,255,0.5)',
              '&[data-active]': {
                width: 24,
                backgroundColor: 'var(--app-primary)',
              },
            },
            control: {
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
              opacity: 0.85,
              transition: 'opacity 250ms ease, transform 150ms ease',
              '&:hover': {
                opacity: 1,
                transform: 'scale(1.08)',
              },
              '&[data-direction="next"]': {
                right: -6,
              },
              '&[data-direction="previous"]': {
                left: -6,
              },
            },
          }}
          nextControlIcon={
            <ActionIcon
              size="xl"
              radius="xl"
              variant="white"
              className="shadow-lg border border-slate-200/20"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}
            >
              <IconChevronRight size={26} stroke={2.5} />
            </ActionIcon>
          }
          previousControlIcon={
            <ActionIcon
              size="xl"
              radius="xl"
              variant="white"
              className="shadow-lg border border-slate-200/20"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}
            >
              <IconChevronLeft size={26} stroke={2.5} />
            </ActionIcon>
          }
        >
          {sortedMedia.map((item, index) => (
            <Carousel.Slide key={item.id}>
              <Box
                className="relative w-full h-full cursor-pointer group"
                onClick={() => openPreview(index)}
                role="button"
                tabIndex={0}
                aria-label={`View image ${index + 1} of ${sortedMedia.length} full size`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openPreview(index);
                  }
                }}
              >
                {item.mediaType === 'VIDEO' ? (
                  <video
                    src={getFullImageUrl(item.url)}
                    controls
                    className="w-full h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <Image
                    src={getFullImageUrl(item.url)}
                    alt={`${title} — image ${index + 1} of ${sortedMedia.length}`}
                    className="w-full h-full object-cover"
                  />
                )}
                <Overlay
                  color="rgba(0,0,0,0.2)"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none"
                >
                  <ActionIcon
                    size="xl"
                    radius="xl"
                    variant="white"
                    className="shadow-lg pointer-events-auto"
                    aria-label="Expand media"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPreview(index);
                    }}
                  >
                    <IconMaximize size={24} stroke={2} />
                  </ActionIcon>
                </Overlay>
              </Box>
            </Carousel.Slide>
          ))}
        </Carousel>
      </Box>

      {/* Preview Modal */}
      <PreviewModal
        opened={previewIndex !== null}
        onClose={closePreview}
        media={sortedMedia}
        currentIndex={previewIndex ?? 0}
        onPrev={goToPrevious}
        onNext={goToNext}
        title={title}
      />
    </>
  );
}

// ─── Preview Modal Component ─────────────────────────────────────────────────

interface PreviewModalProps {
  opened: boolean;
  onClose: () => void;
  media: EventMediaType[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  title: string;
}

function PreviewModal({
  opened,
  onClose,
  media,
  currentIndex,
  onPrev,
  onNext,
  title,
}: PreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const currentItem = media[currentIndex];

  // Reset loading state whenever the active slide changes
  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex, opened]);

  // Keyboard navigation: Escape to close, arrows to move between items
  useEffect(() => {
    if (!opened) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && media.length > 1) {
        onPrev();
      } else if (e.key === 'ArrowRight' && media.length > 1) {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [opened, onClose, onPrev, onNext, media.length]);

  if (!currentItem) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      withCloseButton={false}
      transitionProps={{ transition: 'fade', duration: 200 }}
      styles={{
        content: {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(8px)',
        },
        body: {
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          position: 'relative',
        },
      }}
    >
      {/* Close Button — pinned top-right, above everything */}
      <ActionIcon
        variant="subtle"
        color="white"
        size="xl"
        radius="xl"
        onClick={onClose}
        aria-label="Close preview"
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 1000,
        }}
        className="hover:bg-white/10 transition-colors"
      >
        <IconX size={28} stroke={2} />
      </ActionIcon>

      {/* Counter */}
      {media.length > 1 && (
        <Text
          size="sm"
          fw={500}
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.7)',
            zIndex: 1000,
            letterSpacing: '0.02em',
          }}
        >
          {currentIndex + 1} / {media.length}
        </Text>
      )}

      {/* Media Display */}
      <Box className="w-full h-full flex items-center justify-center px-4 sm:px-12">
        {isLoading && (
          <Loader
            color="white"
            size="md"
            style={{ position: 'absolute' }}
          />
        )}
        {currentItem.mediaType === 'VIDEO' ? (
          <video
            key={currentItem.id}
            src={getFullImageUrl(currentItem.url)}
            controls
            autoPlay
            onLoadedData={() => setIsLoading(false)}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 200ms ease' }}
          />
        ) : (
          <Image
            key={currentItem.id}
            src={getFullImageUrl(currentItem.url)}
            alt={`${title} — full size preview, item ${currentIndex + 1} of ${media.length}`}
            fit="contain"
            onLoad={() => setIsLoading(false)}
            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
            style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 200ms ease' }}
          />
        )}
      </Box>

      {/* Navigation Arrows */}
      {media.length > 1 && (
        <>
          <ActionIcon
            variant="subtle"
            color="white"
            size="xl"
            radius="xl"
            onClick={onPrev}
            aria-label="Previous"
            style={{
              position: 'fixed',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1000,
            }}
            className="hover:bg-white/10 transition-colors hidden sm:flex"
          >
            <IconChevronLeft size={36} stroke={1.5} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="white"
            size="xl"
            radius="xl"
            onClick={onNext}
            aria-label="Next"
            style={{
              position: 'fixed',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1000,
            }}
            className="hover:bg-white/10 transition-colors hidden sm:flex"
          >
            <IconChevronRight size={36} stroke={1.5} />
          </ActionIcon>

          {/* Mobile: tap zones on left/right edges of the image instead of visible arrows */}
          <Box
            onClick={onPrev}
            className="sm:hidden"
            style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: '20%', zIndex: 900 }}
            aria-hidden="true"
          />
          <Box
            onClick={onNext}
            className="sm:hidden"
            style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '20%', zIndex: 900 }}
            aria-hidden="true"
          />
        </>
      )}
    </Modal>
  );
}