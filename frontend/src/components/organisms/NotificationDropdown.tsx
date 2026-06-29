// src/components/organisms/NotificationDropdown/NotificationDropdown.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Popover,
  Stack,
  Text,
  Group,
  Avatar,
  Badge,
  Button,
  Loader,
  Center,
  ScrollArea,
  ActionIcon,
} from '@mantine/core';
import { IconBell, IconCheck, IconX, IconClock } from '@tabler/icons-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDate } from '@/utils/dateFormatter';
import type { Notification } from '@/types';

const notificationIcons: Record<string, React.ReactNode> = {
  EVENT_APPROVED: <IconCheck size={16} color="green" />,
  EVENT_REJECTED: <IconX size={16} color="red" />,
  WAITLIST_PROMOTED: <IconCheck size={16} color="blue" />,
  NEW_REVIEW: <IconCheck size={16} color="green" />,
  TRUST_PROMOTED: <IconCheck size={16} color="green" />,
  EVENT_CANCELLED: <IconX size={16} color="red" />,
  RSVP_CANCELLED: <IconX size={16} color="orange" />,
  REPORT_RESOLVED: <IconCheck size={16} color="green" />,
};

export function NotificationDropdown() {
  const navigate = useNavigate();
  const [opened, setOpened] = useState(false);

  // Get the hook methods
  const {
    useNotificationsList,
    useUnreadCount,
    markRead,
    markAllRead,
    deleteNotification,
  } = useNotifications();

  // Fetch the notification list (unreadOnly = false, page = 0, size = 20)
  const { data, isLoading, refetch } = useNotificationsList(false, 0, 20);
  
  // Fetch unread count – returns number directly
  const { data: unreadCount } = useUnreadCount();

  const notifications = data?.content || [];

  const handleMarkRead = async (id: string) => {
    await markRead(id);
    await refetch();
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    await refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    await refetch();
  };

  const handleNavigate = (notification: Notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    if (!notification.isRead) {
      handleMarkRead(notification.id);
    }
    setOpened(false);
  };

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      width={380}
      position="bottom-end"
      shadow="md"
      withArrow
    >
      <Popover.Target>
        <ActionIcon variant="subtle" onClick={() => setOpened(!opened)} pos="relative">
          <IconBell size={22} />
          {(unreadCount ?? 0) > 0 && (
            <Badge
              color="red"
              size="xs"
              circle
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                pointerEvents: 'none',
              }}
            >
              {unreadCount && unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Group justify="space-between" p="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
          <Text fw={600} size="sm">Notifications</Text>
          {(unreadCount ?? 0) > 0 && (
            <Button variant="subtle" size="compact-xs" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </Group>

        <ScrollArea h={400}>
          {isLoading ? (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          ) : notifications.length === 0 ? (
            <Center py="xl">
              <Text c="dimmed" size="sm">No notifications</Text>
            </Center>
          ) : (
            <Stack gap={0}>
              {notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--mantine-color-gray-1)',
                    backgroundColor: notification.isRead ? 'transparent' : 'var(--mantine-color-blue-0)',
                    transition: 'background-color 0.2s',
                  }}
                  onClick={() => handleNavigate(notification)}
                >
                  <Group wrap="nowrap" gap="xs">
                    <Avatar size="sm" radius="xl">
                      {notificationIcons[notification.type] || <IconBell size={16} />}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={notification.isRead ? 400 : 600} lineClamp={1}>
                        {notification.title}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {notification.message}
                      </Text>
                      <Group gap={4} mt={2}>
                        <IconClock size={10} />
                        <Text size="xs" c="dimmed">
                          {formatDate(notification.createdAt)}
                        </Text>
                      </Group>
                    </div>
                    <Group gap={2}>
                      {!notification.isRead && (
                        <ActionIcon
                          size="xs"
                          variant="subtle"
                          color="blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkRead(notification.id);
                          }}
                        >
                          <IconCheck size={14} />
                        </ActionIcon>
                      )}
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                      >
                        <IconX size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </div>
              ))}
            </Stack>
          )}
        </ScrollArea>
      </Popover.Dropdown>
    </Popover>
  );
}