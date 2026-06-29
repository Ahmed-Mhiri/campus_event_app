// src/pages/CheckIn/AttendeeCheckInPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Stack,
  Paper,
  Text,
  Button,
  Loader,
  Center,
  Alert,
  Group,
  Box,
} from '@mantine/core';
import { IconArrowLeft, IconCamera, IconX } from '@tabler/icons-react';
import { useRsvp } from '@/hooks/useRsvp';
import { useEvent } from '@/hooks/useEvents';
import { BrowserMultiFormatReader } from '@zxing/browser';

export function AttendeeCheckInPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { selfCheckIn, isCheckingIn } = useRsvp(eventId);
  const { data: event, isLoading: eventLoading } = useEvent(eventId!, false);

  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    scannerRef.current = new BrowserMultiFormatReader();
    return () => {
      if (scannerRef.current) {
        // reset() exists but types may not include it; use type assertion
        (scannerRef.current as any).reset();
        scannerRef.current = null;
      }
    };
  }, []);

  const startScan = async () => {
    setError(null);
    setScanning(true);
    try {
      if (!videoRef.current) return;
      const reader = scannerRef.current;
      if (!reader) {
        setError('Scanner not initialized.');
        setScanning(false);
        return;
      }

      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (videoInputDevices.length === 0) {
        setError('No camera found. Please connect a camera and try again.');
        setScanning(false);
        return;
      }

      const selectedDeviceId = videoInputDevices[0].deviceId;
      await reader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, err) => {
        if (result) {
          const text = result.getText();
          setCode(text);
          // Auto-check-in when code is detected
          handleCheckIn(text);
          // Stop scanning after successful decode
          (reader as any).reset();
          setScanning(false);
        }
        if (err && err instanceof Error && err.message.includes('No MultiFormat Readers were able to decode')) {
          // Ignore decode errors, keep scanning
        }
      });
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      setScanning(false);
    }
  };

  const stopScan = () => {
    if (scannerRef.current) {
      (scannerRef.current as any).reset();
    }
    setScanning(false);
  };

  const handleCheckIn = async (scannedCode: string) => {
    try {
      await selfCheckIn({ eventId: eventId!, code: scannedCode });
      navigate(`/events/detail/${eventId}`);
    } catch (err) {
      setError('Invalid check-in code. Please try again.');
    }
  };

  const handleManualCheckIn = () => {
    const manualCode = prompt('Enter check-in code:');
    if (manualCode) {
      handleCheckIn(manualCode);
    }
  };

  if (eventLoading) {
    return (
      <Center h="50vh">
        <Loader size="xl" />
      </Center>
    );
  }

  if (!event) {
    return (
      <Container py="xl">
        <Alert color="red" title="Event not found">
          This event doesn't exist.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Title order={2}>Check In</Title>
        </Group>

        <Paper withBorder p="md" radius="md">
          <Stack align="center" gap="md">
            <Text fw={600} size="lg" ta="center">
              {event.title}
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Scan the QR code at the event entrance to check in.
            </Text>

            {error && (
              <Alert color="red" title="Error" onClose={() => setError(null)} withCloseButton>
                {error}
              </Alert>
            )}

            {code && !error && (
              <Alert color="green" title="Code detected!" onClose={() => setCode(null)} withCloseButton>
                Code: {code}
              </Alert>
            )}

            <Box
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 400,
                aspectRatio: '4/3',
                background: '#000',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: scanning ? 'block' : 'none',
                }}
              />
              {!scanning && (
                <Center style={{ width: '100%', height: '100%' }}>
                  <IconCamera size={48} color="gray" />
                </Center>
              )}
            </Box>

            <Group gap="sm">
              {scanning ? (
                <Button color="red" onClick={stopScan} leftSection={<IconX size={16} />}>
                  Stop Scanning
                </Button>
              ) : (
                <Button onClick={startScan} leftSection={<IconCamera size={16} />}>
                  Start Camera
                </Button>
              )}
              <Button variant="default" onClick={handleManualCheckIn}>
                Enter code manually
              </Button>
            </Group>

            {isCheckingIn && (
              <Center>
                <Loader size="sm" />
                <Text size="sm" ml="sm">Checking in...</Text>
              </Center>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}