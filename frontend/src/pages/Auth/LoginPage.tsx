import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Title, TextInput, PasswordInput, Text, Anchor, Stack } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';

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
    <Stack gap="xl">
      <div>
        <Title order={1} className="text-[1.75rem] sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome back
        </Title>
        <Text className="text-slate-500 dark:text-slate-400 mt-1.5">
          Sign in to keep up with what's happening on campus.
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
        <TextInput
          label="University email"
          placeholder="name@stud.fh-dortmund.de"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          required
          type="email"
          radius="md"
          size="md"
          aria-label="University email"
        />
        <div>
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            radius="md"
            size="md"
            aria-label="Password"
          />
          <div className="flex justify-end mt-1.5">
            <Anchor
              component={Link}
              to={ROUTES.FORGOT_PASSWORD}
              size="sm"
              className="text-violet-600 hover:text-violet-700 dark:text-violet-400"
              aria-label="Forgot password"
            >
              Forgot password?
            </Anchor>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoggingIn}
          fullWidth
          rightSection={<IconArrowRight size={18} />}
          className="min-h-[46px] mt-2"
          aria-label="Sign in to your account"
        >
          Sign in
        </Button>
      </form>

      {showResend && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-4 py-3">
          <Text size="sm" className="text-amber-800 dark:text-amber-300">
            Your email isn't verified yet.
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resendVerification(email)}
            className="px-0 text-amber-700 dark:text-amber-400 mt-1"
            aria-label="Resend verification email"
          >
            Resend verification email
          </Button>
        </div>
      )}

      <Text size="sm" className="text-center text-slate-500 dark:text-slate-400">
        No account yet?{' '}
        <Anchor
          component={Link}
          to={ROUTES.REGISTER}
          fw={600}
          className="text-violet-600 hover:text-violet-700 dark:text-violet-400"
          aria-label="Sign up"
        >
          Create one
        </Anchor>
      </Text>
    </Stack>
  );
}