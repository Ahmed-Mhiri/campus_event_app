// src/api/notificationsApi.ts
import { api } from './client';
import type { ApiResponse, PageResponse, Notification } from '@/types';

export const notificationsApi = {
  getNotifications: (params?: { unreadOnly?: boolean; page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Notification>>>('/api/notifications', { params }),

  getUnreadCount: () =>
    api.get<ApiResponse<number>>('/api/notifications/unread-count'),

  markRead: (notificationId: string) =>
    api.patch<ApiResponse<void>>(`/api/notifications/${notificationId}/read`),

  markAllRead: () =>
    api.patch<ApiResponse<number>>('/api/notifications/read-all'),

  deleteNotification: (notificationId: string) =>
    api.delete<ApiResponse<void>>(`/api/notifications/${notificationId}`),
};