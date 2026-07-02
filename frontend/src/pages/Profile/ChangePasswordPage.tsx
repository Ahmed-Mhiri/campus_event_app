import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stack,
  PasswordInput,
  Button,
  Group,
  Text,
  ThemeIcon,
  Divider,
} from '@mantine/core';
import { IconArrowLeft, IconLockCog, IconCheck, IconShieldCheck } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { slideUp } from '@/design-system/animations';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const { changePassword, isChangingPassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    await changePassword({ currentPassword, newPassword, confirmPassword });
    navigate(ROUTES.PROFILE);
  };

  return (
    <PageContainer size="sm">
      <Stack gap="xl">
        <PageHeader
          title="Change Password"
          subtitle="Update your security credentials"
          breadcrumbs={[
            { label: 'Profile', href: ROUTES.PROFILE },
            { label: 'Change Password' },
          ]}
        />

        <motion.div initial="hidden" animate="visible" variants={slideUp}>
          <Card variant="default" className="border-slate-200/80 dark:border-slate-700/60">
            <form onSubmit={handleSubmit}>
              <Stack gap="xl">
                <div className="flex items-center gap-4">
                  <ThemeIcon size={48} radius="xl" variant="light" color="violet">
                    <IconLockCog size={24} />
                  </ThemeIcon>
                  <div>
                    {/* ✅ FIXED: CSS var */}
                    <Text fw={600} style={{ color: 'var(--app-text)' }}>
                      Security Settings
                    </Text>
                    <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                      Choose a strong password you haven't used before.
                    </Text>
                  </div>
                </div>

                <Divider style={{ borderColor: 'var(--app-border)' }} />

                <Stack gap="md">
                  <PasswordInput
                    label="Current Password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.currentTarget.value)}
                    required
                    radius="md"
                    size="md"
                    styles={{ label: { color: 'var(--app-text)' } }}
                  />
                  <PasswordInput
                    label="New Password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.currentTarget.value)}
                    required
                    radius="md"
                    size="md"
                    styles={{ label: { color: 'var(--app-text)' } }}
                  />
                  <PasswordInput
                    label="Confirm New Password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                    error={error}
                    required
                    radius="md"
                    size="md"
                    styles={{ label: { color: 'var(--app-text)' } }}
                  />

                  <div className="flex flex-wrap gap-2">
                    {['At least 8 characters', 'Uppercase & lowercase', 'One number', 'One special character'].map((req) => (
                      <div
                        key={req}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full"
                        style={{
                          color: 'var(--app-text-secondary)',
                          background: 'var(--app-border-light)',
                        }}
                      >
                        <IconShieldCheck size={12} />
                        {req}
                      </div>
                    ))}
                  </div>
                </Stack>

                <Group justify="flex-end" gap="sm">
                  <Button
                    variant="default"
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() => navigate(ROUTES.PROFILE)}
                    radius="md"
                    size="md"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isChangingPassword}
                    leftSection={<IconCheck size={16} />}
                    radius="md"
                    size="md"
                    color="brand"
                  >
                    Update Password
                  </Button>
                </Group>
              </Stack>
            </form>
          </Card>
        </motion.div>
      </Stack>
    </PageContainer>
  );
}