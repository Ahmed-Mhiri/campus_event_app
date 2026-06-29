// src/api/eventsApi.ts
import { api } from './client';
import type {
  ApiResponse,
  PageResponse,
  Event,
  Category,
  CreateEventRequest,
  CheckInCode,
} from '@/types';

export const eventsApi = {
  // ----- Public endpoints -----
  getEvents: (params: {
    page?: number;
    size?: number;
    sort?: string;
    categoryId?: number;
    dateFrom?: string;
    dateTo?: string;
    location?: string;
    q?: string;
  }) =>
    api.get<ApiResponse<PageResponse<Event>>>('/api/events', { params }),

  getFeaturedEvents: () =>
    api.get<ApiResponse<PageResponse<Event>>>('/api/public/events/featured'),

  getEventById: (id: string) =>
    api.get<ApiResponse<Event>>(`/api/events/${id}`),

  getEventBySlug: (slug: string) =>
    api.get<ApiResponse<Event>>(`/api/events/by-slug/${slug}`),

  getPublicEventById: (id: string) =>
    api.get<ApiResponse<Event>>(`/api/public/events/${id}`),

  getPublicEventBySlug: (slug: string) =>
    api.get<ApiResponse<Event>>(`/api/public/events/slug/${slug}`),

  // ----- Categories -----
  getCategories: () =>
    api.get<ApiResponse<Category[]>>('/api/public/categories'),

  // ----- Authenticated event management -----
  createEvent: (data: CreateEventRequest) =>
    api.post<ApiResponse<Event>>('/api/events', data),

  createDraft: (data: Partial<CreateEventRequest>) =>
    api.post<ApiResponse<Event>>('/api/events/draft', data),

  updateEvent: (id: string, data: CreateEventRequest) =>
    api.put<ApiResponse<Event>>(`/api/events/${id}`, data),

  publishEvent: (id: string) =>
    api.put<ApiResponse<Event>>(`/api/events/${id}/publish`),

  cancelEvent: (id: string, reason?: string) =>
    api.patch<ApiResponse<Event>>(`/api/events/${id}/cancel`, { reason }),

  softDeleteEvent: (id: string) =>
    api.delete<ApiResponse<void>>(`/api/events/${id}`),

  restoreEvent: (id: string) =>
    api.patch<ApiResponse<Event>>(`/api/events/${id}/restore`),

  permanentDelete: (id: string) =>
    api.delete<ApiResponse<void>>(`/api/events/${id}/permanent`),

  getMyEvents: (params?: { includeDeleted?: boolean; page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Event>>>('/api/events/my-events', { params }),

  // ----- Media -----
  uploadMedia: (eventId: string, formData: FormData) =>
    api.post<ApiResponse<Event>>(`/api/events/${eventId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteMedia: (eventId: string, mediaId: string) =>
    api.delete<ApiResponse<Event>>(`/api/events/${eventId}/media/${mediaId}`),

  reorderMedia: (eventId: string, mediaIds: string[]) =>
    api.patch<ApiResponse<Event>>(`/api/events/${eventId}/media/reorder`, mediaIds),

  // ----- Check-in -----
  getCheckInCode: (eventId: string) =>
    api.get<ApiResponse<CheckInCode>>(`/api/events/${eventId}/check-in-code`),
};