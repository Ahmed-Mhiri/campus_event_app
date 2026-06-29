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
      bg={withBackground ? 'var(--app-border-light)' : undefined}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={staggerContainer}
    >
      <Stack gap="lg">
        {(title || subtitle) && (
          <Box component={motion.div} variants={slideUp}>
            {title && (
              <Title order={2} size="h3" mb={subtitle ? 'xs' : 0}>
                {title}
              </Title>
            )}
            {subtitle && (
              <Text c="dimmed" size="lg" maw={600}>
                {subtitle}
              </Text>
            )}
          </Box>
        )}
        <Box component={motion.div} variants={slideUp}>
          {children}
        </Box>
      </Stack>
    </Box>
  );
}