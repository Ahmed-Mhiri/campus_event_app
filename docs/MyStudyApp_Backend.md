# 🚀 MyStudyApp Backend — Ultra‑Detailed Technical Analysis

This document provides an **exhaustive** examination of the MyStudyApp Java backend. Every class, method, annotation, and configuration property is analyzed to give you a complete understanding of the system's inner workings, design decisions, and potential areas for improvement.

---

## 1. Introduction & Architectural Overview

MyStudyApp is a **campus event management platform** built with Spring Boot. It consists of **three** cooperating applications:

- **`backend-main`** – the monolithic core handling all domain logic (events, users, RSVPs, reviews, reports, notifications, trust, moderation, and **weather**).
- **`backend-weather`** – a standalone Spring Boot service that fetches weather forecasts from Open‑Meteo and publishes them via MQTT.
- **`backend-asta`** – *(legacy, removed)* – a lightweight microservice that was used for AStA events.

**Communication** between the services happens over an MQTT broker (Mosquitto):

| Source | Topic | Destination | Description |
|--------|-------|-------------|-------------|
| `backend-weather` | `campus/weather` | `backend-main` | Weather forecasts (every 6 hours) |
| `backend-main` | `university/alerts` | *(future)* | Critical report alerts |

**Note**: The `backend-asta` module has been **removed** and replaced by the more useful `backend-weather` service, which provides real‑world weather data for outdoor events.

The system is built with **Spring Boot 3.x**, **Spring Security 6.x**, **Spring Data JPA**, **Spring Integration MQTT**, and **Flyway** for schema migrations. **PostgreSQL** is the production database.

**Key architectural principles**:
- **Domain‑driven design** – each package (`events`, `identity`, `moderation`, `registration`, `notification`, `weather`) represents a bounded context.
- **Hexagonal architecture** – core domain logic is isolated; external dependencies (web, MQTT, email, file storage, weather APIs) are plugged in via adapters.
- **Event‑driven** – internal Spring `ApplicationEvent`s decouple modules.
- **Security by design** – JWT authentication, role‑based access, email verification, rate limiting, and trust levels.
- **Atomicity & concurrency control** – critical operations use atomic SQL updates and pessimistic locking.

---

## 2. Backend‑Main Detailed Analysis

### 2.1 Common Module (`common`)

#### 2.1.1 Configuration Classes

**`CorsConfig.java`**  
- Defines a `CorsConfigurationSource` bean.  
- Uses `setAllowedOriginPatterns()` rather than `setAllowedOrigins()` to support wildcards and credentials.  
- Allows `http://localhost:5173` and `http://127.0.0.1:5173`, plus the configurable `${app.frontend-url}`.  
- Exposes `Authorization` and `X-Refresh-Token` headers.  
- `allowCredentials(true)` is crucial for JWT cookie‑less authentication.

**`SecurityConfig.java`**  
- Disables CSRF (stateless JWT).  
- Enables CORS with defaults (uses `CorsConfig` bean).  
- Sets session management to `STATELESS`.  
- **Authorization rules** (order matters):  
  - `OPTIONS` are permitted (preflight).  
  - `/api/auth/me/**` **must** be authenticated (explicitly before `/api/auth/**` permitAll).  
  - `/api/auth/**` permitAll.  
  - `/api/public/**` permitAll.  
  - `/uploads/**` permitAll (served static files).  
  - `/api/admin/**` requires `ROLE_ADMIN`.  
  - `POST /api/events`, `DELETE /api/events/**`, `POST /api/reports`, `POST /api/reviews`, `POST /api/rsvps` are authenticated (the rest require authentication by default).  
- Injects `JwtAuthFilter` and `RateLimitingFilter` **before** `UsernamePasswordAuthenticationFilter`.  
- Defines `AuthenticationManager` with a `DaoAuthenticationProvider` using `UserDetailsService` and `BCryptPasswordEncoder`.  
- **Important**: `BCryptPasswordEncoder(12)` – strength 12 is a good balance between security and performance.

**`OpenApiConfig.java`**  
- Configures Swagger/OpenAPI with a `SecurityScheme` of type `HTTP` with scheme `bearer` and format `JWT`.  
- Adds a global security requirement so that all endpoints are documented with Bearer auth.

**`PageableConfig.java`**  
- Overrides `addArgumentResolvers` to set max page size to 100, preventing clients from requesting excessive data.

**`StorageConfig.java` & `StorageProperties.java`**  
- `StorageProperties` holds configuration for upload directories and limits.  
- `StorageConfig` adds resource handlers to serve files from absolute paths under `/uploads/avatars` and `/uploads/events`.  
- The paths are resolved using `Paths.get(...).toFile().getAbsolutePath()` – ensures the directory is absolute, avoiding relative path issues in different working directories.  
- **Good practice**: Uses `file:` prefix to serve from filesystem.

**`DummyDataSeeder.java`** (dev profile)  
- Implements `CommandLineRunner` and is active only when `@Profile("dev")`.  
- First checks if any users exist; if `forceClear` is true (default), it truncates all tables in the correct order to respect foreign keys.  
- Seeds **40+ users** (admins, trusted hosts, regular students, flagged user).  
- Seeds **15 categories** with icons and colours.  
- Seeds **60+ events** with varied statuses (PUBLISHED, COMPLETED, UNDER_REVIEW, CANCELLED, DRAFT).  
  - Includes **special events** for UI testing:  
    - `[LIVE] Check-in Simulator` – started 15 minutes ago to test check‑in.  
    - `[HOT] Waitlist Bottleneck Event` – capacity set to 5, RSVP count forced to 20 to create waitlist.  
- Seeds RSVPs with a mix of `GOING`, `WAITLISTED`, `ATTENDED`, `CANCELLED` – carefully ensures `currentRsvpCount` matches actual going count.  
- Seeds reviews for past events, helpful counts.  
- Seeds event media with random placeholder images from picsum.photos.  
- Seeds user preferences and notifications.  
- **Flaw**: The seeder uses a fixed random seed (`random = new Random(42L)`), so the data is deterministic across runs – good for testing.  
- **Performance**: For 60 events, it does many individual `save()` calls; could be batched for speed, but acceptable for dev.

#### 2.1.2 Exception Handling

**`GlobalExceptionHandler.java`**  
- `@RestControllerAdvice` with specific handlers for common exceptions.  
- Returns `ApiResponse<T>` with `success=false`, `message`, and optional `data` (e.g., validation errors).  
- Handles `MethodArgumentNotValidException` by mapping each field error to a map.  
- Handles `ConstraintViolationException` (for `@Validated` params).  
- Handles `MethodArgumentTypeMismatchException` (type conversion errors).  
- Handles `MissingServletRequestParameterException`.  
- Handles `HttpMessageNotReadableException` (malformed JSON).  
- Handles `IllegalArgumentException` (used for business rule violations).  
- Handles `BadCredentialsException` (401), `AuthenticationException` (401).  
- Handles `AccessDeniedException`, `LockedException`, `ForbiddenActionException` (403).  
- Handles `ResourceNotFoundException` (404).  
- Handles `CapacityExceededException` (409).  
- Handles `DataIntegrityViolationException` (e.g., duplicate unique constraint) – returns 409 with a generic message.  
- Handles `MaxUploadSizeExceededException` – returns 400 with a user‑friendly message.  
- Handles `DisabledException` (account not verified) – 403.  
- Finally, catches any `Exception` – logs it and returns 500 with a generic error (no stack trace exposed).  
- **Good**: all responses follow the same envelope, making client handling consistent.

#### 2.1.3 Security Components

**`JwtUtil.java`**  
- Reads `jwt.secret` as UTF‑8 bytes (not Base64) – this allows arbitrary characters in the secret.  
- `SecretKey` is generated with `Keys.hmacShaKeyFor()` – expects a key of sufficient length (>= 256 bits).  
- Generates access and refresh tokens with claims: `subject` (email), `userId`, `role`, `trustLevel`, `type` (access/refresh).  
- Uses `SignatureAlgorithm.HS256` (HMAC‑SHA256).  
- **Important**: The secret is **not** Base64‑encoded, so the `.env` variable can be a plain string like `mySuperSecretKey!123` – but it must be at least 32 characters to meet the key length requirement.  
- Token expiration: access 15 minutes (configurable), refresh 7 days.  
- `parseClaims()` uses `Jwts.parserBuilder().setSigningKey(key).build()` – modern JJWT API.  
- `validateToken()` catches all exceptions and returns false (no specific exception propagation).  
- `isAccessToken()` / `isRefreshToken()` check the `type` claim.

**`JwtAuthFilter.java`**  
- Extends `OncePerRequestFilter`.  
- Overrides `doFilterInternal`:  
  1. Parses JWT from `Authorization` header **or** from query parameter `token` (for SSE).  
  2. If token exists and is valid **and** is an access token:  
     - Extracts email, role, userId.  
     - Fetches `User` from DB; if null or `trustLevel == FLAGGED`, returns 403 JSON response and clears context.  
     - Builds `UserDetails` with authority `ROLE_<role>`.  
     - Creates `UsernamePasswordAuthenticationToken` and sets it in `SecurityContext`.  
  3. Continues filter chain.  
