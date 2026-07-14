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
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg" style={{ color: 'var(--app-text)' }}>
          {title}
        </Text>
      }
      centered
      radius="xl"
      styles={{
        content: { background: 'var(--app-surface)' },
        header: { background: 'var(--app-surface)', borderBottom: '1px solid var(--app-border)' },
      }}
    >
      <Stack>
        <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
          {message}
        </Text>
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