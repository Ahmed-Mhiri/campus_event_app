# Speaker Scripts for MyStudyApp Presentation

This document contains all spoken content for each presentation slide. Use as a teleprompter or handout.

---

## SLIDE 1 – Title & Team Introduction
**Speaker: Diyar (Projektmanager)**  
**Time: 0:00 – 1:30**

> "Good morning, everyone. We are Team MyStudyApp. Today we present our campus event platform, developed over four agile sprints. Our team consists of seven members, each with a defined role based on the Praktikum guidelines—from project management to infrastructure. Our goal was to build a production-ready, full-stack application that connects students to campus events safely and efficiently."

---

## SLIDE 2 – Epics & Project Vision
**Speaker: Diyar (Projektmanager)**  
**Time: 1:30 – 3:30**

> "We structured our project around three major Epics. The first, Event Management, covers the core lifecycle—from browsing to registration. The second, Social & Trust, addresses user engagement through reviews and an automated trust-level system. The third, Administration, ensures platform safety through moderation and reporting. These Epics guided our entire agile development process."

---

## SLIDE 3 – User Stories & Acceptance Criteria
**Speaker: Yahya (Scrum-Master)**  
**Time: 3:30 – 5:30**

> "As Scrum Master, I ensured our Epics were translated into actionable User Stories with clear Acceptance Criteria. For example, US-02 required an RSVP button, a confirmation notification, and automatic waitlist placement when capacity is full. These stories were prioritized using the MoSCoW method. The 'High' priority items defined our MVP for the first two sprints."

---

## SLIDE 4 – Sprint Planning & Kanban Board
**Speaker: Yahya (Scrum-Master)**  
**Time: 5:30 – 7:30**

> "We used GitHub Milestones to map our Sprints strictly to the Praktikum timeline. We maintained a Kanban board on GitHub Projects to visualize our workflow—from 'To Do' to 'Done'. This transparency helped us track progress and quickly identify any bottlenecks."

---

## SLIDE 5 – Burndown Chart (Sprint 3)
**Speaker: Yahya (Scrum-Master)**  
**Time: 7:30 – 8:00**

> "Our burndown chart reflects the reality of software development. On Day 3 of Sprint 3, we hit a significant blocker regarding Docker network bridging with the Mosquitto MQTT broker. Ramy, our Infrastructure lead, resolved the internal DNS resolution issue. Once fixed, we accelerated and delivered all planned features on time."

---

## SLIDE 6 – Maven Multi-Module Project & Build Process
**Speaker: Ramy (Infrastruktur)**  
**Time: 8:00 – 10:00**

> "To fulfill Praktikum 2, we structured our project as a Maven multi-module application. The Parent POM manages common dependencies, while each backend module has its own POM. This separation ensures modularity. We successfully tested the build process early on by executing the `main()` function in both modules to ensure the Spring Application contexts loaded correctly."

---

## SLIDE 7 – Git Workflow & Branch Strategy
**Speaker: Ramy (Infrastruktur)**  
**Time: 10:00 – 13:00**

> "In a 7-person team, Git can quickly become chaotic. We used a strict Feature Branch workflow with a protected `main` branch. Every feature required a Pull Request. **Crucially, we chose 'Rebasing' over standard merging.** Developers were required to `git pull --rebase` to resolve conflicts locally. This prevents messy 'merge commits' from cluttering our repository, giving us a perfectly linear history that makes debugging with `git bisect` much easier."

---

## SLIDE 8 – CI/CD Pipeline & Testing Strategy
**Speaker: Loic (Backend-Experte)**  
**Time: 13:00 – 16:00**

> "Our CI pipeline acts as an automated gatekeeper. On every Pull Request, GitHub Actions runs Maven to build and test the codebase. We have 66 tests passing with about 80% coverage. We intentionally avoided flaky End-to-End tests, opting instead to rigorously test our REST controllers using `MockMvc` without the overhead of starting a full Tomcat server, and isolating our business logic using JUnit 5 and Mockito. If tests fail, the merge button is blocked."

---

## SLIDE 9 – Verteilungsdiagramm (UML)
**Speaker: Abdul (Architekt)**  
**Time: 16:00 – 19:00**

> "Following the exact UML notation from the *Architekturmodellierung* lecture, this is our Verteilungsdiagramm. We have our artifacts running in specific execution environments on a Docker host. The two Spring Boot backends communicate asynchronously via the Mosquitto MQTT broker using QoS 1. The frontend communicates with `backend-main` via REST and SSE. All components are properly tagged with their UML stereotypes."

---

## SLIDE 10 – MQTT Maven Dependencies
**Speaker: Abdul (Architekt)**  
**Time: 19:00 – 20:30**

> "To meet the Praktikum 3 requirement explicitly, we added the `spring-integration-mqtt` dependency to both backends. This provides the Eclipse Paho client. Our `MqttConfig` sets up a connection factory with automatic reconnect and an inbound adapter that subscribes to the `university/events` topic with QoS 1—ensuring at-least-once delivery. We also configured an outbound channel for critical alerts to the `university/alerts` topic."

---

## SLIDE 11 – MQTT Communication Flow
**Speaker: Abdul (Architekt)**  
**Time: 20:30 – 23:00**

> "Here is the exact MQTT flow. When AStA staff publish an event, `backend-asta` serializes the request and publishes it to the `university/events` topic. The broker confirms delivery. `backend-main`, which is subscribed to this topic, receives the message. The `EventFactory` handles the creation, internally delegating to the `OfficialEventAdapter` to convert the external format into our internal `Event` entity. The event is then saved to the database. Additionally, when a user submits a critical report, `backend-main` publishes an alert to `university/alerts`, which `backend-asta` listens to for monitoring."

---

