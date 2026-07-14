// src/pages/Error/NotFoundPage.tsx
import { useNavigate } from 'react-router-dom';
import { Stack, Text } from '@mantine/core';
import { IconSearchOff, IconArrowLeft, IconHome } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--app-bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
          style={{
            background: 'var(--app-primary-light)',
            border: '1px solid var(--app-border)',
          }}
        >
          <IconSearchOff size={36} style={{ color: 'var(--app-primary)' }} />
        </div>

        <Text
          fw={800}
          className="text-6xl sm:text-7xl tracking-tighter mb-2"
          style={{ color: 'var(--app-text)' }}
        >
          404
        </Text>

        <Text
          fw={700}
          className="text-xl sm:text-2xl tracking-tight mb-3"
          style={{ color: 'var(--app-text)' }}
        >
          Page not found
        </Text>

        <Text size="lg" className="mb-8 leading-relaxed" style={{ color: 'var(--app-text-secondary)' }}>
          The page you're looking for doesn't exist or has been moved.
        </Text>

        <Stack gap="sm" align="center">
          <Button
            variant="primary"
            size="lg"
            radius="xl"
            leftSection={<IconHome size={18} />}
            onClick={() => navigate(ROUTES.HOME)}
          >
            Go home
          </Button>
          <Button
            variant="ghost"
            size="md"
            radius="xl"
            leftSection={<IconArrowLeft size={18} />}
            onClick={() => navigate(-1)}
            style={{ color: 'var(--app-text-secondary)' }}
          >
            Go back
          </Button>
        </Stack>
      </motion.div>
    </div>
  );
}