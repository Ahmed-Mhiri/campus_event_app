import { useEffect } from 'react';
import { Paper, Text, Stack, Button, Loader, Alert } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/api/eventsApi';
import { QRCodeCanvas } from 'qrcode.react'; // ✅ Named import

interface CheckInCodeDisplayProps {
  eventId: string;
}

export function CheckInCodeDisplay({ eventId }: CheckInCodeDisplayProps) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['checkin-code', eventId],
    queryFn: () => eventsApi.getCheckInCode(eventId).then((res) => res.data.data),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!data) return;
    const interval = setInterval(() => {
      refetch();
    }, data.refreshIntervalSeconds * 1000);
    return () => clearInterval(interval);
  }, [data, refetch]);

  if (isLoading) return <Loader size="sm" />;
  if (!data) return <Alert color="red">Failed to load check-in code.</Alert>;

  return (
    <Paper withBorder p="md" radius="md">
      <Stack align="center">
        <QRCodeCanvas value={data.checkInCode} size={200} /> {/* ✅ Use QRCodeCanvas */}
        <Text fw={700} size="xl">{data.checkInCode}</Text>
        <Text size="sm" c="dimmed">
          This code refreshes every {data.refreshIntervalSeconds} seconds.
        </Text>
        <Button
          variant="light"
          leftSection={<IconRefresh size={16} />}
          onClick={() => refetch()}
        >
          Refresh Code
        </Button>
      </Stack>
    </Paper>
  );
}