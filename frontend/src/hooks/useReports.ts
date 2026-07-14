// src/hooks/useReports.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { reportsApi } from '@/api/reportsApi';
import type { CreateReportRequest } from '@/types';

export function useReports() {
  const queryClient = useQueryClient();

  // ----- Create report (user) -----
  const createReportMutation = useMutation({
    mutationFn: (data: CreateReportRequest) => reportsApi.createReport(data),
    onSuccess: () => {
      notifications.show({
        title: 'Report submitted',
        message: 'Thank you. We will review this event.',
        color: 'green',
      });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to submit report.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ----- Admin: Get reports -----
  const useAdminReports = (params?: { status?: string; reason?: string; page?: number; size?: number }) => {
    return useQuery({
      queryKey: ['admin-reports', params],
      queryFn: () => reportsApi.getReports(params).then((res) => res.data.data),
      staleTime: 1000 * 60,
      enabled: false, // Only fetch when admin uses it
    });
  };

  // ----- Admin: Resolve report -----
  const resolveReportMutation = useMutation({
    mutationFn: ({ reportId, flagEvent }: { reportId: string; flagEvent?: boolean }) =>
      reportsApi.resolveReport(reportId, flagEvent),
    onSuccess: () => {
      notifications.show({
        title: 'Report resolved',
        message: 'The report has been resolved.',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to resolve report.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ----- Admin: Delete report -----
  const deleteReportMutation = useMutation({
    mutationFn: (reportId: string) => reportsApi.deleteReport(reportId),
    onSuccess: () => {
      notifications.show({
        title: 'Report deleted',
        message: 'The report has been removed.',
        color: 'blue',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete report.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  return {
    createReport: createReportMutation.mutateAsync,
    useAdminReports,
    resolveReport: resolveReportMutation.mutateAsync,
    deleteReport: deleteReportMutation.mutateAsync,
    isCreating: createReportMutation.isPending,
    isResolving: resolveReportMutation.isPending,
    isDeleting: deleteReportMutation.isPending,
  };
}