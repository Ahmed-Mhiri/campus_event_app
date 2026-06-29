// src/hooks/useRsvp.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { rsvpApi } from '@/api/rsvpApi';

export function useRsvp(eventId?: string) {
  const queryClient = useQueryClient();

  // ----- Create RSVP -----
  const createRsvpMutation = useMutation({
    mutationFn: () => rsvpApi.createRsvp(eventId!),
    onSuccess: (response) => {
      const rsvp = response.data.data;
      const isWaitlisted = rsvp?.status === 'WAITLISTED';
      notifications.show({
        title: isWaitlisted ? 'Added to waitlist' : 'Registered!',
        message: isWaitlisted
          ? 'You are on the waitlist. We\'ll notify you if a spot opens up.'
          : 'You\'re going to this event!',
        color: isWaitlisted ? 'yellow' : 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['my-rsvps'] });
      queryClient.invalidateQueries({ queryKey: ['my-rsvp', eventId] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to register.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ----- Cancel RSVP -----
  const cancelRsvpMutation = useMutation({
    mutationFn: ({ rsvpId, reason }: { rsvpId: string; reason?: string }) =>
      rsvpApi.cancelRsvp(rsvpId, reason),
    onSuccess: () => {
      notifications.show({
        title: 'Cancelled',
        message: 'Your registration has been cancelled.',
        color: 'blue',
      });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['my-rsvps'] });
      queryClient.invalidateQueries({ queryKey: ['my-rsvp', eventId] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to cancel.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ----- Get my RSVPs (with filtering) -----
  const useMyRsvps = (status?: string, page = 0, size = 20) => {
    return useQuery({
      queryKey: ['my-rsvps', status, page],
      queryFn: () =>
        rsvpApi
          .getMyRsvps({ page, size })
          .then((res) => res.data.data)
          .then((data) => {
            if (!data) return { content: [], totalElements: 0, totalPages: 0, page: 0, size: 0, last: true };
            if (status) {
              return {
                ...data,
                content: data.content.filter((r) => r.status === status),
              };
            }
            return data;
          }),
      staleTime: 1000 * 60,
    });
  };

  // ----- Get RSVP position (for waitlist) -----
  const useRsvpPosition = (rsvpId: string | null) => {
    return useQuery({
      queryKey: ['rsvp-position', rsvpId],
      queryFn: () => rsvpApi.getRsvpPosition(rsvpId!).then((res) => res.data.data),
      enabled: !!rsvpId,
      staleTime: 1000 * 30,
    });
  };

  // ----- Get my RSVP for a specific event (NEW) -----
  const useMyRsvpForEvent = (eventId: string) => {
    return useQuery({
      queryKey: ['my-rsvp', eventId],
      queryFn: () => rsvpApi.getMyRsvpForEvent(eventId).then((res) => res.data.data),
      enabled: !!eventId,
      staleTime: 1000 * 30,
    });
  };

  // ----- Host: Get event RSVPs -----
  const useEventRsvps = (eventId: string, status?: string, page = 0, size = 20) => {
    return useQuery({
      queryKey: ['event-rsvps', eventId, status, page],
      queryFn: () => {
        if (status) {
          return rsvpApi
            .getEventRsvpsByStatus(eventId, status, { page, size })
            .then((res) => res.data.data);
        }
        return rsvpApi
          .getEventRsvps(eventId, { page, size })
          .then((res) => res.data.data);
      },
      staleTime: 1000 * 30,
    });
  };

  // ----- Host: Mark attended -----
  const markAttendedMutation = useMutation({
    mutationFn: ({ eventId, rsvpId }: { eventId: string; rsvpId: string }) =>
      rsvpApi.markAttended(eventId, rsvpId),
    onSuccess: () => {
      notifications.show({
        title: 'Marked attended',
        message: 'Attendee has been checked in.',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['event-rsvps', eventId] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to mark attended.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ----- Host: Promote waitlist -----
  const promoteWaitlistMutation = useMutation({
    mutationFn: ({ eventId, rsvpId }: { eventId: string; rsvpId: string }) =>
      rsvpApi.promoteWaitlist(eventId, rsvpId),
    onSuccess: () => {
      notifications.show({
        title: 'Promoted',
        message: 'User has been promoted from waitlist.',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['event-rsvps', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to promote.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ----- Self check-in -----
  const selfCheckInMutation = useMutation({
    mutationFn: ({ eventId, code }: { eventId: string; code: string }) =>
      rsvpApi.selfCheckIn(eventId, code),
    onSuccess: () => {
      notifications.show({
        title: 'Checked in!',
        message: 'You have been checked in to the event.',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Invalid check-in code.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  return {
    // Mutations
    createRsvp: createRsvpMutation.mutateAsync,
    cancelRsvp: cancelRsvpMutation.mutateAsync,
    markAttended: markAttendedMutation.mutateAsync,
    promoteWaitlist: promoteWaitlistMutation.mutateAsync,
    selfCheckIn: selfCheckInMutation.mutateAsync,

    // Queries
    useMyRsvps,
    useRsvpPosition,
    useEventRsvps,
    useMyRsvpForEvent, // <-- NOW INCLUDED

    // Status
    isCreating: createRsvpMutation.isPending,
    isCancelling: cancelRsvpMutation.isPending,
    isMarkingAttended: markAttendedMutation.isPending,
    isPromoting: promoteWaitlistMutation.isPending,
    isCheckingIn: selfCheckInMutation.isPending,
  };
}