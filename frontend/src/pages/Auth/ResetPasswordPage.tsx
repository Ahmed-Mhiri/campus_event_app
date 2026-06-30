import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Paper, Title, PasswordInput, Button, Stack, Text, Anchor } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { resetPassword, isResetting } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (newPassword !== confirmPassword) {
      notifications.show({
        title: 'Error',
        message: 'Passwords do not match',
        color: 'red',
      });
      return;
    }
    resetPassword({ token, newPassword, confirmPassword });
  };

  if (!token) {
    return (
      <Container size="xs" py="xl">
        <Paper radius="md" p="xl" withBorder>
          <Stack align="center">
            <Title order={3}>Invalid reset link</Title>
            <Text c="dimmed">No token provided.</Text>
            <Button component={Link} to={ROUTES.FORGOT_PASSWORD} aria-label="Request new link">
              Request new link
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} ta="center" mb="lg">
          Set New Password
        </Title>
        <form onSubmit={handleSubmit} aria-label="Reset password form">
          <Stack>
            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.currentTarget.value)}
              required
              aria-label="New password"
              radius="md"
            />
            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              required
              aria-label="Confirm new password"
              radius="md"
            />
            <Button
              type="submit"
              loading={isResetting}
              fullWidth
              mt="sm"
              radius="md"
              aria-label="Reset password"
            >
              Reset Password
            </Button>
          </Stack>
        </form>
        <Text size="sm" ta="center" mt="md">
          <Anchor component={Link} to={ROUTES.LOGIN} aria-label="Back to login">
            Back to Login
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}