# Campus Event App — Frontend ↔ Backend Integration Guide

> **Version**: 2.0 — Enhanced with frontend implementation patterns  
> **Target**: Frontend developer (React + Vite SPA + React Query)  
> **Base URL**: `http://localhost:8081` (dev) / production TBD  
> **Last Updated**: 2026-05-17

---

## Table of Contents

1. [Overview](#1-overview)
2. [Environment Setup](#2-environment-setup)
3. [Authentication & Token Management](#3-authentication--token-management)
4. [API Client Setup (Axios)](#4-api-client-setup-axios)
5. [React Query Patterns](#5-react-query-patterns)
6. [Standard Response & Error Handling](#6-standard-response--error-handling)
7. [Enums & Constants](#7-enums--constants)
8. [Form Validation Rules](#8-form-validation-rules)
9. [API Endpoints Reference](#9-api-endpoints-reference)
10. [UI State Machines](#10-ui-state-machines)
11. [Routing & Navigation Guards](#11-routing--navigation-guards)
12. [File Upload Reference](#12-file-upload-reference)
13. [Rate Limiting](#13-rate-limiting)
14. [PWA & Offline Strategy](#14-pwa--offline-strategy)
15. [Security Checklist](#15-security-checklist)
16. [Performance Guidelines](#16-performance-guidelines)
17. [Testing & Mocking](#17-testing--mocking)
18. [Quick Reference Tables](#18-quick-reference-tables)

---

## 1. Overview

This document is the **single source of truth** for every network call the frontend must make. It covers:

- **Authentication flow** (JWT access + refresh tokens, logout blacklist)
- **Every endpoint** with method, path, auth requirements, request body shape, and response shape
- **Frontend implementation patterns** (React Query, Axios interceptors, form validation)
- **UI state machines** (event cards, RSVP buttons, admin views)
- **Routing guards** (auth, role, trust level)
- **File upload rules** (avatars, event images/videos)
- **PWA offline strategy**
- **Security & performance guidelines**

The frontend talks **exclusively** to `backend-main`. The `backend-asta` service is an internal MQTT satellite (AStA official events + admin alerts) and has no public REST surface for the SPA.

---

## 2. Environment Setup

### 2.1 Vite Environment Variables

Create `.env` and `.env.production` in `frontend/`:

```bash
# .env (development)
VITE_API_BASE_URL=http://localhost:8081
VITE_APP_NAME=MyStudyApp
VITE_MAX_IMAGE_SIZE=5242880        # 5MB in bytes
VITE_MAX_VIDEO_SIZE=20971520       # 20MB in bytes
VITE_MAX_IMAGES_PER_EVENT=5
VITE_MAX_VIDEOS_PER_EVENT=2
```

```bash
# .env.production
VITE_API_BASE_URL=https://api.mystudyapp.de
# ...same limits
```

**Access in code**: `import.meta.env.VITE_API_BASE_URL`

> ⚠️ Only variables prefixed with `VITE_` are exposed to the client bundle. Never prefix secrets with `VITE_`.

### 2.2 CORS & Credentials

The backend expects:

- `withCredentials: true` on every Axios call
- `Authorization: Bearer <accessToken>` header on all authenticated calls
- `X-Refresh-Token: <refreshToken>` header on token refresh only

**Exposed headers** the frontend can read:
- `Authorization`
- `X-Refresh-Token`

**Allowed origins**: `http://localhost:5173` (dev) and production frontend URL.

---

## 3. Authentication & Token Management

### 3.1 Token Lifecycle

| Token | Storage | Lifetime | Purpose |
|-------|---------|----------|---------|
| **Access Token** | Memory (React state / Zustand) | 15 min (`900` sec) | Authenticate every API call |
| **Refresh Token** | `httpOnly` cookie OR secure storage | 7 days | Obtain a new access token |

**Why memory for access token?** Prevents XSS theft. If user refreshes page, re-authenticate via refresh token.

### 3.2 Token Refresh Flow

```
1. Any API call with expired access token → 401 response
2. Interceptor catches 401 → checks if refresh token exists
3. POST /api/auth/refresh with X-Refresh-Token header
4. Backend returns NEW access + refresh token pair
5. Store new tokens, retry original request
6. If refresh fails → logout user, redirect to /login
```

**Critical**: The backend **blacklists the old refresh token** on refresh. Always replace both tokens.

### 3.3 Flagged Account Handling

If the backend returns `403` with message containing "flagged":

```javascript
// Global error handler pattern
if (error.response?.status === 403 && 
    error.response?.data?.message?.includes('flagged')) {
  // Clear all auth state
  authStore.logout();
  // Redirect to login with error message
  navigate('/login', { state: { error: 'Account flagged. Contact support.' } });
}
```

### 3.4 Role & Trust Level

Every `UserDto` contains:

```typescript
interface UserDto {
  role: 'STUDENT' | 'ADMIN';
  trustLevel: 'NEW' | 'TRUSTED_HOST' | 'FLAGGED';
}
```

**Role** gates admin UI (`ADMIN` only).  
**Trust Level** gates event creation auto-publish vs. manual review.

| Trust Level | Event Creation | Can Host? |
|-------------|----------------|-----------|
| `NEW` | Goes to `UNDER_REVIEW` | Yes (pending approval) |
| `TRUSTED_HOST` | Goes straight to `PUBLISHED` | Yes (instant) |
| `FLAGGED` | Login blocked | No |

---

## 4. API Client Setup (Axios)

### 4.1 Axios Instance Configuration

```typescript
// src/lib/axios.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { queryClient } from '@/lib/queryClient';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle token refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete, then retry
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
          {},
          { headers: { 'X-Refresh-Token': refreshToken } }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        onTokenRefreshed(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 flagged account
    if (error.response?.status === 403 && 
        error.response?.data?.message?.includes('flagged')) {
      useAuthStore.getState().logout();
      window.location.href = '/login?flagged=true';
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 4.2 Auth Store (Zustand Pattern)

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserDto | null;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: UserDto) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      setUser: (user) => set({ user }),
      logout: () => {
        set({ accessToken: null, refreshToken: null, user: null });
        // Also call backend logout to blacklist token
        api.post('/api/auth/logout').catch(() => {});
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ refreshToken: state.refreshToken }), // Only persist refresh token
    }
  )
);
```

> ⚠️ **Security Note**: Never persist `accessToken` to localStorage. Store it in memory only. The refresh token can be persisted (or better, use httpOnly cookies if backend supports it).

---

## 5. React Query Patterns

### 5.1 Query Keys Convention

```typescript
// src/constants/queryKeys.ts
export const queryKeys = {
  auth: {
    me: ['auth', 'me'],
    trustStatus: ['auth', 'trustStatus'],
  },
  events: {
    all: (filters: EventFilters) => ['events', 'list', filters],
    detail: (id: string) => ['events', 'detail', id],
    my: (page: number) => ['events', 'my', page],
    pending: ['events', 'pending'],
  },
  rsvps: {
    mine: ['rsvps', 'me'],
    byEvent: (id: string) => ['rsvps', 'event', id],
    myForEvent: (id: string) => ['rsvps', 'event', id, 'me'],
  },
  reviews: {
    byEvent: (id: string) => ['reviews', 'event', id],
    byHost: (id: string) => ['reviews', 'host', id],
  },
  reports: {
    all: (filters: ReportFilters) => ['reports', 'list', filters],
    byStatus: (status: ReportStatus) => ['reports', 'status', status],
  },
  categories: ['categories'],
  users: {
    profile: (id: string) => ['users', 'public', id],
    adminList: (filters: UserFilters) => ['admin', 'users', filters],
  },
};
```

### 5.2 Mutation Invalidation Rules

| Mutation | Invalidate These Query Keys | Why |
|----------|----------------------------|-----|
| `createEvent` | `['events', 'list']`, `['events', 'my']` | New event appears in feeds |
| `updateEvent` | `['events', 'detail', id]`, `['events', 'list']` | Detail view stale |
| `cancelEvent` | `['events', 'detail', id]`, `['events', 'my']` | Status changed |
| `deleteEvent` | `['events', 'list']`, `['events', 'my']`, `['events', 'detail', id]` | Remove from all lists |
| `createRsvp` | `['rsvps', 'event', id]`, `['rsvps', 'me']`, `['events', 'detail', id]` | Update RSVP status, count |
| `cancelRsvp` | `['rsvps', 'event', id]`, `['rsvps', 'me']`, `['events', 'detail', id]` | Same + trigger waitlist |
| `createReview` | `['reviews', 'event', id]`, `['reviews', 'host', id]` | New review appears |
| `deleteReview` | `['reviews', 'event', id]`, `['reviews', 'host', id]` | Review removed |
| `createReport` | `['reports', 'list']` | New report in admin queue |
| `resolveReport` | `['reports', 'list']`, `['reports', 'status', 'OPEN']` | Status changed |
| `updateProfile` | `['auth', 'me']` | User data changed |
| `uploadMedia` | `['events', 'detail', id]` | Media list updated |
| `deleteMedia` | `['events', 'detail', id]` | Media removed |

### 5.3 Infinite Scroll Pattern (Events Feed)

```typescript
// src/hooks/useInfiniteEvents.ts
import { useInfiniteQuery } from '@tanstack/react-query';

export function useInfiniteEvents(filters: EventFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.events.all(filters),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await api.get('/api/events', {
        params: { ...filters, page: pageParam, size: 20 },
      });
      return response.data.data; // PageResponse<EventDto>
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.page + 1;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Usage in component
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteEvents({
  categoryId: selectedCategory,
  q: searchQuery,
});

// Flatten pages for rendering
const events = data?.pages.flatMap((page) => page.content) ?? [];
```

### 5.4 Optimistic Updates (RSVP)

```typescript
// src/hooks/useRsvp.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateRsvp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => api.post(`/api/events/${eventId}/rsvps`),
    onMutate: async (eventId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.rsvps.myForEvent(eventId) });

      // Snapshot previous value
      const previousRsvp = queryClient.getQueryData(queryKeys.rsvps.myForEvent(eventId));

      // Optimistically update to GOING (or WAITLISTED if full)
      queryClient.setQueryData(queryKeys.rsvps.myForEvent(eventId), {
        data: { status: 'GOING' } // Optimistic
      });

      return { previousRsvp };
    },
    onError: (err, eventId, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.rsvps.myForEvent(eventId), context?.previousRsvp);
    },
    onSettled: (data, error, eventId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.rsvps.myForEvent(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
    },
  });
}
```

### 5.5 Cache Time Recommendations

| Data Type | staleTime | cacheTime | Rationale |
|-----------|-----------|-----------|-----------|
| User profile (`/me`) | 5 min | 10 min | Changes rarely |
| Event detail | 2 min | 5 min | RSVP count changes |
| Event list (feed) | 1 min | 3 min | High traffic, frequent updates |
| Categories | 30 min | 60 min | Almost static |
| Reviews | 3 min | 5 min | New reviews added |
| Admin reports | 30 sec | 1 min | Real-time monitoring |
| Public profile | 5 min | 10 min | Changes rarely |

---

## 6. Standard Response & Error Handling

### 6.1 Response Envelope

Every response body follows this envelope:

```json
{
  "success": true | false,
  "message": "Human-readable string",
  "data": <T> | null,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

- When `success === true`, `data` contains the payload.
- When `success === false`, `data` is usually `null` (or a validation error map for `400`).

### 6.2 Pagination Response

List endpoints return a **PageResponse** inside the `data` envelope:

```json
{
  "content": [ … ],
  "page": 0,
  "size": 20,
  "totalElements": 147,
  "totalPages": 8,
  "last": false
}
```

**Query params** to append:
- `page=0` (zero-based)
- `size=20` (max `100`, enforced by backend)
- `sort=startTime,asc` or `sort=createdAt,desc` (Spring Data format)

**Frontend pattern**: use `useInfiniteEvents` style pagination with `page` param and stop when `last === true`.

### 6.3 Error Matrix

| Status | Meaning | Frontend Action | Toast Message |
|--------|---------|-----------------|---------------|
| `400` | Bad Request / Validation | Show field errors (see §6.4) | "Please check your input" |
| `401` | Unauthorized / Bad credentials | Redirect to login | "Session expired. Please log in again." |
| `403` | Forbidden / Flagged / Access denied | Show "Access denied" toast; if flagged, logout | "Access denied" / "Account flagged" |
| `404` | Resource not found | Show 404 page | "Not found" |
| `409` | Conflict (capacity full, duplicate, etc.) | Show contextual message | "Event is full" / "Already registered" |
| `413` | Payload Too Large (file) | Tell user to compress image/video | "File too large" |
| `429` | Too Many Requests | Show "Slow down" message | "Too many attempts. Please wait." |
| `500` | Server error | Generic retry message | "Something went wrong. Please try again." |

### 6.4 Validation Errors (`400`)

For `MethodArgumentNotValidException`, the backend returns:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "title": "Title must be between 3 and 100 characters",
    "maxCapacity": "Capacity must be at least 1"
  }
}
```

**Map `data` keys directly to form field errors.**

```typescript
// Form error mapping helper
function mapValidationErrors(error: ApiError): Record<string, string> {
  if (error.response?.status === 400 && error.response?.data?.data) {
    return error.response.data.data;
  }
  return {};
}

// Usage with React Hook Form
const { setError } = useForm();

onError: (error) => {
  const fieldErrors = mapValidationErrors(error);
  Object.entries(fieldErrors).forEach(([field, message]) => {
    setError(field, { type: 'manual', message });
  });
}
```

### 6.5 Global Error Handler (Toast System)

```typescript
// src/hooks/useToast.ts
import { useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';

export function useApiError() {
  const addToast = useUIStore((state) => state.addToast);

  return useCallback((error: any) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'An unexpected error occurred';

    switch (status) {
      case 401:
        addToast({ type: 'error', message: 'Session expired. Please log in again.' });
        break;
      case 403:
        if (message.includes('flagged')) {
          addToast({ type: 'error', message: 'Account flagged. Contact support.' });
        } else {
          addToast({ type: 'error', message: 'Access denied' });
        }
        break;
      case 409:
        addToast({ type: 'warning', message });
        break;
      case 429:
        addToast({ type: 'warning', message: 'Too many attempts. Please wait a moment.' });
        break;
      default:
        addToast({ type: 'error', message });
    }
  }, [addToast]);
}
```

---

## 7. Enums & Constants

Mirror these exactly in `src/constants/enums.js`:

```typescript
export enum Role {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

export enum TrustLevel {
  NEW = 'NEW',
  TRUSTED_HOST = 'TRUSTED_HOST',
  FLAGGED = 'FLAGGED',
}

export enum EventStatus {
  PUBLISHED = 'PUBLISHED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum RsvpStatus {
  GOING = 'GOING',
  WAITLISTED = 'WAITLISTED',
  CANCELLED = 'CANCELLED',
  ATTENDED = 'ATTENDED',
}

export enum ReportReason {
  SPAM = 'SPAM',
  INAPPROPRIATE = 'INAPPROPRIATE',
  FAKE_EVENT = 'FAKE_EVENT',
  OTHER = 'OTHER',
}

export enum ReportStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}
```

---

## 8. Form Validation Rules

### 8.1 Registration Form

```typescript
// src/utils/validators.ts
export const registrationSchema = z.object({
  universityEmail: z
    .string()
    .email('Invalid email format')
    .regex(
      /^(?!.*@(gmx|web|gmail|yahoo|hotmail|outlook|icloud|posteo|mailbox)\.(de|com|net|org)$)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(de|edu)$/,
      'Must be a valid university email (e.g., @stud.fh-dortmund.de)'
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must not exceed 50 characters'),
});
```

### 8.2 Event Creation Form

```typescript
export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must not exceed 100 characters'),
  description: z.string().max(2000, 'Description must not exceed 2000 characters').optional(),
  location: z.string().min(1, 'Location is required').max(200, 'Location must not exceed 200 characters'),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  maxCapacity: z.number().min(1, 'Capacity must be at least 1'),
  categoryIds: z.array(z.number()).optional(),
}).refine((data) => {
  return new Date(data.endTime) > new Date(data.startTime);
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
}).refine((data) => {
  return new Date(data.startTime) > new Date();
}, {
  message: 'Cannot create events in the past',
  path: ['startTime'],
});
```

### 8.3 Review Form

```typescript
export const createReviewSchema = z.object({
  eventId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000, 'Comment must not exceed 1000 characters').optional(),
});
```

### 8.4 Report Form

```typescript
export const createReportSchema = z.object({
  eventId: z.string().uuid(),
  reason: z.nativeEnum(ReportReason),
  details: z.string().max(2000, 'Details must not exceed 2000 characters').optional(),
});
```

### 8.5 Password Change Form

```typescript
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

---

## 9. API Endpoints Reference

### 9.1 Auth & Identity (`/api/auth`)

#### `POST /api/auth/register`
- **Auth**: Public
- **Body** (`RegisterRequest`):
  ```json
  {
    "universityEmail": "s12345@stud.fh-dortmund.de",
    "password": "Str0ng!Pass",
    "displayName": "Alex"
  }
  ```
- **Response**: `ApiResponse<AuthResponse>` — **no tokens yet** (account must be verified first).

#### `POST /api/auth/login`
- **Auth**: Public
- **Body** (`LoginRequest`):
  ```json
  {
    "universityEmail": "s12345@stud.fh-dortmund.de",
    "password": "Str0ng!Pass"
  }
  ```
- **Response**: `ApiResponse<AuthResponse>`
  ```json
  {
    "accessToken": "eyJ…",
    "refreshToken": "eyJ…",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": { …UserDto… }
  }
  ```
- **Errors**: `401` (BadCredentials), `403` (DisabledException — not verified), `403` (LockedException — flagged).

#### `POST /api/auth/refresh`
- **Auth**: Public (but send refresh token)
- **Headers**: `X-Refresh-Token: <refreshToken>`
- **Response**: New `ApiResponse<AuthResponse>` with fresh tokens.
- **Note**: Old refresh token is blacklisted. Always replace stored tokens with the new pair.

#### `POST /api/auth/logout`
- **Auth**: Bearer token
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response**: `ApiResponse<void>` success message.
- **Action**: Blacklists token. Clear frontend storage.

#### `GET /api/auth/verify?token=<token>`
- **Auth**: Public (email link)
- **Response**: `ApiResponse<void>` — "Account verified. You can now log in."

#### `POST /api/auth/resend-verification`
- **Auth**: Public
- **Body**: `{ "universityEmail": "…" }`
- **Response**: Generic success (always returns 200 to prevent email enumeration).

#### `POST /api/auth/forgot-password`
- **Auth**: Public
- **Body**: `{ "universityEmail": "…" }`
- **Response**: Generic success.

#### `POST /api/auth/reset-password`
- **Auth**: Public
- **Body** (`ResetPasswordRequest`):
  ```json
  {
    "token": "uuid-token-from-email",
    "newPassword": "Str0ng!Pass",
    "confirmPassword": "Str0ng!Pass"
  }
  ```
- **Response**: `ApiResponse<void>`

---

### 9.2 Current User (`/api/auth/me`)

All require `Authorization: Bearer <token>`.

#### `GET /api/auth/me`
- **Response**: `ApiResponse<UserDto>`

```typescript
interface UserDto {
  id: string;               // UUID
  universityEmail: string;
  displayName: string;
  bio: string | null;
  profileImageUrl: string | null;   // e.g. "/uploads/avatars/avatar_xxx.jpg"
  role: Role;
  trustLevel: TrustLevel;
  createdAt: string;        // ISO-8601 instant
}
```

#### `PUT /api/auth/me`
- **Content-Type**: `multipart/form-data`
- **Auth**: Bearer
- **Fields**:
  - `displayName` (optional, 2–50)
  - `bio` (optional, max 500)
  - `profileImage` (optional, file)
- **Response**: `ApiResponse<UserDto>` with updated profile.
- **Note**: If `profileImage` is provided, the old avatar is deleted and replaced.

#### `PUT /api/auth/me/password`
- **Body** (`ChangePasswordRequest`):
  ```json
  {
    "currentPassword": "…",
    "newPassword": "Str0ng!Pass",
    "confirmPassword": "Str0ng!Pass"
  }
  ```
- **Response**: `ApiResponse<void>`

#### `DELETE /api/auth/me`
- **Headers**: `Authorization: Bearer <token>` (used to blacklist)
- **Response**: `ApiResponse<void>`
- **Action**: Deletes account, all hosted events, RSVPs, reviews, reports, tokens, and files.

#### `GET /api/auth/me/trust-status`
- **Response**: `ApiResponse<TrustQualificationStatus>`
  ```json
  {
    "completedEventsWithReviews": 2,
    "minimumEventsRequired": 3,
    "averageRating": 4.5,
    "minimumRatingRequired": 4.0,
    "meetsEventCount": false,
    "meetsRatingThreshold": true,
    "qualifies": false
  }
  ```

---

### 9.3 Public Profiles (`/api/public/users`)

#### `GET /api/public/users/{userId}`
- **Auth**: None
- **Response**: `ApiResponse<PublicProfileDto>`
  ```typescript
  interface PublicProfileDto {
    id: string;
    displayName: string;
    bio: string | null;
    profileImageUrl: string | null;
    trustLevel: TrustLevel;
    createdAt: string;
    completedEventsWithReviews: number;
    averageHostRating: number;
  }
  ```

---

### 9.4 Events (`/api/events`)

#### `POST /api/events`
- **Auth**: Bearer (any authenticated user)
- **Body** (`CreateEventRequest`):
  ```json
  {
    "title": "Campus Party",
    "description": "…",
    "location": "Campusplatz",
    "startTime": "2025-06-15T18:00:00Z",
    "endTime": "2025-06-15T22:00:00Z",
    "maxCapacity": 100,
    "categoryIds": [1, 3]
  }
  ```
- **Response**: `ApiResponse<EventDto>` — status will be `PUBLISHED` or `UNDER_REVIEW` depending on trust level.

#### `GET /api/events/{eventId}`
- **Auth**: Bearer
- **Response**: `ApiResponse<EventDto>`

#### `GET /api/events`
- **Auth**: Bearer
- **Query params** (all optional):
  - `categoryId` (integer)
  - `dateFrom` (ISO instant)
  - `dateTo` (ISO instant)
  - `location` (string — partial match, case-insensitive)
  - `q` (string — searches `title` and `description`, case-insensitive)
  - Standard pagination: `page`, `size`, `sort`
- **Response**: `ApiResponse<PageResponse<EventDto>>`
- **Note**: Only returns events with `status === PUBLISHED`.

#### `GET /api/events/my-events`
- **Auth**: Bearer
- **Query**: pagination
- **Response**: `ApiResponse<PageResponse<EventDto>>` — events where `isHost === true`.

#### `PUT /api/events/{eventId}`
- **Auth**: Bearer + must be host
- **Body**: same as `CreateEventRequest`
- **Constraints**:
  - Cannot update a `CANCELLED` event
  - Cannot reduce `maxCapacity` below `currentRsvpCount`
  - Cannot move `startTime` into the past
- **Response**: `ApiResponse<EventDto>`

#### `PATCH /api/events/{eventId}/cancel`
- **Auth**: Bearer + must be host
- **Response**: `ApiResponse<EventDto>` (status becomes `CANCELLED`)

#### `DELETE /api/events/{eventId}`
- **Auth**: Bearer + must be host **or** `ADMIN`
- **Response**: `ApiResponse<void>`
- **Action**: Cascading delete — removes media files, RSVPs, reviews, reports.

#### `POST /api/events/{eventId}/media`
- **Auth**: Bearer + must be host
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `images` — array of files (max 5 total per event)
  - `videos` — array of files (max 2 total per event)
- **File rules**:
  - Images: `jpg|jpeg|png|webp`, max 5 MB each
  - Videos: `mp4|webm|mov|quicktime`, max 20 MB each
- **Response**: `ApiResponse<EventDto>` (updated media list)

#### `DELETE /api/events/{eventId}/media/{mediaId}`
- **Auth**: Bearer + must be host
- **Response**: `ApiResponse<EventDto>`

---

### 9.5 Event DTO Deep Dive

```typescript
interface EventDto {
  id: string;                       // UUID
  host: UserDto;
  title: string;
  description: string | null;
  location: string;
  startTime: string;                // ISO instant
  endTime: string;
  maxCapacity: number;
  currentRsvpCount: number;
  status: EventStatus;
  categories: CategoryDto[];
  media: EventMediaDto[];
  createdAt: string;
  isHost: boolean;                  // true if current user is the host
  myRsvpStatus: RsvpStatus | null;  // null if not registered
}

interface CategoryDto {
  id: number;
  name: string;
}

interface EventMediaDto {
  id: string;       // UUID
  url: string;      // e.g. "/uploads/events/{eventId}/images/{uuid}.jpg"
  mediaType: MediaType;
  filename: string;
}
```

**Media URL resolution**: prepend the backend base URL to `url` for `<img src>` or `<video src>`.

---

### 9.6 Categories (`/api/public/categories`)

#### `GET /api/public/categories`
- **Auth**: None
- **Response**: `ApiResponse<CategoryDto[]>`

---

### 9.7 RSVPs (`/api/events/…/rsvps`, `/api/rsvps`)

#### `POST /api/events/{eventId}/rsvps`
- **Auth**: Bearer
- **Business rules**:
  - Event must be `PUBLISHED` and not ended
  - One RSVP per user per event
  - If capacity available → `GOING`
  - If full → `WAITLISTED`
  - If previously `CANCELLED` → reactivates to `GOING` or `WAITLISTED`
- **Response**: `ApiResponse<RsvpDto>`

#### `GET /api/events/{eventId}/rsvps/me`
- **Auth**: Bearer
- **Response**: `ApiResponse<RsvpDto>` or `404` if none

#### `GET /api/rsvps/me`
- **Auth**: Bearer
- **Query**: pagination
- **Response**: `ApiResponse<PageResponse<RsvpDto>>`

#### `PATCH /api/rsvps/{rsvpId}/cancel`
- **Auth**: Bearer (must own the RSVP)
- **Response**: `ApiResponse<RsvpDto>` (status → `CANCELLED`)
- **Side effect**: If the cancelled RSVP was `GOING`, the next `WAITLISTED` user is **automatically promoted** to `GOING`.

#### `GET /api/rsvps/{rsvpId}/position`
- **Auth**: Bearer (must own)
- **Response**: `ApiResponse<number>` — waitlist position (1-based). Returns `0` if not waitlisted.

#### `GET /api/events/{eventId}/rsvps`
- **Auth**: Bearer + must be host
- **Query**: pagination
- **Response**: `ApiResponse<PageResponse<RsvpDto>>`

#### `GET /api/events/{eventId}/rsvps/status/{status}`
- **Auth**: Bearer + must be host
- **Path**: `status` is `GOING`, `WAITLISTED`, `CANCELLED`, or `ATTENDED`
- **Response**: `ApiResponse<PageResponse<RsvpDto>>`

#### `PATCH /api/events/{eventId}/rsvps/{rsvpId}/attended`
- **Auth**: Bearer + must be host
- **Business rule**: Only `GOING` RSVPs can be marked attended
- **Response**: `ApiResponse<RsvpDto>` (status → `ATTENDED`)

```typescript
interface RsvpDto {
  id: string;
  eventId: string;
  eventTitle: string;
  user: UserDto;
  status: RsvpStatus;
  createdAt: string;
}
```

---

### 9.8 Reviews (`/api/reviews`)

#### `POST /api/reviews`
- **Auth**: Bearer
- **Body** (`CreateReviewRequest`):
  ```json
  {
    "eventId": "uuid",
    "rating": 5,
    "comment": "Great event!"
  }
  ```
  - `rating`: 1–5 integer
  - `comment`: optional, max 1000
- **Business rules**:
  - Event must have ended (`endTime` in the past)
  - User must have RSVP status `ATTENDED`
  - One review per user per event
- **Response**: `ApiResponse<ReviewDto>`
- **Side effect**: May auto-promote host to `TRUSTED_HOST` if they now meet criteria.

#### `GET /api/reviews/event/{eventId}`
- **Auth**: Bearer
- **Query**: pagination
- **Response**: `ApiResponse<PageResponse<ReviewDto>>`

#### `GET /api/reviews/host/{hostId}`
- **Auth**: Bearer
- **Query**: pagination
- **Response**: `ApiResponse<PageResponse<ReviewDto>>`

#### `DELETE /api/reviews/{reviewId}`
- **Auth**: Bearer (reviewer or `ADMIN`)
- **Response**: `ApiResponse<void>`

```typescript
interface ReviewDto {
  id: string;
  eventId: string;
  reviewer: UserDto;
  rating: number;
  comment: string | null;
  createdAt: string;
}
```

---

### 9.9 Reports (`/api/reports`)

#### `POST /api/reports`
- **Auth**: Bearer
- **Body** (`CreateReportRequest`):
  ```json
  {
    "eventId": "uuid",
    "reason": "INAPPROPRIATE",
    "details": "Offensive content in description"
  }
  ```
  - `reason`: `SPAM`, `INAPPROPRIATE`, `FAKE_EVENT`, `OTHER`
  - `details`: optional, max 2000
- **Business rule**: Cannot report your own event
- **Response**: `ApiResponse<ReportDto>`
- **Side effect**: `INAPPROPRIATE` and `FAKE_EVENT` trigger an MQTT alert to the AStA backend (admins get real-time notifications elsewhere).

```typescript
interface ReportDto {
  id: string;
  eventId: string;
  eventTitle: string;
  reporter: UserDto;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  createdAt: string;
}
```

---

## 10. UI State Machines

### 10.1 Event Card States

```
Event Status → Visual Treatment → Actions Available

PUBLISHED    → Normal card       → RSVP button, View details, Share
UNDER_REVIEW → Yellow badge      → Host: Edit, Cancel; Others: Hidden from feed
CANCELLED    → Greyed out        → No actions, show "Cancelled" badge
COMPLETED    → Archive style     → Reviews enabled, RSVP disabled
```

**Feed visibility rules**:
- Public feed (`GET /api/events`): Only `PUBLISHED`
- My events (`GET /api/events/my-events`): All statuses
- Admin queue: `UNDER_REVIEW`

### 10.2 RSVP Button States

Based on `myRsvpStatus`:

| `myRsvpStatus` | Button Text | Action | Color |
|----------------|-------------|--------|-------|
| `null` (not registered) | "RSVP" | `POST /rsvps` | Primary |
| `GOING` | "Going ✓" | `PATCH /cancel` | Success |
| `WAITLISTED` | "Waitlisted (#3)" | `PATCH /cancel` | Warning |
| `CANCELLED` | "RSVP Again" | `POST /rsvps` | Primary |
| `ATTENDED` | "Attended" | Disabled | Success |

**Capacity indicator**:
```
{currentRsvpCount} / {maxCapacity} spots filled
Show waitlist badge when currentRsvpCount >= maxCapacity
```

### 10.3 Host vs Participant View

| Feature | Host View | Participant View |
|---------|-----------|------------------|
| Edit event | ✅ | ❌ |
| Cancel event | ✅ | ❌ |
| Upload media | ✅ | ❌ |
| Delete media | ✅ | ❌ |
| Mark attendance | ✅ | ❌ |
| View RSVPs | ✅ (full list) | ❌ (only own) |
| Cancel own RSVP | ❌ | ✅ |
| Leave review | ❌ (can't review own) | ✅ (if ATTENDED) |

### 10.4 Admin Badge / Action Visibility

Show admin UI elements only when `user.role === 'ADMIN'`:

- Admin dashboard link in navbar
- Approve/Reject buttons on `UNDER_REVIEW` events
- Flag user button on profiles
- Report resolution panel
- User management table

---

## 11. Routing & Navigation Guards

### 11.1 Route Protection Matrix

| Route | Auth Required | Role Required | Additional Checks |
|-------|--------------|---------------|-------------------|
| `/` (Home) | ❌ | — | — |
| `/events` | ✅ | — | — |
| `/events/:id` | ✅ | — | — |
| `/events/create` | ✅ | — | TrustLevel !== FLAGGED |
| `/events/:id/edit` | ✅ | — | Must be host |
| `/profile` | ✅ | — | — |
| `/profile/:id` | ❌ | — | — |
| `/admin` | ✅ | ADMIN | — |
| `/admin/events` | ✅ | ADMIN | — |
| `/admin/reports` | ✅ | ADMIN | — |
| `/admin/users` | ✅ | ADMIN | — |
| `/login` | ❌ | — | Redirect to home if authenticated |
| `/register` | ❌ | — | Redirect to home if authenticated |
| `/verify-email` | ❌ | — | — |
| `/reset-password` | ❌ | — | — |

### 11.2 Navigation Guard Implementation

```typescript
// src/router/guards.ts
import { useAuthStore } from '@/stores/authStore';

export function requireAuth() {
  const { accessToken } = useAuthStore.getState();
  if (!accessToken) {
    return '/login?redirect=' + encodeURIComponent(window.location.pathname);
  }
  return true;
}

export function requireAdmin() {
  const { user } = useAuthStore.getState();
  if (!user || user.role !== 'ADMIN') {
    return '/403';
  }
  return true;
}

export function requireHost(eventId: string) {
  // Check if current user is host of this event
  // Use React Query to fetch event detail and check isHost
}

export function redirectIfAuthenticated() {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    return '/';
  }
  return true;
}
```

### 11.3 Redirect Rules

| Condition | Redirect To | Message |
|-----------|-------------|---------|
| Unverified email on login | `/verify-pending` | "Please verify your email" |
| Flagged account detected | `/login` | "Account flagged. Contact support." |
| Non-admin accessing admin route | `/403` | "Access denied" |
| Non-host editing event | `/events/:id` | "Only the host can edit" |

---

## 12. File Upload Reference

### 12.1 Avatars
- **Endpoint**: `PUT /api/auth/me`
- **Field name**: `profileImage`
- **Types**: `jpg`, `jpeg`, `png`, `webp`
- **Max size**: 5 MB
- **URL format**: `/uploads/avatars/avatar_{userId}.{ext}`

### 12.2 Event Media
- **Endpoint**: `POST /api/events/{eventId}/media`
- **Field names**: `images` (array), `videos` (array)
- **Limits**: max 5 images + max 2 videos per event (cumulative across uploads)
- **Image rules**: `jpg|jpeg|png|webp`, max 5 MB each
- **Video rules**: `mp4|webm|mov|quicktime`, max 20 MB each
- **URL format**:
  - Images: `/uploads/events/{eventId}/images/{uuid}.{ext}`
  - Videos: `/uploads/events/{eventId}/videos/{uuid}.{ext}`

### 12.3 Frontend Upload Component Pattern

```typescript
// src/components/EventMediaUpload.tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 20 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

function validateFiles(images: File[], videos: File[], existingMedia: EventMediaDto[]) {
  const existingImages = existingMedia.filter(m => m.mediaType === 'IMAGE').length;
  const existingVideos = existingMedia.filter(m => m.mediaType === 'VIDEO').length;

  if (images.length + existingImages > 5) {
    return 'Maximum 5 images allowed per event';
  }
  if (videos.length + existingVideos > 2) {
    return 'Maximum 2 videos allowed per event';
  }

  for (const img of images) {
    if (!ALLOWED_IMAGE_TYPES.includes(img.type)) {
      return `Invalid image type: ${img.name}. Use JPG, PNG, or WEBP.`;
    }
    if (img.size > MAX_IMAGE_SIZE) {
      return `Image too large: ${img.name}. Max 5MB.`;
    }
  }

  for (const vid of videos) {
    if (!ALLOWED_VIDEO_TYPES.includes(vid.type)) {
      return `Invalid video type: ${vid.name}. Use MP4, WEBM, or MOV.`;
    }
    if (vid.size > MAX_VIDEO_SIZE) {
      return `Video too large: ${vid.name}. Max 20MB.`;
    }
  }

  return null;
}
```

### 12.4 Serving Files
Both avatars and event media are served statically from the backend base URL. No auth required for `GET /uploads/**`.

**Image optimization**: Use `loading="lazy"` and consider a thumbnail strategy (backend currently serves originals).

---

## 13. Rate Limiting

The backend enforces per-IP sliding-window rate limits:

| Endpoint Type | Max Requests | Window |
|---------------|--------------|--------|
| Auth (`/api/auth/**`) | 5 | 1 minute |
| Write (`POST|PUT|PATCH|DELETE` on `/api/reviews`, `/api/reports`, `/api/rsvps`, `/api/events`) | 20 | 1 minute |
| All `GET|HEAD|OPTIONS` | Unlimited | — |

**Error response** (`429`):
```json
{ "error": "Too many requests. Please try again later." }
```
*(Note: this one is NOT wrapped in `ApiResponse`; it is raw JSON from the filter.)*

**Frontend handling**: Show a persistent toast with countdown timer. Disable submit buttons during cooldown.

---

## 14. PWA & Offline Strategy

### 14.1 Service Worker Caching

```javascript
// public/service-worker.js (Workbox)
workbox.routing.registerRoute(
  ({url}) => url.pathname.startsWith('/uploads/'),
  new workbox.strategies.CacheFirst({
    cacheName: 'media-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache API responses for offline reading
workbox.routing.registerRoute(
  ({url}) => url.pathname.startsWith('/api/events'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'events-cache',
  })
);
```

### 14.2 Offline Behavior

| Feature | Online | Offline |
|---------|--------|---------|
| Browse events | Live API | Cached events (read-only) |
| View event detail | Live API | Cached detail |
| RSVP | Live mutation | Queue for background sync |
| Create event | Live mutation | Disabled, show offline message |
| Upload media | Live upload | Disabled |

### 14.3 Background Sync

```javascript
// Queue mutations for background sync
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.sync.register('rsvp-sync');
  });
}
```

---

## 15. Security Checklist

### 15.1 XSS Prevention

All user-generated content must be sanitized before rendering:

```typescript
// Use DOMPurify for HTML content
import DOMPurify from 'dompurify';

function EventDescription({ description }: { description: string }) {
  // If allowing rich text (Markdown), sanitize HTML output
  const cleanHtml = DOMPurify.sanitize(marked(description));
  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;

  // For plain text, just escape
  // return <p>{description}</p>;
}
```

**Fields requiring sanitization**: `event.description`, `review.comment`, `user.bio`, `report.details`.

### 15.2 Token Storage

| Token | Storage | Reason |
|-------|---------|--------|
| Access Token | Memory (Zustand/React state) | Prevents XSS theft |
| Refresh Token | httpOnly cookie (preferred) OR secure localStorage | Rotation capability |

**Never store access token in**:
- localStorage
- sessionStorage
- Cookies (unless httpOnly + secure + sameSite=strict)

### 15.3 CSRF Protection

JWT Bearer tokens are stateless, so CSRF is less of a concern. However:
- Always use `withCredentials: true` for cookie-based refresh tokens
- Ensure backend sets `SameSite=Strict` on cookies

### 15.4 File Upload Security

- Validate file types on client (defense in depth)
- Validate file sizes before upload (prevent 413 errors)
- Use `accept` attribute on file inputs: `accept="image/jpeg,image/png,image/webp"`

---

## 16. Performance Guidelines

### 16.1 Image Optimization

```typescript
// Lazy loading images
<img 
  src={`${API_BASE}${event.media[0].url}`}
  loading="lazy"
  alt={event.title}
  width={400}
  height={300}
/>

// Consider WebP conversion
// If backend doesn't convert, use a client-side library or CDN
```

### 16.2 Pagination

- Default page size: `20` (matches backend default)
- Max page size: `100` (backend enforced)
- Use infinite scroll for feeds, traditional pagination for admin tables

### 16.3 Debouncing

```typescript
// Search/filter debouncing
const [searchQuery, setSearchQuery] = useState('');
const debouncedQuery = useDebounce(searchQuery, 300);

useEffect(() => {
  refetch({ q: debouncedQuery });
}, [debouncedQuery]);
```

### 16.4 Bundle Optimization

- Lazy load admin routes: `const AdminDashboard = lazy(() => import('./AdminDashboard'))`
- Code-split by feature (events, auth, admin)
- Tree-shake unused icons from `icons.svg`

---

## 17. Testing & Mocking

### 17.1 MSW (Mock Service Worker) Setup

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/events', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        message: 'Events retrieved',
        data: {
          content: [mockEvent],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1,
          last: true,
        },
      })
    );
  }),

  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          tokenType: 'Bearer',
          expiresIn: 900,
          user: mockUser,
        },
      })
    );
  }),
];
```

### 17.2 Mock Data Factory

```typescript
// src/mocks/factories.ts
export const mockUser: UserDto = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  universityEmail: 's12345@stud.fh-dortmund.de',
  displayName: 'Alex Student',
  bio: 'Computer Science student',
  profileImageUrl: '/uploads/avatars/avatar_550e8400.jpg',
  role: 'STUDENT',
  trustLevel: 'TRUSTED_HOST',
  createdAt: '2024-01-15T10:00:00Z',
};

export const mockEvent: EventDto = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  host: mockUser,
  title: 'Campus Hackathon',
  description: '24-hour coding competition',
  location: 'Building 1, Room 101',
  startTime: '2025-06-15T09:00:00Z',
  endTime: '2025-06-16T09:00:00Z',
  maxCapacity: 50,
  currentRsvpCount: 32,
  status: 'PUBLISHED',
  categories: [{ id: 1, name: 'Technology' }],
  media: [],
  createdAt: '2025-01-10T08:00:00Z',
  isHost: false,
  myRsvpStatus: 'GOING',
};
```

### 17.3 Test Utilities

```typescript
// src/test-utils.tsx
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

export function render(ui: React.ReactElement) {
  const testQueryClient = createTestQueryClient();
  return rtlRender(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
}
```

---

## 18. Quick Reference Tables

### 18.1 HTTP Method Map

| Domain | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| **Auth** | `POST /register`, `/login` | `GET /me`, `/me/trust-status` | `PUT /me`, `/me/password` | `DELETE /me` |
| **Events** | `POST /api/events` | `GET /api/events`, `/{id}` | `PUT /api/events/{id}`, `PATCH …/cancel` | `DELETE /api/events/{id}` |
| **Event Media** | `POST /api/events/{id}/media` | — | — | `DELETE /api/events/{id}/media/{mediaId}` |
| **RSVPs** | `POST /api/events/{id}/rsvps` | `GET …/rsvps/me`, `/api/rsvps/me` | `PATCH /api/rsvps/{id}/cancel`, `PATCH …/attended` | — |
| **Reviews** | `POST /api/reviews` | `GET /api/reviews/event/{id}`, `/host/{id}` | — | `DELETE /api/reviews/{id}` |
| **Reports** | `POST /api/reports` | `GET /api/admin/reports/*` | `PATCH /api/admin/reports/{id}/resolve` | `DELETE /api/admin/reports/{id}` |
| **Categories** | `POST /api/admin/categories` | `GET /api/public/categories`, `/api/admin/categories` | `PUT /api/admin/categories/{id}` | `DELETE /api/admin/categories/{id}` |
| **Users** | — | `GET /api/public/users/{id}`, `/api/admin/users` | `PATCH /api/admin/users/{id}/trust-level`, `/flag`, `/promote` | `DELETE /api/admin/users/{id}` |

### 18.2 Status Code Quick Reference

| Code | When | Frontend Action |
|------|------|-----------------|
| `200` | Success | Process data |
| `201` | Created | Show success, redirect to detail |
| `400` | Validation | Map field errors |
| `401` | Unauthorized | Refresh token or redirect login |
| `403` | Forbidden | Logout if flagged, else show error |
| `404` | Not found | Show 404 page |
| `409` | Conflict | Show contextual message |
| `413` | Too large | Compress file |
| `429` | Rate limited | Show cooldown timer |
| `500` | Server error | Generic retry |

### 18.3 File Limits Summary

| Type | Max Size | Allowed Types | Max Count |
|------|----------|---------------|-----------|
| Avatar | 5 MB | JPG, PNG, WEBP | 1 per user |
| Event Image | 5 MB | JPG, PNG, WEBP | 5 per event |
| Event Video | 20 MB | MP4, WEBM, MOV | 2 per event |

---

*End of document. Keep this file in `frontend/docs/` or `frontend/src/api/` as the living contract between frontend and backend. Update when backend contracts change.*
