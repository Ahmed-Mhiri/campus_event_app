package de.fhdortmund.mystudyapp.identity.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import de.fhdortmund.mystudyapp.common.exception.ForbiddenActionException;
import de.fhdortmund.mystudyapp.common.exception.ResourceNotFoundException;
import de.fhdortmund.mystudyapp.events.repository.EventRepository;
import de.fhdortmund.mystudyapp.identity.dto.TrustQualificationStatus;
import de.fhdortmund.mystudyapp.identity.model.TrustLevel;
import de.fhdortmund.mystudyapp.identity.model.User;
import de.fhdortmund.mystudyapp.identity.repository.UserRepository;
import de.fhdortmund.mystudyapp.moderation.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrustLevelService {

    private static final int MIN_HOSTED_EVENTS = 3;
    private static final double MIN_AVERAGE_RATING = 4.0;

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final ReviewRepository reviewRepository;

    /* ============================================================
       ADMIN / MANUAL TRUST MANAGEMENT
       ============================================================ */

    @Transactional
    public void updateTrustLevel(UUID userId, TrustLevel newLevel) {
        User user = getUserOrThrow(userId);

        TrustLevel oldLevel = user.getTrustLevel();
        user.setTrustLevel(newLevel);
        userRepository.save(user);

        log.info("Trust level updated for user {}: {} -> {}", userId, oldLevel, newLevel);
    }

    @Transactional
    public void flagUser(UUID userId) {
        updateTrustLevel(userId, TrustLevel.FLAGGED);
        log.warn("User {} has been flagged", userId);
    }

    /**
     * Manual promotion by an admin. Bypasses qualification checks.
     */
    @Transactional
    public void forcePromoteToTrustedHost(UUID userId) {
        User user = getUserOrThrow(userId);

        if (user.getTrustLevel() == TrustLevel.TRUSTED_HOST) {
            log.info("User {} is already a TRUSTED_HOST", userId);
            return;
        }

        user.setTrustLevel(TrustLevel.TRUSTED_HOST);
        userRepository.save(user);
        log.info("User {} manually promoted to TRUSTED_HOST", userId);
    }

    /**
     * Auto-promotion with guardrails. Only promotes NEW users who meet the criteria.
     * Criteria: Hosted 3+ COMPLETED events that have reviews AND average rating ≥ 4.0
     */
    @Transactional
    public void promoteToTrustedHost(UUID userId) {
        User user = getUserOrThrow(userId);

        if (user.getTrustLevel() != TrustLevel.NEW) {
            log.info("User {} already has trust level {}, skipping auto-promotion",
                    userId, user.getTrustLevel());
            return;
        }

        if (!qualifiesForTrustedHost(userId)) {
            throw new ForbiddenActionException("Auto-promotion",
                    String.format("User does not meet the criteria (%d completed events with reviews and avg rating >= %.1f)",
                            MIN_HOSTED_EVENTS, MIN_AVERAGE_RATING));
        }

        user.setTrustLevel(TrustLevel.TRUSTED_HOST);
        userRepository.save(user);
        log.info("User {} auto-promoted to TRUSTED_HOST", userId);
    }

    /* ============================================================
       QUALIFICATION ENGINE
       ============================================================ */

    /**
     * Evaluates whether a user qualifies for TRUSTED_HOST.
     * Criteria:
     *   1. Hosted at least {@value #MIN_HOSTED_EVENTS} COMPLETED events that have reviews
     *   2. Average rating across all reviews for those events >= {@value #MIN_AVERAGE_RATING}
     * 
     * This prevents exploitation where users could create future events without attendees
     * to get auto-promoted. Events must be COMPLETED (actually happened) AND have reviews
     * (someone attended and rated them).
     */
    @Transactional(readOnly = true)
    public boolean qualifiesForTrustedHost(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }

        // Count COMPLETED events that have at least one review
        Long hostedCount = eventRepository.countCompletedReviewedEventsByHostId(userId);
        long eventCount = (hostedCount != null) ? hostedCount : 0L;

        if (eventCount < MIN_HOSTED_EVENTS) {
            log.debug("User {} does not qualify: {} completed events with reviews (min required: {})",
                    userId, eventCount, MIN_HOSTED_EVENTS);
            return false;
        }

        // Calculate average rating across all reviews for COMPLETED events
        Double avgRating = reviewRepository.calculateAverageRatingByHostId(userId);
        double effectiveRating = (avgRating != null) ? avgRating : 0.0;

        boolean qualifies = effectiveRating >= MIN_AVERAGE_RATING;

        log.debug("User {} trust evaluation: {} completed events with reviews, avg rating {} -> qualifies: {}",
                userId, eventCount, effectiveRating, qualifies);

        return qualifies;
    }

    /**
     * Get detailed qualification status for debugging/UI display
     */
    @Transactional(readOnly = true)
    public TrustQualificationStatus getQualificationStatus(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }

        Long completedReviewedCount = eventRepository.countCompletedReviewedEventsByHostId(userId);
        long eventCount = (completedReviewedCount != null) ? completedReviewedCount : 0L;
        
        Double avgRating = reviewRepository.calculateAverageRatingByHostId(userId);
        double effectiveRating = (avgRating != null) ? avgRating : 0.0;
        
        return TrustQualificationStatus.builder()
                .completedEventsWithReviews(eventCount)
                .minimumEventsRequired(MIN_HOSTED_EVENTS)
                .averageRating(effectiveRating)
                .minimumRatingRequired(MIN_AVERAGE_RATING)
                .meetsEventCount(eventCount >= MIN_HOSTED_EVENTS)
                .meetsRatingThreshold(effectiveRating >= MIN_AVERAGE_RATING)
                .qualifies(eventCount >= MIN_HOSTED_EVENTS && effectiveRating >= MIN_AVERAGE_RATING)
                .build();
    }

    /* ============================================================
       PRIVATE HELPERS
       ============================================================ */

    private User getUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}