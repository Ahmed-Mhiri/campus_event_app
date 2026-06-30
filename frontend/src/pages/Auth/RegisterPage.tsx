import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Title,
  TextInput,
  PasswordInput,
  Text,
  Anchor,
  Progress,
  Box,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { EMAIL_REGEX, DISPLAY_NAME_MIN, DISPLAY_NAME_MAX } from '@/constants/validation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl" aria-hidden="true">
              M
            </span>
          </div>
          <Title order={2} className="text-2xl font-bold text-slate-900 dark:text-white">
            Create Account
          </Title>
          <Text className="text-slate-500 dark:text-slate-400 mt-1">
            Join the campus community
          </Text>
        </div>

        <Card variant="elevated">
          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Registration form">
            <TextInput
              label="Display Name"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.currentTarget.value)}
              required
              minLength={DISPLAY_NAME_MIN}
              maxLength={DISPLAY_NAME_MAX}
              radius="md"
              aria-label="Display name"
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
              radius="md"
              aria-label="University email"
            />
            <PasswordInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
              radius="md"
              aria-label="Password"
            />
            {password && (
              <Box>
                <Progress value={(passwordStrength / 4) * 100} color={strengthColor} size="sm" radius="xl" />
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
              radius="md"
              aria-label="Confirm password"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isRegistering}
              className="w-full min-h-[44px]"
              aria-label="Create your account"
            >
              Register
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Text size="sm" className="text-slate-500">
              Already have an account?{' '}
              <Anchor
                component={Link}
                to={ROUTES.LOGIN}
                className="text-brand-600 hover:text-brand-700"
                aria-label="Sign in"
              >
                Log In
              </Anchor>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}