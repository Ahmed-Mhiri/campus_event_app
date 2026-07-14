import { Box, Title, Text, Stack } from '@mantine/core';
import { motion } from 'framer-motion';
import { slideUp, staggerContainer } from '@/design-system/animations';

interface SectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  withBackground?: boolean;
  py?: number | string;
}

export function Section({ title, subtitle, children, withBackground, py = '3rem' }: SectionProps) {
  return (
    <Box
      component={motion.section}
      py={py}
      style={{
        // Uses the theme-aware CSS variables from global.css so this actually
        // flips with light/dark mode, instead of relying on Tailwind's dark:
        // variant (which targets .dark, not Mantine's data-attribute strategy).
        background: withBackground ? 'var(--app-border-light)' : 'var(--app-bg)',
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={staggerContainer}
    >
      {/* This inner wrapper is what was missing: real horizontal padding + a
          max-width, matching PageContainer, so content isn't full-bleed. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Stack gap="lg">
          {(title || subtitle) && (
            <Box component={motion.div} variants={slideUp}>
              {title && (
                <Title order={2} size="h3" mb={subtitle ? 'xs' : 0} c="var(--app-text)">
                  {title}
                </Title>
              )}
              {subtitle && (
                <Text size="lg" maw={600} c="var(--app-text-secondary)">
                  {subtitle}
                </Text>
              )}
            </Box>
          )}
          <Box component={motion.div} variants={slideUp}>
            {children}
          </Box>
        </Stack>
      </div>
    </Box>
  );
}