import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Title, Text, Loader, Stack, ThemeIcon } from '@mantine/core';
import { IconMailCheck, IconAlertTriangle } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';

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
      <Stack gap="xl" align="center" ta="center">
        <ThemeIcon size={48} radius="xl" variant="light" color="red">
          <IconAlertTriangle size={24} />
        </ThemeIcon>
        <div>
          <Title order={2} className="text-slate-900 dark:text-white">
            Invalid verification link
          </Title>
          <Text c="dimmed" mt="xs">
            This link is missing or malformed. Please check your email again.
          </Text>
        </div>
        <Button component={Link} to={ROUTES.LOGIN} variant="primary" size="lg" fullWidth>
          Back to sign in
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" align="center" ta="center">
      <ThemeIcon size={48} radius="xl" variant="light" color="violet">
        {isVerifying ? <Loader size={22} color="violet" /> : <IconMailCheck size={24} />}
      </ThemeIcon>
      <div>
        <Title order={2} className="text-slate-900 dark:text-white">
          {isVerifying ? 'Verifying your email…' : 'Verification in progress'}
        </Title>
        <Text c="dimmed" mt="xs">
          {isVerifying
            ? 'Hang tight while we confirm your account.'
            : "We're processing your verification — this should only take a moment."}
        </Text>
      </div>
    </Stack>
  );
}