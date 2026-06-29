// src/api/reviewsApi.ts
import { api } from './client';
import type {
  ApiResponse,
  PageResponse,
  Review,
  CreateReviewRequest,
  ReviewReportRequest,
} from '@/types';

export const reviewsApi = {
  // ----- Create & Delete -----
  createReview: (data: CreateReviewRequest) =>
    api.post<ApiResponse<Review>>('/api/reviews', data),

  deleteReview: (reviewId: string) =>
    api.delete<ApiResponse<void>>(`/api/reviews/${reviewId}`),

  // ----- List -----
  getEventReviews: (eventId: string, params?: { page?: number; size?: number; sort?: string }) =>
    api.get<ApiResponse<PageResponse<Review>>>(`/api/reviews/event/${eventId}`, { params }),

  getHostReviews: (hostId: string, params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Review>>>(`/api/reviews/host/${hostId}`, { params }),

  // ----- Helpful votes -----
  toggleHelpful: (reviewId: string) =>
    api.post<ApiResponse<Review>>(`/api/reviews/${reviewId}/helpful`),

  // ----- Report review -----
  reportReview: (reviewId: string, data: ReviewReportRequest) =>
    api.post<ApiResponse<void>>(`/api/reviews/${reviewId}/report`, data),
};