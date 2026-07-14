// src/api/reportsApi.ts
import { api } from './client';
import type { ApiResponse, PageResponse, Report, CreateReportRequest } from '@/types';

export const reportsApi = {
  // ----- User actions -----
  createReport: (data: CreateReportRequest) =>
    api.post<ApiResponse<Report>>('/api/reports', data),

  // ----- Admin actions -----
  getReports: (params?: { status?: string; reason?: string; page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Report>>>('/api/admin/reports', { params }),

  getReport: (reportId: string) =>
    api.get<ApiResponse<Report>>(`/api/admin/reports/${reportId}`),

  resolveReport: (reportId: string, flagEvent?: boolean) =>
    api.patch<ApiResponse<Report>>(`/api/admin/reports/${reportId}/resolve`, null, {
      params: { flagEvent: flagEvent || false },
    }),

  deleteReport: (reportId: string) =>
    api.delete<ApiResponse<void>>(`/api/admin/reports/${reportId}`),
};