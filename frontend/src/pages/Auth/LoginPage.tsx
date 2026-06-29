// src/pages/Auth/LoginPage.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Anchor,
} from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoggingIn } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ universityEmail: email, password });
  };

  return (
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} ta="center" mb="lg">
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
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />
            <Button type="submit" loading={isLoggingIn} fullWidth mt="sm">
              Log In
            </Button>
          </Stack>
        </form>
        <Stack mt="md" gap="xs">
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
    </Container>
  );
}