- Overrides `shouldNotFilter()`:  
  - Skips `OPTIONS` requests.  
  - Skips `/api/auth/**` **except** `/api/auth/me` (because that endpoint needs authentication).  
  - Skips `/api/public/**`.  
- **Observation**: The filter checks the database on every request to verify user exists and trust level. This adds overhead but ensures real‑time trust enforcement. Could be cached.

**`RateLimitingFilter.java`**  
- Uses a `ConcurrentHashMap` of `Bucket` objects, each with a `LinkedList` of timestamps.  
- `clean()` removes timestamps older than 60 seconds.  
- `add()` appends current timestamp.  
- `count()` returns size.  
- For auth endpoints (`/api/auth/**`): max 5 requests per minute.  
- For write endpoints (starts with `/api/reviews`, `/api/reports`, `/api/rsvps`, `/api/events`): max 20 per minute.  
- The filter only applies to **state‑changing** methods (POST, PUT, PATCH, DELETE) – GET/HEAD/OPTIONS are skipped.  
- On throttling, responds with HTTP 429 and a JSON `ApiResponse` error envelope.  
- **Potential issue**: The bucket is keyed by `client IP + URI`, which means each endpoint has its own limit; a user could exhaust one endpoint and not affect others. This is fine.  
- **Improvement**: Use a distributed rate limiter (e.g., Redis) for horizontal scaling.

#### 2.1.4 Services

**`FileStorageService.java`**  
- Stores avatars in `uploads/avatars/` with filename `avatar_<userId>.<ext>`.  
- Stores event images in `uploads/events/<eventId>/images/` with a random UUID filename.  
- Stores event videos similarly in `videos/` subfolder.  
- Validates file size against `StorageProperties` max sizes.  
- Validates file extensions: images (jpg, jpeg, png, webp), videos (mp4, webm, mov).  
- Deletes files on request (used when media is removed or event is permanently deleted).  
- **Important**: The method `storeEventImage` generates **only** the main file; thumbnails are generated separately by `ThumbnailService`.  
- **Potential issue**: No check for duplicate filenames (UUID ensures uniqueness).  
- **Security**: No path traversal vulnerability because filenames are generated and not user‑supplied.

**`ThumbnailService.java`**  
- Uses Thumbnailator to generate a 400×300 thumbnail (center‑cropped) and an 800×600 medium version (aspect‑preserved).  
- Saves them alongside the original with `_thumb` and `_medium` suffixes.  
- Returns an array `[thumbnailUrl, mediumUrl]` to be stored in `EventMedia`.  
- On deletion, removes these derived files as well.

**`GeocodingService.java`**  
- Calls OpenStreetMap Nominatim API (`https://nominatim.openstreetmap.org/search`) to convert an address into latitude/longitude.  
- Uses `RestTemplate` with a proper `User-Agent` header (required by Nominatim policy).  
- Returns `double[] { lat, lon }` or `null` if geocoding fails.  
- Integrated into `EventService.createEvent()`, `createDraft()`, and `updateEvent()` via the `populateAddressAndGeocode()` helper method.  
- **Only** geocodes if `isOutdoor` is `true` and `city` is provided.  
- **Fail‑safe**: If geocoding fails, the event is still saved with `latitude`/`longitude` set to `null`.

---

### 2.2 Events Module (`events`)

#### 2.2.1 Domain Model (`events/model`)

**`Event.java`**  
- `@Entity` with `@Table(name = "events")`.  
- Fields: `UUID id`, `User host` (LAZY), `String title`, `String description`, `String location`, `Instant startTime`, `Instant endTime`, `Integer maxCapacity`, `Integer currentRsvpCount` (denormalized), `EventStatus status`, `Set<EventCategory> eventCategories`, `List<EventMedia> eventMedia`, `Instant createdAt` (auto), `String slug` (unique), `Long viewCount` (default 0), `Instant deletedAt` (soft delete), `String checkInCode`, `String cancellationReason`.  
- **NEW address & weather fields**:
  - `String venueName` – human‑readable venue name.
  - `String street` – street + house number.
  - `String city` – city name.
  - `String postalCode` – ZIP code.
  - `String country` – default "DE".
  - `Double latitude` – geocoded coordinate.
  - `Double longitude` – geocoded coordinate.
  - `boolean isOutdoor` – flag for outdoor events (default false).
- **Builder** pattern used for construction.  
- `currentRsvpCount` is updated atomically via `@Modifying` queries.  
- `slug` is generated by `SlugGenerator` and must be unique.  
- `deletedAt` is `null` for active events; soft‑delete sets it to current timestamp.  
- `checkInCode` is a 6‑character alphanumeric string generated by `EventService.generateCheckInCode()`.

**`Category.java`**  
- `id` (Integer, auto‑generated), `name` (unique), `icon` (string), `color` (hex), `sortOrder`.  
- Used for classification; many‑to‑many via `EventCategory`.

**`EventCategory.java`** & **`EventCategoryId.java`**  
- Composite PK with `eventId` and `categoryId`.  
- `@ManyToOne` with `@MapsId` to populate the composite key automatically.

**`EventMedia.java`**  
- `UUID id`, `Event event`, `String url`, `MediaType` (IMAGE/VIDEO), `String filename`, `String thumbnailUrl`, `String mediumUrl`, `Integer displayOrder`.  
- `thumbnailUrl` and `mediumUrl` are set by `ThumbnailService`.  
- `displayOrder` is used for carousel ordering; default 0.

**`EventStatus.java`**  
- Enum: `DRAFT`, `UNDER_REVIEW`, `PUBLISHED`, `CANCELLED`, `COMPLETED`.

**`MediaType.java`** – `IMAGE`, `VIDEO`.

#### 2.2.2 Repositories (`events/repository`)

**`EventRepository.java`** (extends `JpaRepository<Event, UUID>`)  
- **Atomic updates**:  
  - `@Modifying @Query("UPDATE Event e SET e.currentRsvpCount = e.currentRsvpCount + 1 WHERE e.id = :eventId AND e.currentRsvpCount < e.maxCapacity AND e.status = 'PUBLISHED'")`  
    Returns int (number of rows updated). Used to atomically increment only if capacity available.  
  - `decrementRsvpCount` – similar, but no capacity check.  
- **Pessimistic locking**:  
  - `@Lock(LockModeType.PESSIMISTIC_WRITE) @Query("SELECT e FROM Event e WHERE e.id = :eventId")` – used in waitlist promotion to prevent race conditions.  
- **Trust queries**:  
  - `countCompletedReviewedEventsByHostId` – counts distinct events where host = userId and event has at least one review and endTime < now.  
  - `countCompletedEventsByHostId` – total completed events.  
  - `hasCompletedReviewedEvents` – boolean.  
- **Filtered feed**:  
  - `findPublishedWithFilters` – a complex JPQL query with optional parameters: categoryId, dateFrom, dateTo, location, q. Uses `DISTINCT` because of join with `eventCategories`. Explicitly excludes `deletedAt IS NULL`.  
- **Lifecycle**: `findByStatusAndEndTimeBefore` – used by scheduler to auto‑complete events.  
- **Slug**: `findBySlug`, `existsBySlug`.  
- **View count**: `incrementViewCount` – atomic increment.  
- **Soft delete**: `findByIdIncludingDeleted` (no `deletedAt` filter) used for restore/permanent delete. `findByHostIdAndDeletedAtIsNull`, `findByHostIdAndDeletedAtIsNotNull`.  
- **Dashboard**: `countByStatus`, `countByStatusAndCreatedAtAfter`.  
- **Search**: `findTop5ByTitleContainingIgnoreCaseAndStatusPublished`, `findTop5DistinctLocationsByLocationContainingIgnoreCase`.

**`CategoryRepository.java`**  
- `existsByName`, `findTop5ByNameContainingIgnoreCase`, `findAllByOrderBySortOrderAsc`.

**`EventMediaRepository.java`** – standard `JpaRepository<EventMedia, UUID>`.

#### 2.2.3 Services (`events/service`)

**`EventService.java`** – the main orchestrator (~500 lines).  
- **Dependencies**: EventRepository, CategoryRepository, UserRepository, EventFactory, EventMapper, FileStorageService, ThumbnailService, StorageProperties, RsvpRepository, ReviewRepository, ReportRepository, NotificationEventPublisher, **GeocodingService**.

**Key methods**:

- **`createEvent(CreateEventRequest, hostEmail)`**:  
  1. Validate end > start, start > now.  
  2. Fetch host.  
  3. Call `eventFactory.createEvent(request, host)` – determines initial status based on trust.  
  4. **NEW**: Call `populateAddressAndGeocode(event, request)` – sets address fields and geocodes if outdoor.  
  5. Save event.  
  6. If categories provided, map each ID to a `Category` and create `EventCategory` objects; add to the set and save again.  
  7. Return `EventDto`.

