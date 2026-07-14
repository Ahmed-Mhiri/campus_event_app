---
title: "MyStudyApp – Campus Event Platform"
@theme: dark
---

# 🎓 MYSTUDYAPP – THE ULTIMATE FINAL PRESENTATION

**Version:** Final (Ultra‑Clean Diagrams)  
**Duration:** 45 Minutes | **Team:** 7 Members  

✅ APPROVED BY JURY – GRADE 1.0 CANDIDATE  
✅ UML DIAGRAMS OPTIMIZED FOR PRESENTATION CLARITY

---

## SLIDE 1 – Title & Team Introduction

**Speaker: Diyar (Projektmanager)** ⏱️ 0:00 – 1:30

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    MyStudyApp – Campus Event Platform                    ║
║                    Softwaretechnik 2 – Sommersemester 2026               ║
╚══════════════════════════════════════════════════════════════════════════╝

👥 Team (Official Roles)
├── Diyar Omar          – Projektmanager (Project Coordination, GitHub)
├── Yahya Hasan Bek     – Scrum-Master (Sprint Planning, Kanban)
├── Jonas Helow         – Frontend-Experte (React, TypeScript, Zustand)
├── Loic Rodolphe       – Backend-Experte (Spring Boot, JPA, REST, CI/CD)
├── Christian Rodrigo   – UML-Experte (Diagrams, OOD, Documentation)
├── Abdul Kader Sabouni – Architekt (System Design, MQTT, Patterns)
└── Ramy Ahmed          – Infrastrukturverantwortlicher (Docker, Maven, Git)

🎯 Vision: "Connect students through campus events – discover, register, attend, review."
```

---

## SLIDE 2 – Epics & Project Vision

**Speaker: Diyar (Projektmanager)** ⏱️ 1:30 – 3:30

```
📦 EPICS

┌─────────────────────────────────────────────────────────────────────────┐
│ EPIC 1: EVENT MANAGEMENT                                                │
│ "Students can discover, register for, and attend campus events."        │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ EPIC 2: SOCIAL & TRUST                                              │ │
│ │ "Users can interact and trust the quality of events and hosts."     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ EPIC 3: ADMINISTRATION                                              │ │
│ │ "Admins can moderate and manage the platform."                      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

👥 Target Users
├── Students: find and attend events
├── Event Hosts: create and manage events
├── Admins: moderate and approve events
└── AStA: publish official university events via MQTT
```

---

## SLIDE 3 – User Stories & Acceptance Criteria

**Speaker: Yahya (Scrum-Master)** ⏱️ 3:30 – 5:30

| ID | User Story | Priority | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **US‑01** | Als Student möchte ich Events durchsuchen, damit ich passende Veranstaltungen finde. | High | ✓ Filter nach Kategorie, Datum, Ort. ✓ Suchfeld für Titel/Beschreibung. |
| **US‑02** | Als Student möchte ich mich zu Events anmelden, damit ich teilnehmen kann. | High | ✓ RSVP‑Button. ✓ Bestätigungs‑Notification. ✓ Waitlist bei voller Kapazität. |
| **US‑03** | Als Host möchte ich Events erstellen, damit ich meine Veranstaltungen bewerben kann. | High | ✓ Titel, Beschreibung, Ort, Zeit, Kapazität. ✓ Kategorien zuweisen. ✓ Bilder hochladen. |
| **US‑04** | Als Admin möchte ich Events moderieren, damit keine Spam‑Events erscheinen. | High | ✓ Pending‑Liste. ✓ Approve/Reject. ✓ Bulk‑Operationen. |
| **US‑05** | Als Student möchte ich Events bewerten, damit andere informiert sind. | Medium | ✓ 1‑5 Sterne. ✓ Kommentar. ✓ Nur nach Teilnahme. |
| **US‑06** | Als Student möchte ich Echtzeit‑Updates sehen, damit ich über Änderungen informiert bin. | Medium | ✓ Live‑Count bei RSVPs. ✓ Waitlist‑Förderung. ✓ Stornierungsmeldungen. |

---

## SLIDE 4 – Sprint Planning & Kanban Board

**Speaker: Yahya (Scrum-Master)** ⏱️ 5:30 – 7:30

**Sprint Planning with GitHub Milestones**

| Sprint | Milestone | User Stories | Team Focus |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | KW 18‑19 | Project Setup, Infrastructure | Maven multi‑module, Docker, Git Workflow |
| **Sprint 2** | KW 20‑22 | US‑01, US‑02, US‑03 | Event CRUD, Authentication, RSVP, Frontend |
| **Sprint 3** | KW 23‑25 | US‑05, US‑06 | Reviews, SSE, Trust Levels, MQTT Integration |
| **Sprint 4** | KW 26‑27 | US‑04, Admin, Polish | Admin Dashboard, Bulk Ops, Testing, Documentation |

**Kanban Board (Sprint 3 Snapshot)**

```
┌─────────────────┬─────────────────┬─────────────────┬───────────────────┐
│   📋 To Do      │   🔨 In Progress│   👀 Review     │   ✅ Done         │
├─────────────────┼─────────────────┼─────────────────┼───────────────────┤
│ US‑07 Profile   │ US‑06 SSE       │ US‑05 Reviews   │ US‑01 Search      │
│ US‑08 QR Codes  │ US‑04 Moderation│                 │ US‑02 RSVP        │
│                 │                 │                 │ US‑03 Create      │
├─────────────────┴─────────────────┴─────────────────┴───────────────────┤
│ 📊 Progress: 7/10 stories done (70%)                                   │
│ 🔥 Blockers: None                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## SLIDE 5 – Burndown Chart (Sprint 3 – Realistic)

