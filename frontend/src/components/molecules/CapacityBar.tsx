// src/components/molecules/CapacityBar/CapacityBar.tsx
import { Progress, Group, Text, Badge } from '@mantine/core';

interface CapacityBarProps {
  current: number;
  max: number;
  showLabels?: boolean;
}

export function CapacityBar({ current, max, showLabels = true }: CapacityBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  const isFull = current >= max;
  const isAlmostFull = percentage >= 80 && !isFull;

  let color = 'blue';
  if (isFull) color = 'red';
  else if (isAlmostFull) color = 'yellow';

  return (
    <div>
      <Progress value={percentage} color={color} size="lg" radius="xl" />
      {showLabels && (
        <Group justify="space-between" mt={4}>
          <Text size="sm">
            {current} / {max} spots
          </Text>
          {isFull && <Badge color="red" size="xs">Full</Badge>}
          {isAlmostFull && !isFull && <Badge color="yellow" size="xs">Almost full</Badge>}
        </Group>
      )}
    </div>
  );
}