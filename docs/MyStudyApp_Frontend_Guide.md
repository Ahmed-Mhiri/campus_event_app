# 🚀 MyStudyApp Frontend Development Guide  
## Based 100% on the Official Backend Implementation

> **Version**: 2.0 | **Date**: 2026-07-14  
> **Backend**: Spring Boot (Java)
> **Base URL**: `http://localhost:8080`  
> **Auth**: JWT Bearer Token (access + refresh)  

---

## Table of Contents

1. [Introduction & Architecture](#1-introduction--architecture)  
2. [Authentication & Security](#2-authentication--security)  
3. [API Response Format](#3-api-response-format)  
4. [Error Handling & Rate Limiting](#4-error-handling--rate-limiting)  
5. [File Upload Rules](#5-file-upload-rules)  
6. [Real‑Time SSE](#6-real‑time-sse)  
7. [Module 1: Authentication](#module-1-authentication)  
8. [Module 2: User Profiles & Preferences](#module-2-user-profiles--preferences)  
9. [Module 3: Events](#module-3-events)  
10. [Module 4: RSVPs & Waitlist](#module-4-rsvps--waitlist)  
11. [Module 5: Reviews](#module-5-reviews)  
12. [Module 6: Reports (Moderation)](#module-6-reports-moderation)  
13. [Module 7: Notifications](#module-7-notifications)  
14. [Module 8: Search](#module-8-search)  
15. [Module 9: Admin Dashboard](#module-9-admin-dashboard)  
16. [Module 10: Public Pages](#module-10-public-pages)  
17. [TypeScript Types](#17-typescript-types)  
18. [UI/UX Guidelines](#18-uiux-guidelines)  
19. [Frontend State Management (Zustand)](#19-frontend-state-management-zustand)  
20. [Environment Variables](#20-environment-variables)  
21. [Development Checklist](#21-development-checklist)  

---

## 1. Introduction & Architecture

MyStudyApp is a campus event platform. The backend is a **Spring Boot** monolith with clear domain modules. The frontend consumes a REST API with JWT authentication and receives real‑time updates via **Server‑Sent Events (SSE)**.

**Key backend modules** (from `extracted_all_java.txt`):
- `common` – config, security, exceptions, response wrappers.
- `events` – event CRUD, categories, media, search, SSE.
- `identity` – auth, users, profiles, trust levels, preferences.
- `moderation` – reviews, reports, helpful votes.
- `notification` – in‑app notifications (event‑driven).
- `registration` – RSVPs, waitlist, check‑in.

**Communication patterns**:
- REST over HTTP with JSON payloads.
- Authentication: `Authorization: Bearer <accessToken>`.
- Real‑time: SSE on `/api/events/stream/{eventId}`.
- File upload: `multipart/form-data` for avatars and event media.
- Pagination: Spring `Pageable` (`page`, `size`, `sort`).

**CORS**: The backend allows credentials and exposes `Authorization` and `X-Refresh-Token` headers.  
Allowed origins: `http://localhost:5173`, `http://127.0.0.1:5173`, and `${app.frontend-url}`.

---

## 2. Authentication & Security

### JWT Token System

| Token Type | Duration | Storage | Usage |
|------------|----------|---------|-------|
| **Access Token** | 15 min (900 s) | Memory (store securely) | `Authorization: Bearer` |
| **Refresh Token** | 7 days (604800 s) | HttpOnly Cookie / secure storage | `X-Refresh-Token` header |

**Token Refresh Flow**:
1. Intercept 401 responses.
2. Call `POST /api/auth/refresh` with the refresh token.
3. On success, store new tokens and retry the failed request.
4. On failure, redirect to login.

### Account States & Trust Levels

| `TrustLevel` | Effect |
|--------------|--------|
| `NEW` | Events go to `UNDER_REVIEW` – need admin approval. |
| `TRUSTED_HOST` | Events auto‑publish (skip review). |
| `FLAGGED` | **Account locked** – login forbidden, tokens rejected. |

### Email Verification

- New accounts start with `isVerified = false`.
- Login is blocked until verification via `/api/auth/verify?token=...`.
- Resend via `/api/auth/resend-verification`.

---

## 3. API Response Format

All endpoints return a uniform envelope:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp: string; // ISO 8601
}
```

**Paginated responses** use `PageResponse<T>`:

```typescript
interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
```

**Pagination parameters** (Spring `Pageable`):
- `page` (default 0)
- `size` (default 20, max 100)
- `sort` (e.g., `startTime,desc`)

---

## 4. Error Handling & Rate Limiting

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `400` | Validation errors, malformed body, illegal argument |
| `401` | Invalid credentials, expired/invalid token |
| `403` | Access denied, account not verified, flagged, forbidden action |
| `404` | Resource not found |
| `409` | Capacity exceeded, duplicate constraint |
| `413` | File too large (returned as 400 with message) |
| `429` | Rate limited |
| `500` | Unexpected server error |

### Specific Error Messages (from `GlobalExceptionHandler`)

- `MethodArgumentNotValidException` → 400 with field‑error map.
- `BadCredentialsException` → 401.
- `AccessDeniedException` → 403 "Access denied".
- `LockedException` → 403 (flagged account).
- `DisabledException` → 403 "Account not verified".
- `ForbiddenActionException` → 403 with action + reason.
- `ResourceNotFoundException` → 404.
- `CapacityExceededException` → 409.
- `DataIntegrityViolationException` → 409 "Resource already exists".
- `MaxUploadSizeExceededException` → 400 "File size exceeds...".

### Rate Limiting (from `RateLimitingFilter`)

- **Auth endpoints** (`/api/auth/**`): 5 requests per minute.
- **Write endpoints** (POST/PUT/PATCH/DELETE to `/api/reviews`, `/api/reports`, `/api/rsvps`, `/api/events`): 20 per minute.
- **GET/HEAD/OPTIONS** are **not** rate‑limited.
- Exceeded → HTTP 429 with `ApiResponse` error.

---

## 5. File Upload Rules

### Avatars (`PUT /api/auth/me`, field `profileImage`)
- Allowed types: `jpg`, `jpeg`, `png`, `webp`
- Max size: **5 MB**
- Stored as `uploads/avatars/avatar_<userId>.<ext>`

### Event Media (`POST /api/events/{eventId}/media`)
- Fields: `images[]` and `videos[]`
- **Images**: max 5 per event, 5 MB each, types: `jpg/jpeg/png/webp`
- **Videos**: max 2 per event, 20 MB each, types: `mp4/webm/mov/quicktime`
- Auto‑generated thumbnails (400×300) and medium (800×600) for images.

**URL patterns**:
```
/uploads/avatars/avatar_{userId}.png
/uploads/events/{eventId}/images/{uuid}.jpg
/uploads/events/{eventId}/images/{uuid}_thumb.jpg
/uploads/events/{eventId}/images/{uuid}_medium.jpg
/uploads/events/{eventId}/videos/{uuid}.mp4
```

---

## 6. Real‑Time SSE

**Endpoint**: `GET /api/events/stream/{eventId}` (requires `?token=<accessToken>` since EventSource cannot set headers)

**Events**:

| Name | Payload | Trigger |
|------|---------|---------|
| `connected` | `{ eventId, status: "subscribed" }` | Connection established |
| `rsvp-update` | `{ eventId, currentCount, maxCapacity, spotsRemaining, isFull }` | RSVP created/cancelled |
| `waitlist-update` | `{ eventId, waitlistCount, type: "waitlist-update" }` | Waitlist promotion |
| `event-cancelled` | `{ eventId }` | Host cancels event |

**Timeout**: 5 min – client should auto‑reconnect.

---

## Module 1: Authentication

All auth endpoints are **public** (no token required).

### 1.1 Register

`POST /api/auth/register`

**Body** (`RegisterRequest`):
```typescript
{
  universityEmail: string; // must match university regex (see below)
  password: string;        // min 8, upper, lower, digit, special
  displayName: string;     // 2‑50 chars
}
```

**Email validation regex** (from `RegisterRequest`):
```
^(?!.*@(gmx|web|gmail|yahoo|hotmail|outlook|icloud|posteo|mailbox)\.(de|com|net|org)$)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(de|edu)$
```
→ Blocks common free providers; requires `.de` or `.edu`.

**Response**: `ApiResponse<AuthResponse>` with `data` **null** (user unverified → no tokens).

**UI**: Show success message, instruct user to check email.

---

### 1.2 Login

`POST /api/auth/login`

**Body** (`LoginRequest`):
```typescript
{
  universityEmail: string;
  password: string;
}
```

**Response**: `ApiResponse<AuthResponse>`
```typescript
{
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: 900;
  user: UserDto;
}
```

**Error handling**:
- 401 → "Invalid email or password"
- 403 → "Account not verified" or "Account flagged"

---

### 1.3 Refresh Token

`POST /api/auth/refresh`

**Headers**: `X-Refresh-Token: <refreshToken>`

**Response**: new `AuthResponse`.

**Notes**: Old refresh token is blacklisted immediately.

---

### 1.4 Logout

`POST /api/auth/logout`

**Headers**: `Authorization: Bearer <accessToken>`

**Response**: `ApiResponse<Void>`.

**UI**: Clear all tokens and redirect to login.

---

### 1.5 Email Verification

`GET /api/auth/verify?token={token}`

**Response**: `ApiResponse<Void>` on success; error otherwise.

**UI**: Show success then redirect to login.

---

### 1.6 Resend Verification

`POST /api/auth/resend-verification`

**Body**: `ForgotPasswordRequest` `{ universityEmail: string }`

**Response**: `ApiResponse<Void>` (always returns success to avoid user enumeration).

---

### 1.7 Forgot Password (Request Reset)

`POST /api/auth/forgot-password`

**Body**: `ForgotPasswordRequest`

**Response**: `ApiResponse<Void>` (always returns “If that email is registered…”).

---

### 1.8 Reset Password

`POST /api/auth/reset-password`

**Body**: `ResetPasswordRequest`
```typescript
{
  token: string;          // from URL query
  newPassword: string;
  confirmPassword: string;
}
```

**Response**: `ApiResponse<Void>`.

---

## Module 2: User Profiles & Preferences

All endpoints in this module require authentication.

### 2.1 Get Current User

`GET /api/auth/me`

**Response**: `ApiResponse<UserDto>`

```typescript
interface UserDto {
  id: string;
  universityEmail: string;
  displayName: string;
  bio: string | null;
  profileImageUrl: string | null;
  role: "STUDENT" | "ADMIN";
  trustLevel: "NEW" | "TRUSTED_HOST" | "FLAGGED";
  createdAt: string; // ISO
}
```

---

### 2.2 Update Profile

`POST /api/auth/me` – note: **POST** (not PUT), `multipart/form-data`

**Fields**:
- `displayName` (optional, 2‑50 chars)
- `bio` (optional, max 500 chars)
- `profileImage` (optional, file)

**Response**: `ApiResponse<UserDto>`.

---

### 2.3 Change Password

`PUT /api/auth/me/password`

**Body**: `ChangePasswordRequest`
```typescript
{
  currentPassword: string;
  newPassword: string;    // same complexity
  confirmPassword: string;
}
```

**Response**: `ApiResponse<Void>`.

---

### 2.4 Delete Account

`DELETE /api/auth/me`

**Headers**: `Authorization: Bearer <accessToken>`

**Response**: `ApiResponse<Void>`.

**UI**: Strong confirmation (irreversible, cascades all data).

---

### 2.5 Trust Qualification Status

`GET /api/auth/me/trust-status`

**Response**: `ApiResponse<TrustQualificationStatus>`
```typescript
{
  completedEventsWithReviews: number;
  minimumEventsRequired: 3;
  averageRating: number;
  minimumRatingRequired: 4.0;
  meetsEventCount: boolean;
  meetsRatingThreshold: boolean;
  qualifies: boolean;
}
```

---

### 2.6 User Preferences

`GET /api/auth/me/preferences` → `UserPreferencesDto`  
`PUT /api/auth/me/preferences` (same DTO) → updated DTO.

```typescript
interface UserPreferencesDto {
  emailNotifications: boolean;   // default true
  pushNotifications: boolean;    // default true
  notifyOnRsvpChange: boolean;   // default true
  notifyOnReview: boolean;       // default true
  timezone: string;              // default "Europe/Berlin"
  language: string;              // default "de"
}
```

---

### 2.7 Public Profile (no auth)

`GET /api/public/users/{userId}`

**Response**: `ApiResponse<PublicProfileDto>`
```typescript
interface PublicProfileDto {
  id: string;
  displayName: string;
  bio: string | null;
  profileImageUrl: string | null;
  trustLevel: TrustLevel;
  createdAt: string;
  completedEventsWithReviews: number;
  averageHostRating: number; // 0.0 if none
}
```

---

## Module 3: Events

### 3.1 Event Status Lifecycle

```
DRAFT → UNDER_REVIEW → PUBLISHED → COMPLETED (auto)
         ↓              ↓
       CANCELLED      CANCELLED (host)
```

**Status meanings**:
- `DRAFT` – host only, partial data, not visible.
- `UNDER_REVIEW` – pending admin approval.
- `PUBLISHED` – visible, can RSVP.
- `CANCELLED` – frozen, shown with reason.
- `COMPLETED` – past event, reviews allowed.

### 3.2 Event DTOs

**`EventDto`**:
```typescript
interface EventDto {
  id: string;
  host: HostDto;
  title: string;
  description: string | null;
  location: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentRsvpCount: number;
  status: EventStatus;
  categories: CategoryDto[];
  media: EventMediaDto[];
  createdAt: string;
  isHost: boolean;                 // true if current user is host
  myRsvpStatus: RsvpStatus | null; // null if not registered
  slug: string;
  viewCount: number;
  cancellationReason: string | null;
  deleted: boolean;                // true if soft-deleted
}
```

**`HostDto`**:
```typescript
interface HostDto {
  id: string;
  displayName: string;
  profileImageUrl: string | null;
  trustLevel: TrustLevel;
  averageHostRating: number;       // 0.0 if none
  totalHostReviews: number;
  completedEventsWithReviews: number;
}
```

**`EventMediaDto`**:
```typescript
interface EventMediaDto {
  id: string;
  url: string;
  mediaType: "IMAGE" | "VIDEO";
  filename: string;
  thumbnailUrl: string | null;    // 400×300
  mediumUrl: string | null;       // 800×600
  displayOrder: number;
}
```

**`CategoryDto`**:
```typescript
interface CategoryDto {
  id: number;
  name: string;
  icon: string | null;    // e.g., "music"
  color: string | null;   // hex, e.g., "#FF5733"
  sortOrder: number;
}
```

### 3.3 Create Event

`POST /api/events` (or `/api/events/draft` for draft)

**Body** (`CreateEventRequest`):
```typescript
{
  title: string;           // required, 3‑100 chars
  description?: string;    // max 2000
  location: string;        // required, max 200
  startTime: string;       // ISO 8601
  endTime: string;         // ISO 8601, must be after start
  maxCapacity: number;     // min 1
  categoryIds?: number[];  // optional
  slug?: string;           // optional, max 150
}
```

**Validation**:
- For normal create: `startTime` must be in future, `endTime` > `startTime`.
- For draft: these checks are skipped (draft can hold partial data).

**Response**: `ApiResponse<EventDto>`.

---

### 3.4 Publish Draft

`PUT /api/events/{eventId}/publish`

**Validation**: dates are re‑checked; trust level determines final status.

**Response**: `ApiResponse<EventDto>`.

---

### 3.5 Update Event

`PUT /api/events/{eventId}`

**Body**: `CreateEventRequest` (same as create).

**Restrictions**:
- Only host can update.
- Cannot update `CANCELLED` or soft‑deleted events.
- Cannot reduce `maxCapacity` below `currentRsvpCount`.

**Response**: `ApiResponse<EventDto>`.

---

### 3.6 Cancel Event

`PATCH /api/events/{eventId}/cancel`

**Body** (optional): `CancelEventRequest`
```typescript
{
  reason?: string;  // max 500 chars
}
```

**Effects**:
- Status → `CANCELLED`.
- Notifies all `GOING`/`WAITLISTED` attendees via notification.
- SSE `event-cancelled` broadcast.

---

### 3.7 Soft Delete (Move to Trash)

`DELETE /api/events/{eventId}`

Sets `deletedAt` timestamp.

**Response**: `ApiResponse<Void>`.

---

### 3.8 Restore from Trash

`PATCH /api/events/{eventId}/restore`

If event already ended, status becomes `COMPLETED`.

**Response**: `ApiResponse<EventDto>`.

---

### 3.9 Permanent Delete

`DELETE /api/events/{eventId}/permanent`

Only host or admin; must be soft‑deleted first (unless admin). Deletes all media and dependent records.

---

### 3.10 Get Event Details

- **Authenticated**: `GET /api/events/{eventId}` or `GET /api/events/by-slug/{slug}`
- **Public**: `GET /api/public/events/{eventId}` or `GET /api/public/events/slug/{slug}`

Both return `ApiResponse<EventDto>`.

**View count** increments automatically for published events.

---

### 3.11 Event Feed (Published)

`GET /api/events` (authenticated) or `GET /api/public/events` (public)

**Query params**:
```typescript
{
  categoryId?: number;
  dateFrom?: string;  // ISO
  dateTo?: string;
  location?: string;  // partial match
  q?: string;         // search in title/description
  page?: number;
  size?: number;
  sort?: string;      // default "startTime"
}
```

**Response**: `PageResponse<EventDto>`.

**Featured events** (landing page): `GET /api/public/events/featured` returns next 6.

---

### 3.12 My Events

`GET /api/events/my-events` (authenticated)

**Params**:
- `includeDeleted?: boolean` (default false)

**Response**: `PageResponse<EventDto>`.

---

### 3.13 Media Upload

`POST /api/events/{eventId}/media` (multipart)

**Fields**:
- `images[]` – list of image files
- `videos[]` – list of video files

**Limits** (from `StorageProperties`):
- Max images per event: 5
- Max videos per event: 2
- Image size: 5 MB
- Video size: 20 MB

**Response**: `ApiResponse<EventDto>`.

---

### 3.14 Delete Media

`DELETE /api/events/{eventId}/media/{mediaId}`

**Response**: `ApiResponse<EventDto>`.

---

### 3.15 Reorder Media

`PATCH /api/events/{eventId}/media/reorder`

**Body**: `string[]` – ordered list of media UUIDs.

**Response**: `ApiResponse<EventDto>`.

---

### 3.16 Check‑In Code (Host)

`GET /api/events/{eventId}/check-in-code`

**Response**: `CheckInCodeDto`
```typescript
{
  checkInCode: string;    // 6‑char alphanumeric
  eventId: string;
  eventTitle: string;
  generatedAt: string;
  refreshIntervalSeconds: 300;
}
```

**UI**: Show QR code with the code; refresh every 5 minutes.

---

### 3.17 Admin Event Moderation

All admin endpoints require `ROLE_ADMIN`.

#### List events (admin)
`GET /api/admin/events` (filter by `status`)  
`GET /api/admin/events/pending` (status = `UNDER_REVIEW`)

#### Approve / Reject / Flag
- `PATCH /api/admin/events/{id}/approve` → `PUBLISHED`
- `PATCH /api/admin/events/{id}/reject` → `CANCELLED`
- `PATCH /api/admin/events/{id}/flag` → `UNDER_REVIEW`

#### Bulk actions
- `POST /api/admin/events/bulk-approve`
- `POST /api/admin/events/bulk-reject`

**Body**: `BulkEventActionRequest`
```typescript
{
  eventIds: string[];   // max 50
  reason?: string;      // for rejection, max 500
}
```

**Response**: `BulkEventActionResult`
```typescript
{
  processedCount: number;
  successCount: number;
  failedCount: number;
  succeededIds: string[];
  failedIds: string[];
  message: string;
}
```

---

### 3.18 Categories

**Public** (no auth): `GET /api/public/categories` → `CategoryDto[]` (sorted by `sortOrder`).

**Admin**:
- `GET /api/admin/categories`
- `POST /api/admin/categories` (body: `CategoryRequest`)
- `PUT /api/admin/categories/{id}`
- `DELETE /api/admin/categories/{id}`

`CategoryRequest`:
```typescript
{
  name: string;          // 1‑50 chars, unique
  icon?: string;         // max 50
  color?: string;        // hex, max 7 chars
  sortOrder?: number;
}
```

---

## Module 4: RSVPs & Waitlist

### 4.1 RSVP Statuses

```typescript
type RsvpStatus = "GOING" | "WAITLISTED" | "CANCELLED" | "ATTENDED";
```

### 4.2 RSVP DTO

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

### 4.3 Create RSVP

`POST /api/events/{eventId}/rsvps`

**Logic**:
- If capacity available → `GOING`
- If full → `WAITLISTED`
- If previously cancelled → reactivate

**Response**: `ApiResponse<RsvpDto>`.

**UI**:
- Show button “Register” / “Join Waitlist”.
- Display capacity bar with remaining spots.

---

### 4.4 Cancel RSVP

`PATCH /api/rsvps/{rsvpId}/cancel`

**Body** (optional): `CancelRsvpRequest` `{ reason?: string }`

**Effects**: status → `CANCELLED`; if was `GOING`, triggers waitlist promotion.

---

### 4.5 Get My RSVPs

`GET /api/rsvps/me`

**Response**: `PageResponse<RsvpDto>`.

---

### 4.6 Get Waitlist Position

`GET /api/rsvps/{rsvpId}/position`

**Response**: `number` (0 if not waitlisted).

**UI**: “You are #X on the waitlist”.

---

### 4.7 Host: View Event RSVPs

- `GET /api/events/{eventId}/rsvps` – all.
- `GET /api/events/{eventId}/rsvps/status/{status}` – filtered.

**Response**: `PageResponse<RsvpDto>`.

---

### 4.8 Host: Mark Attended

`PATCH /api/events/{eventId}/rsvps/{rsvpId}/attended`

Transitions `GOING` → `ATTENDED`.

---

### 4.9 Self Check‑In (QR)

`POST /api/events/{eventId}/check-in`

**Body**: `CheckInRequest` `{ code: string }`

Requires RSVP status `GOING`. Validates against event’s stored `checkInCode`.

**Response**: `ApiResponse<RsvpDto>`.

**UI**: QR scanner or manual code entry.

---

### 4.10 Host: Promote Waitlisted User

`PATCH /api/events/{eventId}/rsvps/{rsvpId}/promote`

**Effects**: status → `GOING`, user notified, SSE broadcast.

---

## Module 5: Reviews

### 5.1 Review DTO

```typescript
interface ReviewDto {
  id: string;
  eventId: string;
  reviewer: UserDto;
  rating: number;          // 1‑5
  comment: string | null;  // max 1000
  createdAt: string;
  helpfulCount: number;
  isHelpfulByCurrentUser: boolean | null;
}
```

### 5.2 Create Review

`POST /api/reviews`

**Body**: `CreateReviewRequest`
```typescript
{
  eventId: string;
  rating: number;     // 1‑5, required
  comment?: string;   // max 1000
}
```

**Restrictions**:
- Event must have ended (`endTime < now`).
- User must have RSVP with `ATTENDED`.
- One review per user per event.

**Effects**: Host gets notification; trust promotion may trigger.

**Response**: `ApiResponse<ReviewDto>`.

---

### 5.3 List Event Reviews

`GET /api/reviews/event/{eventId}`

**Sort**: default `helpfulCount,desc` then `createdAt,desc`.

**Response**: `PageResponse<ReviewDto>`.

---

### 5.4 List Host Reviews

`GET /api/reviews/host/{hostId}`

---

### 5.5 Toggle Helpful Vote

`POST /api/reviews/{reviewId}/helpful`

Toggles a “helpful” vote. Cannot vote on own review.

**Response**: `ApiResponse<ReviewDto>` (with updated `helpfulCount` and `isHelpfulByCurrentUser`).

---

### 5.6 Report a Review

`POST /api/reviews/{reviewId}/report`

**Body**: `ReviewReportRequest`
```typescript
{
  reason: string;  // max 500, required
}
```

Creates a `Report` with reason `INAPPROPRIATE` linked to the review's event.

---

### 5.7 Delete Review

`DELETE /api/reviews/{reviewId}`

Only reviewer or admin.

---

## Module 6: Reports (Moderation)

### 6.1 Report DTO

```typescript
interface ReportDto {
  id: string;
  eventId: string;
  eventTitle: string;
  reporter: UserDto;
  reason: ReportReason;   // "SPAM" | "INAPPROPRIATE" | "FAKE_EVENT" | "OTHER"
  details: string | null; // max 2000
  status: ReportStatus;   // "OPEN" | "RESOLVED"
  createdAt: string;
}
```

### 6.2 Create Report (User)

`POST /api/reports`

**Body**: `CreateReportRequest`
```typescript
{
  eventId: string;
  reason: ReportReason;
  details?: string;   // max 2000
}
```

**Restriction**: Cannot report own event.  
**Critical reports** (`INAPPROPRIATE`, `FAKE_EVENT`) send MQTT alert to AStA.

---

### 6.3 Admin Report Endpoints

- `GET /api/admin/reports` – filter by `status`, `reason`
- `GET /api/admin/reports/status/{status}`
- `GET /api/admin/reports/reason/{reason}`
- `GET /api/admin/reports/{reportId}`

**Response**: `PageResponse<ReportDto>` or single.

### 6.4 Resolve Report

`PATCH /api/admin/reports/{reportId}/resolve`

**Query param**: `?flagEvent=false` (if true, sets event status to `UNDER_REVIEW`).

**Response**: `ApiResponse<ReportDto>`.

### 6.5 Delete Report

`DELETE /api/admin/reports/{reportId}`

---

## Module 7: Notifications

### 7.1 Notification Types

```typescript
type NotificationType =
  | "EVENT_APPROVED"
  | "EVENT_REJECTED"
  | "WAITLIST_PROMOTED"
  | "NEW_REVIEW"
  | "TRUST_PROMOTED"
  | "EVENT_CANCELLED"
  | "RSVP_CANCELLED"
  | "REPORT_RESOLVED";
```

### 7.2 Notification DTO

```typescript
interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEventId: string | null;
  relatedUserId: string | null;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}
```

### 7.3 Endpoints (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications` | Paginated list (query: `unreadOnly`) |
| `GET` | `/api/notifications/unread-count` | Number of unread |
| `PATCH` | `/api/notifications/{id}/read` | Mark one read |
| `PATCH` | `/api/notifications/read-all` | Mark all read |
| `DELETE` | `/api/notifications/{id}` | Delete one |

**UI**: Bell icon with badge; dropdown with recent notifications; click navigates to `actionUrl`.

---

## Module 8: Search

### 8.1 Search Suggestions

`GET /api/search/suggestions`

**Params**:
- `q` (required) – search string
- `type` – `ALL` (default), `EVENT`, `CATEGORY`, `USER`, `LOCATION`

**Response**: `ApiResponse<SearchSuggestionDto[]>`

```typescript
interface SearchSuggestionDto {
  type: "EVENT" | "CATEGORY" | "USER" | "LOCATION";
  value: string;       // display text
  id: string;          // ID for navigation
  subtitle: string;    // extra context
}
```

**UI**: Autocomplete dropdown with grouped results.

---

## Module 9: Admin Dashboard

### 9.1 Dashboard Stats

`GET /api/admin/dashboard`

**Response**: `AdminDashboardDto`
```typescript
{
  pendingEventsCount: number;
  openReportsCount: number;
  totalUsersCount: number;
  newUsersToday: number;
  eventsThisWeek: number;
  recentReports: ReportDto[];      // last 5 open
  recentPendingEvents: EventDto[]; // last 5 pending
}
```

### 9.2 User Management

`GET /api/admin/users` – list (search, filter by `trustLevel`)  
`GET /api/admin/users/{id}` – detail  
`PATCH /api/admin/users/{id}/trust-level` – body: `{ trustLevel: TrustLevel }`  
`POST /api/admin/users/{id}/flag` – flag user (sets to `FLAGGED`)  
`POST /api/admin/users/{id}/promote?force=false` – promote to `TRUSTED_HOST` (force skips criteria)  
`DELETE /api/admin/users/{id}` – delete user

**UI**: User table with badges, actions, filter.

---

## Module 10: Public Pages

All endpoints in this section require **no authentication**.

### 10.1 Public Event Feed

`GET /api/public/events` – same filters as authenticated feed.

### 10.2 Featured Events

`GET /api/public/events/featured` – next 6 upcoming events for landing page hero.

### 10.3 Public Event Detail

`GET /api/public/events/{eventId}` or `GET /api/public/events/slug/{slug}`

Returns `EventDto` with `myRsvpStatus=null` and `isHost=false`.

### 10.4 Categories

`GET /api/public/categories` – list of `CategoryDto`.

### 10.5 Public User Profile

`GET /api/public/users/{userId}` – `PublicProfileDto`.

---

## 17. TypeScript Types

### Enums

```typescript
enum EventStatus { DRAFT, PUBLISHED, UNDER_REVIEW, CANCELLED, COMPLETED }
enum RsvpStatus { GOING, WAITLISTED, CANCELLED, ATTENDED }
enum TrustLevel { NEW, TRUSTED_HOST, FLAGGED }
enum Role { STUDENT, ADMIN }
enum ReportReason { SPAM, INAPPROPRIATE, FAKE_EVENT, OTHER }
enum ReportStatus { OPEN, RESOLVED }
enum MediaType { IMAGE, VIDEO }
enum NotificationType {
  EVENT_APPROVED, EVENT_REJECTED, WAITLIST_PROMOTED, NEW_REVIEW,
  TRUST_PROMOTED, EVENT_CANCELLED, RSVP_CANCELLED, REPORT_RESOLVED
}
```

### API Response Wrappers

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp: string;
}
interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
```

### All DTOs (consolidated from above)

```typescript
// User
interface UserDto { id, universityEmail, displayName, bio, profileImageUrl, role, trustLevel, createdAt }
interface PublicProfileDto { id, displayName, bio, profileImageUrl, trustLevel, createdAt, completedEventsWithReviews, averageHostRating }
interface UpdateProfileRequest { displayName?, bio?, profileImage? }
interface ChangePasswordRequest { currentPassword, newPassword, confirmPassword }
interface TrustQualificationStatus { completedEventsWithReviews, minimumEventsRequired, averageRating, minimumRatingRequired, meetsEventCount, meetsRatingThreshold, qualifies }
interface UserPreferencesDto { emailNotifications, pushNotifications, notifyOnRsvpChange, notifyOnReview, timezone, language }

// Auth
interface LoginRequest { universityEmail, password }
interface RegisterRequest { universityEmail, password, displayName }
interface AuthResponse { accessToken, refreshToken, tokenType, expiresIn, user }

// Events
interface CreateEventRequest { title, description?, location, startTime, endTime, maxCapacity, categoryIds?, slug? }
interface CancelEventRequest { reason? }
interface EventDto { id, host, title, description, location, startTime, endTime, maxCapacity, currentRsvpCount, status, categories, media, createdAt, isHost, myRsvpStatus, slug, viewCount, cancellationReason, deleted }
interface HostDto { id, displayName, profileImageUrl, trustLevel, averageHostRating, totalHostReviews, completedEventsWithReviews }
interface EventMediaDto { id, url, mediaType, filename, thumbnailUrl, mediumUrl, displayOrder }
interface CategoryDto { id, name, icon, color, sortOrder }
interface CategoryRequest { name, icon?, color?, sortOrder? }
interface CheckInCodeDto { checkInCode, eventId, eventTitle, generatedAt, refreshIntervalSeconds }

// RSVPs
interface RsvpDto { id, eventId, eventTitle, user, status, createdAt }
interface CancelRsvpRequest { reason? }
interface CheckInRequest { code }
interface WaitlistPromotionDto { rsvpId, eventId, userId, userDisplayName, eventTitle, newRsvpCount, maxCapacity }

// Reviews
interface CreateReviewRequest { eventId, rating, comment? }
interface ReviewDto { id, eventId, reviewer, rating, comment, createdAt, helpfulCount, isHelpfulByCurrentUser }
interface ReviewReportRequest { reason }

// Reports
interface CreateReportRequest { eventId, reason, details? }
interface ReportDto { id, eventId, eventTitle, reporter, reason, details, status, createdAt }
interface BulkEventActionRequest { eventIds, reason? }
interface BulkEventActionResult { processedCount, successCount, failedCount, succeededIds, failedIds, message }

// Notifications
interface NotificationDto { id, type, title, message, relatedEventId, relatedUserId, actionUrl, isRead, createdAt }

// Admin Dashboard
interface AdminDashboardDto { pendingEventsCount, openReportsCount, totalUsersCount, newUsersToday, eventsThisWeek, recentReports, recentPendingEvents }

// Search
interface SearchSuggestionDto { type, value, id, subtitle }
```

---

## 18. UI/UX Guidelines

### Design Principles
- **Mobile‑first** – students primarily use phones.
- **Accessibility** – contrast, focus indicators, ARIA labels.
- **Performance** – lazy load images, virtualise long lists, avoid N+1 requests.
- **Real‑time awareness** – show live RSVP count updates, waitlist positions.
- **Offline grace** – show cached data or friendly messages when network is lost.

### Component Patterns

**Event Card**:
```
┌─────────────────────────────────────┐
│ [Thumbnail 400×300]                 │
│ Title                                │
│ 📍 Location | 📅 Date               │
│ 👤 HostName ⭐ 4.5 (12 reviews)     │
│ [Category] [Category]               │
│ 👥 12/50 spots remaining            │
│ [REGISTER] / [JOIN WAITLIST]        │
└─────────────────────────────────────┘
```

**Trust Badges**:
- `NEW` → gray, “Needs review”.
- `TRUSTED_HOST` → green with checkmark, “Trusted Host”.
- `FLAGGED` → red, “Flagged”.

**RSVP Button States**:
- “Register” (spots available)
- “Join Waitlist” (full)
- “Registered ✓” (GOING)
- “Waitlisted #3” (WAITLISTED)
- “Attended ✓” (ATTENDED)
- “Cancelled” (CANCELLED)
- Disabled if event cancelled/ended.

**Notification Icons**:
- `EVENT_APPROVED` → ✅
- `EVENT_REJECTED` → ❌
- `WAITLIST_PROMOTED` → ⬆️
- `NEW_REVIEW` → ⭐
- `TRUST_PROMOTED` → 🏆
- `EVENT_CANCELLED` → ⚠️
- `RSVP_CANCELLED` → 👤➖

### Form Validation Rules (match backend)

| Field | Rules |
|-------|-------|
| Email | University format (see regex) |
| Password | 8+ chars, upper, lower, digit, special |
| Display Name | 2‑50 chars |
| Event Title | 3‑100 chars, required |
| Description | Max 2000 |
| Location | Max 200, required |
| Capacity | Min 1 |
| Rating | 1‑5, required |
| Comment | Max 1000 |
| Report Details | Max 2000 |
| Cancellation Reason | Max 500 |

### Date/Time
- Backend: ISO 8601 `Instant` (UTC).
- Frontend: display in user’s timezone (default `Europe/Berlin`).
- Input: use datetime‑local with timezone offset.
- Format: `dd.MM.yyyy HH:mm` for German locale.

### Image Handling
- Avatars: 1:1, crop to circle.
- Event thumbnails: 400×300, crop centre.
- Event medium: 800×600, preserve aspect.
- Lazy load using `IntersectionObserver`.
- Show skeleton placeholders.

---

## 19. Frontend State Management (Zustand)

### Recommended Store Structure

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (auth: AuthResponse) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
  updateUser: (user: UserDto) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isAdmin: false,
      setAuth: (auth) => set({
        user: auth.user,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        isAuthenticated: true,
        isAdmin: auth.user.role === 'ADMIN'
      }),
      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isAdmin: false }),
      updateUser: (user) => set({ user })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ refreshToken: state.refreshToken, user: state.user })
    }
  )
);
```

### Axios Interceptor Example

```typescript
// api/client.ts
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const response = await axios.post('/api/auth/refresh', null, {
          headers: { 'X-Refresh-Token': refreshToken }
        });
        const { accessToken, refreshToken: newRefresh } = response.data.data;
        useAuthStore.getState().setTokens(accessToken, newRefresh);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
```

### SSE Hook

```typescript
// hooks/useEventSse.ts
import { useEffect, useRef } from 'react';
import { API_BASE } from '../constants';

export const useEventSse = (eventId: string | null) => {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!eventId) return;
    const token = useAuthStore.getState().accessToken;
    const es = new EventSource(`${API_BASE}/api/events/stream/${eventId}?token=${token}`);
    // ... add event listeners
    eventSourceRef.current = es;
    return () => es.close();
  }, [eventId]);
};
```

---

## 20. Environment Variables

```bash
# .env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=MyStudyApp
VITE_DEFAULT_LANGUAGE=de
VITE_DEFAULT_TIMEZONE=Europe/Berlin
```

---

## 21. Development Checklist

### Phase 1: Core (MVP)
- [ ] Authentication (register, login, logout, refresh)
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Event creation (with draft)
- [ ] Event feed (public + authenticated)
- [ ] Event detail page
- [ ] RSVP system (GOING/WAITLISTED)
- [ ] Basic profile page
- [ ] Notification system (list, mark read)
- [ ] Search suggestions

### Phase 2: Enhanced
- [ ] Event media upload (images/videos)
- [ ] Media reordering
- [ ] Event slug/sharing
- [ ] Soft delete / trash bin
- [ ] Check‑in system (QR code display, self check‑in)
- [ ] Waitlist management (host promote)
- [ ] Review system (create, list, helpful vote)
- [ ] User preferences

### Phase 3: Polish & Admin
- [ ] Helpful votes and review reporting
- [ ] Report system (user → admin)
- [ ] Admin dashboard
- [ ] Admin event moderation (approve/reject/flag, bulk)
- [ ] Admin user management
- [ ] Admin category management
- [ ] Real‑time SSE integration
- [ ] Advanced notifications with deep‑linking

---

*This guide is generated directly from the backend source code. All endpoints, DTOs, validation rules, and business logic reflect the actual implementation as of July 2026.*