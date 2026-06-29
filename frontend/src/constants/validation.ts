// src/constants/validation.ts

/**
 * University email format:
 * - Must end with .de or .edu
 * - Disallows common free providers (gmx, gmail, etc.)
 */
export const EMAIL_REGEX =
  /^(?!.*@(gmx|web|gmail|yahoo|hotmail|outlook|icloud|posteo|mailbox)\.(de|com|net|org)$)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(de|edu)$/;

/**
 * Password must contain at least:
 * - 8 characters
 * - one uppercase letter
 * - one lowercase letter
 * - one digit
 * - one special character (@$!%*?&)
 */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Display name: 2–50 characters
 */
export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 50;

/**
 * Event title: 3–100 characters
 */
export const EVENT_TITLE_MIN = 3;
export const EVENT_TITLE_MAX = 100;

/**
 * Event description: max 2000 characters
 */
export const EVENT_DESCRIPTION_MAX = 2000;

/**
 * Location: max 200 characters
 */
export const EVENT_LOCATION_MAX = 200;

/**
 * Capacity: min 1
 */
export const EVENT_CAPACITY_MIN = 1;

/**
 * Review comment: max 1000 characters
 */
export const REVIEW_COMMENT_MAX = 1000;

/**
 * Report details: max 2000 characters
 */
export const REPORT_DETAILS_MAX = 2000;