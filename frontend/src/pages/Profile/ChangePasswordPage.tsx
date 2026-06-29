// src/pages/Profile/ChangePasswordPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Title, Stack, PasswordInput, Button, Group } from '@mantine/core'; // <-- added Group
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

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
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} ta="center" mb="lg">
          Change Password
        </Title>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <PasswordInput
              label="Current Password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              error={error}
              required
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => navigate(ROUTES.PROFILE)}>
                Cancel
              </Button>
              <Button type="submit" loading={isChangingPassword}>
                Change Password
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}