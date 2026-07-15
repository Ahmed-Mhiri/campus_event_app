# 🏗️ MyStudyApp Backend Architecture Document

> **Version**: 2.1 | **Date**: 2026-07-15  
> **System**: Campus Event Platform  
> **Backend Framework**: Spring Boot 3.x  

---

## 1. Architectural Overview

MyStudyApp is a **campus event management platform** designed for university communities. The backend is built on a **microservices-inspired** architecture, consisting of **two Spring Boot applications** that communicate via an **MQTT message broker**. The system provides event discovery, registration, moderation, and real-time updates, with a strong focus on **trust-based moderation**, **user engagement**, and **context-aware safety through weather integration**.

### 1.1 High‑Level System Diagram

```mermaid
graph TB
    subgraph "Frontend"
        FE[React + TypeScript + Mantine]
    end

    subgraph "Backend Services"
        BM[backend-main<br/>Port: 8081]
        BW[backend-weather<br/>Port: 8082]
    end

    subgraph "External APIs"
        OM[Open-Meteo Weather API]
        NM[Nominatim Geocoding API]
    end

    subgraph "Infrastructure"
        MQ[Mosquitto MQTT Broker<br/>Port: 1883]
        DB[(PostgreSQL<br/>Port: 5435)]
        SMTP[SMTP Server]
    end

    FE -->|REST + SSE| BM
    BM -->|publish alerts| MQ
    MQ -->|subscribe: campus/weather| BM
    BW -->|publish: campus/weather| MQ
    BW -->|fetch forecasts| OM
    BM -->|geocode addresses| NM
    BM --> DB
    BM --> SMTP
```

### 1.2 Key Architectural Principles

- **Domain‑Driven Design (DDD)** – each package corresponds to a bounded context (`events`, `identity`, `moderation`, `registration`, `notification`, `weather`).
- **Hexagonal Architecture** – core domain logic is isolated; external communication (web, MQTT, email, file storage, weather APIs, geocoding) is handled via adapters.
- **Event‑Driven Communication** – internal Spring events decouple modules; MQTT bridges external systems.
- **Security by Design** – JWT authentication, role‑based access, email verification, rate limiting, and trust levels are integrated.
- **Data Integrity** – optimistic and pessimistic locking, atomic updates ensure consistency.
- **Scalability** – stateless services, horizontal scaling possible, pagination for large datasets.
- **Context‑Awareness** – automatic weather risk assessment for outdoor events, geocoding of addresses.

---

## 2. Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Core Framework** | Spring Boot | 3.x |
| **Security** | Spring Security, JWT (JJWT) | 6.x / 0.11+ |
| **ORM** | Spring Data JPA (Hibernate) | 3.x |
| **Database** | PostgreSQL (prod), H2 (dev) | 15+ / 2.x |
| **Migration** | Flyway | 9.x |
| **Messaging** | Spring Integration MQTT (Eclipse Paho) | 6.x |
| **Real‑Time** | Server‑Sent Events (SSE) | – |
| **File Storage** | Local filesystem (thumbnails via Thumbnailator) | 0.4+ |
| **Email** | JavaMailSender | – |
| **Weather** | Open‑Meteo REST API | – |
| **Geocoding** | OpenStreetMap Nominatim API | – |
| **Testing** | JUnit 5, Mockito, Spring Boot Test | – |
| **Build** | Maven | 3.8+ |

---

## 3. Module Breakdown

### 3.1 Common Module (`common`)

**Purpose**: Cross‑cutting infrastructure shared across all modules.

| Sub‑package | Content |
|-------------|---------|
| `config` | CORS, Security, OpenAPI, Pageable, Storage, Scheduling |
| `exception` | Global exception handling, custom exceptions |
| `response` | Uniform `ApiResponse<T>` and `PageResponse<T>` |
| `security` | JWT utilities, JWT filter, rate limiting filter |
| `service` | File storage, thumbnail generation, **geocoding** |
| `scheduler` | Token cleanup (daily), event completion (hourly) |

**Key Classes**:
- `GlobalExceptionHandler` – centralises error responses.
- `JwtAuthFilter` – validates tokens, sets `SecurityContext`.
- `RateLimitingFilter` – per‑IP per‑endpoint throttling.
- `FileStorageService` – stores avatars and event media.
- `ThumbnailService` – generates 400×300 and 800×600 variants.
- `GeocodingService` – converts addresses to coordinates via Nominatim API.

