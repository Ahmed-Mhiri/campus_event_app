// src/api/rsvpApi.ts
import { api } from './client';
import type {
  ApiResponse,
  PageResponse,
  Rsvp,
  // CheckInCode,   // <-- removed, not used
  // CheckInRequest, // <-- removed, not used
} from '@/types';

export const rsvpApi = {
  // ----- User actions -----
  createRsvp: (eventId: string) =>
    api.post<ApiResponse<Rsvp>>(`/api/events/${eventId}/rsvps`),

  cancelRsvp: (rsvpId: string, reason?: string) =>
    api.patch<ApiResponse<Rsvp>>(`/api/rsvps/${rsvpId}/cancel`, { reason }),

  getMyRsvps: (params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Rsvp>>>('/api/rsvps/me', { params }),

  getRsvpPosition: (rsvpId: string) =>
    api.get<ApiResponse<number>>(`/api/rsvps/${rsvpId}/position`),

  // ----- Host actions -----
  getEventRsvps: (eventId: string, params?: { page?: number; size?: number; status?: string }) =>
    api.get<ApiResponse<PageResponse<Rsvp>>>(`/api/events/${eventId}/rsvps`, { params }),

  getEventRsvpsByStatus: (eventId: string, status: string, params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Rsvp>>>(`/api/events/${eventId}/rsvps/status/${status}`, { params }),

  markAttended: (eventId: string, rsvpId: string) =>
    api.patch<ApiResponse<Rsvp>>(`/api/events/${eventId}/rsvps/${rsvpId}/attended`),

  promoteWaitlist: (eventId: string, rsvpId: string) =>
    api.patch<ApiResponse<Rsvp>>(`/api/events/${eventId}/rsvps/${rsvpId}/promote`),

  // ----- Self check-in -----
  selfCheckIn: (eventId: string, code: string) =>
    api.post<ApiResponse<Rsvp>>(`/api/events/${eventId}/check-in`, { code }),

  // ----- For EventDetailPage (quick check) -----
  getMyRsvpForEvent: (eventId: string) =>
    api.get<ApiResponse<Rsvp>>(`/api/events/${eventId}/rsvps/me`),
};