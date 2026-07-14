import { Text } from '@mantine/core';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import type { Category } from '@/types';

interface CategoryTileProps {
  category: Category;
  index: number;
}

export function CategoryTile({ category, index }: CategoryTileProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`${ROUTES.EVENTS}?categoryId=${category.id}`)}
      className="group flex flex-col items-start gap-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md transition-all text-left"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
        style={{
          background: `${category.color ? `var(--mantine-color-${category.color}-1)` : 'var(--app-border-light)'}`,
          color: `${category.color ? `var(--mantine-color-${category.color}-7)` : 'var(--app-text-secondary)'}`,
        }}
      >
        {category.name.charAt(0).toUpperCase()}
      </div>
      <Text
        size="sm"
        fw={600}
        className="text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors"
      >
        {category.name}
      </Text>
    </motion.button>
  );
}