---

### 3.2 Events Module (`events`)

**Purpose**: Manages the full lifecycle of events – creation, publication, updates, search, media, and **weather integration**.

**Domain Entities**:
- `Event` – core entity with status, capacity, RSVP count, soft‑delete flag, **address fields**, **outdoor flag**, and **coordinates**.
- `Category` – classification with icon, colour, sort order.
- `EventCategory` – many‑to‑many join table.
- `EventMedia` – images/videos with thumbnails and display order.

**Key Services**:
- `EventService` – CRUD, draft/publish, soft/hard delete, media, check‑in code, **geocoding**.
- `EventLifecycleService` – scheduled job to auto‑complete past events.
- `EventSseService` – manages SSE subscriptions and broadcasts.
- `SearchService` – autocomplete suggestions.
- `SlugGenerator` – unique URL slugs.
- `EventFactory` – creates events from REST or MQTT (Factory pattern).

**Controllers**:
- `EventController` – user operations (authenticated).
- `PublicEventController` – read‑only public endpoints.
- `AdminEventController` – moderation (approve, reject, flag, bulk).
- `CategoryController` / `AdminCategoryController` – category listing and admin CRUD.
- `EventSseController` – SSE stream endpoint.

---

### 3.3 Identity Module (`identity`)

**Purpose**: User authentication, authorisation, profile management, and trust levels.

**Domain Entities**:
- `User` – with `Role` (STUDENT/ADMIN), `TrustLevel` (NEW/TRUSTED_HOST/FLAGGED), `isVerified`.
- `VerificationToken` – email confirmation.
- `PasswordResetToken` – password reset.
- `UserPreference` – notification settings, timezone, language.

**Key Services**:
- `UserService` – registration, login, refresh, logout, profile updates, deletion.
- `TrustLevelService` – manages trust promotion, qualification checks, and flagging.
- `UserDetailsServiceImpl` – loads user for Spring Security (checks verification and flag status).
- `EmailService` – sends verification and reset emails.
- `UserPreferenceService` – CRUD for preferences.

**Controllers**:
- `UserController` – auth endpoints (`/api/auth/**`) and profile.
- `AdminUserController` – user management (list, flag, promote, delete).
- `PublicUserController` – public profile.
- `UserPreferenceController` – preferences endpoints.

---

### 3.4 Moderation Module (`moderation`)

**Purpose**: Reviews, reports, and helpful voting.

**Domain Entities**:
- `Review` – rating (1‑5), comment, helpful count.
- `ReviewVote` – user‑review helpful votes.
- `Report` – event reports with reason and status.

**Key Services**:
- `ReviewService` – create review (only for attendees), list, delete, toggle helpful vote, report review.
- `ReportService` – create report, resolve, delete; publishes MQTT alerts for critical reports.

**Controllers**:
- `ReviewController` – user review operations.
- `ReportController` – user report creation and admin management.

---

### 3.5 Registration Module (`registration`)

**Purpose**: RSVP management, waitlist, and check‑in.

**Domain Entities**:
- `Rsvp` – status (GOING/WAITLISTED/CANCELLED/ATTENDED), cancellation reason.

**Key Services**:
- `RsvpService` – create/cancel RSVP, mark attended, self check‑in.
- `WaitlistService` – promotes next waitlisted on cancellation, host manual promotion.

**Event‑Driven**:
- `RsvpCancelledEvent` published on cancellation.
- `WaitlistPromotionListener` listens and triggers promotion.

**Controllers**:
- `RsvpController` – user and host RSVP endpoints.

---

### 3.6 Notification Module (`notification`)

**Purpose**: In‑app notifications for users.

**Domain Entities**:
- `Notification` – type, title, message, related event/user, action URL, read status.

**Event‑Driven**:
- `NotificationEvent` published by `NotificationEventPublisher`.
- `NotificationEventListener` persists the notification.

**Services**:
- `NotificationService` – CRUD operations, mark read/unread.

**Controllers**:
- `NotificationController` – list, unread count, mark read/delete.

---

### 3.7 Weather Module (`weather`) – **NEW**

**Purpose**: Ingestion and evaluation of weather forecasts for outdoor events.

**Domain Entities**:
- `CityWeather` – composite key `(city, date)`, stores condition code, temperature, rain probability, wind speed, and last updated timestamp.
- `WeatherRisk` – enum: `GOOD`, `MODERATE`, `DANGER`, `CANCELLED`.

