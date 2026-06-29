// src/constants/queryKeys.ts
export const queryKeys = {
  events: 'events',
  event: (id: string) => ['event', id],
  featuredEvents: 'featured-events',
  categories: 'categories',
  rsvps: 'rsvps',
  notifications: 'notifications',
  trustStatus: 'trust-status',
  preferences: 'preferences',
} as const;