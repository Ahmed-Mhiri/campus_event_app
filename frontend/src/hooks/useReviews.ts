// src/hooks/useReviews.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { reviewsApi } from '@/api/reviewsApi';
import type { CreateReviewRequest, ReviewReportRequest } from '@/types';

export function useReviews() {
  const queryClient = useQueryClient();

  // ----- Get event reviews -----
  const useEventReviews = (eventId: string, page = 0, size = 20, sort = 'helpfulCount,desc') => {
    return useQuery({
      queryKey: ['reviews', 'event', eventId, page, size, sort],
      queryFn: () =>
        reviewsApi
          .getEventReviews(eventId, { page, size, sort })
          .then((res) => res.data.data),
      enabled: !!eventId, // ✅ prevents errors when eventId is empty
      staleTime: 1000 * 60,
    });
  };

  // ----- Get host reviews -----
  const useHostReviews = (hostId: string, page = 0, size = 20) => {
    return useQuery({
      queryKey: ['reviews', 'host', hostId, page, size],
      queryFn: () =>
        reviewsApi
          .getHostReviews(hostId, { page, size })
          .then((res) => res.data.data),
      staleTime: 1000 * 60,
    });
  };

  // ----- Create review -----
  const createReviewMutation = useMutation({
    mutationFn: (data: CreateReviewRequest) => reviewsApi.createReview(data),
    onSuccess: (response, variables) => {
      notifications.show({
        title: 'Review submitted!',
        message: 'Thank you for your feedback.',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'event', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'host'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to submit review.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ----- Delete review -----
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => reviewsApi.deleteReview(reviewId),
    onSuccess: () => {
      notifications.show({
        title: 'Review deleted',
        message: 'Your review has been removed.',
        color: 'blue',
      });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete review.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ----- Toggle helpful -----
  const toggleHelpfulMutation = useMutation({
    mutationFn: (reviewId: string) => reviewsApi.toggleHelpful(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to vote.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ----- Report review -----
  const reportReviewMutation = useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: ReviewReportRequest }) =>
      reviewsApi.reportReview(reviewId, data),
    onSuccess: () => {
      notifications.show({
        title: 'Report submitted',
        message: 'The review has been reported for moderation.',
        color: 'green',
      });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to report review.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  return {
    // Queries
    useEventReviews,
    useHostReviews,

    // Mutations
    createReview: createReviewMutation.mutateAsync,
    deleteReview: deleteReviewMutation.mutateAsync,
    toggleHelpful: toggleHelpfulMutation.mutateAsync,
    reportReview: reportReviewMutation.mutateAsync,

    // Status
    isCreating: createReviewMutation.isPending,
    isDeleting: deleteReviewMutation.isPending,
    isToggling: toggleHelpfulMutation.isPending,
  };
}