**Repositories**:
- `CityWeatherRepository` – `findByCityAndDate`, `findByCityAndDateBetween`.

**Services**:
- `WeatherRiskEngine` – evaluates a forecast against thresholds and returns a `WeatherAssessment` with risk level, recommendation, and warnings.
- **Integrated into `EventMapper`** – automatically attaches weather data to `EventDto` for outdoor events within the next 14 days.

**DTOs**:
- `CityForecast` – transport object from MQTT.
- `WeatherPayload` – wrapper with timestamp and list of forecasts.
- `WeatherAssessment` – risk evaluation result.

---

### 3.8 MQTT Integration (`mqtt`)

**Purpose**: Inter‑service communication via MQTT.

**Components**:
- `MqttConfig` – configures inbound adapters (`university/events`, **`campus/weather`**) and outbound adapter (`university/alerts`).
- `OfficialEventListener` – processes incoming AStA events, creates official events using `EventFactory`.
- **`WeatherMqttListener`** – **NEW** – processes incoming weather forecasts, upserts `CityWeather` records.
- `OfficialEventAdapter` – converts external DTO to internal `Event` (Adapter pattern).
- `EventMessageTarget` – interface for adapters.

---

### 3.9 Backend‑Weather Service (`backend-weather`) – **NEW**

**Purpose**: Standalone microservice that fetches real‑time weather data from Open‑Meteo and publishes it via MQTT.

**Components**:
- `WeatherApplication` – main class with `@EnableScheduling`.
- `CityList` – static map of 100+ German cities with coordinates.
- `WeatherFetcher` – `@Scheduled` task (every 6 hours) that calls Open‑Meteo API and parses the response.
- `MqttPublisher` – serialises forecasts to JSON and sends to `campus/weather` via `@MessagingGateway`.
- `MqttPublisherConfig` – outbound MQTT configuration.
- **DTOs**: `CityForecast`, `WeatherPayload`.

**External API**:
- **Open‑Meteo**: `https://api.open-meteo.com/v1/forecast` with parameters: `latitude`, `longitude`, `daily` (weathercode, temperature_2m_max, precipitation_probability_max, windspeed_10m_max), `timezone=Europe/Berlin`, `forecast_days=14`.

---

### 3.10 Backend‑Asta Service – **REMOVED**

> **Note**: The `backend-asta` module has been **removed** and replaced by the more useful `backend-weather` service. Official events can still be created via the main backend's API by trusted hosts or admins.

---

## 4. Design Patterns Used

| Pattern | Example | Benefit |
|---------|---------|---------|
| **Factory** | `EventFactory` | Centralises event creation from REST/MQTT; encapsulates status logic. |
| **Adapter** | `EventMessageTarget` / `OfficialEventAdapter` | Converts external message formats to internal entities. |
| **Observer** | Spring `ApplicationEvent` / `EventListener` | Decouples modules (RSVP cancellation → waitlist promotion, review → trust promotion). |
| **DTO** | All `*Dto` classes | Decouples API contract from domain; prevents exposure of internal fields. |
| **Repository** | Spring Data JPA repositories | Abstraction over data access; provides query methods. |
| **Service Layer** | `*Service` classes | Encapsulates business logic; orchestrates repositories and other services. |
| **Builder** | Lombok `@Builder` | Clean construction for complex entities. |
| **Template Method** | `OncePerRequestFilter` for security filters | Framework hook for custom request processing. |
| **Scheduled** | `@Scheduled` in `WeatherFetcher` and `EventLifecycleService` | Periodic background tasks. |

---

## 5. Data Model Overview

### 5.1 Core Entity Relationships

```mermaid
erDiagram
    USERS ||--o{ EVENTS : hosts
    USERS ||--o{ RSVPS : creates
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ REPORTS : submits
    USERS ||--|| USER_PREFERENCES : has

    EVENTS ||--o{ RSVPS : has
    EVENTS ||--o{ REVIEWS : receives
    EVENTS ||--o{ REPORTS : is_reported
    EVENTS ||--o{ EVENT_CATEGORIES : categorized
    EVENTS ||--o{ EVENT_MEDIA : has
    EVENTS ||--o{ CITY_WEATHER : "has forecast for" (by city + date)

    CATEGORIES ||--o{ EVENT_CATEGORIES : assigned

    REVIEWS ||--o{ REVIEW_VOTES : receives
```