- **`populateAddressAndGeocode(event, request)`** (new helper):  
  - Sets `venueName`, `street`, `city`, `postalCode`, `country`, `isOutdoor` from request.  
  - If `isOutdoor` is `true` and `city` is provided, calls `GeocodingService.getCoordinates()` and sets `latitude`/`longitude` (or leaves `null` on failure).

- **`createDraft(...)`**:  
  - Similar but uses `eventFactory.createDraft()` which sets status to `DRAFT` and skips date validation.  
  - **NEW**: Also calls `populateAddressAndGeocode()` so address fields are stored.

- **`updateEvent(...)`**:  
  - **NEW**: Calls `populateAddressAndGeocode()` to update address fields and re‑geocode if needed.

- **`publishDraft(eventId, userEmail)`**:  
  - Ensure user is host.  
  - Ensure status is `DRAFT`.  
  - Re‑validate dates (end > start, start > now).  
  - Determine new status based on trust (PUBLISHED if TRUSTED_HOST or ADMIN, else UNDER_REVIEW).  
  - Save and return.

- **`getEvent(eventId, currentUserEmail)`**:  
  - Fetches event; if `deletedAt != null`, only host or admin can see it; otherwise throws 404.  
  - If status is PUBLISHED and not deleted, increments view count.  
  - Builds `EventDto` with `currentUserId` to populate `isHost` and `myRsvpStatus` (by querying `RsvpRepository`).  
  - **NEW**: Weather fields are automatically attached by `EventMapper` (see below).

- **`getPublishedEvents(...)`**:  
  - Delegates to `eventRepository.findPublishedWithFilters` with status `PUBLISHED`.  
  - Maps each to `EventDto` with current user's RSVP status and **weather data**.

- **`cancelEvent(...)`**:  
  - Sets status to `CANCELLED` and stores `cancellationReason`.  
  - Notifies all `GOING` and `WAITLISTED` attendees via `NotificationEventPublisher`.  
  - **Note**: Does **not** automatically free capacity (the RSVPs remain but status changed). Future RSVP logic checks capacity, but cancellations do not decrement `currentRsvpCount` because they are CANCELLED, not GOING.

- **`deleteEvent(...)`** (soft delete):  
  - Sets `deletedAt = Instant.now()`.  
  - Only host or admin.

- **`permanentlyDeleteEvent(...)`**:  
  - Only if already soft‑deleted or admin.  
  - Deletes all media files (including thumbnails).  
  - Deletes associated RSVPs, reviews, reports (via `deleteAllBy...`).  
  - Then deletes the event.

- **`restoreEvent(...)`**:  
  - Clears `deletedAt`.  
  - If event already ended, sets status to `COMPLETED`.

- **`addMedia(...)`**:  
  - Validates counts against `StorageProperties.maxImagesPerEvent` (5) and `maxVideosPerEvent` (2).  
  - For each image, stores the file, generates thumbnails via `ThumbnailService`, and creates an `EventMedia` record with `displayOrder` set to the current count (so new images appear at the end).  
  - For videos, no thumbnails.

- **`removeMedia(...)`**:  
  - Deletes the physical file and its thumbnails, then removes from the list.

- **`reorderMedia(...)`**:  
  - Accepts a list of media IDs in the desired order.  
  - Validates all IDs belong to the event, then sets `displayOrder` to the index in the list.

- **`generateCheckInCode(...)`**:  
  - Generates a 6‑character alphanumeric code (UUID substring) and stores it in `Event.checkInCode`.  
  - Only host can generate.

- **`saveOfficialEvent(Event)`**:  
  - Used by MQTT listener to persist events from AStA.  
  - Simply saves and returns `EventDto`.

**`EventLifecycleService.java`**  
- `@Scheduled(cron = "0 0 * * * *")` – every hour at minute 0.  
- Finds all `PUBLISHED` events with `endTime < now()` and sets status to `COMPLETED`.  
- This feeds the trust system (completed events count).

**`EventSseService.java`**  
- Maintains a `ConcurrentHashMap<UUID, List<SseEmitter>>`.  
- `subscribe(eventId)` creates a new `SseEmitter` with 5‑minute timeout. Adds to the list, sends a `connected` event.  
- `notifyRsvpUpdate(eventId, currentCount, maxCapacity)` – sends an `rsvp-update` event to all emitters with payload `{eventId, currentCount, maxCapacity, spotsRemaining, isFull}`.  
- `notifyWaitlistUpdate(eventId, waitlistCount)` – sends `waitlist-update`.  
- `notifyEventCancelled(eventId)` – sends `event-cancelled`.  
- Removes dead emitters on completion/timeout/error.

**`SearchService.java`**  
- Queries `EventRepository` for top 5 events matching title, `CategoryRepository` for categories, `UserRepository` for users, and `EventRepository` for distinct locations.  
- Returns `SearchSuggestionDto` list with type, value, id, subtitle.

**`SlugGenerator.java`**  
- Converts title to a slug (lowercase, remove diacritics, replace non‑word chars with hyphens, collapse multiple hyphens).  
- Checks uniqueness in DB; if exists, appends `-1`, `-2`, etc.  
- **Note**: This check is done **before** the event is saved, but there is a small race condition if two events are created simultaneously with the same title. The `slug` column has a unique constraint, so the second would fail with `DataIntegrityViolationException`. The code does not handle that retry – it would bubble up to the global handler. **Improvement**: Use a retry mechanism or optimistic locking.

#### 2.2.4 Controllers (`events/controller`)

**`EventController.java`** – main user‑facing endpoints.  
- `POST /api/events` – create event (authenticated).  
- `POST /api/events/draft` – create draft (authenticated).  
- `PUT /api/events/{id}/publish` – publish draft (authenticated).  
- `GET /api/events/{id}` – event detail (authenticated).  
- `GET /api/events/by-slug/{slug}` – detail by slug.  
- `GET /api/events` – published events feed with filters (category, date range, location, search) and pagination.  
- `GET /api/events/my-events` – user's hosted events (excludes deleted by default).  
- `PUT /api/events/{id}` – update event (host only).  
- `PATCH /api/events/{id}/cancel` – cancel with optional reason.  
- `DELETE /api/events/{id}` – soft delete (move to trash).  
- `PATCH /api/events/{id}/restore` – restore.  
- `DELETE /api/events/{id}/permanent` – hard delete (admin or host after soft delete).  
- Media endpoints: `POST /api/events/{id}/media` (multipart), `DELETE /api/events/{id}/media/{mediaId}`, `PATCH /api/events/{id}/media/reorder`.  
- Check‑in code: `GET /api/events/{id}/check-in-code`.

**`PublicEventController.java`**  
- `GET /api/public/events` – published feed (no auth). Uses `eventService.getPublishedEvents()` with `null` as current user, so `myRsvpStatus` and `isHost` are null/false.  
- `GET /api/public/events/{id}` – returns only if status is PUBLISHED; otherwise throws 404.  
- `GET /api/public/events/slug/{slug}` – same.  
- `GET /api/public/events/featured` – returns next 6 upcoming events.

**`AdminEventController.java`**  
- `GET /api/admin/events` – all events (with status filter).  
- `GET /api/admin/events/pending` – events with status UNDER_REVIEW.  
- `PATCH /api/admin/events/{id}/approve` – sets to PUBLISHED, sends notification.  
- `PATCH /api/admin/events/{id}/reject` – sets to CANCELLED, sends notification.  
- `PATCH /api/admin/events/{id}/flag` – sets to UNDER_REVIEW.  
- Bulk operations: `POST /api/admin/events/bulk-approve` and `bulk-reject` – accept a list of event IDs (max 50) and process each; return success/failure counts.  
- **Important**: Bulk operations use a simple loop; if one fails, it continues. The `reason` for rejection is stored.

**`AdminDashboardController.java`**  
- `GET /api/admin/dashboard` – returns stats: pending events, open reports, total users, new users today, events this week, recent reports, recent pending events.

**`CategoryController.java`** – public list of categories (ordered by sortOrder).  
**`AdminCategoryController.java`** – admin CRUD for categories (POST, PUT, DELETE).

**`EventSseController.java`**  
- `GET /api/events/stream/{eventId}` – returns `SseEmitter` (produces `text/event-stream`).  
- The client must include JWT as query param `?token=` (since EventSource cannot set headers).  
- **Security**: The `JwtAuthFilter` allows token extraction from query param, so this works.

---

### 2.3 Identity Module (`identity`)

#### 2.3.1 Domain Model

**`User.java`**  
- Fields: UUID id, universityEmail (unique), passwordHash, displayName, bio, profileImageUrl, Role (STUDENT, ADMIN), TrustLevel (NEW, TRUSTED_HOST, FLAGGED), isVerified (boolean), createdAt.  
- `isVerified` is used to block login until email confirmed.