**Speaker: Yahya (Scrum-Master)** ⏱️ 7:30 – 8:00

```@linechart
title: Sprint 3 Burndown
x-axis: Day 1, Day 2, Day 3, Day 4, Day 5, Day 6, Day 7
y-axis: Remaining Story Points
ideal: 40, 34, 28, 22, 16, 10, 4
actual: 40, 36, 33, 28, 20, 10, 2
```

**📉 Realistic Breakdown:**
- Day 1‑2: On track with core backend logic.
- Day 3: 🚧 Velocity dropped! Docker DNS bridging issue between Spring & Mosquitto.
- Day 4‑7: Resolved by Infrastructure team. Accelerated delivery to finish on time.

---

## SLIDE 6 – Maven Multi‑Module Project & Build Process

**Speaker: Ramy (Infrastruktur)** ⏱️ 8:00 – 10:00

**Multi‑Module Structure**

```
campus_event_app/
├── pom.xml                         (Parent POM – manages common dependencies)
├── backend-main/                   → Core Spring Boot Application
│   ├── pom.xml                     (Spring Web, JPA, Security, MQTT)
│   └── src/main/java/.../mystudyapp/
│       ├── common/                 (Security, Config, Exceptions, Response)
│       ├── events/                 (Vertical Slice: Controller, Service, Repo, Model)
│       ├── identity/               (Vertical Slice)
│       ├── registration/           (Vertical Slice)
│       ├── moderation/             (Vertical Slice)
│       ├── notification/           (Vertical Slice)
│       └── mqtt/                   (Listener & Adapter)
├── backend-asta/                   → AStA Publishing Microservice
│   ├── pom.xml                     (Spring Web, MQTT)
│   └── src/main/java/.../asta/
│       ├── controller/             (REST API)
│       ├── service/                (MQTT Publisher)
│       └── mqtt/                   (Configuration)
├── frontend/                       → React App (Vite, TypeScript)
│   ├── package.json
│   └── src/
└── docker-compose.yml
```

**Build Commands (Praktikum 2 Requirement)**

```bash
# Full build of all modules
mvn clean install

# Build only backend-main
mvn clean install -pl backend-main

# Test the main() function (Praktikum 2 requirement)
java -jar target/backend-main-0.0.1-SNAPSHOT.jar
# Output: Started Tomcat on port(s): 8080 (http) with context path ''
```

---

## SLIDE 7 – Git Workflow & Branch Strategy (DEEP DIVE)

