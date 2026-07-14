// src/pages/Auth/ResetPasswordPage.tsx
import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Title,
  PasswordInput,
  Text,
  Anchor,
  Stack,
  ThemeIcon,
  Progress,
  Popover,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowRight,
  IconLockCog,
  IconAlertTriangle,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';

// ─── Password validation (same as RegisterPage) ──────────────────────────────

const requirements = [
  { re: /[0-9]/, label: 'Includes number' },
  { re: /[a-z]/, label: 'Includes lowercase letter' },
  { re: /[A-Z]/, label: 'Includes uppercase letter' },
  { re: /[^A-Za-z0-9]/, label: 'Includes special symbol' },
];

function getStrength(password: string) {
  let multiplier = password.length > 7 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [popoverOpened, setPopoverOpened] = useState(false);

  const { resetPassword, isResetting } = useAuth();

  const strength = getStrength(newPassword);
  const strengthColor = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';
  const meetsLength = newPassword.length >= 8;

  const checks = requirements.map((requirement, index) => {
    const meets = requirement.re.test(newPassword);
    return (
      <Text
        key={index}
        c={meets ? 'teal' : 'dimmed'}
        size="sm"
        className="flex items-center gap-2 mt-1"
      >
        {meets ? <IconCheck size={14} /> : <IconX size={14} />} {requirement.label}
      </Text>
    );
  });

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
      <Stack gap="xl" align="center" ta="center">
        <ThemeIcon size={48} radius="xl" variant="light" color="red">
          <IconAlertTriangle size={24} />
        </ThemeIcon>
        <div>
          <Title order={2} className="text-slate-900 dark:text-white">
            Invalid reset link
          </Title>
          <Text c="dimmed" mt="xs">
            This link is missing or has expired. Request a new one to continue.
          </Text>
        </div>
        <Button
          component={Link}
          to={ROUTES.FORGOT_PASSWORD}
          variant="primary"
          size="lg"
          fullWidth
          aria-label="Request new link"
        >
          Request new link
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="xl">
      <div>
        <ThemeIcon size={48} radius="xl" variant="light" color="violet" mb="md">
          <IconLockCog size={24} />
        </ThemeIcon>
        <Title order={1} className="text-[1.75rem] sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Set a new password
        </Title>
        <Text className="text-slate-500 dark:text-slate-400 mt-1.5">
          Choose a strong password you haven't used before.
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Reset password form">
        {/* ─── New Password with strength popover ─── */}
        <Popover
          opened={popoverOpened}
          position="bottom"
          width="target"
          transitionProps={{ transition: 'pop' }}
        >
          <Popover.Target>
            <div
              onFocusCapture={() => setPopoverOpened(true)}
              onBlurCapture={() => setPopoverOpened(false)}
            >
              <PasswordInput
                label="New password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.currentTarget.value)}
                required
                radius="md"
                size="md"
                aria-label="New password"
              />
            </div>
          </Popover.Target>

          <Popover.Dropdown>
            <Progress color={strengthColor} value={strength} size={5} mb="xs" />
            <Text
              c={meetsLength ? 'teal' : 'dimmed'}
              size="sm"
              className="flex items-center gap-2 mt-1"
            >
              {meetsLength ? <IconCheck size={14} /> : <IconX size={14} />}{' '}
              At least 8 characters
            </Text>
            {checks}
          </Popover.Dropdown>
        </Popover>

        <PasswordInput
          label="Confirm new password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          required
          radius="md"
          size="md"
          aria-label="Confirm new password"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isResetting}
          fullWidth
          rightSection={<IconArrowRight size={18} />}
          className="min-h-[46px] mt-2"
          aria-label="Reset password"
        >
          Reset password
        </Button>
      </form>

      <Text size="sm" className="text-center text-slate-500 dark:text-slate-400">
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