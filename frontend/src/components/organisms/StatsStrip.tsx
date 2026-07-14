import { Text } from '@mantine/core';
import { motion } from 'framer-motion';

interface StatsStripProps {
  stats: { value: string; label: string }[];
}

export function StatsStrip({ stats }: StatsStripProps) {
  return (
    <div
      style={{
        borderTop: '1px solid var(--app-border)',
        borderBottom: '1px solid var(--app-border)',
        background: 'var(--app-surface)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="text-center sm:text-left"
            >
              <Text
                className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                style={{ color: 'var(--app-text)' }}
              >
                {stat.value}
              </Text>
              <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                {stat.label}
              </Text>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}