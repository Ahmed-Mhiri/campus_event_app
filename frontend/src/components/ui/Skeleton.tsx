import { Skeleton as MantineSkeleton, Stack, SimpleGrid, Paper } from '@mantine/core';

interface PageSkeletonProps {
  count?: number;
}

export function PageSkeleton({ count = 1 }: PageSkeletonProps) {
  return (
    <Stack gap="lg">
      <MantineSkeleton height={48} radius="md" width="60%" />
      <MantineSkeleton height={24} radius="md" width="40%" />
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

export function CardSkeleton() {
  return (
    <Paper withBorder p="md" radius="lg">
      <MantineSkeleton height={160} radius="md" mb="md" />
      <MantineSkeleton height={20} radius="sm" mb="xs" width="80%" />
      <MantineSkeleton height={14} radius="sm" mb="xs" width="40%" />
      <MantineSkeleton height={14} radius="sm" mb="md" width="60%" />
      <Stack gap="xs">
        <MantineSkeleton height={8} radius="xl" />
        <MantineSkeleton height={8} radius="xl" width="70%" />
      </Stack>
      <MantineSkeleton height={36} radius="md" mt="md" />
    </Paper>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <Stack gap="xs">
      <MantineSkeleton height={40} radius="sm" />
      {Array.from({ length: rows }).map((_, i) => (
        <MantineSkeleton key={i} height={36} radius="sm" width={`${100 - (i % 3) * 5}%`} />
      ))}
    </Stack>
  );
}