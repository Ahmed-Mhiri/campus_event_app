// src/components/molecules/DeleteAccountModal/DeleteAccountModal.tsx

import { useState } from 'react';
import { Modal, Button, Stack, Text, PasswordInput, Group } from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';

interface DeleteAccountModalProps {
  opened: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ opened, onClose }: DeleteAccountModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { deleteAccount, isDeletingAccount } = useAuth();

  const handleDelete = async () => {
    try {
      await deleteAccount();
      onClose();
    } catch (err) {
      setError('Failed to delete account. Please try again.');
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete Account"
      centered
    >
      <Stack>
        <Text size="sm" c="dimmed">
          Are you sure you want to delete your account? This action is <strong>permanent</strong>{' '}
          and cannot be undone. All your events, RSVPs, reviews, and data will be removed.
        </Text>
        <Text size="sm" c="dimmed">
          To confirm, enter your password below.
        </Text>
        <PasswordInput
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          error={error}
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleDelete}
            loading={isDeletingAccount}
            disabled={!password}
          >
            I understand, delete my account
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}