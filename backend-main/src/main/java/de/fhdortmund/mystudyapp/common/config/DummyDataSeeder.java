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

    @Value("${app.seeder.force-clear:true}")
    private boolean forceClear;

    private final Random random = new Random(42L);

    // ----- Static data pools -----
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
        "E-Sports Tournament", "Meditation Retreat"
    );

    private static final List<String> DESCRIPTIONS = Arrays.asList(
        "Hands-on session with expert mentors.", "Join us for an exciting day of learning and fun.",
        "Don't miss this opportunity to network with professionals.", "Limited spots – register now!",
        "All skill levels welcome.", "Free food and drinks provided.",
        "Bring your own laptop and ideas.", "Certificate of participation will be given.",
        "Interactive Q&A panel with industry leaders.", "A great chance to meet like-minded people."
    );

    private static final List<String> LOCATIONS = Arrays.asList(
        "Room A-101, Main Building", "Auditorium Max, Building C",
        "Student Lounge, Building B", "Conference Hall, Building D",
        "Sports Field East", "Cafeteria Terrace",
        "Library Study Room 3", "Innovation Hub, Ground Floor",
        "Online (Zoom link will be sent)", "Parking Lot West (outdoor)"
    );

    private static final List<String> USER_NAMES = Arrays.asList(
        "Alice Wonder", "Bob Builder", "Charlie Brown", "Diana Prince",
        "Ethan Hunt", "Fiona Gallagher", "George Costanza", "Hermione Granger",
        "Ian Malcolm", "Julia Child", "Kevin McCallister", "Laura Croft",
        "Marty McFly", "Nina Simone", "Oscar Wilde", "Peggy Carter",
        "Quentin Tarantino", "Rosa Parks", "Steve Rogers", "Tina Turner"
    );

    private static final List<String> CATEGORY_NAMES = Arrays.asList(
        "Workshop", "Party", "Lecture", "Sports", "Networking",
        "Music", "Food & Drink", "Art & Culture", "Career", "Gaming"
    );

    private static final Map<String, String> CATEGORY_ICONS = Map.of(
        "Workshop", "workshop", "Party", "party",
        "Lecture", "lecture", "Sports", "sports",
        "Networking", "network", "Music", "music",
        "Food & Drink", "food", "Art & Culture", "art",
        "Career", "career", "Gaming", "gaming"
    );

    private static final Map<String, String> CATEGORY_COLORS = Map.of(
        "Workshop", "#FF5733", "Party", "#33FF57",
        "Lecture", "#3357FF", "Sports", "#FF33A1",
        "Networking", "#FFC300", "Music", "#9B59B6",
        "Food & Drink", "#E67E22", "Art & Culture", "#1ABC9C",
        "Career", "#2ECC71", "Gaming", "#E74C3C"
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

        // --- 1. Users (flush to ensure IDs are generated) ---
        List<User> users = createUsers();
        userRepository.saveAll(users);
        userRepository.flush();   // <-- ensures users are persisted before we reference them

        // --- 2. Categories ---
        List<Category> categories = createCategories();
        categoryRepository.saveAll(categories);

        // --- 3. Events (flush before adding media) ---
        List<Event> events = createEvents(users);
        eventRepository.saveAll(events);
        eventRepository.flush();  // ensures events exist before media and categories

        // --- 4. Associate Categories (many‑to‑many) ---
        associateCategories(events, categories);

        // --- 5. RSVPs ---
        createRsvps(users, events);

        // --- 6. Reviews (for past events) ---
        createReviews(users, events);

        // --- 7. Event Media ---
        createEventMedia(events);

        // --- 8. User Preferences (now with explicit userId) ---
        users.forEach(this::createUserPreference);

        // --- 9. Notifications ---
        createNotifications(events);

        log.info("✅ Seeding complete! Users: {}, Events: {}, Categories: {}, RSVPs: {}, Reviews: {}",
                userRepository.count(), eventRepository.count(), categoryRepository.count(),
                rsvpRepository.count(), reviewRepository.count());
    }

    private void clearDatabase() {
        reviewVoteRepository.deleteAll();
        reviewRepository.deleteAll();
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

    // ---------- USERS ----------
    private List<User> createUsers() {
        List<User> users = new ArrayList<>();
        users.add(createUser("admin@example.com", "System Admin", Role.ADMIN, TrustLevel.TRUSTED_HOST, true));
        users.add(createUser("mod1@example.com", "Moderator One", Role.ADMIN, TrustLevel.TRUSTED_HOST, true));
        users.add(createUser("mod2@example.com", "Moderator Two", Role.ADMIN, TrustLevel.TRUSTED_HOST, true));

        for (int i = 0; i < 5; i++) {
            String name = USER_NAMES.get(i);
            users.add(createUser(name.toLowerCase().replace(" ", ".") + "@example.com",
                    name, Role.STUDENT, TrustLevel.TRUSTED_HOST, true));
        }

        for (int i = 5; i < 15; i++) {
            String name = USER_NAMES.get(i);
            users.add(createUser(name.toLowerCase().replace(" ", ".") + "@example.com",
                    name, Role.STUDENT, TrustLevel.NEW, random.nextBoolean()));
        }

        users.add(createUser("flagged@example.com", "Flagged User", Role.STUDENT, TrustLevel.FLAGGED, true));
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

    // ---------- EVENTS ----------
    private List<Event> createEvents(List<User> users) {
        List<Event> events = new ArrayList<>();
        Instant now = Instant.now();

        List<User> hosts = users.stream()
                .filter(u -> u.getTrustLevel() != TrustLevel.FLAGGED && !u.getRole().equals(Role.ADMIN))
                .limit(12)
                .collect(Collectors.toList());

        // 15 future PUBLISHED
        for (int i = 0; i < 15; i++) {
            User host = hosts.get(random.nextInt(hosts.size()));
            Instant start = now.plus(random.nextInt(30) + 1, ChronoUnit.DAYS)
                               .plus(random.nextInt(12), ChronoUnit.HOURS);
            events.add(createEvent(
                    EVENT_TITLES.get(random.nextInt(EVENT_TITLES.size())),
                    start,
                    host,
                    EventStatus.PUBLISHED,
                    null
            ));
        }

        // 5 past events – published (not COMPLETED)
        for (int i = 0; i < 5; i++) {
            User host = hosts.get(random.nextInt(hosts.size()));
            Instant start = now.minus(random.nextInt(15) + 1, ChronoUnit.DAYS)
                               .minus(random.nextInt(12), ChronoUnit.HOURS);
            events.add(createEvent(
                    EVENT_TITLES.get(random.nextInt(EVENT_TITLES.size())) + " (Archived)",
                    start,
                    host,
                    EventStatus.PUBLISHED,
                    null
            ));
        }

        // 7 UNDER_REVIEW (was DRAFT + REVIEW)
        for (int i = 0; i < 7; i++) {
            User host = hosts.get(random.nextInt(hosts.size()));
            Instant start = now.plus(random.nextInt(20) + 1, ChronoUnit.DAYS);
            events.add(createEvent(
                    (i < 4 ? "Draft: " : "Review: ") + EVENT_TITLES.get(random.nextInt(EVENT_TITLES.size())),
                    start,
                    host,
                    EventStatus.UNDER_REVIEW,
                    null
            ));
        }

        // 3 CANCELLED
        for (int i = 0; i < 3; i++) {
            User host = hosts.get(random.nextInt(hosts.size()));
            Instant start = now.plus(random.nextInt(15) + 1, ChronoUnit.DAYS);
            String reason = "Cancelled due to " + (random.nextBoolean() ? "weather" : "low enrollment");
            events.add(createEvent(
                    "CANCELLED: " + EVENT_TITLES.get(random.nextInt(EVENT_TITLES.size())),
                    start,
                    host,
                    EventStatus.CANCELLED,
                    reason
            ));
        }

        return events;
    }

    private Event createEvent(String title, Instant startTime, User host, EventStatus status, String cancellationReason) {
        int capacity = 20 + random.nextInt(80);
        int rsvpCount = (status == EventStatus.PUBLISHED)
                ? random.nextInt(capacity / 2)
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

    // ---------- RSVPS ----------
    private void createRsvps(List<User> users, List<Event> events) {
        List<User> activeUsers = users.stream()
                .filter(u -> u.getTrustLevel() != TrustLevel.FLAGGED)
                .collect(Collectors.toList());

        for (Event event : events) {
            if (event.getStatus() != EventStatus.PUBLISHED) {
                continue;
            }

            int numRsvps = random.nextInt(Math.min(event.getMaxCapacity() / 2, 20)) + 1;
            List<User> shuffledUsers = new ArrayList<>(activeUsers);
            Collections.shuffle(shuffledUsers, random);

            int created = 0;
            for (User user : shuffledUsers) {
                if (created >= numRsvps) break;
                if (user.equals(event.getHost())) continue;

                double r = random.nextDouble();
                RsvpStatus status = r < 0.7 ? RsvpStatus.GOING
                        : (r < 0.85 ? RsvpStatus.WAITLISTED : RsvpStatus.CANCELLED);

                rsvpRepository.save(Rsvp.builder()
                        .user(user)
                        .event(event)
                        .status(status)
                        .cancellationReason(status == RsvpStatus.CANCELLED ? "Changed my mind" : null)
                        .build());
                created++;
            }
        }
    }

    // ---------- REVIEWS ----------
    private void createReviews(List<User> users, List<Event> events) {
        List<Event> pastEvents = events.stream()
                .filter(e -> e.getStatus() == EventStatus.PUBLISHED && e.getStartTime().isBefore(Instant.now()))
                .collect(Collectors.toList());

        for (Event event : pastEvents) {
            List<User> reviewers = users.stream()
                    .filter(u -> !u.equals(event.getHost()) && u.getTrustLevel() != TrustLevel.FLAGGED)
                    .limit(3 + random.nextInt(5))
                    .collect(Collectors.toList());

            for (User reviewer : reviewers) {
                int rating = random.nextInt(5) + 1;
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
                "https://picsum.photos/seed/4/800/600"
        );

        for (Event event : events.stream().limit(15).collect(Collectors.toList())) {
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

// ---------- USER PREFERENCES (FIXED) ----------
    private void createUserPreference(User user) {
        // Only set the User entity. @MapsId will automatically derive and set the ID.
        UserPreference preference = UserPreference.builder()
                .user(user)             // set the relationship
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