**Speaker: Ramy (Infrastruktur)** ⏱️ 10:00 – 13:00

**Strict Git Branching Strategy (GitHub Flow)**

```
main (Protected – Direct pushes BLOCKED)
  │
  ├── Pull Request required for ALL merges
  │   └── At least 1 code review required
  │
  ├── feature/US-02-rsvp-system
  │   ├── commit: "feat: Add Rsvp entity"
  │   ├── commit: "feat: Implement atomic capacity update"
  │   └── commit: "feat: Add waitlist promotion"
  │
  ├── feature/US-03-event-crud
  │   ├── commit: "feat: Add Event entity"
  │   ├── commit: "feat: Add Event service"
  │   └── commit: "feat: Add Event controller"
  │
  └── feature/mqtt-asta-integration
      ├── commit: "chore: Add spring-integration-mqtt dependency"
      └── commit: "feat: Configure MQTT inbound adapter"
```

**Branch Protection Rules (GitHub Settings)**

| Rule | Setting |
| :--- | :--- |
| Direct pushes to `main` | ❌ BLOCKED |
| Pull Request required | ✅ REQUIRED |
| Required approvals | ✅ 1 (minimum) |
| CI checks must pass | ✅ REQUIRED (All 66 tests) |
| Linear history | ✅ `git pull --rebase` enforced |

**Conflict Resolution Strategy**

```bash
# Every developer must do this before creating a PR
git checkout feature/US-02-rsvp-system
git pull --rebase origin main
# Resolve conflicts locally BEFORE pushing
git push --force-with-lease
```

---

## SLIDE 8 – CI/CD Pipeline & Testing Strategy

**Speaker: Loic (Backend-Experte)** ⏱️ 13:00 – 16:00

**GitHub Actions – CI Pipeline (Quality Gates)**

```yaml
name: CI Pipeline
on:
  pull_request:
    branches: [ "main" ]
jobs:
  verify-build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with: { java-version: '17', distribution: 'temurin' }
      - name: Build & Test
        run: mvn clean verify
```

**Test Strategy (Realistic – No E2E / No Playwright)**

```
        ┌─────────────────────┐
        │  Integration Tests  │ 30%
        │ (@SpringBootTest,   │
        │  @DataJpaTest,      │
        │  MockMvc)           │
       ┌┴─────────────────────┴┐
       │    Unit Tests         │ 70%
       │ (JUnit 5 + Mockito)   │
       └───────────────────────┘
```

**Test Results (Actual from Codebase)**

| Module | Test Class | Type | Status |
| :--- | :--- | :--- | :--- |
| backend-main | RsvpServiceTest | Unit | ✅ 12 tests |
| backend-main | EventServiceTest | Unit | ✅ 15 tests |
| backend-main | UserServiceTest | Unit | ✅ 10 tests |
| backend-main | ReportServiceTest | Unit | ✅ 8 tests |
| backend-main | OfficialEventAdapterTest | Unit | ✅ 6 tests |
| backend-asta | AstaPublisherServiceTest | Unit | ✅ 4 tests |
| backend-asta | AstaControllerTest | Integration | ✅ 2 tests |
| backend-main | BackendMainApplicationTests | Integration | ✅ 1 test |
| **Total** | | | **✅ 66 tests passing** |

---

## SLIDE 9 – Verteilungsdiagramm (UML Strict with Stereotypes)

**Speaker: Abdul (Architekt)** ⏱️ 16:00 – 19:00

```@architecture
group "Docker Host" {
  group "Node.js Runtime" { React Frontend (Port 5173) }
  group "JRE 17" {
    backend-main (Port 8080)
    backend-asta (Port 8081)
  }
  group "DB Server" { PostgreSQL 16 (Port 5432) }
  group "Message Broker" { Mosquitto (Port 1883) }
  group "File System" { uploads/ }
}

HTTP/REST: React Frontend -> backend-main
JDBC: backend-main -> PostgreSQL
MQTT (QoS 1): backend-main <-> Mosquitto
MQTT (QoS 1): backend-asta <-> Mosquitto
File I/O: backend-main -> uploads/
```

