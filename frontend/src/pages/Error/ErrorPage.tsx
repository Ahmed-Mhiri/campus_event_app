// src/pages/Error/ErrorPage.tsx
import { useNavigate } from 'react-router-dom';
import { Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconArrowLeft, IconRefresh } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';

export function ErrorPage() {
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
          <IconAlertTriangle size={36} style={{ color: 'var(--app-primary)' }} />
        </div>

        <Text
          fw={800}
          className="text-3xl sm:text-4xl tracking-tight mb-3"
          style={{ color: 'var(--app-text)' }}
        >
          Something went wrong
        </Text>

        <Text size="lg" className="mb-8 leading-relaxed" style={{ color: 'var(--app-text-secondary)' }}>
          An unexpected error occurred. Please try again or return to the homepage.
        </Text>

        <Stack gap="sm" align="center">
          <Button
            variant="primary"
            size="lg"
            radius="xl"
            leftSection={<IconRefresh size={18} />}
            onClick={() => window.location.reload()}
          >
            Reload page
          </Button>
          <Button
            variant="ghost"
            size="md"
            radius="xl"
            leftSection={<IconArrowLeft size={18} />}
            onClick={() => navigate(ROUTES.HOME)}
            style={{ color: 'var(--app-text-secondary)' }}
          >
            Back to home
          </Button>
        </Stack>
      </motion.div>
    </div>
  );
}