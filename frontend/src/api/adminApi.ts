// frontend/src/api/adminApi.ts
import { api } from './client';
import type {
  ApiResponse,
  PageResponse,
  AdminDashboard,
  Event,
  User,
  Category,
  CategoryRequest,
  BulkEventActionRequest,
  BulkEventActionResult,
} from '@/types';

export const adminApi = {
  // ----- Dashboard -----
  getDashboardStats: () =>
    api.get<ApiResponse<AdminDashboard>>('/api/admin/dashboard'),

  // ----- Event Moderation -----
  getEvents: (params?: { status?: string; page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Event>>>('/api/admin/events', { params }),

  getPendingEvents: () =>
    api.get<ApiResponse<PageResponse<Event>>>('/api/admin/events/pending'),

  approveEvent: (eventId: string) =>
    api.patch<ApiResponse<Event>>(`/api/admin/events/${eventId}/approve`),

  rejectEvent: (eventId: string) =>
    api.patch<ApiResponse<void>>(`/api/admin/events/${eventId}/reject`),

  flagEvent: (eventId: string) =>
    api.patch<ApiResponse<Event>>(`/api/admin/events/${eventId}/flag`),

  bulkApprove: (data: BulkEventActionRequest) =>
    api.post<ApiResponse<BulkEventActionResult>>('/api/admin/events/bulk-approve', data),

  bulkReject: (data: BulkEventActionRequest) =>
    api.post<ApiResponse<BulkEventActionResult>>('/api/admin/events/bulk-reject', data),

  // ----- User Management -----
  getUsers: (params?: { search?: string; trustLevel?: string; page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<User>>>('/api/admin/users', { params }),

  getUser: (userId: string) =>
    api.get<ApiResponse<User>>(`/api/admin/users/${userId}`),

  // ✅ FIX: Send trustLevel in the request body (JSON) as per new backend @RequestBody
  updateTrustLevel: (userId: string, trustLevel: string) =>
    api.patch<ApiResponse<void>>(`/api/admin/users/${userId}/trust-level`, { trustLevel }),

  flagUser: (userId: string) =>
    api.post<ApiResponse<void>>(`/api/admin/users/${userId}/flag`),

  // promoteUser uses query param 'force' – matches backend @RequestParam
  promoteUser: (userId: string, force = false) =>
    api.post<ApiResponse<void>>(`/api/admin/users/${userId}/promote?force=${force}`),

  deleteUser: (userId: string) =>
    api.delete<ApiResponse<void>>(`/api/admin/users/${userId}`),

  // ----- Category Management -----
  getAllCategories: () =>
    api.get<ApiResponse<Category[]>>('/api/admin/categories'),

  createCategory: (data: CategoryRequest) =>
    api.post<ApiResponse<Category>>('/api/admin/categories', data),

  updateCategory: (id: number, data: CategoryRequest) =>
    api.put<ApiResponse<Category>>(`/api/admin/categories/${id}`, data),

  deleteCategory: (id: number) =>
    api.delete<ApiResponse<void>>(`/api/admin/categories/${id}`),
};