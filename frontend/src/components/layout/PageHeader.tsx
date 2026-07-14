import { Title, Text, Breadcrumbs, Anchor, Box } from '@mantine/core';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-3"
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs separatorMargin={6}>
          {breadcrumbs.map((item, i) =>
            item.href ? (
              <Anchor
                component={Link}
                to={item.href}
                key={i}
                size="sm"
                // ✅ FIXED: Use CSS var instead of text-slate-500/dark:text-slate-400
                style={{ color: 'var(--app-text-secondary)' }}
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
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

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1 min-w-0">
          {/* ✅ FIXED: Removed text-slate-900 dark:text-white, use CSS var */}
          <Title
            order={1}
            className="text-2xl md:text-[1.75rem] font-extrabold tracking-tight"
            style={{ color: 'var(--app-text)' }}
          >
            {title}
          </Title>
          {subtitle && (
            <Text
              className="max-w-2xl"
              size="lg"
              // ✅ FIXED: Use CSS var instead of text-slate-500/dark:text-slate-400
              style={{ color: 'var(--app-text-secondary)' }}
            >
              {subtitle}
            </Text>
          )}
        </div>
        {actions && <div className="flex-shrink-0 flex items-center gap-2">{actions}</div>}
      </div>
    </Box>
  );
}