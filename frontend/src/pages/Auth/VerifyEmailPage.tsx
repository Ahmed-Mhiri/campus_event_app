import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Paper, Title, Text, Loader, Stack } from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verify, isVerifying } = useAuth();

  useEffect(() => {
    if (token) {
      verify(token);
    }
  }, [token, verify]);

  if (!token) {
    return (
      <Container size="xs" py="xl">
        <Paper radius="md" p="xl" withBorder>
          <Stack align="center" gap="md">
            <Title order={3}>Invalid verification link</Title>
            <Text c="dimmed">No token provided.</Text>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Stack align="center" gap="md">
          {isVerifying ? (
            <>
              <Loader size="lg" aria-label="Verifying" />
              <Title order={3}>Verifying your email...</Title>
              <Text c="dimmed">Please wait while we confirm your account.</Text>
            </>
          ) : (
            <>
              <Title order={3}>Verification in progress</Title>
              <Text c="dimmed">We are processing your verification.</Text>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}