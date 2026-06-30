// src/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications as mantineNotifications } from '@mantine/notifications';
import { notificationsApi } from '@/api/notificationsApi';
import { useAuthStore } from '@/stores/authStore'; // 👈 IMPORT THIS

export function useNotifications() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // 👈 GET AUTH STATE

  // ----- Get notifications (paginated) -----
  const useNotificationsList = (unreadOnly = false, page = 0, size = 20) => {
    return useQuery({
      queryKey: ['notifications', { unreadOnly, page, size }],
      queryFn: () =>
        notificationsApi
          .getNotifications({ unreadOnly, page, size })
          .then((res) => res.data.data),
      staleTime: 1000 * 30, // 30 seconds
      refetchInterval: 30000, // Poll every 30 seconds
      enabled: isAuthenticated, // 👈 ONLY RUN IF LOGGED IN
    });
  };

  // ----- Get unread count (with polling) -----
  const useUnreadCount = () => {
    return useQuery({
      queryKey: ['unread-notification-count'],
      queryFn: () => notificationsApi.getUnreadCount().then((res) => res.data.data),
      staleTime: 1000 * 15,
      refetchInterval: 15000, // Poll every 15 seconds
      enabled: isAuthenticated, // 👈 ONLY RUN IF LOGGED IN
    });
  };

  // ----- Mark as read -----
  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to mark as read.';
      mantineNotifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ----- Mark all read -----
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to mark all as read.';
      mantineNotifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ----- Delete notification -----
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsApi.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete notification.';
      mantineNotifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  return {
    useNotificationsList,
    useUnreadCount,
    markRead: markReadMutation.mutateAsync,
    markAllRead: markAllReadMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  };
}