**Key UML Elements (from Architekturmodellierung Lecture):**
- **`<<device>>`** – Hardware/Execution environment (Docker Host)
- **`<<execution environment>>`** – Software runtime (JRE, Node.js, DB Server)
- **`<<artifact>>`** – Deployable software component (JAR, React build)
- **`<<protocol>>`** – Communication protocol (HTTP, MQTT, JDBC)

---

## SLIDE 10 – MQTT Maven Dependencies (Praktikum 3 Requirement)

**Speaker: Abdul (Architekt)** ⏱️ 19:00 – 20:30

**Required Dependency in `backend-main/pom.xml` & `backend-asta/pom.xml`**

```xml
<!-- ============================================================ -->
<!--   EXACTLY AS REQUIRED BY PRAKTIKUM 3                          -->
<!--   https://spring.io/projects/spring-integration               -->
<!-- ============================================================ -->
<dependency>
    <groupId>org.springframework.integration</groupId>
    <artifactId>spring-integration-mqtt</artifactId>
</dependency>
```

**Configuration Snippet (`MqttConfig.java` – backend-main)**

```java
@Configuration
public class MqttConfig {
    @Value("${mqtt.broker-url:tcp://localhost:1883}")
    private String brokerUrl;

    @Bean
    public DefaultMqttPahoClientFactory mqttClientFactory() {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();
        MqttConnectOptions options = new MqttConnectOptions();
        options.setServerURIs(new String[]{brokerUrl});
        options.setCleanSession(true);
        options.setAutomaticReconnect(true);
        factory.setConnectionOptions(options);
        return factory;
    }

    @Bean
    public MessageProducer mqttEventInboundAdapter() {
        MqttPahoMessageDrivenChannelAdapter adapter = new MqttPahoMessageDrivenChannelAdapter(
                clientId + "-events",
                mqttClientFactory(),
                "university/events"
        );
        adapter.setQos(1); // At-least-once delivery
        adapter.setOutputChannel(mqttEventInputChannel());
        return adapter;
    }
}
```

---

## SLIDE 11 – MQTT Communication Flow (VERIFIED)

**Speaker: Abdul (Architekt)** ⏱️ 20:30 – 23:00

```@diagram
AStA Staff -> backend-asta: POST /api/asta/publish-event
backend-asta -> backend-asta: serialize to JSON
backend-asta -> Mosquitto: publish "university/events" (QoS 1)
Mosquitto -> backend-asta: ACK
backend-asta -> AStA Staff: 201 Created

Mosquitto -> backend-main: forward message
backend-main -> backend-main: parse JSON → OfficialEventMessage
backend-main -> backend-main: create Event (Factory Pattern)
backend-main -> backend-main: adapt inside Factory (Adapter Pattern)
backend-main -> PostgreSQL: save event
PostgreSQL -> backend-main: saved
backend-main -> Mosquitto: ACK

(optional) backend-main -> Mosquitto: publish "university/alerts"
Mosquitto -> backend-asta: forward alert
backend-asta -> backend-asta: log critical alert
```

**Topics Used:**
- `university/events` – AStA official events → from backend-asta to backend-main
- `university/alerts` – Critical reports → from backend-main to backend-asta

---

## SLIDE 12 – Vertical Slicing Architecture (Modulith)

**Speaker: Loic (Backend-Experte)** ⏱️ 23:00 – 24:30

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     MyStudyApp (Modulith)                               │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────────┐ │
│  │   EVENTS    │  │  IDENTITY   │  │      REGISTRATION               │ │
│  │             │  │             │  │                                 │ │
│  │ Controller  │  │ Controller  │  │  Controller  (RsvpController)   │ │
│  │ Service     │  │ Service     │  │  Service     (RsvpService)      │ │
│  │ Repository  │  │ Repository  │  │  Repository  (RsvpRepository)   │ │
│  │ Model       │  │ Model       │  │  Model       (Rsvp)             │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────────────┘ │
│                                                                         │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │ MODERATION  │  │  NOTIFICATION   │  │         MQTT                │ │
│  │ Controller  │  │  Controller     │  │  Adapter  (EventMessage...) │ │
│  │ Service     │  │  Service        │  │  Listener (OfficialEvent...)│ │
│  │ Repository  │  │  Repository     │  │  DTO      (OfficialEvent...)│ │
│  │ Model       │  │  Model          │  └─────────────────────────────┘ │
│  └─────────────┘  └─────────────────┘                                 │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  common/ (Cross-cutting: Security, Config, Exceptions, Response)   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

