// src/types/index.ts

// ---------- Import enums directly (relative path) ----------
import {
  EventStatus,
  RsvpStatus,
  TrustLevel,
  Role,
  ReportReason,
  ReportStatus,
  NotificationType,
} from '../constants/enums';

// Re‑export them so other files can import from '@/types'
export {
  EventStatus,
  RsvpStatus,
  TrustLevel,
  Role,
  ReportReason,
  ReportStatus,
  NotificationType,
};

// ---------- API Response Wrappers ----------
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ---------- Identity / User ----------
export interface User {
  id: string;
  universityEmail: string;
  displayName: string;
  bio: string | null;
  profileImageUrl: string | null;
  role: Role;
  trustLevel: TrustLevel;
  createdAt: string;
}

export interface PublicProfile {
  id: string;
  displayName: string;
  bio: string | null;
  profileImageUrl: string | null;
  trustLevel: TrustLevel;
  createdAt: string;
  completedEventsWithReviews: number;
  averageHostRating: number;
}

export interface TrustQualificationStatus {
  completedEventsWithReviews: number;
  minimumEventsRequired: number;
  averageRating: number;
  minimumRatingRequired: number;
  meetsEventCount: boolean;
  meetsRatingThreshold: boolean;
  qualifies: boolean;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyOnRsvpChange: boolean;
  notifyOnReview: boolean;
  timezone: string;
  language: string;
}

// ---------- Auth ----------
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: User;
}

export interface RegisterRequest {
  universityEmail: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  universityEmail: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  universityEmail: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
}

// ---------- Events ----------
export interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  sortOrder: number;
}

export interface Host {
  id: string;
  displayName: string;
  profileImageUrl: string | null;
  trustLevel: TrustLevel;
  averageHostRating: number;
  totalHostReviews: number;
  completedEventsWithReviews: number;
}

export interface EventMedia {
  id: string;
  url: string;
  mediaType: 'IMAGE' | 'VIDEO';
  filename: string;
  thumbnailUrl: string | null;
  mediumUrl: string | null;
  displayOrder: number;
}

export interface Event {
  id: string;
  host: Host;
  title: string;
  description: string | null;
  location: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentRsvpCount: number;
  status: EventStatus;
  categories: Category[];
  media: EventMedia[];
  createdAt: string;
  isHost: boolean;
  myRsvpStatus: RsvpStatus | null;
  slug: string;
  viewCount: number;
  cancellationReason: string | null;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  location: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  categoryIds?: number[];
  slug?: string;
}

export interface CancelEventRequest {
  reason?: string;
}

export interface CheckInCode {
  checkInCode: string;
  eventId: string;
  eventTitle: string;
  generatedAt: string;
  refreshIntervalSeconds: number;
}

// ---------- RSVP ----------
export interface Rsvp {
  id: string;
  eventId: string;
  eventTitle: string;
  user: User;
  status: RsvpStatus;
  createdAt: string;
}

export interface CancelRsvpRequest {
  reason?: string;
}

export interface CheckInRequest {
  code: string;
}

// ---------- Reviews ----------
export interface Review {
  id: string;
  eventId: string;
  reviewer: User;
  rating: number;
  comment: string;
  createdAt: string;
  helpfulCount: number;
  isHelpfulByCurrentUser: boolean | null;
}

export interface CreateReviewRequest {
  eventId: string;
  rating: number;
  comment?: string;
}

export interface ReviewReportRequest {
  reason: string;
}

// ---------- Reports ----------
export interface Report {
  id: string;
  eventId: string;
  eventTitle: string;
  reporter: User;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  createdAt: string;
}

export interface CreateReportRequest {
  eventId: string;
  reason: ReportReason;
  details?: string;
}

// ---------- Notifications ----------
export interface Notification {
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

// ---------- Search ----------
export interface SearchSuggestion {
  type: 'EVENT' | 'CATEGORY' | 'USER' | 'LOCATION';
  value: string;
  id: string;
  subtitle: string;
}

// ---------- Admin ----------
export interface AdminDashboard {
  pendingEventsCount: number;
  openReportsCount: number;
  totalUsersCount: number;
  newUsersToday: number;
  eventsThisWeek: number;
  recentReports: Report[];
  recentPendingEvents: Event[];
}

export interface CategoryRequest {
  name: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

export interface BulkEventActionRequest {
  eventIds: string[];
  reason?: string;
}

export interface BulkEventActionResult {
  processedCount: number;
  successCount: number;
  failedCount: number;
  succeededIds: string[];
  failedIds: string[];
  message: string;
}

// ---------- Optional Query Params ----------
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface EventFeedParams extends PaginationParams {
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  q?: string;
}

export interface MyEventsParams extends PaginationParams {
  includeDeleted?: boolean;
}