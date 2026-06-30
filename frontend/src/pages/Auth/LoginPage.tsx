import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Title, TextInput, PasswordInput, Text, Anchor } from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl" aria-hidden="true">
              M
            </span>
          </div>
          <Title order={2} className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back
          </Title>
          <Text className="text-slate-500 dark:text-slate-400 mt-1">
            Sign in to your account
          </Text>
        </div>

        <Card variant="elevated">
          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
            <TextInput
              label="University Email"
              placeholder="name@stud.fh-dortmund.de"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              type="email"
              radius="md"
              aria-label="University Email"
            />
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
              radius="md"
              aria-label="Password"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoggingIn}
              className="w-full min-h-[44px]"
              aria-label="Sign in to your account"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            {showResend && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resendVerification(email)}
                aria-label="Resend verification email"
              >
                Resend verification email
              </Button>
            )}
            <div className="flex items-center justify-between text-sm">
              <Anchor
                component={Link}
                to={ROUTES.FORGOT_PASSWORD}
                className="text-brand-600 hover:text-brand-700"
                aria-label="Forgot password"
              >
                Forgot password?
              </Anchor>
              <Text className="text-slate-500">
                No account?{' '}
                <Anchor
                  component={Link}
                  to={ROUTES.REGISTER}
                  className="text-brand-600 hover:text-brand-700"
                  aria-label="Sign up"
                >
                  Sign up
                </Anchor>
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}