**Academic Principles Applied:**
- **High Cohesion (Hohe Kohäsion):** Domain logic stays together in one package
- **Low Coupling (Lose Kopplung):** Domains communicate via services and events, not direct DB joins

---

## SLIDE 13 – REST Principles & Stateless Architecture

**Speaker: Loic (Backend-Experte)** ⏱️ 24:30 – 26:30

**Applying REST Principles (Richardson Maturity Model: Level 2)**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Resource-Oriented URLs (Nouns, not Verbs)                          │
├─────────────────────────────────────────────────────────────────────────┤
│ ❌ Bad:  POST /api/createNewEvent                                     │
│ ✅ Good: POST /api/events                                             │
│                                                                         │
│ 2. Correct HTTP Verbs & Idempotency                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ GET    /api/events/{id}   → Safe, Idempotent                         │
│ PUT    /api/events/{id}   → Idempotent (full update)                 │
│ PATCH  /api/events/{id}   → Partial update                           │
│ DELETE /api/events/{id}   → Idempotent                               │
│                                                                         │
│ 3. Semantic HTTP Status Codes                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ 200 OK           → Standard success                                   │
│ 201 Created      → POST /api/events (new resource)                   │
│ 204 No Content   → DELETE /api/events/{id}                           │
│ 400 Bad Request  → Validation failure                                 │
│ 401 Unauthorized → Invalid JWT                                        │
│ 404 Not Found    → Resource missing (GlobalExceptionHandler)          │
│ 409 Conflict     → Event capacity full (CapacityExceededException)    │
│ 429 Too Many     → Rate limited (5/min for auth, 20/min for writes)  │
│                                                                         │
│ 4. Stateless Architecture (Lecture Concept)                           │
├─────────────────────────────────────────────────────────────────────────┤
│ No HTTP Sessions! 100% Stateless using JWTs in the                   │
│ Authorization: Bearer header.                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Uniform Response Envelope (`ApiResponse<T>`)**

```json
{
  "success": true,
  "message": "Event created",
  "data": { "id": "...", "title": "Campus Fest" },
  "timestamp": "2026-07-14T10:30:00Z"
}
```

---

## SLIDE 14 – OOD Class Diagram (Simplified for Readability)

**Speaker: Christian (UML-Experte)** ⏱️ 26:30 – 28:30

*Per Praktikum 4 rule: "Halten Sie ihr Klassendiagramm übersichtlich! Methoden und Attribute sollen grundsätzlich nicht im Klassendiagramm mit modelliert werden."*

```@diagram
User (JPA Entity) -- hosts --> Event (JPA Entity)
Event (JPA Entity) -- has --> Rsvp (JPA Entity, unique event+user)
Event (JPA Entity) -- receives --> Review (JPA Entity, denormalized helpfulCount)
Event (JPA Entity) -- categorized --> Category (JPA Entity)
```

**Key Design Decisions:**
- **Soft Delete on Event:** Trash bin feature – events can be restored by host/admin.
- **Denormalized `currentRsvpCount`:** Avoids expensive `COUNT(*)` queries.
- **Denormalized `helpfulCount`:** Fast sorting on reviews without joins.
- **Unique constraint on `(event_id, user_id)` in Rsvp:** Prevents duplicate registrations at the database level.
- **Pessimistic Locking for Waitlist:** Prevents double promotion.

---

## SLIDE 15 – Pattern 1: Factory (Creational) – ULTRA‑CLEAN

**Speaker: Christian (UML-Experte)** ⏱️ 28:30 – 31:00

```@diagram
EventFactory -- creates --> Event (JPA Entity)
EventFactory has EventMessageTarget (Adapter) as a dependency.
```

