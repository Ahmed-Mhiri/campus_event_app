import { Title, Text, Breadcrumbs, Anchor } from '@mantine/core';
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {breadcrumbs && (
        <Breadcrumbs className="text-sm text-slate-500 dark:text-slate-400">
          {breadcrumbs.map((item, i) =>
            item.href ? (
              <Anchor component={Link} to={item.href} key={i} className="text-sm hover:text-brand-600">
                {item.label}
              </Anchor>
            ) : (
              <span key={i}>{item.label}</span>
            )
          )}
        </Breadcrumbs>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <Title order={1} className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </Title>
          {subtitle && (
            <Text className="text-base text-slate-500 dark:text-slate-400 max-w-2xl">
              {subtitle}
            </Text>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </motion.div>
  );
}