import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Title, TextInput, Text, Anchor, Stack, ThemeIcon } from '@mantine/core';
import { IconArrowRight, IconMailQuestion } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const { forgotPassword, isResetting } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPassword(email);
  };

  return (
    <Stack gap="xl">
      <div>
        <ThemeIcon size={48} radius="xl" variant="light" color="violet" mb="md">
          <IconMailQuestion size={24} />
        </ThemeIcon>
        <Title order={1} className="text-[1.75rem] sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Forgot your password?
        </Title>
        <Text className="text-slate-500 dark:text-slate-400 mt-1.5">
          Enter your university email and we'll send you a link to reset it.
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Forgot password form">
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
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isResetting}
          fullWidth
          rightSection={<IconArrowRight size={18} />}
          className="min-h-[46px] mt-2"
          aria-label="Send reset link"
        >
          Send reset link
        </Button>
      </form>

      <Text size="sm" className="text-center text-slate-500 dark:text-slate-400">
        Remember your password?{' '}
        <Anchor
          component={Link}
          to={ROUTES.LOGIN}
          fw={600}
          className="text-violet-600 hover:text-violet-700 dark:text-violet-400"
          aria-label="Back to login"
        >
          Back to sign in
        </Anchor>
      </Text>
    </Stack>
  );
}