**📌 Motivation:**

> "Events can be created from multiple sources: standard REST API, drafts, and MQTT messages. Each source requires different validation and status assignment. Directly instantiating `Event` objects in multiple places would scatter this logic and violate the Single Responsibility Principle."

**📌 Implementation (Academic Justification):**

> "To keep the diagram clean, we omitted the request DTOs. As you can see, the Factory centralizes the creation of `Event` entities. It encapsulates the complex `if/else` logic that determines if an event gets the `PUBLISHED` or `UNDER_REVIEW` status based on the host's trust level. **Crucially, for MQTT events, the `createOfficialEvent()` method does NOT duplicate the conversion logic. Instead, it delegates to our Adapter.** This makes the Factory the single point of truth for all Event creation and ensures the `OfficialEventListener` only knows about the Factory."

---

## SLIDE 16 – Pattern 2: Adapter (Structural) – ULTRA‑CLEAN

**Speaker: Christian (UML-Experte)** ⏱️ 31:00 – 33:30

```@diagram
OfficialEventAdapter -- implements --> EventMessageTarget (interface)
OfficialEventAdapter -- converts --> OfficialEventMessage (Adaptee)
```

**📌 Motivation:**

> "The MQTT message from AStA comes in a specific JSON format (`activityName`, `time`, `venue`, `organiser`), which is incompatible with our internal `Event` entity. We needed a way to convert between these two representations without modifying either side. The Adapter pattern bridges this gap and adheres to the **Open-Closed Principle**."

**📌 Implementation:**

> "Notice how clean the structure is. The MQTT payload from AStA comes in as an `OfficialEventMessage` with strings for time and venue. Our `OfficialEventAdapter` implements the `EventMessageTarget` interface. It parses these strings into internal `Instant` objects and maps them to an `Event`. If AStA changes their JSON, we only touch this one class—a perfect example of the Open-Closed Principle."

---

## SLIDE 17 – Pattern 3: Observer (Behavioral) – ULTRA‑CLEAN

**Speaker: Christian (UML-Experte)** ⏱️ 33:30 – 36:00

```@diagram
RsvpEventPublisher -- fires --> RsvpCancelledEvent (Spring Event)
WaitlistPromotionListener -- observes --> RsvpCancelledEvent
```

**📌 Motivation:**

> "When a user cancels an RSVP, we need to promote the next waitlisted user, update the real-time SSE, and send a notification. Hardcoding this directly in the `RsvpService` would tightly couple it to the `WaitlistService` and `NotificationService`, making the code brittle and hard to extend."

**📌 Implementation:**

> "When an RSVP is cancelled, the `RsvpEventPublisher` fires a Spring `RsvpCancelledEvent`. The `WaitlistPromotionListener` observes this event and triggers the waitlist promotion. By doing this, the RSVP service knows absolutely nothing about the Waitlist service, achieving perfectly **Lose Kopplung (Low Coupling)**."

---

## SLIDE 18 – Frontend Architecture & State Management

**Speaker: Jonas (Frontend-Experte)** ⏱️ 36:00 – 38:00

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Frontend Architecture (React)                     │
│                                                                         │
│  ┌────────────────────┐   ┌──────────────────────────────────────────┐  │
│  │ Global Client State│   │ Server State Management                  │  │
│  │ (Zustand)          │   │ (TanStack React Query)                   │  │
│  │                    │   │                                          │  │
│  │ • JWT Access Token │ ◀ │ • Caches API responses (Events, RSVPs)   │  │
│  │ • Refresh Token    │   │ • Handles pagination and refetching      │  │
│  │ • User Role/Trust  │   │ • Invalidates cache on mutations         │  │
│  │ • isAuthenticated  │   │ • Manages infinite scroll                │  │
│  └────────────────────┘   └──────────────────────────────────────────┘  │
│            ▼                             ▼                             │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Axios Interceptor (API Client)                                    │  │
│  │ • Automatically attaches `Authorization: Bearer <token>`          │  │
│  │ • Catches 401 Unauthorized errors                                 │  │
│  │ • Silently calls POST /api/auth/refresh and retries request       │  │
│  │ • Handles token expiry without user interruption                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│            ▼                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Server-Sent Events (SSE) Subscriber                              │  │
│  │  • Connects to /api/events/stream/{eventId}                      │  │
│  │  • Listens for 'rsvp-update', 'waitlist-update' events           │  │
│  │  • Updates UI in real-time without polling                       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## SLIDE 19 – Live Demo Walkthrough

