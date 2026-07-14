// src/hooks/useAdmin.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { adminApi } from '@/api/adminApi';
import { reportsApi } from '@/api/reportsApi';
import { eventsApi } from '@/api/eventsApi';
import type { BulkEventActionRequest, CategoryRequest } from '@/types';

export function useAdmin() {
  const queryClient = useQueryClient();

  // ----- Dashboard -----
  const useDashboard = () => {
    return useQuery({
      queryKey: ['admin', 'dashboard'],
      queryFn: () => adminApi.getDashboardStats().then((res) => res.data.data),
      staleTime: 1000 * 60 * 5,
      refetchInterval: 1000 * 60 * 2,
    });
  };

  // ----- Events -----
  const useAdminEvents = (status?: string, page = 0, size = 20) => {
    return useQuery({
      queryKey: ['admin', 'events', status, page, size],
      queryFn: () =>
        adminApi.getEvents({ status, page, size }).then((res) => res.data.data),
      staleTime: 1000 * 30,
    });
  };

  const usePendingEvents = () => {
    return useQuery({
      queryKey: ['admin', 'events', 'pending'],
      queryFn: () => adminApi.getPendingEvents().then((res) => res.data.data),
      staleTime: 1000 * 30,
    });
  };

  const approveEventMutation = useMutation({
    mutationFn: (eventId: string) => adminApi.approveEvent(eventId),
    onSuccess: () => {
      notifications.show({
        title: 'Event approved',
        message: 'The event has been published.',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to approve event.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ✅ FIX: rejectEvent now only calls adminApi.rejectEvent(id) – no reason argument
  const rejectEventMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => adminApi.rejectEvent(id), // Only ID
    onSuccess: () => {
      notifications.show({
        title: 'Event rejected',
        message: 'The event has been cancelled.',
        color: 'orange',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to reject event.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  const flagEventMutation = useMutation({
    mutationFn: (eventId: string) => adminApi.flagEvent(eventId),
    onSuccess: () => {
      notifications.show({
        title: 'Event flagged',
        message: 'The event has been moved to under review.',
        color: 'yellow',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to flag event.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // Permanent delete
  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => eventsApi.permanentDelete(eventId),
    onSuccess: () => {
      notifications.show({
        title: 'Event permanently deleted',
        message: 'The event has been removed from the system.',
        color: 'red',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete event.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: (data: BulkEventActionRequest) => adminApi.bulkApprove(data),
    onSuccess: (response) => {
      const result = response.data.data;
      notifications.show({
        title: 'Bulk approve complete',
        message: `${result?.successCount || 0} events approved, ${result?.failedCount || 0} failed.`,
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Bulk approve failed.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: (data: BulkEventActionRequest) => adminApi.bulkReject(data),
    onSuccess: (response) => {
      const result = response.data.data;
      notifications.show({
        title: 'Bulk reject complete',
        message: `${result?.successCount || 0} events rejected, ${result?.failedCount || 0} failed.`,
        color: 'orange',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Bulk reject failed.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ----- Users -----
  const useUsers = (search?: string, trustLevel?: string, page = 0, size = 20) => {
    return useQuery({
      queryKey: ['admin', 'users', search, trustLevel, page, size],
      queryFn: () =>
        adminApi.getUsers({ search, trustLevel, page, size }).then((res) => res.data.data),
      staleTime: 1000 * 30,
    });
  };

  const updateTrustLevelMutation = useMutation({
    mutationFn: ({ userId, trustLevel }: { userId: string; trustLevel: string }) =>
      adminApi.updateTrustLevel(userId, trustLevel),
    onSuccess: () => {
      notifications.show({
        title: 'Trust level updated',
        message: "The user's trust level has been changed.",
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update trust level.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  const flagUserMutation = useMutation({
    mutationFn: (userId: string) => adminApi.flagUser(userId),
    onSuccess: () => {
      notifications.show({
        title: 'User flagged',
        message: 'The user has been flagged and locked out.',
        color: 'red',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to flag user.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  const promoteUserMutation = useMutation({
    mutationFn: ({ userId, force = false }: { userId: string; force?: boolean }) =>
      adminApi.promoteUser(userId, force),
    onSuccess: () => {
      notifications.show({
        title: 'User promoted',
        message: 'The user is now a TRUSTED_HOST.',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to promote user.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      notifications.show({
        title: 'User deleted',
        message: 'The user account has been permanently deleted.',
        color: 'red',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete user.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ----- Categories -----
  const useCategories = () => {
    return useQuery({
      queryKey: ['admin', 'categories'],
      queryFn: () => adminApi.getAllCategories().then((res) => res.data.data),
      staleTime: 1000 * 60 * 5,
    });
  };

  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryRequest) => adminApi.createCategory(data),
    onSuccess: () => {
      notifications.show({
        title: 'Category created',
        message: 'The category has been added.',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to create category.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryRequest }) =>
      adminApi.updateCategory(id, data),
    onSuccess: () => {
      notifications.show({
        title: 'Category updated',
        message: 'The category has been modified.',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update category.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => {
      notifications.show({
        title: 'Category deleted',
        message: 'The category has been removed.',
        color: 'blue',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete category.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ----- Reports -----
  const useAdminReports = (params?: {
    status?: string;
    reason?: string;
    page?: number;
    size?: number;
  }) => {
    return useQuery({
      queryKey: ['admin-reports', params],
      queryFn: () => reportsApi.getReports(params).then((res) => res.data.data),
      staleTime: 1000 * 60,
    });
  };

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

  // ----- Return -----
  return {
    // Dashboard
    useDashboard,

    // Events
    useAdminEvents,
    usePendingEvents,
    approveEvent: approveEventMutation.mutateAsync,
    rejectEvent: rejectEventMutation.mutateAsync,   // now expects { id } only
    flagEvent: flagEventMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,
    bulkApprove: bulkApproveMutation.mutateAsync,
    bulkReject: bulkRejectMutation.mutateAsync,

    // Users
    useUsers,
    updateTrustLevel: updateTrustLevelMutation.mutateAsync,
    flagUser: flagUserMutation.mutateAsync,
    promoteUser: promoteUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,

    // Categories
    useCategories,
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,

    // Reports
    useAdminReports,
    resolveReport: resolveReportMutation.mutateAsync,
    deleteReport: deleteReportMutation.mutateAsync,
    isResolving: resolveReportMutation.isPending,
    isDeleting: deleteReportMutation.isPending,

    // Loading states
    isApproving: approveEventMutation.isPending,
    isRejecting: rejectEventMutation.isPending,
    isFlagging: flagEventMutation.isPending,
    isUpdatingTrust: updateTrustLevelMutation.isPending,
  };
}