**`VerificationToken.java`** – token string, User, expiryDate (24h).  
**`PasswordResetToken.java`** – similar, expiry 1h.  
**`UserPreference.java`** – one‑to‑one with User (shared PK via `@MapsId`). Stores notification settings, timezone, language.

#### 2.3.2 Repositories

**`UserRepository.java`**  
- `findByUniversityEmail`, `existsByUniversityEmail`.  
- `updateTrustLevel` (atomic update).  
- `searchByDisplayNameOrEmail` (paged).  
- `searchByDisplayNameOrEmailAndTrustLevel`.  
- `countByCreatedAtAfter` – for new users today.  
- `findTop5ByDisplayNameContainingIgnoreCase` – for search suggestions.

**`VerificationTokenRepository`**, **`PasswordResetTokenRepository`** – have `deleteAllByUserId` and `deleteAllExpiredBefore`.

**`UserPreferenceRepository`** – `findByUserId`, `existsByUserId`, `deleteByUserId`.

#### 2.3.3 Services (`identity/service`)

**`UserService.java`** – handles authentication, registration, profile, account deletion, and token management.

**Registration**:
- Checks if email exists; if not, creates user with `isVerified=false`, `trustLevel=NEW`.  
- Hashes password with `BCryptPasswordEncoder`.  
- Saves user, creates `VerificationToken` (24h), sends email via `EmailService`.  
- Returns empty `AuthResponse` (no token).

**Login**:
- Uses `AuthenticationManager`; if success, fetches user; checks `trustLevel` not FLAGGED.  
- Builds access/refresh tokens using `JwtUtil`.  
- Returns `AuthResponse` with tokens and user DTO.

**Verify**:
- Looks up token; checks expiry; if valid, sets `isVerified=true`, deletes token.

**Forgot/Reset Password**:
- Creates `PasswordResetToken` (1h), sends email.  
- On reset, validates token, updates password, deletes token.

**Refresh**:
- Validates refresh token, checks not blacklisted, generates new access token, blacklists old refresh token.

**Logout** – blacklists token.

**Update Profile**:
- Uses `@ModelAttribute` to bind multipart.  
- Updates displayName, bio, and optionally profile image (deletes old image).

**Delete Account**:
- Cascades: deletes avatar, all preferences, verification/reset tokens, all RSVPs, reviews, reports, notifications, and all hosted events (with their media and dependent records).  
- Finally deletes the user and clears security context.  
- **Note**: The method uses `notificationRepository.deleteAllByUserId(userId)`, `reviewVoteRepository.deleteAllByUserId(userId)`, etc. – these are bulk delete queries.

**`TrustLevelService.java`**  
- `updateTrustLevel(userId, newLevel)` – sets trust, and if new level is FLAGGED, **freezes** all PUBLISHED events (sets to UNDER_REVIEW).  
- `flagUser(userId)` – convenience.  
- `forcePromoteToTrustedHost(userId)` – admin override.  
- `promoteToTrustedHost(userId)` – checks qualification:  
  - `eventRepository.countCompletedReviewedEventsByHostId(userId) >= 3`  
  - `reviewRepository.calculateAverageRatingByHostId(userId) >= 4.0`  
  - If yes, updates trust level and sends notification.  
- `qualifiesForTrustedHost(userId)` – used externally.  
- `getQualificationStatus(userId)` – returns a DTO with details.

**`UserDetailsServiceImpl.java`**  
- Loads user by email.  
- Builds `UserDetails` with authorities `ROLE_<role>`.  
- Sets `accountLocked = trustLevel == FLAGGED`.  
- Sets `disabled = !user.isVerified()`.  
- **Important**: This is used by Spring Security during authentication; it prevents login for unverified and flagged accounts.

**`EmailService.java`**  
- Uses `JavaMailSender` to send plain‑text emails with verification and reset links.  
- The frontend URL is read from `${app.frontend-url}`.

**`UserPreferenceService.java`**  
- Returns default preferences if not found.  
- Updates preferences from DTO.

#### 2.3.4 Controllers

**`UserController.java`**  
- Public auth endpoints: `/register`, `/login`, `/refresh`, `/logout`, `/verify`, `/resend-verification`, `/forgot-password`, `/reset-password`.  
- Authenticated profile endpoints: `/me` (GET, POST multipart, DELETE), `/me/password`, `/me/trust-status`.  
- **Note**: `/me` uses `@PostMapping` with `multipart/form-data` because it handles file uploads.

**`AdminUserController.java`**  
- Lists users (search, filter by trust).  
- Get user.  
- Update trust level (accepts JSON body with `trustLevel`).  
- Flag user.  
- Promote to trusted host (with `force` param).  
- Delete user.

**`PublicUserController.java`**  
- `/api/public/users/{userId}` – returns public profile with trust metrics (completed events with reviews, average rating).

**`UserPreferenceController.java`**  
- `GET /api/auth/me/preferences`  
- `PUT /api/auth/me/preferences` (updates all fields).

---

### 2.4 Moderation Module (`moderation`)

#### 2.4.1 Domain Model

**`Review.java`**  
- `UUID id`, `Event event`, `User reviewer`, `Integer rating` (1–5), `String comment`, `Instant createdAt`.  
- Unique constraint on `(event_id, reviewer_id)`.  
- `helpfulCount` (denormalized) – incremented/decremented atomically.

**`ReviewVote.java`**  
- `UUID id`, `Review review`, `User user`, `String voteType` (currently `"HELPFUL"`).  
- Unique constraint on `(review_id, user_id)`.

**`Report.java`**  
- `UUID id`, `Event event`, `User reporter`, `ReportReason` (SPAM, INAPPROPRIATE, FAKE_EVENT, OTHER), `String details`, `ReportStatus` (OPEN, RESOLVED), `Instant createdAt`.

#### 2.4.2 Repositories

**`ReviewRepository.java`**  
- `calculateAverageRatingByHostId(UUID userId)` – JPQL `AVG(r.rating)`.  
- `findByEventIdOrderByHelpfulCountDescCreatedAtDesc` – used for paginated review listing.  
- `existsByEventIdAndReviewerId` – prevents duplicate reviews.  
- `incrementHelpfulCount` / `decrementHelpfulCount` – atomic updates.  
- Bulk delete: `deleteAllByEventId`, `deleteAllByUserId`.

**`ReviewVoteRepository.java`**  
- `findByReviewIdAndUserId`, `existsBy...`, `countByReviewId`.  
- Bulk delete: `deleteAllByReviewId`, `deleteAllByUserId`.

**`ReportRepository.java`**  
- `findByStatus`, `findByReason`, `findByStatusAndReason`.  
- Bulk delete: `deleteAllByEventId`, `deleteAllByReporterId`.  
- `countByStatus(ReportStatus.OPEN)` – for dashboard.

#### 2.4.3 Services

**`ReviewService.java`**  
- **Create Review**:  
  - Only if event has ended (`endTime < now`).  
  - User must have an RSVP with status `ATTENDED`.  
  - No existing review.  
  - After saving, call `trustLevelService.promoteToTrustedHost(event.getHost().getId())` – this may promote the host if they now qualify.  
  - Send `NEW_REVIEW` notification to host.  
- **Helpful Vote**:  
  - Toggle: if vote exists, delete and decrement; else create and increment.  
  - Cannot vote on own review.  
- **Report Review**:  
  - Creates a `Report` with reason `INAPPROPRIATE`, linked to the review's event.  
  - Details include the review ID and user‑supplied reason.  
- **List reviews**: Uses the sorted repository method to show most helpful first.

**`ReportService.java`**  
- **Create Report**:  
  - Cannot report own event.  
  - If reason is `INAPPROPRIATE` or `FAKE_EVENT`, publishes an MQTT alert via `AlertMqttGateway` (inner interface with `@MessagingGateway`).  
  - The alert payload is a JSON map with reportId, eventId, title, reason, details, reporterEmail, hostEmail, timestamp, severity.  
- **Resolve Report**:  
  - Sets status to `RESOLVED`.  
  - Optionally flags the event (sets status to `UNDER_REVIEW`).  
- **List reports**: Filter by status and/or reason.

#### 2.4.4 Controllers

**`ReviewController.java`**  
- `POST /api/reviews` – create.  
- `GET /api/reviews/event/{eventId}` – paginated, sorted by helpfulness.  
- `GET /api/reviews/host/{hostId}` – reviews of events hosted by that user.  
- `DELETE /api/reviews/{reviewId}` – only reviewer or admin.  
- `POST /api/reviews/{reviewId}/helpful` – toggle.  
- `POST /api/reviews/{reviewId}/report` – report.

**`ReportController.java`**  
- `POST /api/reports` – create (authenticated).  
- `GET /api/admin/reports` – list (admin).  
- `GET /api/admin/reports/{id}` – detail.  
- `GET /api/admin/reports/status/{status}` – filter.  
- `GET /api/admin/reports/reason/{reason}` – filter.  
- `PATCH /api/admin/reports/{id}/resolve` – resolve with optional `flagEvent` param.  
- `DELETE /api/admin/reports/{id}` – delete.