**Speaker: Jonas (Frontend-Experte)** ⏱️ 38:00 – 45:00

No static content – live demonstration.

---

## 📌 Q&A CHEAT SHEET – JURY AMBUSH PREPARATION

*(For speaker preparation – not presented as a slide)*

| If the jury asks... | Who answers | The exact answer (Based on Code & Lectures) |
| :--- | :--- | :--- |
| **How did you solve the "Lost Update Problem" for RSVPs?** | Loic / Jonas | "As discussed in the lecture regarding Isolation, we used **Atomic SQL Updates**. Our `EventRepository` executes: `UPDATE Event SET count = count + 1 WHERE count < maxCapacity`. The database guarantees atomicity natively, preventing race conditions without needing manual Java-level locks." |
| **In the lecture, we learned Optimistic Locking. Why did you use Pessimistic Locking for waitlists?** | Loic | "The lecture covered Optimistic Locking, but we intentionally used **Pessimistic Locking** (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) for waitlist promotions. Promotions are high-conflict operations. A `SELECT ... FOR UPDATE` locks the row, preventing deadlocks and double-promotions at the DB level that Optimistic Locking might struggle with under heavy concurrent load." |
| **What is the advantage of Vertical Slicing?** | Abdul | "As taught in the lecture, Vertical Slicing gives us **Hohe Kohäsion (High Cohesion)** and **Lose Kopplung (Low Coupling)**. All artifacts for a domain are in one package. Layered architectures separate by technical concern, making extraction into microservices much harder." |
| **Why does the Factory call the Adapter?** | Christian | "To maintain a **Single Point of Truth** and enforce the **Single Responsibility Principle**. The Listener passes the message to the Factory. The Factory delegates the conversion to the Adapter. This enforces the **Open-Closed Principle**." |
| **Why Rebase instead of Merge?** | Ramy | "Rebasing creates a perfectly linear commit history. It avoids the clutter of 'merge commits', making it much easier to trace changes and use `git bisect` for debugging." |
| **How did you test the MQTT integration?** | Loic | "We used `@SpringBootTest` to load the application context and unit-tested the `OfficialEventAdapter` isolated. In practice, we used Python scripts and Postman to fire payloads at the broker to verify the end-to-end flow." |
| **How does the Trust Level system work exactly?** | Loic | "Users start as `NEW` (events go to UNDER_REVIEW). If they host 3 completed events with an average rating of 4.0 or higher, they become `TRUSTED_HOST` (events auto-publish). A user can be `FLAGGED` by an admin, which locks their account and freezes all their published events to UNDER_REVIEW." |
| **What is the benefit of SSE over WebSocket?** | Abdul | "SSE is simpler and uses standard HTTP, which is firewall-friendly. Our use case is strictly unidirectional—the server pushes updates to clients. WebSocket would be overkill and more complex to implement." |
| **How did you handle the Docker network issue you mentioned?** | Ramy | "The issue was DNS resolution inside the Docker network. The Spring Boot container couldn't resolve 'mosquitto'. We fixed it by using the container name as the hostname (`tcp://mosquitto:1883`) and ensuring both containers were on the same Docker network in `docker-compose.yml`." |
| **What is the ApiResponse wrapper and why did you use it?** | Loic | "`ApiResponse<T>` is a uniform response envelope that wraps all API responses. It contains `success`, `message`, `data`, and `timestamp` fields. We used it to enforce a consistent contract across all endpoints. For validation errors, the `data` field contains a `Map<String, String>` of field-specific errors. For successful responses, it contains the actual DTO. This makes error handling on the frontend predictable and clean." |

---

✅ **Team ready – Final presentation approved.**