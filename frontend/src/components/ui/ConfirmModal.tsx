import { Modal, Stack, Text, Group, Button } from '@mantine/core';

interface ConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  loading?: boolean;
}

export function ConfirmModal({
  opened,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'red',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered radius="xl">
      <Stack>
        <Text size="sm">{message}</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} radius="md">
            {cancelLabel}
          </Button>
          <Button color={confirmColor} onClick={onConfirm} loading={loading} radius="md">
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}