---

### 2.5 Registration Module (`registration`)

#### 2.5.1 Domain Model

**`Rsvp.java`**  
- `UUID id`, `Event event`, `User user`, `RsvpStatus` (GOING, WAITLISTED, CANCELLED, ATTENDED), `String cancellationReason`, `Instant createdAt`.  
- Unique `(event_id, user_id)`.

#### 2.5.2 Repositories

**`RsvpRepository.java`**  
- `findByEventIdAndUserId` – for lookups.  
- `countByEventIdAndStatus` – for capacity/status counts.  
- `findFirstByEventIdAndStatusOrderByCreatedAtAsc` – oldest WAITLISTED for promotion.  
- `countByEventIdAndStatusAndCreatedAtLessThan` – for position calculation.  
- `findByEventIdAndStatus` – list.  
- `deleteAllByEventId`, `deleteAllByUserId` – bulk.

#### 2.5.3 Services

**`RsvpService.java`**  
- **Create RSVP**:  
  - Event must be PUBLISHED, not past, not deleted.  
  - Check existing RSVP: if CANCELLED, reactivate (re‑enter); otherwise prevent duplicate.  
  - Atomic increment: `eventRepository.incrementRsvpCount(eventId)` returns 1 if success (capacity available), 0 if full.  
  - If 1 → status GOING; else WAITLISTED.  
  - Save RSVP.  
  - Broadcast SSE `rsvp-update`.  
- **Cancel RSVP**:  
  - Only if status is GOING (cannot cancel WAITLISTED? Actually the code allows cancellation of any except ATTENDED).  
  - If was GOING, decrement count and publish `RsvpCancelledEvent`.  
  - Store cancellation reason.  
  - Notify host via `RSVP_CANCELLED` notification.  