### 5.2 Denormalised Counters

| Field | Table | Update Mechanism |
|-------|-------|------------------|
| `current_rsvp_count` | Event | Atomic `UPDATE` with capacity check |
| `helpful_count` | Review | Atomic increment/decrement on vote toggle |
| `view_count` | Event | Atomic increment on detail view |

### 5.3 Soft Delete

- `Event.deletedAt` timestamp; `null` means active.
- All list queries explicitly exclude `deletedAt IS NOT NULL`.
- Restore clears the timestamp; permanent delete removes the row and cascades.

### 5.4 Database Migrations (Flyway)

| Migration | Tables |
|-----------|--------|
| `V1__create_users.sql` | `users`, `verification_tokens`, `password_reset_tokens`, `user_preferences` |
| `V2__create_events_and_categories.sql` | `events`, `categories`, `event_categories`, `event_media` |
| `V3__create_rsvps.sql` | `rsvps` |
| `V4__create_moderation.sql` | `reviews`, `review_votes`, `reports`, `notifications` |
| **`V5__add_weather_fields.sql`** | **NEW** – adds address fields (`venue_name`, `street`, `city`, `postal_code`, `country`, `latitude`, `longitude`, `is_outdoor`) to `events`, and creates `city_weather` table |

All foreign keys have `ON DELETE CASCADE` for data consistency.

---

## 6. Weather Integration Flow

### 6.1 Data Flow

```mermaid
sequenceDiagram
    participant BW as backend-weather
    participant OM as Open-Meteo API
    participant MQ as Mosquitto Broker
    participant BM as backend-main
    participant DB as PostgreSQL
    participant FE as Frontend

    loop Every 6 hours
        BW->>OM: GET /forecast (lat, lon, daily params)
        OM-->>BW: JSON (14-day forecast)
        BW->>BW: Parse & aggregate for all cities
        BW->>MQ: PUBLISH to campus/weather
    end

    MQ->>BM: SUBSCRIBE campus/weather
    BM->>BM: Deserialize WeatherPayload
    BM->>DB: UPSERT city_weather (city, date)

    FE->>BM: GET /api/events (or /api/events/{id})
    BM->>DB: SELECT events + city_weather
    BM->>BM: WeatherRiskEngine.assess(forecast)
    BM->>FE: EventDto with weatherRisk, recommendation, temp, rain%
```

### 6.2 WeatherRiskEngine Logic

| Condition | Risk Level | Recommendation |
|-----------|------------|----------------|
| WMO code 95‑99 (Thunderstorm) | `CANCELLED` | "Event should be cancelled for safety." |
| Rain > 70% | `DANGER` | "Heavy rain – consider moving indoors or postponing." |
| Rain > 40% | `MODERATE` | "Moderate rain – have a backup plan." |
| Wind > 60 km/h | `DANGER` | "Strong winds – risk of structural damage." |
| Wind > 30 km/h | `MODERATE` | "Breezy – secure loose items." |
| Temperature > 35°C | `DANGER` | "Extreme heat – provide shade and hydration." |
| Temperature > 30°C | `MODERATE` | "High temperature – stay hydrated." |
| None of the above | `GOOD` | "Weather looks good – enjoy your outdoor event!" |

### 6.3 Fields in EventDto (Weather)

```java
private WeatherRisk weatherRisk;          // GOOD | MODERATE | DANGER | CANCELLED
private String weatherRecommendation;     // human‑readable string
private Integer weatherTemperature;       // °C
private Integer weatherRainProbability;   // 0‑100
private Boolean weatherAvailable;         // true if forecast exists
```

---

## 7. Security Architecture

### 7.1 Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant SecurityConfig
    participant JwtAuthFilter
    participant JwtUtil
    participant UserService

    Client->>SecurityConfig: POST /api/auth/login
    SecurityConfig->>UserService: authenticate()
    UserService-->>Client: Access Token + Refresh Token

    Client->>JwtAuthFilter: GET /api/events (Bearer Token)
    JwtAuthFilter->>JwtUtil: validateToken()
    JwtUtil-->>JwtAuthFilter: Valid
    JwtAuthFilter->>JwtAuthFilter: Set Authentication Context
    JwtAuthFilter-->>Client: Proceed to Controller
