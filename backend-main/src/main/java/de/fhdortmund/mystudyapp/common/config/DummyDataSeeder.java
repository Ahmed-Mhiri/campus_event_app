package de.fhdortmund.mystudyapp.common.config;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import de.fhdortmund.mystudyapp.events.model.Category;
import de.fhdortmund.mystudyapp.events.model.Event;
import de.fhdortmund.mystudyapp.events.model.EventCategory;
import de.fhdortmund.mystudyapp.events.model.EventCategoryId;
import de.fhdortmund.mystudyapp.events.model.EventMedia;
import de.fhdortmund.mystudyapp.events.model.EventStatus;
import de.fhdortmund.mystudyapp.events.model.MediaType;
import de.fhdortmund.mystudyapp.events.repository.CategoryRepository;
import de.fhdortmund.mystudyapp.events.repository.EventRepository;
import de.fhdortmund.mystudyapp.identity.model.Role;
import de.fhdortmund.mystudyapp.identity.model.TrustLevel;
import de.fhdortmund.mystudyapp.identity.model.User;
import de.fhdortmund.mystudyapp.identity.model.UserPreference;
import de.fhdortmund.mystudyapp.identity.repository.PasswordResetTokenRepository;
import de.fhdortmund.mystudyapp.identity.repository.UserPreferenceRepository;
import de.fhdortmund.mystudyapp.identity.repository.UserRepository;
import de.fhdortmund.mystudyapp.identity.repository.VerificationTokenRepository;
import de.fhdortmund.mystudyapp.moderation.model.Review;
import de.fhdortmund.mystudyapp.moderation.repository.ReportRepository;
import de.fhdortmund.mystudyapp.moderation.repository.ReviewRepository;
import de.fhdortmund.mystudyapp.moderation.repository.ReviewVoteRepository;
import de.fhdortmund.mystudyapp.notification.model.Notification;
import de.fhdortmund.mystudyapp.notification.model.NotificationType;
import de.fhdortmund.mystudyapp.notification.repository.NotificationRepository;
import de.fhdortmund.mystudyapp.registration.model.Rsvp;
import de.fhdortmund.mystudyapp.registration.model.RsvpStatus;
import de.fhdortmund.mystudyapp.registration.repository.RsvpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class DummyDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;
    private final RsvpRepository rsvpRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewVoteRepository reviewVoteRepository;
    private final NotificationRepository notificationRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;

    // NEW: inject ReportRepository to clear reports before events
    private final ReportRepository reportRepository;

    @Value("${app.seeder.force-clear:true}")
    private boolean forceClear;

    private final Random random = new Random(42L);

    // ----- Expanded static data pools (all names unique) -----
    private static final List<String> EVENT_TITLES = Arrays.asList(
        "Agile Workshop: Scrum Mastery", "Hackathon: Build a Startup in 48h",
        "Tech Talk: Quantum Computing", "Data Science Bootcamp",
        "Web3 & Blockchain Meetup", "Campus Summer Party",
        "International Food Festival", "Art Exhibition: Student Showcase",
        "Career Fair 2026", "Networking with Alumni",
        "Football Tournament", "Yoga & Mindfulness Session",
        "Guest Lecture: AI Ethics", "Movie Night: Classic Sci-Fi",
        "Board Game Marathon", "Coding Interview Prep",
        "Robotics Workshop", "Music Open Mic Night",
        "Sustainable Living Workshop", "Debate Club: Future of Work",
        "Photography Walk", "Startup Pitch Night",
        "Language Exchange Café", "Dance Class: Salsa Basics",
        "Campus Cleanup Drive", "Investment 101",
        "Public Speaking Workshop", "Karaoke Night",
        "E-Sports Tournament", "Meditation Retreat",
        "Job Interview Simulation", "Mental Health Awareness Session",
        "Climate Action Workshop", "Campus Tour for New Students",
        "International Student Mixer"
    );

    private static final List<String> DESCRIPTIONS = Arrays.asList(
        "Hands-on session with expert mentors.", "Join us for an exciting day of learning and fun.",
        "Don't miss this opportunity to network with professionals.", "Limited spots – register now!",
        "All skill levels welcome.", "Free food and drinks provided.",
        "Bring your own laptop and ideas.", "Certificate of participation will be given.",
        "Interactive Q&A panel with industry leaders.", "A great chance to meet like-minded people.",
        "Engaging workshop with practical exercises.", "Keynote speaker from the industry.",
        "Networking event with refreshments.", "Open to all students and staff."
    );

    private static final List<String> LOCATIONS = Arrays.asList(
        "Room A-101, Main Building", "Auditorium Max, Building C",
        "Student Lounge, Building B", "Conference Hall, Building D",
        "Sports Field East", "Cafeteria Terrace",
        "Library Study Room 3", "Innovation Hub, Ground Floor",
        "Online (Zoom link will be sent)", "Parking Lot West (outdoor)",
        "Lecture Hall 2, Building E", "Student Club House"
    );

    // All names must be unique!
    private static final List<String> USER_NAMES = Arrays.asList(
        "Alice Wonder", "Bob Builder", "Charlie Brown", "Diana Prince",
        "Ethan Hunt", "Fiona Gallagher", "George Costanza", "Hermione Granger",
        "Ian Malcolm", "Julia Child", "Kevin McCallister", "Laura Croft",
        "Marty McFly", "Nina Simone", "Oscar Wilde", "Peggy Carter",
        "Quentin Tarantino", "Rosa Parks", "Steve Rogers", "Tina Turner",
        "Bruce Wayne", "Clark Kent", "Wanda Maximoff",
        "Tony Stark", "Natasha Romanoff", "Peter Parker", "Thor Odinson",
        "Stephen Strange"
    );

    private static final List<String> CATEGORY_NAMES = Arrays.asList(
        "Workshop", "Party", "Lecture", "Sports", "Networking",
        "Music", "Food & Drink", "Art & Culture", "Career", "Gaming",
        "Wellness", "Science", "Technology", "Language", "Social"
    );

    // Using Map.ofEntries to support many key-value pairs
    private static final Map<String, String> CATEGORY_ICONS = Map.ofEntries(
        Map.entry("Workshop", "workshop"),
        Map.entry("Party", "party"),
        Map.entry("Lecture", "lecture"),
        Map.entry("Sports", "sports"),
        Map.entry("Networking", "network"),
        Map.entry("Music", "music"),
        Map.entry("Food & Drink", "food"),
        Map.entry("Art & Culture", "art"),
        Map.entry("Career", "career"),
        Map.entry("Gaming", "gaming"),
        Map.entry("Wellness", "wellness"),
        Map.entry("Science", "science"),
        Map.entry("Technology", "tech"),
        Map.entry("Language", "language"),
        Map.entry("Social", "social")
    );

    private static final Map<String, String> CATEGORY_COLORS = Map.ofEntries(
        Map.entry("Workshop", "#FF5733"),
        Map.entry("Party", "#33FF57"),
        Map.entry("Lecture", "#3357FF"),
        Map.entry("Sports", "#FF33A1"),
        Map.entry("Networking", "#FFC300"),
        Map.entry("Music", "#9B59B6"),
        Map.entry("Food & Drink", "#E67E22"),
        Map.entry("Art & Culture", "#1ABC9C"),
        Map.entry("Career", "#2ECC71"),
        Map.entry("Gaming", "#E74C3C"),
        Map.entry("Wellness", "#8E44AD"),
        Map.entry("Science", "#3498DB"),
        Map.entry("Technology", "#2C3E50"),
        Map.entry("Language", "#F39C12"),
        Map.entry("Social", "#D35400")
    );

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            if (forceClear) {
                log.info("🧹 Smart Seeder: Wiping existing database for a fresh state...");
                clearDatabase();
            } else {
                log.info("Database already seeded and force-clear is disabled. Skipping.");
                return;
            }
        }

        log.info("🌱 Seeding massive dummy dataset for UI testing...");

        // --- 1. Users ---
        List<User> users = createUsers();
        userRepository.saveAll(users);
        userRepository.flush();

        // --- 2. Categories ---
        List<Category> categories = createCategories();
        categoryRepository.saveAll(categories);

        // --- 3. Events ---
        List<Event> events = createEvents(users);
        eventRepository.saveAll(events);
        eventRepository.flush();

        // --- 4. Associate Categories ---
        associateCategories(events, categories);

        // --- 5. RSVPs (with waitlist & check-in simulation) ---
        createRsvps(users, events);

        // --- 6. Reviews (for past events) ---
        createReviews(events);

        // --- 7. Event Media ---
        createEventMedia(events);

        // --- 8. User Preferences ---
        users.forEach(this::createUserPreference);

        // --- 9. Notifications ---
        createNotifications(events);

        log.info("✅ Seeding complete! Users: {}, Events: {}, Categories: {}, RSVPs: {}, Reviews: {}",
                userRepository.count(), eventRepository.count(), categoryRepository.count(),
                rsvpRepository.count(), reviewRepository.count());
    }

    /**
     * Clear all tables in correct order to respect foreign key constraints.
     * Reports depend on Events, so delete reports first.
     */
    private void clearDatabase() {
        reviewVoteRepository.deleteAll();
        reviewRepository.deleteAll();
        reportRepository.deleteAll();      // <-- NEW: delete reports before events
        rsvpRepository.deleteAll();
        notificationRepository.deleteAll();
        eventRepository.deleteAll();
        categoryRepository.deleteAll();
        userPreferenceRepository.deleteAll();
        verificationTokenRepository.deleteAll();
        passwordResetTokenRepository.deleteAll();
        userRepository.deleteAll();
        userRepository.flush();
    }

    // ---------- USERS (40+) ----------
    private List<User> createUsers() {
        List<User> users = new ArrayList<>();
        // Admins
        users.add(createUser("admin@example.com", "System Admin", Role.ADMIN, TrustLevel.TRUSTED_HOST, true));
        users.add(createUser("mod1@example.com", "Moderator One", Role.ADMIN, TrustLevel.TRUSTED_HOST, true));
        users.add(createUser("mod2@example.com", "Moderator Two", Role.ADMIN, TrustLevel.TRUSTED_HOST, true));

        // Trusted hosts (first 5 from USER_NAMES)
        for (int i = 0; i < 5; i++) {
            String name = USER_NAMES.get(i);
            users.add(createUser(name.toLowerCase().replace(" ", ".") + "@example.com",
                    name, Role.STUDENT, TrustLevel.TRUSTED_HOST, true));
        }

        // Regular students (mix of NEW and TRUSTED_HOST, some unverified)
        for (int i = 5; i < USER_NAMES.size(); i++) {
            String name = USER_NAMES.get(i);
            boolean verified = random.nextDouble() < 0.8;
            TrustLevel trust = random.nextDouble() < 0.3 ? TrustLevel.TRUSTED_HOST : TrustLevel.NEW;
            users.add(createUser(name.toLowerCase().replace(" ", ".") + "@example.com",
                    name, Role.STUDENT, trust, verified));
        }

        // Flagged user
        users.add(createUser("flagged@example.com", "Flagged User", Role.STUDENT, TrustLevel.FLAGGED, true));

        // Extra users to reach ~40 (using generic names)
        for (int i = 0; i < 5; i++) {
            String name = "ExtraUser" + (i+1);
            users.add(createUser("extra" + i + "@example.com", name, Role.STUDENT,
                    TrustLevel.NEW, random.nextBoolean()));
        }

        return users;
    }

    private User createUser(String email, String displayName, Role role, TrustLevel trustLevel, boolean verified) {
        return User.builder()
                .universityEmail(email)
                .passwordHash(passwordEncoder.encode("password123"))
                .displayName(displayName)
                .bio("Dummy bio for " + displayName)
                .profileImageUrl("https://ui-avatars.com/api/?name=" + displayName.replace(" ", "+") + "&background=random")
                .role(role)
                .trustLevel(trustLevel)
                .isVerified(verified)
                .build();
    }

    // ---------- CATEGORIES ----------
    private List<Category> createCategories() {
        List<Category> categories = new ArrayList<>();
        int order = 0;
        for (String name : CATEGORY_NAMES) {
            categories.add(Category.builder()
                    .name(name)
                    .icon(CATEGORY_ICONS.get(name))
                    .color(CATEGORY_COLORS.get(name))
                    .sortOrder(order++)
                    .build());
        }
        return categories;
    }

    // ---------- EVENTS (60+) with varied statuses ----------
    private List<Event> createEvents(List<User> users) {
        List<Event> events = new ArrayList<>();
        Instant now = Instant.now();

        List<User> activeHosts = users.stream()
                .filter(u -> u.getTrustLevel() != TrustLevel.FLAGGED && !u.getRole().equals(Role.ADMIN))
                .collect(Collectors.toList());

        User primaryHost = activeHosts.get(0);

        // --- HERO EVENTS (For targeted frontend testing) ---
        
        // 1. LIVE CHECK-IN SIMULATOR (Started 15 mins ago)
        events.add(createEvent("[LIVE] Check-in Simulator", now.minus(15, ChronoUnit.MINUTES), 
                primaryHost, EventStatus.PUBLISHED, null));

        // 2. WAITLIST BOTTLENECK (Tiny capacity to guarantee waitlist)
        events.add(createEvent("[HOT] Waitlist Bottleneck Event", now.plus(1, ChronoUnit.DAYS), 
                primaryHost, EventStatus.PUBLISHED, null));

        // --- RANDOMIZED FEED EVENTS ---

        // 1. Future PUBLISHED (23 events)
        for (int i = 0; i < 23; i++) {
            User host = activeHosts.get(random.nextInt(activeHosts.size()));
            Instant start = now.plus(random.nextInt(30) + 1, ChronoUnit.DAYS)
                               .plus(random.nextInt(12), ChronoUnit.HOURS);
            events.add(createEvent(EVENT_TITLES.get(random.nextInt(EVENT_TITLES.size())), start, host, EventStatus.PUBLISHED, null));
        }

        // 2. Past events – now set to COMPLETED (15 events)
        for (int i = 0; i < 15; i++) {
            User host = activeHosts.get(random.nextInt(activeHosts.size()));
            Instant start = now.minus(random.nextInt(30) + 1, ChronoUnit.DAYS)
                               .minus(random.nextInt(12), ChronoUnit.HOURS);
            events.add(createEvent(EVENT_TITLES.get(random.nextInt(EVENT_TITLES.size())) + " (Past)", start, host, EventStatus.COMPLETED, null));
        }

        // 3. UNDER_REVIEW (10 events)
        for (int i = 0; i < 10; i++) {
            User host = activeHosts.get(random.nextInt(activeHosts.size()));
            Instant start = now.plus(random.nextInt(20) + 1, ChronoUnit.DAYS);
            events.add(createEvent("Review: " + EVENT_TITLES.get(random.nextInt(EVENT_TITLES.size())), start, host, EventStatus.UNDER_REVIEW, null));
        }

        // 4. CANCELLED (5 events)
        for (int i = 0; i < 5; i++) {
            User host = activeHosts.get(random.nextInt(activeHosts.size()));
            Instant start = now.plus(random.nextInt(15) + 1, ChronoUnit.DAYS);
            events.add(createEvent("CANCELLED: " + EVENT_TITLES.get(random.nextInt(EVENT_TITLES.size())), start, host, EventStatus.CANCELLED, "Cancelled due to weather"));
        }

        // 5. DRAFT (5 events)
        for (int i = 0; i < 5; i++) {
            User host = activeHosts.get(random.nextInt(activeHosts.size()));
            Instant start = now.plus(random.nextInt(20) + 1, ChronoUnit.DAYS);
            events.add(createEvent("Draft: " + EVENT_TITLES.get(random.nextInt(EVENT_TITLES.size())), start, host, EventStatus.DRAFT, null));
        }

        return events;
    }

    private Event createEvent(String title, Instant startTime, User host, EventStatus status, String cancellationReason) {
        int capacity;
        if (random.nextDouble() < 0.3) {
            capacity = 5 + random.nextInt(15);  // small
        } else {
            capacity = 20 + random.nextInt(80);
        }
        int rsvpCount = (status == EventStatus.PUBLISHED || status == EventStatus.CANCELLED || status == EventStatus.COMPLETED)
                ? random.nextInt(Math.min(capacity, 20))
                : 0;

        return Event.builder()
                .host(host)
                .title(title)
                .description(DESCRIPTIONS.get(random.nextInt(DESCRIPTIONS.size())))
                .location(LOCATIONS.get(random.nextInt(LOCATIONS.size())))
                .startTime(startTime)
                .endTime(startTime.plus(random.nextInt(3) + 1, ChronoUnit.HOURS))
                .maxCapacity(capacity)
                .currentRsvpCount(rsvpCount)
                .status(status)
                .cancellationReason(cancellationReason)
                .slug(title.toLowerCase().replaceAll("[^a-z0-9]", "-") + "-" + UUID.randomUUID().toString().substring(0, 6))
                .checkInCode(UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .viewCount((long) random.nextInt(100))
                .build();
    }

    // ---------- CATEGORY ASSOCIATION ----------
    private void associateCategories(List<Event> events, List<Category> categories) {
        for (Event event : events) {
            int numCats = random.nextInt(2) + 1;
            List<Category> selected = new ArrayList<>(categories);
            Collections.shuffle(selected, random);
            for (int i = 0; i < Math.min(numCats, selected.size()); i++) {
                Category cat = selected.get(i);
                EventCategoryId id = new EventCategoryId(event.getId(), cat.getId());
                EventCategory ec = EventCategory.builder()
                        .id(id)
                        .event(event)
                        .category(cat)
                        .build();
                event.getEventCategories().add(ec);
            }
        }
        eventRepository.saveAll(events);
    }

    // ---------- RSVPS (with waitlist and check-in) ----------
    private void createRsvps(List<User> users, List<Event> events) {
        List<User> activeUsers = users.stream()
                .filter(u -> u.getTrustLevel() != TrustLevel.FLAGGED)
                .collect(Collectors.toList());

        // Find Charlie Brown's user object for guaranteed ATTENDED RSVP
        User charlieBrown = users.stream()
                .filter(u -> u.getUniversityEmail().equals("charlie.brown@example.com"))
                .findFirst()
                .orElse(null);

        for (Event event : events) {
            // Handle both PUBLISHED and COMPLETED events
            if (event.getStatus() != EventStatus.PUBLISHED && event.getStatus() != EventStatus.COMPLETED) {
                continue;
            }

            boolean isPast = event.getEndTime().isBefore(Instant.now());
            int capacity = event.getMaxCapacity();
            
            // Allow maxRsvps to exceed capacity by up to 15 to force waitlists for future events
            int maxRsvps = isPast 
                ? Math.min(capacity, random.nextInt(capacity + 1)) 
                : capacity + random.nextInt(15); 

            // Special overrides for our "Hero" test events
            if (event.getTitle().contains("[HOT]")) {
                capacity = 5;
                event.setMaxCapacity(capacity);
                maxRsvps = 20; // 5 going, 15 waitlisted
            } else if (event.getTitle().contains("[LIVE]")) {
                maxRsvps = 25; // Guarantee a good crowd for check-in testing
            }

            List<User> shuffledUsers = new ArrayList<>(activeUsers);
            Collections.shuffle(shuffledUsers, random);

            // Ensure Charlie Brown gets an ATTENDED RSVP for the first COMPLETED event
            boolean charlieAttended = false;

            int created = 0;
            int goingCount = 0;

            for (User user : shuffledUsers) {
                if (created >= maxRsvps) break;
                if (user.equals(event.getHost())) continue;

                // Check if user already has an RSVP for this event
                List<Rsvp> existing = rsvpRepository.findByEventId(event.getId());
                boolean alreadyRsvped = existing.stream().anyMatch(r -> r.getUser().equals(user));
                if (alreadyRsvped) continue;

                RsvpStatus status;
                
                if (goingCount < capacity) {
                    if (isPast) {
                        // For past events, most are ATTENDED, but we'll decide:
                        if (charlieBrown != null && user.equals(charlieBrown) && event.getStatus() == EventStatus.COMPLETED && !charlieAttended) {
                            // Force Charlie Brown to be ATTENDED for the first completed event
                            status = RsvpStatus.ATTENDED;
                            charlieAttended = true;
                        } else {
                            status = random.nextDouble() < 0.8 ? RsvpStatus.ATTENDED : RsvpStatus.CANCELLED;
                        }
                    } else if (event.getTitle().contains("[LIVE]")) {
                        // Mix of checked-in and pending for the live event
                        status = random.nextDouble() < 0.6 ? RsvpStatus.ATTENDED : RsvpStatus.GOING;
                    } else {
                        double r = random.nextDouble();
                        status = r < 0.7 ? RsvpStatus.GOING : RsvpStatus.CANCELLED;
                    }
                } else {
                    // Naturally pushes people to the waitlist once capacity is reached
                    status = isPast ? RsvpStatus.CANCELLED : RsvpStatus.WAITLISTED;
                }

                if (status == RsvpStatus.GOING || status == RsvpStatus.ATTENDED) {
                    goingCount++;
                }

                Rsvp rsvp = Rsvp.builder()
                        .user(user)
                        .event(event)
                        .status(status)
                        .cancellationReason(status == RsvpStatus.CANCELLED ? "Changed my mind" : null)
                        .build();
                rsvpRepository.save(rsvp);
                created++;
            }

            // Use the calculated goingCount instead of hitting the database
            event.setCurrentRsvpCount(goingCount);
            eventRepository.save(event);
        }
    }

    // ---------- REVIEWS ----------
    private void createReviews(List<Event> events) {
        // Only past events that are COMPLETED
        List<Event> completedEvents = events.stream()
                .filter(e -> e.getStatus() == EventStatus.COMPLETED && e.getEndTime().isBefore(Instant.now()))
                .collect(Collectors.toList());

        for (Event event : completedEvents) {
            // Get attendees (GOING or ATTENDED)
            List<Rsvp> attendees = rsvpRepository.findByEventId(event.getId()).stream()
                    .filter(r -> r.getStatus() == RsvpStatus.GOING || r.getStatus() == RsvpStatus.ATTENDED)
                    .collect(Collectors.toList());
            if (attendees.isEmpty()) continue;

            Collections.shuffle(attendees, random);
            int numReviews = Math.min(5, attendees.size());
            for (int i = 0; i < numReviews; i++) {
                User reviewer = attendees.get(i).getUser();
                if (reviewer.equals(event.getHost())) continue;
                int rating = random.nextInt(5) + 1;
                if (random.nextDouble() < 0.2) {
                    rating = 5;
                }
                reviewRepository.save(Review.builder()
                        .event(event)
                        .reviewer(reviewer)
                        .rating(rating)
                        .comment("Great event! " + (rating >= 4 ? "Highly recommend." : "Could be improved."))
                        .helpfulCount(random.nextInt(10))
                        .build());
            }
        }
    }

    // ---------- EVENT MEDIA ----------
    private void createEventMedia(List<Event> events) {
        List<String> imageUrls = Arrays.asList(
                "https://picsum.photos/seed/1/800/600",
                "https://picsum.photos/seed/2/800/600",
                "https://picsum.photos/seed/3/800/600",
                "https://picsum.photos/seed/4/800/600",
                "https://picsum.photos/seed/5/800/600"
        );

        for (Event event : events.stream().limit(25).collect(Collectors.toList())) {
            int numImages = random.nextInt(3) + 1;
            for (int i = 0; i < numImages; i++) {
                String url = imageUrls.get(random.nextInt(imageUrls.size()));
                event.getEventMedia().add(EventMedia.builder()
                        .event(event)
                        .url(url)
                        .mediaType(MediaType.IMAGE)
                        .filename("image-" + UUID.randomUUID() + ".jpg")
                        .thumbnailUrl(url.replace("/800/600", "/400/300"))
                        .mediumUrl(url)
                        .displayOrder(i)
                        .build());
            }
        }
        eventRepository.saveAll(events);
    }

    // ---------- USER PREFERENCES ----------
    private void createUserPreference(User user) {
        UserPreference preference = UserPreference.builder()
                .user(user)
                .emailNotifications(random.nextBoolean())
                .pushNotifications(random.nextBoolean())
                .notifyOnRsvpChange(random.nextBoolean())
                .notifyOnReview(random.nextBoolean())
                .timezone(random.nextBoolean() ? "Europe/Berlin" : "Europe/London")
                .language(random.nextBoolean() ? "de" : "en")
                .build();
        userPreferenceRepository.save(preference);
    }

    // ---------- NOTIFICATIONS ----------
    private void createNotifications(List<Event> events) {
        List<Event> publishedEvents = events.stream()
                .filter(e -> e.getStatus() == EventStatus.PUBLISHED)
                .limit(10)
                .collect(Collectors.toList());

        for (Event event : publishedEvents) {
            List<User> attendees = rsvpRepository.findByEventId(event.getId()).stream()
                    .map(Rsvp::getUser)
                    .limit(3)
                    .collect(Collectors.toList());
            for (User user : attendees) {
                notificationRepository.save(Notification.builder()
                        .user(user)
                        .type(NotificationType.EVENT_APPROVED)
                        .title("Event Approved: " + event.getTitle())
                        .message("Your event has been approved and is now live!")
                        .relatedEventId(event.getId())
                        .actionUrl("/events/" + event.getId())
                        .isRead(random.nextBoolean())
                        .build());
            }
        }
    }
}