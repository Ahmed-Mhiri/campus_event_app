import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Paper, Title, TextInput, Button, Stack, Text, Anchor } from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const { forgotPassword, isResetting } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPassword(email);
  };

  return (
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} ta="center" mb="lg">
          Reset Password
        </Title>
        <Text size="sm" c="dimmed" ta="center" mb="md">
          Enter your university email and we'll send you a reset link.
        </Text>
        <form onSubmit={handleSubmit} aria-label="Forgot password form">
          <Stack>
            <TextInput
              label="University Email"
              placeholder="name@stud.fh-dortmund.de"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              type="email"
              aria-label="University email"
              radius="md"
            />
            <Button
              type="submit"
              loading={isResetting}
              fullWidth
              mt="sm"
              radius="md"
              aria-label="Send reset link"
            >
              Send Reset Link
            </Button>
          </Stack>
        </form>
        <Text size="sm" ta="center" mt="md">
          Remember your password?{' '}
          <Anchor component={Link} to={ROUTES.LOGIN} aria-label="Back to login">
            Log In
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}