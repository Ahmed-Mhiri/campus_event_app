// src/components/molecules/ReportEventModal/ReportEventModal.tsx
import { useState } from 'react';
import { Modal, Stack, Select, Textarea, Button, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications'; // ✅ fixed: import notifications
import { useReports } from '@/hooks/useReports';
import type { ReportReason } from '@/types';

interface ReportEventModalProps {
  opened: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  onReportSubmitted?: () => void;
}

const reportReasons = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate Content' },
  { value: 'FAKE_EVENT', label: 'Fake Event' },
  { value: 'OTHER', label: 'Other' },
];

export function ReportEventModal({
  opened,
  onClose,
  eventId,
  eventTitle,
  onReportSubmitted,
}: ReportEventModalProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const { createReport, isCreating } = useReports();

  const handleSubmit = async () => {
    if (!reason) {
      notifications.show({
        title: 'Error',
        message: 'Please select a reason.',
        color: 'red',
      });
      return;
    }

    await createReport({
      eventId,
      reason,
      details: details || undefined,
    });
    setReason(null);
    setDetails('');
    onClose();
    if (onReportSubmitted) onReportSubmitted();
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        setReason(null);
        setDetails('');
        onClose();
      }}
      title={`Report Event: ${eventTitle}`}
      centered
    >
      <Stack>
        <Select
          label="Reason for reporting"
          placeholder="Select a reason"
          data={reportReasons}
          value={reason}
          onChange={(val) => setReason(val as ReportReason)}
          required
        />
        <Textarea
          label="Details (optional)"
          placeholder="Provide more information about your report..."
          value={details}
          onChange={(e) => setDetails(e.currentTarget.value)}
          minRows={3}
          maxLength={2000}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button color="red" onClick={handleSubmit} loading={isCreating}>
            Submit Report
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}