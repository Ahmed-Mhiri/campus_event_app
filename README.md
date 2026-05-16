# MyStudyApp

A **university-exclusive event platform** where verified students can discover, host, and attend campus events. Built as a Maven multi-module project with Spring Boot 3 Modulith backends, a React 18 PWA frontend, and real-time MQTT messaging.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [Design Patterns](#design-patterns)
- [API Reference](#api-reference)
- [MQTT Topics](#mqtt-topics)
- [Frontend](#frontend)
- [Testing](#testing)
- [Environment Variables](#environment-variables)

---

## Overview

MyStudyApp solves three core campus problems:

| Problem | Solution |
|---|---|
| **Admin Bottleneck** — manual approval for every event overwhelms admins | **Trust Level system**: verified hosts with 3+ good reviews auto-publish without admin review |
| **Overcrowding & Ghosting** — RSVPs not honoured, events over-subscribed | **Capacity limits + automatic waitlist promotion + attendance tracking** |
| **Safety & Moderation** — suspicious events and bad actors | **Pre-event reporting + post-event reviews + real-time admin alerts via MQTT** |

---

## Architecture

```
mystudyapp/
├── backend-main/      # Core REST API — Spring Boot Modulith (port 8080)
├── backend-asta/      # AStA Event Publisher — MQTT producer (port 8081)
├── frontend/          # React 18 PWA — Vite + TanStack Query + Zustand
├── docs/              # Architecture decisions, API reference, design patterns
├── docker-compose.yml # Spins up PostgreSQL + Mosquitto MQTT broker
└── mosquitto.conf     # MQTT broker config (port 1883, anonymous access)
```

**Distribution flow:**

```
AStA System (backend-asta)
        │
        │  MQTT  topic: university/events
        ▼
  Mosquitto Broker
        │
        ▼
backend-main (OfficialEventListener)
        │
        ├── Adapter  →  OfficialEventAdapter translates AStA JSON → Event entity
        └── Factory  →  EventFactory builds the Event and persists it
```

---

## Tech Stack

### Backend (`backend-main` + `backend-asta`)

| Layer | Technology |
|---|---|
| Framework | Spring Boot 3, Spring Modulith |
| Security | Spring Security, JWT (Bearer tokens), BCrypt |
| Persistence | PostgreSQL (prod), H2 (dev), Flyway migrations |
| Messaging | MQTT via Eclipse Paho + Spring Integration |
| Mapping | MapStruct (compile-time DTO ↔ Entity) |
| API Docs | SpringDoc OpenAPI (Swagger UI at `/api-docs`) |
| Build | Maven multi-module |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 18, Vite |
| Server state | TanStack Query (React Query v5) |
| Client state | Zustand |
| Forms | React Hook Form + Zod |
| HTTP | Axios (JWT interceptor, auto-logout on 401) |
| PWA | Vite PWA Plugin, Service Worker (stale-while-revalidate) |

---

## Getting Started

### Prerequisites

- Java 21+
- Node.js 20+
- Docker & Docker Compose

### 1. Start infrastructure (database + MQTT broker)

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL** — application database
- **Mosquitto** — MQTT broker on port `1883`

### 2. Run the main backend

```bash
cd backend-main
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

The dev profile uses an **H2 in-memory database** — no Docker required for local development. The API is available at `http://localhost:8080`. Swagger UI is at `http://localhost:8080/api-docs`.

### 3. Run the AStA publisher (optional)

```bash
cd backend-asta
mvn spring-boot:run
```

The AStA service starts on port `8081` and exposes a demo endpoint for publishing official university events via MQTT.

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` and proxies `/api` requests to `:8080`.

---

## Project Structure

### `backend-main` — Spring Boot Modulith

The core service is organized by **vertical slice** (module = domain):

| Module | Responsibility | Key Endpoints |
|---|---|---|
| `identity` | Auth, user profiles, trust levels | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/users/me` |
| `events` | Event catalog, creation, discovery | `GET /api/events`, `POST /api/events`, `GET /api/events/{id}` |
| `registration` | RSVP, waitlist, attendance | `POST /api/rsvps`, `DELETE /api/rsvps/{id}`, `GET /api/events/{id}/attendees` |
| `moderation` | Reviews, reports, admin queue | `POST /api/reviews`, `POST /api/reports`, `GET /api/admin/reports` |
| `mqtt` | MQTT subscriber, AStA event ingestion | — (internal listener) |
| `common` | Shared config, exceptions, JWT | — (cross-cutting) |

### `backend-asta` — AStA Event Publisher

A lightweight microservice that serialises AStA event data and publishes it to the `university/events` MQTT topic. Intended as the integration point for the university's official event system.

### `frontend` — React PWA

Follows **Atomic Design**:

```
components/
├── atoms/       # Button, Input, Badge, Avatar, Skeleton, Spinner
├── molecules/   # EventCard, SearchBar, CategoryChip, RatingStars, Toast
├── organisms/   # Navbar, EventFeed, EventForm, ReviewSection, AdminReportTable
└── templates/   # PageLayout, AuthLayout, AdminLayout, ErrorBoundary
```

---

## Core Features

### Trust Level System

Students start at `NEW` and auto-promote to `TRUSTED_HOST` after hosting **3 well-reviewed events**.

```
NEW  ──→  TRUSTED_HOST  (3+ positive reviews, automatic)
 │
 └──→  FLAGGED          (admin action)
```

- `NEW` hosts: events enter `UNDER_REVIEW` for admin approval
- `TRUSTED_HOST` hosts: events publish immediately
- `FLAGGED` hosts: blocked from creating events

### Event Lifecycle

```
POST /api/events
       │
       ├── TRUSTED_HOST  →  PUBLISHED  (live immediately)
       └── NEW host      →  UNDER_REVIEW  (awaits admin approval)
                                │
                                ├── Admin approves  →  PUBLISHED
                                └── Admin rejects   →  CANCELLED
```

### RSVP & Waitlist

```
POST /api/rsvps
       │
       ├── Capacity available  →  GOING
       └── Event full          →  WAITLISTED
                                      │
                            Someone cancels their RSVP
                                      │
                            WaitlistPromotionListener fires
                                      │
                            Next WAITLISTED user → GOING
```

### Post-Event Flow

1. Host marks attendees → status `ATTENDED`
2. Attended users unlock the ability to leave a review (1–5 stars + comment)
3. After 3 qualifying reviews, `TrustLevelService` auto-promotes the host

---

## Design Patterns

Three Gang-of-Four patterns are explicitly implemented (documented in `docs/design-patterns.md`):

| Pattern | Category | Location | Purpose |
|---|---|---|---|
| **Factory** | Creational | `events/factory/EventFactory.java` | Builds an `Event` from either a `CreateEventRequest` (REST) or an `OfficialEventMessage` (MQTT) — service layer stays clean |
| **Adapter** | Structural | `mqtt/adapter/OfficialEventAdapter.java` | Translates AStA JSON fields (`activity_name`, `time`, `venue`) into the internal `Event` format; the `EventMessageTarget` interface keeps it swappable |
| **Observer** | Behavioral | `registration/observer/` | `RsvpEventPublisher` fires a Spring `ApplicationEvent` on RSVP cancellation; `WaitlistPromotionListener` reacts automatically — no direct coupling between cancellation and promotion logic |

---

## API Reference

Full OpenAPI specification is available at `http://localhost:8080/api-docs` when running in dev mode.

### Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Obtain a token via `POST /api/auth/login`.

### Key Endpoints

```
# Identity
POST   /api/auth/register
POST   /api/auth/login
GET    /api/users/me
GET    /api/users/{id}

# Events
GET    /api/events              ?page=0&size=20&category=&status=PUBLISHED
POST   /api/events
GET    /api/events/{id}
PATCH  /api/events/{id}
DELETE /api/events/{id}
GET    /api/categories

# RSVP
POST   /api/rsvps
DELETE /api/rsvps/{id}
GET    /api/events/{id}/attendees

# Reviews & Reports
POST   /api/reviews
GET    /api/events/{id}/reviews
POST   /api/reports

# Admin (requires ADMIN role)
GET    /api/admin/reports
PATCH  /api/admin/reports/{id}/resolve

# AStA Publisher (backend-asta)
POST   /api/asta/publish-event
```

---

## MQTT Topics

| Topic | Direction | Publisher | Consumer | Payload |
|---|---|---|---|---|
| `university/events` | → | `backend-asta` | `backend-main` | `{ activity_name, time, venue, organiser }` |

The broker runs on port `1883` (configured in `mosquitto.conf`). QoS level 1 is used for event messages to guarantee at-least-once delivery.

---

## Frontend

### PWA

The app is installable on mobile and desktop. Offline mode provides read-only access to previously loaded events via the service worker's stale-while-revalidate strategy.

### State Management

| Store | Contents |
|---|---|
| `authStore` (Zustand) | JWT token, decoded user, persisted to `localStorage` |
| `uiStore` (Zustand) | Dark/light theme, toast queue, mobile nav state |
| TanStack Query | All server data — events, RSVPs, reviews, reports |

### Key Hooks

| Hook | Purpose |
|---|---|
| `useAuth` | Reads `authStore`, exposes `user`, `login`, `logout` |
| `useInfiniteEvents` | Cursor-based infinite scroll for the event feed |
| `useRsvp` | RSVP mutation with optimistic UI update |
| `useToast` | Dispatches to the `uiStore` toast queue |
| `useDebounce` | Debounces search input before firing a query |

---

## Testing

```bash
# Run all backend tests
mvn test

# Run a specific module
mvn test -pl backend-main

# Run frontend lint + type checks
cd frontend && npm run lint
```

### Test Coverage

| Test | Type | What it verifies |
|---|---|---|
| `UserServiceTest` | Unit | Registration, login, duplicate email rejection |
| `EventServiceTest` | Unit | Trust-level-based publish vs. review routing |
| `EventFactoryTest` | Unit | Factory pattern — both REST and MQTT input paths |
| `RsvpServiceTest` | Unit | Capacity enforcement, GOING vs. WAITLISTED assignment |
| `WaitlistPromotionTest` | Integration | Observer fires and promotes the next waitlisted user |
| `ReportServiceTest` | Unit | Auto-flag event after N reports |
| `OfficialEventAdapterTest` | Unit | Adapter pattern — AStA JSON → Event field mapping |

---

## Environment Variables

### Backend (`application.yml`)

| Variable | Description | Default (dev) |
|---|---|---|
| `spring.datasource.url` | PostgreSQL JDBC URL | H2 in-memory |
| `spring.datasource.username` | DB username | `sa` |
| `spring.datasource.password` | DB password | _(empty)_ |
| `mqtt.broker` | Mosquitto broker URL | `tcp://localhost:1883` |
| `mqtt.topic` | Subscription topic | `university/events` |
| `jwt.secret` | HMAC signing secret | _(set in prod)_ |
| `jwt.expiration` | Token TTL in ms | `86400000` (24 h) |

### Frontend (`.env`)

Copy `.env.example` to `.env.local` and fill in:

```bash
VITE_API_URL=http://localhost:8080
VITE_MQTT_URL=ws://localhost:9001
```

---

## Docs

| File | Contents |
|---|---|
| `docs/architecture.md` | Distribution diagram description + MQTT message flow |
| `docs/api.md` | REST endpoint reference with request/response examples |
| `docs/design-patterns.md` | Factory · Adapter · Observer — motivation, UML, and code walkthrough |

---

## License

This project was developed as part of a university practical course (Praktikum) at **FH Dortmund**.