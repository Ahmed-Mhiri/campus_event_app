// src/hooks/useEventSse.ts
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';

interface SseEventData {
  eventId: string;
  currentCount?: number;
  maxCapacity?: number;
  spotsRemaining?: number;
  isFull?: boolean;
  waitlistCount?: number;
  type?: 'PROMOTED' | 'CANCELLED';
}

export function useEventSse(eventId: string | undefined) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const connect = () => {
      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/events/stream/${eventId}`;
      const es = new EventSource(url, { withCredentials: true });

      es.onopen = () => {
        setIsConnected(true);
        console.log(`SSE connected for event ${eventId}`);
      };

      es.addEventListener('rsvp-update', (e) => {
        try {
          const data: SseEventData = JSON.parse(e.data);
          // Invalidate event cache to refresh RSVP counts
          queryClient.invalidateQueries({ queryKey: ['event', eventId] });
          // Also invalidate my-rsvps if needed
          queryClient.invalidateQueries({ queryKey: ['my-rsvps'] });
          // Show notification if event becomes full or has spots
          if (data.isFull) {
            notifications.show({
              title: 'Event is now full',
              message: 'All spots have been taken.',
              color: 'orange',
            });
          } else if (data.spotsRemaining !== undefined && data.spotsRemaining <= 5) {
            notifications.show({
              title: 'Only a few spots left!',
              message: `${data.spotsRemaining} spots remaining.`,
              color: 'yellow',
            });
          }
        } catch (err) {
          console.error('Failed to parse RSVP update', err);
        }
      });

      es.addEventListener('waitlist-update', (e) => {
        try {
          const data: SseEventData = JSON.parse(e.data);
          // Invalidate event cache
          queryClient.invalidateQueries({ queryKey: ['event', eventId] });
          // If the current user was promoted, show notification
          if (data.type === 'PROMOTED') {
            notifications.show({
              title: 'You were promoted from the waitlist!',
              message: 'You can now attend the event.',
              color: 'green',
            });
          }
        } catch (err) {
          console.error('Failed to parse waitlist update', err);
        }
      });

      es.addEventListener('event-cancelled', () => {
        try {
          // Invalidate event cache
          queryClient.invalidateQueries({ queryKey: ['event', eventId] });
          notifications.show({
            title: 'Event Cancelled',
            message: 'This event has been cancelled by the host.',
            color: 'red',
          });
        } catch (err) {
          console.error('Failed to parse cancellation', err);
        }
      });

      es.onerror = (err) => {
        console.error('SSE error:', err);
        setIsConnected(false);
        es.close();
        // Reconnect after 5 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      eventSourceRef.current = es;
    };

    connect();

    // Cleanup on unmount or eventId change
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setIsConnected(false);
    };
  }, [eventId, queryClient]);

  return { isConnected };
}