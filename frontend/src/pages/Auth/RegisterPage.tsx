import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Title, TextInput, PasswordInput, Text, Anchor, Progress, Box, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowRight } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { EMAIL_REGEX, DISPLAY_NAME_MIN, DISPLAY_NAME_MAX } from '@/constants/validation';
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
    <Stack gap="xl">
      <div>
        <Title order={1} className="text-[1.75rem] sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create your account
        </Title>
        <Text className="text-slate-500 dark:text-slate-400 mt-1.5">
          Join the campus community — it takes less than a minute.
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Registration form">
        <TextInput
          label="Display name"
          placeholder="Your name"
          value={displayName}
          onChange={(e) => setDisplayName(e.currentTarget.value)}
          required
          minLength={DISPLAY_NAME_MIN}
          maxLength={DISPLAY_NAME_MAX}
          radius="md"
          size="md"
          aria-label="Display name"
        />
        <TextInput
          label="University email"
          placeholder="name@stud.fh-dortmund.de"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          onFocus={() => setEmailError('')}
          error={emailError}
          required
          type="email"
          radius="md"
          size="md"
          aria-label="University email"
        />
        <PasswordInput
          label="Password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          required
          radius="md"
          size="md"
          aria-label="Password"
        />
        {password && (
          <Box mt={-8}>
            <Progress value={(passwordStrength / 4) * 100} color={strengthColor} size="sm" radius="xl" />
            <Text size="xs" c={strengthColor} mt="xs" fw={600}>
              {strengthLabel}
            </Text>
            <Text size="xs" c="dimmed">
              At least 8 characters, uppercase, lowercase, a number, and a special character.
            </Text>
          </Box>
        )}
        <PasswordInput
          label="Confirm password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          required
          radius="md"
          size="md"
          aria-label="Confirm password"
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isRegistering}
          fullWidth
          rightSection={<IconArrowRight size={18} />}
          className="min-h-[46px] mt-2"
          aria-label="Create your account"
        >
          Create account
        </Button>
      </form>

      <Text size="sm" className="text-center text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Anchor
          component={Link}
          to={ROUTES.LOGIN}
          fw={600}
          className="text-violet-600 hover:text-violet-700 dark:text-violet-400"
          aria-label="Sign in"
        >
          Sign in
        </Anchor>
      </Text>
    </Stack>
  );
}