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
                <Anchor component={Link} to={item.href} key={i} size="sm">
                  {item.label}
                </Anchor>
              ) : (
                <Text size="sm" c="dimmed" key={i}>{item.label}</Text>
              )
            )}
          </Breadcrumbs>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <Title order={1} size="h2">{title}</Title>
            {subtitle && <Text c="dimmed" size="lg" mt="xs">{subtitle}</Text>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      </Stack>
    </Box>
  );
}