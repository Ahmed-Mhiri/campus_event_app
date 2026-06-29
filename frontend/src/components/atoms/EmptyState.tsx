import { Stack, Text, Button, ThemeIcon } from '@mantine/core';
import { IconSearchOff, IconCalendarOff } from '@tabler/icons-react';

interface EmptyStateProps {
  icon?: 'search' | 'calendar' | React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon = 'search', title, description, action }: EmptyStateProps) {
  const Icon = icon === 'search' ? IconSearchOff : icon === 'calendar' ? IconCalendarOff : null;
  
  return (
    <Stack align="center" py="4rem" gap="md">
      <ThemeIcon size={64} radius="xl" variant="light" color="gray">
        {typeof icon === 'string' && Icon ? <Icon size={32} /> : icon}
      </ThemeIcon>
      <Text fw={600} size="lg" ta="center">{title}</Text>
      {description && <Text c="dimmed" ta="center" maw={400}>{description}</Text>}
      {action && <Button onClick={action.onClick} variant="light">{action.label}</Button>}
    </Stack>
  );
}