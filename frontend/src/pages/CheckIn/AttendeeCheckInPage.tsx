// src/pages/CheckIn/AttendeeCheckInPage.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Stack,
  Text,
  Button,
  Loader,
  Center,
  Alert,
  Group,
  ThemeIcon,
  Paper,
  Badge,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconCamera,
  IconX,
  IconScan,
  IconKeyboard,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useRsvp } from '@/hooks/useRsvp';
import { useEvent } from '@/hooks/useEvents';
import { ROUTES } from '@/constants/routes';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button as UIButton } from '@/components/ui/Button';
import { slideUp, staggerContainer } from '@/design-system/animations';
import { BrowserMultiFormatReader } from '@zxing/browser';

export function AttendeeCheckInPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selfCheckIn, isCheckingIn } = useRsvp(eventId);
  const { data: event, isLoading: eventLoading } = useEvent(eventId!, false);

  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    scannerRef.current = new BrowserMultiFormatReader();
    return () => {
      stopScanning();
    };
  }, []);

  const stopScanning = useCallback(() => {
    if (scannerRef.current) {
      try {
        (scannerRef.current as any).reset();
      } catch {
        // ignore
      }
    }
    setScanning(false);
  }, []);

  const startScan = async () => {
    setError(null);
    setSuccess(false);
    setScannedCode(null);
    setScanning(true);

    try {
      if (!videoRef.current || !scannerRef.current) {
        setError('Scanner not initialized.');
        setScanning(false);
        return;
      }

      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (devices.length === 0) {
        setError('No camera found. Please connect a camera and try again.');
        setScanning(false);
        return;
      }

      // Prefer back camera on mobile
      const backCamera = devices.find((d) => /back|rear|environment/i.test(d.label));
      const selectedDeviceId = backCamera?.deviceId || devices[0].deviceId;

      await scannerRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            const text = result.getText();
            setScannedCode(text);
            stopScanning();
            handleCheckIn(text);
          }
          // Ignore decode errors during scanning
        }
      );
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      setScanning(false);
    }
  };

  const handleCheckIn = useCallback(
    async (code: string) => {
      try {
        await selfCheckIn({ eventId: eventId!, code });
        setSuccess(true);

        // Invalidate all relevant queries so the event page updates instantly
        await queryClient.invalidateQueries({ queryKey: ['event'] });
        await queryClient.invalidateQueries({ queryKey: ['my-events'] });
        await queryClient.invalidateQueries({ queryKey: ['rsvps'] });
        await queryClient.invalidateQueries({ queryKey: ['my-rsvps'] });

        setTimeout(() => {
          navigate(ROUTES.EVENT_DETAIL(eventId!));
        }, 1500);
      } catch (err) {
        setError('Invalid check-in code. Please try again.');
        setSuccess(false);
      }
    },
    [eventId, navigate, selfCheckIn, queryClient]
  );

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    setError(null);
    setSuccess(false);
    handleCheckIn(manualCode.trim());
  };

  if (eventLoading) {
    return (
      <PageContainer size="sm">
        <Center h="60vh">
          <Loader size="xl" color="brand" />
        </Center>
      </PageContainer>
    );
  }

  if (!event) {
    return (
      <PageContainer size="sm">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Alert
            icon={<IconAlertCircle size={18} />}
            color="red"
            radius="lg"
            variant="light"
            title="Event not found"
          >
            This event doesn't exist or has been removed.
          </Alert>
        </motion.div>
      </PageContainer>
    );
  }

  // ─── GUARD: Frozen / non‑published events ───
  if (event.status !== 'PUBLISHED' && event.status !== 'COMPLETED') {
    return (
      <PageContainer size="sm">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Alert
            icon={<IconAlertCircle size={18} />}
            color="orange"
            radius="lg"
            variant="light"
            title="Event Suspended"
          >
            This event is currently under review by administrators. Check‑ins are paused.
          </Alert>
          <Button component={Link} to={ROUTES.EVENTS} mt="md" variant="default" fullWidth>
            Browse Other Events
          </Button>
        </motion.div>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="sm">
      <Stack gap="xl">
        <PageHeader
          title="Check In"
          subtitle={event.title}
          breadcrumbs={[
            { label: 'Events', href: ROUTES.EVENTS },
            {
              label: event.title,
              href: ROUTES.EVENT_DETAIL(eventId!),
            },
            { label: 'Check In' },
          ]}
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Event Info Card */}
          <motion.div variants={slideUp}>
            <Card
              variant="default"
              className="border-slate-200/80 dark:border-slate-700/60"
            >
              <Group gap="md" align="center">
                <ThemeIcon
                  size={48}
                  radius="xl"
                  variant="light"
                  color="brand"
                  className="shrink-0"
                >
                  <IconScan size={24} />
                </ThemeIcon>
                <div className="flex-1 min-w-0">
                  <Text fw={600} size="lg" style={{ color: 'var(--app-text)' }}>
                    {event.title}
                  </Text>
                  <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                    Scan the QR code at the event entrance to check in
                  </Text>
                </div>
              </Group>
            </Card>
          </motion.div>

          {/* Scanner Card */}
          <motion.div variants={slideUp} className="mt-6">
            <Card
              variant="default"
              className="border-slate-200/80 dark:border-slate-700/60 overflow-hidden"
            >
              {/* Status Alerts */}
              {error && (
                <Alert
                  color="red"
                  radius="lg"
                  variant="light"
                  className="mb-4"
                  icon={<IconAlertCircle size={18} />}
                  onClose={() => setError(null)}
                  withCloseButton
                >
                  {error}
                </Alert>
              )}

              {success && (
                <Alert
                  color="green"
                  radius="lg"
                  variant="light"
                  className="mb-4"
                  icon={<IconCheck size={18} />}
                >
                  <Text fw={600}>Check-in successful!</Text>
                  <Text size="sm">
                    Redirecting you to the event page...
                  </Text>
                </Alert>
              )}

              {scannedCode && !success && !error && (
                <Alert
                  color="blue"
                  radius="lg"
                  variant="light"
                  className="mb-4"
                  icon={<IconScan size={18} />}
                >
                  Code detected: <Text span fw={600}>{scannedCode}</Text>
                </Alert>
              )}

              {/* Camera Viewport */}
              <div
                className="relative w-full overflow-hidden rounded-xl"
                style={{
                  aspectRatio: '4/3',
                  background: 'var(--app-border-light)',
                }}
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  style={{ display: scanning ? 'block' : 'none' }}
                />

                {!scanning && (
                  <Center className="absolute inset-0">
                    <Stack align="center" gap="sm">
                      <ThemeIcon
                        size={64}
                        radius="xl"
                        variant="light"
                        color="gray"
                      >
                        <IconCamera size={32} />
                      </ThemeIcon>
                      <Text size="sm" style={{ color: 'var(--app-text-muted)' }}>
                        Camera preview will appear here
                      </Text>
                    </Stack>
                  </Center>
                )}

                {/* Scanning overlay */}
                {scanning && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-8 border-2 border-dashed border-white/50 rounded-xl" />
                    <div className="absolute top-4 left-1/2 -translate-x-1/2">
                      <Badge color="red" variant="filled" radius="sm">
                        Scanning...
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <Group justify="center" gap="sm" className="mt-6">
                {scanning ? (
                  <UIButton
                    color="red"
                    onClick={stopScanning}
                    leftSection={<IconX size={16} />}
                    radius="xl"
                  >
                    Stop Scanning
                  </UIButton>
                ) : (
                  <UIButton
                    onClick={startScan}
                    leftSection={<IconCamera size={16} />}
                    radius="xl"
                    variant="primary"
                  >
                    Start Camera
                  </UIButton>
                )}

                <UIButton
                  variant="secondary"
                  onClick={() => {
                    setShowManualInput(!showManualInput);
                    setError(null);
                  }}
                  leftSection={<IconKeyboard size={16} />}
                  radius="xl"
                >
                  {showManualInput ? 'Hide' : 'Enter Code'}
                </UIButton>
              </Group>

              {/* Manual Input */}
              {showManualInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <Paper
                    p="md"
                    radius="xl"
                    style={{ background: 'var(--app-border-light)' }}
                  >
                    <Stack gap="sm">
                      <Text size="sm" fw={500} style={{ color: 'var(--app-text)' }}>
                        Enter check-in code manually
                      </Text>
                      <Group gap="sm">
                        <input
                          type="text"
                          value={manualCode}
                          onChange={(e) => setManualCode(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                          placeholder="e.g. ABC123"
                          className="flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                          style={{
                            borderColor: 'var(--app-border)',
                            background: 'var(--app-surface)',
                            color: 'var(--app-text)',
                          }}
                        />
                        <UIButton
                          onClick={handleManualSubmit}
                          variant="primary"
                          radius="xl"
                          disabled={!manualCode.trim() || isCheckingIn}
                        >
                          Submit
                        </UIButton>
                      </Group>
                    </Stack>
                  </Paper>
                </motion.div>
              )}

              {isCheckingIn && (
                <Center className="mt-4">
                  <Group gap="sm">
                    <Loader size="sm" color="brand" />
                    <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                      Checking in...
                    </Text>
                  </Group>
                </Center>
              )}
            </Card>
          </motion.div>

          {/* Back Link */}
          <motion.div variants={slideUp} className="mt-6">
            <Button
              component={Link}
              to={ROUTES.EVENT_DETAIL(eventId!)}
              variant="ghost"
              leftSection={<IconArrowLeft size={16} />}
              style={{ color: 'var(--app-text-secondary)' }}
            >
              Back to event
            </Button>
          </motion.div>
        </motion.div>
      </Stack>
    </PageContainer>
  );
}