## SLIDE 12 – Vertical Slicing Architecture (Modulith)
**Speaker: Loic (Backend-Experte)**  
**Time: 23:00 – 24:30**

> "As required by Praktikum 3, we rejected the classical layered architecture in favor of **Vertical Slicing** (a Modulith). As discussed in the Softwaretechnik lectures, this architecture provides **Hohe Kohäsion (High Cohesion)** because all artifacts related to a business capability (like Registration) are in one package. It also ensures **Lose Kopplung (Low Coupling)**, making it much easier to extract a microservice later."

---

## SLIDE 13 – REST Principles & Stateless Architecture
**Speaker: Loic (Backend-Experte)**  
**Time: 24:30 – 26:30**

> "Our REST API achieves Level 2 of the Richardson Maturity Model. We strictly use resource-oriented nouns and correct HTTP verbs. We heavily utilized semantic HTTP status codes—returning `201 Created` when a host makes an event, or `409 Conflict` if a student tries to RSVP to a full event. **Most importantly, our API applies the Stateless Architecture Pattern directly from the lecture. We store zero session state on the server. Every request is authenticated via a JWT, allowing our backend to scale horizontally without session replication.** All responses are wrapped in a uniform `ApiResponse<T>` envelope for predictable frontend handling."

---

## SLIDE 14 – OOD Class Diagram (Simplified)
**Speaker: Christian (UML-Experte)**  
**Time: 26:30 – 28:30**

> "Per the strict Praktikum 4 rules, we kept the main OOD diagram abstract and clear, hiding attributes for standard classes. The core centers around `Event`. To ensure data integrity at the database level, we placed a unique constraint on `event_id` and `user_id` inside the `Rsvp` table. We also use denormalized counters like `currentRsvpCount` and `helpfulCount` for performance. **Now we will zoom in on the three design patterns we used, showing only the relevant attributes as required by the assignment.**"

---

## SLIDE 15 – Pattern 1: Factory (Creational)
**Speaker: Christian (UML-Experte)**  
**Time: 28:30 – 31:00**

> "Our first pattern is the **Factory Pattern** (Creational). To keep the diagram clean, we omitted the request DTOs. The Factory centralizes the creation of `Event` entities. **The academic justification connects to the Single Responsibility Principle.** The Factory encapsulates the conditional logic for mapping a User's `TrustLevel` to an `EventStatus`. By keeping this logic inside the Factory, our `EventService` remains clean. For MQTT events, the Factory delegates to our Adapter—this makes the Factory the single point of truth for all Event creation."

---

## SLIDE 16 – Pattern 2: Adapter (Structural)
**Speaker: Christian (UML-Experte)**  
**Time: 31:00 – 33:30**

> "The **Adapter Pattern** (Structural) bridges incompatible interfaces. Notice how clean the structure is. The MQTT payload from AStA comes in as an `OfficialEventMessage` with strings for time and venue. Our `OfficialEventAdapter` implements the `EventMessageTarget` interface. It parses these strings into internal `Instant` objects and maps them to an `Event`. If AStA changes their JSON, we only touch this one class—a perfect example of the Open-Closed Principle."

---

## SLIDE 17 – Pattern 3: Observer (Behavioral)
**Speaker: Christian (UML-Experte)**  
**Time: 33:30 – 36:00**

> "Finally, the **Observer Pattern** (Behavioral). When an RSVP is cancelled, the `RsvpEventPublisher` fires a Spring `RsvpCancelledEvent`. The `WaitlistPromotionListener` observes this event and triggers the waitlist promotion. By doing this, the RSVP service knows absolutely nothing about the Waitlist service, achieving perfectly **Lose Kopplung (Low Coupling)**. This strictly follows the **Single Responsibility Principle**."

---

## SLIDE 18 – Frontend Architecture & State Management
**Speaker: Jonas (Frontend-Experte)**  
**Time: 36:00 – 38:00**

> "To consume the backend APIs, our React frontend uses a hybrid state approach. **Zustand** securely holds our JWT tokens in memory with persistence to localStorage. **TanStack React Query** manages our server state—caching paginated event feeds and automatically invalidating cache after an RSVP mutation. To handle security seamlessly, our **Axios Interceptor** catches 401 Unauthorized errors, uses the refresh token to get a new session, and replays the request silently. Finally, we subscribe to SSE streams for real-time capacity updates without heavy polling."

---

## SLIDE 19 – Live Demo Walkthrough
**Speaker: Jonas (Frontend-Experte)**  
**Time: 38:00 – 45:00**

> "To conclude, I will briefly demonstrate the live application. We have the frontend running on localhost:5173 and the backend on localhost:8080."

**Step 1: Login & Browse (2 minutes)**

> "I'll log in as a student. The application uses JWT-based authentication. The JWT is handled securely by Zustand. The event feed displays all PUBLISHED events with filters by category, date, and location. Each event card shows the host's trust badge, capacity bar, and RSVP status."

**Step 2: Register & Real-time SSE Update (2 minutes)**

> "I'll open a second browser window side-by-side. When I click 'Register' in window one, the capacity counter updates in window two in real-time. This is Server-Sent Events (SSE) in action—the backend pushes updates to all connected clients. The SSE stream uses the event name 'rsvp-update' and the frontend listens for it. If the event is full, the user is placed on the waitlist. A notification is also sent to the host when a user cancels."

**Step 3: Create an Event & MQTT (3 minutes)**

> "Now I'll switch to a TRUSTED_HOST account and publish an event. It auto-publishes without admin review. Behind the scenes, we can also see `backend-asta` publishing official events via MQTT, which seamlessly appear in our database without direct REST calls. The AStA staff can publish events using a simple POST request to `/api/asta/publish-event`. The event is published to the `university/events` topic and our `backend-main` consumes it."

---

**End of speaker scripts.**