- **Check‑In** (self):  
  - User provides the `checkInCode` (from host's QR).  
  - Validates against event's stored code.  
  - RSVP must be GOING; transitions to ATTENDED.  
- **Mark Attended** (host):  
  - Host can mark a specific RSVP as ATTENDED (no code needed).  

**`WaitlistService.java`**  
- **Promote next**:  
  - Triggered by `RsvpCancelledEvent`.  
  - Locks event with `findByIdLocked` (pessimistic).  
  - Checks if capacity available (`currentRsvpCount < maxCapacity`).  
  - Finds oldest WAITLISTED RSVP (`findFirstByEventIdAndStatusOrderByCreatedAtAsc`).  
  - Changes status to GOING, increments count, saves.  
  - Sends `WAITLIST_PROMOTED` notification to user.  
  - Broadcasts SSE updates (RSVP and waitlist count).  
- **Host manual promote**:  
  - Similar but requires host permission and accepts RSVP ID.  
  - Validates status WAITLISTED and capacity.  

#### 2.5.4 Observer Pattern

- `RsvpEventPublisher` – publishes `RsvpCancelledEvent` (Spring `ApplicationEvent`).  
- `WaitlistPromotionListener` – `@EventListener` for `RsvpCancelledEvent`; calls `waitlistService.promoteNextWaitlistedUser()`.  
- This decouples cancellation from promotion.

#### 2.5.5 Controller

**`RsvpController.java`**  
- `POST /api/events/{eventId}/rsvps` – create.  
- `GET /api/events/{eventId}/rsvps/me` – my RSVP.  
- `GET /api/rsvps/me` – my RSVPs paginated.  
- `PATCH /api/rsvps/{rsvpId}/cancel` – cancel (with reason).  
- `GET /api/rsvps/{rsvpId}/position` – waitlist position.  
- Host endpoints:  
  - `GET /api/events/{eventId}/rsvps` – list all (host only).  
  - `GET /api/events/{eventId}/rsvps/status/{status}` – filter.  
  - `PATCH /api/events/{eventId}/rsvps/{rsvpId}/attended` – mark attended.  
  - `PATCH /api/events/{eventId}/rsvps/{rsvpId}/promote` – host promotes waitlisted.  
- Check‑in: `POST /api/events/{eventId}/check-in` – self check‑in.

---

### 2.6 Notification Module (`notification`)

#### 2.6.1 Domain Model

**`Notification.java`**  
- `UUID id`, `User user` (LAZY), `NotificationType type`, `String title`, `String message`, `UUID relatedEventId`, `UUID relatedUserId`, `String actionUrl`, `boolean isRead`, `Instant createdAt`.  
- Indexes on `(user_id, is_read)` and `(created_at)`.

**`NotificationType.java`** – enum with values: EVENT_APPROVED, EVENT_REJECTED, WAITLIST_PROMOTED, NEW_REVIEW, TRUST_PROMOTED, EVENT_CANCELLED, RSVP_CANCELLED, REPORT_RESOLVED.

#### 2.6.2 Repositories

**`NotificationRepository.java`**  
- `findByUserIdOrderByCreatedAtDesc` – paginated.  
- `countByUserIdAndIsRead` – badge.  
- `findByIdAndUserId` – for ownership check.  
- `markAllAsReadByUserId` – update query.  
- `existsByUserIdAndTypeAndRelatedEventId` – deduplication.  
- Bulk delete: `deleteAllByUserId`, `deleteAllByRelatedEventId`.

#### 2.6.3 Event‑Driven Architecture

- `NotificationEventPublisher` – publishes `NotificationEvent` (extends `ApplicationEvent`).  
- `NotificationEventListener` – `@EventListener`; calls `notificationService.createNotification(...)`.  
- This allows any service to publish a notification without directly injecting `NotificationService`, reducing coupling.

#### 2.6.4 Service

**`NotificationService.java`**  
- `createNotification(userId, type, title, message, relatedEventId, relatedUserId, actionUrl)` – checks user exists, deduplicates (if same type and event already exists, skip), saves.  
- `getNotifications` – paginated, with unread filter.  
- `markAsRead`, `markAllAsRead`, `deleteNotification`.

#### 2.6.5 Controller

**`NotificationController.java`**  
- `GET /api/notifications` – list (with `unreadOnly` param).  
- `GET /api/notifications/unread-count` – badge.  
- `PATCH /api/notifications/{id}/read` – mark.  
- `PATCH /api/notifications/read-all` – mark all.  
- `DELETE /api/notifications/{id}` – delete.

---

### 2.7 MQTT Integration (`mqtt`)

#### 2.7.1 Configuration (`MqttConfig.java`)

- Defines a `DefaultMqttPahoClientFactory` with options: serverURIs, cleanSession, automaticReconnect.  
- **Inbound (Events)**: `MqttPahoMessageDrivenChannelAdapter` subscribing to `university/events` (QoS 1). Uses `clientId + "-events"` and a `DefaultPahoMessageConverter`. Output channel: `mqttEventInputChannel`.  
- **Inbound (Weather)**: `MqttPahoMessageDrivenChannelAdapter` subscribing to **`campus/weather`** (QoS 1). Uses `clientId + "-weather"`. Output channel: `weatherInputChannel`.  
- **Outbound (Alerts)**: `MqttPahoMessageHandler` for `university/alerts` (QoS 1). Uses `clientId + "-alert-publisher"`. Output channel: `mqttAlertOutboundChannel`.  
- Both use the same factory.

#### 2.7.2 Official Event Listener (`OfficialEventListener.java`)

- `@ServiceActivator(inputChannel = "mqttEventInputChannel")` – method `handleIncomingEvent(@Payload String payload, @Header("mqtt_topic") String topic)`.  
- Parses JSON to `OfficialEventMessage` using `ObjectMapper`.  
- Calls `eventFactory.createOfficialEvent(message)` – returns an `Event`.  
- Calls `eventService.saveOfficialEvent(event)` – persists.  
- Logs success.  
- **Potential issue**: If the message is malformed, it logs error but does not re‑throw; the message is consumed (acked) because the adapter uses auto‑acknowledgement. For QoS 1, this means the message is considered delivered even if processing fails. **Improvement**: Use a manual ack or handle errors by publishing to a dead‑letter queue.

#### 2.7.3 Weather MQTT Listener (`WeatherMqttListener.java`) – **NEW**

- `@ServiceActivator(inputChannel = "weatherInputChannel")` – method `handleWeatherMessage(@Payload String payload)`.  
- Deserializes `WeatherPayload` containing a list of `CityForecast` objects.  
- For each forecast, uses `CityWeatherRepository` to upsert (insert or update) the record based on `(city, date)` composite key.  
- Sets `updatedAt` to current timestamp.  
- **Important**: This listener is **stateless** – it simply stores the data; the risk engine reads from the database when events are retrieved.

#### 2.7.4 Alert Publishing

- In `ReportService.createReport()`, for critical reasons, it uses the inner `AlertMqttGateway` (interface with `@MessagingGateway(defaultRequestChannel = "mqttAlertOutboundChannel")`) to send a JSON payload.  
- The gateway is defined as a nested interface inside `ReportService`. This is a neat way to define a gateway without a separate config class.  
- The JSON payload includes report details, severity, and timestamps.

---

### 2.8 Weather Module (`weather`) – **NEW**

This module handles **ingestion and evaluation** of weather forecasts.

#### 2.8.1 Domain Model

**`CityWeather.java`**  
- `@Entity` with composite `@IdClass(CityWeatherId.class)`.  
- Fields:  
  - `String city` (PK)  
  - `LocalDate date` (PK)  
  - `Integer conditionCode` – WMO weather code (e.g., 3 = partly cloudy, 61 = rain)  
  - `Integer tempMax` – maximum temperature (°C)  
  - `Integer rainProbability` – precipitation probability (0‑100)  
  - `Integer windSpeed` – maximum wind speed (km/h)  
  - `Instant updatedAt` – timestamp of last update  

**`CityWeatherId.java`** – composite key class with `city` and `date`.

**`WeatherRisk.java`** – enum: `GOOD`, `MODERATE`, `DANGER`, `CANCELLED`.

#### 2.8.2 Repository

**`CityWeatherRepository.java`**  
- `findByCityAndDate(String city, LocalDate date)` – used by `EventMapper`.  
- `findByCityAndDateBetween(String city, LocalDate start, LocalDate end)` – for future extension.

#### 2.8.3 DTOs

**`WeatherPayload.java`** – received from MQTT:  
```java
{
  Instant timestamp;
  List<CityForecast> forecasts;
}
```

**`CityForecast.java`** – same structure as `CityWeather` but used for transport.

**`WeatherAssessment.java`** – returned by the risk engine:
```java
{
  WeatherRisk risk;
  String recommendation;
  List<String> warnings;
  Integer temperature;
  Integer rainProbability;
  Integer windSpeed;
  Integer conditionCode;
  boolean available;
}
```

#### 2.8.4 Service – `WeatherRiskEngine.java`

- Evaluates a `CityWeather` object and returns a `WeatherAssessment`.  
- **Threshold logic**:  
  - **Thunderstorm** (WMO code 95‑99) → `CANCELLED`.  
  - **Rain > 70%** → `DANGER`; **> 40%** → `MODERATE`.  
  - **Wind > 60 km/h** → `DANGER`; **> 30 km/h** → `MODERATE`.  
  - **Temperature > 35°C** → `DANGER`; **> 30°C** → `MODERATE`.  
- Generates a human‑readable `recommendation` string.  
- Collects `warnings` for each threshold exceeded.  
- If `forecast == null`, returns `unavailable()` (risk GOOD, recommendation: *"Forecast not yet available (check 14 days in advance)."*)

#### 2.8.5 Integration with EventMapper

**`EventMapper.java`** – updated with new dependencies:
```java
private final CityWeatherRepository cityWeatherRepository;
private final WeatherRiskEngine riskEngine;
```

In `toDto(Event, UUID)`, after building the `EventDto.EventDtoBuilder`, it adds a weather block:

```java
if (event.isOutdoor() && event.getCity() != null && event.getStartTime() != null) {
    LocalDate eventDate = event.getStartTime().atZone(ZoneId.systemDefault()).toLocalDate();
    LocalDate now = LocalDate.now();
    if (!eventDate.isBefore(now) && eventDate.isBefore(now.plusDays(14))) {
        cityWeatherRepository.findByCityAndDate(event.getCity(), eventDate)
                .ifPresent(forecast -> {
                    WeatherAssessment assessment = riskEngine.assess(forecast);
                    dtoBuilder.weatherRisk(assessment.getRisk())
                              .weatherRecommendation(assessment.getRecommendation())
                              .weatherTemperature(forecast.getTempMax())
                              .weatherRainProbability(forecast.getRainProbability())
                              .weatherAvailable(assessment.isAvailable());
                });
    }
}
```

**Key points**:
- Weather is **only** evaluated for outdoor events (`isOutdoor == true`).  
- Only if the event date is within the **next 14 days** (the forecast window).  
- If no forecast exists, the fields remain `null` / `weatherAvailable = null`.  
- The risk assessment is computed **on‑the‑fly** at read time, using the latest stored forecast.

#### 2.8.6 DTO Updates

**`CreateEventRequest.java`** – added address fields:
```java
private String venueName;
private String street;
private String city;
private String postalCode;
private String country = "DE";
private boolean isOutdoor = false;
```

**`EventDto.java`** – added weather fields:
```java
private WeatherRisk weatherRisk;
private String weatherRecommendation;
private Integer weatherTemperature;
private Integer weatherRainProbability;
private Boolean weatherAvailable;
```

---

### 2.9 Search Module (`events/controller/SearchController` + `events/service/SearchService`)

- `GET /api/search/suggestions?q=<query>&type=ALL|EVENT|CATEGORY|USER|LOCATION`.  
- `SearchService` queries up to 5 results per type using `findTop5By...` methods.  
- Returns `SearchSuggestionDto` list.

---

## 3. Backend‑Weather Detailed Analysis – **NEW**

This is a **standalone Spring Boot service** that acts as the external weather data provider.

### 3.1 Main Application

**`WeatherApplication.java`**  
- `@SpringBootApplication` with `@EnableScheduling`.  
- Starts the service on port `8082` (configurable).

### 3.2 Configuration

**`CityList.java`**  
- Defines a `Map<String, double[]>` with **100+ major German cities** and their coordinates (latitude, longitude).  
- Includes all state capitals and major university cities (Dortmund, Berlin, Munich, Cologne, etc.).  
- This list is used to fetch weather for each city individually.

**`MqttPublisherConfig.java`**  
- Similar to the MQTT config in `backend-main`, but **only outbound**.  
- Uses `clientId = "weather-publisher"`.  
- Publish to topic **`campus/weather`** (configurable via `mqtt.topic.weather`).  
- QoS 1, async.

### 3.3 DTOs

**`CityForecast.java`** – same structure as in `backend-main` (city, date, conditionCode, tempMax, rainProbability, windSpeed).  
**`WeatherPayload.java`** – contains `timestamp` and a list of `CityForecast`.

### 3.4 Service – `WeatherFetcher.java`

- `@Scheduled(cron = "0 0 */6 * * *")` – runs every 6 hours.  
- **For each city** in `CityList.CITIES`:  
  - Builds a URL to Open‑Meteo API:  
    ```
    https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=Europe/Berlin&forecast_days=14
    ```
  - Fetches JSON using `RestTemplate`.  
  - Parses `daily` object: extracts `time` array, `weathercode`, `temperature_2m_max`, `precipitation_probability_max`, `windspeed_10m_max`.  
  - For each day (14 days), creates a `CityForecast` object.  
  - Adds to the global list.  
- After processing all cities, calls `MqttPublisher.publishForecasts(allForecasts)`.

**Error handling**: If a city fails (e.g., network error), it logs the error and continues with the next city – ensuring partial updates.

### 3.5 Service – `MqttPublisher.java`

- Inner `@MessagingGateway` interface `WeatherMqttGateway` with method `void sendWeather(String payload)`.  
- `publishForecasts()` serialises the `WeatherPayload` to JSON and sends it via the gateway.  
- Logs the number of city‑days published.

---

## 4. Database Schema & Migrations

The Flyway migrations are under `src/main/resources/db/migration/`.

### V1__create_users.sql

- **Users** table: `id` UUID PK, `university_email` VARCHAR(255) UNIQUE NOT NULL, `password_hash` VARCHAR(255) NOT NULL, `display_name` VARCHAR(50) NOT NULL, `bio` TEXT, `profile_image_url` VARCHAR(255), `role` VARCHAR(20) NOT NULL, `trust_level` VARCHAR(20) NOT NULL, `is_verified` BOOLEAN NOT NULL DEFAULT FALSE, `created_at` TIMESTAMP NOT NULL.  
- **Verification tokens**: `id` UUID PK, `token` VARCHAR(255) UNIQUE NOT NULL, `user_id` UUID REFERENCES users(id) ON DELETE CASCADE, `expiry_date` TIMESTAMP NOT NULL.  
- **Password reset tokens**: similar.

### V2__create_events_and_categories.sql

- **Categories**: `id` SERIAL PK, `name` VARCHAR(50) UNIQUE NOT NULL, `icon` VARCHAR(50), `color` VARCHAR(7), `sort_order` INTEGER NOT NULL DEFAULT 0.  
- **Events**: `id` UUID PK, `host_id` UUID REFERENCES users(id) ON DELETE CASCADE, `title` VARCHAR(100) NOT NULL, `description` TEXT, `location` VARCHAR(200) NOT NULL, `start_time` TIMESTAMP NOT NULL, `end_time` TIMESTAMP NOT NULL, `max_capacity` INTEGER NOT NULL, `current_rsvp_count` INTEGER NOT NULL DEFAULT 0, `status` VARCHAR(20) NOT NULL, `slug` VARCHAR(150) UNIQUE, `view_count` BIGINT NOT NULL DEFAULT 0, `deleted_at` TIMESTAMP, `check_in_code` VARCHAR(10), `cancellation_reason` TEXT, `created_at` TIMESTAMP NOT NULL.  
- **Event categories**: `event_id` UUID REFERENCES events(id) ON DELETE CASCADE, `category_id` INTEGER REFERENCES categories(id) ON DELETE CASCADE, PRIMARY KEY (event_id, category_id).  
- **Event media**: `id` UUID PK, `event_id` UUID REFERENCES events(id) ON DELETE CASCADE, `url` VARCHAR(255) NOT NULL, `media_type` VARCHAR(20) NOT NULL, `filename` VARCHAR(255), `thumbnail_url` VARCHAR(500), `medium_url` VARCHAR(500), `display_order` INTEGER NOT NULL DEFAULT 0, `created_at` TIMESTAMP NOT NULL.

### V3__create_rsvps.sql

- **RSVPs**: `id` UUID PK, `event_id` UUID REFERENCES events(id) ON DELETE CASCADE, `user_id` UUID REFERENCES users(id) ON DELETE CASCADE, `status` VARCHAR(20) NOT NULL, `cancellation_reason` TEXT, `created_at` TIMESTAMP NOT NULL, UNIQUE(event_id, user_id).  
- Indexes: on `event_id`, `user_id`, `status`, `created_at`.

### V4__create_moderation.sql

- **Reviews**: `id` UUID PK, `event_id` UUID REFERENCES events(id) ON DELETE CASCADE, `reviewer_id` UUID REFERENCES users(id) ON DELETE CASCADE, `rating` INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), `comment` TEXT, `helpful_count` INTEGER NOT NULL DEFAULT 0, `created_at` TIMESTAMP NOT NULL, UNIQUE(event_id, reviewer_id).  
- **Review votes**: `id` UUID PK, `review_id` UUID REFERENCES reviews(id) ON DELETE CASCADE, `user_id` UUID REFERENCES users(id) ON DELETE CASCADE, `vote_type` VARCHAR(20) NOT NULL, UNIQUE(review_id, user_id).  
- **Reports**: `id` UUID PK, `event_id` UUID REFERENCES events(id) ON DELETE CASCADE, `reporter_id` UUID REFERENCES users(id) ON DELETE CASCADE, `reason` VARCHAR(50) NOT NULL, `details` TEXT, `status` VARCHAR(20) NOT NULL DEFAULT 'OPEN', `created_at` TIMESTAMP NOT NULL.  
- **Notifications**: `id` UUID PK, `user_id` UUID REFERENCES users(id) ON DELETE CASCADE, `type` VARCHAR(50) NOT NULL, `title` VARCHAR(255) NOT NULL, `message` TEXT NOT NULL, `related_event_id` UUID, `related_user_id` UUID, `action_url` VARCHAR(255), `is_read` BOOLEAN NOT NULL DEFAULT FALSE, `created_at` TIMESTAMP NOT NULL, INDEX `idx_notif_user_read` (`user_id`, `is_read`), INDEX `idx_notif_created` (`created_at`).  
- **User preferences**: `user_id` UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, `email_notifications` BOOLEAN NOT NULL DEFAULT TRUE, `push_notifications` BOOLEAN NOT NULL DEFAULT TRUE, `notify_on_rsvp_change` BOOLEAN NOT NULL DEFAULT TRUE, `notify_on_review` BOOLEAN NOT NULL DEFAULT TRUE, `timezone` VARCHAR(50) NOT NULL DEFAULT 'Europe/Berlin', `language` VARCHAR(10) NOT NULL DEFAULT 'de'.