```

### 7.2 JWT Token Details

- **Access Token**: 15 min expiry, contains `sub` (email), `userId`, `role`, `trustLevel`, `type`=access.
- **Refresh Token**: 7 days expiry, contains `sub`, `userId`, `type`=refresh.
- **Signing**: HS256 with a secret read as UTF‑8 bytes.
- **Validation**: `JwtAuthFilter` checks signature, expiration, and token type.

### 7.3 Account States

| State | Effect |
|-------|--------|
| `isVerified=false` | Login blocked with `DisabledException`. |
| `trustLevel=NEW` | Events go to `UNDER_REVIEW`. |
| `trustLevel=TRUSTED_HOST` | Events auto‑publish. |
| `trustLevel=FLAGGED` | Login blocked (`LockedException`); all tokens rejected; published events frozen to `UNDER_REVIEW`. |

### 7.4 Rate Limiting

- **Auth endpoints**: 5 req/min per client IP.
- **Write endpoints** (POST/PUT/PATCH/DELETE to `/api/reviews`, `/api/reports`, `/api/rsvps`, `/api/events`): 20 req/min.
- Implementation: in‑memory `ConcurrentHashMap` with sliding window. (Future: Redis for distributed deployments.)

### 7.5 CORS

- Allowed origins: `http://localhost:5173`, `http://127.0.0.1:5173`, `${app.frontend-url}`.
- Allows credentials; exposes `Authorization` and `X-Refresh-Token` headers.

---

## 8. Communication Patterns

### 8.1 REST API (HTTP)

- JSON over HTTP with standard status codes.
- Pagination via `page`, `size`, `sort` parameters.
- Uniform `ApiResponse<T>` wrapper.

### 8.2 Server‑Sent Events (SSE)

- Endpoint: `/api/events/stream/{eventId}`.
- **Real‑time updates** on RSVP count changes, waitlist promotions, and event cancellations.
- Timeout: 5 min; client must reconnect.
- **Authentication**: JWT passed as query param `?token=` because `EventSource` cannot set headers.

### 8.3 MQTT (Pub‑Sub)

| Topic | Publisher | Subscriber | Purpose |
|-------|-----------|------------|---------|
| `university/events` | `backend-asta` (legacy) | `backend-main` | Official events (deprecated) |
| **`campus/weather`** | **`backend-weather`** | **`backend-main`** | **Weather forecasts** |
| `university/alerts` | `backend-main` | *(external)* | Critical report alerts |

- **QoS**: 1 (at‑least‑once delivery).
- **Broker**: Eclipse Mosquitto (Docker).

### 8.4 Internal Event Bus (Spring Events)

- `RsvpCancelledEvent` → triggers waitlist promotion.
- `NotificationEvent` → persists notifications.
- Benefits: decoupling, transactionality.

---

## 9. Concurrency & Data Integrity

### 9.1 Atomic Updates

- **RSVP capacity**: `UPDATE events SET current_rsvp_count = current_rsvp_count + 1 WHERE id = ? AND current_rsvp_count < max_capacity` – returns affected rows.
- **Helpful votes**: atomic increment/decrement on `helpful_count`.
- **View count**: atomic increment on detail view.

### 9.2 Pessimistic Locking

- Waitlist promotion uses `SELECT ... FOR UPDATE` (`@Lock(PESSIMISTIC_WRITE)`) to prevent double promotion.

### 9.3 Transactional Boundaries

- All service methods annotated with `@Transactional` where needed.
- Events and listeners run in the same transaction by default.

---

## 10. Scheduled Tasks

| Task | Cron | Purpose |
|------|------|---------|
| `TokenCleanupService.purgeExpiredTokens()` | `0 0 3 * * *` (3 AM) | Deletes expired verification and password‑reset tokens. |
| `EventLifecycleService.autoCompletePastEvents()` | `0 0 * * * *` (hourly) | Sets PUBLISHED events with `endTime < now()` to COMPLETED. |
| **`WeatherFetcher.fetchAndPublish()`** | **`0 0 */6 * * *` (every 6h)** | **Fetches weather from Open‑Meteo and publishes via MQTT.** |

---

## 11. Deployment & Configuration

### 11.1 Environment Profiles

- **`dev`**: H2 in‑memory database, `DummyDataSeeder` runs, debug logging.
- **`prod`**: PostgreSQL, Flyway migrations, production logging.

### 11.2 Docker Compose Setup

