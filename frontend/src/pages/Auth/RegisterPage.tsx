// src/pages/Auth/RegisterPage.tsx

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
  Progress,
  Box,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { EMAIL_REGEX, DISPLAY_NAME_MIN, DISPLAY_NAME_MAX } from '@/constants/validation';

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;
  return score;
}

export function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const { register, isRegistering } = useAuth();

  const passwordStrength = getPasswordStrength(password);
  const strengthColor = ['red', 'orange', 'yellow', 'green'][passwordStrength] || 'red';
  const strengthLabel = ['Too weak', 'Weak', 'Medium', 'Strong'][passwordStrength] || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Please use a valid university email (.edu or .de)');
      return;
    }

    if (password !== confirmPassword) {
      notifications.show({
        title: 'Error',
        message: 'Passwords do not match',
        color: 'red',
      });
      return;
    }

    register({ universityEmail: email, password, displayName });
  };

  return (
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} ta="center" mb="lg">
          Create Account
        </Title>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Display Name"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.currentTarget.value)}
              required
              minLength={DISPLAY_NAME_MIN}
              maxLength={DISPLAY_NAME_MAX}
            />
            <TextInput
              label="University Email"
              placeholder="name@stud.fh-dortmund.de"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              onFocus={() => setEmailError('')}
              error={emailError}
              required
              type="email"
            />
            <PasswordInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />
            {password && (
              <Box>
                <Progress value={(passwordStrength / 4) * 100} color={strengthColor} size="sm" />
                <Text size="xs" c={strengthColor} mt="xs">
                  {strengthLabel}
                </Text>
                <Text size="xs" c="dimmed">
                  Must contain at least 8 characters, uppercase, lowercase, number, and special
                  character.
                </Text>
              </Box>
            )}
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              required
            />
            <Button type="submit" loading={isRegistering} fullWidth mt="sm">
              Register
            </Button>
          </Stack>
        </form>
        <Text size="sm" ta="center" mt="md">
          Already have an account?{' '}
          <Anchor component={Link} to={ROUTES.LOGIN}>
            Log In
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}