### V5__add_weather_fields.sql – **NEW**

```sql
ALTER TABLE events
    ADD COLUMN venue_name VARCHAR(100),
    ADD COLUMN street VARCHAR(200),
    ADD COLUMN city VARCHAR(100),
    ADD COLUMN postal_code VARCHAR(10),
    ADD COLUMN country CHAR(2) DEFAULT 'DE',
    ADD COLUMN latitude DOUBLE PRECISION,
    ADD COLUMN longitude DOUBLE PRECISION,
    ADD COLUMN is_outdoor BOOLEAN DEFAULT FALSE;

CREATE TABLE city_weather (
    city VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    condition_code INT,
    temp_max INT,
    rain_probability INT,
    wind_speed INT,
    updated_at TIMESTAMP,
    PRIMARY KEY (city, date)
);
```

**All foreign keys have `ON DELETE CASCADE`**, which simplifies manual deletion.

---

## 5. Security in Depth

### 5.1 JWT Tokens – Claims & Validation

- **Access token** contains: `sub` (email), `userId`, `role`, `trustLevel`, `type`=access, `iat`, `exp`.  
- **Refresh token** contains `sub`, `userId`, `type`=refresh, `iat`, `exp`.  
- Both are signed with HS256.  
- `JwtAuthFilter` validates token and sets `SecurityContext`.  
- `shouldNotFilter()` excludes `/api/auth/**` (except `/me`) and `/api/public/**` – meaning tokens are not required for public endpoints, but if a token is present, it will **still** be processed? Actually, if `shouldNotFilter` returns `true`, the filter is skipped entirely for that request, so no authentication is attempted. That's correct – public endpoints should not require authentication.

### 5.2 Account States

- `isVerified`: `false` initially; after email verification, set to `true`. `UserDetailsServiceImpl` sets `disabled = !user.isVerified()`, so login fails with `DisabledException`.  
- `trustLevel`: `NEW`, `TRUSTED_HOST`, `FLAGGED`.  
  - `TRUSTED_HOST` allows auto‑publishing of events.  
  - `FLAGGED` causes `accountLocked = true` in `UserDetails`, and `JwtAuthFilter` rejects any request from a flagged user (even with valid token) with 403.  
  - When a user is flagged, all their PUBLISHED events are frozen to UNDER_REVIEW (in `TrustLevelService.updateTrustLevel`).

### 5.3 Rate Limiting

- **Auth** endpoints: 5 requests per minute per client IP+URI.  
- **Write** endpoints: 20 requests per minute per client IP+URI.  
- Uses an in‑memory `ConcurrentHashMap`; not suitable for clustered deployment. Could be improved with a distributed cache (Redis).

### 5.4 CORS

- Allowed origins: `http://localhost:5173`, `http://127.0.0.1:5173`, and configurable `${app.frontend-url}`.  
- Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS.  
- Exposed headers: `Authorization`, `X-Refresh-Token`.  
- `allowCredentials=true` – required for sending cookies (though we use headers).  

### 5.5 Password Policy

