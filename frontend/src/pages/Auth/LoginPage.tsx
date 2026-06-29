import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Anchor,
  Box,
} from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResend, setShowResend] = useState(false);
  const { login, isLoggingIn, resendVerification } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResend(false);
    login({ universityEmail: email, password }).catch((err) => {
      if (err?.response?.data?.message?.toLowerCase().includes('not verified')) {
        setShowResend(true);
      }
    });
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--app-primary) 0%, #a855f7 100%)',
      }}
    >
      <Paper radius="lg" p="xl" withBorder shadow="xl" maw={420} w="100%" mx="md">
        <Title order={2} ta="center" mb="lg" className="app-gradient-text">
          Welcome Back
        </Title>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="University Email"
              placeholder="name@stud.fh-dortmund.de"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              type="email"
              radius="md"
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
              radius="md"
            />
            <Button type="submit" loading={isLoggingIn} fullWidth mt="sm" radius="md">
              Log In
            </Button>
          </Stack>
        </form>
        <Stack mt="md" gap="xs">
          {showResend && (
            <Button
              variant="subtle"
              size="xs"
              onClick={() => resendVerification(email)}
              radius="md"
            >
              Resend verification email
            </Button>
          )}
          <Text size="sm" ta="center">
            <Anchor component={Link} to={ROUTES.FORGOT_PASSWORD}>
              Forgot password?
            </Anchor>
          </Text>
          <Text size="sm" ta="center">
            Don't have an account?{' '}
            <Anchor component={Link} to={ROUTES.REGISTER}>
              Register
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Box>
  );
}