```yaml
services:
  postgres:
    image: postgres:16
    container_name: mystudyapp-postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports: ["5435:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]

  mosquitto:
    image: eclipse-mosquitto:2.0
    container_name: mystudyapp-mosquitto
    ports: ["1883:1883", "9001:9001"]
    volumes: [./mosquitto.conf:/mosquitto/config/mosquitto.conf]

  backend-main:
    build: ./backend-main
    dockerfile: Dockerfile.dev
    ports: ["8081:8081"]
    depends_on: [postgres, mosquitto]
    environment:
      SPRING_PROFILES_ACTIVE: dev
      MQTT_BROKER_URL: tcp://mosquitto:1883
    volumes: [./backend-main:/app, ~/.m2:/root/.m2]

  backend-weather:
    build: ./backend-weather
    dockerfile: Dockerfile.dev
    ports: ["8082:8082"]
    depends_on: [mosquitto]
    environment:
      SPRING_PROFILES_ACTIVE: dev
      MQTT_BROKER_URL: tcp://mosquitto:1883
    volumes: [./backend-weather:/app, ~/.m2:/root/.m2]

volumes:
  postgres_data:
```

### 11.3 Key Environment Variables

| Variable | Purpose |
|----------|---------|
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | DB user |
| `SPRING_DATASOURCE_PASSWORD` | DB password |
| `JWT_SECRET` | HMAC secret (≥32 chars) |
| `MQTT_BROKER_URL` | MQTT broker address |
| `APP_FRONTEND_URL` | Base URL for email links |
| `SPRING_MAIL_HOST` | SMTP host |
| `SPRING_MAIL_USERNAME` | SMTP user |
| `SPRING_MAIL_PASSWORD` | SMTP password |

---

## 12. Performance Considerations

### 12.1 Optimisations in Place

- **Atomic updates** avoid `SELECT FOR UPDATE` for RSVP capacity.
- **Denormalised counters** reduce `COUNT(*)` queries.
- **Pagination** limits result sets.
- **Lazy fetching** for relationships.
- **Indexes** on foreign keys and frequently queried columns (defined in migrations).
- **Weather risk evaluation** is pure Java logic – no additional database queries per event.

### 12.2 Potential Bottlenecks & Mitigations

| Issue | Solution |
|-------|----------|
| **N+1 queries in EventMapper** (`HostDto` aggregates) | Use `@EntityGraph` or batch fetching; or a single JPQL with subqueries. |
| **SSE thread usage** | Use WebFlux or reactive SSE; current implementation is fine for moderate load. |
| **File serving** | Offload to CDN or object storage (S3) for scalability. |
| **Rate limiter in‑memory** | Replace with Redis for clustered deployment. |
| **MQTT message processing** | Use `@Async` or a queue to avoid blocking. |

---

## 13. Observability & Monitoring

- **Health checks**: `/actuator/health`, `/actuator/info` (if Actuator enabled).
- **Logging**: SLF4J with configurable levels per profile.
- **Metrics**: Can be added via Micrometer/Prometheus.

---

## 14. Extension Points

- **New event sources**: Add a new `EventMessageTarget` adapter and register in `EventFactory`.
- **New notification types**: Extend `NotificationType` enum and publish accordingly.
- **New trust criteria**: Modify `TrustLevelService.qualifiesForTrustedHost()`.
- **Additional report reasons**: Extend `ReportReason` enum.
- **New file types**: Extend `FileStorageService` validation.
- **Additional weather data sources**: Modify `WeatherFetcher` to call different APIs.
- **New weather risk thresholds**: Adjust `WeatherRiskEngine` thresholds.

---

## 15. Conclusion

MyStudyApp's backend is a **robust, well‑structured system** that leverages modern Spring Boot features, design patterns, and a clean domain model. It successfully separates concerns across modules, ensures security and data integrity, and provides real‑time capabilities through SSE and MQTT.

The **weather module** adds significant real‑world value: hosts can mark events as outdoor, the system geocodes the address, and the risk engine evaluates forecasts to provide safety recommendations. This turns the app from a simple notice board into a **smart, context‑aware platform** that actively protects its users.

The architecture is designed for **scalability, maintainability, and extensibility**, making it a solid foundation for a campus event platform.

Future improvements may include:
- Distributed caching (Redis).
- Full‑text search (Elasticsearch).
- Asynchronous processing for email and notifications.
- Reactive programming for SSE and file uploads.
- Additional monitoring and alerting.
- Integration with other external data sources (e.g., air quality, UV index).

---

*This document is based on the actual backend source code as of July 2026, including the weather module.*