- Registration: password must be at least 8 chars, contain uppercase, lowercase, digit, special character (regex: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$`).  
- Change password: similar.  
- Reset password: similar.  
- Email validation: `@Pattern` ensures email is not from common free providers and ends with `.de` or `.edu`. This is a **soft** university email check.

---

## 6. Concurrency Control

### 6.1 RSVP Capacity – Atomic Update

The critical section is `RsvpService.createRsvp()` where capacity is checked and incremented. The `incrementRsvpCount` method uses an `UPDATE` statement with a `WHERE` clause that checks `currentRsvpCount < maxCapacity`. This is an **atomic** database operation. Even if two requests arrive simultaneously, only one will succeed in incrementing (the one that reads the current count, finds it below max, and updates). The other will see 0 rows updated and go to WAITLISTED. This avoids the need for explicit locking on the event row for most operations.

### 6.2 Waitlist Promotion – Pessimistic Locking

When a cancellation occurs, `WaitlistService.promoteNextWaitlistedUser()` uses `findByIdLocked`, which performs a `SELECT ... FOR UPDATE`. This locks the event row exclusively, preventing two promotions from running concurrently and potentially double‑promoting (overshooting capacity). After the lock is acquired, it checks capacity and promotes exactly one user. This is safe.

### 6.3 Helpful Votes – Atomic Increment/Decrement

`ReviewService.toggleHelpfulVote()` uses `incrementHelpfulCount` and `decrementHelpfulCount` queries that are atomic. The vote existence check is not atomic (it's a `SELECT` followed by either `INSERT` or `DELETE`), but the `DELETE` is idempotent and the `INSERT` has a unique constraint, so concurrent votes from the same user won't result in duplicates; the second `INSERT` will fail with a constraint violation, which is caught? Actually, it's not caught – it would throw `DataIntegrityViolationException` and be handled by the global handler, returning a 409. To be completely safe, we could use `@Transactional` with retry, but it's acceptable.

---

## 7. Event‑Driven Architecture

### 7.1 Spring Events

- **`NotificationEvent`**: Used to create in‑app notifications. Published by `NotificationEventPublisher`. Listened by `NotificationEventListener`.  
- **`RsvpCancelledEvent`**: Published by `RsvpEventPublisher` when a GOING RSVP is cancelled. Listened by `WaitlistPromotionListener`.  
- **Benefits**: Decoupling of modules; services don't need to know about each other. For example, `RsvpService` doesn't call `WaitlistService` directly; it just publishes an event.  
- **Transactionality**: `@EventListener` methods can be annotated with `@Transactional` and will run in the same transaction as the publisher if the publisher is also transactional (by default). This ensures that the event is handled only if the transaction commits.

### 7.2 SSE (Server‑Sent Events)

- Used for real‑time updates on RSVP counts and waitlist changes.  
- The `EventSseService` maintains emitters per event.  
- On RSVP changes, the service broadcasts to all active listeners.  
- **Limitation**: SSE is one‑way (server to client). For two‑way communication, WebSocket would be needed.  
- **Timeout**: 5 minutes; clients should reconnect.  
- **Security**: JWT passed as query param because `EventSource` cannot set custom headers.

### 7.3 MQTT (Publish‑Subscribe)

- Decouples `backend-main` and `backend-weather`.  
- `backend-weather` publishes **weather forecasts** to `campus/weather`; `backend-main` consumes and updates `city_weather`.  
- `backend-main` publishes **critical reports** to `university/alerts`; can be consumed by external systems (e.g., Slack, email).  
- **QoS 1** ensures at‑least‑once delivery, but the consumer may receive duplicates. The weather listener is idempotent (upsert by PK), so duplicates are safe.

---

## 8. Design Patterns Used

| Pattern | Example | Benefit |
|---------|---------|---------|
| **Factory** | `EventFactory` | Centralizes event creation with different sources; encapsulates status logic. |
| **Adapter** | `EventMessageTarget` / `OfficialEventAdapter` | Converts external message format to internal entity. |
| **Observer** | Spring `ApplicationEvent` / `EventListener` | Decouples modules (e.g., RSVP cancellation → waitlist promotion). |
| **DTO** | All `*Dto` classes | Decouples API contracts from domain models; prevents exposing sensitive fields. |
| **Repository** | Spring Data JPA | Abstraction over data access; provides query methods. |
| **Service Layer** | `*Service` classes | Encapsulates business logic; coordinates repositories and other services. |
| **Builder** | Lombok `@Builder` | Clean object construction for complex entities. |
| **Singleton** | Spring beans | Managed by IoC container. |
| **Template Method** | `JwtAuthFilter.doFilterInternal` | Framework hook. |
| **Scheduled** | `@Scheduled` in `WeatherFetcher` and `EventLifecycleService` | Periodic background tasks. |

---

## 9. Error Handling & API Responses

All endpoints return `ApiResponse<T>` envelopes with `success`, `message`, `data`, `timestamp`.  
- On success: `success=true`, `message` describes operation, `data` contains payload.  
- On failure: `success=false`, `message` contains error description, `data` may be present (validation errors map).  
- **HTTP status codes** reflect the nature of the error (400, 401, 403, 404, 409, 429, 500).  
- **Validation errors**: return 400 with a map of field → error message.  
- **Business rule violations**: throw `IllegalArgumentException` → 400.  
- **Not found**: `ResourceNotFoundException` → 404.  
- **Forbidden**: `ForbiddenActionException` or `AccessDeniedException` → 403.  
- **Conflict**: `CapacityExceededException` or `DataIntegrityViolationException` → 409.  

The `GlobalExceptionHandler` ensures that all exceptions are caught and translated into a consistent format, preventing stack traces from leaking to the client.

---

## 10. Testing Strategy

- **Unit tests** (JUnit 5 + Mockito):  
  - Services (e.g., `EventServiceTest`, `UserServiceTest`, `RsvpServiceTest`) mock dependencies.  
  - Factories and mappers tested.  
  - Security components (filters) tested with mock requests.  
- **Integration tests**:  
  - `@SpringBootTest` with `@AutoConfigureTestDatabase` (H2) for repository tests.  
  - `MockMvc` tests for controllers, validating JSON responses and security rules.  
- **Test data**: `DummyDataSeeder` provides realistic dataset.  
- **Missing**: Tests for MQTT listeners, SSE, and end‑to‑end flows. Could be added with `Testcontainers` for Mosquitto and PostgreSQL.

---

## 11. Deployment & Configuration

- **Spring Boot profiles**: `dev` (H2, seed data) and `prod` (PostgreSQL, Flyway).  
- **Docker**: Each module has a `Dockerfile` (multi‑stage). `docker-compose.yml` orchestrates Postgres, Mosquitto, both backends, and frontend.  
- **Environment variables** override properties (e.g., `SPRING_DATASOURCE_URL`, `JWT_SECRET`, `MQTT_BROKER_URL`).  
- **Flyway migrations** run automatically on startup (if `spring.flyway.enabled=true`).  
- **Logging**: Configured via `application-*.yml`; log levels can be set.

---

## 12. Performance Optimizations & Bottlenecks

### 12.1 Optimizations Already Present

- **Atomic updates** for RSVP count and helpful votes.  
- **Denormalized counters** (`currentRsvpCount`, `helpfulCount`) avoid expensive `COUNT(*)`.  
- **Pagination** to limit result sets.  
- **Lazy fetching** for relationships (`@ManyToOne(fetch = LAZY)`).  
- **Indexes** on foreign keys and frequently queried columns (as per migrations).  
- **Pessimistic locking** only where needed (waitlist promotion).  
- **External weather fetching** is scheduled in `backend-weather` – does not block user requests.  

### 12.2 Potential Bottlenecks

- **N+1 queries in EventMapper**: For each event, it calls three separate repository methods to build `HostDto` (completedEventsWithReviews, averageRating, totalReviews). When loading a page of 20 events, this results in 1 (main query) + 60 additional queries. **Improvement**: Use `@EntityGraph` to fetch host aggregates or calculate them in a single JPQL query with subqueries.  
- **File storage**: Serving images through Spring (`/uploads/**`) is not optimized for large media. **Improvement**: Use a CDN or a dedicated file server (e.g., AWS S3).  
- **Database connection pool**: Default HikariCP settings are fine, but could be tuned.  
- **MQTT message handling**: The `OfficialEventListener` processes messages synchronously; if many messages arrive, they could back up. **Improvement**: Use a `@Async` method or a queue.  
- **SSE**: Each connection holds a thread; for many concurrent users, this could consume resources. **Improvement**: Use reactive programming or WebSocket with fewer threads.  
- **Weather risk evaluation**: The `EventMapper` calls `riskEngine.assess()` for each outdoor event on every request. This is lightweight (pure Java logic), but if there are many events, it could add overhead. The data is read from `city_weather`, which is indexed by `(city, date)`, so it's fast.

---

## 13. Suggestions for Improvement

1. **Reduce N+1 queries** in `EventMapper` by writing a custom JPQL query that fetches all needed data in one go (using `JOIN` and aggregates).  
2. **Implement caching** for categories and host aggregate data (using Spring Cache with Redis).  
3. **Add idempotency** for MQTT events to prevent duplicates (e.g., store a hash of the message and ignore if already processed).  
4. **Use a distributed rate limiter** (e.g., Redis-based) for clustered deployment.  
5. **Enhance search** with PostgreSQL full‑text search or Elasticsearch.  
6. **Add monitoring** with Micrometer/Prometheus and health checks.  
7. **Add integration tests** for MQTT flows using Testcontainers.  
8. **Refactor `EventFactory` and `OfficialEventAdapter`** to avoid duplication – use the adapter inside the factory.  
9. **Improve error handling** in MQTT listener – use manual acks and dead‑letter queues.  
10. **Add API versioning** (e.g., `/api/v1/...`) for future changes.  
11. **Use `@Async`** for sending emails and notifications to avoid blocking the main thread.  
12. **Make the `checkInCode` generation more secure** (e.g., time‑based one‑time password) – currently a static code that changes only on regenerate.  
13. **Add a REST endpoint in `backend-weather`** to manually trigger a weather fetch (useful for testing/demo).  
14. **Store weather forecasts in a more granular way** – currently only maximum temperature; could store min, condition code, etc. (already stored).  
15. **Add a weather icon mapping** based on WMO codes for frontend display.

---

## 14. Conclusion

The MyStudyApp backend is a comprehensive, well‑architected system that demonstrates a solid understanding of Spring Boot, security, concurrency, and event‑driven design. It covers all necessary features for a campus event platform: user management with trust levels, event creation and moderation, RSVP with waitlist, reviews and reports, real‑time updates, and **a fully integrated weather service**.

The **weather module** adds significant real‑world value: hosts can mark events as outdoor, the system geocodes the address, and the risk engine evaluates forecasts to provide safety recommendations. This turns the app from a simple notice board into a **smart, context‑aware platform** that actively protects its users.

The code is clean, follows modern Java practices, and uses design patterns appropriately. The separation of concerns is clear, and the use of Spring events and MQTT provides flexibility and decoupling.

With the improvements suggested above, the system can scale further and become even more robust. The detailed analysis provided here serves as a complete reference for developers and architects working on or extending the platform.