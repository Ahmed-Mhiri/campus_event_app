import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Title, TextInput, PasswordInput, Text, Anchor, Progress, Stack, Popover } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowRight, IconCheck, IconX } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { EMAIL_REGEX, DISPLAY_NAME_MIN, DISPLAY_NAME_MAX } from '@/constants/validation';
import { Button } from '@/components/ui/Button';

// 1. Define the updated, optimal requirements (accepts ANY special character)
const requirements = [
  { re: /[0-9]/, label: 'Includes number' },
  { re: /[a-z]/, label: 'Includes lowercase letter' },
  { re: /[A-Z]/, label: 'Includes uppercase letter' },
  { re: /[^A-Za-z0-9]/, label: 'Includes special symbol' },
];

// 2. Calculate strength based on unmet requirements
function getStrength(password: string) {
  let multiplier = password.length > 7 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

export function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [popoverOpened, setPopoverOpened] = useState(false); // Controls the checklist visibility
  
  const { register, isRegistering } = useAuth();

  // Derived state for the password strength UI
  const strength = getStrength(password);
  const strengthColor = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';
  const meetsLength = password.length >= 8;

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

  // Generate the checklist UI elements dynamically
  const checks = requirements.map((requirement, index) => {
    const meets = requirement.re.test(password);
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

        {/* OPTIMAL UI: Password Popover Checklist */}
        <Popover opened={popoverOpened} position="bottom" width="target" transitionProps={{ transition: 'pop' }}>
          <Popover.Target>
            <div
              onFocusCapture={() => setPopoverOpened(true)}
              onBlurCapture={() => setPopoverOpened(false)}
            >
              <PasswordInput
                label="Password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
                radius="md"
                size="md"
                aria-label="Password"
              />
            </div>
          </Popover.Target>

          <Popover.Dropdown>
            <Progress color={strengthColor} value={strength} size={5} mb="xs" />
            <Text c={meetsLength ? 'teal' : 'dimmed'} size="sm" className="flex items-center gap-2 mt-1">
              {meetsLength ? <IconCheck size={14} /> : <IconX size={14} />} At least 8 characters
            </Text>
            {checks}
          </Popover.Dropdown>
        </Popover>

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