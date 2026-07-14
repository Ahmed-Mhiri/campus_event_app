import { Card, Skeleton } from '@mantine/core';

export function SkeletonCard() {
  return (
    <Card radius="lg" padding="lg" withBorder>
      <Skeleton height={200} radius="md" mb="md" />
      <Skeleton height={24} radius="sm" mb="xs" width="80%" />
      <Skeleton height={16} radius="sm" mb="xs" width="40%" />
      <Skeleton height={16} radius="sm" mb="md" width="60%" />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Skeleton circle height={28} />
        <Skeleton height={16} radius="sm" width="30%" />
      </div>
    </Card>
  );
}