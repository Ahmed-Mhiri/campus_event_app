// src/constants/routes.ts

export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Events
  EVENTS: '/events',
  EVENT_DETAIL: (slug: string) => `/events/${slug}`,
  EVENT_DETAIL_BY_ID: (id: string) => `/events/detail/${id}`,
  CREATE_EVENT: '/events/create',
  EDIT_EVENT: (id: string) => `/events/edit/${id}`,
  MY_EVENTS: '/events/my',

  // Profile
  PROFILE: '/profile',                     // current user's own profile
  USER_PROFILE: (id: string) => `/profile/${id}`, // view other users
  EDIT_PROFILE: '/profile/edit',
  CHANGE_PASSWORD: '/profile/change-password',
  PREFERENCES: '/profile/preferences',
  TRUST_STATUS: '/profile/trust-status',

  // Registrations
  MY_REGISTRATIONS: '/registrations',

  // Check‑in
  HOST_CHECKIN: (eventId: string) => `/check-in/host/${eventId}`,
  ATTENDEE_CHECKIN: (eventId: string) => `/check-in/attendee/${eventId}`,

  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_EVENTS: '/admin/events',
  ADMIN_USERS: '/admin/users',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_REPORTS: '/admin/reports',
} as const;

export type RouteParams = {
  [K in keyof typeof ROUTES]: typeof ROUTES[K] extends (param: infer P) => string ? P : never;
};