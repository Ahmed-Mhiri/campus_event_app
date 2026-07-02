import { Box, Title, Text, Breadcrumbs, Anchor, Stack } from '@mantine/core';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { slideUp } from '@/design-system/animations';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <Box component={motion.div} variants={slideUp} mb="xl">
      <Stack gap="sm">
        {breadcrumbs && (
          <Breadcrumbs>
            {breadcrumbs.map((item, i) => 
              item.href ? (
                <Anchor
                  component={Link}
                  to={item.href}
                  key={i}
                  size="sm"
                  // ✅ FIXED: CSS var instead of default Mantine color
                  style={{ color: 'var(--app-text-secondary)' }}
                >
                  {item.label}
                </Anchor>
              ) : (
                <Text size="sm" key={i} style={{ color: 'var(--app-text-muted)' }}>
                  {item.label}
                </Text>
              )
            )}
          </Breadcrumbs>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            {/* ✅ FIXED: Explicit color via CSS var */}
            <Title order={1} size="h2" style={{ color: 'var(--app-text)' }}>
              {title}
            </Title>
            {subtitle && (
              <Text size="lg" mt="xs" style={{ color: 'var(--app-text-secondary)' }}>
                {subtitle}
              </Text>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      </Stack>
    </Box>
  );
}